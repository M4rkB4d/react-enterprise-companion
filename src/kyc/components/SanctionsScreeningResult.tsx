// src/kyc/components/SanctionsScreeningResult.tsx

/**
 * Displays the results of a sanctions screening check against
 * major sanctions lists (OFAC SDN, EU, UN, HMT).
 */

import { useEffect } from 'react';
import { useAuditTrail } from '@/compliance/hooks/useAuditTrail';

// ─── Types ───────────────────────────────────────────────

export type SanctionsList = 'OFAC_SDN' | 'EU_CONSOLIDATED' | 'UN_SECURITY_COUNCIL' | 'HMT';
export type ScreeningOutcome = 'clear' | 'potential_match' | 'confirmed_match';

export interface SanctionsMatch {
  readonly listName: SanctionsList;
  readonly matchedName: string;
  readonly matchScore: number;
  readonly listEntryId: string;
  readonly listedSince: string;
  readonly program: string;
  readonly remarks: string;
}

export interface SanctionsScreeningData {
  readonly screeningId: string;
  readonly subjectName: string;
  readonly subjectType: 'individual' | 'entity';
  readonly screenedAt: string;
  readonly outcome: ScreeningOutcome;
  readonly listsChecked: SanctionsList[];
  readonly matches: SanctionsMatch[];
  readonly processingTimeMs: number;
}

// ─── Style Maps ──────────────────────────────────────────

const OUTCOME_STYLES: Record<
  ScreeningOutcome,
  { border: string; bg: string; text: string; label: string }
> = {
  clear: {
    border: 'border-green-300',
    bg: 'bg-green-50',
    text: 'text-green-700',
    label: 'CLEAR - No Matches',
  },
  potential_match: {
    border: 'border-amber-300',
    bg: 'bg-amber-50',
    text: 'text-amber-700',
    label: 'POTENTIAL MATCH - Review Required',
  },
  confirmed_match: {
    border: 'border-red-400',
    bg: 'bg-red-50',
    text: 'text-red-700',
    label: 'CONFIRMED MATCH - Action Required',
  },
};

const LIST_LABELS: Record<SanctionsList, string> = {
  OFAC_SDN: 'OFAC Specially Designated Nationals (SDN)',
  EU_CONSOLIDATED: 'EU Consolidated Sanctions List',
  UN_SECURITY_COUNCIL: 'UN Security Council Consolidated List',
  HMT: 'UK HM Treasury Sanctions List',
};

// ─── Sub-components ──────────────────────────────────────

function MatchConfidenceBar({ score }: { readonly score: number }) {
  const color =
    score >= 90
      ? 'bg-red-500'
      : score >= 70
        ? 'bg-orange-500'
        : score >= 50
          ? 'bg-amber-500'
          : 'bg-blue-500';

  return (
    <div className="flex items-center gap-2">
      <div className="h-2 w-24 overflow-hidden rounded-full bg-slate-200">
        <div className={`h-full rounded-full ${color}`} style={{ width: `${score}%` }} />
      </div>
      <span className="text-xs font-medium text-slate-600">{score}%</span>
    </div>
  );
}

function MatchCard({ match }: { readonly match: SanctionsMatch }) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-4">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-bold text-slate-900">{match.matchedName}</p>
          <p className="mt-0.5 text-xs text-slate-500">
            {LIST_LABELS[match.listName]} | Entry: {match.listEntryId}
          </p>
        </div>
        <MatchConfidenceBar score={match.matchScore} />
      </div>
      <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
        <div>
          <span className="text-slate-400">Program:</span>{' '}
          <span className="font-medium text-slate-700">{match.program}</span>
        </div>
        <div>
          <span className="text-slate-400">Listed since:</span>{' '}
          <span className="font-medium text-slate-700">
            {new Date(match.listedSince).toLocaleDateString()}
          </span>
        </div>
      </div>
      {match.remarks && <p className="mt-2 text-xs text-slate-500">{match.remarks}</p>}
    </div>
  );
}

// ─── Main Component ──────────────────────────────────────

interface SanctionsScreeningResultProps {
  readonly data: SanctionsScreeningData;
  readonly onRequestRescreen?: (screeningId: string) => void;
  readonly onConfirmMatch?: (screeningId: string, matchEntryId: string) => void;
  readonly onDismissMatch?: (screeningId: string, matchEntryId: string) => void;
}

