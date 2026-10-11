# HeatCredit — Data Provenance, Trust Levels & Evidence Audit

> **Objective:** To provide complete, transparent auditing of the source, verification status, freshness, and epistemic reliability of all data consumed or produced by HeatCredit.

---

## 1. Epistemic Classification Framework

HeatCredit categorizes every data point into one of seven explicit trust tiers:

| Trust Tier | Definition | Example in HeatCredit |
|---|---|---|
| **Measured** | Directly collected via physical sensors or audited on-site survey instruments. | Weather station telemetry, verified building thermal scans. |
| **Document-Backed** | Extracted directly from official architectural drawings, engineering deeds, or public records. | Structural roof blueprint indicating concrete construction. |
| **Owner-Reported** | Self-reported by a facility manager or building representative. | Stated occupancy numbers and operating schedule. |
| **User-Estimated** | Unverified approximation entered by a casual user during self-assessment. | Estimated outdoor shade canopy percentage. |
| **Modeled / Derived** | Output of a mathematical model, formula, or optimization algorithm. | Heat Resilience Score (42/100), Knapsack intervention selection. |
| **Demo / Benchmark** | Pre-packaged reference data used for reproducible testing and illustration. | Green Valley School Hyderabad facility profile. |
| **Cached / Fallback** | Stored historical snapshot served when live provider connectivity fails. | Regional fallback weather observation. |

---

## 2. Data Categories Inventory

### 2.1 Demo Facility Records
- **Source:** [`data/demo-buildings.json`](file:///c:/Users/EikoMotsu/OneDrive/Documents/Desktop/HeatCredit/data/demo-buildings.json)
- **Trust Tier:** `Demo / Benchmark`
- **Retrieval Method:** Statically bundled JSON loaded locally in the repository and frontend.
- **Timestamp Semantics:** Static baseline created October 2026.
- **Verification Status:** Verified for mathematical test reproducibility; explicitly marked as demo facilities.
- **Surfacing in UI:** Displayed in the facility selector with prominent `Demo Facility` badges.
- **Limitations:** Does not represent a live, legally binding physical survey of any actual operating school or hospital.

---

### 2.2 User-Supplied Building Inputs & Evidence
- **Source:** User intake form (`/assessment`) and API payload (`POST /assessments`).
- **Trust Tier:** Ranges from `User-Estimated` to `Document-Backed`.
- **Retrieval Method:** HTTP POST request submitted by browser client.
- **Evidence Schema:** Accepts optional `evidence` objects for 9 sensitive fields (`roofType`, `roofCondition`, `shadeCoverage`, `greenCoverage`, `ventilation`, `waterAccess`, `reliefSpace`, `occupancy`, `operatingHours`).
- **Verification Logic:**
  - `user_estimated`: Cannot be marked `verified`. Defaults to `unverified`.
  - `owner_reported`: Requires explicit `verifierMetadata` to achieve `verified`. Otherwise marked `unverified`.
  - `building_document` / `measured`: Eligible for `verified` when accompanied by valid ISO-8601 timestamps and confidence $\in [0, 1]$.
  - Missing evidence: Marked as `legacy_unverified`.
- **Evidence Completeness Score:** Computed as:
  $$\text{Completeness} = \frac{\sum (\text{field points})}{9.0} \times 100\%$$
  where verified = 1.0 pt, unverified = 0.5 pt, legacy = 0.0 pt.
- **Limitations:** A completeness score of 100% indicates that sources were documented; it does not scientifically guarantee that the physical structure is free of defects.

---

### 2.3 Meteorological Weather Observations
- **Provider:** Open-Meteo API (`https://api.open-meteo.com/v1`)
- **Attribution:** *Weather data provided by Open-Meteo (CC BY 4.0) — https://open-meteo.com*
- **Trust Tier:** `Measured` when live provider succeeds; `Cached / Fallback` when fallback activates.
- **Retrieval Method:** Server-side HTTPS GET via AWS Lambda `WeatherFunction` with a strict **5-second timeout**.
- **Freshness Policy:** Live observations are fetched on-demand.
- **Failure Surfacing:** If Open-Meteo returns HTTP 5xx, invalid coordinates, or times out, the backend returns a safe fallback payload and explicitly sets `"isDemo": true`. The web UI immediately updates its badge to `Demo Weather Fallback`.

---

### 2.4 Official Meteorological Warnings
- **Provider:** United States National Weather Service (NWS) API (`https://api.weather.gov`)
- **Attribution:** *Official hazard data provided by US National Weather Service API*
- **Trust Tier:** `Measured / Government Authority`
- **Jurisdiction Coverage:** **United States Only**.
- **Explicit Warning States:**
  - `active`: Verified active heat alert currently in effect for the given coordinates.
  - `none`: Successfully queried the official provider; zero active heat alerts currently in effect.
  - `unsupported`: Coordinates fall outside the US NWS jurisdiction (e.g., India, Europe).
  - `unavailable`: Provider connection failed, timed out, or returned malformed JSON.
- **Failure Surfacing:** The status `unsupported` or `unavailable` is **never masked as `none`**, ensuring users are not given a false sense of safety.

---

### 2.5 Intervention Catalogue
- **Source:** [`data/interventions.json`](file:///c:/Users/EikoMotsu/OneDrive/Documents/Desktop/HeatCredit/data/interventions.json)
- **Trust Tier:** `Modeled / Planning Benchmark`
- **Retrieval Method:** Bundled JSON served directly via Lambda `InterventionsFunction`.
- **Pricing Basis:** Prototype baseline costs in Indian Rupees (₹) compiled for community-scale facilities.
- **Limitations:** Actual retrofit costs fluctuate based on local material availability, structural height, and skilled labor rates.

---

### 2.6 Calculated Resilience Scores
- **Source:** Canonical Scoring Engine [`backend/lib/scoring/scoring.ts`](file:///c:/Users/EikoMotsu/OneDrive/Documents/Desktop/HeatCredit/backend/lib/scoring/scoring.ts)
- **Trust Tier:** `Modeled / Derived`
- **Methodology:** Weighted linear summation across 7 dimensions (0–100), clamped and classified into risk tiers.
- **Validation Status:** `prototype`. Tested against 32 unit test cases.
- **Limitations:** Measures architectural and operational resilience capacity; does not guarantee internal room temperature or medical safety.

---

### 2.7 Optimization Outputs
- **Source:** 0/1 Knapsack Engine [`backend/lib/optimizer/optimizer.ts`](file:///c:/Users/EikoMotsu/OneDrive/Documents/Desktop/HeatCredit/backend/lib/optimizer/optimizer.ts)
- **Trust Tier:** `Modeled / Algorithmic Optimum`
- **Methodology:** Exhaustive bitmask enumeration across $2^6 = 64$ combinations.
- **Limitations:** Evaluates binary intervention decisions; assumes linear additive benefits.

---

### 2.8 Persisted Assessment Records
- **Storage:** Amazon DynamoDB (`HeatCreditAssessments-prod`, `HeatCreditRecommendations-prod`)
- **Trust Tier:** `Derived Storage`
- **Retention Policy:** Configured with a 30-day Time-To-Live (`ttl`) attribute to prevent perpetual data accumulation.
