/**
 * HeatCredit — Heat Resilience Scoring Engine
 *
 * Deterministic, explainable scoring engine.
 * No ML, no AI, no external APIs.
 *
 * Score = sum of weighted dimension scores, clamped to [0, 100].
 *
 * IMPORTANT: This score is a prototype decision-support metric,
 * not a certified building-safety or medical standard.
 */

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type RoofType = "concrete" | "metal" | "tile" | "thatched" | "green";
export type RoofCondition = "excellent" | "good" | "fair" | "poor";
export type VentilationLevel = "poor" | "medium" | "good" | "excellent";
export type WaterAccessLevel = "none" | "poor" | "adequate" | "good" | "excellent";
export type ReliefSpaceLevel = "none" | "limited" | "adequate" | "good" | "excellent";

export interface BuildingInput {
  buildingType: string;
  location: string;
  latitude: number;
  longitude: number;
  occupancy: number;
  operatingHours: number;       // Hours per day the building is occupied (1–24)
  roofType: RoofType;
  roofCondition: RoofCondition;
  shadeCoverage: number;        // Percentage 0–100
  greenCoverage: number;        // Percentage 0–100
  ventilation: VentilationLevel;
  waterAccess: WaterAccessLevel;
  reliefSpace: ReliefSpaceLevel;
}

export interface DimensionBreakdown {
  thermalProtection: number;    // 0–25
  shade: number;                // 0–15
  ventilation: number;          // 0–15
  waterAccess: number;          // 0–15
  reliefCapacity: number;       // 0–15
  greenInfrastructure: number;  // 0–10
  exposure: number;             // 0–5
}

export interface ScoringResult {
  score: number;                // 0–100 (integer)
  riskLevel: RiskLevel;
  breakdown: DimensionBreakdown;
  vulnerabilities: Vulnerability[];
  topVulnerability: string;
}

export type RiskLevel =
  | "critical"
  | "high"
  | "moderate"
  | "resilient"
  | "highly-resilient";

export interface Vulnerability {
  dimension: string;
  label: string;
  score: number;        // Actual score for this dimension
  maxScore: number;     // Maximum possible for this dimension
  severity: "high" | "medium" | "low";
  gap: number;          // maxScore - score
}

// ---------------------------------------------------------------------------
// Constants — Dimension weights (must sum to 100)
// ---------------------------------------------------------------------------

export const DIMENSION_WEIGHTS = {
  thermalProtection: 25,
  shade: 15,
  ventilation: 15,
  waterAccess: 15,
  reliefCapacity: 15,
  greenInfrastructure: 10,
  exposure: 5,
} as const;

// ---------------------------------------------------------------------------
// Lookup maps — ordered from worst to best (0.0 → 1.0)
// ---------------------------------------------------------------------------

// Calibration note:
// Factors are set so that a building with broadly 'medium'/'fair' inputs
// scores in the Moderate band (60–74). 'Poor' inputs are common real-world
// conditions, not extreme failures — their floor is higher than 0.
// 'None' (no resource at all) is the only true-zero.
const ROOF_TYPE_FACTOR: Record<RoofType, number> = {
  metal:    0.35,
  thatched: 0.50,
  concrete: 0.65,
  tile:     0.80,
  green:    1.00,
};

const ROOF_CONDITION_FACTOR: Record<RoofCondition, number> = {
  poor:      0.30,
  fair:      0.65,
  good:      0.85,
  excellent: 1.00,
};

const VENTILATION_FACTOR: Record<VentilationLevel, number> = {
  poor:      0.20,
  medium:    0.60,
  good:      0.85,
  excellent: 1.00,
};

const WATER_ACCESS_FACTOR: Record<WaterAccessLevel, number> = {
  none:      0.00,
  poor:      0.30,
  adequate:  0.60,
  good:      0.85,
  excellent: 1.00,
};

const RELIEF_SPACE_FACTOR: Record<ReliefSpaceLevel, number> = {
  none:      0.00,
  limited:   0.30,
  adequate:  0.60,
  good:      0.85,
  excellent: 1.00,
};

// ---------------------------------------------------------------------------
// Scoring helpers
// ---------------------------------------------------------------------------

/**
 * Thermal protection score (0–25).
 * Combined from roof type (60%) and roof condition (40%).
 */
function scoreThermalProtection(
  roofType: RoofType,
  roofCondition: RoofCondition
): number {
  const typeFactor = ROOF_TYPE_FACTOR[roofType] ?? 0.5;
  const conditionFactor = ROOF_CONDITION_FACTOR[roofCondition] ?? 0.5;
  const combined = typeFactor * 0.6 + conditionFactor * 0.4;
  return Math.round(combined * DIMENSION_WEIGHTS.thermalProtection * 10) / 10;
}

/**
 * Shade score (0–15).
 * Linear from 0 % coverage → 0 points, 100 % → 15 points.
 */
function scoreShade(shadeCoverage: number): number {
  const clamped = Math.max(0, Math.min(100, shadeCoverage));
  return Math.round((clamped / 100) * DIMENSION_WEIGHTS.shade * 10) / 10;
}

/**
 * Ventilation score (0–15).
 */
function scoreVentilation(ventilation: VentilationLevel): number {
  const factor = VENTILATION_FACTOR[ventilation] ?? 0.5;
  return Math.round(factor * DIMENSION_WEIGHTS.ventilation * 10) / 10;
}

