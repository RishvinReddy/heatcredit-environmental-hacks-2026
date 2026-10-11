/**
 * HeatCredit — Validation Tests
 *
 * Validates the boundary conditions and strict typing of incoming
 * assessment data to prevent propagation of invalid data to scoring.
 */

import { validateAssessmentInput } from "../../backend/lib/validation/validation";

// ---------------------------------------------------------------------------
// Minimal test framework
// ---------------------------------------------------------------------------

let passed = 0;
let failed = 0;

function assert(description: string, condition: boolean): void {
  if (condition) {
    console.log(`  ✓ ${description}`);
    passed++;
  } else {
    console.error(`  ✗ FAIL: ${description}`);
    failed++;
  }
}

// ---------------------------------------------------------------------------
// Test inputs
// ---------------------------------------------------------------------------

const baseInput = {
  buildingType: "school",
  location: "Test Location",
  latitude: 0,
  longitude: 0,
  occupancy: 100,
  operatingHours: 8,
  roofType: "concrete",
  roofCondition: "fair",
  shadeCoverage: 50,
  greenCoverage: 50,
  ventilation: "medium",
  waterAccess: "adequate",
  reliefSpace: "limited",
};

// ---------------------------------------------------------------------------
// Run tests
// ---------------------------------------------------------------------------

console.log("\n====================================");
console.log("  HeatCredit — Validation Tests");
console.log("====================================\n");

console.log("Valid Inputs:");
assert("Fully populated valid input passes", validateAssessmentInput(baseInput).valid);

// Provide minimal fields? All fields in BuildingInput are technically required
assert("Missing required fields fail (e.g. shadeCoverage)", validateAssessmentInput({ ...baseInput, shadeCoverage: undefined }).valid === false);

console.log("\nType checking (NaN, null, string, bool, infinity):");
assert("NaN where number expected fails", validateAssessmentInput({ ...baseInput, occupancy: NaN }).valid === false);
assert("Infinity where number expected fails", validateAssessmentInput({ ...baseInput, occupancy: Infinity }).valid === false);
assert("String where number expected fails", validateAssessmentInput({ ...baseInput, occupancy: "100" }).valid === false);
assert("Null where number expected fails", validateAssessmentInput({ ...baseInput, occupancy: null }).valid === false);
assert("Boolean where number expected fails", validateAssessmentInput({ ...baseInput, occupancy: true }).valid === false);

console.log("\nBoundary limits:");
assert("Minimum valid occupancy (1)", validateAssessmentInput({ ...baseInput, occupancy: 1 }).valid);
assert("Maximum valid occupancy (100000)", validateAssessmentInput({ ...baseInput, occupancy: 100000 }).valid);
assert("Below minimum occupancy (0) fails", validateAssessmentInput({ ...baseInput, occupancy: 0 }).valid === false);
assert("Above maximum occupancy (100001) fails", validateAssessmentInput({ ...baseInput, occupancy: 100001 }).valid === false);

assert("Minimum valid hours (1)", validateAssessmentInput({ ...baseInput, operatingHours: 1 }).valid);
assert("Maximum valid hours (24)", validateAssessmentInput({ ...baseInput, operatingHours: 24 }).valid);
assert("Below minimum hours (0) fails", validateAssessmentInput({ ...baseInput, operatingHours: 0 }).valid === false);
assert("Above maximum hours (25) fails", validateAssessmentInput({ ...baseInput, operatingHours: 25 }).valid === false);

assert("Minimum valid shadeCoverage (0)", validateAssessmentInput({ ...baseInput, shadeCoverage: 0 }).valid);
assert("Maximum valid shadeCoverage (100)", validateAssessmentInput({ ...baseInput, shadeCoverage: 100 }).valid);
assert("Below minimum shadeCoverage (-1) fails", validateAssessmentInput({ ...baseInput, shadeCoverage: -1 }).valid === false);
assert("Above maximum shadeCoverage (101) fails", validateAssessmentInput({ ...baseInput, shadeCoverage: 101 }).valid === false);

assert("Minimum valid greenCoverage (0)", validateAssessmentInput({ ...baseInput, greenCoverage: 0 }).valid);
assert("Maximum valid greenCoverage (100)", validateAssessmentInput({ ...baseInput, greenCoverage: 100 }).valid);
assert("Below minimum greenCoverage (-1) fails", validateAssessmentInput({ ...baseInput, greenCoverage: -1 }).valid === false);
assert("Above maximum greenCoverage (101) fails", validateAssessmentInput({ ...baseInput, greenCoverage: 101 }).valid === false);

// Empty validation
assert("Empty object fails", validateAssessmentInput({}).valid === false);
assert("Null body fails", validateAssessmentInput(null).valid === false);

console.log("\nEvidence Validation:");
assert("Input without evidence block passes (backward compatibility)", validateAssessmentInput(baseInput).valid);
assert("Input with valid evidence block passes", validateAssessmentInput({
  ...baseInput,
  evidence: {
    roofType: {
      field: "roofType",
      sourceCategory: "measured",
      timestamp: "2026-10-09T12:00:00Z",
      verificationStatus: "verified"
    }
  }
}).valid);
assert("Input with invalid evidence block fails (non-ISO timestamp)", validateAssessmentInput({
  ...baseInput,
  evidence: {
    roofType: {
      field: "roofType",
      sourceCategory: "measured",
      timestamp: "10/09/2026 12:00 PM",
      verificationStatus: "verified"
    }
  }
}).valid === false);
assert("Input with invalid evidence block fails (unknown status)", validateAssessmentInput({
  ...baseInput,
  evidence: {
    roofType: {
      field: "roofType",
      sourceCategory: "measured",
      timestamp: "2026-10-09T12:00:00Z",
      verificationStatus: "trusted"
    }
  }
}).valid === false);
assert("Input with valid evidence block passes for sensitive field", validateAssessmentInput({
  ...baseInput,
  evidence: {
    roofType: {
      field: "roofType",
      sourceCategory: "measured",
      timestamp: "2026-10-09T12:00:00Z",
      verificationStatus: "verified"
    }
  }
}).valid);
assert("Input with unsupported evidence key fails", validateAssessmentInput({
  ...baseInput,
  evidence: {
    buildingType: {
      field: "buildingType",
      sourceCategory: "measured",
      timestamp: "2026-10-09T12:00:00Z",
      verificationStatus: "verified"
    }
  }
}).valid === false);

console.log("\nSummary:");
const total = passed + failed;
console.log(`  ${passed} / ${total} tests passed`);

if (failed > 0) {
  console.error(`\n  ${failed} test(s) FAILED.\n`);
  process.exit(1);
} else {
  console.log("\n  All validation tests passed.\n");
}
