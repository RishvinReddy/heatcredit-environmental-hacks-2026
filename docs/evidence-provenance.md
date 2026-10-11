# HeatCredit — Building Evidence and Provenance

> **Objective:** To make every building assessment transparent about where its input data came from, whether it has been verified, and how much confidence users should place in it.

## Philosophy

A syntactically valid field is **not** necessarily a factually verified field. HeatCredit's decision support model distinguishes between:
- **Validated input**: the value has the correct format and range.
- **Evidence-backed input**: a declared source supports the value.
- **Verified input**: an explicit verification process has been recorded.
- **Unverified input**: the value is estimated or reported without independent verification.

## Source Categories

Every piece of evidence provided for a building field must declare its `sourceCategory`.

- `measured`: Data collected via sensors or direct on-site physical measurement.
- `building_document`: Data extracted from official architectural plans, property deeds, or structural surveys.
- `owner_reported`: Data reported by the building owner or facility manager.
- `user_estimated`: A guess or estimate made by the person running the assessment.
- `third_party_dataset`: Data sourced from external models (e.g., satellite imagery, GIS databases).

## Verification Status

Evidence records are assigned a `verificationStatus` to explicitly track their reliability:

- `verified`: The evidence has been independently corroborated.
  - *Constraint:* `user_estimated` data **cannot** be marked as `verified`.
  - *Constraint:* `owner_reported` data requires explicit `verifierMetadata` to be marked as `verified`.
- `unverified`: The evidence has a declared source, but the claim has not been independently verified.
- `legacy_unverified`: Assigned to historical or legacy building assessments that lack any explicit provenance metadata.

## Calculating Evidence Completeness

To provide transparency into the overall trustworthiness of a building's resilience score, HeatCredit calculates an **Evidence Completeness Score** (0–100) alongside the assessment.

The completeness score evaluates the 9 evidence-sensitive fields:
1. `occupancy`
2. `operatingHours`
3. `roofType`
4. `roofCondition`
5. `shadeCoverage`
6. `greenCoverage`
7. `ventilation`
8. `waterAccess`
9. `reliefSpace`

### Weighting

- A `verified` field contributes **1 point**.
- An `unverified` field (but with explicitly declared provenance) contributes **0.5 points**.
- A `legacy_unverified` field contributes **0 points**.

The completeness score is the percentage of total possible points.

> **Note:** The Completeness Score does **not** alter the actual Heat Resilience Score. It is purely a transparency metric. A completeness score of 100% does not mean the building is highly resilient, it just means the data used to assess the building is highly trustworthy.

## Limitations

- A completeness percentage is not a scientific probability that an assessment is factually flawless.
- Do not claim high confidence in the overall assessment solely because many fields have unverified evidence metadata.
- Demo data defaults to `legacy_unverified` as it lacks genuine source evidence.
