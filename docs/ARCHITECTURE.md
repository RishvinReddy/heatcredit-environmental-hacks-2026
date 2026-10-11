# HeatCredit — System Architecture & Infrastructure

> **Product:** HeatCredit — Heat Resilience Decision Engine
> **Repository:** [GitHub: RishvinReddy/heatcredit-environmental-hacks-2026](https://github.com/RishvinReddy/heatcredit-environmental-hacks-2026)
> **Cloud Provider:** Amazon Web Services (AWS)
> **Region:** `ap-south-1` (Asia Pacific - Mumbai)
> **IaC Framework:** AWS Serverless Application Model (SAM) `template.yaml`

---

## 1. System Overview & Context

HeatCredit is designed as a cloud-native, serverless decision-support platform. The architecture separates presentation logic from deterministic computational kernels and persistence layers.

### Diagram 1: System Context Diagram

```mermaid
graph TD
    User["Facility Operator / Resilience Planner"]

    subgraph ClientLayer["Client & Edge Layer"]
        Browser["Next.js Web Client (SPA / App Router)"]
        Amplify["AWS Amplify Hosting (CloudFront CDN)"]
    end

    subgraph APILayer["API & Ingress Layer"]
        APIGateway["Amazon API Gateway (HTTP API Regional)"]
    end

    subgraph ComputeLayer["Serverless Compute (AWS Lambda Node.js 24.x)"]
        HealthFn["HealthFunction (GET /health)"]
        CatalogueFn["InterventionsFunction (GET /interventions)"]
        WeatherFn["WeatherFunction (GET /weather)"]
        WarningsFn["WarningsFunction (GET /warnings)"]
        AssessFn["AssessmentFunction (POST /assessments, GET /assessments/{id})"]
        OptimizeFn["OptimizationFunction (POST /optimize)"]
    end

    subgraph StorageLayer["Persistence & Telemetry"]
        DDB_Assess["DynamoDB: HeatCreditAssessments-prod"]
        DDB_Recs["DynamoDB: HeatCreditRecommendations-prod"]
        DDB_Bldgs["DynamoDB: HeatCreditBuildings-prod"]
        CW_Logs["Amazon CloudWatch Logs & Alarms"]
    end

    subgraph ExternalFeeds["External Environmental Providers"]
        OpenMeteo["Open-Meteo API (Live Weather Telemetry)"]
        NWS["US National Weather Service API (Heat Alerts)"]
    end

    User --> Browser
    Browser <--> Amplify
    Browser -->|HTTPS REST| APIGateway

    APIGateway --> HealthFn
    APIGateway --> CatalogueFn
    APIGateway --> WeatherFn
    APIGateway --> WarningsFn
    APIGateway --> AssessFn
    APIGateway --> OptimizeFn

    WeatherFn -.->|HTTPS GET 5s Timeout| OpenMeteo
    WarningsFn -.->|HTTPS GET 5s Timeout| NWS

    AssessFn -->|PutItem / GetItem| DDB_Assess
    AssessFn -.->|Scan / Query| DDB_Bldgs
    OptimizeFn -->|GetItem| DDB_Assess
    OptimizeFn -->|PutItem| DDB_Recs

    ComputeLayer --> CW_Logs
```

---

## 2. Component Responsibilities

### 2.1 Frontend (`apps/web`)
- **Technology:** Next.js 16.4.0 (Turbopack, App Router), React 19, TypeScript, Tailwind CSS, shadcn/ui primitives, Framer Motion, Recharts.
- **Hosting:** AWS Amplify Hosting with continuous integration from GitHub `main`.
- **Primary Routes:**
  - `/` — Editorial Landing Page & Product Introduction.
  - `/overview` — Interactive Facility Resilience Hub & Portfolio Browser.
  - `/assessment` — 11-Factor Facility Intake Form with Evidence Metadata.
  - `/intelligence` — Environmental Risk Analytics & Vulnerability Matrix.
  - `/interventions` — 6-Item Adaptation Catalogue with Rupee Cost Modeling.
  - `/optimizer` & `/optimizer/[id]` — Capital Allocation Lab (0/1 Knapsack Engine).
  - `/scenarios` — Side-by-side Strategy Comparison Studio.
  - `/report` & `/report/[id]` — Printable Executive Decision Sheets.
  - `/methodology` — Transparent Breakdown of 7 Dimensions and Weights.
  - `/architecture` — Interactive System Topology & Infrastructure Canvas.

### 2.2 API & Ingress (`template.yaml`)
- **Technology:** Amazon API Gateway (HTTP API, OpenApiVersion 3.0.1).
- **Endpoint Configuration:** `REGIONAL` (`ap-south-1`).
- **Throttling & Rate Limiting:** Burst limit: 50 req, Rate limit: 100 req/sec.
- **CORS:** Configured for all standard origins with explicit preflight handling (`OPTIONS` handlers on all routes).

### 2.3 Serverless Compute (AWS Lambda)
- **Runtime:** `nodejs24.x` on `arm64` architecture (AWS Graviton) for superior price-performance and reduced execution carbon footprint.
- **Build Method:** `esbuild` target `es2022`, bundled into lightweight, zero-dependency deployment packages.
- **Timeout & Memory:** 15s timeout (10s for external weather/warnings), 256MB memory.

| Lambda Function | Handler Path | Route | DynamoDB Policies |
|---|---|---|---|
| `HealthFunction` | `backend/functions/health/index.ts` | `GET /health` | Basic execution only |
| `InterventionsFunction` | `backend/functions/interventions/index.ts` | `GET /interventions` | Basic execution only |
| `WeatherFunction` | `backend/functions/weather/index.ts` | `GET /weather` | Basic execution only |
| `WarningsFunction` | `backend/functions/warnings/index.ts` | `GET /warnings` | Basic execution only |
| `AssessmentFunction` | `backend/functions/assessment/index.ts` | `POST /assessments`<br/>`GET /assessments/{id}` | `DynamoDBCrudPolicy` on `AssessmentsTable` |
| `OptimizationFunction` | `backend/functions/optimization/index.ts` | `POST /optimize` | `DynamoDBReadPolicy` on `AssessmentsTable`<br/>`DynamoDBCrudPolicy` on `RecommendationsTable` |

---

## 3. Request & Sequence Flows

### Diagram 2: Frontend-to-Backend Request Flow

```mermaid
sequenceDiagram
    autonumber
    actor Client as Browser Client
    participant GW as Amazon API Gateway
    participant Lambda as AWS Lambda Handlers
    participant DDB as Amazon DynamoDB
    participant Ext as External Weather / Warning APIs

    Client->>GW: POST /assessments (JSON Payload)
    GW->>Lambda: Route to AssessmentFunction
    Lambda->>Lambda: Validate schema & evidence completeness
    Lambda->>Lambda: Calculate 7-dimension score (0-100)
    Lambda->>DDB: PutItem (HeatCreditAssessments-prod)
    DDB-->>Lambda: PutItem OK
    Lambda-->>GW: HTTP 201 Created (assessmentId, score, breakdown)
    GW-->>Client: Return Assessment Result

    opt User Inquires Weather & Warnings
        Client->>GW: GET /weather?lat=17.385&lon=78.4867
        GW->>Lambda: Route to WeatherFunction
        Lambda->>Ext: GET api.open-meteo.com (5s timeout)
        Ext-->>Lambda: Live Temperature & Humidity
        Lambda-->>Client: Live Observation (isDemo: false)
    end
```

### Diagram 3: Assessment and Scoring Sequence

```mermaid
sequenceDiagram
    autonumber
    participant UI as Facility Form UI
    participant Handler as backend/functions/assessment
    participant Val as backend/lib/validation
    participant Engine as backend/lib/scoring
    participant DDB as DynamoDB (AssessmentsTable)

    UI->>Handler: Submit Facility Input (11 Attributes + Evidence)
    Handler->>Val: validateBuildingInput(input)
    alt Validation Failure
        Val-->>Handler: Validation Errors (NaN, Out-of-bounds, etc.)
        Handler-->>UI: HTTP 400 Bad Request (Field details)
    else Validation Success
        Val-->>Handler: Validated DTO
        Handler->>Engine: scoreBuilding(validatedInput)
        Engine->>Engine: Thermal Protection (Roof type 60% + condition 40%) * 25
        Engine->>Engine: Shade Coverage (shade% / 100) * 15
        Engine->>Engine: Ventilation Level factor * 15
        Engine->>Engine: Water Access Level factor * 15
        Engine->>Engine: Relief Capacity Level factor * 15
        Engine->>Engine: Green Infrastructure (green% / 100) * 10
        Engine->>Engine: Exposure Inversion (1 - riskFactor) * 5
        Engine->>Engine: Sum & Clamp to [0, 100], Classify Risk
        Engine-->>Handler: ScoringResult (score, breakdown, vulnerabilities)
        Handler->>DDB: PutItem with TTL (30 days)
        Handler-->>UI: HTTP 201 Response (assessmentId, score, metadata)
    end
```

### Diagram 4: Budget Optimization Sequence

```mermaid
sequenceDiagram
    autonumber
    participant UI as Optimizer UI
    participant Handler as backend/functions/optimization
    participant DDB_A as DynamoDB (AssessmentsTable)
    participant OptEngine as backend/lib/optimizer
    participant DDB_R as DynamoDB (RecommendationsTable)

    UI->>Handler: POST /optimize { assessmentId, budget }
    Handler->>DDB_A: GetItem(assessmentId)
    alt Assessment Not Found
        DDB_A-->>Handler: null
        Handler-->>UI: HTTP 404 Assessment Not Found
    else Assessment Found
        DDB_A-->>Handler: Assessment Record (currentScore)
        Handler->>OptEngine: optimize({ currentScore, budget, interventions })
        OptEngine->>OptEngine: Enumerate 2^n packages (bitmask 1 to 2^6 - 1)
        OptEngine->>OptEngine: Filter packages where totalCost <= budget
        OptEngine->>OptEngine: Select optimal: max totalImpact (tie-break: min cost)
        OptEngine->>OptEngine: Build 3 alternative option packages
        OptEngine-->>Handler: OptimizationResult
        Handler->>DDB_R: PutItem (recommendationId, selected, projectedScore)
        Handler-->>UI: HTTP 200 OK (selectedInterventions, projectedScore, remainingBudget)
    end
```

### Diagram 5: Data Provenance Flow

```mermaid
graph TD
    subgraph DataSources["Data Intake Streams"]
        A["Sensor Measurement"] -->|sourceCategory: measured| P["Provenance Validator"]
        B["Architectural Blueprint"] -->|sourceCategory: building_document| P
        C["Facility Manager Survey"] -->|sourceCategory: owner_reported| P
        D["User Estimate"] -->|sourceCategory: user_estimated| P
        E["Legacy Assessment Record"] -->|Lacks provenance| P
    end

    subgraph TrustRules["Provenance Verification Engine"]
        P --> V1{"Is user_estimated?"}
        V1 -- Yes --> S1["Status: unverified (Cannot be verified)"]
        V1 -- No --> V2{"Is owner_reported?"}
        V2 -- Yes --> V3{"Has valid verifierMetadata?"}
        V3 -- Yes --> S2["Status: verified (1.0 pt)"]
        V3 -- No --> S3["Status: unverified (0.5 pt)"]
        V2 -- No --> S4["Status: verified (1.0 pt)"]
        E --> S5["Status: legacy_unverified (0.0 pt)"]
    end

    subgraph CompletenessScore["Evidence Completeness Metric"]
        S1 --> CALC["Sum 9 fields / 9.0 max"]
        S2 --> CALC
        S3 --> CALC
        S4 --> CALC
        S5 --> CALC
        CALC --> OUT["Evidence Completeness Score (0-100%)"]
    end
```

---

## 4. AWS Deployment Topology

### Diagram 6: AWS Deployment Topology

```mermaid
graph LR
    subgraph Edge["AWS Global Infrastructure"]
        CF["AWS Amplify Edge (Global CDN)"]
    end

    subgraph VPC_Free["AWS Serverless Cloud (Region: ap-south-1)"]
        APIGW["Amazon API Gateway<br/>(HTTP API Regional)"]

        subgraph Lambdas["AWS Lambda (arm64, Node.js 24.x)"]
            L1["heatcredit-health-prod"]
            L2["heatcredit-interventions-prod"]
            L3["heatcredit-weather-prod"]
            L4["heatcredit-warnings-prod"]
            L5["heatcredit-assessment-prod"]
            L6["heatcredit-optimization-prod"]
        end

        subgraph Storage["Amazon DynamoDB (Pay-Per-Request)"]
            T1[("HeatCreditAssessments-prod<br/>Hash: assessmentId<br/>TTL: 30 days")]
            T2[("HeatCreditRecommendations-prod<br/>Hash: recommendationId<br/>TTL: 30 days")]
            T3[("HeatCreditBuildings-prod<br/>Hash: buildingId")]
        end

        subgraph Monitoring["Amazon CloudWatch"]
            LG["Log Groups (/aws/lambda/*)<br/>Retention: 7 Days"]
            ALARM["Alarm: Lambda Errors >= 5 / 5 min"]
        end
    end

    CF -->|HTTPS| APIGW
    APIGW --> L1
    APIGW --> L2
    APIGW --> L3
    APIGW --> L4
    APIGW --> L5
    APIGW --> L6

    L5 -->|PutItem / GetItem| T1
    L5 -.->|Scan / Query| T3
    L6 -->|GetItem| T1
    L6 -->|PutItem| T2

    Lambdas --> LG
    LG --> ALARM
```

---

## 5. Security Boundaries & Trust Zones

1. **Client / Browser Boundary:**
   - Unauthenticated public evaluation portal. All client inputs are considered untrusted and subject to strict server-side JSON schema validation.
2. **API Ingress Boundary:**
   - Protected by API Gateway throttling limits (100 req/sec rate limit, 50 burst).
   - Strict CORS configuration preventing malicious cross-site scripting.
3. **Compute Execution Boundary:**
   - Least-privilege IAM roles: each Lambda function possesses only the minimal necessary DynamoDB permissions (`DynamoDBReadPolicy` or `DynamoDBCrudPolicy`).
   - Node.js 24.x runtime isolation with no local disk persistence beyond `/tmp`.
4. **Data Persistence Boundary:**
   - DynamoDB tables configured with encryption at rest using AWS managed keys (KMS).
   - TTL (Time-To-Live) enabled on ephemeral assessment records (30 days) to prevent unbounded data retention and unnecessary storage charges.

---

## 6. Operational Resilience & Fallback Policies

- **External Provider Outages:** If Open-Meteo or NWS APIs timeout (>5s) or return HTTP 5xx errors, the backend gracefully catches the exception, logs to CloudWatch, and returns an explicit `isDemo: true` fallback payload or `status: "unavailable"` without crashing the client assessment.
- **Cost Guardrails:** CloudWatch log groups are strictly enforced with a **7-day retention policy** to prevent unexpected storage creep. Lambda error alarms alert on unexpected invocation failures.
