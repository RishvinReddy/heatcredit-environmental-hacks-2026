/**
 * HeatCredit ΓÇö /assessments Lambda
 *
 * POST /assessments    ΓÇö Score a building, persist and return result.
 * GET  /assessments/:id ΓÇö Retrieve a previously scored assessment.
 */

import {
  APIGatewayProxyEvent,
  APIGatewayProxyResult,
  Context,
} from "aws-lambda";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, PutCommand, GetCommand } from "@aws-sdk/lib-dynamodb";
import { scoreBuilding } from "../../lib/scoring/scoring";
import { validateAssessmentInput } from "../../lib/validation/validation";
import { getWeather } from "../../lib/weather/weather";
import type { BuildingInput } from "../../lib/scoring/scoring";
import { calculateEvidenceCompleteness } from "../../lib/data-quality/building-evidence";
import type { EvidenceRecord } from "../../lib/data-quality/building-evidence";

// ---------------------------------------------------------------------------
// DynamoDB client (singleton ΓÇö reused across warm Lambda invocations)
// ---------------------------------------------------------------------------

const ddbClient = new DynamoDBClient({ region: process.env.AWS_REGION ?? "ap-south-1" });
const ddb = DynamoDBDocumentClient.from(ddbClient);

const ASSESSMENTS_TABLE = process.env.ASSESSMENTS_TABLE ?? "HeatCreditAssessments";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function generateAssessmentId(): string {
  const ts = Date.now().toString(36).toUpperCase();
  const rand = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `HC-${ts}-${rand}`;
}

// ---------------------------------------------------------------------------
// CORS headers
// ---------------------------------------------------------------------------

const CORS_HEADERS = {
  "Content-Type": "application/json",
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

// ---------------------------------------------------------------------------
// Handler
// ---------------------------------------------------------------------------

export async function handler(
  event: APIGatewayProxyEvent,
  _context: Context
): Promise<APIGatewayProxyResult> {
  // OPTIONS preflight
  if (event.httpMethod === "OPTIONS") {
    return { statusCode: 200, headers: CORS_HEADERS, body: "" };
  }

  // GET /assessments/:id ΓÇö retrieve a stored assessment
  if (event.httpMethod === "GET") {
    const assessmentId = event.pathParameters?.id;
    if (!assessmentId) {
      return {
        statusCode: 400,
        headers: CORS_HEADERS,
        body: JSON.stringify({ error: "assessmentId path parameter is required." }),
      };
    }
    try {
      const { Item } = await ddb.send(
        new GetCommand({ TableName: ASSESSMENTS_TABLE, Key: { assessmentId } })
      );
      if (!Item) {
        return {
          statusCode: 404,
          headers: CORS_HEADERS,
          body: JSON.stringify({ error: `Assessment ${assessmentId} not found.` }),
        };
      }
      return { statusCode: 200, headers: CORS_HEADERS, body: JSON.stringify(Item) };
    } catch (err) {
      console.error("DynamoDB GetCommand failed:", err);
      return {
        statusCode: 503,
        headers: CORS_HEADERS,
        body: JSON.stringify({ error: "Assessment database temporarily unavailable." }),
      };
    }
  }

  let body: unknown;
  try {
    body = JSON.parse(event.body ?? "{}");
  } catch {
    return {
      statusCode: 400,
      headers: CORS_HEADERS,
      body: JSON.stringify({ error: "Invalid JSON body." }),
    };
  }

  // Validate
  const validation = validateAssessmentInput(body);
  if (!validation.valid) {
    return {
      statusCode: 400,
      headers: CORS_HEADERS,
      body: JSON.stringify({ error: "Validation failed.", details: validation.errors }),
    };
  }

  const input = body as BuildingInput;
  const inputWithEv = body as { evidence?: Record<string, unknown> };

  const evidence = (inputWithEv.evidence as Record<string, EvidenceRecord>) ?? null;
  const evidenceCompleteness = calculateEvidenceCompleteness(evidence);

  // Score + fetch weather snapshot concurrently
  const [result, weatherSnapshot] = await Promise.all([
    Promise.resolve(scoreBuilding(input)),
    (input.latitude !== undefined && input.longitude !== undefined)
      ? getWeather(input.latitude, input.longitude)
      : Promise.resolve(null),
  ]);

  const assessmentId = generateAssessmentId();
  const createdAt = new Date().toISOString();

  const item = {
    assessmentId,
    createdAt,
    buildingType: input.buildingType,
    location: input.location,
    latitude: input.latitude,
    longitude: input.longitude,
    occupancy: input.occupancy,
    operatingHours: input.operatingHours,
    roofType: input.roofType,
    roofCondition: input.roofCondition,
    shadeCoverage: input.shadeCoverage,
    greenCoverage: input.greenCoverage,
    ventilation: input.ventilation,
    waterAccess: input.waterAccess,
    reliefSpace: input.reliefSpace,
    score: result.score,
    riskLevel: result.riskLevel,
    breakdown: result.breakdown,
    vulnerabilities: result.vulnerabilities,
    topVulnerability: result.topVulnerability,
    modelMetadata: result.modelMetadata,
    evidence,
    evidenceCompleteness,
    // Weather snapshot captured at assessment creation time
    weatherSnapshot: weatherSnapshot ?? null,
  };

  // Persist
  try {
    await ddb.send(
      new PutCommand({
        TableName: ASSESSMENTS_TABLE,
        Item: item,
      })
    );
  } catch (err) {
    console.error("DynamoDB PutCommand failed:", err);
    // Return the result even if persistence fails ΓÇö don't block the demo
    return {
      statusCode: 200,
      headers: { ...CORS_HEADERS, "X-Storage-Warning": "persistence-unavailable" },
      body: JSON.stringify({
        assessmentId,
        score: result.score,
        riskLevel: result.riskLevel,
        breakdown: result.breakdown,
        vulnerabilities: result.vulnerabilities,
        topVulnerability: result.topVulnerability,
        modelMetadata: result.modelMetadata,
        evidence,
        evidenceCompleteness,
        weatherSnapshot: weatherSnapshot ?? null,
        createdAt,
        warning: "Assessment scored but could not be persisted.",
      }),
    };
  }

  return {
    statusCode: 201,
    headers: CORS_HEADERS,
    body: JSON.stringify({
      assessmentId,
      score: result.score,
      riskLevel: result.riskLevel,
      breakdown: result.breakdown,
      vulnerabilities: result.vulnerabilities,
      topVulnerability: result.topVulnerability,
      modelMetadata: result.modelMetadata,
      evidence,
      evidenceCompleteness,
      weatherSnapshot: weatherSnapshot ?? null,
      createdAt,
    }),
  };
}
