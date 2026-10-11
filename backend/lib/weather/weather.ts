/**
 * HeatCredit — Shared weather fetch utility
 *
 * Used by both the /weather Lambda (HTTP response) and the /assessments Lambda
 * (weather snapshot at assessment creation time).
 *
 * Open-Meteo is CC BY 4.0 — https://open-meteo.com
 */

import fallbackWeather from "../../../data/weather-fallback.json";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface WeatherSnapshot {
  requestedLatitude: number;
  requestedLongitude: number;
  latitude: number;
  longitude: number;
  temperature: number;
  apparentTemperature: number;
  humidity: number;
  windSpeed: number;
  windSpeedUnit: string;
  observedAt: string;
  fetchedAt: string;
  source: string;
  isDemo: boolean;
  isStale: boolean;
  dataQuality: "live" | "stale" | "demo" | "unavailable";
  attribution: string;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function isFiniteNumber(val: unknown): val is number {
  return typeof val === "number" && isFinite(val);
}

// ---------------------------------------------------------------------------
// Live fetch from Open-Meteo
// ---------------------------------------------------------------------------

export async function fetchOpenMeteo(
  lat: number,
  lon: number,
  fetchFn: typeof fetch = fetch,
  nowFn: () => number = Date.now
): Promise<WeatherSnapshot | null> {
  if (!isFiniteNumber(lat) || lat < -90 || lat > 90) {
    throw new Error("Invalid latitude");
  }
  if (!isFiniteNumber(lon) || lon < -180 || lon > 180) {
    throw new Error("Invalid longitude");
  }

  const url = new URL("https://api.open-meteo.com/v1/forecast");
  url.searchParams.set("latitude", lat.toString());
  url.searchParams.set("longitude", lon.toString());
  url.searchParams.set("current", [
    "temperature_2m",
    "apparent_temperature",
    "relative_humidity_2m",
    "wind_speed_10m",
  ].join(","));
  url.searchParams.set("timezone", "auto");
  url.searchParams.set("forecast_days", "1");

  try {
    const res = await fetchFn(url.toString(), {
      signal: AbortSignal.timeout(5000),
    });
    if (!res.ok) {
      console.warn(`Open-Meteo returned ${res.status}`);
      return null;
    }
    const data = await res.json() as Record<string, unknown>;
    const current = data.current as Record<string, unknown>;
    if (!current) return null;

    const currentUnits = data.current_units as Record<string, unknown>;

    // Validate finite numbers
    const temp = current["temperature_2m"];
    const appTemp = current["apparent_temperature"];
    const humidity = current["relative_humidity_2m"];
    const windSpeed = current["wind_speed_10m"];

    if (!isFiniteNumber(temp) || !isFiniteNumber(appTemp) || !isFiniteNumber(humidity) || !isFiniteNumber(windSpeed)) {
      console.warn("Open-Meteo returned invalid metric values");
      return null;
    }

    if (currentUnits && currentUnits["wind_speed_10m"] !== "km/h") {
      console.warn("Open-Meteo wind speed units unexpectedly not km/h");
      return null;
    }

    const observedAtStr = current["time"] as string;
    if (!observedAtStr) return null;

    const observedAt = new Date(observedAtStr).getTime();
    if (isNaN(observedAt)) return null;

    const now = nowFn();
    const ageMs = now - observedAt;
    const MAX_AGE_MS = 6 * 60 * 60 * 1000; // 6 hours

    // Future tolerance (e.g. slight clock skew)
    if (ageMs < -5 * 60 * 1000) {
      console.warn("Open-Meteo returned future timestamp");
      return null;
    }

    const isStale = ageMs > MAX_AGE_MS;
    if (isStale) {
      console.warn("Open-Meteo returned stale data");
      return null;
    }

    return {
      requestedLatitude: lat,
      requestedLongitude: lon,
      latitude: isFiniteNumber(data.latitude) ? data.latitude : lat,
      longitude: isFiniteNumber(data.longitude) ? data.longitude : lon,
      temperature: temp,
      apparentTemperature: appTemp,
      humidity: humidity,
      windSpeed: windSpeed,
      windSpeedUnit: "km/h",
      observedAt: new Date(observedAt).toISOString(),
      fetchedAt: new Date(now).toISOString(),
      source: "Open-Meteo (best available model)",
      isDemo: false,
      isStale: false,
      dataQuality: "live",
      attribution: "Weather data provided by Open-Meteo (CC BY 4.0) — https://open-meteo.com",
    };
  } catch (err) {
    console.warn("Open-Meteo fetch failed:", err);
    return null;
  }
}

// ---------------------------------------------------------------------------
// Fallback — returns nearest city or default demo snapshot
// ---------------------------------------------------------------------------

export function getFallbackWeather(lat: number, lon: number, nowFn: () => number = Date.now): WeatherSnapshot {
  const cities = (fallbackWeather as Record<string, any>);
  // Pick closest city by rough distance
  let best: any = cities["default"];
  let bestDist = Infinity;
  for (const [key, city] of Object.entries(cities)) {
    if (key === "default") continue;
    const dist = Math.abs((city.latitude || 0) - lat) + Math.abs((city.longitude || 0) - lon);
    if (dist < bestDist) {
      bestDist = dist;
      best = city;
    }
  }
  
  return {
    requestedLatitude: lat,
    requestedLongitude: lon,
    latitude: best.latitude || lat,
    longitude: best.longitude || lon,
    temperature: best.temperature || 35,
    apparentTemperature: best.apparentTemperature || 38,
    humidity: best.humidity || 50,
    windSpeed: best.windSpeed || 5,
    windSpeedUnit: "km/h",
    observedAt: new Date(nowFn()).toISOString(), // demo data generated now
    fetchedAt: new Date(nowFn()).toISOString(),
    source: "HeatCredit Demo Data",
    isDemo: true,
    isStale: false,
    dataQuality: "demo",
    attribution: "Demo Fallback Data",
  };
}

export function getUnavailableWeather(lat: number, lon: number, nowFn: () => number = Date.now): WeatherSnapshot {
  return {
    requestedLatitude: lat,
    requestedLongitude: lon,
    latitude: lat,
    longitude: lon,
    temperature: 0,
    apparentTemperature: 0,
    humidity: 0,
    windSpeed: 0,
    windSpeedUnit: "km/h",
    observedAt: new Date(nowFn()).toISOString(),
    fetchedAt: new Date(nowFn()).toISOString(),
    source: "Unavailable",
    isDemo: false,
    isStale: false,
    dataQuality: "unavailable",
    attribution: "Data Unavailable",
  };
}

// ---------------------------------------------------------------------------
// Unified fetch with explicit configuration
// ---------------------------------------------------------------------------

export async function getWeather(lat: number, lon: number): Promise<WeatherSnapshot> {
  const live = await fetchOpenMeteo(lat, lon);
  if (live) return live;

  if (process.env.WEATHER_ALLOW_DEMO_FALLBACK === "true") {
    console.warn("Falling back to demo weather data.");
    return getFallbackWeather(lat, lon);
  }

  console.warn("Weather unavailable and demo fallback disabled.");
  return getUnavailableWeather(lat, lon);
}
