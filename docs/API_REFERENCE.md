# HeatCredit — REST API Reference

> **API Standard:** OpenAPI 3.0.1 compliant via AWS SAM `template.yaml`
> **Base URL (Deployed):** `https://{API_ID}.execute-api.ap-south-1.amazonaws.com/prod`
> **Base URL (Local SAM):** `http://localhost:3001`
> **Authentication:** None (Public hackathon decision-support prototype)
> **Content-Type:** `application/json`

---

## 1. Endpoints Summary

| Method | Route | Purpose | Persistence | Implementation File |
|:---:|---|---|:---:|---|
| **GET** | `/health` | Service liveness and version check | Stateless | [`backend/functions/health/index.ts`](file:///c:/Users/EikoMotsu/OneDrive/Documents/Desktop/HeatCredit/backend/functions/health/index.ts) |
| **GET** | `/interventions` | Retrieve full 6-item intervention catalogue | Bundled JSON | [`backend/functions/interventions/index.ts`](file:///c:/Users/EikoMotsu/OneDrive/Documents/Desktop/HeatCredit/backend/functions/interventions/index.ts) |
| **GET** | `/weather` | Ingest real-time weather observation for coordinates | Stateless / Proxy | [`backend/functions/weather/index.ts`](file:///c:/Users/EikoMotsu/OneDrive/Documents/Desktop/HeatCredit/backend/functions/weather/index.ts) |
| **GET** | `/warnings` | Query official heat hazards by jurisdiction | Stateless / Proxy | [`backend/functions/warnings/index.ts`](file:///c:/Users/EikoMotsu/OneDrive/Documents/Desktop/HeatCredit/backend/functions/warnings/index.ts) |
| **POST** | `/assessments` | Submit building inputs, score facility, and persist | DynamoDB Write | [`backend/functions/assessment/index.ts`](file:///c:/Users/EikoMotsu/OneDrive/Documents/Desktop/HeatCredit/backend/functions/assessment/index.ts) |
| **GET** | `/assessments/{id}` | Retrieve existing assessment record by ID | DynamoDB Read | [`backend/functions/assessment/index.ts`](file:///c:/Users/EikoMotsu/OneDrive/Documents/Desktop/HeatCredit/backend/functions/assessment/index.ts) |
| **POST** | `/optimize` | Compute optimal intervention package under budget | DynamoDB Read + Write | [`backend/functions/optimization/index.ts`](file:///c:/Users/EikoMotsu/OneDrive/Documents/Desktop/HeatCredit/backend/functions/optimization/index.ts) |

---

## 2. Endpoint Specifications

### 2.1 GET `/health`
Returns the operational health and deployment version of the API service.

- **Request:** No parameters or payload required.
- **Response Headers:** `Content-Type: application/json; charset=utf-8`
- **Response Status:** `200 OK`
- **Response Body:**
```json
{
  "status": "ok",
  "service": "heatcredit-api",
  "timestamp": "2026-10-11T12:00:00.000Z",
  "version": "1.0.0"
}
```

---

### 2.2 GET `/interventions`
Serves the complete canonical intervention catalogue including pricing, targeted scoring dimensions, and estimated resilience points.

- **Request:** No parameters or payload required.
- **Response Status:** `200 OK`
- **Response Body:**
```json
{
  "interventions": [
    {
      "id": "shade",
      "name": "Shade Structure",
      "category": "shade",
      "description": "Install shade structures (pergolas, canopies, or shade sails)...",
      "estimatedCost": 25000,
      "impact": 11,
      "targetDimension": "shade",
      "constraints": [],
      "notes": "Prototype planning value."
    },
    {
      "id": "water",
      "name": "Drinking Water Station",
      "category": "water",
      "description": "Install a dedicated drinking water station...",
      "estimatedCost": 8000,
      "impact": 6,
      "targetDimension": "waterAccess",
      "constraints": [],
      "notes": "Prototype planning value."
    }
  ],
  "count": 6,
  "currency": "INR",
  "disclaimer": "Costs and impact values are prototype planning estimates..."
}
```

---

### 2.3 GET `/weather`
Fetches real-time meteorological observations for a specific geographic coordinate via Open-Meteo with an automated 5-second timeout and fallback baseline.

- **Query Parameters:**
  - `lat` (required, float): Latitude between `-90.0` and `90.0`.
  - `lon` (required, float): Longitude between `-180.0` and `180.0`.

- **Example Request:**
```
GET /weather?lat=17.3850&lon=78.4867
```

- **Response Status:** `200 OK`
- **Response Body (Live Provider Success):**
```json
{
  "location": "Live",
  "latitude": 17.385,
  "longitude": 78.4867,
  "temperature": 37.2,
  "apparentTemperature": 41.5,
  "humidity": 55,
  "windSpeed": 14.1,
  "cloudCover": 20,
  "precipitation": 0.0,
  "weatherCode": 0,
  "isDemo": false,
  "fetchedAt": "2026-10-11T12:00:00.000Z",
  "attribution": "Weather data provided by Open-Meteo (CC BY 4.0) — https://open-meteo.com"
}
```

- **Fallback Behavior:** If Open-Meteo is unreachable, times out, or returns HTTP 5xx, the endpoint returns safe regional baseline weather with `"isDemo": true` to prevent client failure.

---

### 2.4 GET `/warnings`
Queries official meteorological alerts for heat hazards.

- **Query Parameters:**
  - `lat` (required, float): Latitude.
  - `lon` (required, float): Longitude.

- **Supported Jurisdictions:** United States (US National Weather Service). Non-US coordinates safely return `status: "unsupported"`.
- **Response Status:** `200 OK`
- **Response Body (Example: Non-US Coordinate like Hyderabad):**
```json
{
  "status": "unsupported",
  "provider": "nws",
  "alert": null,
  "latitude": 17.385,
  "longitude": 78.4867,
  "message": "Jurisdiction not supported by current official warning provider."
}
```

- **Response Body (Example: Active Heat Advisory in US):**
```json
{
  "status": "active",
  "provider": "nws",
  "alert": {
    "event": "Heat Advisory",
    "headline": "Heat Advisory issued until 8:00 PM CDT",
    "severity": "Moderate",
    "effective": "2026-10-11T16:00:00Z",
    "expires": "2026-10-12T01:00:00Z",
    "url": "https://api.weather.gov/alerts/..."
  },
  "latitude": 32.7767,
  "longitude": -96.7970
}
```

---

### 2.5 POST `/assessments`
Scores a building facility, performs validation across 11 physical attributes and evidence provenance records, and persists the assessment record into Amazon DynamoDB.

- **Request Body (JSON):**
```json
{
  "buildingType": "school",
  "location": "Hyderabad",
  "latitude": 17.385,
  "longitude": 78.4867,
  "occupancy": 350,
  "operatingHours": 9,
  "roofType": "concrete",
  "roofCondition": "fair",
  "shadeCoverage": 25,
  "greenCoverage": 15,
  "ventilation": "medium",
  "waterAccess": "poor",
  "reliefSpace": "limited",
  "evidence": {
    "roofType": {
      "sourceCategory": "building_document",
      "verificationStatus": "verified",
      "timestamp": "2026-10-01T10:00:00Z"
    }
  }
}
```

- **Allowed Categorical Values:**
  - `roofType`: `"concrete" | "metal" | "tile" | "thatched" | "green"`
  - `roofCondition`: `"poor" | "fair" | "good" | "excellent"`
  - `ventilation`: `"poor" | "medium" | "good" | "excellent"`
  - `waterAccess`: `"none" | "poor" | "adequate" | "good" | "excellent"`
  - `reliefSpace`: `"none" | "limited" | "adequate" | "good" | "excellent"`

- **Response Status:** `201 Created`
- **Response Body:**
```json
{
  "assessmentId": "HC-LGH73K2A-4R9X",
  "score": 42,
  "riskLevel": "high",
  "breakdown": {
    "thermalProtection": 16.3,
    "shade": 3.8,
    "ventilation": 9.0,
    "waterAccess": 4.5,
    "reliefCapacity": 4.5,
    "greenInfrastructure": 1.5,
    "exposure": 2.1
  },
  "vulnerabilities": [
    {
      "dimension": "shade",
      "label": "Shade Coverage",
      "score": 3.8,
      "maxScore": 15.0,
      "severity": "high",
      "gap": 11.2
    }
  ],
  "topVulnerability": "Shade Coverage",
  "evidenceCompleteness": 11.1,
  "createdAt": "2026-10-11T12:00:00.000Z"
}
```

---

### 2.6 GET `/assessments/{id}`
Retrieves a previously stored facility assessment record from DynamoDB by its `assessmentId`.

- **Path Parameters:**
  - `id` (required, string): The unique `assessmentId` identifier.
- **Response Status:**
  - `200 OK` if found.
  - `404 Not Found` if the record does not exist.

---

### 2.7 POST `/optimize`
Loads an assessment record, retrieves the intervention catalogue, and executes the 0/1 knapsack optimizer under the requested budget ceiling.

- **Request Body (JSON):**
```json
{
  "assessmentId": "HC-LGH73K2A-4R9X",
  "budget": 50000
}
```

- **Response Status:** `200 OK`
- **Response Body:**
```json
{
  "recommendationId": "REC-LGH73K2A-8F2Z",
  "assessmentId": "HC-LGH73K2A-4R9X",
  "currentScore": 42,
  "budget": 50000,
  "feasible": true,
  "selectedInterventions": [
    {
      "id": "shade",
      "name": "Shade Structure",
      "estimatedCost": 25000,
      "impact": 11,
      "targetDimension": "shade"
    },
    {
      "id": "ventilation",
      "name": "Ventilation Improvement",
      "estimatedCost": 15000,
      "impact": 8,
      "targetDimension": "ventilation"
    },
    {
      "id": "water",
      "name": "Drinking Water Station",
      "estimatedCost": 8000,
      "impact": 6,
      "targetDimension": "waterAccess"
    }
  ],
  "totalCost": 48000,
  "totalImpact": 25,
  "improvement": 25,
  "projectedScore": 67,
  "remainingBudget": 2000,
  "alternativePackages": [
    {
      "label": "Option 1",
      "interventions": [...],
      "totalCost": 41000,
      "totalImpact": 23,
      "projectedScore": 65
    }
  ],
  "createdAt": "2026-10-11T12:00:00.000Z"
}
```

---

## 3. Standard Error Envelope & HTTP Status Codes

When input validation fails or resources cannot be located, all endpoints return an error payload matching this schema:

```json
{
  "error": "Validation failed.",
  "details": [
    "occupancy must be an integer between 1 and 100000.",
    "shadeCoverage must be a number between 0 and 100."
  ]
}
```

| HTTP Status | Triggering Condition |
|:---:|---|
| **400 Bad Request** | Missing required fields, NaN values, out-of-range coordinates, invalid categoricals. |
| **404 Not Found** | Querying an assessment ID that does not exist in DynamoDB. |
| **429 Too Many Requests** | Exceeded API Gateway rate limit (100 req/sec) or burst limit (50 req). |
| **500 Internal Error** | Unhandled exception inside Lambda execution. |
| **503 Service Unavailable** | DynamoDB service throttled or external provider connection failed without fallback. |
