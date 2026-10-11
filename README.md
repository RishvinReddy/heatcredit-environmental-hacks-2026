# HeatCredit
## Heat Resilience Decision Engine

<p align="center">
  <strong>Measure heat risk. Understand vulnerability. Optimize resilience. Act within budget.</strong>
</p>

<p align="center">
  An AWS-powered environmental decision-support platform that helps schools, hospitals, community facilities, and building managers identify heat vulnerabilities and prioritize practical resilience interventions under limited budgets.
</p>

<p align="center">
  <a href="https://github.com/RishvinReddy/heatcredit-environmental-hacks-2026">
    <img src="https://img.shields.io/badge/Project-HeatCredit-0F766E?style=for-the-badge" alt="HeatCredit"/>
  </a>
  <img src="https://img.shields.io/badge/Track-Heat%20%26%20Water-2563EB?style=for-the-badge" alt="Heat and Water"/>
  <img src="https://img.shields.io/badge/Cloud-AWS-FF9900?style=for-the-badge&logo=amazonaws&logoColor=white" alt="Amazon Web Services"/>
  <img src="https://img.shields.io/badge/Backend-TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript"/>
  <img src="https://img.shields.io/badge/Infrastructure-AWS%20SAM-232F3E?style=for-the-badge&logo=amazonaws&logoColor=white" alt="AWS SAM"/>
  <img src="https://img.shields.io/badge/License-MIT-16A34A?style=for-the-badge" alt="MIT License"/>
</p>

<!-- Live Application & Interactive Showcase Banner -->
<p align="center">
  <a href="https://feature-phase-3-building-evidence.d6yb0i87oun6i.amplifyapp.com/" target="_blank" rel="noopener noreferrer">
    <img src="assets/dashboard-doodle.svg" alt="Click here to access the HeatCredit System Dashboard on AWS Amplify" width="800"/>
  </a>
</p>

<p align="center">
  <a href="https://feature-phase-3-building-evidence.d6yb0i87oun6i.amplifyapp.com/" target="_blank" rel="noopener noreferrer">
    <img src="https://img.shields.io/badge/🚀_Live_Dashboard-AWS_Amplify-0F766E?style=for-the-badge&logo=awsamplify&logoColor=white" alt="Live Dashboard"/>
  </a>
  &nbsp;
  <a href="https://youtu.be/YSq04cWQ8as" target="_blank" rel="noopener noreferrer">
    <img src="https://img.shields.io/badge/🎬_Demo_Video-YouTube-FF0000?style=for-the-badge&logo=youtube&logoColor=white" alt="Demo Video"/>
  </a>
  &nbsp;
  <a href="https://lnkd.in/p/gzhSDWzy" target="_blank" rel="noopener noreferrer">
    <img src="https://img.shields.io/badge/📝_Project_Article-LinkedIn-0A66C2?style=for-the-badge&logo=linkedin&logoColor=white" alt="LinkedIn Article"/>
  </a>
</p>

<p align="center">
  <a href="#overview">Overview</a> •
  <a href="#features">Features</a> •
  <a href="#architecture">Architecture</a> •
  <a href="#getting-started">Getting Started</a> •
  <a href="#api-reference">API Reference</a> •
  <a href="#testing">Testing</a> •
  <a href="#technical-documentation--submission-guides">Documentation</a>
</p>

---

### 📚 Technical Documentation & Submission Guides

| Document | Purpose & Verification Scope |
|---|---|
| **[PROJECT_OVERVIEW.md](docs/PROJECT_OVERVIEW.md)** | Problem statement, intended users, scope, core workflows & objectives. |
| **[ARCHITECTURE.md](docs/ARCHITECTURE.md)** | System topology, 6 Mermaid diagrams, compute boundaries & AWS services. |
| **[SCORING_METHODOLOGY.md](docs/SCORING_METHODOLOGY.md)** | 7 physical dimensions, weights, factor formulas & worked ₹50k demo math. |
| **[INTERVENTIONS_AND_OPTIMIZATION.md](docs/INTERVENTIONS_AND_OPTIMIZATION.md)** | 6-item catalogue, 0/1 knapsack algorithm, feasibility & alternatives. |
| **[API_REFERENCE.md](docs/API_REFERENCE.md)** | OpenAPI contracts for all 7 routes, JSON request/response schemas & errors. |
| **[DATA_PROVENANCE.md](docs/DATA_PROVENANCE.md)** | Epistemic trust tiers, evidence completeness metric & warning jurisdictions. |
| **[TESTING.md](docs/TESTING.md)** | Reproduction guide for all 141 passing tests & build evidence. |
| **[DEPLOYMENT.md](docs/DEPLOYMENT.md)** | AWS SAM deployment, Amplify CI/CD, DynamoDB config & teardown. |
| **[SECURITY.md](docs/SECURITY.md)** | IAM least privilege, schema validation, rate limits & threat model. |
| **[DEMO_SCRIPT.md](docs/DEMO_SCRIPT.md)** | Rehearsed 2m 45s demonstration script (< 3 minutes hackathon limit). |
| **[AI_USAGE_AND_CREDITS.md](docs/AI_USAGE_AND_CREDITS.md)** | AI assistant disclosure, human verification & third-party attributions. |
| **[CONTRIBUTING.md](docs/CONTRIBUTING.md)** | Developer onboarding, extension workflows & pull request standards. |
| **[HACKATHON_SUBMISSION.md](docs/HACKATHON_SUBMISSION.md)** | Comprehensive submission write-up covering all 21 hackathon criteria. |

---

## Table of Contents

