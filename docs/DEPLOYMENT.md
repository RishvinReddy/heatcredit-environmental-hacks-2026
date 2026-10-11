# HeatCredit — AWS Deployment & Infrastructure Guide

> **Target Cloud:** Amazon Web Services (AWS)
> **Primary Region:** `ap-south-1` (Asia Pacific - Mumbai)
> **Infrastructure as Code:** AWS SAM (`template.yaml`, `samconfig.toml`)
> **Frontend Hosting:** AWS Amplify Hosting (`buildspec.yml`)
>
> ⚠️ **COST & SAFETY NOTICE:** Do not run deployment commands with elevated credentials unless authorized. Always review CloudFormation change sets before deploying. All resources in HeatCredit are designed to operate strictly within the **AWS Free Tier**.

---

## 1. Architecture Deployment Overview

HeatCredit uses a dual-tier deployment model:
1. **Serverless Backend (AWS SAM):** Deploys API Gateway (HTTP API), 6 Lambda functions (`arm64`), 3 DynamoDB on-demand tables, CloudWatch log groups with 7-day retention, and error alarms.
2. **Frontend (AWS Amplify):** Automatically builds and serves the Next.js App Router application via AWS Global CloudFront edge network.

---

## 2. Prerequisites & Tooling

Install the following utilities on your local workstation:

1. **AWS CLI v2:** [AWS CLI Installation Guide](https://docs.aws.amazon.com/cli/latest/userguide/getting-started-install.html)
2. **AWS SAM CLI:** [SAM CLI Installation Guide](https://docs.aws.amazon.com/serverless-application-model/latest/developerguide/install-sam-cli.html)
3. **Docker Desktop:** (Required only for `sam local start-api` or containerized builds).
4. **Node.js 20+ & npm 10+:**

Configure credentials:
```bash
aws configure
# AWS Access Key ID: [YOUR_ACCESS_KEY]
# AWS Secret Access Key: [YOUR_SECRET_KEY]
# Default region name: ap-south-1
# Default output format: json
```

Verify identity:
```bash
aws sts get-caller-identity
```

---

## 3. Backend Deployment (AWS SAM)

### Step 3.1: Validate SAM Template
Validate syntax and IAM configurations against AWS CloudFormation standards:
```bash
sam validate --lint
```

### Step 3.2: Build Lambda Packages
Compiles TypeScript handlers using `esbuild` into `.aws-sam/build`:
```bash
sam build
```

Expected output:
```
Build Succeeded
Built Artifacts  : .aws-sam/build
Built Template   : .aws-sam/build/template.yaml
```

### Step 3.3: First-Time Guided Deployment
```bash
sam deploy --guided
```

Configuration Prompts:
- **Stack Name:** `heatcredit-prod`
- **AWS Region:** `ap-south-1`
- **Parameter Stage:** `prod`
- **Confirm changes before deploy:** `Y`
- **Allow SAM CLI IAM role creation:** `Y`
- **Disable rollback for debugging:** `N`
- **Save arguments to configuration file:** `Y` (writes to `samconfig.toml`)

### Step 3.4: Subsequent Deploys
For subsequent updates, run:
```bash
sam deploy
```

### Step 3.5: Capture Outputs
After successful deployment, SAM outputs provide the API Gateway URL:
```
CloudFormation outputs from deployed stack
-------------------------------------------------------------------------------------------------
Outputs
-------------------------------------------------------------------------------------------------
Key                 ApiUrl
Description         API Gateway endpoint URL
Value               https://a1b2c3d4e5.execute-api.ap-south-1.amazonaws.com/prod

Key                 AssessmentsTableName
Value               HeatCreditAssessments-prod
-------------------------------------------------------------------------------------------------
```

---

## 4. Frontend Deployment (AWS Amplify)

### Monorepo Build Specification
The root [`buildspec.yml`](file:///c:/Users/EikoMotsu/OneDrive/Documents/Desktop/HeatCredit/buildspec.yml) configures the automated CI/CD pipeline on AWS Amplify:

```yaml
version: 1
frontend:
  phases:
    preBuild:
      commands:
        - cd apps/web
        - npm ci
    build:
      commands:
        - npm run build
  artifacts:
    baseDirectory: apps/web/.next
    files:
      - '**/*'
  cache:
    paths:
      - apps/web/node_modules/**/*
      - apps/web/.next/cache/**/*
```

### Environment Variable Configuration in Amplify Console
1. Navigate to **AWS Amplify Console** → **App settings** → **Environment variables**.
2. Add:
   - `NEXT_PUBLIC_API_URL`: `https://{YOUR_API_ID}.execute-api.ap-south-1.amazonaws.com/prod`
   - `NEXT_PUBLIC_APP_ENV`: `production`

---

## 5. DynamoDB Configuration & Policies

All tables use **Pay-Per-Request (On-Demand)** billing to ensure $0 idle charges:

| Table Name | Partition Key | Sort Key | TTL Attribute | Backup / PITR |
|---|---|---|---|---|
| `HeatCreditAssessments-prod` | `assessmentId` (String) | None | `ttl` (Enabled, 30 days) | Disabled (Cost control) |
| `HeatCreditRecommendations-prod` | `recommendationId` (String) | None | `ttl` (Enabled, 30 days) | Disabled (Cost control) |
| `HeatCreditBuildings-prod` | `buildingId` (String) | None | None | Disabled (Cost control) |

---

## 6. Post-Deployment Verification

Verify the live API using the automated bash test script:

```bash
# Test the deployed API Gateway endpoint
bash tests/api/test-api.sh https://{YOUR_API_ID}.execute-api.ap-south-1.amazonaws.com/prod
```

Verification suite checks:
1. `GET /health` returns status `200` and `"status": "ok"`.
2. `GET /interventions` returns 6 catalogue items.
3. `GET /weather` returns live observation or marked fallback.
4. `POST /assessments` scores school correctly (Score: 42) and writes to DynamoDB.
5. `POST /optimize` returns ₹48k selected package with +25 points lift.

---

## 7. CloudWatch Logs & Diagnostics

Tail real-time Lambda execution logs from the CLI:

```bash
# Tail assessment Lambda logs
sam logs --name AssessmentFunction --stack-name heatcredit-prod --tail

# Tail optimizer Lambda logs
sam logs --name OptimizationFunction --stack-name heatcredit-prod --tail
```

---

## 8. Teardown & Cost Cleanup

To delete all provisioned AWS resources and eliminate future charges after the hackathon:

```bash
sam delete --stack-name heatcredit-prod --region ap-south-1
```

Confirm prompts:
- Delete the stack? `y`
- Delete the deployment S3 bucket? `y`
