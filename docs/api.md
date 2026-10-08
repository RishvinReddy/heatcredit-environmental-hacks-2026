# HeatCredit — API Reference

## Base URL

```
https://{API_GATEWAY_ID}.execute-api.ap-south-1.amazonaws.com/prod
```

---

## GET /health

Liveness check.

**Response**

```json
{
  "status": "ok",
  "service": "heatcredit-api",
  "timestamp": "2026-10-08T12:00:00.000Z",
  "version": "1.0.0"
}
```

---

## GET /interventions

Returns the full intervention catalogue.

**Response**

```json
{
  "interventions": [...],
  "count": 6,
  "currency": "INR",
  "disclaimer": "..."
}
```

---

## GET /weather

Fetches current weather for a location. Falls back to demo data if Open-Meteo is unavailable.

**Parameters**

| Name | Type   | Required | Description                  |
|------|--------|----------|------------------------------|
| lat  | float  | Yes      | Latitude (-90 to 90)         |
| lon  | float  | Yes      | Longitude (-180 to 180)      |

**Example**

```
GET /weather?lat=17.3850&lon=78.4867
```

**Response**

```json
{
  "location": "Live",
  "latitude": 17.385,
  "longitude": 78.4867,
  "temperature": 37,
  "apparentTemperature": 41,
  "humidity": 55,
  "windSpeed": 14,
  "cloudCover": 20,
  "precipitation": 0,
  "weatherCode": 0,
  "isDemo": false,
  "fetchedAt": "2026-10-08T12:00:00.000Z",
  "attribution": "Weather data provided by Open-Meteo (CC BY 4.0) — https://open-meteo.com"
}
```

---

## POST /assessments

Scores a building and returns the Heat Resilience Score.

**Request body**

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
  "shadeCoverage": 15,
  "greenCoverage": 10,
  "ventilation": "medium",
  "waterAccess": "poor",
  "reliefSpace": "none"
}
```

**Allowed values**

| Field         | Allowed values                                              |
|---------------|-------------------------------------------------------------|
| roofType      | `concrete`, `metal`, `tile`, `thatched`, `green`            |
| roofCondition | `excellent`, `good`, `fair`, `poor`                         |
| ventilation   | `poor`, `medium`, `good`, `excellent`                       |
| waterAccess   | `none`, `poor`, `adequate`, `good`, `excellent`             |
| reliefSpace   | `none`, `limited`, `adequate`, `good`, `excellent`          |

**Response**

```json
{
  "assessmentId": "HC-LGH73K2A-4R9X",
  "score": 62,
  "riskLevel": "moderate",
  "breakdown": {
    "thermalProtection": 12.1,
    "shade": 2.2,
    "ventilation": 7.5,
    "waterAccess": 3.0,
    "reliefCapacity": 0.0,
    "greenInfrastructure": 1.0,
    "exposure": 3.7
  },
  "vulnerabilities": [...],
  "topVulnerability": "Cooling / Relief",
  "createdAt": "2026-10-08T12:00:00.000Z"
}
```

**Risk levels**

| Score | riskLevel         |
|------:|-------------------|
| 90–100 | `highly-resilient` |
| 75–89  | `resilient`        |
| 60–74  | `moderate`         |
| 40–59  | `high`             |
| 0–39   | `critical`         |

---

## POST /optimize

Runs the budget optimizer for a given assessment.

**Request body**

```json
{
  "assessmentId": "HC-LGH73K2A-4R9X",
  "budget": 50000
}
```

**Response**

```json
{
  "recommendationId": "REC-LGH73K2A-8F2Z",
  "assessmentId": "HC-LGH73K2A-4R9X",
  "currentScore": 62,
  "budget": 50000,
  "feasible": true,
  "selectedInterventions": [
    { "id": "shade", "name": "Shade Structure", "estimatedCost": 25000, "impact": 11, ... },
    { "id": "water", "name": "Drinking Water Station", "estimatedCost": 8000, "impact": 6, ... },
    { "id": "ventilation", "name": "Ventilation Improvement", "estimatedCost": 15000, "impact": 8, ... }
  ],
  "totalCost": 48000,
  "totalImpact": 25,
  "improvement": 25,
  "projectedScore": 87,
  "remainingBudget": 2000,
  "alternativePackages": [...],
  "createdAt": "2026-10-08T12:00:00.000Z"
}
```

---

## Error responses

All endpoints return errors in this format:

```json
{
  "error": "Validation failed.",
  "details": ["roofType must be one of: concrete, metal, tile, thatched, green."]
}
```

| Status | Meaning                         |
|--------|---------------------------------|
| 400    | Invalid input                   |
| 404    | Assessment not found            |
| 503    | Database temporarily unavailable|
