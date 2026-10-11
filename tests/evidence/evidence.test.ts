import test from "node:test";
import assert from "node:assert";
import { validateEvidenceRecord, calculateEvidenceCompleteness } from "../../backend/lib/data-quality/building-evidence";

test("Evidence validation edge cases", async (t) => {
  await t.test("Valid evidence record", () => {
    const record = {
      field: "roofType",
      sourceCategory: "measured",
      timestamp: "2026-10-09T12:00:00Z",
      verificationStatus: "verified",
      sourceReference: "doc-123",
      confidence: 0.95
    };
    const { valid, errors } = validateEvidenceRecord("roofType", record);
    assert.strictEqual(valid, true, `Errors: ${errors.join(", ")}`);
  });

  await t.test("Missing provenance or unsupported categories", () => {
    const record = {
      field: "roofType",
      sourceCategory: "invalid_category",
      timestamp: "2026-10-09T12:00:00Z",
      verificationStatus: "verified"
    };
    const { valid } = validateEvidenceRecord("roofType", record);
    assert.strictEqual(valid, false);
  });

  await t.test("Invalid timestamp", () => {
    const record = {
      field: "roofType",
      sourceCategory: "measured",
      timestamp: "not-a-date",
      verificationStatus: "verified"
    };
    const { valid } = validateEvidenceRecord("roofType", record);
    assert.strictEqual(valid, false);
  });

  await t.test("Non-ISO8601 timestamp", () => {
    const record = {
      field: "roofType",
      sourceCategory: "measured",
      timestamp: "10/09/2026 12:00 PM", // valid for Date.parse but not ISO8601
      verificationStatus: "verified"
    };
    const { valid } = validateEvidenceRecord("roofType", record);
    assert.strictEqual(valid, false);
  });

  await t.test("Unknown verification status", () => {
    const record = {
      field: "roofType",
      sourceCategory: "measured",
      timestamp: "2026-10-09T12:00:00Z",
      verificationStatus: "trusted" // unknown status
    };
    const { valid } = validateEvidenceRecord("roofType", record);
    assert.strictEqual(valid, false);
  });

  await t.test("Invalid confidence value (out of bounds)", () => {
    const record = {
      field: "roofType",
      sourceCategory: "measured",
      timestamp: "2026-10-09T12:00:00Z",
      verificationStatus: "verified",
      confidence: 1.5
    };
    const { valid } = validateEvidenceRecord("roofType", record);
    assert.strictEqual(valid, false);
  });

  await t.test("Invalid confidence value (NaN)", () => {
    const record = {
      field: "roofType",
      sourceCategory: "measured",
      timestamp: "2026-10-09T12:00:00Z",
      verificationStatus: "verified",
      confidence: NaN
    };
    const { valid } = validateEvidenceRecord("roofType", record);
    assert.strictEqual(valid, false);
  });

  await t.test("Invalid confidence value (Infinity)", () => {
    const record = {
      field: "roofType",
      sourceCategory: "measured",
      timestamp: "2026-10-09T12:00:00Z",
      verificationStatus: "verified",
      confidence: Infinity
    };
    const { valid } = validateEvidenceRecord("roofType", record);
    assert.strictEqual(valid, false);
  });

  await t.test("Invalid confidence value (-Infinity)", () => {
    const record = {
      field: "roofType",
      sourceCategory: "measured",
      timestamp: "2026-10-09T12:00:00Z",
      verificationStatus: "verified",
      confidence: -Infinity
    };
    const { valid } = validateEvidenceRecord("roofType", record);
    assert.strictEqual(valid, false);
  });

  await t.test("Valid confidence values (0 and 1)", () => {
    const record1 = {
      field: "roofType",
      sourceCategory: "measured",
      timestamp: "2026-10-09T12:00:00Z",
      verificationStatus: "verified",
      confidence: 0
    };
    const record2 = { ...record1, confidence: 1 };
    assert.strictEqual(validateEvidenceRecord("roofType", record1).valid, true);
    assert.strictEqual(validateEvidenceRecord("roofType", record2).valid, true);
  });

  await t.test("Impossible calendar date", () => {
    const record = {
      field: "roofType",
      sourceCategory: "measured",
      timestamp: "2026-02-30T12:00:00Z",
      verificationStatus: "verified"
    };
    const { valid } = validateEvidenceRecord("roofType", record);
    assert.strictEqual(valid, false);
  });

  await t.test("Invalid timezone offset", () => {
    const record = {
      field: "roofType",
      sourceCategory: "measured",
      timestamp: "2026-10-09T12:00:00+25:00",
      verificationStatus: "verified"
    };
    const { valid } = validateEvidenceRecord("roofType", record);
    assert.strictEqual(valid, false);
  });

  await t.test("Valid non-UTC offset", () => {
    const record = {
      field: "roofType",
      sourceCategory: "measured",
      timestamp: "2026-10-09T12:00:00+02:30",
      verificationStatus: "verified",
      sourceReference: "doc-123"
    };
    const { valid } = validateEvidenceRecord("roofType", record);
    assert.strictEqual(valid, true);
  });

  await t.test("Evidence associated with wrong field", () => {
    const record = {
      field: "wrongField",
      sourceCategory: "measured",
      timestamp: "2026-10-09T12:00:00Z",
      verificationStatus: "verified"
    };
    const { valid } = validateEvidenceRecord("roofType", record);
    assert.strictEqual(valid, false);
  });

  await t.test("Estimated values not marked verified", () => {
    const record = {
      field: "roofType",
      sourceCategory: "user_estimated",
      timestamp: "2026-10-09T12:00:00Z",
      verificationStatus: "verified"
    };
    const { valid } = validateEvidenceRecord("roofType", record);
    assert.strictEqual(valid, false);
  });

  await t.test("Owner-reported without verifierMetadata not marked verified", () => {
    const record = {
      field: "roofType",
      sourceCategory: "owner_reported",
      timestamp: "2026-10-09T12:00:00Z",
      verificationStatus: "verified"
    };
    const { valid } = validateEvidenceRecord("roofType", record);
    assert.strictEqual(valid, false);
  });

  await t.test("Owner-reported with verifierMetadata can be marked verified", () => {
    const record = {
      field: "roofType",
      sourceCategory: "owner_reported",
      timestamp: "2026-10-09T12:00:00Z",
      verificationStatus: "verified",
      verifierMetadata: {
        verifiedBy: "Inspector John",
        verifiedAt: "2026-10-09T14:00:00Z",
        method: "On-site inspection"
      }
    };
    const { valid } = validateEvidenceRecord("roofType", record);
    assert.strictEqual(valid, true);
  });

  await t.test("Owner-reported with invalid verifierMetadata rejected", () => {
    const record = {
      field: "roofType",
      sourceCategory: "owner_reported",
      timestamp: "2026-10-09T12:00:00Z",
      verificationStatus: "verified",
      verifierMetadata: {
        verifiedBy: "",
        verifiedAt: "not-a-date",
        method: "On-site inspection"
      }
    };
    const { valid } = validateEvidenceRecord("roofType", record);
    assert.strictEqual(valid, false);
  });
});

