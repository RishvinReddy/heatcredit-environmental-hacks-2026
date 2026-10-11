# HeatCredit — Hackathon Submission Write-Up

> **Event:** Environmental Hacks 2026 — Event 02 of Bharat Builds Tour
> **Organizer:** WeMakeDevs
> **Cloud Platform Partner:** Amazon Web Services (AWS)
> **Track:** Track 02 — Heat & Water
> **Team Name:** Build Bros
> **Team Members:** Rishvin Reddy, Pocharam Gayathri, Guggilla Yogamruth Reddy, Navari Yashwanth Reddy
> **Repository:** [https://github.com/RishvinReddy/heatcredit-environmental-hacks-2026](https://github.com/RishvinReddy/heatcredit-environmental-hacks-2026)
> **Live Application (AWS Amplify):** [https://feature-phase-3-building-evidence.d6yb0i87oun6i.amplifyapp.com/](https://feature-phase-3-building-evidence.d6yb0i87oun6i.amplifyapp.com/)
> **Demo Video (YouTube):** [https://youtu.be/YSq04cWQ8as](https://youtu.be/YSq04cWQ8as)
> **Technical Article (LinkedIn):** [https://lnkd.in/p/gzhSDWzy](https://lnkd.in/p/gzhSDWzy)
> **License:** MIT License

---

## 1. Executive Summary & Product Statement

> **“Measure heat risk. Optimize resilience. Act within budget.”**

Heatwaves are an urgent public health crisis across the Global South and urban centers worldwide. While weather applications provide ambient air temperature forecasts, they provide zero insight into **facility-level vulnerability**. A school with an uninsulated metal roof and no outdoor shade faces acute heat stress under conditions that an insulated, shaded facility can easily weather.

**HeatCredit** is an AWS-powered serverless environmental decision engine that transforms facility vulnerability assessments into explainable, budget-aware resilience intervention roadmaps. By uniting deterministic physical scoring with 0/1 knapsack combinatorial capital allocation, HeatCredit enables school headmasters, hospital administrators, and municipal resilience planners to maximize resilience lift per rupee invested.

---

## 2. Target Users & Real-World Use Cases

1. **School Administrators & PTAs:** Prioritize summer retrofit works (e.g., shade sails, water filtration dispensers) using small municipal or community grants (₹25,000–₹50,000).
2. **Primary Healthcare Centers:** Identify acute cooling deficits in patient waiting areas and deploy high-albedo roof coatings and dedicated cool rooms.
3. **Urban Resilience Officers:** Standardize vulnerability assessments across municipal building portfolios, generating audit-ready decision sheets for budget allocation committees.

---

## 3. Technical Implementation & Architecture

HeatCredit is engineered from the ground up as a cloud-native serverless system on AWS:

```
[ Browser / Next.js SPA ]
           │  HTTPS
           ▼
[ AWS Amplify / CloudFront CDN ]
           │
           ▼
[ Amazon API Gateway (HTTP API Regional ap-south-1) ]
           │
           ├─► Lambda: GET  /health           (Liveness & version)
           ├─► Lambda: GET  /interventions    (Catalogue JSON)
           ├─► Lambda: GET  /weather          (Open-Meteo proxy + 5s timeout)
           ├─► Lambda: GET  /warnings         (US NWS official hazards adapter)
           ├─► Lambda: POST /assessments      (Validation + Scoring + DynamoDB)
           └─► Lambda: POST /optimize         (0/1 Knapsack + DynamoDB)
                      │
                      ▼
[ Amazon DynamoDB (Pay-Per-Request, 30-Day TTL) ]
  ├── HeatCreditAssessments-prod
  ├── HeatCreditRecommendations-prod
  └── HeatCreditBuildings-prod
           │
           ▼
[ Amazon CloudWatch ]
  ├── Log Groups (/aws/lambda/*) [7-day retention]
  └── Alarm: Lambda Errors >= 5 / 5min
```

### AWS Services Utilized & Why
1. **AWS Lambda (arm64 Graviton, Node.js 24.x):** Sub-second execution, zero idle cost, and a low execution carbon footprint.
2. **Amazon API Gateway (HTTP API):** Low-latency, cost-effective API routing with built-in rate limiting (100 req/s) and CORS management.
3. **Amazon DynamoDB:** Fully managed NoSQL database with on-demand (pay-per-request) billing and native 30-day TTL data retention policies.
4. **AWS Amplify Hosting:** Monorepo continuous deployment connected to GitHub, distributing static assets via AWS Global CloudFront edge points.
5. **Amazon CloudWatch:** Comprehensive telemetry with automated 7-day log retention to prevent storage cost creep and alarms for error surges.
6. **AWS SAM (Serverless Application Model):** Declarative, reproducible Infrastructure as Code (`template.yaml`) enabling one-command stack deployment.

---

## 4. Key Scientific & Algorithmic Features

### 4.1 The 7-Dimension Scoring Engine
The Heat Resilience Score ($0 \text{ to } 100$) deterministically evaluates seven physical and operational dimensions:
1. **Thermal Protection (25 pts):** Roof type (60%) and condition (40%).
2. **Shade Coverage (15 pts):** Outdoor gathering canopy percentage.
3. **Ventilation (15 pts):** Natural convective airflow rating.
4. **Water Access (15 pts):** Dedicated drinking water infrastructure.
5. **Cooling / Relief Capacity (15 pts):** Dedicated cool recovery space.
6. **Green Infrastructure (10 pts):** Evapotranspirative vegetative cover.
7. **Occupancy Exposure (5 pts):** Inverted human exposure factor.

### 4.2 Deterministic 0/1 Knapsack Capital Optimizer
Given $n = 6$ physical interventions, the engine evaluates all $2^6 = 64$ combinations via bitmask enumeration in under 1ms:
- Solves $\max \sum b_i x_i$ subject to $\sum c_i x_i \le \text{Budget}$.
- Incorporates deterministic tie-breaking (prefers lower cost for identical benefit).
- Produces 3 alternative packages for multi-scenario trade-off evaluation.

### 4.3 Data Provenance & Trust Classification
Every building input tracks whether it was `measured`, `building_document`, `owner_reported`, or `user_estimated`. HeatCredit computes an explicit **Evidence Completeness Score (0–100%)** alongside the resilience score, ensuring transparent decision-making.

---

## 5. Verifiable Reproducible Results

The benchmark scenario is fully reproducible via automated tests and manual walkthrough:
- **Facility:** Green Valley School, Hyderabad (`demo-school-hyderabad`)
- **Baseline Score:** **42 / 100** (High Risk)
- **Top Vulnerabilities:** Shade Deficit (3.8/15), Relief Space (4.5/15), Water Access (4.5/15)
- **Capital Budget:** **₹50,000**
- **Selected Package:**
  1. Shade Structure: ₹25,000 (+11 pts)
  2. Ventilation Improvement: ₹15,000 (+8 pts)
  3. Drinking Water Station: ₹8,000 (+6 pts)
- **Deployed Capital:** **₹48,000** (Capital Reserve Remaining: **₹2,000**)
- **Projected Score Lift:** **+25 points** (Score moves from **42 to 67**, transitioning facility from High Risk to Moderate Resilience).

---

## 6. Engineering Evidence & Testing

- **141 / 141 Passing Automated Tests:**
  - `test:scoring`: 32 tests (Dimension formulas, weighting sums, bounds).
  - `test:optimizer`: 24 tests (0/1 knapsack, budget limits, ₹50k demo).
  - `test:weather`: 9 tests (Open-Meteo telemetry & fallback labeling).
  - `test:warnings`: 21 tests (NWS alerts, jurisdiction restrictions).
  - `test:evidence`: 24 tests (Provenance rules, completeness metrics).
  - `test:validation`: 31 tests (Schema, NaN/Infinity, bounds).
- **Frontend Production Build:** Next.js 16.4.0 cleanly compiles 16/16 routes with 0 errors.

---

## 7. AI Usage Disclosure & Ethics

Team Build Bros utilized **Google Antigravity Agentic IDE** for boilerplate scaffolding, TypeScript interface typing, and CSS layout refactoring. All core mathematical formulas, knapsack logic, AWS CloudFormation declarations, and security boundaries were designed, audited, and verified by the human team.

---

## 8. Limitations & Future Roadmap

- **Prototype Disclaimer:** HeatCredit is a decision-support prototype. It does not certify building safety or diagnose clinical outcomes.
- **Dynamic Microclimate Coupling:** Future iterations will integrate indoor IoT temperature/humidity loggers.
- **Expanded Warning Feeds:** Integration with India Meteorological Department (IMD) APIs when public endpoints become available.
- **Municipal Portfolio Allocation:** Solving multi-facility knapsack problems across city districts.
