/**
 * HeatCredit — Shared Engine Adapter
 *
 * Imports directly from the canonical backend scoring and optimizer engines:
 * - backend/lib/scoring/scoring.ts
 * - backend/lib/optimizer/optimizer.ts
 * - data/interventions.json
 * - data/demo-buildings.json
 *
 * This guarantees 100% mathematical, functional, and behavioral parity
 * between the frontend client and the canonical AWS backend.
 */

import {
  scoreBuilding,
  classifyRisk,
  DIMENSION_WEIGHTS,
  type BuildingInput,
  type ScoringResult,
  type RiskLevel,
  type DimensionBreakdown,
  type Vulnerability as BackendVulnerability,
  type RoofType,
  type RoofCondition,
  type VentilationLevel,
  type WaterAccessLevel,
  type ReliefSpaceLevel,
} from "../../../../backend/lib/scoring/scoring";

import {
  optimize,
  type OptimizationInput,
  type OptimizationResult,
  type Intervention,
  type AlternativePackage,
} from "../../../../backend/lib/optimizer/optimizer";

import rawInterventions from "../../../../data/interventions.json";
import rawDemoBuildings from "../../../../data/demo-buildings.json";

// Re-export canonical types and utilities
export {
  scoreBuilding,
  classifyRisk,
  DIMENSION_WEIGHTS,
  optimize,
  optimize as optimizeKnapsack,
  type BuildingInput,
  type ScoringResult,
  type RiskLevel,
  type DimensionBreakdown,
  type OptimizationInput,
  type OptimizationResult,
  type Intervention,
  type AlternativePackage,
  type RoofType,
  type RoofCondition,
  type VentilationLevel,
  type WaterAccessLevel,
  type ReliefSpaceLevel,
};

export interface BuildingProfile {
  buildingId: string;
  name: string;
  type: string;
  facilityClass: string;
  location: string;
  latitude: number;
  longitude: number;
  occupancy: number;
  operatingHours: number;
  envelopeDescription: string;
  roofType: RoofType;
  roofCondition: RoofCondition;
  shadeCoverage: number;
  greenCoverage: number;
  ventilation: VentilationLevel;
  waterAccess: WaterAccessLevel;
  reliefSpace: ReliefSpaceLevel;
  weatherBaseline: {
    ambient: number;
    apparent: number;
    humidity: number;
    wind: number;
    cloud: number;
    precipitation: number;
    source: string;
  };
}

export interface VulnerabilityView {
  dimension: string;
  label: string;
  score: number;
  maxScore: number;
  severity: "high" | "medium" | "low";
  gap: number;
  description: string;
}

// ---------------------------------------------------------------------------
// Canonical Datasets
// ---------------------------------------------------------------------------

export const CATALOGUE_INTERVENTIONS: Intervention[] = rawInterventions as Intervention[];

