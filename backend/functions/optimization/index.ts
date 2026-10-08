/**
 * HeatCredit — POST /optimize Lambda
 *
 * Accepts an assessmentId + budget, loads the assessment score from DynamoDB,
 * runs the 0/1 knapsack optimizer, stores the recommendation, and returns it.
 */

import {
  APIGatewayProxyEvent,
  APIGatewayProxyResult,
  Context,
} from "aws-lambda";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, GetCommand, PutCommand } from "@aws-sdk/lib-dynamodb";
import { optimize } from "../../lib/optimizer/optimizer";
import { validateOptimizationInput } from "../../lib/validation/validation";
import type { Intervention } from "../../lib/optimizer/optimizer";

// ---------------------------------------------------------------------------
// Intervention catalogue — loaded once at Lambda init (cold start)
// ---------------------------------------------------------------------------

// In production this path resolves to the bundled JSON at /var/task/data/interventions.json
// The build step copies data/ into the Lambda zip.
import interventionsData from "../../../data/interventions.json";
const INTERVENTIONS: Intervention[] = interventionsData as Intervention[];

// ---------------------------------------------------------------------------
// DynamoDB client
// ---------------------------------------------------------------------------

const ddbClient = new DynamoDBClient({ region: process.env.AWS_REGION ?? "ap-south-1" });
const ddb = DynamoDBDocumentClient.from(ddbClient);

const ASSESSMENTS_TABLE     = process.env.ASSESSMENTS_TABLE     ?? "HeatCreditAssessments";
const RECOMMENDATIONS_TABLE = process.env.RECOMMENDATIONS_TABLE ?? "HeatCreditRecommendations";

// ---------------------------------------------------------------------------
// CORS headers
// ---------------------------------------------------------------------------

const CORS_HEADERS = {
  "Content-Type": "application/json",
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

// ---------------------------------------------------------------------------
// ID generator
// ---------------------------------------------------------------------------

function generateRecommendationId(): string {
  const ts = Date.now().toString(36).toUpperCase();
  const rand = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `REC-${ts}-${rand}`;
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
  const validation = validateOptimizationInput(body);
  if (!validation.valid) {
    return {
      statusCode: 400,
      headers: CORS_HEADERS,
      body: JSON.stringify({ error: "Validation failed.", details: validation.errors }),
    };
  }

  const { assessmentId, budget } = body as { assessmentId: string; budget: number };

  // Load assessment from DynamoDB
  let currentScore = 62; // Fallback for demo mode
  try {
    const { Item } = await ddb.send(
      new GetCommand({
        TableName: ASSESSMENTS_TABLE,
        Key: { assessmentId },
      })
    );

    if (!Item) {
      return {
        statusCode: 404,
        headers: CORS_HEADERS,
        body: JSON.stringify({ error: `Assessment ${assessmentId} not found.` }),
      };
    }

    currentScore = Item.score as number;
  } catch (err) {
    console.error("DynamoDB GetCommand failed:", err);
    return {
      statusCode: 503,
      headers: CORS_HEADERS,
      body: JSON.stringify({ error: "Assessment database temporarily unavailable. Please try again." }),
    };
  }

  // Run optimizer
  const result = optimize({
    assessmentId,
    currentScore,
    budget,
    interventions: INTERVENTIONS,
  });

  if (!result.feasible) {
    const cheapest = Math.min(...INTERVENTIONS.map((i) => i.estimatedCost));
    return {
      statusCode: 200,
      headers: CORS_HEADERS,
      body: JSON.stringify({
        assessmentId,
        currentScore,
        budget,
        feasible: false,
        message: `No intervention package is available within ₹${budget.toLocaleString("en-IN")}. Minimum budget required: ₹${cheapest.toLocaleString("en-IN")}.`,
        selectedInterventions: [],
        totalCost: 0,
        improvement: 0,
        projectedScore: currentScore,
        remainingBudget: budget,
        alternativePackages: [],
      }),
    };
  }

  // Persist recommendation
  const recommendationId = generateRecommendationId();
  const createdAt = new Date().toISOString();

  try {
    await ddb.send(
      new PutCommand({
        TableName: RECOMMENDATIONS_TABLE,
        Item: {
          recommendationId,
          assessmentId,
          budget,
          currentScore,
          selectedInterventions: result.selectedInterventions.map((i) => i.id),
          totalCost: result.totalCost,
          improvement: result.improvement,
          projectedScore: result.projectedScore,
          remainingBudget: result.remainingBudget,
          createdAt,
        },
      })
    );
  } catch (err) {
    console.error("DynamoDB PutCommand (recommendation) failed:", err);
    // Non-fatal — return result anyway
  }

  return {
    statusCode: 200,
    headers: CORS_HEADERS,
    body: JSON.stringify({
      recommendationId,
      assessmentId,
      currentScore: result.currentScore,
      budget: result.budget,
      feasible: result.feasible,
      selectedInterventions: result.selectedInterventions,
      totalCost: result.totalCost,
      totalImpact: result.totalImpact,
      improvement: result.improvement,
      projectedScore: result.projectedScore,
      remainingBudget: result.remainingBudget,
      alternativePackages: result.alternativePackages,
      createdAt,
    }),
  };
}
