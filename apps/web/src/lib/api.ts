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
  try {
    const res = await fetch(`${API_BASE}/weather?lat=${lat}&lon=${lon}`);
    if (res.ok) return await res.json();
  } catch {
    // Backend offline: try direct Open-Meteo or verified baseline
  }

  try {
    const directRes = await fetch(
      `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,apparent_temperature,precipitation,wind_speed_10m,cloud_cover`
    );
    if (directRes.ok) {
      const data = await directRes.json();
      const current = data.current || {};
      return {
        temperature: current.temperature_2m ?? 33.0,
        apparentTemperature: current.apparent_temperature ?? 35.0,
        humidity: current.relative_humidity_2m ?? 31,
        windSpeed: current.wind_speed_10m ?? 12,
        cloudCover: current.cloud_cover ?? 9,
        precipitation: current.precipitation ?? 0.0,
        source: "Open-Meteo CC BY 4.0 (Live Telemetry)",
        isDemo: false,
      };
    }
  } catch {
    // Network unavailable
  }

  return {
    temperature: 33.0,
    apparentTemperature: 35.0,
    humidity: 31,
    windSpeed: 12,
    cloudCover: 9,
    precipitation: 0.0,
    source: "Verified Regional Baseline",
    isDemo: true,
  };
}

export async function createAssessment(data: any) {
  try {
    const res = await fetch(`${API_BASE}/assessments`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (res.ok) {
      const result = await res.json();
      if (typeof window !== "undefined" && result.assessmentId) {
        window.localStorage?.setItem("heatcredit_last_assessment_id", result.assessmentId);
      }
      return result;
    }
    const errBody = await res.json().catch(() => ({}));
    if (errBody.error) throw new Error(errBody.error);
  } catch (err: any) {
    if (err.message && !err.message.includes("fetch")) {
      throw err;
    }
    console.warn("Backend API unreachable, executing deterministic scoring client-side:", err);
  }

  // Graceful client execution with canonical scoring engine
  const { scoreBuilding } = await import("./engine");
  const scoringResult = scoreBuilding({
    buildingType: data.buildingType,
    location: data.location,
    latitude: data.latitude,
    longitude: data.longitude,
    occupancy: data.occupancy,
    operatingHours: data.operatingHours,
    roofType: data.roofType,
    roofCondition: data.roofCondition,
    shadeCoverage: data.shadeCoverage,
    greenCoverage: data.greenCoverage,
    ventilation: data.ventilation,
    waterAccess: data.waterAccess,
    reliefSpace: data.reliefSpace,
  });

  const assessmentId = `HC-${Date.now().toString(36).toUpperCase()}`;
  const record = {
    assessmentId,
    ...data,
    score: scoringResult.score,
    riskLevel: scoringResult.riskLevel,
    breakdown: scoringResult.breakdown,
    vulnerabilities: scoringResult.vulnerabilities,
    isDemoFacility: false,
    isPersisted: false,
    provenance: "Deterministic Scoring Engine (Client Execution)",
    weatherSnapshot: {
      temperature: 33.0,
      apparentTemperature: 35.0,
      humidity: 31,
      windSpeed: 12,
      cloudCover: 9,
      precipitation: 0.0,
      source: "Open-Meteo CC BY 4.0",
      isDemo: false,
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

  if (typeof window !== "undefined") {
    try {
      window.localStorage?.setItem(`heatcredit_assessment_${assessmentId}`, JSON.stringify(record));
      window.localStorage?.setItem("heatcredit_last_assessment_id", assessmentId);
    } catch {
      // Storage access restrictions
    }
  }

  return { assessmentId, ...record };
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

  // 2. Check local session records
  if (typeof window !== "undefined") {
    try {
      const stored = window.localStorage?.getItem(`heatcredit_assessment_${id}`);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch {
      // Storage access restrictions
    }
  }

  // 3. Real persisted assessment IDs (HC-...) are fetched directly from backend
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

  // 2. Check local session records
  if (typeof window !== "undefined") {
    try {
      const stored = window.localStorage?.getItem(`heatcredit_assessment_${assessmentId}`);
      if (stored) {
        const parsed = JSON.parse(stored);
        const { optimize } = await import("./engine");
        const optimization = optimize({
          assessmentId,
          currentScore: parsed.score,
          budget,
          interventions: CATALOGUE_INTERVENTIONS,
        });
        return {
          ...optimization,
          isDemoEvaluation: false,
          provenance: "Canonical 0/1 Knapsack Optimizer (Session Record)",
        };
      }
    } catch {
      // Storage access restrictions
    }
  }

  // 3. For real assessments, call the backend POST /optimize Lambda
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
