import test from "node:test";
import assert from "node:assert";
import { handler as assessmentHandler } from "../../backend/functions/assessment/index";
import * as weather from "../../backend/lib/weather/weather";
import * as warnings from "../../backend/lib/warnings/warnings";
import { DynamoDBDocumentClient } from "@aws-sdk/lib-dynamodb";

test("Assessment Integration - Warnings", async (t) => {
  const validEvent = {
    httpMethod: "POST",
    body: JSON.stringify({
      location: "Demo",
      latitude: 30,
      longitude: -90,
      buildingType: "school",
      occupancy: 100,
      operatingHours: 8,
      roofType: "metal",
      roofCondition: "poor",
      shadeCoverage: 10,
      ventilation: "good",
      waterAccess: "adequate",
      coolingCapacity: 0,
      greenCoverage: 0,
      reliefSpace: "none"
    })
  };

  await t.test("1. Weather failure versus warning failure", async (t) => {
    t.mock.method(DynamoDBDocumentClient.prototype, "send", async () => ({}));
    t.mock.method(weather, "getWeather", async () => ({ status: "unavailable" }));
    t.mock.method(warnings, "getWarnings", async () => { throw new Error("Warning mock fail"); });

    const res = await assessmentHandler(validEvent as any, {} as any);
    assert.strictEqual(res.statusCode, 201, "Should return 201 despite warnings fetch throwing");

    const body = JSON.parse(res.body);
    assert.strictEqual(body.warningsSnapshot.status, "unavailable", "Should catch error and fallback to unavailable");
  });

  await t.test("2. Assessment score unchanged by warning status or availability", async (t) => {
    t.mock.method(DynamoDBDocumentClient.prototype, "send", async () => ({}));
    t.mock.method(weather, "getWeather", async () => ({ status: "unavailable" }));

    // Test with active warnings
    t.mock.method(warnings, "getWarnings", async () => ({ status: "active", alerts: [] }));
    const resActive = await assessmentHandler(validEvent as any, {} as any);
    const bodyActive = JSON.parse(resActive.body);

    // Test with none
    t.mock.method(warnings, "getWarnings", async () => ({ status: "none", alerts: [] }));
    const resNone = await assessmentHandler(validEvent as any, {} as any);
    const bodyNone = JSON.parse(resNone.body);

    assert.strictEqual(bodyActive.score, bodyNone.score, "Score should not change based on warning status");
    assert.strictEqual(bodyActive.warningsSnapshot.status, "active");
    assert.strictEqual(bodyNone.warningsSnapshot.status, "none");
  });
});