export function SanctionsScreeningResult({
  data,
  onRequestRescreen,
  onConfirmMatch,
  onDismissMatch,
}: SanctionsScreeningResultProps) {
  const outcomeStyle = OUTCOME_STYLES[data.outcome];
  const { logEvent } = useAuditTrail();

  useEffect(() => {
    logEvent({
      action: 'sanctions.screening_viewed',
      resource: `screening:${data.screeningId}`,
      metadata: {
        subjectName: data.subjectName,
        outcome: data.outcome,
        matchCount: data.matches.length,
      },
    });
  }, [data.screeningId, data.subjectName, data.outcome, data.matches.length, logEvent]);

  return (
    <div className={`rounded-lg border-2 ${outcomeStyle.border} ${outcomeStyle.bg} p-5`}>
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <span
            className={`inline-block rounded-full px-3 py-1 text-xs font-bold
                            ${outcomeStyle.text} ${outcomeStyle.bg} border ${outcomeStyle.border}`}
          >
            {outcomeStyle.label}
          </span>
          <h3 className="mt-2 text-lg font-bold text-slate-900">
            Sanctions Screening: {data.subjectName}
          </h3>
          <p className="mt-0.5 text-xs text-slate-500">
            {data.subjectType === 'individual' ? 'Individual' : 'Entity'} | Screened:{' '}
            {new Date(data.screenedAt).toLocaleString()} | Processing: {data.processingTimeMs}ms
          </p>
        </div>
        {onRequestRescreen && (
          <button
            type="button"
            onClick={() => onRequestRescreen(data.screeningId)}
            className="rounded-lg border border-slate-300 px-3 py-1.5 text-xs
                       font-medium text-slate-700 hover:bg-white"
          >
            Re-screen
          </button>
        )}
      </div>

      {/* Lists checked */}
      <div className="mt-4">
        <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
          Lists Checked
        </p>
        <div className="flex flex-wrap gap-2">
          {data.listsChecked.map((list) => {
            const hasMatch = data.matches.some((m) => m.listName === list);
            return (
              <span
                key={list}
                className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
                  hasMatch ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'
                }`}
              >
                {list.replace(/_/g, ' ')}
                {hasMatch ? ' - MATCH' : ' - Clear'}
              </span>
            );
          })}
        </div>
      </div>

      {/* Match results */}
      {data.matches.length > 0 && (
        <div className="mt-4 space-y-3">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            Matches Found ({data.matches.length})
          </p>
          {data.matches.map((match) => (
            <div key={`${match.listName}-${match.listEntryId}`}>
              <MatchCard match={match} />
              {(onConfirmMatch || onDismissMatch) && (
                <div className="mt-2 flex justify-end gap-2">
                  {onDismissMatch && (
                    <button
                      type="button"
                      onClick={() => onDismissMatch(data.screeningId, match.listEntryId)}
                      className="rounded-lg border border-slate-300 px-3 py-1
                                 text-xs font-medium text-slate-600 hover:bg-white"
                    >
                      Dismiss as False Positive
                    </button>
                  )}
                  {onConfirmMatch && (
                    <button
                      type="button"
                      onClick={() => onConfirmMatch(data.screeningId, match.listEntryId)}
                      className="rounded-lg bg-red-600 px-3 py-1 text-xs
                                 font-medium text-white hover:bg-red-700"
                    >
                      Confirm Match
                    </button>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Clear result */}
      {data.matches.length === 0 && (
        <div className="mt-4 rounded-lg bg-green-100 p-4 text-center">
          <p className="text-sm font-medium text-green-700">
            No matches found across {data.listsChecked.length} sanctions lists.
          </p>
          <p className="mt-1 text-xs text-green-600">Screening ID: {data.screeningId}</p>
        </div>
      )}

      {/* Footer */}
      <div className="mt-4 border-t border-slate-200 pt-3 text-xs text-slate-400">
        Screening ID: {data.screeningId} | Results are point-in-time and must be re-screened
        periodically per regulatory requirements.
      </div>
    </div>
  );
}
