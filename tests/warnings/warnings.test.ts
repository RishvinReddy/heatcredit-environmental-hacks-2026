import test from "node:test";
import assert from "node:assert";
import { fetchNwsWarnings, WarningStatus } from "../../backend/lib/warnings/warnings";

// Mock Data
const validPointResponse = {
  properties: { gridId: "TEST" }
};

const activeHeatAlert = {
  id: "test-alert-1",
  properties: {
    event: "Excessive Heat Warning",
    severity: "Severe",
    effective: "2026-10-09T10:00:00Z",
    expires: "2026-10-09T20:00:00Z",
    headline: "Excessive Heat Warning issued"
  }
};

const nonHeatAlert = {
  id: "test-alert-2",
  properties: {
    event: "Severe Thunderstorm Warning",
    severity: "Severe",
    effective: "2026-10-09T10:00:00Z",
    expires: "2026-10-09T20:00:00Z"
  }
};

const makeFetchMock = (pointRes: any, alertsRes: any) => {
  return async (url: string) => {
    if (url.includes("/points/")) {
      if (pointRes.status) {
        return { ok: pointRes.status < 400, status: pointRes.status, json: async () => pointRes.body };
      }
      return { ok: true, status: 200, json: async () => pointRes };
    }
    if (url.includes("/alerts/active")) {
      if (alertsRes === null) return { ok: false, status: 404, json: async () => ({}) };
      if (alertsRes.status) {
        return { ok: alertsRes.status < 400, status: alertsRes.status, json: async () => alertsRes.body };
      }
      return { ok: true, status: 200, json: async () => alertsRes };
    }
    throw new Error("Unexpected URL");
  };
};

