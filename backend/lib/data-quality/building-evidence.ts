export type EvidenceSourceCategory =
  | "measured"
  | "building_document"
  | "owner_reported"
  | "user_estimated"
  | "third_party_dataset";

export type VerificationStatus =
  | "verified"
  | "unverified"
  | "legacy_unverified";

export interface VerifierMetadata {
  verifiedBy: string;
  verifiedAt: string;
  method: string;
}

export interface EvidenceRecord {
  field: string;
  sourceCategory: EvidenceSourceCategory;
  timestamp: string; // ISO8601
  verificationStatus: VerificationStatus;
  sourceReference?: string;
  confidence?: number; // 0 to 1
  verifierMetadata?: VerifierMetadata;
}

export interface EvidenceCompletenessResult {
  completenessScore: number; // 0 to 100
  verifiedFields: number;
  totalSensitiveFields: number;
  isFullyVerified: boolean;
  missingProvenanceFields: string[];
}

export const EVIDENCE_SENSITIVE_FIELDS = [
  "occupancy",
  "operatingHours",
  "roofType",
  "roofCondition",
  "shadeCoverage",
  "greenCoverage",
  "ventilation",
  "waterAccess",
  "reliefSpace"
] as const;

export type EvidenceSensitiveField = typeof EVIDENCE_SENSITIVE_FIELDS[number];

function isValidISO8601(timestamp: unknown): boolean {
  if (typeof timestamp !== "string") return false;
  const isoRegex = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2})(\.\d+)?(Z|([+-])(\d{2}):(\d{2}))$/;
  const match = timestamp.match(isoRegex);
  if (!match) return false;

  const year = parseInt(match[1], 10);
  const month = parseInt(match[2], 10);
  const day = parseInt(match[3], 10);
  const hour = parseInt(match[4], 10);
  const minute = parseInt(match[5], 10);
  const second = parseInt(match[6], 10);

  if (month < 1 || month > 12) return false;

  const daysInMonth = [31, (year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0)) ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
  if (day < 1 || day > daysInMonth[month - 1]) return false;

  if (hour > 23 || minute > 59 || second > 59) return false;

  if (match[8] !== "Z") {
    const tzHour = parseInt(match[10], 10);
    const tzMinute = parseInt(match[11], 10);
    if (tzHour > 23 || tzMinute > 59) return false;
  }

  return true;
}

export function validateEvidenceRecord(field: string, record: unknown): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (typeof record !== "object" || record === null) {
    return { valid: false, errors: ["Evidence record must be an object."] };
  }

  const r = record as Record<string, unknown>;

  if (r.field !== field) {
    errors.push(`Evidence record for field '${field}' has mismatched internal field name '${r.field}'.`);
  }

  const validCategories: EvidenceSourceCategory[] = [
    "measured", "building_document", "owner_reported", "user_estimated", "third_party_dataset"
  ];
  if (!validCategories.includes(r.sourceCategory as any)) {
    errors.push(`Invalid sourceCategory '${r.sourceCategory}' for field '${field}'.`);
  }

  if (!isValidISO8601(r.timestamp)) {
    errors.push(`Invalid timestamp for field '${field}'. Must be an ISO8601 string.`);
  }

  const validStatuses: VerificationStatus[] = ["verified", "unverified", "legacy_unverified"];
  if (!validStatuses.includes(r.verificationStatus as any)) {
    errors.push(`Invalid verificationStatus '${r.verificationStatus}' for field '${field}'.`);
  }

  if (r.verificationStatus === "verified") {
    if (r.sourceCategory === "user_estimated") {
      errors.push(`Field '${field}' cannot be 'verified' when sourceCategory is 'user_estimated'.`);
    }

    if (r.sourceCategory === "owner_reported") {
      if (!r.verifierMetadata) {
        errors.push(`Field '${field}' with sourceCategory 'owner_reported' requires verifierMetadata to be 'verified'.`);
      }
    }
  }

  if (r.verifierMetadata) {
    const vmeta = r.verifierMetadata as Record<string, unknown>;
    if (typeof vmeta.verifiedBy !== "string" || !vmeta.verifiedBy.trim()) {
      errors.push(`Field '${field}' verifierMetadata must include a non-empty 'verifiedBy' string.`);
    }
    if (typeof vmeta.method !== "string" || !vmeta.method.trim()) {
      errors.push(`Field '${field}' verifierMetadata must include a non-empty 'method' string.`);
    }
    if (!isValidISO8601(vmeta.verifiedAt)) {
      errors.push(`Field '${field}' verifierMetadata must include a valid 'verifiedAt' ISO8601 string.`);
    }
  }

  if (r.confidence !== undefined) {
    if (typeof r.confidence !== "number" || !Number.isFinite(r.confidence) || r.confidence < 0 || r.confidence > 1) {
      errors.push(`Confidence for field '${field}' must be a finite number between 0 and 1.`);
    }
  }

  return { valid: errors.length === 0, errors };
}

export function calculateEvidenceCompleteness(
  evidence: Record<string, EvidenceRecord> | undefined | null
): EvidenceCompletenessResult {
  const ev = evidence || {};
  let verifiedCount = 0;
  let scorePoints = 0;
  const missingProvenanceFields: string[] = [];

  for (const field of EVIDENCE_SENSITIVE_FIELDS) {
    const record = ev[field];
    if (!record || record.verificationStatus === "legacy_unverified") {
      missingProvenanceFields.push(field);
    }

    if (!record) {
      continue;
    }

    // Weighting:
    // verified: 1 point
    // unverified (but explicitly provided with provenance): 0.5 points
    // legacy_unverified: 0 points
    if (record.verificationStatus === "verified") {
      verifiedCount++;
      scorePoints += 1;
    } else if (record.verificationStatus === "unverified") {
      scorePoints += 0.5;
    }
  }

  const total = EVIDENCE_SENSITIVE_FIELDS.length;
  const completenessScore = Math.round((scorePoints / total) * 100);

  return {
    completenessScore,
    verifiedFields: verifiedCount,
    totalSensitiveFields: total,
    isFullyVerified: verifiedCount === total,
    missingProvenanceFields
  };
}
