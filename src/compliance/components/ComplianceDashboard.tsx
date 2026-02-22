// src/compliance/components/ComplianceDashboard.tsx

/**
 * COMPLIANCE MONITORING DASHBOARD
 *
 * Real-time overview of compliance status across all
 * regulatory frameworks. Shows:
 * - Overall compliance score
 * - Status per regulation (PCI-DSS, GDPR, SOX, AML/KYC)
 * - Recent policy violations
 * - Action items for compliance officers
 *
 * Cross-ref: Doc 08 §5 for TanStack Query patterns
 * Cross-ref: Doc 03 §7 for dashboard layout patterns
 */

import { useQuery } from '@tanstack/react-query';
import type { Regulation, ComplianceStatus } from '@/compliance/types/regulations';

interface ComplianceSummary {
  readonly overallScore: number;
  readonly byRegulation: Record<
    Regulation,
    {
      status: ComplianceStatus;
      controlsTotal: number;
      controlsPassing: number;
      lastVerified: string;
    }
  >;
  readonly recentViolations: readonly {
    id: string;
    timestamp: string;
    control: string;
    description: string;
    severity: 'low' | 'medium' | 'high' | 'critical';
  }[];
}

const STATUS_STYLES: Record<ComplianceStatus, string> = {
  compliant: 'bg-green-100 text-green-800 border-green-300',
  non_compliant: 'bg-red-100 text-red-800 border-red-300',
  partial: 'bg-amber-100 text-amber-800 border-amber-300',
  not_applicable: 'bg-slate-100 text-slate-600 border-slate-300',
};

const REGULATION_LABELS: Record<Regulation, string> = {
  PCI_DSS: 'PCI-DSS',
  GDPR: 'GDPR',
  SOX: 'SOX',
  AML_KYC: 'AML/KYC',
};

export function ComplianceDashboard() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['compliance-summary'],
    queryFn: async (): Promise<ComplianceSummary> => {
      const response = await fetch('/api/v1/compliance/summary');
      if (!response.ok) throw new Error('Failed to fetch compliance data');
      return response.json();
    },
    refetchInterval: 60_000,
  });

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <p className="text-slate-500">Loading compliance data...</p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-6 text-center">
        <p className="text-red-700">Failed to load compliance dashboard.</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Overall Score */}
      <div className="rounded-xl border border-slate-200 bg-white p-8 shadow-sm">
        <h2 className="mb-4 text-2xl font-bold text-slate-900">Compliance Overview</h2>
        <div className="flex items-center gap-8">
          <div
            className={`flex h-24 w-24 items-center justify-center rounded-full text-3xl font-bold ${
              data.overallScore >= 90
                ? 'bg-green-100 text-green-700'
                : data.overallScore >= 70
                  ? 'bg-amber-100 text-amber-700'
                  : 'bg-red-100 text-red-700'
            }`}
          >
            {data.overallScore}%
          </div>
          <div>
            <p className="text-lg font-medium text-slate-900">Overall Compliance Score</p>
            <p className="text-sm text-slate-500">
              Based on{' '}
              {Object.values(data.byRegulation).reduce((sum, r) => sum + r.controlsTotal, 0)}{' '}
              controls across {Object.keys(data.byRegulation).length} regulations
            </p>
          </div>
        </div>
      </div>

      {/* Per-Regulation Status */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        {(
          Object.entries(data.byRegulation) as [
            Regulation,
            (typeof data.byRegulation)[Regulation],
          ][]
        ).map(([regulation, info]) => (
          <div key={regulation} className={`rounded-lg border-2 p-6 ${STATUS_STYLES[info.status]}`}>
            <h3 className="text-lg font-bold">{REGULATION_LABELS[regulation]}</h3>
            <p className="mt-1 text-sm capitalize">{info.status.replace('_', ' ')}</p>
            <div className="mt-4">
              <div className="flex justify-between text-sm">
                <span>Controls Passing</span>
                <span className="font-semibold">
                  {info.controlsPassing}/{info.controlsTotal}
                </span>
              </div>
              <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-white/50">
                <div
                  className="h-full rounded-full bg-current opacity-50"
                  style={{
                    width: `${(info.controlsPassing / info.controlsTotal) * 100}%`,
                  }}
                />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Recent Violations */}
      {data.recentViolations.length > 0 && (
        <div className="rounded-xl border border-red-200 bg-white p-6">
          <h3 className="mb-4 text-lg font-bold text-red-700">
            Recent Violations ({data.recentViolations.length})
          </h3>
          <div className="space-y-3">
            {data.recentViolations.map((violation) => (
              <div
                key={violation.id}
                className="flex items-start justify-between rounded-lg border border-red-100 bg-red-50 p-4"
              >
                <div>
                  <p className="font-medium text-slate-900">{violation.control}</p>
                  <p className="mt-1 text-sm text-slate-600">{violation.description}</p>
                  <p className="mt-1 text-xs text-slate-400">{violation.timestamp}</p>
                </div>
                <span
                  className={`rounded-full px-2 py-0.5 text-xs font-bold ${
                    violation.severity === 'critical'
                      ? 'bg-red-600 text-white'
                      : violation.severity === 'high'
                        ? 'bg-orange-500 text-white'
                        : violation.severity === 'medium'
                          ? 'bg-amber-500 text-white'
                          : 'bg-slate-400 text-white'
                  }`}
                >
                  {violation.severity.toUpperCase()}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
