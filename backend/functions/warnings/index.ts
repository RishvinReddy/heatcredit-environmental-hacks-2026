import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import { getWarnings } from "../../lib/warnings/warnings";

const CORS_HEADERS = {
  "Content-Type": "application/json",
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type"
};

export const handler = async (
  event: APIGatewayProxyEvent,
  context: any
): Promise<APIGatewayProxyResult> => {
  if (event.httpMethod === "OPTIONS") {
    return { statusCode: 200, headers: CORS_HEADERS, body: "" };
  }

  const query = event.queryStringParameters || {};
  const latStr = query.lat;
  const lonStr = query.lon;

  const errorHeaders = {
    ...CORS_HEADERS,
    "Cache-Control": "no-store",
  };

  if (!latStr || !lonStr) {
    return {
      statusCode: 400,
      headers: errorHeaders,
      body: JSON.stringify({ error: "lat and lon query parameters are required." })
    };
  }

  const lat = Number(latStr);
  const lon = Number(lonStr);

  if (isNaN(lat) || isNaN(lon) || lat < -90 || lat > 90 || lon < -180 || lon > 180 || latStr.trim() === "" || lonStr.trim() === "") {
    return {
      statusCode: 400,
      headers: errorHeaders,
      body: JSON.stringify({ error: "Invalid lat/lon values." })
    };
  }

  const result = await getWarnings(lat, lon);

  if (result.status === "unavailable") {
    return {
      statusCode: 503,
      headers: errorHeaders,
      body: JSON.stringify(result)
    };
  }

  const responseHeaders = {
    ...CORS_HEADERS,
    "Cache-Control": "public, max-age=300"
  };

  return {
    statusCode: 200,
    headers: responseHeaders,
    body: JSON.stringify(result)
  };
};
