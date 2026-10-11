# HeatCredit — Testing, Validation & Engineering Evidence

> **Total Automated Tests:** 141 / 141 Passing
> **Frontend Build Status:** Next.js 16.4.0 (16/16 routes compiled, 0 errors)
> **Test Frameworks:** Node.js built-in test runner, TypeScript (`ts-node`)

---

## 1. Test Suite Architecture

HeatCredit maintains six automated test suites covering computational kernels, external API adapters, schema validation, and evidence provenance rules:

| Suite Name | Command | Test File | Tests | Status | Scope |
|---|---|---|:---:|:---:|---|
| **Scoring Engine** | `npm run test:scoring` | `tests/scoring/scoring.test.ts` | **32** | ✅ Passed | 7 dimensions, weighting sum, clamping, boundary values, risk categorization. |
| **Budget Optimizer** | `npm run test:optimizer` | `tests/optimizer/optimizer.test.ts` | **24** | ✅ Passed | 0/1 knapsack, budget limits, ₹50k canonical demo, tie-breaking, alternatives. |
| **Weather Adapter** | `npm run test:weather` | `tests/weather/weather.test.ts` | **9** | ✅ Passed | Coordinate validation, provider HTTP 500/timeout handling, fallback labeling. |
| **Warnings Adapter** | `npm run test:warnings` | `tests/warnings/warnings.test.ts` | **21** | ✅ Passed | US NWS alert parsing, jurisdiction filtering, status contracts, timestamp validation. |
| **Evidence Validation** | `npm run test:evidence` | `tests/evidence/evidence.test.ts` | **24** | ✅ Passed | ISO-8601 parsing, confidence bounds, completeness metric calculation. |
| **Input Validation** | `npm run test:validation` | `tests/validation/validation.test.ts` | **31** | ✅ Passed | Numeric boundaries, NaN/null rejection, enum validation, payload structure. |
| **Total Automated** | `npm test` | *All Suites* | **141** | ✅ **141/141** | **100% Pass Rate** |

---

## 2. Reproducing Test Results

### 2.1 Prerequisites
- Node.js `v20.x` or `v24.x`
- npm `v10.x` or higher

### 2.2 Execution Commands

```bash
# Clone the repository
git clone https://github.com/RishvinReddy/heatcredit-environmental-hacks-2026.git
cd heatcredit-environmental-hacks-2026

# Install dependencies
npm ci

# Run the complete test suite (141 tests)
npm test
```

### 2.3 Individual Test Invocations

```bash
# 1. Test the deterministic scoring engine
npm run test:scoring

# 2. Test the 0/1 knapsack optimizer
npm run test:optimizer

# 3. Test weather telemetry and fallback
npm run test:weather

# 4. Test official warnings and jurisdiction checks
npm run test:warnings

# 5. Test evidence provenance and completeness
npm run test:evidence

# 6. Test API input schema validation
npm run test:validation
```

---

## 3. Verified Command Outputs (Evidence Log)

### 3.1 `npm run test:scoring` (32 / 32 Passed)
```
======================================
  HeatCredit — Scoring Engine Tests
======================================

Breakdown integrity:
  ✓ thermalProtection ∈ [0, 25] (got 16.3, expected 0–25)
  ✓ shade             ∈ [0, 15] (got 3.8, expected 0–15)
  ✓ ventilation       ∈ [0, 15] (got 9.0, expected 0–15)
  ✓ waterAccess       ∈ [0, 15] (got 4.5, expected 0–15)
  ✓ reliefCapacity    ∈ [0, 15] (got 4.5, expected 0–15)
  ✓ greenInfrastructure ∈ [0, 10] (got 1.5, expected 0–10)
  ✓ exposure          ∈ [0, 5] (got 2.1, expected 0–5)
  ✓ Sum of breakdown (41.7) ≈ score (42)

Summary:
  32 / 32 tests passed — All scoring tests passed.
```

