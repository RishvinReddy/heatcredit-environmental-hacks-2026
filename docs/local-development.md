# HeatCredit — Local Development Guide

> ℹ️ **Notice:** For the production AWS SAM deployment, IAM policies, and CloudWatch guides, see [**`DEPLOYMENT.md`**](DEPLOYMENT.md). For contributor onboarding and environment setup, see [**`CONTRIBUTING.md`**](CONTRIBUTING.md).


## Prerequisites

Install these before starting:

```bash
# AWS CLI
# https://docs.aws.amazon.com/cli/latest/userguide/getting-started-install.html

# AWS SAM CLI
pip install aws-sam-cli
# or: brew install aws-sam-cli (macOS)
# or: https://docs.aws.amazon.com/serverless-application-model/latest/developerguide/install-sam-cli.html

# Docker (required for sam local)
# https://docs.docker.com/get-docker/

# AWS credentials
aws configure
# Enter: Access Key, Secret Key, Region (ap-south-1), Output (json)
```

---

## Step 1 — Create the SAM deployment bucket

Only needed once per AWS account:

```bash
aws s3 mb s3://heatcredit-sam-deployments-$(aws sts get-caller-identity --query Account --output text) \
  --region ap-south-1
```

Then update `samconfig.toml`:

```toml
s3_bucket = "heatcredit-sam-deployments-YOUR_ACCOUNT_ID"
```

---

## Step 2 — Create DynamoDB tables (one-time setup)

Run this before local testing. Creates tables in `ap-south-1`:

```bash
# Assessments table
aws dynamodb create-table \
  --table-name HeatCreditAssessments-prod \
  --billing-mode PAY_PER_REQUEST \
  --attribute-definitions AttributeName=assessmentId,AttributeType=S \
  --key-schema AttributeName=assessmentId,KeyType=HASH \
  --region ap-south-1

# Recommendations table
aws dynamodb create-table \
  --table-name HeatCreditRecommendations-prod \
  --billing-mode PAY_PER_REQUEST \
  --attribute-definitions AttributeName=recommendationId,AttributeType=S \
  --key-schema AttributeName=recommendationId,KeyType=HASH \
  --region ap-south-1

# Buildings table
aws dynamodb create-table \
  --table-name HeatCreditBuildings-prod \
  --billing-mode PAY_PER_REQUEST \
  --attribute-definitions AttributeName=buildingId,AttributeType=S \
  --key-schema AttributeName=buildingId,KeyType=HASH \
  --region ap-south-1
```

Verify tables exist:

```bash
aws dynamodb list-tables --region ap-south-1
```

---

## Step 3 — Build the SAM application

```bash
sam build
```

This compiles TypeScript via esbuild and packages each Lambda function.

Expected output:

```
Build Succeeded

Built Artifacts  : .aws-sam/build
Built Template   : .aws-sam/build/template.yaml
```

---

## Step 4 — Test locally

### Option A — Local API (recommended for development)

Start the local API server (runs on port 3001):

```bash
sam local start-api --port 3001
```

In a second terminal, run the API test suite:

```bash
bash tests/api/test-api.sh http://localhost:3001
```

**Note**: The local Lambda will attempt to connect to the real DynamoDB in `ap-south-1` using your AWS credentials. Ensure `aws configure` is set up.

### Option B — Invoke individual functions

```bash
# Health check (no event needed)
sam local invoke HealthFunction --event events/empty.json

# Assessment with the canonical demo building
sam local invoke AssessmentFunction --event events/assessment-school.json

# Optimization
sam local invoke OptimizationFunction --event events/optimize.json
```

---

## Step 5 — Deploy to AWS

First deploy (creates stack):

```bash
sam deploy --guided
```

Follow the prompts. Accept defaults except:
- Stack name: `heatcredit-prod`
- Region: `ap-south-1`
- Confirm changes: `N` (no, deploy automatically)

Subsequent deploys:

```bash
sam deploy
```

The API Gateway URL is printed in the Outputs section after deploy. Copy it to `.env`:

```
NEXT_PUBLIC_API_URL=https://XXXXX.execute-api.ap-south-1.amazonaws.com/prod
```

---

## Step 6 — Test the deployed API

```bash
bash tests/api/test-api.sh https://XXXXX.execute-api.ap-south-1.amazonaws.com/prod
```

All 10 tests should pass.

---

## Step 7 — Monitor with CloudWatch

```bash
# Tail Lambda logs
sam logs --name AssessmentFunction --stack-name heatcredit-prod --tail

# Or in AWS Console:
# CloudWatch → Log groups → /aws/lambda/heatcredit-assessment-prod
```

---

## Cost control checklist

Run after every deploy session:

```bash
# Check Lambda invocations this month
aws cloudwatch get-metric-statistics \
  --namespace AWS/Lambda \
  --metric-name Invocations \
  --dimensions Name=FunctionName,Value=heatcredit-assessment-prod \
  --start-time $(date -d '30 days ago' +%Y-%m-%dT%H:%M:%S) \
  --end-time $(date +%Y-%m-%dT%H:%M:%S) \
  --period 2592000 \
  --statistics Sum \
  --region ap-south-1

# Check DynamoDB consumed capacity
aws cloudwatch get-metric-statistics \
  --namespace AWS/DynamoDB \
  --metric-name ConsumedWriteCapacityUnits \
  --dimensions Name=TableName,Value=HeatCreditAssessments-prod \
  --start-time $(date -d '30 days ago' +%Y-%m-%dT%H:%M:%S) \
  --end-time $(date +%Y-%m-%dT%H:%M:%S) \
  --period 2592000 \
  --statistics Sum \
  --region ap-south-1
```

Expected cost for hackathon usage: **$0** (within AWS Free Tier).

---

## Tear down (after hackathon)

```bash
sam delete --stack-name heatcredit-prod --region ap-south-1
```

This removes the Lambda functions, API Gateway, IAM roles, and log groups.
DynamoDB tables are retained (delete manually if needed).
