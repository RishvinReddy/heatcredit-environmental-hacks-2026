# HeatCredit

## Heat Resilience Decision Engine

> Measure heat risk. Understand vulnerability. Optimize resilience. Act within budget.

[![Hackathon](https://img.shields.io/badge/Environmental%20Hacks-2026-orange?style=flat-square)](https://github.com/RishvinReddy/heatcredit-environmental-hacks-2026)
[![Track](https://img.shields.io/badge/Track-Heat%20%26%20Water-blue?style=flat-square)](#track)
[![AWS](https://img.shields.io/badge/Built%20on-AWS-FF9900?style=flat-square&logo=amazon-aws)](#aws-architecture)
[![Next.js](https://img.shields.io/badge/Next.js-TypeScript-black?style=flat-square&logo=next.js)](apps/web)
[![Tests](https://img.shields.io/badge/Tests-51%2F51%20passing-brightgreen?style=flat-square)](#testing)
[![License](https://img.shields.io/badge/License-MIT-green?style=flat-square)](LICENSE)

HeatCredit is an AWS-powered heat resilience decision-support platform that helps buildings and facilities understand their heat vulnerability and identify the highest-impact resilience interventions within a limited budget.

---

## Hackathon

| | |
|---|---|
| **Hackathon** | Environmental Hacks |
| **Event** | Event 02 of the Bharat Builds Tour |
| **Organizer** | WeMakeDevs |
| **Technology Partner** | AWS |
| **Dates** | October 8–11, 2026 |
| **In-Person Venue** | Delhi Technological University, Delhi |
| **Track** | Track 02 — Heat and Water |
| **Team** | Build Bros |
| **Team Size** | 4 |

---

## Track — Heat and Water

> Too much water, too little of it, and the heat in between.

HeatCredit focuses on the **heat resilience** side of the Heat and Water track. The system addresses the challenge of helping a building or facility understand its heat vulnerability and decide which adaptation measures should be prioritized when resources are limited.

---

## Problem

Heatwaves do not affect all buildings equally. A school, hospital, apartment block, or community centre can experience very different levels of heat risk depending on:

- Roof type and condition
- Shade coverage
- Ventilation
- Water access
- Green infrastructure
- Occupancy and operating hours
- Access to cooling or heat-relief spaces

Decision-makers often know: *"Our building is vulnerable."*

But not: ***"What should we spend our limited budget on first?"***

That is the gap HeatCredit addresses.

---

## Solution

HeatCredit converts building and environmental data into an actionable heat-resilience plan through six steps:

| Step | What happens |
|------|--------------|
| **Assess** | Collect building characteristics + live weather context |
| **Score** | Generate a transparent Heat Resilience Score (0–100) across 7 dimensions |
| **Identify** | Rank the building's highest-priority vulnerabilities by impact gap |
| **Simulate** | Interactively explore potential interventions in the Intervention Lab |
| **Optimize** | Find the maximum-impact package within the available budget |
| **Recommend** | Present a clear, costed action plan to the decision-maker |

---

## Core Demo Scenario

**Building:** Green Valley School  
**Location:** Hyderabad, India  
**Occupancy:** 350 students  
**Available Budget:** ₹50,000

**Current Heat Resilience Score: 42 / 100 — High Risk**

HeatCredit evaluates all 64 feasible intervention combinations and identifies the optimal package:

| Intervention | Cost | Impact |
|---|---:|---:|
| Shade Structure | ₹25,000 | +11 |
| Drinking Water Station | ₹8,000 | +6 |
| Ventilation Improvement | ₹15,000 | +8 |
| **Total** | **₹48,000** | **+25** |

**Projected Score: 67 / 100 — Moderate**  
**Improvement: +25 points**  
**Remaining Budget: ₹2,000**

---

## AWS Architecture

```
Browser (Next.js SPA)
        │
        ▼ HTTPS
AWS Amplify (hosting + CI/CD)
        │
        ▼
Amazon API Gateway (HTTP API)
        │
        ▼
AWS Lambda
  ├── GET  /health           → Liveness
  ├── GET  /interventions    → Catalogue
  ├── GET  /weather          → Open-Meteo proxy + fallback
  ├── POST /assessments      → Scoring engine → DynamoDB
  ├── GET  /assessments/:id  → Retrieve assessment
  └── POST /optimize         → Knapsack optimizer → DynamoDB
        │
        ▼
Amazon DynamoDB
  ├── HeatCreditAssessments
  └── HeatCreditRecommendations
        │
        ▼
Amazon CloudWatch (logs + error alarms)
```

---

## AWS Services

HeatCredit uses AWS as part of the actual application architecture — not just for hosting.

| Service | Role |
|---------|------|
| **AWS Amplify** | Frontend hosting and CI/CD from GitHub |
| **Amazon API Gateway** | HTTP API entry point with CORS |
| **AWS Lambda** | Scoring engine, optimizer, weather proxy (Node.js 20, arm64) |
| **Amazon DynamoDB** | Assessments + recommendations (on-demand billing) |
| **Amazon CloudWatch** | Lambda logs, API access logs, error rate alarms |

Infrastructure is defined as code in [`template.yaml`](template.yaml) using AWS SAM.

---

## Scoring Methodology

Seven weighted dimensions produce a deterministic score from 0–100:

| Dimension | Weight |
|-----------|-------:|
| Thermal Protection (roof type + condition) | 25 |
| Shade Coverage | 15 |
| Ventilation | 15 |
| Water Access | 15 |
| Cooling / Relief Capacity | 15 |
| Green Infrastructure | 10 |
| Occupancy Exposure | 5 |
| **Total** | **100** |

Risk classification:

| Score | Classification |
|------:|----------------|
| 90–100 | Highly Resilient |
| 75–89 | Resilient |
| 60–74 | Moderate |
| 40–59 | High Risk |
| 0–39 | Critical |

Full methodology: [`docs/scoring-methodology.md`](docs/scoring-methodology.md)

> **Disclaimer**: HeatCredit's score is a prototype decision-support metric, not a certified building-safety or medical standard.

---

## Optimization Algorithm

HeatCredit uses **deterministic 0/1 knapsack optimization**:

- 6 interventions → 2⁶ = **64 combinations evaluated**
- Objective: maximize total resilience improvement within budget
- Constraint: total cost ≤ available budget
- Tie-breaking: prefer lower cost (preserves remaining budget)
- Score projection: `min(currentScore + totalImpact, 100)`

No ML, no AI, no black box. Every recommendation is fully explainable.

Full algorithm: [`backend/lib/optimizer/optimizer.ts`](backend/lib/optimizer/optimizer.ts)

---

## Intervention Catalogue

| ID | Intervention | Prototype Cost | Impact |
|----|--------------|---------------:|-------:|
| `shade` | Shade Structure | ₹25,000 | +11 |
| `water` | Drinking Water Station | ₹8,000 | +6 |
| `ventilation` | Ventilation Improvement | ₹15,000 | +8 |
| `green` | Green Coverage | ₹20,000 | +7 |
| `roof` | Reflective Roof Treatment | ₹18,000 | +9 |
| `relief` | Heat Relief Room | ₹50,000 | +14 |

*Costs and impact values are prototype planning estimates, not universal real-world construction costs.*

---

## Weather Data

Live weather context via [Open-Meteo](https://open-meteo.com) (CC BY 4.0):
- No API key required
- Lambda proxy with 5-second timeout
- Automatic fallback to demo snapshot — demo never depends on a live API

Attribution: *Weather data provided by Open-Meteo (CC BY 4.0) — https://open-meteo.com*

---

## Frontend — Six Screens

| Screen | Purpose |
|--------|---------|
| **Landing** | Product explanation + CTA |
| **Assessment** | Building input form |
| **Result** | Score + vulnerability breakdown |
| **Intervention Lab** | Interactive what-if simulator |
| **Budget Optimizer** | Optimal package for a given budget |
| **Report** | Final recommendation |

Stack: Next.js 14+, TypeScript, Tailwind CSS, shadcn/ui, Recharts, Lucide.

---

## Testing

```
51 / 51 tests passing
```

| Suite | Tests | Status |
|-------|------:|--------|
| Scoring engine | 27 | ✅ All pass |
| Optimizer engine | 24 | ✅ All pass |
| API integration | 10 cases | Run with `npm run test:api:local` |

---

## Setup

### Prerequisites

- Node.js ≥ 20
- AWS CLI configured (`aws configure`)
- AWS SAM CLI (`pip install aws-sam-cli`)
- Docker (for `sam local`)

### Install

```bash
git clone https://github.com/RishvinReddy/heatcredit-environmental-hacks-2026.git
cd heatcredit-environmental-hacks-2026
npm install
```

### Run tests

```bash
npm test
```

### Build (SAM)

```bash
npm run build
```

### Local API (port 3001)

```bash
npm run local:api
# In a second terminal:
npm run test:api:local
```

### Deploy to AWS

```bash
npm run deploy:guided   # first time
npm run deploy          # subsequent
```

Full deployment guide: [`docs/local-development.md`](docs/local-development.md)

---

## Project Structure

```
heatcredit-environmental-hacks-2026/
├── template.yaml                    ← AWS SAM infrastructure
├── samconfig.toml                   ← Deployment config (ap-south-1)
├── backend/
│   ├── functions/                   ← 5 Lambda handlers
│   │   ├── health/
│   │   ├── interventions/
│   │   ├── weather/
│   │   ├── assessment/
│   │   └── optimization/
│   └── lib/
│       ├── scoring/scoring.ts       ← Heat Resilience Score engine
│       ├── optimizer/optimizer.ts   ← 0/1 knapsack optimizer
│       └── validation/validation.ts ← Input validation
├── data/
│   ├── interventions.json           ← Intervention catalogue
│   ├── demo-buildings.json          ← Demo scenarios
│   └── weather-fallback.json        ← Offline weather snapshot
├── apps/web/                        ← Next.js frontend
├── tests/
│   ├── scoring/scoring.test.ts
│   ├── optimizer/optimizer.test.ts
│   └── api/test-api.sh
├── events/                          ← SAM local invoke fixtures
└── docs/
    ├── api.md
    ├── architecture.md
    ├── scoring-methodology.md
    ├── demo-script.md
    └── local-development.md
```

---

## Team — Build Bros

| Member | Role |
|--------|------|
| Member 1 | Product, Architecture, AWS Integration |
| Member 2 | Frontend (Next.js, UI, charts) |
| Member 3 | Backend (Lambda, API Gateway, DynamoDB) |
| Member 4 | Algorithm, QA, Data, Testing |

---

## Limitations

- Scoring model is a prototype — not calibrated against empirical heat-illness data
- Intervention costs are planning estimates only
- Single-building assessment (portfolio view is a future feature)
- Does not model building age, floor area, or existing HVAC

---

## Roadmap

- **Phase 2**: Multi-building portfolio, historical assessments, PDF reports
- **Phase 3**: Satellite data, urban heat-island analysis, local pricing
- **Phase 4**: IoT sensor integration, real-time telemetry
- **Phase 5**: Institutional climate-resilience planning tools

---

## Credits

| Resource | License |
|----------|---------|
| [Open-Meteo](https://open-meteo.com) weather data | CC BY 4.0 |
| [Lucide](https://lucide.dev) icons | ISC |
| [Recharts](https://recharts.org) | MIT |
| [shadcn/ui](https://ui.shadcn.com) | MIT |

---

## License

MIT — see [LICENSE](LICENSE)

---

*Built for Environmental Hacks 2026 · Event 02 · Bharat Builds Tour · WeMakeDevs × AWS · Track 02 — Heat and Water*