/**
 * Water access score (0–15).
 */
function scoreWaterAccess(waterAccess: WaterAccessLevel): number {
  const factor = WATER_ACCESS_FACTOR[waterAccess] ?? 0;
  return Math.round(factor * DIMENSION_WEIGHTS.waterAccess * 10) / 10;
}

/**
 * Relief capacity score (0–15).
 */
function scoreReliefCapacity(reliefSpace: ReliefSpaceLevel): number {
  const factor = RELIEF_SPACE_FACTOR[reliefSpace] ?? 0;
  return Math.round(factor * DIMENSION_WEIGHTS.reliefCapacity * 10) / 10;
}

/**
 * Green infrastructure score (0–10).
 * Linear from 0 % → 0, 100 % → 10.
 */
function scoreGreenInfrastructure(greenCoverage: number): number {
  const clamped = Math.max(0, Math.min(100, greenCoverage));
  return Math.round((clamped / 100) * DIMENSION_WEIGHTS.greenInfrastructure * 10) / 10;
}

/**
 * Exposure score (0–5).
 * Higher occupancy × longer hours = more people at risk = LOWER score.
 * We compute a "risk factor" and invert it.
 *
 * Risk reference points:
 *   Occupancy ≤ 50, hours ≤ 8  → low risk   (factor ≈ 0)  → score ≈ 5
 *   Occupancy ≥ 500, hours = 24 → high risk  (factor ≈ 1)  → score ≈ 0
 */
function scoreExposure(occupancy: number, operatingHours: number): number {
  const maxOccupancy = 500;
  const maxHours = 24;

  const occupancyFactor = Math.min(occupancy / maxOccupancy, 1);
  const hourFactor = Math.min(operatingHours / maxHours, 1);

  // Combined exposure risk [0, 1]
  const riskFactor = occupancyFactor * 0.6 + hourFactor * 0.4;

  // Invert: low risk → high resilience score
  return Math.round((1 - riskFactor) * DIMENSION_WEIGHTS.exposure * 10) / 10;
}

// ---------------------------------------------------------------------------
// Risk classification
// ---------------------------------------------------------------------------

export function classifyRisk(score: number): RiskLevel {
  if (score >= 90) return "highly-resilient";
  if (score >= 75) return "resilient";
  if (score >= 60) return "moderate";
  if (score >= 40) return "high";
  return "critical";
}

// ---------------------------------------------------------------------------
// Vulnerability analysis
// ---------------------------------------------------------------------------

function buildVulnerabilities(breakdown: DimensionBreakdown): Vulnerability[] {
  const dimensions: Array<{
    key: keyof DimensionBreakdown;
    label: string;
    maxScore: number;
  }> = [
    { key: "thermalProtection", label: "Thermal Protection", maxScore: 25 },
    { key: "shade",             label: "Shade Coverage",     maxScore: 15 },
    { key: "ventilation",       label: "Ventilation",        maxScore: 15 },
    { key: "waterAccess",       label: "Water Access",       maxScore: 15 },
    { key: "reliefCapacity",    label: "Cooling / Relief",   maxScore: 15 },
    { key: "greenInfrastructure", label: "Green Infrastructure", maxScore: 10 },
    { key: "exposure",          label: "Occupancy Exposure", maxScore: 5  },
  ];

  const vulnerabilities: Vulnerability[] = dimensions.map(({ key, label, maxScore }) => {
    const score = breakdown[key];
    const gap = maxScore - score;
    const gapRatio = gap / maxScore;

    let severity: "high" | "medium" | "low";
    if (gapRatio >= 0.6) severity = "high";
    else if (gapRatio >= 0.3) severity = "medium";
    else severity = "low";

    return { dimension: key, label, score, maxScore, severity, gap };
  });

  // Sort by gap descending (biggest improvement opportunity first)
  return vulnerabilities.sort((a, b) => b.gap - a.gap);
}

// ---------------------------------------------------------------------------
// Main scoring function
// ---------------------------------------------------------------------------

export function scoreBuilding(input: BuildingInput): ScoringResult {
  const breakdown: DimensionBreakdown = {
    thermalProtection: scoreThermalProtection(input.roofType, input.roofCondition),
    shade:             scoreShade(input.shadeCoverage),
    ventilation:       scoreVentilation(input.ventilation),
    waterAccess:       scoreWaterAccess(input.waterAccess),
    reliefCapacity:    scoreReliefCapacity(input.reliefSpace),
    greenInfrastructure: scoreGreenInfrastructure(input.greenCoverage),
    exposure:          scoreExposure(input.occupancy, input.operatingHours),
  };

  const rawScore =
    breakdown.thermalProtection +
    breakdown.shade +
    breakdown.ventilation +
    breakdown.waterAccess +
    breakdown.reliefCapacity +
    breakdown.greenInfrastructure +
    breakdown.exposure;

  const score = Math.round(Math.max(0, Math.min(100, rawScore)));
  const riskLevel = classifyRisk(score);
  const vulnerabilities = buildVulnerabilities(breakdown);
  const topVulnerability = vulnerabilities[0]?.label ?? "None identified";

  return { score, riskLevel, breakdown, vulnerabilities, topVulnerability };
}