test("Warnings Integration - NWS Adapter", async (t) => {
  const nowMs = new Date("2026-10-09T15:00:00Z").getTime();
  const mockNow = () => nowMs;

  await t.test("1. Active official heat alert", async () => {
    const fetchMock = makeFetchMock(validPointResponse, { features: [activeHeatAlert] });
    const res = await fetchNwsWarnings(30, -90, fetchMock as any, mockNow);
    assert.strictEqual(res.status, "active" as WarningStatus);
    assert.strictEqual(res.alerts.length, 1);
    assert.strictEqual(res.alerts[0].event, "Excessive Heat Warning");
  });

  await t.test("2. No matching active heat alert", async () => {
    const fetchMock = makeFetchMock(validPointResponse, { features: [] });
    const res = await fetchNwsWarnings(30, -90, fetchMock as any, mockNow);
    assert.strictEqual(res.status, "none" as WarningStatus);
  });

  await t.test("3. Unsupported jurisdiction", async () => {
    const fetchMock = makeFetchMock({ status: 404, body: { type: "https://api.weather.gov/problems/InvalidPoint" } }, null);
    const res = await fetchNwsWarnings(51.5, -0.1, fetchMock as any, mockNow);
    assert.strictEqual(res.status, "unsupported" as WarningStatus);
  });

  await t.test("4. Provider HTTP 404 during point lookup (not InvalidPoint)", async () => {
    const fetchMock = makeFetchMock({ status: 404, body: {} }, null);
    const res = await fetchNwsWarnings(30, -90, fetchMock as any, mockNow);
    assert.strictEqual(res.status, "unavailable" as WarningStatus);
  });

  await t.test("5. Provider HTTP 404 during alert retrieval", async () => {
    const fetchMock = makeFetchMock(validPointResponse, { status: 404, body: {} });
    const res = await fetchNwsWarnings(30, -90, fetchMock as any, mockNow);
    assert.strictEqual(res.status, "unavailable" as WarningStatus);
  });

  await t.test("6. Provider HTTP 429", async () => {
    const fetchMock = makeFetchMock(validPointResponse, { status: 429, body: {} });
    const res = await fetchNwsWarnings(30, -90, fetchMock as any, mockNow);
    assert.strictEqual(res.status, "unavailable" as WarningStatus);
  });

  await t.test("7. Provider HTTP 500", async () => {
    const fetchMock = makeFetchMock(validPointResponse, { status: 500, body: {} });
    const res = await fetchNwsWarnings(30, -90, fetchMock as any, mockNow);
    assert.strictEqual(res.status, "unavailable" as WarningStatus);
  });

  await t.test("8. Network failure", async () => {
    const fetchMock = async () => { throw new Error("Network error"); };
    const res = await fetchNwsWarnings(30, -90, fetchMock as any, mockNow);
    assert.strictEqual(res.status, "unavailable" as WarningStatus);
  });

  await t.test("9. Timeout", async () => {
    const fetchMock = async (url: string, init?: RequestInit) => {
      if (init?.signal?.aborted) throw new Error("AbortError");
      throw new Error("Timeout"); // Simulating timeout exception
    };
    const res = await fetchNwsWarnings(30, -90, fetchMock as any, mockNow);
    assert.strictEqual(res.status, "unavailable" as WarningStatus);
  });

  await t.test("10. Malformed JSON", async () => {
    const fetchMock = async (url: string) => {
      if (url.includes("/points/")) return { ok: true, status: 200, json: async () => validPointResponse };
      return { ok: true, status: 200, json: async () => { throw new SyntaxError("Unexpected token"); } };
    };
    const res = await fetchNwsWarnings(30, -90, fetchMock as any, mockNow);
    assert.strictEqual(res.status, "unavailable" as WarningStatus);
  });

  await t.test("11. Invalid provider schema", async () => {
    const fetchMock = makeFetchMock(validPointResponse, { features: "not-an-array" });
    const res = await fetchNwsWarnings(30, -90, fetchMock as any, mockNow);
    assert.strictEqual(res.status, "unavailable" as WarningStatus);
  });

  await t.test("12. Expired alert", async () => {
    const fetchMock = makeFetchMock(validPointResponse, { features: [{ ...activeHeatAlert, properties: { ...activeHeatAlert.properties, expires: "2026-10-09T14:00:00Z" } }] });
    const res = await fetchNwsWarnings(30, -90, fetchMock as any, mockNow);
    assert.strictEqual(res.status, "none" as WarningStatus);
  });

  await t.test("13. Future-effective alert", async () => {
    const fetchMock = makeFetchMock(validPointResponse, { features: [{ ...activeHeatAlert, properties: { ...activeHeatAlert.properties, effective: "2026-10-09T16:00:00Z" } }] });
    const res = await fetchNwsWarnings(30, -90, fetchMock as any, mockNow);
    assert.strictEqual(res.status, "none" as WarningStatus);
  });

  await t.test("14. Missing or malformed timestamp", async () => {
    const fetchMock = makeFetchMock(validPointResponse, { features: [{ ...activeHeatAlert, properties: { ...activeHeatAlert.properties, effective: "invalid-date", expires: null } }] });
    const res = await fetchNwsWarnings(30, -90, fetchMock as any, mockNow);
    assert.strictEqual(res.status, "none" as WarningStatus);
  });

  await t.test("15. Non-heat alert filtering", async () => {
    const fetchMock = makeFetchMock(validPointResponse, { features: [nonHeatAlert] });
    const res = await fetchNwsWarnings(30, -90, fetchMock as any, mockNow);
    assert.strictEqual(res.status, "none" as WarningStatus);
  });

  await t.test("16. Official URL and attribution preservation", async () => {
    const fetchMock = makeFetchMock(validPointResponse, { features: [{ ...activeHeatAlert, id: "https://api.weather.gov/alerts/urn:oid:123" }] });
    const res = await fetchNwsWarnings(30, -90, fetchMock as any, mockNow);
    assert.strictEqual(res.status, "active" as WarningStatus);
    assert.strictEqual(res.alerts[0].url, "https://api.weather.gov/alerts/urn:oid:123");
    assert.strictEqual(res.provider, "US National Weather Service");
  });

  await t.test("17. Invalid coordinates (latitude)", async () => {
    let callCount = 0;
    const fetchMock = async () => { callCount++; return new Response(); };
    const res = await fetchNwsWarnings(999, -90, fetchMock as any, mockNow);
    assert.strictEqual(res.status, "unavailable" as WarningStatus);
    assert.strictEqual(callCount, 0, "Network request should not be made for invalid latitude");
  });

  await t.test("17b. Invalid coordinates (longitude)", async () => {
    let callCount = 0;
    const fetchMock = async () => { callCount++; return new Response(); };
    const res = await fetchNwsWarnings(30, -999, fetchMock as any, mockNow);
    assert.strictEqual(res.status, "unavailable" as WarningStatus);
    assert.strictEqual(callCount, 0, "Network request should not be made for invalid longitude");
  });

  await t.test("18. Zero-valued coordinates", async () => {
    const fetchMock = makeFetchMock({ status: 404, body: { type: "https://api.weather.gov/problems/InvalidPoint" } }, null);
    const res = await fetchNwsWarnings(0, 0, fetchMock as any, mockNow);
    // Since 0,0 is a valid coordinate format but unsupported by NWS, it should gracefully fall through and return unsupported
    assert.strictEqual(res.status, "unsupported" as WarningStatus);
  });

  await t.test("19. NWS missing metadata (gridId) in points response", async () => {
    const missingGridIdPointResponse = { properties: { other: "data" } };
    const fetchMock = makeFetchMock(missingGridIdPointResponse, null);
    const res = await fetchNwsWarnings(30, -90, fetchMock as any, mockNow);
    assert.strictEqual(res.status, "unavailable" as WarningStatus);
    assert.strictEqual(res.message, "Jurisdiction could not be verified by NWS (missing metadata).");
  });
});
