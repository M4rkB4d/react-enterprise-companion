// src/kyc/components/RiskScoreDisplay.tsx

/**
 * AML/KYC Risk Score Visualization
 *
 * Displays a customer's risk score with visual indicators:
 * - Color-coded risk level (low/medium/high/critical)
 * - Contributing factors breakdown
 * - Score history trend
 */

import { useMemo } from 'react';

// ─── Types ───────────────────────────────────────────────

type RiskLevel = 'low' | 'medium' | 'high' | 'critical';

interface RiskFactor {
  readonly name: string;
  readonly score: number;
  readonly weight: number;
  readonly description: string;
}

interface RiskScoreData {
  readonly overallScore: number; // 0-100
  readonly level: RiskLevel;
  readonly factors: RiskFactor[];
  readonly lastAssessedAt: string; // ISO-8601
  readonly nextReviewAt: string; // ISO-8601
  readonly assessedBy: string;
}

// ─── Style Maps ──────────────────────────────────────────

const RISK_STYLES: Record<RiskLevel, { bg: string; text: string; ring: string; label: string }> = {
  low: { bg: 'bg-green-100', text: 'text-green-700', ring: 'ring-green-500', label: 'Low Risk' },
  medium: { bg: 'bg-yellow-100', text: 'text-yellow-700', ring: 'ring-yellow-500', label: 'Medium Risk' },
  high: { bg: 'bg-orange-100', text: 'text-orange-700', ring: 'ring-orange-500', label: 'High Risk' },
  critical: { bg: 'bg-red-100', text: 'text-red-700', ring: 'ring-red-500', label: 'Critical Risk' },
};

// ─── Sub-components ──────────────────────────────────────

function ScoreGauge({ score, level }: { score: number; level: RiskLevel }) {
  const styles = RISK_STYLES[level];

  return (
    <div className="relative flex flex-col items-center">
      <div
        className={`flex h-32 w-32 items-center justify-center rounded-full
                    ring-8 ${styles.ring} ${styles.bg}`}
      >
        <div className="text-center">
          <span className={`text-3xl font-bold ${styles.text}`}>{score}</span>
          <p className={`text-xs font-medium ${styles.text}`}>/100</p>
        </div>
      </div>
      <span
        className={`mt-2 rounded-full px-3 py-1 text-xs font-bold
                    ${styles.bg} ${styles.text}`}
      >
        {styles.label}
      </span>
    </div>
  );
}

function FactorBar({ factor }: { factor: RiskFactor }) {
  const barWidth = Math.min(factor.score, 100);
  const barColor =
    factor.score >= 75
      ? 'bg-red-500'
      : factor.score >= 50
        ? 'bg-orange-500'
        : factor.score >= 25
          ? 'bg-yellow-500'
          : 'bg-green-500';

  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between text-sm">
        <span className="font-medium text-slate-700">{factor.name}</span>
        <span className="text-xs text-slate-500">
          {factor.score}/100 (weight: {(factor.weight * 100).toFixed(0)}%)
        </span>
      </div>
      <div className="h-2 w-full overflow-hidden rounded-full bg-slate-200">
        <div
          className={`h-full rounded-full ${barColor} transition-all`}
          style={{ width: `${barWidth}%` }}
        />
      </div>
      <p className="text-xs text-slate-400">{factor.description}</p>
    </div>
  );
}

// ─── Main Component ──────────────────────────────────────

interface RiskScoreDisplayProps {
  readonly data: RiskScoreData;
  readonly onRequestReassessment?: () => void;
}

export function RiskScoreDisplay({ data, onRequestReassessment }: RiskScoreDisplayProps) {
  const sortedFactors = useMemo(
    () => [...data.factors].sort((a, b) => b.score * b.weight - a.score * a.weight),
    [data.factors],
  );

  return (
    <div className="rounded-lg border border-slate-200 bg-white p-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <h3 className="text-lg font-bold text-slate-900">Risk Assessment</h3>
        {onRequestReassessment && (
          <button
            type="button"
            onClick={onRequestReassessment}
            className="rounded-lg border border-slate-300 px-3 py-1.5 text-xs
                       font-medium text-slate-600 hover:bg-slate-50"
          >
            Request Reassessment
          </button>
        )}
      </div>

      {/* Score Gauge */}
      <div className="mt-6 flex justify-center">
        <ScoreGauge score={data.overallScore} level={data.level} />
      </div>

      {/* Assessment Metadata */}
      <div className="mt-4 flex justify-center gap-6 text-xs text-slate-500">
        <span>
          Assessed: {new Date(data.lastAssessedAt).toLocaleDateString()}
        </span>
        <span>
          Next review: {new Date(data.nextReviewAt).toLocaleDateString()}
        </span>
        <span>By: {data.assessedBy}</span>
      </div>

      {/* Risk Factors */}
      <div className="mt-6 space-y-4">
        <h4 className="text-sm font-semibold text-slate-700">
          Contributing Factors
        </h4>
        {sortedFactors.map((factor) => (
          <FactorBar key={factor.name} factor={factor} />
        ))}
      </div>
    </div>
  );
}
