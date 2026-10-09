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
  location: string;
  latitude: number;
  longitude: number;
  temperature: number;
  apparentTemperature: number;
  humidity: number;
  windSpeed: number;
  cloudCover: number;
  precipitation: number;
  weatherCode: number;
  isDemo: boolean;
  fetchedAt: string;
  attribution: string;
}

// ---------------------------------------------------------------------------
// Live fetch from Open-Meteo
// ---------------------------------------------------------------------------

export async function fetchOpenMeteo(lat: number, lon: number): Promise<WeatherSnapshot | null> {
  const url = new URL("https://api.open-meteo.com/v1/forecast");
  url.searchParams.set("latitude", lat.toString());
  url.searchParams.set("longitude", lon.toString());
  url.searchParams.set("current", [
    "temperature_2m",
    "apparent_temperature",
    "relative_humidity_2m",
    "wind_speed_10m",
    "cloud_cover",
    "precipitation",
    "weather_code",
  ].join(","));
  url.searchParams.set("timezone", "auto");
  url.searchParams.set("forecast_days", "1");

  try {
    const res = await fetch(url.toString(), {
      signal: AbortSignal.timeout(5000),
    });
    if (!res.ok) {
      console.warn(`Open-Meteo returned ${res.status}`);
      return null;
    }
    const data = await res.json() as Record<string, unknown>;
    const current = data.current as Record<string, unknown>;
    if (!current) return null;

    return {
      location: "Live",
      latitude: lat,
      longitude: lon,
      temperature: Math.round(current["temperature_2m"] as number),
      apparentTemperature: Math.round(current["apparent_temperature"] as number),
      humidity: Math.round(current["relative_humidity_2m"] as number),
      windSpeed: Math.round(current["wind_speed_10m"] as number),
      cloudCover: Math.round(current["cloud_cover"] as number),
      precipitation: current["precipitation"] as number,
      weatherCode: current["weather_code"] as number,
      isDemo: false,
      fetchedAt: new Date().toISOString(),
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

export function getFallbackWeather(lat: number, lon: number): WeatherSnapshot {
  const cities = (fallbackWeather as Record<string, WeatherSnapshot>);
  // Pick closest city by rough distance
  let best: WeatherSnapshot = cities["default"];
  let bestDist = Infinity;
  for (const [key, city] of Object.entries(cities)) {
    if (key === "default") continue;
    const dist = Math.abs(city.latitude - lat) + Math.abs(city.longitude - lon);
    if (dist < bestDist) {
      bestDist = dist;
      best = city;
    }
  }
  return { ...best, latitude: lat, longitude: lon };
}

// ---------------------------------------------------------------------------
// Unified fetch with fallback
// ---------------------------------------------------------------------------

export async function getWeather(lat: number, lon: number): Promise<{ weather: WeatherSnapshot; source: "live" | "fallback" }> {
  const live = await fetchOpenMeteo(lat, lon);
  if (live) return { weather: live, source: "live" };

  console.warn("Falling back to demo weather data.");
  return { weather: getFallbackWeather(lat, lon), source: "fallback" };
}
