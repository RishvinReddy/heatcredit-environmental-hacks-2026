import test from "node:test";
import assert from "node:assert";
import { handler as assessmentHandler } from "../../backend/functions/assessment/index";
import { DynamoDBDocumentClient, PutCommand } from "@aws-sdk/lib-dynamodb";

test("Assessment Integration - Evidence Persistence", async (t) => {
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
      reliefSpace: "none",
      evidence: {
        roofType: {
          field: "roofType",
          sourceCategory: "measured",
          timestamp: "2026-10-09T12:00:00Z",
          verificationStatus: "verified"
        }
      }
    })
  };

  await t.test("DynamoDB PutCommand includes evidence and evidenceCompleteness", async (t) => {
    let capturedItem: any = null;
    let putCommandCalled = false;

    t.mock.method(DynamoDBDocumentClient.prototype, "send", async (command: any) => {
      if (command instanceof PutCommand) {
        putCommandCalled = true;
        if (command.input && command.input.Item) {
          capturedItem = command.input.Item;
        }
      }
      return {};
    });

    const res = await assessmentHandler(validEvent as any, {} as any);
    assert.strictEqual(res.statusCode, 201, `Handler failed: ${res.body}`);

    assert.ok(putCommandCalled, "DynamoDBDocumentClient.send must have been called with a PutCommand");
    assert.ok(capturedItem, "PutCommand should have been called with an Item");

    // Assert evidence is persisted
    assert.ok(capturedItem.evidence, "Persisted item must include evidence");
    assert.strictEqual(capturedItem.evidence.roofType.verificationStatus, "verified");

    // Assert evidenceCompleteness is persisted
    assert.ok(capturedItem.evidenceCompleteness, "Persisted item must include evidenceCompleteness");
    assert.strictEqual(typeof capturedItem.evidenceCompleteness.completenessScore, "number");
    assert.strictEqual(capturedItem.evidenceCompleteness.verifiedFields, 1);
  });
});
