// src/compliance/utils/feature-flag-governance.ts

/**
 * GOVERNED FEATURE FLAGS
 *
 * Feature flags that fall under SOX controls require
 * a change request ID and audit logging when toggled.
 *
 * Cross-ref: Doc 14 §4.8 for SOX feature flag governance
 */

import { useAuditTrail } from '@/compliance/hooks/useAuditTrail';

export interface GovernedFeatureFlag {
  readonly key: string;
  readonly name: string;
  readonly description: string;
  readonly soxControlled: boolean;
  readonly authorizedRoles: readonly string[];
  enabled: boolean;
  lastChangedAt: string | null;
  lastChangedBy: string | null;
  changeRequestId: string | null;
}

/** Registry of all governed feature flags */
export const FEATURE_FLAGS: GovernedFeatureFlag[] = [
  {
    key: 'new_balance_calculation',
    name: 'New Balance Calculation Engine',
    description: 'Uses the updated balance calculation algorithm',
    soxControlled: true,
    authorizedRoles: ['release_manager'],
    enabled: false,
    lastChangedAt: null,
    lastChangedBy: null,
    changeRequestId: null,
  },
  {
    key: 'dark_mode',
    name: 'Dark Mode',
    description: 'Enables dark mode UI theme',
    soxControlled: false,
    authorizedRoles: ['developer', 'release_manager'],
    enabled: true,
    lastChangedAt: null,
    lastChangedBy: null,
    changeRequestId: null,
  },
];

/**
 * Hook for toggling governed feature flags with audit logging.
 */
export function useGovernedFeatureFlag(flagKey: string) {
  const { logEvent } = useAuditTrail();

  const toggleFlag = async (changeRequestId: string, newState: boolean): Promise<void> => {
    const flag = FEATURE_FLAGS.find((f) => f.key === flagKey);
    if (!flag) throw new Error(`Unknown feature flag: ${flagKey}`);

    if (flag.soxControlled && !changeRequestId) {
      throw new Error(`SOX-controlled flag "${flagKey}" requires a change request ID`);
    }

    const response = await fetch('/api/v1/feature-flags', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ key: flagKey, enabled: newState, changeRequestId }),
    });

    if (!response.ok) throw new Error('Failed to update feature flag');

    logEvent({
      action: newState ? 'feature_flag.enabled' : 'feature_flag.disabled',
      resource: `feature_flag:${flagKey}`,
      metadata: {
        soxControlled: flag.soxControlled,
        changeRequestId,
        previousState: flag.enabled,
        newState,
      },
    });
  };

  return { toggleFlag };
}
