// src/compliance/utils/sox-evidence.ts

/**
 * SOX EVIDENCE COLLECTION
 *
 * Evidence gathering utilities for SOX compliance audits.
 * Screenshots of financial screens before/after changes
 * serve as evidence for auditors.
 *
 * Cross-ref: Doc 14 §4.6 for SOX evidence requirements
 */

export interface SOXEvidence {
  readonly evidenceId: string;
  readonly changeRequestId: string;
  readonly screenshotPath: string;
  readonly capturedAt: string;
  readonly capturedBy: string;
  readonly screenName: string;
  readonly commitHash: string;
  readonly branchName: string;
  readonly description: string;
}

/** Screens that require evidence capture for SOX audits */
export const SOX_EVIDENCE_SCREENS = [
  { path: '/accounts', name: 'Account Overview' },
  { path: '/accounts/statements', name: 'Account Statements' },
  { path: '/reports/monthly', name: 'Monthly Financial Report' },
  { path: '/reports/quarterly', name: 'Quarterly Financial Report' },
  { path: '/transactions', name: 'Transaction History' },
  { path: '/balances', name: 'Balance Summary' },
] as const;
