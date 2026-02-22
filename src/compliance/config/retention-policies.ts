// src/compliance/config/retention-policies.ts

/**
 * Client-side retention policies for browser storage.
 *
 * These policies govern how long data is kept in localStorage,
 * sessionStorage, and IndexedDB on the user's device.
 */

// ─── Types ───────────────────────────────────────────────

interface RetentionPolicy {
  /** Storage key or prefix to match */
  readonly keyPattern: string;
  /** Maximum age in milliseconds */
  readonly maxAgeMs: number;
  /** Storage type */
  readonly storageType: 'localStorage' | 'sessionStorage' | 'indexedDB';
  /** Human-readable description */
  readonly description: string;
  /** Regulation requiring this retention */
  readonly regulation: string;
}

// ─── Policies ────────────────────────────────────────────

const ONE_DAY = 24 * 60 * 60 * 1000;
const ONE_HOUR = 60 * 60 * 1000;

export const CLIENT_RETENTION_POLICIES: readonly RetentionPolicy[] = [
  {
    keyPattern: 'auth-token',
    maxAgeMs: 24 * ONE_HOUR,
    storageType: 'localStorage',
    description: 'Authentication tokens expire after 24 hours',
    regulation: 'PCI-DSS 8.1.8',
  },
  {
    keyPattern: 'session-',
    maxAgeMs: 30 * 60 * 1000, // 30 minutes
    storageType: 'sessionStorage',
    description: 'Session data expires after 30 minutes of inactivity',
    regulation: 'PCI-DSS 8.1.8',
  },
  {
    keyPattern: 'banking-locale',
    maxAgeMs: 365 * ONE_DAY,
    storageType: 'localStorage',
    description: 'Locale preference retained for 1 year',
    regulation: 'GDPR Article 5(1)(e)',
  },
  {
    keyPattern: 'banking-theme',
    maxAgeMs: 365 * ONE_DAY,
    storageType: 'localStorage',
    description: 'Theme preference retained for 1 year',
    regulation: 'GDPR Article 5(1)(e)',
  },
  {
    keyPattern: 'consent-preferences',
    maxAgeMs: 365 * ONE_DAY,
    storageType: 'localStorage',
    description: 'Consent records retained for regulatory proof',
    regulation: 'GDPR Article 7(1)',
  },
  {
    keyPattern: 'cached-account-',
    maxAgeMs: 15 * 60 * 1000, // 15 minutes
    storageType: 'sessionStorage',
    description: 'Account data cache cleared after 15 minutes',
    regulation: 'PCI-DSS 3.1',
  },
];

/**
 * Cache TTL configuration for TanStack Query.
 */
export const QUERY_CACHE_CONFIG = {
  /** Time data is considered fresh (no refetch) */
  staleTime: {
    accounts: 30 * 1000,      // 30 seconds
    transactions: 60 * 1000,   // 1 minute
    payments: 30 * 1000,       // 30 seconds
    audit: 5 * 60 * 1000,     // 5 minutes
    compliance: 60 * 1000,     // 1 minute
    theme: 10 * 60 * 1000,    // 10 minutes
  },
  /** Time unused data stays in cache before garbage collection */
  gcTime: {
    accounts: 5 * 60 * 1000,   // 5 minutes
    transactions: 10 * 60 * 1000, // 10 minutes
    payments: 5 * 60 * 1000,   // 5 minutes
    audit: 15 * 60 * 1000,     // 15 minutes
    compliance: 10 * 60 * 1000, // 10 minutes
    theme: 30 * 60 * 1000,     // 30 minutes
  },
} as const;

/**
 * Checks all client-side storage against retention policies.
 * Returns entries that have exceeded their maximum age.
 */
export function findExpiredEntries(): Array<{
  key: string;
  storageType: string;
  policy: RetentionPolicy;
}> {
  const expired: Array<{ key: string; storageType: string; policy: RetentionPolicy }> = [];

  for (const policy of CLIENT_RETENTION_POLICIES) {
    const storage =
      policy.storageType === 'localStorage' ? localStorage : sessionStorage;

    for (let i = 0; i < storage.length; i++) {
      const key = storage.key(i);
      if (!key || !key.startsWith(policy.keyPattern)) continue;

      try {
        const raw = storage.getItem(key);
        if (!raw) continue;

        const parsed = JSON.parse(raw);
        const timestamp = parsed._timestamp ?? parsed.state?._timestamp;

        if (timestamp && Date.now() - timestamp > policy.maxAgeMs) {
          expired.push({ key, storageType: policy.storageType, policy });
        }
      } catch {
        // Non-JSON entries can't be age-checked
      }
    }
  }

  return expired;
}

/**
 * Purges all expired entries from client-side storage.
 */
export function purgeExpiredEntries(): number {
  const expired = findExpiredEntries();

  for (const entry of expired) {
    const storage =
      entry.storageType === 'localStorage' ? localStorage : sessionStorage;
    storage.removeItem(entry.key);
  }

  return expired.length;
}
