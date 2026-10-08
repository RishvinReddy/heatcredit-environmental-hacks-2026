#!/usr/bin/env bash
# HeatCredit — Local API test runner
# Tests all endpoints against a running API (local or deployed)
#
# Usage:
#   ./tests/api/test-api.sh                          # local (sam local start-api)
#   ./tests/api/test-api.sh https://your.api.url/prod  # deployed

set -euo pipefail

BASE_URL="${1:-http://localhost:3001}"
PASS=0
FAIL=0
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

pass() { echo -e "  ${GREEN}✓${NC} $1"; ((PASS++)); }
fail() { echo -e "  ${RED}✗ FAIL${NC}: $1"; ((FAIL++)); }
header() { echo -e "\n${YELLOW}$1${NC}"; }

check_status() {
  local desc="$1"
  local expected="$2"
  local actual="$3"
  if [ "$actual" = "$expected" ]; then
    pass "$desc (HTTP $actual)"
  else
    fail "$desc — expected HTTP $expected, got $actual"
  fi
}

echo "============================================"
echo "  HeatCredit — API Integration Tests"
echo "  Target: $BASE_URL"
echo "============================================"

# -------------------------------------------------------------------------
# 1. Health check
# -------------------------------------------------------------------------
header "GET /health"
RESP=$(curl -s -o /tmp/hc_body.json -w "%{http_code}" "$BASE_URL/health")
check_status "GET /health returns 200" "200" "$RESP"
STATUS=$(jq -r '.status' /tmp/hc_body.json 2>/dev/null || echo "parse_error")
if [ "$STATUS" = "ok" ]; then
  pass "Response body contains status: ok"
else
  fail "Expected status=ok, got: $STATUS"
fi

# -------------------------------------------------------------------------
# 2. Interventions catalogue
# -------------------------------------------------------------------------
header "GET /interventions"
RESP=$(curl -s -o /tmp/hc_body.json -w "%{http_code}" "$BASE_URL/interventions")
check_status "GET /interventions returns 200" "200" "$RESP"
COUNT=$(jq '.count' /tmp/hc_body.json 2>/dev/null || echo "0")
if [ "$COUNT" = "6" ]; then
  pass "Returns 6 interventions"
else
  fail "Expected 6 interventions, got: $COUNT"
fi

# -------------------------------------------------------------------------
# 3. Weather — Hyderabad
# -------------------------------------------------------------------------
header "GET /weather?lat=17.385&lon=78.4867"
RESP=$(curl -s -o /tmp/hc_body.json -w "%{http_code}" \
  "$BASE_URL/weather?lat=17.385&lon=78.4867")
check_status "GET /weather returns 200" "200" "$RESP"
TEMP=$(jq '.temperature' /tmp/hc_body.json 2>/dev/null || echo "null")
if [ "$TEMP" != "null" ]; then
  pass "Response contains temperature field ($TEMP°C)"
else
  fail "Response missing temperature field"
fi

# -------------------------------------------------------------------------
# 4. Weather — missing params
# -------------------------------------------------------------------------
header "GET /weather — missing lat/lon"
RESP=$(curl -s -o /tmp/hc_body.json -w "%{http_code}" "$BASE_URL/weather")
check_status "GET /weather without params returns 400" "400" "$RESP"

# -------------------------------------------------------------------------
# 5. Assessment — canonical demo
# -------------------------------------------------------------------------
header "POST /assessments — Green Valley School"
RESP=$(curl -s -o /tmp/hc_assessment.json -w "%{http_code}" \
  -X POST \
  -H "Content-Type: application/json" \
  -d '{
    "buildingType": "school",
    "location": "Hyderabad",
    "latitude": 17.385,
    "longitude": 78.4867,
    "occupancy": 350,
    "operatingHours": 9,
    "roofType": "concrete",
    "roofCondition": "fair",
    "shadeCoverage": 25,
    "greenCoverage": 15,
    "ventilation": "medium",
    "waterAccess": "poor",
    "reliefSpace": "limited"
  }' \
  "$BASE_URL/assessments")
check_status "POST /assessments returns 201" "201" "$RESP"

ASSESSMENT_ID=$(jq -r '.assessmentId' /tmp/hc_assessment.json 2>/dev/null || echo "null")
SCORE=$(jq '.score' /tmp/hc_assessment.json 2>/dev/null || echo "null")
RISK=$(jq -r '.riskLevel' /tmp/hc_assessment.json 2>/dev/null || echo "null")

if [ "$ASSESSMENT_ID" != "null" ] && [[ "$ASSESSMENT_ID" == HC-* ]]; then
  pass "assessmentId is HC-prefixed: $ASSESSMENT_ID"
else
  fail "Expected HC-prefixed assessmentId, got: $ASSESSMENT_ID"
fi

if [ "$SCORE" -ge 25 ] && [ "$SCORE" -le 74 ] 2>/dev/null; then
  pass "Score ($SCORE) is in expected range 25–74"
else
  fail "Score out of expected range: $SCORE"
fi

echo "  Score: $SCORE / 100 | Risk: $RISK"