export const DEMO_FACILITIES: Record<string, BuildingProfile> = {
  "demo-school-hyderabad": {
    buildingId: "demo-school-hyderabad",
    name: "Green Valley School",
    type: "school",
    facilityClass: "Primary & Secondary Education",
    location: "Hyderabad, Telangana",
    latitude: 17.385,
    longitude: 78.4867,
    occupancy: 350,
    operatingHours: 9,
    envelopeDescription: "Concrete flat roof in fair condition",
    roofType: "concrete",
    roofCondition: "fair",
    shadeCoverage: 25,
    greenCoverage: 15,
    ventilation: "medium",
    waterAccess: "poor",
    reliefSpace: "limited",
    weatherBaseline: {
      ambient: 37.0,
      apparent: 41.0,
      humidity: 55,
      wind: 14,
      cloud: 20,
      precipitation: 0.0,
      source: "Open-Meteo CC BY 4.0 (Hyderabad Baseline)",
    },
  },
  "demo-hospital-chennai": {
    buildingId: "demo-hospital-chennai",
    name: "City Primary Hospital",
    type: "hospital",
    facilityClass: "Public Healthcare Facility",
    location: "Chennai, Tamil Nadu",
    latitude: 13.0827,
    longitude: 80.2707,
    occupancy: 200,
    operatingHours: 24,
    envelopeDescription: "Concrete flat roof in poor condition",
    roofType: "concrete",
    roofCondition: "poor",
    shadeCoverage: 20,
    greenCoverage: 5,
    ventilation: "good",
    waterAccess: "adequate",
    reliefSpace: "limited",
    weatherBaseline: {
      ambient: 36.0,
      apparent: 43.0,
      humidity: 72,
      wind: 18,
      cloud: 35,
      precipitation: 0.0,
      source: "Open-Meteo CC BY 4.0 (Chennai Baseline)",
    },
  },
  "demo-apartment-delhi": {
    buildingId: "demo-apartment-delhi",
    name: "Sunrise Apartments",
    type: "apartment",
    facilityClass: "Low-Income Community Housing",
    location: "Delhi, NCR",
    latitude: 28.7041,
    longitude: 77.1025,
    occupancy: 120,
    operatingHours: 24,
    envelopeDescription: "Corrugated metal sheeting in poor condition",
    roofType: "metal",
    roofCondition: "poor",
    shadeCoverage: 5,
    greenCoverage: 3,
    ventilation: "poor",
    waterAccess: "adequate",
    reliefSpace: "none",
    weatherBaseline: {
      ambient: 39.0,
      apparent: 44.0,
      humidity: 48,
      wind: 10,
      cloud: 15,
      precipitation: 0.0,
      source: "Open-Meteo CC BY 4.0 (Delhi Baseline)",
    },
  },
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function getVulnerabilityDescription(dimKey: string, building: BuildingProfile): string {
  switch (dimKey) {
    case "shade":
      return `${building.shadeCoverage}% exterior shade coverage exposes building occupants and envelope to intense midday solar radiation.`;
    case "waterAccess":
      return `Water access rating '${building.waterAccess}' creates hydration risk for ${building.occupancy} occupants during peak temperature hours.`;
    case "reliefCapacity":
      return `Relief space rating '${building.reliefSpace}' lacks designated climate-controlled emergency recovery capacity.`;
    case "thermalProtection":
      return `${building.roofType} roof in '${building.roofCondition}' condition provides suboptimal thermal mass insulation.`;
    case "ventilation":
      return `Ventilation rating '${building.ventilation}' causes indoor air stagnation and slow overnight thermal cooling.`;
    case "greenInfrastructure":
      return `${building.greenCoverage}% vegetative cover provides minimal evapotranspiration cooling.`;
    case "exposure":
      return `${building.occupancy} occupants over ${building.operatingHours} operating hours elevate exposure severity.`;
    default:
      return "Deficit identified in resilience infrastructure.";
  }
}

export function formatVulnerabilities(
  backendVulns: BackendVulnerability[],
  profile: BuildingProfile
): VulnerabilityView[] {
  const dimensionTitles: Record<string, string> = {
    thermalProtection: "Thermal Protection",
    shade: "Outdoor & Perimeter",
    ventilation: "Internal Airflow",
    waterAccess: "Hydration Infrastructure",
    reliefCapacity: "Emergency Cooling",
    greenInfrastructure: "Surrounding Grounds",
    exposure: "Occupancy Density",
  };

  return backendVulns.map((v) => ({
    dimension: dimensionTitles[v.dimension] || v.dimension,
    label: v.label,
    score: v.score,
    maxScore: v.maxScore,
    severity: v.severity,
    gap: v.gap,
    description: getVulnerabilityDescription(v.dimension, profile),
  }));
}

// ---------------------------------------------------------------------------
// Canonical Facility Evaluation & Knapsack Optimization
// ---------------------------------------------------------------------------

export interface FacilityEvaluation {
  profile: BuildingProfile;
  score: number;
  riskLevel: RiskLevel;
  breakdown: DimensionBreakdown;
  vulnerabilities: VulnerabilityView[];
  optimization: OptimizationResult;
}

export function evaluateFacility(facilityKey: string, budget = 50000): FacilityEvaluation {
  const profile = DEMO_FACILITIES[facilityKey] || DEMO_FACILITIES["demo-school-hyderabad"];

  const buildingInput: BuildingInput = {
    buildingType: profile.type,
    location: profile.location,
    latitude: profile.latitude,
    longitude: profile.longitude,
    occupancy: profile.occupancy,
    operatingHours: profile.operatingHours,
    roofType: profile.roofType,
    roofCondition: profile.roofCondition,
    shadeCoverage: profile.shadeCoverage,
    greenCoverage: profile.greenCoverage,
    ventilation: profile.ventilation,
    waterAccess: profile.waterAccess,
    reliefSpace: profile.reliefSpace,
  };

  // Run the canonical backend scoring engine
  const scoringResult = scoreBuilding(buildingInput);

  // Run the canonical backend 0/1 knapsack optimizer
  const optimizationResult = optimize({
    assessmentId: profile.buildingId,
    currentScore: scoringResult.score,
    budget,
    interventions: CATALOGUE_INTERVENTIONS,
  });

  return {
    profile,
    score: scoringResult.score,
    riskLevel: scoringResult.riskLevel,
    breakdown: scoringResult.breakdown,
    vulnerabilities: formatVulnerabilities(scoringResult.vulnerabilities, profile),
    optimization: optimizationResult,
  };
}
