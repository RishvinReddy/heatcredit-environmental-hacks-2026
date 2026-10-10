export type WarningStatus = "active" | "none" | "unsupported" | "unavailable";

export interface Alert {
  id: string;
  event: string;
  severity?: string;
  effective?: string;
  expires?: string;
  url?: string;
  description?: string;
}

export interface WarningResult {
  status: WarningStatus;
  provider?: string;
  jurisdiction?: string;
  checkedAt: string;
  alerts: Alert[];
  message: string;
}

// Heat-related events taxonomy for NWS
const NWS_HEAT_EVENTS = [
  "Excessive Heat Warning",
  "Excessive Heat Watch",
  "Heat Advisory",
  "Extreme Heat Warning"
];

function isFiniteNumber(val: unknown): val is number {
  return typeof val === "number" && isFinite(val);
}

function isActiveAlert(alert: any, nowMs: number): boolean {
  const effectiveStr = alert.properties?.effective || alert.properties?.onset;
  const expiresStr = alert.properties?.expires || alert.properties?.ends;

  if (!effectiveStr) return false; // Requires an effective time

  const effectiveMs = new Date(effectiveStr).getTime();
  if (isNaN(effectiveMs)) return false;

  if (expiresStr) {
    const expiresMs = new Date(expiresStr).getTime();
    if (!isNaN(expiresMs)) {
      if (nowMs < effectiveMs || nowMs > expiresMs) {
        return false;
      }
    } else {
      // Malformed expires -> treat as invalid or proceed with caution?
      // "Handle missing or malformed timestamps according to documented NWS semantics."
      // If expires is malformed but effective is valid, we'll reject it to be safe,
      // or assume it's active if it hasn't expired. Let's reject malformed expires.
      return false;
    }
  } else {
    // Missing expiration. Some alerts are until further notice.
    if (nowMs < effectiveMs) return false;
  }

  return true;
}

export async function fetchNwsWarnings(
  lat: number,
  lon: number,
  fetchFn: typeof fetch = fetch,
  nowFn: () => number = Date.now
): Promise<WarningResult> {
  const nowStr = new Date(nowFn()).toISOString();

  if (!isFiniteNumber(lat) || lat < -90 || lat > 90 || !isFiniteNumber(lon) || lon < -180 || lon > 180) {
    return {
      status: "unavailable",
      checkedAt: nowStr,
      alerts: [],
      message: "Invalid coordinates provided."
    };
  }

  const headers = {
    "User-Agent": "HeatCredit/1.0 (contact: admin@heatcredit.local)",
    "Accept": "application/geo+json"
  };

  try {
    // 1. Establish Jurisdiction / Coverage using /points
    const pointUrl = `https://api.weather.gov/points/${lat.toFixed(4)},${lon.toFixed(4)}`;
    const pointRes = await fetchFn(pointUrl, { headers, signal: AbortSignal.timeout(5000) });

    if (pointRes.status === 404) {
      try {
        const errorData = await pointRes.json() as Record<string, any>;
        if (errorData.type === "https://api.weather.gov/problems/InvalidPoint") {
          return {
            status: "unsupported",
            checkedAt: nowStr,
            alerts: [],
            message: "Jurisdiction is not supported by NWS."
          };
        }
      } catch (e) {
        // Fall through to unavailable if body is missing/unparseable
      }
      return {
        status: "unavailable",
        checkedAt: nowStr,
        alerts: [],
        message: "NWS Points API returned 404 (endpoint not found)."
      };
    }

    if (!pointRes.ok) {
      return {
        status: "unavailable",
        checkedAt: nowStr,
        alerts: [],
        message: `NWS Points API failed with status ${pointRes.status}`
      };
    }

    // Attempt to parse point metadata to confirm it's valid
    const pointData = await pointRes.json() as Record<string, any>;
    if (!pointData.properties || !pointData.properties.gridId) {
      return {
        status: "unavailable",
        checkedAt: nowStr,
        alerts: [],
        message: "Jurisdiction could not be verified by NWS (missing metadata)."
      };
    }

    // 2. Fetch Active Alerts
    const alertsUrl = `https://api.weather.gov/alerts/active?point=${lat.toFixed(4)},${lon.toFixed(4)}`;
    const alertsRes = await fetchFn(alertsUrl, { headers, signal: AbortSignal.timeout(5000) });

    if (!alertsRes.ok) {
      return {
        status: "unavailable",
        provider: "US National Weather Service",
        jurisdiction: "US",
        checkedAt: nowStr,
        alerts: [],
        message: `NWS Alerts API failed with status ${alertsRes.status}`
      };
    }

    const alertsData = await alertsRes.json() as Record<string, any>;

    if (!alertsData.features || !Array.isArray(alertsData.features)) {
      return {
        status: "unavailable",
        provider: "US National Weather Service",
        jurisdiction: "US",
        checkedAt: nowStr,
        alerts: [],
        message: "Malformed response from NWS Alerts API."
      };
    }

    const nowMs = nowFn();
    const activeHeatAlerts: Alert[] = [];

    for (const feature of alertsData.features) {
      const props = feature.properties;
      if (!props || !props.event) continue;

      if (!NWS_HEAT_EVENTS.includes(props.event)) continue;

      if (isActiveAlert(feature, nowMs)) {
        activeHeatAlerts.push({
          id: props.id || feature.id || "unknown",
          event: props.event,
          severity: props.severity,
          effective: props.effective || props.onset,
          expires: props.expires || props.ends,
          url: feature.id && feature.id.startsWith('http') ? feature.id : undefined, // NWS uses feature.id as the URL often
          description: props.headline || props.description
        });
      }
    }

    if (activeHeatAlerts.length > 0) {
      return {
        status: "active",
        provider: "US National Weather Service",
        jurisdiction: "US",
        checkedAt: nowStr,
        alerts: activeHeatAlerts,
        message: "Official heat warnings are active."
      };
    }

    return {
      status: "none",
      provider: "US National Weather Service",
      jurisdiction: "US",
      checkedAt: nowStr,
      alerts: [],
      message: "No active official heat warnings found."
    };

  } catch (err) {
    return {
      status: "unavailable",
      checkedAt: nowStr,
      alerts: [],
      message: "Network or operational error while checking warnings."
    };
  }
}

export async function getWarnings(lat: number, lon: number): Promise<WarningResult> {
  // Try NWS (US). If unsupported, could try others in the future.
  const nwsResult = await fetchNwsWarnings(lat, lon);
  return nwsResult; // Currently NWS is the only provider
}
