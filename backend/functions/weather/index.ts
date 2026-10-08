/**
 * HeatCredit — GET /weather Lambda
 *
 * Fetches weather data from Open-Meteo for a given lat/lon.
 * Falls back to the local demo snapshot if the external API is unavailable.
 *
 * Open-Meteo is CC BY 4.0. Attribution is included in all responses.
 * https://open-meteo.com
 */

import {
  APIGatewayProxyEvent,
  APIGatewayProxyResult,
  Context,
} from "aws-lambda";
import fallbackWeather from "../../../data/weather-fallback.json";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface WeatherResponse {
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
// CORS headers
// ---------------------------------------------------------------------------

const CORS_HEADERS = {
  "Content-Type": "application/json",
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

// ---------------------------------------------------------------------------
// Open-Meteo fetch
// ---------------------------------------------------------------------------

async function fetchOpenMeteo(lat: number, lon: number): Promise<WeatherResponse | null> {
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
      signal: AbortSignal.timeout(5000), // 5-second timeout
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
// Handler
// ---------------------------------------------------------------------------

export async function handler(
  event: APIGatewayProxyEvent,
  _context: Context
): Promise<APIGatewayProxyResult> {
  if (event.httpMethod === "OPTIONS") {
    return { statusCode: 200, headers: CORS_HEADERS, body: "" };
  }

  const params = event.queryStringParameters ?? {};
  const latStr = params["lat"];
  const lonStr = params["lon"];

  if (!latStr || !lonStr) {
    return {
      statusCode: 400,
      headers: CORS_HEADERS,
      body: JSON.stringify({ error: "lat and lon query parameters are required." }),
    };
  }

  const lat = parseFloat(latStr);
  const lon = parseFloat(lonStr);

  if (isNaN(lat) || isNaN(lon) || lat < -90 || lat > 90 || lon < -180 || lon > 180) {
    return {
      statusCode: 400,
      headers: CORS_HEADERS,
      body: JSON.stringify({ error: "Invalid lat/lon values." }),
    };
  }

  // Attempt live fetch
  const live = await fetchOpenMeteo(lat, lon);
  if (live) {
    return {
      statusCode: 200,
      headers: CORS_HEADERS,
      body: JSON.stringify(live),
    };
  }

  // Fallback to demo data
  console.warn("Falling back to demo weather data.");
  const fallback = (fallbackWeather as Record<string, WeatherResponse>)["default"];

  return {
    statusCode: 200,
    headers: {
      ...CORS_HEADERS,
      "X-Weather-Source": "fallback-demo",
    },
    body: JSON.stringify({
      ...fallback,
      latitude: lat,
      longitude: lon,
    }),
  };
}
