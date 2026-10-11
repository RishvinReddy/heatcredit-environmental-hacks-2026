// apps/web/src/lib/api.ts

import {
  evaluateFacility,
  optimize,
  CATALOGUE_INTERVENTIONS,
  DEMO_FACILITIES,
} from "./engine";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

export async function fetchHealth() {
  const res = await fetch(`${API_BASE}/health`);
  if (!res.ok) throw new Error("Health check failed");
  return res.json();
}

export async function fetchInterventions() {
  try {
    const res = await fetch(`${API_BASE}/interventions`);
    if (res.ok) {
      const data = await res.json();
      return {
        ...data,
        isFallback: false,
        provenance: "AWS SAM Deployed API",
      };
    }
  } catch (err) {
    console.warn("fetchInterventions: Live API unreachable, using canonical local catalogue", err);
  }
  return {
    interventions: CATALOGUE_INTERVENTIONS,
    count: CATALOGUE_INTERVENTIONS.length,
    isFallback: true,
    provenance: "Local Canonical Catalogue (Prototype)",
  };
}

export async function fetchWeather(lat: number, lon: number) {
  const res = await fetch(`${API_BASE}/weather?lat=${lat}&lon=${lon}`);
  if (!res.ok) throw new Error("Failed to fetch weather");
  return res.json();
}

export async function createAssessment(data: any) {
  const res = await fetch(`${API_BASE}/assessments`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Failed to create assessment");
  return res.json();
}

export async function getAssessment(id: string) {
  // 1. Explicit demo facility IDs are evaluated deterministically from canonical datasets
  if (DEMO_FACILITIES[id]) {
    const evaluation = evaluateFacility(id);
    return {
      assessmentId: id,
      buildingType: evaluation.profile.type,
      location: evaluation.profile.location,
      latitude: evaluation.profile.latitude,
      longitude: evaluation.profile.longitude,
      score: evaluation.score,
      riskLevel: evaluation.riskLevel,
      breakdown: evaluation.breakdown,
      vulnerabilities: evaluation.vulnerabilities,
      isDemoFacility: true,
      isPersisted: false,
      provenance: "Canonical Demo Facility Evaluation (In-Memory)",
      weatherSnapshot: {
        temperature: evaluation.profile.weatherBaseline.ambient,
        apparentTemperature: evaluation.profile.weatherBaseline.apparent,
        humidity: evaluation.profile.weatherBaseline.humidity,
        windSpeed: evaluation.profile.weatherBaseline.wind,
        cloudCover: evaluation.profile.weatherBaseline.cloud,
        precipitation: evaluation.profile.weatherBaseline.precipitation,
        source: evaluation.profile.weatherBaseline.source,
        isDemo: true,
      },
      modelMetadata: {
        version: "1.0.0-prototype",
        method: "weighted_linear_sum",
        assumptions: [
          "Assumes uniform exposure risk based on occupancy and operating hours.",
          "Weights and dimensions are static and calibrated to prototype adaptation guidelines.",
        ],
        limitations: [
          "Result is a calculated prototype score, not an independently validated engineering assessment.",
          "Depends partially on user-supplied or estimated information.",
        ],
        isPrototype: true,
        validationStatus: "prototype",
      },
    };
  }

  // 2. Real persisted assessment IDs (HC-...) are fetched directly from backend
  try {
    const res = await fetch(`${API_BASE}/assessments/${id}`);
    if (res.ok) {
      const data = await res.json();
      return {
        ...data,
        isDemoFacility: false,
        isPersisted: true,
        provenance: "DynamoDB Live Record",
      };
    }
    if (res.status === 404) return null;
    throw new Error(`Assessment lookup failed with HTTP ${res.status}`);
  } catch (err) {
    console.error(`getAssessment failed for ${id}:`, err);
    throw err;
  }
}

export async function optimizeBudget(assessmentId: string, budget: number) {
  // 1. For demo facilities, execute the canonical 0/1 knapsack algorithm client-side with provenance
  if (DEMO_FACILITIES[assessmentId]) {
    const evaluation = evaluateFacility(assessmentId, budget);
    return {
      ...evaluation.optimization,
      isDemoEvaluation: true,
      provenance: "Canonical 0/1 Knapsack Optimizer (Client Execution)",
    };
  }

  // 2. For real assessments, call the backend POST /optimize Lambda
  const res = await fetch(`${API_BASE}/optimize`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ assessmentId, budget }),
  });

  if (!res.ok) {
    const errBody = await res.json().catch(() => ({}));
    throw new Error(errBody.error || `Optimization service error (${res.status})`);
  }

  const data = await res.json();
  return {
    ...data,
    isDemoEvaluation: false,
    provenance: "AWS Lambda Live Optimization",
  };
}
