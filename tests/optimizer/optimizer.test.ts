/**
 * HeatCredit — Optimizer Tests
 *
 * Validates budget optimization across boundary conditions
 * and the canonical demo scenario.
 *
 * Run with: npx ts-node --esm tests/optimizer/optimizer.test.ts
 */

import { optimize } from "../../backend/lib/optimizer/optimizer";
import type { Intervention, OptimizationInput } from "../../backend/lib/optimizer/optimizer";

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

function assertEqual(description: string, actual: unknown, expected: unknown): void {
  assert(
    `${description} (got ${JSON.stringify(actual)}, expected ${JSON.stringify(expected)})`,
    actual === expected
  );
}

// ---------------------------------------------------------------------------
// Test intervention catalogue (matching interventions.json)
// ---------------------------------------------------------------------------

const INTERVENTIONS: Intervention[] = [
  { id: "shade",       name: "Shade Structure",          category: "shade",       estimatedCost: 25000, impact: 11, targetDimension: "shade",       description: "" },
  { id: "water",       name: "Drinking Water Station",   category: "water",       estimatedCost: 8000,  impact: 6,  targetDimension: "waterAccess",  description: "" },
  { id: "ventilation", name: "Ventilation Improvement",  category: "ventilation", estimatedCost: 15000, impact: 8,  targetDimension: "ventilation",  description: "" },
  { id: "green",       name: "Green Coverage",           category: "green",       estimatedCost: 20000, impact: 7,  targetDimension: "greenCoverage",description: "" },
  { id: "roof",        name: "Reflective Roof Treatment",category: "thermal",     estimatedCost: 18000, impact: 9,  targetDimension: "roofCondition",description: "" },
  { id: "relief",      name: "Heat Relief Room",         category: "relief",      estimatedCost: 50000, impact: 14, targetDimension: "reliefSpace",  description: "" },
];

const BASE_INPUT: Omit<OptimizationInput, "budget"> = {
  assessmentId: "test-001",
  currentScore: 42,   // Actual score for Green Valley School, Hyderabad
  interventions: INTERVENTIONS,
};

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

console.log("\n=======================================");
console.log("  HeatCredit — Optimizer Engine Tests");
console.log("=======================================\n");

// --- Budget = 0 ---
console.log("Budget edge cases:");

const zeroBudget = optimize({ ...BASE_INPUT, budget: 0 });
assertEqual("Budget = 0 → not feasible", zeroBudget.feasible, false);
assertEqual("Budget = 0 → no interventions", zeroBudget.selectedInterventions.length, 0);
assertEqual("Budget = 0 → improvement = 0", zeroBudget.improvement, 0);
assertEqual("Budget = 0 → projectedScore = currentScore", zeroBudget.projectedScore, 42);

// --- Budget below cheapest (₹7,999) ---
const subMinBudget = optimize({ ...BASE_INPUT, budget: 7999 });
assertEqual("Budget < cheapest → not feasible", subMinBudget.feasible, false);
assertEqual("Budget < cheapest → 0 interventions", subMinBudget.selectedInterventions.length, 0);

// --- Budget = ₹8,000 (exact water cost) ---
console.log("\nSingle intervention cases:");
const waterOnlyBudget = optimize({ ...BASE_INPUT, budget: 8000 });
assertEqual("Budget = ₹8,000 → feasible", waterOnlyBudget.feasible, true);
assertEqual("Budget = ₹8,000 → selects water", waterOnlyBudget.selectedInterventions[0]?.id, "water");
assertEqual("Budget = ₹8,000 → total cost = 8000", waterOnlyBudget.totalCost, 8000);
assertEqual("Budget = ₹8,000 → improvement = 6", waterOnlyBudget.improvement, 6);

// --- Canonical demo: ₹50,000 ---
// Canonical end-to-end demo: Green Valley School, Hyderabad
// Actual score from scoring engine: 42 (High Risk)
// Budget: ₹50,000
// Expected optimal: shade + water + ventilation = ₹48,000, +25 impact
// Projected: 42 + 25 = 67 (Moderate)
console.log("\nCanonical demo (₹50,000 budget, score 42 → 67):");
const demo = optimize({ ...BASE_INPUT, budget: 50000 });
assertEqual("₹50,000 → feasible", demo.feasible, true);
assert("₹50,000 → total cost ≤ 50,000", demo.totalCost <= 50000);
assert("₹50,000 → projectedScore ≤ 100", demo.projectedScore <= 100);
assert("₹50,000 → projectedScore ≥ currentScore", demo.projectedScore >= 42);
assert("₹50,000 → at least 1 intervention", demo.selectedInterventions.length >= 1);

const demoIds = demo.selectedInterventions.map((i) => i.id).sort();
console.log(`  Selected: [${demoIds.join(", ")}]`);
console.log(`  Total cost: ₹${demo.totalCost.toLocaleString("en-IN")}`);
console.log(`  Impact: +${demo.improvement}`);
console.log(`  Score: ${demo.currentScore} → ${demo.projectedScore}`);

// The optimal package for ₹50,000 with this catalogue should be
// shade+water+ventilation (₹48,000, +25) — verify this
assert(
  "₹50,000 → optimal includes shade, water, ventilation (total +25, ₹48,000)",
  demoIds.includes("shade") &&
    demoIds.includes("water") &&
    demoIds.includes("ventilation") &&
    demo.totalCost === 48000 &&
    demo.improvement === 25
);
assertEqual("₹50,000 → projectedScore = 67 (42 + 25)", demo.projectedScore, 67);
assertEqual("₹50,000 → remainingBudget = 2000", demo.remainingBudget, 2000);

// --- Score capping ---
console.log("\nScore capping:");
const highScore = optimize({ ...BASE_INPUT, currentScore: 95, budget: 50000 });
assert("Score never exceeds 100", highScore.projectedScore <= 100);

const maxScore = optimize({ ...BASE_INPUT, currentScore: 100, budget: 50000 });
assert("Score at 100 stays at 100", maxScore.projectedScore === 100);

// Large budget
console.log("\nLarge budget:");
const bigBudget = optimize({ ...BASE_INPUT, budget: 200000 });
assertEqual("₹200,000 → all interventions selected", bigBudget.selectedInterventions.length, 6);
assert("₹200,000 → remaining budget ≥ 0", bigBudget.remainingBudget >= 0);

// --- Alternative packages provided ---
console.log("\nAlternative packages:");
assert("Alternatives are an array", Array.isArray(demo.alternativePackages));
assert("Alternatives have labels", demo.alternativePackages.every((p) => typeof p.label === "string"));

// --- Summary ---
console.log("\nSummary:");
const total = passed + failed;
console.log(`  ${passed} / ${total} tests passed`);

if (failed > 0) {
  console.error(`\n  ${failed} test(s) FAILED.\n`);
  process.exit(1);
} else {
  console.log("\n  All optimizer tests passed.\n");
}