### 3.2 `npm run test:optimizer` (24 / 24 Passed)
```
=======================================
  HeatCredit — Optimizer Engine Tests
=======================================

Canonical demo (₹50,000 budget, score 42 → 67):
  ✓ ₹50,000 → feasible (got true, expected true)
  ✓ ₹50,000 → total cost ≤ 50,000
  ✓ ₹50,000 → projectedScore ≤ 100
  Selected: [shade, ventilation, water]
  Total cost: ₹48,000
  Impact: +25
  Score: 42 → 67
  ✓ ₹50,000 → optimal includes shade, water, ventilation (total +25, ₹48,000)
  ✓ ₹50,000 → projectedScore = 67 (42 + 25) (got 67, expected 67)
  ✓ ₹50,000 → remainingBudget = 2000 (got 2000, expected 2000)

Summary:
  24 / 24 tests passed — All optimizer tests passed.
```

### 3.3 `npm run test:weather` (9 / 9 Passed)
```
✔ invalid coordinates are rejected
✔ valid payload preserves requested coordinates and units
✔ provider HTTP 500 returns null
✔ stale observation returns null
✔ future observation returns null
✔ missing fields returns null
✔ demo fallback explicitly labelled
✔ unavailable explicitly labelled
✔ demo fallback disabled defaults to unavailable on failure
ℹ tests 9, pass 9, fail 0
```

### 3.4 `npm run test:warnings` (21 / 21 Passed)
```
▶ Warnings Integration - NWS Adapter
  ✔ 1. Active official heat alert
  ✔ 2. No matching active heat alert
  ✔ 3. Unsupported jurisdiction
  ✔ 4. Provider HTTP 404 during point lookup
  ✔ 5. Provider HTTP 404 during alert retrieval
  ✔ 6. Provider HTTP 429
  ✔ 7. Provider HTTP 500
  ✔ 8. Network failure
  ✔ 9. Timeout
  ✔ 10. Malformed JSON
  ✔ 11. Invalid provider schema
  ✔ 12. Expired alert
  ✔ 13. Future-effective alert
  ✔ 14. Missing or malformed timestamp
  ✔ 15. Non-heat alert filtering
  ✔ 16. Official URL and attribution preservation
  ✔ 17. Invalid coordinates (latitude)
  ✔ 17b. Invalid coordinates (longitude)
  ✔ 18. Zero-valued coordinates
  ✔ 19. NWS missing metadata in points response
ℹ tests 21, pass 21, fail 0
```

### 3.5 `npm run test:evidence` (24 / 24 Passed)
```
▶ Evidence validation edge cases (18 tests passed)
▶ Evidence completeness logic (6 tests passed)
ℹ tests 24, pass 24, fail 0
```

### 3.6 `npm run test:validation` (31 / 31 Passed)
```
Boundary limits:
  ✓ Occupancy (1 to 100,000)
  ✓ Operating hours (1 to 24)
  ✓ Coverage percentages (0 to 100)
  ✓ Categorical enums
Summary:
  31 / 31 tests passed — All validation tests passed.
```

---

## 4. Frontend Production Build Verification

The Next.js frontend builds cleanly via Turbopack with 0 TypeScript or linting errors:

```bash
npm run build --prefix apps/web
```

Output:
```
▲ Next.js 16.4.0 (Turbopack)
✓ Compiled successfully in 3.0s
Finished TypeScript in 7.5s ...
✓ Generating static pages using 17 workers (16/16) in 4.8s
Route (app)
├ ○ /                      (Static)
├ ○ /architecture          (Static)
├ ○ /assessment            (Static)
├ ○ /intelligence          (Static)
├ ○ /interventions         (Static)
├ ○ /methodology           (Static)
├ ○ /optimizer             (Static)
├ ◐ /optimizer/[id]        (Partial Prerender)
├ ○ /overview              (Static)
├ ○ /report                (Static)
├ ◐ /report/[id]           (Partial Prerender)
├ ◐ /results/[id]          (Partial Prerender)
└ ○ /scenarios             (Static)
```

---

## 5. Status Separation Matrix

| Test Category | Executed & Passed | Executed & Failed | Unexecuted / Blocked |
|---|:---:|:---:|---|
| **Core Scoring Engine** | 32 | 0 | 0 |
| **0/1 Knapsack Optimizer** | 24 | 0 | 0 |
| **Weather Telemetry Adapter** | 9 | 0 | 0 |
| **Official Warnings Adapter** | 21 | 0 | 0 |
| **Evidence & Provenance** | 24 | 0 | 0 |
| **Input Schema Validation** | 31 | 0 | 0 |
| **Frontend Production Build** | 16/16 routes | 0 | 0 |
| **Live Deployed Cloud API** | N/A | 0 | Requires deployed API Gateway URL |
