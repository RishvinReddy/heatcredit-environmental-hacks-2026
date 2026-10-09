/**
 * HeatCredit — GET /weather Lambda
 *
 * Thin HTTP wrapper around the shared weather lib.
 * Open-Meteo CC BY 4.0 — https://open-meteo.com
 */

import { APIGatewayProxyEvent, APIGatewayProxyResult, Context } from "aws-lambda";
import { getWeather } from "../../lib/weather/weather";

const CORS_HEADERS = {
  "Content-Type": "application/json",
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

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

  const weather = await getWeather(lat, lon);

  if (weather.dataQuality === "unavailable") {
    return {
      statusCode: 503,
      headers: CORS_HEADERS,
      body: JSON.stringify({ error: "Weather data currently unavailable." }),
    };
  }

  return {
    statusCode: 200,
    headers: {
      ...CORS_HEADERS,
      "Cache-Control": "max-age=0, no-cache, no-store, must-revalidate",
      ...(weather.dataQuality === "demo" ? { "X-Weather-Source": "fallback-demo" } : {}),
    },
    body: JSON.stringify(weather),
  };
}
