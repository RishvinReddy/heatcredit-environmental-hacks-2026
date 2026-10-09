// apps/web/src/lib/api.ts

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

export async function fetchHealth() {
  const res = await fetch(`${API_BASE}/health`);
  if (!res.ok) throw new Error("Health check failed");
  return res.json();
}

export async function fetchInterventions() {
  const res = await fetch(`${API_BASE}/interventions`);
  if (!res.ok) throw new Error("Failed to fetch interventions");
  return res.json();
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
  const res = await fetch(`${API_BASE}/assessments/${id}`);
  if (!res.ok) {
    if (res.status === 404) return null;
    throw new Error("Failed to get assessment");
  }
  return res.json();
}

export async function optimizeBudget(assessmentId: string, budget: number) {
  const res = await fetch(`${API_BASE}/optimize`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ assessmentId, budget }),
  });
  if (!res.ok) throw new Error("Failed to run optimizer");
  return res.json();
}
