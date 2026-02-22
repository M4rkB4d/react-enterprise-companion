// src/compliance/types/regulations.ts

/**
 * REGULATORY FRAMEWORK TYPES
 *
 * These types define the compliance domain model.
 * Every component in this guide references these types.
 *
 * Cross-ref: Doc 06 §3 for Zod schema patterns
 */

/** Supported regulatory frameworks */
export type Regulation = 'PCI_DSS' | 'GDPR' | 'SOX' | 'AML_KYC';

/** Compliance status for a given control */
export type ComplianceStatus = 'compliant' | 'non_compliant' | 'partial' | 'not_applicable';

/** Risk levels used across AML/KYC and compliance dashboards */
export type RiskLevel = 'low' | 'medium' | 'high' | 'critical';

/** Data classification levels — drives retention and encryption policies */
export type DataClassification = 'public' | 'internal' | 'confidential' | 'restricted';

/** A single compliance control (e.g., "PCI-DSS Requirement 3.4") */
export interface ComplianceControl {
  /** Unique control identifier (e.g., "PCI-3.4") */
  readonly id: string;
  /** Which regulation this control belongs to */
  readonly regulation: Regulation;
  /** Human-readable control name */
  readonly name: string;
  /** Detailed description of what this control requires */
  readonly description: string;
  /** Current compliance status */
  status: ComplianceStatus;
  /** When this control was last verified */
  lastVerified: string | null;
  /** Who verified this control */
  verifiedBy: string | null;
  /** Evidence references (URLs, ticket IDs) */
  evidence: readonly string[];
}

/** Aggregated compliance state for the entire application */
export interface ComplianceState {
  readonly controls: readonly ComplianceControl[];
  readonly overallStatus: ComplianceStatus;
  readonly lastAuditDate: string | null;
  readonly nextAuditDate: string | null;
}

/** Audit event — the atomic unit of the audit trail (see §5) */
export interface AuditEvent {
  /** Unique event identifier */
  readonly id: string;
  /** ISO-8601 timestamp */
  readonly timestamp: string;
  /** Authenticated user who performed the action */
  readonly userId: string;
  /** Machine-readable action type */
  readonly action: string;
  /** Resource affected (e.g., "account:123") */
  readonly resource: string;
  /** Additional structured metadata */
  readonly metadata: Record<string, unknown>;
  /** Correlation ID for tracing across services (see §5.3) */
  readonly correlationId: string;
  /** Hash of the previous event for tamper detection (see §5.8) */
  readonly previousHash: string | null;
  /** Hash of this event */
  readonly hash: string;
}

/** Consent categories for GDPR (see §3) */
export type ConsentCategory =
  | 'essential'
  | 'analytics'
  | 'marketing'
  | 'personalization'
  | 'third_party';

/** User consent preferences */
export interface ConsentPreferences {
  readonly essential: true; // Always true — cannot be opted out
  analytics: boolean;
  marketing: boolean;
  personalization: boolean;
  third_party: boolean;
  /** ISO-8601 timestamp of when consent was last updated */
  readonly updatedAt: string;
  /** Version of the privacy policy the user consented to */
  readonly policyVersion: string;
}

/** Data retention policy definition (see §6) */
export interface RetentionPolicy {
  /** Data type this policy applies to */
  readonly dataType: string;
  /** Classification level */
  readonly classification: DataClassification;
  /** Retention duration in days */
  readonly retentionDays: number;
  /** What happens when retention expires */
  readonly expiryAction: 'archive' | 'delete' | 'anonymize';
  /** Regulatory basis for this retention period */
  readonly regulatoryBasis: string;
}
