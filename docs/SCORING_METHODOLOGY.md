# HeatCredit — Canonical Scoring Methodology

> **Model Identifier:** `1.0.0-prototype`
> **Source Implementation:** [`backend/lib/scoring/scoring.ts`](file:///c:/Users/EikoMotsu/OneDrive/Documents/Desktop/HeatCredit/backend/lib/scoring/scoring.ts)
> **Validation Implementation:** [`backend/lib/validation/validation.ts`](file:///c:/Users/EikoMotsu/OneDrive/Documents/Desktop/HeatCredit/backend/lib/validation/validation.ts)
> **Test Suite:** [`tests/scoring/scoring.test.ts`](file:///c:/Users/EikoMotsu/OneDrive/Documents/Desktop/HeatCredit/tests/scoring/scoring.test.ts) (32/32 tests passing)
>
> ⚠️ **IMPORTANT DISCLAIMER:** HeatCredit's Heat Resilience Score is a prototype decision-support metric designed to assist building operators and municipalities in prioritizing capital resilience interventions. It is **not** a certified building-safety certification, an engineering compliance stamp, or a medical/clinical health risk diagnosis. It does not predict internal ambient temperature in degrees Celsius or guarantee clinical outcomes.

---

## 1. Overview & Model Philosophy

The Heat Resilience Score is an explainable composite metric ranging from **0 to 100**. It measures a facility's structural, vegetative, and operational capacity to withstand extreme thermal conditions without reliance on energy-intensive mechanical air conditioning.

The model is intentionally **deterministic and transparent**:
- No generative AI or machine-learning approximations are used in score calculation.
- Every point is traceable directly to an observable physical characteristic or operational parameter.
- The calculation is mathematically monotonic: improving any physical attribute never decreases the resilience score.

---

## 2. Risk Categories & Exact Thresholds

The score is classified into five distinct operational risk tiers:

| Score Range | Classification | System Label | Operational Meaning |
|:---:|---|---|---|
| **90 – 100** | Highly Resilient | `highly-resilient` | Facility exhibits passive thermal defenses, substantial tree canopy, dedicated relief infrastructure, and ample hydration. |
| **75 – 89** | Resilient | `resilient` | Strong baseline defenses. Can maintain habitable conditions during moderate to severe heatwaves. |
| **60 – 74** | Moderate | `moderate` | Acceptable baseline but possesses notable gaps in passive cooling, shade, or relief infrastructure. |
| **40 – 59** | High Risk | `high` | Severe vulnerability. Substantial solar heat absorption, poor airflow, or inadequate drinking water. |
| **0 – 39** | Critical Risk | `critical` | Acute thermal emergency hazard. Occupants face extreme heat retention and no structured relief capacity. |

---

## 3. The Seven Dimensions and Weights

All dimensions are weighted to sum to exactly **100 points**:

```
Total Resilience Score = Σ (7 Weighted Dimension Points)  [Clamped 0 to 100]
```

| Dimension | Max Points | Weight % | Target Physical / Operational Phenomenon |
|---|:---:|:---:|---|
| **1. Thermal Protection** | **25.0** | 25% | Solar radiation reflection and thermal mass attenuation by the roof envelope. |
| **2. Shade Coverage** | **15.0** | 15% | Physical shielding of outdoor gathering spaces, courtyards, and entrances from direct solar insolation. |
| **3. Ventilation** | **15.0** | 15% | Natural convective airflow and cross-ventilation capacity to dissipate internal metabolic and ambient heat. |
| **4. Water Access** | **15.0** | 15% | Availability of dedicated drinking water stations for rapid physiological hydration. |
| **5. Cooling / Relief Capacity** | **15.0** | 15% | Provision of a dedicated cool room or protected microclimate recovery zone for overheated occupants. |
| **6. Green Infrastructure** | **10.0** | 10% | Canopy and vegetative ground cover providing microclimate evaporative cooling. |
| **7. Occupancy Exposure** | **5.0** | 5% | Human exposure risk based on building population density and operational duration. |
| **Total** | **100.0** | **100%** | |

---

## 4. Dimension Calculation Formulas & Factors

### 4.1 Thermal Protection (0 – 25 points)
Combines **roof type** (60% weight) and **roof condition** (40% weight):

$$\text{Factor} = (\text{RoofTypeFactor} \times 0.6) + (\text{RoofConditionFactor} \times 0.4)$$
$$\text{Score}_{\text{thermal}} = \text{round}_{1\text{dp}}(\text{Factor} \times 25.0)$$

**Roof Type Factors:**
- `metal`: 0.35 (high thermal conductivity and solar heat absorption)
- `thatched`: 0.50 (moderate insulation, poor durability)
- `concrete`: 0.65 (high thermal mass, retains heat overnight without reflective coating)
- `tile`: 0.80 (good thermal reflection and air barrier)
- `green`: 1.00 (living roof offering high insulation and evapotranspiration)

**Roof Condition Factors:**
- `poor`: 0.30 (degraded surface, micro-cracks, damaged insulation)
- `fair`: 0.65 (standard unpainted surface with minor weathering)
- `good`: 0.85 (well-maintained, intact waterproof layer)
- `excellent`: 1.00 (high-albedo reflective coating or pristine insulation)

### 4.2 Shade Coverage (0 – 15 points)
Linear mapping from 0% outdoor shade to 100% shade canopy:

$$\text{Score}_{\text{shade}} = \text{round}_{1\text{dp}}\left(\frac{\text{clamp}(\text{shadeCoverage}, 0, 100)}{100} \times 15.0\right)$$

### 4.3 Ventilation (0 – 15 points)
Categorical mapping of convective dissipation capacity:

$$\text{Score}_{\text{ventilation}} = \text{round}_{1\text{dp}}(\text{Factor} \times 15.0)$$

- `poor`: 0.20 (stagnant indoor air, lack of cross-ventilation openings)
- `medium`: 0.60 (basic operable windows and ceiling fans)
- `good`: 0.85 (engineered cross-ventilation or high-volume low-speed fans)
- `excellent`: 1.00 (optimized passive stack ventilation or automated airflow management)

### 4.4 Water Access (0 – 15 points)
Categorical mapping of physiological hydration infrastructure:

$$\text{Score}_{\text{water}} = \text{round}_{1\text{dp}}(\text{Factor} \times 15.0)$$

- `none`: 0.00 (no on-site drinking water points)
- `poor`: 0.30 (distant or unreliable single tap)
- `adequate`: 0.60 (standard municipal drinking water dispenser)
- `good`: 0.85 (multiple filtered, chilled water stations)
- `excellent`: 1.00 (comprehensive hydration stations with backup storage)

### 4.5 Cooling / Relief Capacity (0 – 15 points)
Dedicated safe haven for acute heat stress recovery:

$$\text{Score}_{\text{relief}} = \text{round}_{1\text{dp}}(\text{Factor} \times 15.0)$$

- `none`: 0.00 (no dedicated cool zone)
- `limited`: 0.30 (shaded hallway or fan-cooled corner)
- `adequate`: 0.60 (enclosed room with active evaporative or fan cooling)
- `good`: 0.85 (climate-controlled first-aid or rest room)
- `excellent`: 1.00 (high-capacity, medical-grade emergency heat shelter)

### 4.6 Green Infrastructure (0 – 10 points)
Linear mapping from 0% vegetation coverage to 100% green coverage:

$$\text{Score}_{\text{green}} = \text{round}_{1\text{dp}}\left(\frac{\text{clamp}(\text{greenCoverage}, 0, 100)}{100} \times 10.0\right)$$

### 4.7 Occupancy Exposure (0 – 5 points)
Exposure is an **inverted dimension**: larger populations and longer daily operating hours expose more people to heat risk, resulting in a lower resilience score:

$$\text{OccupancyFactor} = \min\left(\frac{\text{occupancy}}{500}, 1.0\right)$$
$$\text{HourFactor} = \min\left(\frac{\text{operatingHours}}{24}, 1.0\right)$$
$$\text{RiskFactor} = (\text{OccupancyFactor} \times 0.6) + (\text{HourFactor} \times 0.4)$$
$$\text{Score}_{\text{exposure}} = \text{round}_{1\text{dp}}((1.0 - \text{RiskFactor}) \times 5.0)$$

---

## 5. Rounding and Final Score Computation

1. **Dimension Scores:** Each dimension score is rounded to 1 decimal place using `Math.round(val * 10) / 10`.
2. **Summation:** The seven dimension scores are summed to produce `rawScore`.
3. **Clamping & Integer Rounding:** The final score is clamped to the range $[0, 100]$ and rounded to the nearest integer:
   ```typescript
   const score = Math.round(Math.max(0, Math.min(100, rawScore)));
   ```

---

## 6. Worked Example: Green Valley School, Hyderabad

The canonical demo facility [`demo-school-hyderabad`](file:///c:/Users/EikoMotsu/OneDrive/Documents/Desktop/HeatCredit/data/demo-buildings.json) provides a verifiable benchmark:

### Facility Inputs
- **Facility:** Green Valley School, Hyderabad
- **Occupancy:** 350 students & staff
- **Operating Hours:** 9 hours/day
- **Roof:** `concrete`, condition `fair`
- **Shade Coverage:** 25%
- **Green Coverage:** 15%
- **Ventilation:** `medium`
- **Water Access:** `poor`
- **Relief Space:** `limited`

### Step-by-Step Dimension Calculations
1. **Thermal Protection:**
   $$\text{Type Factor} = 0.65, \quad \text{Condition Factor} = 0.65$$
   $$\text{Combined} = (0.65 \times 0.6) + (0.65 \times 0.4) = 0.39 + 0.26 = 0.65$$
   $$\text{Score} = \text{round}_{1\text{dp}}(0.65 \times 25.0) = \mathbf{16.3} \text{ / } 25$$

2. **Shade Coverage:**
   $$\text{Score} = \text{round}_{1\text{dp}}\left(\frac{25}{100} \times 15.0\right) = \text{round}_{1\text{dp}}(3.75) = \mathbf{3.8} \text{ / } 15$$

3. **Ventilation:**
   $$\text{Factor} = 0.60 \implies \text{Score} = \text{round}_{1\text{dp}}(0.60 \times 15.0) = \mathbf{9.0} \text{ / } 15$$

4. **Water Access:**
   $$\text{Factor} = 0.30 \implies \text{Score} = \text{round}_{1\text{dp}}(0.30 \times 15.0) = \mathbf{4.5} \text{ / } 15$$

5. **Relief Capacity:**
   $$\text{Factor} = 0.30 \implies \text{Score} = \text{round}_{1\text{dp}}(0.30 \times 15.0) = \mathbf{4.5} \text{ / } 15$$

6. **Green Infrastructure:**
   $$\text{Score} = \text{round}_{1\text{dp}}\left(\frac{15}{100} \times 10.0\right) = \mathbf{1.5} \text{ / } 10$$

7. **Occupancy Exposure:**
   $$\text{OccupancyFactor} = \frac{350}{500} = 0.70, \quad \text{HourFactor} = \frac{9}{24} = 0.375$$
   $$\text{RiskFactor} = (0.70 \times 0.6) + (0.375 \times 0.4) = 0.42 + 0.15 = 0.57$$
   $$\text{Score} = \text{round}_{1\text{dp}}((1 - 0.57) \times 5.0) = \text{round}_{1\text{dp}}(2.15) = \mathbf{2.1} \text{ / } 5$$

### Final Calculation
$$\text{Raw Sum} = 16.3 + 3.8 + 9.0 + 4.5 + 4.5 + 1.5 + 2.1 = 41.7$$
$$\text{Final Score} = \text{Math.round}(41.7) = \mathbf{42} \text{ / } 100$$
$$\text{Risk Classification} = \mathbf{High\ Risk} \quad (40 \le 42 \le 59)$$

Top Vulnerabilities Identified:
1. **Shade Coverage** (Gap: $15 - 3.8 = 11.2$, Severity: High)
2. **Cooling / Relief** (Gap: $15 - 4.5 = 10.5$, Severity: High)
3. **Water Access** (Gap: $15 - 4.5 = 10.5$, Severity: High)

---

## 7. Model Assumptions & Limitations

1. **Static Thermodynamics:** The model does not calculate dynamic indoor room heat balance, latent humidity loads, or wall thermal transmittance (U-values).
2. **Linear Aggregation:** Interaction effects (e.g., green roofs reducing overall roof surface temperatures) are modeled additively rather than through coupled differential equations.
3. **Absence of Sensor Data:** The baseline score evaluates physical architectural characteristics as entered; it does not measure real-time indoor dry-bulb temperature.
4. **Validation Status:** Currently tagged as `prototype`. Independent field validation against temperature dataloggers is planned for future phases.
