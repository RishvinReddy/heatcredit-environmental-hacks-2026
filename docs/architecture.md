# HeatCredit — Architecture

## Overview

HeatCredit is a fully serverless application deployed on AWS.

```
Browser (Next.js SPA)
        ↓  HTTPS
AWS Amplify (hosting + CI/CD)
        ↓
Amazon API Gateway (HTTP API)
        ↓
AWS Lambda
  ├── GET  /health           → 200 OK
  ├── GET  /interventions    → Catalogue JSON
  ├── GET  /weather          → Open-Meteo proxy + fallback
  ├── POST /assessments      → Scoring engine → DynamoDB
  └── POST /optimize         → Optimizer → DynamoDB
        ↓
Amazon DynamoDB
  ├── HeatCreditAssessments
  └── HeatCreditRecommendations
        ↓
Amazon CloudWatch
  └── Logs + alarms
```

---

## Components

### Frontend — Next.js on AWS Amplify

- Next.js 14+ App Router
- TypeScript, Tailwind CSS, shadcn/ui, Recharts, Lucide
- Deployed via `amplify push` or GitHub CI/CD integration
- Six screens: Landing → Assessment → Result → Intervention Lab → Budget Optimizer → Report

### API — Amazon API Gateway (HTTP API)

- HTTP API type (lower cost and latency than REST API for this use case)
- CORS configured for Amplify domain
- Routes map 1:1 to Lambda functions

### Backend — AWS Lambda

| Function       | Trigger              | Purpose                                 |
|---------------|----------------------|-----------------------------------------|
| health         | GET /health          | Liveness check                          |
| interventions  | GET /interventions   | Serve catalogue from bundled JSON       |
| weather        | GET /weather         | Open-Meteo proxy with 5s timeout + fallback |
| assessment     | POST /assessments    | Validate → Score → Persist → Return     |
| optimization   | POST /optimize       | Load score → Optimize → Persist → Return |

All functions are TypeScript, compiled to CommonJS for Node.js 20.x runtime.

### Database — Amazon DynamoDB

Three tables (on-demand billing):

| Table                          | Partition Key      | Contents                      |
|--------------------------------|--------------------|-------------------------------|
| HeatCreditAssessments          | assessmentId (S)   | Building input + score + breakdown |
| HeatCreditRecommendations      | recommendationId (S) | Optimizer result per assessment |

Interventions are served from bundled JSON — no DB query needed.

### Monitoring — Amazon CloudWatch

- Lambda invocation logs
- Error rate alarms
- Cost budget alerts configured on Day 1

---

## Data flows

### Assessment flow

```
Browser
  → POST /assessments { buildingInput }
  → API Gateway
  → Lambda:assessment
      1. Parse + validate input
      2. Call scoreBuilding(input)
      3. Generate assessmentId
      4. PutItem → HeatCreditAssessments
      5. Return { assessmentId, score, riskLevel, breakdown, vulnerabilities }
  → Browser renders score dashboard
```

### Optimization flow

```
Browser
  → POST /optimize { assessmentId, budget }
  → API Gateway
  → Lambda:optimization
      1. Parse + validate input
      2. GetItem(assessmentId) → HeatCreditAssessments
      3. Load INTERVENTIONS from bundled JSON
      4. Call optimize({ currentScore, budget, interventions })
         → Enumerate 2^6 = 64 combinations
         → Select optimal by max impact within budget
      5. PutItem → HeatCreditRecommendations
      6. Return { selectedInterventions, totalCost, projectedScore, ... }
  → Browser renders recommendation
```

### Weather flow

```
Browser
  → GET /weather?lat=17.385&lon=78.4867
  → API Gateway
  → Lambda:weather
      1. fetchOpenMeteo(lat, lon) with 5s timeout
         → Success: return live data
         → Failure: load weather-fallback.json[default]
      2. Return { temperature, apparentTemperature, humidity, windSpeed, ... }
  → Browser renders weather widget
```

---

## IAM policy (least privilege)

Each Lambda function has its own execution role with only the permissions it needs:

| Function      | DynamoDB permissions              |
|---------------|-----------------------------------|
| assessment    | PutItem on HeatCreditAssessments  |
| optimization  | GetItem on HeatCreditAssessments, PutItem on HeatCreditRecommendations |
| health        | None                              |
| interventions | None                              |
| weather       | None                              |

No hardcoded credentials. All secrets via environment variables.

---

## Cost estimate (hackathon scale)

| Service     | Expected usage          | Free Tier                    |
|-------------|-------------------------|------------------------------|
| Lambda      | < 10,000 invocations    | 1M req/mo free               |
| API Gateway | < 10,000 calls          | 1M calls/mo (first 12 months)|
| DynamoDB    | < 100 reads/writes      | 25 GB storage free           |
| Amplify     | Static hosting          | 5 GB storage / 15 GB transfer|
| CloudWatch  | Basic logging           | 5 GB ingestion free          |

**Expected cost for hackathon demo: $0**

---

## Resilience design

| Failure              | Response                                           |
|---------------------|----------------------------------------------------|
| Open-Meteo down     | Lambda returns fallback demo weather snapshot      |
| DynamoDB write fails | Assessment result returned with warning header    |
| DynamoDB read fails  | Lambda returns 503 with retry message             |
| Invalid input        | 400 with specific field-level validation errors   |
| Empty budget         | feasible=false with minimum budget guidance       |

---

## Why serverless

- Zero idle cost (Lambda charges only on invocation)
- No server management
- Auto-scales to any demo traffic
- Native AWS Amplify integration
- Demonstrably uses AWS — not just hosted on it
