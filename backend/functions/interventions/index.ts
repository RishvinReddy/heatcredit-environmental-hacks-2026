/**
 * HeatCredit — GET /interventions Lambda
 *
 * Returns the full intervention catalogue.
 * Loaded from the bundled JSON at Lambda init time (no DB query needed).
 */

import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import interventionsData from "../../../data/interventions.json";

const CORS_HEADERS = {
  "Content-Type": "application/json",
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

export async function handler(event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> {
  if (event.httpMethod === "OPTIONS") {
    return { statusCode: 200, headers: CORS_HEADERS, body: "" };
  }

  return {
    statusCode: 200,
    headers: {
      ...CORS_HEADERS,
      "Cache-Control": "public, max-age=3600"
    },
    body: JSON.stringify({
      interventions: interventionsData,
      count: interventionsData.length,
      currency: "INR",
      disclaimer:
        "Costs and impact values are prototype planning estimates. They do not represent universal real-world construction costs or scientifically certified resilience improvements.",
    }),
  };
}
