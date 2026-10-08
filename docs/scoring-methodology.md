# HeatCredit — Scoring Methodology

> **Disclaimer**: HeatCredit's score is a prototype decision-support metric and is not a certified building-safety or medical standard. It is designed to help decision-makers prioritise investments, not to certify building safety.

---

## Overview

The Heat Resilience Score is a composite score from **0 to 100** derived from seven weighted dimensions of a building's heat vulnerability and resilience capacity.

A higher score indicates greater heat resilience.

---

## Dimensions and weights

| Dimension               | Weight | What it measures                                             |
|-------------------------|-------:|--------------------------------------------------------------|
| Thermal Protection      |     25 | Roof type and condition — how much solar heat is absorbed    |
| Shade                   |     15 | Coverage of outdoor areas from direct sunlight               |
| Ventilation             |     15 | Airflow quality to dissipate internal heat                   |
| Water Access            |     15 | Availability of drinking water for hydration                 |
| Cooling / Relief Capacity |   15 | Dedicated cool space for occupants during heat events        |
| Green Infrastructure    |     10 | Vegetation for evapotranspiration cooling                    |
| Exposure                |      5 | Occupancy and operating hours (more exposure = higher risk)  |
| **Total**               | **100** |                                                             |

---

## Score calculation

Each dimension is normalised to a 0–1 factor, then multiplied by its weight.

### Thermal Protection (0–25)

Combines roof type (60%) and roof condition (40%).

**Roof type factors:**

| Roof Type  | Factor |
|------------|-------:|
| Metal      |   0.30 |
| Thatched   |   0.45 |
| Concrete   |   0.55 |
| Tile       |   0.70 |
| Green      |   1.00 |

**Roof condition factors:**

| Condition  | Factor |
|------------|-------:|
| Poor       |   0.20 |
| Fair       |   0.55 |
| Good       |   0.80 |
| Excellent  |   1.00 |

**Formula:**

```
thermalProtection = (roofTypeFactor × 0.6 + roofConditionFactor × 0.4) × 25
```

### Shade (0–15)

```
shade = (shadeCoverage / 100) × 15
```

Linear from 0 % coverage (0 pts) to 100 % (15 pts).

### Ventilation (0–15)

| Level     | Factor |
|-----------|-------:|
| Poor      |   0.10 |
| Medium    |   0.50 |
| Good      |   0.80 |
| Excellent |   1.00 |

```
ventilation = factor × 15
```

### Water Access (0–15)

| Level    | Factor |
|----------|-------:|
| None     |   0.00 |
| Poor     |   0.20 |
| Adequate |   0.55 |
| Good     |   0.80 |
| Excellent|   1.00 |

```
waterAccess = factor × 15
```

### Cooling / Relief Capacity (0–15)

| Level    | Factor |
|----------|-------:|
| None     |   0.00 |
| Limited  |   0.25 |
| Adequate |   0.55 |
| Good     |   0.80 |
| Excellent|   1.00 |

```
reliefCapacity = factor × 15
```

### Green Infrastructure (0–10)

```
greenInfrastructure = (greenCoverage / 100) × 10
```

### Exposure (0–5)

Exposure is the only inverted dimension — higher occupancy and longer hours increase risk and therefore reduce the score.

```
riskFactor = (occupancy / 500) × 0.6 + (operatingHours / 24) × 0.4
exposure   = (1 − riskFactor) × 5
```

### Final score

```
score = clamp(
  thermalProtection + shade + ventilation + waterAccess
  + reliefCapacity + greenInfrastructure + exposure,
  0,
  100
)
```

---

## Risk classification

| Score  | Classification   |
|-------:|-----------------|
| 90–100 | Highly Resilient |
| 75–89  | Resilient        |
| 60–74  | Moderate         |
| 40–59  | High Risk        |
|  0–39  | Critical         |

---

## Limitations

- Costs and impact values are **prototype planning estimates**.
- The model does not account for urban heat islands, floor area, building age, or HVAC systems.
- Interventions are modelled as **independent binary choices** (0/1 knapsack). Real-world interactions between interventions may produce non-linear effects.
- Score factors are not calibrated against empirical heat-related illness or mortality data.

---

## Future improvements

- Calibrate factors against validated heat-vulnerability indices (e.g., CDC/WHO guidance).
- Add building age, floor area, and HVAC as scoring dimensions.
- Enable location-specific intervention cost lookup.
- Support multi-building portfolio comparisons.
