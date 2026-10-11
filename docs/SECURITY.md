# HeatCredit — Security Policy, Safeguards & Threat Model

> **Status:** Prototype Evaluation & Hackathon Showcase
> **Security Baseline:** Principle of Least Privilege, Zero Hardcoded Secrets, Sanitized Serverless Ingress

---

## 1. Secrets Management & Environment Isolation

1. **No Committed Secrets:**
   - The repository explicitly tracks `.env.example` containing only dummy placeholder values.
   - `.gitignore` strictly excludes `.env`, `.env.local`, `.env.production`, `.aws-sam/`, AWS credentials, and private keys.
2. **Environment Variable Injection:**
   - AWS Lambda environment variables (`ASSESSMENTS_TABLE`, `RECOMMENDATIONS_TABLE`, `BUILDINGS_TABLE`) are injected via CloudFormation references in `template.yaml`.
   - Frontend variables (`NEXT_PUBLIC_API_URL`) are injected during AWS Amplify build phase.

---

## 2. Identity & Access Management (IAM Least Privilege)

Each Lambda function is provisioned with a granular, least-privilege IAM execution role:

| Function | IAM Policy Attached | Permitted Resource |
|---|---|---|
| `HealthFunction` | `AWSLambdaBasicExecutionRole` | CloudWatch Logs only |
| `InterventionsFunction` | `AWSLambdaBasicExecutionRole` | CloudWatch Logs only |
| `WeatherFunction` | `AWSLambdaBasicExecutionRole` | CloudWatch Logs only |
| `WarningsFunction` | `AWSLambdaBasicExecutionRole` | CloudWatch Logs only |
| `AssessmentFunction` | `AWSLambdaBasicExecutionRole`<br/>`DynamoDBCrudPolicy` | CloudWatch Logs<br/>`HeatCreditAssessments-{Stage}` table |
| `OptimizationFunction` | `AWSLambdaBasicExecutionRole`<br/>`DynamoDBReadPolicy`<br/>`DynamoDBCrudPolicy` | CloudWatch Logs<br/>Read: `HeatCreditAssessments-{Stage}`<br/>Write: `HeatCreditRecommendations-{Stage}` |

No function is granted admin access, DynamoDB scan permissions across unrelated tables, or access to VPC infrastructure.

---

## 3. Ingress Protection & Schema Sanitization

1. **Strict Type and Boundary Validation:**
   - The validation kernel (`backend/lib/validation/validation.ts`) evaluates all incoming JSON payloads before touching business logic or persistence.
   - Values such as `NaN`, `null`, `Infinity`, and string representations of numbers where primitives are required are immediately rejected with HTTP 400.
   - Numeric inputs are bounded:
     - `occupancy`: $[1, 100000]$
     - `operatingHours`: $[1, 24]$
     - `shadeCoverage`, `greenCoverage`: $[0, 100]$
     - `latitude`: $[-90.0, 90.0]$, `longitude`: $[-180.0, 180.0]$
2. **Sanitized Error Responses:**
   - Internal Lambda stack traces and raw DynamoDB error messages are suppressed in client responses.
   - Clients receive structured error envelopes (`{ "error": "Validation failed.", "details": [...] }`).
3. **NoSQL Injection Resistance:**
   - The application uses the AWS SDK DocumentClient (`@aws-sdk/lib-dynamodb`) with parameterized `PutCommand` and `GetCommand` invocations, preventing NoSQL injection.

---

## 4. Rate Limiting & Denial of Service Safeguards

1. **API Gateway Throttling:**
   - Global rate limiting is enforced on all API Gateway stages:
     - **Steady-State Rate Limit:** 100 requests per second.
     - **Burst Limit:** 50 requests.
2. **External Provider Egress Guardrails:**
   - Both `WeatherFunction` and `WarningsFunction` enforce strict **5-second socket timeouts** via `AbortController`.
   - External provider failures do not hang Lambda executions or exhaust compute concurrency.

---

## 5. Data Privacy & PII Minimization

- **No Personal Data Collected:** HeatCredit scores physical structures, not human individuals.
- **Anonymous Identifiers:** Facility evaluations generate random UUID/hash strings (e.g., `HC-LGH73K2A-4R9X`).
- **No User Tracking:** No third-party ad trackers, tracking cookies, or biometric profiling tools are deployed.
- **30-Day TTL:** Assessment records in DynamoDB automatically expire after 30 days via native DynamoDB Time-To-Live.

---

## 6. Threat Model & Known Security Limitations

| Threat Vector | Mitigation Strategy | Current Prototype Limitation |
|---|---|---|
| **Public Unauthenticated Abuse** | API Gateway throttling (100 req/s) | No user login / API key requirement. In a production release, AWS Cognito would be integrated. |
| **Tampered Evidence Metadata** | Automated provenance constraints (e.g., `user_estimated` cannot be marked `verified`) | No digital signature verification of architectural documents. |
| **External Weather Provider Outage** | Automated regional fallback baseline with `"isDemo": true` labeling | Fallback data provides planning approximation, not real-time telemetry. |
| **Excessive Log Ingestion Costs** | CloudWatch log group retention capped at 7 days | No automated log shipping to external SIEM. |

---

## 7. Responsible Disclosure

If you identify a security vulnerability in HeatCredit, please report it directly to the repository maintainers via GitHub Issues (flagged as Security) or contact team members listed in the project credits.
