/**
 * HeatCredit — GET /health Lambda
 */

import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";

export async function handler(_event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> {
  return {
    statusCode: 200,
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*",
    },
    body: JSON.stringify({
      status: "ok",
      service: "heatcredit-api",
      timestamp: new Date().toISOString(),
      version: "1.0.0",
    }),
  };
}
