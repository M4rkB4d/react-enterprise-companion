// src/compliance/utils/sox-change-management.ts

/**
 * SOX CHANGE MANAGEMENT
 *
 * Sarbanes-Oxley Section 404 requires "internal controls over
 * financial reporting." For frontend code, this means:
 * - Changes to financial UIs require approval chains
 * - No single person can develop AND deploy
 * - All changes must be traceable to a ticket
 *
 * Cross-ref: Doc 14 §4 for SOX compliance patterns
 * Cross-ref: Doc 12 §7 for CI/CD deployment gates
 */

/** File paths that contain financial reporting UI */
export const SOX_CONTROLLED_PATHS = [
  'src/features/accounts/**',
  'src/features/statements/**',
  'src/features/reports/**',
  'src/features/transactions/**',
  'src/features/balances/**',
  'src/compliance/**',
] as const;

/** SOX role definitions for segregation of duties */
export type SOXRole = 'developer' | 'code_reviewer' | 'qa_approver' | 'release_manager';

/** A SOX change record */
export interface ChangeRecord {
  readonly changeId: string;
  readonly ticketId: string;
  readonly description: string;
  readonly developer: string;
  readonly codeReviewer: string;
  readonly qaApprover: string;
  readonly releaseManager: string;
  readonly filesChanged: readonly string[];
  readonly affectsFinancialReporting: boolean;
  readonly approvedAt: string | null;
  readonly deployedAt: string | null;
  readonly rollbackPlan: string;
}

/**
 * Validate that a change record satisfies segregation of duties.
 * SOX requires that no single person fills multiple roles.
 */
export function validateSegregationOfDuties(record: ChangeRecord): {
  valid: boolean;
  violations: string[];
} {
  const violations: string[] = [];
  const people = {
    developer: record.developer,
    codeReviewer: record.codeReviewer,
    qaApprover: record.qaApprover,
    releaseManager: record.releaseManager,
  };

  const entries = Object.entries(people);
  for (let i = 0; i < entries.length; i++) {
    for (let j = i + 1; j < entries.length; j++) {
      const [roleA, personA] = entries[i];
      const [roleB, personB] = entries[j];
      if (personA === personB) {
        violations.push(`${personA} cannot be both ${roleA} and ${roleB}`);
      }
    }
  }

  return { valid: violations.length === 0, violations };
}

/**
 * Check if any changed files fall under SOX-controlled paths.
 */
export function isSOXControlledChange(changedFiles: readonly string[]): boolean {
  return changedFiles.some((file) =>
    SOX_CONTROLLED_PATHS.some((pattern) => {
      const prefix = pattern.replace('/**', '');
      return file.startsWith(prefix);
    }),
  );
}
