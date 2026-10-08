/**
 * HeatCredit — Input Validation
 *
 * Validates all API inputs before they reach scoring or optimization.
 * Returns structured errors rather than throwing, so the API layer
 * can return clean 400 responses.
 */

import type { BuildingInput, RoofType, RoofCondition, VentilationLevel, WaterAccessLevel, ReliefSpaceLevel } from "../scoring/scoring";

// ---------------------------------------------------------------------------
// Allowed values
// ---------------------------------------------------------------------------

const ALLOWED_ROOF_TYPES: RoofType[] = [
  "concrete",
  "metal",
  "tile",
  "thatched",
  "green",
];

const ALLOWED_ROOF_CONDITIONS: RoofCondition[] = [
  "excellent",
  "good",
  "fair",
  "poor",
];

const ALLOWED_VENTILATION: VentilationLevel[] = [
  "poor",
  "medium",
  "good",
  "excellent",
];

const ALLOWED_WATER_ACCESS: WaterAccessLevel[] = [
  "none",
  "poor",
  "adequate",
  "good",
  "excellent",
];

const ALLOWED_RELIEF_SPACE: ReliefSpaceLevel[] = [
  "none",
  "limited",
  "adequate",
  "good",
  "excellent",
];

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface ValidationResult {
  valid: boolean;
  errors: string[];
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function isFiniteNumber(value: unknown): value is number {
  return typeof value === "number" && isFinite(value);
}

function inRange(value: number, min: number, max: number): boolean {
  return value >= min && value <= max;
}

function isAllowedValue<T>(value: unknown, allowed: T[]): value is T {
  return allowed.includes(value as T);
}

// ---------------------------------------------------------------------------
// Validate building assessment input
// ---------------------------------------------------------------------------

export function validateAssessmentInput(body: unknown): ValidationResult {
  const errors: string[] = [];

  if (typeof body !== "object" || body === null) {
    return { valid: false, errors: ["Request body must be a JSON object."] };
  }

  const b = body as Record<string, unknown>;

  // buildingType
  if (typeof b.buildingType !== "string" || b.buildingType.trim() === "") {
    errors.push("buildingType is required and must be a non-empty string.");
  }

  // location
  if (typeof b.location !== "string" || b.location.trim() === "") {
    errors.push("location is required and must be a non-empty string.");
  }

  // latitude
  if (!isFiniteNumber(b.latitude) || !inRange(b.latitude as number, -90, 90)) {
    errors.push("latitude must be a number between -90 and 90.");
  }

  // longitude
  if (!isFiniteNumber(b.longitude) || !inRange(b.longitude as number, -180, 180)) {
    errors.push("longitude must be a number between -180 and 180.");
  }

  // occupancy
  if (!isFiniteNumber(b.occupancy) || !inRange(b.occupancy as number, 1, 100000)) {
    errors.push("occupancy must be a number between 1 and 100000.");
  }

  // operatingHours
  if (!isFiniteNumber(b.operatingHours) || !inRange(b.operatingHours as number, 1, 24)) {
    errors.push("operatingHours must be a number between 1 and 24.");
  }

  // roofType
  if (!isAllowedValue(b.roofType, ALLOWED_ROOF_TYPES)) {
    errors.push(
      `roofType must be one of: ${ALLOWED_ROOF_TYPES.join(", ")}.`
    );
  }

  // roofCondition
  if (!isAllowedValue(b.roofCondition, ALLOWED_ROOF_CONDITIONS)) {
    errors.push(
      `roofCondition must be one of: ${ALLOWED_ROOF_CONDITIONS.join(", ")}.`
    );
  }

  // shadeCoverage
  if (
    !isFiniteNumber(b.shadeCoverage) ||
    !inRange(b.shadeCoverage as number, 0, 100)
  ) {
    errors.push("shadeCoverage must be a number between 0 and 100.");
  }

  // greenCoverage
  if (
    !isFiniteNumber(b.greenCoverage) ||
    !inRange(b.greenCoverage as number, 0, 100)
  ) {
    errors.push("greenCoverage must be a number between 0 and 100.");
  }

  // ventilation
  if (!isAllowedValue(b.ventilation, ALLOWED_VENTILATION)) {
    errors.push(
      `ventilation must be one of: ${ALLOWED_VENTILATION.join(", ")}.`
    );
  }

  // waterAccess
  if (!isAllowedValue(b.waterAccess, ALLOWED_WATER_ACCESS)) {
    errors.push(
      `waterAccess must be one of: ${ALLOWED_WATER_ACCESS.join(", ")}.`
    );
  }

  // reliefSpace
  if (!isAllowedValue(b.reliefSpace, ALLOWED_RELIEF_SPACE)) {
    errors.push(
      `reliefSpace must be one of: ${ALLOWED_RELIEF_SPACE.join(", ")}.`
    );
  }

  return { valid: errors.length === 0, errors };
}

// ---------------------------------------------------------------------------
// Validate optimization input
// ---------------------------------------------------------------------------

export function validateOptimizationInput(body: unknown): ValidationResult {
  const errors: string[] = [];

  if (typeof body !== "object" || body === null) {
    return { valid: false, errors: ["Request body must be a JSON object."] };
  }

  const b = body as Record<string, unknown>;

  if (typeof b.assessmentId !== "string" || b.assessmentId.trim() === "") {
    errors.push("assessmentId is required and must be a non-empty string.");
  }

  if (!isFiniteNumber(b.budget) || (b.budget as number) < 0) {
    errors.push("budget must be a non-negative number.");
  }

  if ((b.budget as number) > 10_000_000) {
    errors.push("budget must not exceed 10,000,000 (ten million).");
  }

  return { valid: errors.length === 0, errors };
}
