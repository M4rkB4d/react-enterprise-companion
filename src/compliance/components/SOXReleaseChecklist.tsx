// src/compliance/components/SOXReleaseChecklist.tsx

/**
 * SOX-compliant release checklist component.
 *
 * Ensures all required controls are verified before a production
 * deployment of financial software. Required by SOX Section 404
 * for internal controls over financial reporting.
 */

import { useState, useCallback } from 'react';
import { useAuditTrail } from '@/compliance/hooks/useAuditTrail';

// ─── Types ───────────────────────────────────────────────

interface ChecklistItem {
  readonly id: string;
  readonly category: string;
  readonly label: string;
  readonly description: string;
  readonly required: boolean;
  readonly verifiedBy?: string;
  readonly verifiedAt?: string;
}

interface SOXReleaseChecklistProps {
  readonly releaseVersion: string;
  readonly releaseDate: string;
  readonly onSubmit: (checklist: ChecklistItem[]) => Promise<void>;
}

// ─── Default Checklist Items ─────────────────────────────

const DEFAULT_CHECKLIST: ChecklistItem[] = [
  {
    id: 'code-review',
    category: 'Code Quality',
    label: 'Peer Code Review Completed',
    description: 'All changes reviewed by at least one other developer (not the author).',
    required: true,
  },
  {
    id: 'unit-tests',
    category: 'Testing',
    label: 'Unit Tests Pass (100%)',
    description: 'All unit tests pass with no failures or skips.',
    required: true,
  },
  {
    id: 'integration-tests',
    category: 'Testing',
    label: 'Integration Tests Pass',
    description: 'All integration and E2E tests pass in staging environment.',
    required: true,
  },
  {
    id: 'security-scan',
    category: 'Security',
    label: 'Security Scan Clear',
    description: 'No high or critical vulnerabilities from SAST/DAST scans.',
    required: true,
  },
  {
    id: 'dependency-audit',
    category: 'Security',
    label: 'Dependency Audit Clear',
    description: 'npm audit shows no high or critical vulnerabilities.',
    required: true,
  },
  {
    id: 'segregation',
    category: 'SOX Controls',
    label: 'Segregation of Duties Verified',
    description: 'Developer, reviewer, tester, and deployer are four different people.',
    required: true,
  },
  {
    id: 'change-approval',
    category: 'SOX Controls',
    label: 'Change Advisory Board Approval',
    description: 'CAB has approved this release for production deployment.',
    required: true,
  },
  {
    id: 'rollback-plan',
    category: 'Deployment',
    label: 'Rollback Plan Documented',
    description: 'Steps to revert to previous version are documented and tested.',
    required: true,
  },
  {
    id: 'monitoring',
    category: 'Deployment',
    label: 'Monitoring Configured',
    description: 'Error tracking, performance monitoring, and alerting are configured.',
    required: false,
  },
  {
    id: 'compliance-sign-off',
    category: 'SOX Controls',
    label: 'Compliance Officer Sign-Off',
    description: 'Compliance team has reviewed and approved changes affecting financial data.',
    required: true,
  },
];

// ─── Component ───────────────────────────────────────────

export function SOXReleaseChecklist({
  releaseVersion,
  releaseDate,
  onSubmit,
}: SOXReleaseChecklistProps) {
  const [items] = useState<ChecklistItem[]>(DEFAULT_CHECKLIST);
  const [checkedIds, setCheckedIds] = useState<Set<string>>(new Set());
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { logEvent } = useAuditTrail();

  const toggleItem = useCallback((id: string) => {
    setCheckedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }, []);

  const allRequiredChecked = items
    .filter((item) => item.required)
    .every((item) => checkedIds.has(item.id));

  const handleSubmit = useCallback(async () => {
    if (!allRequiredChecked) return;

    setIsSubmitting(true);
    try {
      const verifiedItems = items.map((item) => ({
        ...item,
        verifiedBy: checkedIds.has(item.id) ? 'current-user' : undefined,
        verifiedAt: checkedIds.has(item.id) ? new Date().toISOString() : undefined,
      }));

      await onSubmit(verifiedItems);

      logEvent({
        action: 'sox.release_checklist_submitted',
        resource: `release:${releaseVersion}`,
        metadata: {
          releaseVersion,
          releaseDate,
          totalItems: items.length,
          checkedItems: checkedIds.size,
        },
      });
    } catch (error) {
      logEvent({
        action: 'sox.release_checklist_failed',
        resource: `release:${releaseVersion}`,
        metadata: {
          error: error instanceof Error ? error.message : 'Unknown error',
        },
      });
    } finally {
      setIsSubmitting(false);
    }
  }, [allRequiredChecked, items, checkedIds, onSubmit, releaseVersion, releaseDate, logEvent]);

  // Group items by category
  const categories = [...new Set(items.map((item) => item.category))];

  return (
    <div className="rounded-lg border border-slate-200 bg-white">
      {/* Header */}
      <div className="border-b border-slate-200 p-6">
        <h2 className="text-xl font-bold text-slate-900">SOX Release Checklist</h2>
        <p className="mt-1 text-sm text-slate-500">
          Release {releaseVersion} scheduled for {releaseDate}
        </p>
        <p className="mt-2 text-xs text-slate-400">
          All required items must be verified before production deployment. This checklist is logged
          for SOX Section 404 compliance evidence.
        </p>
      </div>

      {/* Checklist Items */}
      <div className="divide-y divide-slate-100">
        {categories.map((category) => (
          <div key={category} className="p-6">
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-wide text-slate-500">
              {category}
            </h3>
            <div className="space-y-3">
              {items
                .filter((item) => item.category === category)
                .map((item) => (
                  <label
                    key={item.id}
                    className="flex cursor-pointer items-start gap-3 rounded-lg p-2
                               hover:bg-slate-50"
                  >
                    <input
                      type="checkbox"
                      checked={checkedIds.has(item.id)}
                      onChange={() => toggleItem(item.id)}
                      className="mt-1 h-4 w-4 rounded border-slate-300
                                 text-blue-600 focus:ring-blue-500"
                    />
                    <div>
                      <span className="text-sm font-medium text-slate-700">
                        {item.label}
                        {item.required && <span className="ml-1 text-red-500">*</span>}
                      </span>
                      <p className="mt-0.5 text-xs text-slate-400">{item.description}</p>
                    </div>
                  </label>
                ))}
            </div>
          </div>
        ))}
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between border-t border-slate-200 p-6">
        <p className="text-xs text-slate-400">
          {checkedIds.size}/{items.length} items verified
          {!allRequiredChecked && (
            <span className="ml-2 text-amber-600">(some required items are unchecked)</span>
          )}
        </p>
        <button
          type="button"
          onClick={handleSubmit}
          disabled={!allRequiredChecked || isSubmitting}
          className="rounded-lg bg-blue-600 px-6 py-2 text-sm font-medium
                     text-white hover:bg-blue-700 disabled:bg-slate-300
                     disabled:cursor-not-allowed"
        >
          {isSubmitting ? 'Submitting...' : 'Submit Release Checklist'}
        </button>
      </div>
    </div>
  );
}
