// src/compliance/schemas/retention-schedule.ts

import { z } from 'zod';

/**
 * Data lifecycle phases for retention management.
 */
export type DataLifecyclePhase = 'active' | 'archived' | 'pending_purge' | 'purged';

/**
 * Retention duration configuration.
 */
export interface RetentionDuration {
  readonly value: number;
  readonly unit: 'days' | 'months' | 'years' | 'indefinite' | 'never';
}

/**
 * A single entry in the retention schedule.
 */
export interface RetentionScheduleEntry {
  readonly dataType: string;
  readonly displayLabel: string;
  readonly regulation: string;
  readonly activeRetention: RetentionDuration;
  readonly archiveRetention: RetentionDuration;
  readonly erasureEligible: boolean;
  readonly description: string;
}

/**
 * Complete retention schedule configuration.
 */
export interface RetentionScheduleConfig {
  readonly version: string;
  readonly lastReviewedAt: string;
  readonly approvedBy: string;
  readonly entries: RetentionScheduleEntry[];
}

/**
 * Zod schema for validating retention schedule from API.
 */
const retentionDurationSchema = z.object({
  value: z.number().nonnegative(),
  unit: z.enum(['days', 'months', 'years', 'indefinite', 'never']),
});

const retentionEntrySchema = z.object({
  dataType: z.string().min(1),
  displayLabel: z.string().min(1),
  regulation: z.string().min(1),
  activeRetention: retentionDurationSchema,
  archiveRetention: retentionDurationSchema,
  erasureEligible: z.boolean(),
  description: z.string(),
});

export const RetentionScheduleConfigSchema = z.object({
  version: z.string().min(1),
  lastReviewedAt: z.string().datetime(),
  approvedBy: z.string().min(1),
  entries: z.array(retentionEntrySchema),
});

/**
 * Default retention schedule based on regulatory requirements.
 */
export const DEFAULT_RETENTION_SCHEDULE: RetentionScheduleConfig = {
  version: '2.0',
  lastReviewedAt: '2025-01-15T00:00:00Z',
  approvedBy: 'Chief Compliance Officer',
  entries: [
    {
      dataType: 'transaction_records',
      displayLabel: 'Transaction Records',
      regulation: 'BSA/AML',
      activeRetention: { value: 5, unit: 'years' },
      archiveRetention: { value: 2, unit: 'years' },
      erasureEligible: false,
      description: 'Bank Secrecy Act requires 5-year retention of transaction records.',
    },
    {
      dataType: 'kyc_documents',
      displayLabel: 'KYC Documents',
      regulation: 'BSA/AML CDD Rule',
      activeRetention: { value: 5, unit: 'years' },
      archiveRetention: { value: 2, unit: 'years' },
      erasureEligible: false,
      description: 'Customer due diligence records retained for 5 years after account closure.',
    },
    {
      dataType: 'audit_logs',
      displayLabel: 'Audit Logs',
      regulation: 'SOX Section 802',
      activeRetention: { value: 7, unit: 'years' },
      archiveRetention: { value: 3, unit: 'years' },
      erasureEligible: false,
      description: 'SOX requires retention of audit records for 7 years.',
    },
    {
      dataType: 'consent_records',
      displayLabel: 'Consent Records',
      regulation: 'GDPR Article 7(1)',
      activeRetention: { value: 0, unit: 'indefinite' },
      archiveRetention: { value: 3, unit: 'years' },
      erasureEligible: false,
      description: 'Consent records retained for duration of processing + 3 years.',
    },
    {
      dataType: 'marketing_preferences',
      displayLabel: 'Marketing Preferences',
      regulation: 'GDPR Article 17',
      activeRetention: { value: 2, unit: 'years' },
      archiveRetention: { value: 0, unit: 'never' },
      erasureEligible: true,
      description: 'Subject to right to erasure. Purge 2 years after last opt-in.',
    },
    {
      dataType: 'session_logs',
      displayLabel: 'Session Logs',
      regulation: 'Internal Policy',
      activeRetention: { value: 90, unit: 'days' },
      archiveRetention: { value: 0, unit: 'never' },
      erasureEligible: true,
      description: 'Browser session data purged after 90 days.',
    },
  ],
};