# -------------------------------------------------------------------------
# 6. Assessment — invalid input
# -------------------------------------------------------------------------
header "POST /assessments — invalid input"
RESP=$(curl -s -o /tmp/hc_body.json -w "%{http_code}" \
  -X POST \
  -H "Content-Type: application/json" \
  -d '{"buildingType": "school"}' \
  "$BASE_URL/assessments")
check_status "POST /assessments with missing fields returns 400" "400" "$RESP"

# -------------------------------------------------------------------------
# 7. GET /assessments/:id
# -------------------------------------------------------------------------
header "GET /assessments/:id — retrieve stored assessment"
if [ "$ASSESSMENT_ID" != "null" ]; then
  RESP=$(curl -s -o /tmp/hc_body.json -w "%{http_code}" \
    "$BASE_URL/assessments/$ASSESSMENT_ID")
  check_status "GET /assessments/:id returns 200" "200" "$RESP"
  STORED_SCORE=$(jq '.score' /tmp/hc_body.json 2>/dev/null || echo "null")
  if [ "$STORED_SCORE" = "$SCORE" ]; then
    pass "Stored score matches: $STORED_SCORE"
  else
    fail "Stored score mismatch: expected $SCORE, got $STORED_SCORE"
  fi
else
  fail "Skipping GET test — no assessment ID from previous step"
fi

# -------------------------------------------------------------------------
# 8. GET /assessments/:id — not found
# -------------------------------------------------------------------------
header "GET /assessments/:id — not found"
RESP=$(curl -s -o /tmp/hc_body.json -w "%{http_code}" \
  "$BASE_URL/assessments/HC-DOESNOTEXIST")
check_status "GET /assessments/non-existent returns 404" "404" "$RESP"

# -------------------------------------------------------------------------
# 9. Budget optimizer — canonical demo
# -------------------------------------------------------------------------
header "POST /optimize — ₹50,000 budget"
if [ "$ASSESSMENT_ID" != "null" ]; then
  RESP=$(curl -s -o /tmp/hc_optimize.json -w "%{http_code}" \
    -X POST \
    -H "Content-Type: application/json" \
    -d "{\"assessmentId\": \"$ASSESSMENT_ID\", \"budget\": 50000}" \
    "$BASE_URL/optimize")
  check_status "POST /optimize returns 200" "200" "$RESP"

  FEASIBLE=$(jq '.feasible' /tmp/hc_optimize.json 2>/dev/null || echo "null")
  TOTAL_COST=$(jq '.totalCost' /tmp/hc_optimize.json 2>/dev/null || echo "null")
  PROJECTED=$(jq '.projectedScore' /tmp/hc_optimize.json 2>/dev/null || echo "null")
  IMPROVEMENT=$(jq '.improvement' /tmp/hc_optimize.json 2>/dev/null || echo "null")

  if [ "$FEASIBLE" = "true" ]; then
    pass "Optimizer returned feasible=true"
  else
    fail "Expected feasible=true, got: $FEASIBLE"
  fi

  if [ "$TOTAL_COST" -le 50000 ] 2>/dev/null; then
    pass "Total cost (₹$TOTAL_COST) ≤ budget (₹50,000)"
  else
    fail "Total cost exceeded budget: $TOTAL_COST"
  fi

  if [ "$PROJECTED" -ge "$SCORE" ] 2>/dev/null; then
    pass "Projected score ($PROJECTED) ≥ current score ($SCORE)"
  else
    fail "Projected score ($PROJECTED) is not ≥ current ($SCORE)"
  fi

  echo "  Score: $SCORE → $PROJECTED (+$IMPROVEMENT) | Cost: ₹$TOTAL_COST"
else
  fail "Skipping optimizer test — no assessment ID"
fi

# -------------------------------------------------------------------------
# 10. Optimizer — zero budget
# -------------------------------------------------------------------------
header "POST /optimize — ₹0 budget"
if [ "$ASSESSMENT_ID" != "null" ]; then
  RESP=$(curl -s -o /tmp/hc_body.json -w "%{http_code}" \
    -X POST \
    -H "Content-Type: application/json" \
    -d "{\"assessmentId\": \"$ASSESSMENT_ID\", \"budget\": 0}" \
    "$BASE_URL/optimize")
  check_status "POST /optimize with ₹0 budget returns 200" "200" "$RESP"
  FEASIBLE=$(jq '.feasible' /tmp/hc_body.json 2>/dev/null || echo "null")
  if [ "$FEASIBLE" = "false" ]; then
    pass "Optimizer correctly returns feasible=false for ₹0"
  else
    fail "Expected feasible=false for ₹0, got: $FEASIBLE"
  fi
fi

# -------------------------------------------------------------------------
# Summary
# -------------------------------------------------------------------------
echo ""
echo "============================================"
TOTAL=$((PASS + FAIL))
echo "  $PASS / $TOTAL tests passed"
if [ "$FAIL" -gt 0 ]; then
  echo -e "  ${RED}$FAIL test(s) FAILED${NC}"
  echo "============================================"
  exit 1
else
  echo -e "  ${GREEN}All API tests passed${NC}"
  echo "============================================"
fi