test("Evidence completeness logic", async (t) => {
  await t.test("Completeness with fully populated evidence", () => {
    const evidence: any = {};
    const fields = ["occupancy", "operatingHours", "roofType", "roofCondition", "shadeCoverage", "greenCoverage", "ventilation", "waterAccess", "reliefSpace"];
    for (const field of fields) {
      evidence[field] = { verificationStatus: "verified" };
    }
    const res = calculateEvidenceCompleteness(evidence);
    assert.strictEqual(res.completenessScore, 100);
    assert.strictEqual(res.verifiedFields, fields.length);
    assert.strictEqual(res.isFullyVerified, true);
  });

  await t.test("Completeness with empty evidence", () => {
    const res = calculateEvidenceCompleteness({});
    assert.strictEqual(res.completenessScore, 0);
    assert.strictEqual(res.verifiedFields, 0);
    assert.strictEqual(res.isFullyVerified, false);
    assert.strictEqual(res.missingProvenanceFields.length, 9);
  });

  await t.test("Completeness with partial evidence", () => {
    const evidence: any = {
      occupancy: { verificationStatus: "verified" },
      roofType: { verificationStatus: "unverified" },
      shadeCoverage: { verificationStatus: "legacy_unverified" }
    };
    const res = calculateEvidenceCompleteness(evidence);
    // 1 verified (1), 1 unverified (0.5), 1 legacy (0) = 1.5 points / 9 = 16.66% -> 17
    assert.strictEqual(res.completenessScore, 17);
    assert.strictEqual(res.verifiedFields, 1);

    // There are 9 fields total. 3 are provided. 1 of the provided is legacy_unverified.
    // So missingProvenanceFields should have 6 missing + 1 legacy = 7 fields.
    assert.strictEqual(res.missingProvenanceFields.length, 7);
    assert.ok(res.missingProvenanceFields.includes("shadeCoverage"));
  });

  await t.test("Legacy records without evidence", () => {
    const res = calculateEvidenceCompleteness(null);
    assert.strictEqual(res.completenessScore, 0);
    assert.strictEqual(res.missingProvenanceFields.length, 9);
  });
});