- [Overview](#overview)
- [Environmental Problem](#environmental-problem)
- [Our Solution](#our-solution)
- [Objectives](#objectives)
- [Features](#features)
- [Target Users](#target-users)
- [Core Workflow](#core-workflow)
- [Technology Stack](#technology-stack)
- [System Architecture](#architecture)
- [AWS Services](#aws-services)
- [Scoring Methodology](#scoring-methodology)
- [Budget Optimization Algorithm](#budget-optimization-algorithm)
- [Intervention Catalogue](#intervention-catalogue)
- [Weather Integration](#weather-integration)
- [API Reference](#api-reference)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Local Development](#local-development)
- [Testing and Validation](#testing)
- [Deployment on AWS](#deployment-on-aws)
- [Security and Reliability](#security-and-reliability)
- [Demo Scenario](#demo-scenario)
- [Environmental and Social Impact](#environmental-and-social-impact)
- [Limitations](#limitations)
- [Future Roadmap](#future-roadmap)
- [Hackathon Information](#hackathon-information)
- [Team](#team)
- [Contributing](#contributing)
- [Acknowledgments](#acknowledgments)
- [License](#license)
- [Disclaimer](#disclaimer)

---

## Overview

**HeatCredit is a heat-resilience decision engine that transforms building vulnerability assessments into explainable, budget-aware adaptation plans.**

Heatwaves create different levels of risk for different buildings. A school with a poorly insulated roof, inadequate shade, limited drinking water, and insufficient ventilation may face substantially different conditions from a building with effective passive cooling and accessible relief spaces.

However, identifying a problem is only part of the challenge. Institutions must also determine which interventions should receive funding first.

HeatCredit addresses this decision-making gap through a structured process:

1. Assess building characteristics and environmental conditions.
2. Calculate a transparent Heat Resilience Score.
3. Identify and prioritize vulnerability dimensions.
4. Explore possible interventions.
5. Optimize intervention combinations against a budget.
6. Produce an explainable, costed recommendation.

The platform combines deterministic scoring, combinatorial optimization, weather-data integration, serverless APIs, and a web-based interface.

### Project at a glance

| Attribute | Details |
|---|---|
| Project | HeatCredit |
| Category | Environmental Technology / Climate Resilience |
| Problem domain | Heat resilience and adaptation |
| Hackathon | Environmental Hacks 2026 |
| Event | Event 02 — Bharat Builds Tour |
| Organizer | WeMakeDevs |
| Technology partner | Amazon Web Services (AWS) |
| Track | Track 02 — Heat and Water |
| Team | Build Bros |
| Primary language | TypeScript |
| Frontend | Next.js |
| Backend | AWS Lambda |
| API layer | Amazon API Gateway |
| Database | Amazon DynamoDB |
| Infrastructure as Code | AWS SAM |
| Weather provider | Open-Meteo |

**Repository:** [RishvinReddy/heatcredit-environmental-hacks-2026](https://github.com/RishvinReddy/heatcredit-environmental-hacks-2026)

---

## Environmental Problem

### Why heat resilience matters

Extreme heat can affect learning environments, workplace productivity, community health, and the safe operation of essential facilities.

The degree of vulnerability depends on multiple interacting factors, including:

- Roof material and condition.
- Availability of shade.
- Natural or mechanical ventilation.
- Access to drinking water.
- Green infrastructure.
- Occupancy and operating hours.
- Availability of cooling or heat-relief spaces.
- Local environmental conditions.

A facility may recognize that it is vulnerable but lack a structured method for deciding how to distribute its limited adaptation budget.

### The decision-making gap

Traditional assessments can identify vulnerabilities without necessarily answering three important questions:

1. Which deficiencies should be addressed first?
2. Which combination of interventions provides the greatest estimated improvement?
3. How can the institution make the best use of a fixed budget?

HeatCredit focuses on connecting these three decisions in one explainable workflow.

### Design principle

> A useful climate-resilience tool should help decision-makers move from understanding risk to choosing feasible, prioritized actions.

The goal is not simply to display a risk score. It is to help users evaluate what they can do next with the resources available to them.

---

## Our Solution

HeatCredit combines a transparent assessment model with an optimization engine.

### 1. Assess

The user enters building characteristics, occupancy information, and relevant environmental inputs.

### 2. Score

The scoring engine calculates a Heat Resilience Score between 0 and 100 using seven weighted dimensions.

### 3. Diagnose

The application identifies comparatively weak dimensions so users can understand where resilience improvements may be needed.

### 4. Simulate

Users can explore interventions and understand their estimated costs and potential score improvements.

### 5. Optimize

The optimizer evaluates feasible combinations of interventions and selects the highest-impact package within the available budget.

### 6. Recommend

The application presents a structured recommendation with selected interventions, estimated spending, projected resilience improvement, and remaining budget.

---

## Objectives

HeatCredit is designed around the following objectives:

- **Improve visibility:** Make building heat vulnerability easier to understand.
- **Support prioritization:** Identify comparatively weak resilience dimensions.
- **Optimize limited resources:** Select intervention combinations that maximize estimated improvement within budget.
- **Maintain explainability:** Make the reasoning behind scores and recommendations inspectable.
- **Use real environmental context:** Incorporate weather information when available.
- **Remain resilient to external failures:** Support fallback weather data for demonstrations.
- **Use cloud-native infrastructure:** Implement the application using AWS services and infrastructure as code.
- **Support future expansion:** Establish a foundation for portfolio assessments, reporting, and additional environmental datasets.

---

## Features

### Heat Resilience Assessment

Collects building and environmental characteristics and generates a normalized score from 0 to 100.

### Vulnerability Breakdown

Shows how the assessment dimensions contribute to the overall score and helps users identify potential improvement areas.

### Intervention Catalogue

Provides a structured catalogue of adaptation measures, with prototype cost and impact estimates.

### Intervention Lab

Supports comparative exploration of potential interventions before committing to a budget allocation.

### Budget Optimization

Evaluates combinations of available interventions and selects a feasible package according to the optimization objective.

### Weather Integration

Retrieves location-based weather context through Open-Meteo, with fallback data when the external request is unavailable.

### Assessment Persistence

Uses Amazon DynamoDB to store assessment information and optimization recommendations.

### Serverless Backend

Separates application responsibilities into AWS Lambda functions behind Amazon API Gateway.

### Infrastructure as Code

Defines the AWS application infrastructure in `template.yaml` using AWS SAM.

### Automated Tests

Includes unit tests for the scoring and optimization engines, alongside a separate API integration test script.

---

## Target Users

| User group | Potential application |
|---|---|
| Schools and colleges | Evaluate classroom and campus heat-resilience needs |
| Hospitals and clinics | Identify potential infrastructure adaptation priorities |
| Community centres | Compare interventions for shared public facilities |
| Building managers | Understand vulnerabilities and estimate improvement options |
| Local institutions | Structure climate-adaptation budget discussions |
| Sustainability teams | Document and compare resilience-planning scenarios |

HeatCredit is a decision-support prototype. Its outputs are not substitutes for professional building inspections, engineering assessments, or public-health guidance.

---

## Core Workflow

```text
Building Information
        |
        v
Environmental Context
        |
        v
Heat Resilience Assessment
        |
        v
Weighted Scoring Engine
        |
        v
Score + Vulnerability Breakdown
        |
        v
Intervention Exploration
        |
        v
Budget Optimization Engine
        |
        v
Selected Intervention Package
        |
        v
Costed Recommendation
```

The assessment and optimization stages have separate responsibilities:

- The **scoring engine** evaluates the supplied building characteristics.
- The **optimization engine** selects interventions using the current score, intervention catalogue, and available budget.
- The **API layer** validates requests and connects the application to persistence and weather services.
- The **frontend** presents the results in a form that supports decision-making.

---

## Technology Stack

| Layer | Technology | Purpose |
|---|---|---|
| Frontend framework | Next.js | Web application and user interface |
| Programming language | TypeScript | Application and backend logic |
| UI styling | Tailwind CSS | Responsive styling |
| UI components | shadcn/ui | Reusable interface components |
| Charts | Recharts | Assessment visualization |
| Icons | Lucide | Interface icons |
| API gateway | Amazon API Gateway | HTTP API routing |
| Compute | AWS Lambda | Serverless business logic |
| Runtime | Node.js 20.x | Lambda execution runtime |
| Database | Amazon DynamoDB | Assessment and recommendation storage |
| Weather | Open-Meteo | External weather information |
| Monitoring | Amazon CloudWatch | Logs and operational monitoring |
| Infrastructure | AWS SAM | Infrastructure deployment and local API testing |
| Language tooling | TypeScript, ts-node | Development and automated tests |
| Package management | npm | Dependency and script management |

The repository contains the application code, backend modules, datasets, tests, infrastructure definition, and technical documentation.

---

## Architecture

HeatCredit follows a serverless architecture that separates the user interface, API entry point, business logic, persistence, and operational monitoring.

### High-level architecture

```text
+--------------------------------------+
|              User Browser            |
|                                      |
|       Next.js + TypeScript UI        |
+-------------------+------------------+
                    |
                    | HTTPS
                    v
+--------------------------------------+
|             AWS Amplify              |
|        Frontend Hosting + CI/CD       |
+-------------------+------------------+
                    |
                    v
+--------------------------------------+
|          Amazon API Gateway          |
|               HTTP API               |
+-------------------+------------------+
                    |
        +-----------+-----------+
        |           |           |
        v           v           v
+-------------+ +----------+ +-------------+
| Assessment  | | Weather  | | Optimization|
| Lambda      | | Lambda   | | Lambda      |
+------+------+ +----+-----+ +------+------+
       |             |              |
       |             v              |
       |        +------------+      |
       |        | Open-Meteo |      |
       |        | API        |      |
       |        +------------+      |
       |                            |
       v                            v
+--------------------------------------+
|             Amazon DynamoDB          |
|                                      |
|       Assessments + Recommendations  |
+-------------------+------------------+
                    |
                    v
+--------------------------------------+
|           Amazon CloudWatch          |
|          Logs and Monitoring         |
+--------------------------------------+
```

The diagram represents the intended application architecture. AWS resources must be deployed and configured before the hosted application can use them.

### Backend responsibilities

| Function | Endpoint | Responsibility |
|---|---|---|
| Health | `GET /health` | Check API liveness |
| Interventions | `GET /interventions` | Return the intervention catalogue |
| Weather | `GET /weather` | Retrieve weather context or fallback data |
| Assessment | `POST /assessments` | Validate, score, and persist an assessment |
| Optimization | `POST /optimize` | Optimize an intervention package and persist the recommendation |

### Assessment data flow

1. The frontend submits building information.
2. API Gateway routes the request to the assessment Lambda function.
3. The function validates the request.
4. The scoring engine calculates the overall score and breakdown.
5. The assessment is persisted in DynamoDB.
6. The API returns the assessment identifier and results.

### Optimization data flow

1. The frontend submits an assessment identifier and budget.
2. API Gateway invokes the optimization Lambda function.
3. The function retrieves the corresponding assessment.
4. The optimizer loads the intervention catalogue.
5. Feasible intervention combinations are evaluated.
6. The selected recommendation is persisted in DynamoDB.
7. The API returns the selected interventions and budget calculations.

### Weather data flow

1. The frontend requests weather for a latitude and longitude.
2. The weather Lambda function queries Open-Meteo.
3. If the external request succeeds, the returned weather context is used.
4. If the request fails or times out, the function can use the configured fallback snapshot.
5. The API returns the available weather context and its source status.

---

## AWS Services

AWS is part of HeatCredit's application architecture, not merely a hosting destination.

| AWS service | Responsibility |
|---|---|
| AWS Amplify | Frontend hosting and deployment integration |
| Amazon API Gateway | HTTP API entry point |
| AWS Lambda | Assessment, weather, catalogue, and optimization logic |
| Amazon DynamoDB | Persistent assessment and recommendation records |
| Amazon CloudWatch | Application logs and monitoring |
| AWS SAM | Infrastructure definition, build, local testing, and deployment |

### Infrastructure as Code

The primary infrastructure definition is:

[`template.yaml`](template.yaml)

Deployment configuration is maintained in:

[`samconfig.toml`](samconfig.toml)

Infrastructure as code makes the AWS resource configuration easier to review, reproduce, and maintain.

### Regional configuration

The repository's SAM configuration targets `ap-south-1` (Asia Pacific — Mumbai). Confirm the active region and AWS account before deployment.

---

## Scoring Methodology

HeatCredit uses a deterministic, weighted scoring model to summarize building heat resilience.

Seven dimensions contribute to a maximum score of 100.

### Weighted dimensions

| Dimension | Weight | What it represents |
|---|---:|---|
| Thermal Protection | 25 | Roof type and roof condition |
| Shade Coverage | 15 | Protection from direct solar exposure |
| Ventilation | 15 | Ventilation conditions |
| Water Access | 15 | Availability of drinking water |
| Cooling / Relief Capacity | 15 | Access to cooling or heat-relief spaces |
| Green Infrastructure | 10 | Green coverage and related infrastructure |
| Occupancy Exposure | 5 | Exposure associated with occupancy and operating conditions |
| **Total** | **100** | |

### Score interpretation

| Score range | Classification | Interpretation |
|---:|---|---|
| 90–100 | Highly Resilient | High modeled resilience |
| 75–89 | Resilient | Relatively strong modeled resilience |
| 60–74 | Moderate | Opportunities for improvement remain |
| 40–59 | High Risk | Significant modeled vulnerabilities |
| 0–39 | Critical | Substantial modeled vulnerability |

The scoring engine uses the configured dimension weights and input-to-score mappings to calculate the final result.

### Explainability

The assessment is designed to expose more than a single number. It also provides a dimensional breakdown and vulnerability information so that users can understand the factors influencing the result.

This makes it possible to connect the assessment stage with the intervention-selection stage.

### Methodology documentation

For the implementation-specific formulas, input mappings, and scoring rules, see:

[`docs/scoring-methodology.md`](docs/scoring-methodology.md)

The numerical weights and classifications documented here describe the prototype methodology. They should not be interpreted as a validated prediction of heat illness or building safety.

---

## Budget Optimization Algorithm

HeatCredit uses a **deterministic 0/1 knapsack-style optimization algorithm** to select an intervention package.

Each intervention is treated as a candidate that can be selected or not selected.

### Optimization objective

Let:

- \(n\) be the number of interventions.
- \(c_i\) be the estimated cost of intervention \(i\).
- \(v_i\) be its estimated resilience impact.
- \(B\) be the available budget.
- \(x_i \in \{0,1\}\) indicate whether intervention \(i\) is selected.

The optimization objective is:

\[
\max \sum_{i=1}^{n} v_i x_i
\]

Subject to:

\[
\sum_{i=1}^{n} c_i x_i \leq B
\]

and:

\[
x_i \in \{0,1\}
\]

The algorithm maximizes the sum of the configured intervention impact values while keeping total estimated cost within the available budget.

### How it works

1. Load the current assessment score.
2. Load the available intervention catalogue.
3. Enumerate feasible intervention combinations.
4. Calculate the total cost and total impact of each combination.
5. Discard combinations that exceed the budget.
6. Select the combination with the greatest estimated impact.
7. Apply the configured lower-cost tie-breaking rule when impact is equal.
8. Calculate the projected score and remaining budget.

### Search space

The current catalogue contains six interventions.

The number of possible subsets is:

\[
2^6 = 64
\]

The optimizer can therefore evaluate every subset for this catalogue rather than relying on a heuristic search.

For \(n\) interventions, exhaustive enumeration has a worst-case time complexity of \(O(2^n)\), with an additional \(O(n)\) cost to evaluate each subset. This approach is suitable for the current small catalogue; a larger catalogue may require a different optimization strategy.

### Projected score

The documented projection rule is:

\[
S_{\text{projected}} =
\min(S_{\text{current}} + I_{\text{total}}, 100)
\]

where:

- \(S_{\text{current}}\) is the current assessment score.
- \(I_{\text{total}}\) is the sum of the selected interventions' configured impact values.

This projection is a simplified prototype calculation, not a calibrated physical model of the effects of construction or adaptation measures.

### Implementation

The optimizer is implemented in:

[`backend/lib/optimizer/optimizer.ts`](backend/lib/optimizer/optimizer.ts)

**Design principle:** Every recommendation should be traceable to the configured costs, impacts, budget constraints, and selection rules.

---

## Intervention Catalogue

The prototype currently defines six candidate interventions.

| ID | Intervention | Estimated cost | Configured impact |
|---|---|---:|---:|
| `shade` | Shade Structure | ₹25,000 | +11 |
| `water` | Drinking Water Station | ₹8,000 | +6 |
| `ventilation` | Ventilation Improvement | ₹15,000 | +8 |
| `green` | Green Coverage | ₹20,000 | +7 |
| `roof` | Reflective Roof Treatment | ₹18,000 | +9 |
| `relief` | Heat Relief Room | ₹50,000 | +14 |

The catalogue is maintained in:

[`data/interventions.json`](data/interventions.json)

### Why these interventions?

The catalogue covers several practical adaptation categories:

- Solar protection through shade.
- Access to drinking water.
- Improved ventilation.
- Green infrastructure.
- Roof-level thermal adaptation.
- Dedicated heat-relief capacity.

The optimizer evaluates the configured alternatives against the available budget. It does not assume that every intervention is appropriate for every building.

**Cost and impact note:** These values are prototype planning estimates. Actual costs, feasibility, maintenance requirements, and expected benefits vary by location, building design, materials, and installation conditions.

---

## Weather Integration

HeatCredit integrates weather context through the [Open-Meteo API](https://open-meteo.com).

### Integration characteristics

- Location-based requests using latitude and longitude.
- Weather retrieval through the backend.
- A configured timeout for external requests.
- Fallback weather data for demo continuity.
- Source attribution in returned weather information.

### Why use a backend proxy?

Routing weather requests through the backend centralizes timeout handling, response formatting, and fallback behavior. It also avoids making the frontend responsible for implementing the application's weather failure-handling logic.

### Weather fallback

The configured fallback dataset is:

[`data/weather-fallback.json`](data/weather-fallback.json)

Fallback data is intended to preserve demonstration and development behavior when live weather retrieval is unavailable. It must not be presented as current observed weather.

### Attribution

Weather data provided by [Open-Meteo](https://open-meteo.com), under the CC BY 4.0 license.

---

## API Reference

The API exposes health, intervention catalogue, weather, assessment, and optimization endpoints.

### Base URL

For local development:

```text
http://localhost:3001
```

For a deployed API, use the API Gateway URL generated by the AWS deployment.

Example format:

```text
https://{API_ID}.execute-api.{REGION}.amazonaws.com/{STAGE}
```

The exact deployed URL depends on the active AWS stack and API configuration.

### 1. Health Check

`GET /health`

Checks whether the API is responding.

Example:

```bash
curl http://localhost:3001/health
```

### 2. Intervention Catalogue

`GET /interventions`

Returns the configured intervention catalogue.

Example:

```bash
curl http://localhost:3001/interventions
```

The response includes intervention data, the catalogue count, currency information, and the configured disclaimer.

### 3. Weather

`GET /weather?lat={latitude}&lon={longitude}`

Retrieves weather context for a location.

Example:

```bash
curl "http://localhost:3001/weather?lat=17.3850&lon=78.4867"
```

The request accepts:

| Parameter | Type | Required | Description |
|---|---|---|---|
| `lat` | Number | Yes | Latitude from -90 to 90 |
| `lon` | Number | Yes | Longitude from -180 to 180 |

The response may include temperature, apparent temperature, humidity, wind speed, cloud cover, precipitation, source status, and attribution, depending on the returned data.

### 4. Create an Assessment

`POST /assessments`

Calculates and stores a building heat-resilience assessment.

Example request:

```bash
curl -X POST "http://localhost:3001/assessments" \
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
    "shadeCoverage": 15,
    "greenCoverage": 10,
    "ventilation": "medium",
    "waterAccess": "poor",
    "reliefSpace": "none"
  }'
```

The response is designed to provide an assessment identifier, score, risk classification, dimensional breakdown, vulnerabilities, and creation timestamp.

Example response shape:

```json
{
  "assessmentId": "ASSESSMENT_ID",
  "score": 62,
  "riskLevel": "moderate",
  "breakdown": {},
  "vulnerabilities": [],
  "createdAt": "TIMESTAMP"
}
```

The values above illustrate the response structure. Actual identifiers, scores, breakdowns, and timestamps are generated by the application.

### 5. Optimize an Assessment

`POST /optimize`

Generates a budget-constrained intervention recommendation for an existing assessment.

Example:

```bash
curl -X POST "http://localhost:3001/optimize" \
  -H "Content-Type: application/json" \
  -d '{
    "assessmentId": "YOUR_ASSESSMENT_ID",
    "budget": 50000
  }'
```

Replace `YOUR_ASSESSMENT_ID` with the identifier returned by the assessment endpoint.

The response is designed to include:

- Assessment and recommendation identifiers.
- Current score and available budget.
- Feasibility status.
- Selected interventions.
- Total estimated cost.
- Total configured impact.
- Projected score.
- Remaining budget.
- Alternative packages, where returned by the implementation.

### Error handling

The API uses HTTP status codes to communicate request failures.

| Status | Meaning |
|---|---|
| `400` | Invalid request or validation failure |
| `404` | Requested assessment not found |
| `503` | A required backend dependency is temporarily unavailable |

Example validation error shape:

```json
{
  "error": "Validation failed.",
  "details": [
    "A request field did not satisfy the expected validation rules."
  ]
}
```

For exact field constraints, response fields, and implementation details, consult:

[`docs/api.md`](docs/api.md)

---

## Project Structure

```text
heatcredit-environmental-hacks-2026/
│
├── apps/
│   └── web/                         # Next.js frontend
│
├── backend/
│   ├── functions/
│   │   ├── health/                  # Health endpoint
│   │   ├── interventions/            # Intervention catalogue API
│   │   ├── weather/                 # Weather proxy and fallback
│   │   ├── assessment/              # Assessment API
│   │   └── optimization/            # Budget optimization API
│   │
│   └── lib/
│       ├── scoring/
│       │   └── scoring.ts           # Weighted scoring engine
│       ├── optimizer/
│       │   └── optimizer.ts         # 0/1 knapsack-style optimizer
│       └── validation/
│           └── validation.ts        # Input validation
│
├── data/
│   ├── interventions.json           # Intervention catalogue
│   ├── demo-buildings.json          # Demo building scenarios
│   └── weather-fallback.json        # Fallback weather snapshot
│
├── tests/
│   ├── scoring/
│   │   └── scoring.test.ts          # Scoring tests
│   ├── optimizer/
│   │   └── optimizer.test.ts        # Optimization tests
│   └── api/
│       └── test-api.sh              # API integration checks
│
├── events/                          # SAM invocation fixtures
│
├── docs/
│   ├── api.md                       # API reference
│   ├── architecture.md              # Architecture documentation
│   ├── scoring-methodology.md       # Scoring specification
│   ├── demo-script.md               # Demonstration guide
│   └── local-development.md         # Development and deployment guide
│
├── .env.example                     # Example configuration, if required
├── .gitignore
├── LICENSE
├── package.json
├── package-lock.json
├── samconfig.toml                   # SAM deployment configuration
├── template.yaml                   # AWS SAM infrastructure
└── README.md
```

This tree summarizes the documented repository layout. Consult the actual files for the current implementation and configuration.

---

## Getting Started

Follow these steps to set up HeatCredit locally.

### Prerequisites

Install the following tools:

| Tool | Requirement | Purpose |
|---|---|---|
| Node.js | Version 20 or compatible supported runtime | Backend tooling |
| npm | Bundled with Node.js | Dependency management |
| Git | Current supported version | Repository access |
| AWS CLI | Required for AWS deployment | AWS authentication and resource access |
| AWS SAM CLI | Required for SAM build/deployment | Infrastructure and local API |
| Docker | Required for standard SAM local execution environments | Local Lambda runtime emulation |

You can develop and run the pure scoring and optimizer tests without deploying the application to AWS. Docker and AWS credentials are needed only for the workflows that use them.

### 1. Clone the repository

```bash
git clone https://github.com/RishvinReddy/heatcredit-environmental-hacks-2026.git

cd heatcredit-environmental-hacks-2026
```

### 2. Install dependencies

```bash
npm ci
```

If you intentionally need to update the lockfile while installing dependencies, use:

```bash
npm install
```

### 3. Run the unit tests

```bash
npm test
```

This executes the scoring and optimizer test scripts defined in `package.json`.

### 4. Build the backend

```bash
npm run build
```

This runs the AWS SAM build command.

### 5. Start the local API

```bash
npm run local:api
```

The local API listens on port `3001` by default.

In another terminal, run:

```bash
npm run test:api:local
```

This invokes the repository's API integration test script against the local API.

**Note:** API integration tests require the local API to be running and the required dependencies to be available.

---

## Local Development

### Frontend

The repository defines a frontend development script:

```bash
npm run dev:web
```

This delegates to the frontend directory and starts its configured Next.js development command.

If the frontend dependencies have not been installed separately, install them first:

```bash
cd apps/web
npm install
npm run dev
```

Use the frontend's configured API base URL to connect it to the local API or a deployed API. The exact environment-variable name should match the frontend implementation.

### Backend unit tests

Run both test suites:

```bash
npm run test:scoring
npm run test:optimizer
```

### Local Lambda invocation

Health function:

```bash
npm run invoke:health
```

Assessment function:

```bash
npm run invoke:assessment
```

Optimization function:

```bash
npm run invoke:optimize
```

These commands use the corresponding event fixtures under `events/`.

### Local development documentation

See [`docs/local-development.md`](docs/local-development.md) for the repository's detailed development and deployment procedures.

---

## Testing and Validation

Testing is important because the scoring engine and optimization engine directly influence the recommendations shown to users.

### Test suites (141 / 141 Passing)

| Suite | Command | Test file | Tests | Status | Scope |
|---|---|---|:---:|:---:|---|
| **Scoring Engine** | `npm run test:scoring` | `tests/scoring/scoring.test.ts` | 32 | ✅ Pass | 7 dimensions, weighting sums, bounds, risk tiers |
| **Budget Optimizer** | `npm run test:optimizer` | `tests/optimizer/optimizer.test.ts` | 24 | ✅ Pass | 0/1 knapsack, budget limits, ₹50k canonical demo |
| **Weather Adapter** | `npm run test:weather` | `tests/weather/weather.test.ts` | 9 | ✅ Pass | Open-Meteo telemetry, timeout & fallback labeling |
| **Warnings Adapter** | `npm run test:warnings` | `tests/warnings/warnings.test.ts` | 21 | ✅ Pass | US NWS alerts, jurisdiction filtering, timestamp logic |
| **Evidence Validation** | `npm run test:evidence` | `tests/evidence/evidence.test.ts` | 24 | ✅ Pass | Provenance verification, completeness score |
| **Input Validation** | `npm run test:validation` | `tests/validation/validation.test.ts` | 31 | ✅ Pass | Schema types, boundary limits, NaN/Infinity rejection |
| **Total Automated** | `npm test` | *All Suites* | **141** | ✅ **141/141** | **100% Pass Rate** |

### Run all automated tests

```bash
npm test
```

See [`docs/TESTING.md`](docs/TESTING.md) for full reproduction evidence and command outputs.

### Run API integration tests locally

Start the API:

```bash
npm run local:api
```

Then, in a separate terminal:

```bash
npm run test:api:local
```

### Run API integration tests against a deployed API

```bash
npm run test:api:deployed
```

Check `tests/api/test-api.sh` for how the deployed API URL is selected and passed to the test script.

### Important validation cases

A robust validation process should cover:

- Valid building inputs.
- Invalid and missing fields.
- Score bounds and risk classification.
- Correct handling of intervention costs.
- Budget constraints.
- Optimality for small, exhaustively enumerable catalogues.
- Equal-impact tie-breaking.
- Projected-score bounds.
- Missing assessments.
- Weather API timeouts and fallback behavior.
- Database failures and API error responses.

The exact test coverage is determined by the implemented test files. Run the tests in the current checkout before reporting a passing test count.

---

## Deployment on AWS

HeatCredit uses AWS SAM for infrastructure deployment.

### 1. Configure AWS credentials

Configure the AWS CLI using your own AWS account and approved credentials:

```bash
aws configure
```

Confirm the active identity:

```bash
aws sts get-caller-identity
```

Verify the intended AWS account and region before creating resources.

### 2. Build the application

From the repository root:

```bash
npm run build
```

### 3. Deploy interactively for the first time

```bash
npm run deploy:guided
```

Review the stack name, region, IAM permissions, and deployment settings before confirming.

### 4. Deploy subsequent changes

```bash
npm run deploy
```

This uses the deployment configuration and defaults defined for the repository and active SAM environment.

### 5. Verify the deployment

After deployment:

1. Retrieve the API Gateway endpoint from the deployment outputs.
2. Call the health endpoint.
3. Verify the intervention catalogue endpoint.
4. Test a valid assessment request.
5. Test optimization using the returned assessment identifier.
6. Inspect CloudWatch logs if a request fails.
7. Confirm that the frontend points to the correct API endpoint.

### Deployment notes

- AWS resources must exist before cloud API requests can succeed.
- The deployment identity needs the appropriate permissions.
- DynamoDB table names, Lambda environment variables, IAM policies, and API routes must match the SAM template.
- Frontend hosting and backend deployment should be verified separately.
- Review the expected charges and configure appropriate budgets or alerts before deploying.

Infrastructure documentation:

- [`template.yaml`](template.yaml)
- [`samconfig.toml`](samconfig.toml)
- [`docs/architecture.md`](docs/architecture.md)
- [`docs/local-development.md`](docs/local-development.md)

---

## Security and Reliability

HeatCredit handles building information and environmental inputs. Its implementation should follow secure engineering practices.

### Input validation

Validate request bodies, numeric ranges, enumerated fields, and identifiers before processing data.

### Least-privilege IAM

Grant each Lambda function only the AWS permissions it needs. For example, a function that only serves the intervention catalogue should not need permission to read assessment records.

### Credential management

- Do not commit AWS access keys, secret tokens, or personal credentials.
- Use AWS CLI profiles or approved AWS identity mechanisms.
- Use environment variables for non-secret configuration.
- Use an appropriate managed secret mechanism if future integrations require secrets.
- Keep local environment files out of version control.

### Error handling

Return suitable HTTP status codes and avoid exposing internal stack traces or sensitive infrastructure details to clients.

### External API resilience

The weather integration uses a bounded request timeout and a fallback snapshot so that a temporary external-service failure does not necessarily prevent a demonstration.

### Observability

CloudWatch logs and monitoring help diagnose backend errors and investigate failed requests.

### Cost awareness

Serverless architecture can reduce idle compute costs, but actual costs depend on service usage, storage, requests, logging, data transfer, and regional pricing.

Review the AWS pricing pages and account billing dashboard rather than assuming every deployment will cost zero.

---

## Demo Scenario

The following scenario illustrates how HeatCredit can be used to evaluate a building and explore a possible intervention package.

**Scenario:** Green Valley School, Hyderabad

| Input | Illustrative value |
|---|---:|
| Occupancy | 350 students |
| Available budget | ₹50,000 |
| Initial Heat Resilience Score | 42 / 100 |
| Initial classification | High Risk |

### Example optimized package

| Intervention | Estimated cost | Configured impact |
|---|---:|---:|
| Shade Structure | ₹25,000 | +11 |
| Drinking Water Station | ₹8,000 | +6 |
| Ventilation Improvement | ₹15,000 | +8 |
| **Total** | **₹48,000** | **+25** |

### Budget calculation

```text
Available budget:       ₹50,000
Estimated spending:     ₹48,000
Remaining budget:        ₹2,000
```

### Score projection

```text
Initial score:          42 / 100
Configured impact:      +25
Projected score:        67 / 100
Projected classification: Moderate
```

This example illustrates the configured scoring and optimization logic. It is not evidence of measured improvements at a real school, a verified construction quotation, or a validated prediction of health outcomes.

### Suggested demonstration sequence

1. Introduce the environmental problem.
2. Enter the building characteristics.
3. Generate the heat-resilience assessment.
4. Explain the score and vulnerability breakdown.
5. Set the available budget.
6. Run the optimization engine.
7. Review the selected interventions and their costs.
8. Explain why the selected package is feasible.
9. Show the AWS architecture and API integration.
10. Conclude with the prototype's limitations and future potential.

A separate demonstration guide is available at [`docs/demo-script.md`](docs/demo-script.md).

---

## Environmental and Social Impact

HeatCredit is intended to support more structured heat-adaptation decisions.

### Potential benefits

**Better-informed planning**

A structured assessment can help decision-makers compare vulnerabilities rather than relying exclusively on informal observations.

**Budget-aware prioritization**

The optimization engine helps explore combinations of interventions when resources are limited.

**Transparent recommendations**

Explicit costs, impact estimates, and constraints make recommendations easier to inspect.

**Adaptability**

The architecture provides a foundation for extending the system to more buildings, additional data sources, and broader planning workflows.

**Accessibility of information**

A web-based interface can make technical assessment outputs easier to communicate to non-specialist decision-makers.

### Measuring impact in future iterations

Potential evaluation metrics include:

- Number of buildings assessed.
- Number of vulnerabilities identified.
- Estimated intervention costs and budget utilization.
- Number of institutions using the recommendations.
- Accuracy of cost estimates against local quotations.
- Agreement between model outputs and expert building assessments.
- Measured changes in indoor temperature following implemented interventions.

These are proposed evaluation measures, not claims of impact already achieved.

---

## Limitations

HeatCredit is an environmental decision-support prototype. Its current methodology has important limitations.

1. **Prototype scoring model:** The score is not calibrated against empirical heat-illness outcomes or validated building-safety standards.
2. **Estimated intervention costs:** Catalogue costs are planning estimates and may differ substantially from local market prices.
3. **Simplified impact model:** Configured intervention impact values are not guaranteed physical improvements.
4. **Single-building workflow:** Portfolio-level assessment and cross-building budget allocation are future enhancements.
5. **Limited building characteristics:** The current model does not comprehensively represent factors such as building age, floor area, detailed orientation, insulation performance, or existing HVAC specifications.
6. **Weather-data dependency:** Live weather retrieval depends on the external service; fallback data is not a substitute for current observations.
7. **Projected scores:** A projected score is a model output, not a guarantee that an intervention package will achieve the stated result.
8. **Local feasibility:** Structural constraints, installation requirements, maintenance costs, water availability, and site-specific conditions need independent assessment.

These limitations should be considered before using HeatCredit for real-world spending or safety decisions.

---

## Future Roadmap

The following roadmap describes potential future development. These items should not be interpreted as already implemented.

### Phase 1 — Core Decision Engine

- Weighted heat-resilience scoring.
- Vulnerability breakdown.
- Intervention catalogue.
- Budget-constrained optimization.
- Weather integration.
- Serverless API and persistence.

### Phase 2 — Portfolio Management

- Multi-building assessments.
- Historical assessment comparison.
- Portfolio-level vulnerability summaries.
- Downloadable reports.
- Assessment version history.

### Phase 3 — Better Environmental Data

- Satellite-derived environmental indicators.
- Urban heat-island context.
- More detailed local intervention pricing.
- Historical weather analysis.
- Improved calibration and validation.

### Phase 4 — Connected Buildings

- IoT temperature and humidity sensors.
- Real-time environmental telemetry.
- Sensor-based validation of modeled conditions.
- Time-series monitoring.

### Phase 5 — Institutional Planning

- Multi-facility budget allocation.
- Institutional dashboards.
- Scenario comparison.
- Long-term resilience planning.
- Expert review and validation workflows.

---

## Hackathon Information

HeatCredit was developed for **Environmental Hacks 2026**, Event 02 of the Bharat Builds Tour.

| Detail | Information |
|---|---|
| Organizer | WeMakeDevs |
| Technology partner | AWS |
| Event dates | October 8–11, 2026 |
| Track | Heat and Water |
| Team | Build Bros |
| Format | Online, with an optional in-person build day |
| In-person venue | Delhi Technological University, Delhi |

### Submission requirements

The hackathon rules specify three core submission components:

1. A public source-code repository.
2. A YouTube demo video of up to three minutes, set to public or unlisted.
3. A concise write-up covering the problem, implementation, and AWS usage.

The project must meet the event's AWS usage requirements, and the demonstration video must show that usage. AI coding tools used during development should be disclosed in the submission write-up.

Refer to the official event materials for the applicable deadline and complete eligibility and submission rules.

- [HeatCredit source repository](https://github.com/RishvinReddy/heatcredit-environmental-hacks-2026)
- [Bharat Builds Tour](https://builder.aws.com/)
- [AWS Free Tier](https://aws.amazon.com/free/)

### Submission assets

- **🚀 Live Application (AWS Amplify):** [https://feature-phase-3-building-evidence.d6yb0i87oun6i.amplifyapp.com/](https://feature-phase-3-building-evidence.d6yb0i87oun6i.amplifyapp.com/)
- **🎬 Demo Video (YouTube):** [https://youtu.be/YSq04cWQ8as](https://youtu.be/YSq04cWQ8as)
- **📝 Project Article (LinkedIn):** [https://lnkd.in/p/gzhSDWzy](https://lnkd.in/p/gzhSDWzy)
- **📂 Source Code Repository:** [https://github.com/RishvinReddy/heatcredit-environmental-hacks-2026](https://github.com/RishvinReddy/heatcredit-environmental-hacks-2026)
- **📑 Full Hackathon Write-Up:** [`docs/HACKATHON_SUBMISSION.md`](docs/HACKATHON_SUBMISSION.md)

---

## Team

### Build Bros — Verified Contributions

| Team Member | Role | Core Contributions |
|---|---|---|
| **Rishvin Reddy** | Project Lead & Fullstack Engineer | System Architecture, AWS SAM Infrastructure, Scoring Engine & 0/1 Knapsack Core, Client-Side Engine Integration. |
| **Pocharam Gayathri** | Environmental Modeling Lead | Vulnerability Dimension Calibration, Weights Balancing, Evidence Provenance Architecture, Scenario Decision Rules. |
| **Guggilla Yogamruth Reddy** | Cloud & Testing Engineer | Serverless API Handlers, DynamoDB Persistence Schemas, Open-Meteo & NWS Alert Adapters, 141 Automated Tests Suite. |
| **Navari Yashwanth Reddy** | Frontend & UI/UX Engineer | Editorial Climate-Tech UI Design, Responsive Workspaces, Recharts Analytics Visualizations, Architecture Canvas. |

---

## AI-Assisted Development Disclosure

In accordance with Environmental Hacks 2026 transparency guidelines, Team Build Bros used **Google Antigravity Agentic IDE** for boilerplate scaffolding, TypeScript interface typing, and CSS layout refactoring. All core mathematical formulas, knapsack logic, AWS CloudFormation declarations, and security boundaries were designed, audited, and verified by the human engineering team. Full disclosure: [`docs/AI_USAGE_AND_CREDITS.md`](docs/AI_USAGE_AND_CREDITS.md).

---

## Contributing

Contributions, issue reports, and technical feedback are welcome.

### Development workflow

1. Fork the repository.
2. Create a feature branch.
3. Implement the change.
4. Run the relevant test suites.
5. Verify that existing behavior remains intact.
6. Submit a pull request describing the change.

Example:

```bash
git checkout -b feature/your-feature

npm ci

npm test

git add .
git commit -m "feat: describe your change"

git push origin feature/your-feature
```

### Contribution guidelines

- Keep scoring rules and optimization logic deterministic.
- Document changes to scoring weights or risk classifications.
- Add tests for new algorithm behavior.
- Avoid introducing unsupported impact or cost claims.
- Preserve input validation and appropriate error handling.
- Never commit credentials or other secrets.
- Update the documentation when API contracts or configuration change.

---

## Acknowledgments

HeatCredit was developed in the context of Environmental Hacks 2026, part of the Bharat Builds Tour.

We acknowledge:

- **WeMakeDevs** for organizing the hackathon.
- **Amazon Web Services** for the cloud platform and development ecosystem.
- **Open-Meteo** for weather-data access.
- The open-source maintainers whose software supports the project's development.

---

## License

This project is distributed under the MIT License.

See [`LICENSE`](LICENSE) for the complete license text.

Third-party libraries, APIs, datasets, and assets remain subject to their respective licenses and terms.

---

## Disclaimer

HeatCredit is a prototype environmental decision-support tool intended for educational, demonstration, and exploratory planning purposes.

Its resilience scores, risk classifications, intervention impacts, cost estimates, and projected outcomes are based on simplified model assumptions. They have not been established as certified building-safety metrics, medical assessments, or guaranteed predictions of real-world intervention effectiveness.

Before implementing interventions, obtain appropriate professional assessments, local cost quotations, and any required engineering or safety approvals.

---

<p align="center">
  <strong>HeatCredit — From heat-risk assessment to budget-aware resilience planning.</strong>
</p>

<p align="center">
  Built for Environmental Hacks 2026 · Bharat Builds Tour · WeMakeDevs × AWS
</p>
