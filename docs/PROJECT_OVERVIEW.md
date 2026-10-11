# HeatCredit — Project Overview

> **Product Tagline:** “Measure heat risk. Optimize resilience. Act within budget.”
> **Team:** Build Bros (Rishvin Reddy, Pocharam Gayathri, Guggilla Yogamruth Reddy, Navari Yashwanth Reddy)
> **Event:** Environmental Hacks 2026 — Event 02 of Bharat Builds Tour
> **Organizer:** WeMakeDevs | **Technology Partner:** Amazon Web Services (AWS)
> **Track:** Track 02 — Heat & Water
> **Repository:** [GitHub: RishvinReddy/heatcredit-environmental-hacks-2026](https://github.com/RishvinReddy/heatcredit-environmental-hacks-2026)

---

## 1. Problem Statement

Extreme heat events are intensifying across urban and semi-urban landscapes. For public facilities—such as primary schools, community health centers, transit shelters, and multi-family residential complexes—extreme ambient temperatures create severe thermodynamic stress on indoor microclimates, occupant well-being, and operational stability.

However, standard meteorological forecasts and ambient temperature maps only describe regional weather. They fail to reflect **facility-level vulnerability**:
1. Two adjacent buildings under identical 42°C ambient heat experience wildly different indoor heat stress based on roofing materials, shade canopy, ventilation rates, and active hydration availability.
2. Facility operators and municipalities possess limited capital budgets (e.g., ₹25,000–₹100,000) and cannot implement comprehensive HVAC or full structural redesigns.
3. Decision-makers lack transparent, explainable decision-support systems that quantitatively map capital expenditures to passive heat resilience improvements without opaque "black-box" models.

---

## 2. Intended Users & Use Cases

| Target User Group | Operational Context | Primary Use Case in HeatCredit |
|---|---|---|
| **School Administrators & Headmasters** | Primary & secondary educational institutions | Evaluate classroom heat vulnerability, plan summer vacation retrofit works within municipal or PTA grants (e.g., shade sails, water coolers). |
| **Primary Healthcare Facility Managers** | Community health clinics & outpatient centers | Prioritize dedicated cool recovery spaces and reflective coatings to protect vulnerable patients during heatwaves. |
| **Municipal Resilience Officers & Urban Planners** | Ward-level urban governance | Compare vulnerability scores across multiple municipal buildings and optimize portfolio-level budget allocation. |
| **Building Engineers & Facility Managers** | Commercial & residential societies | Audit passive building envelope features, analyze cost-benefit trade-offs of cool roofs vs. green walls, and generate executive reports. |

---

## 3. Product Objectives

1. **Deterministic Vulnerability Scoring:** Compute a transparent, reproducible Heat Resilience Score (0–100) across 7 physical and operational dimensions without machine-learning hallucinations.
2. **Budget-Constrained Knapsack Optimization:** Systematically explore all intervention combinations to identify the exact package that maximizes resilience lift within a strict financial ceiling.
3. **Data Provenance & Trust Transparency:** Track whether building input data is measured, document-backed, owner-reported, or estimated, exposing an explicit Evidence Completeness metric alongside scores.
4. **Actionable Climate Context:** Ingest live meteorological observations (via Open-Meteo) and official meteorological hazard alerts (via the US National Weather Service API) with robust fallback handling.
5. **Production-Ready Serverless Architecture:** Deliver a serverless AWS backend (API Gateway, Lambda Node.js 24.x, DynamoDB on-demand, CloudWatch) coupled with a modern Next.js TypeScript frontend.

---

## 4. Product Scope & Core Workflows

### What HeatCredit Does
- **Facility Intake:** Accepts 11 verified structural and operational attributes (roof type/condition, shade %, green cover %, ventilation, water access, relief capacity, occupancy, and operating hours).
- **Multi-Factor Risk Assessment:** Ranks vulnerability gaps into High, Moderate, and Low severity tiers.
- **Capital Allocation Optimization:** Solves a 0/1 knapsack optimization over a 6-intervention physical catalogue with clear rupee pricing.
- **Scenario Studio:** Enables side-by-side comparison of baseline, conservative, balanced, and aggressive capital intervention packages.
- **Decision Reporting:** Generates comprehensive facility decision sheets suitable for municipal committees and facility boards.

### What HeatCredit Does NOT Do (Explicit Non-Goals)
- **Not a Medical Device or Clinical Diagnostic:** Does not predict individual heat stroke, morbidity, or physiological internal core temperature.
- **Not a Dynamic Thermodynamic Physics Simulation:** Does not run dynamic Computational Fluid Dynamics (CFD) or EnergyPlus whole-building thermal simulations.
- **Not an Official Building Safety Certification:** Provides decision-support estimates to prioritize municipal grants; does not replace licensed structural engineering inspections.

---

## 5. Value Proposition: Why Heat Resilience is Different from Temperature

A common misconception is that heat risk can be managed simply by monitoring a thermometer or weather app.

```
Weather App (Meteorological Observation)
   "It is 41°C in Hyderabad."
   → Passive, uniform observation. Tells you the outdoor condition, not the facility risk.

HeatCredit (Structural Vulnerability & Capital Decision Engine)
   "Facility Green Valley School is at 41°C ambient heat with a score of 42/100 (High Risk)."
   "Top Gaps: Inadequate Shade (3.8/15), Poor Water Access (4.5/15), Metal Roof Heat Flux."
   "Optimal Action: Allocate ₹48,000 from your ₹50,000 budget to deploy Shade + Ventilation + Water Station."
   "Projected Resilience Lift: +25 points (Score 42 → 67, Moderate Risk). Reserve remaining: ₹2,000."
   → Active, prescriptive, budget-aware intervention guidance.
```

---

## 6. Assumptions & Known Limitations

1. **Linear Factor Approximation:** The 7 scoring dimensions use deterministic linear weightings calibrated for decision support rather than non-linear microclimate fluid dynamics.
2. **Standardized Intervention Costs:** Catalogue pricing reflects prototype market averages (in INR ₹) for South Asian urban contexts; localized labor and supply chain variations may alter actual construction costs.
3. **Discrete Binary Interventions:** Interventions are modeled as binary 0/1 selections (either deployed or not); partial implementations are not currently modeled.
4. **Jurisdiction-Bounded Warnings:** Official meteorological warnings currently support the US National Weather Service API. For non-US locations, the engine explicitly reports warning status as `unsupported` rather than falsely asserting `none`.

---

## 7. Future Development Opportunities

- Integration with India Meteorological Department (IMD) Mausam API and European MeteoAlarm feeds.
- Ingestion of live IoT sensor telemetry (indoor temperature and relative humidity data loggers).
- Multi-facility portfolio optimization for municipal district capital budgets.
- Automated satellite imagery analysis for automated vegetation and cool-roof spectral verification.
