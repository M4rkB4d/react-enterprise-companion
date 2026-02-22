// src/compliance/utils/storage-audit.ts

/**
 * BROWSER STORAGE AUDIT
 *
 * Scans localStorage and sessionStorage for unintended PII.
 * Run periodically or on demand to detect data leaks.
 *
 * Cross-ref: Doc 14 §3.11 for GDPR storage compliance
 */

const PII_PATTERNS = [
  { name: 'Email', pattern: /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/ },
  { name: 'Phone', pattern: /\+?1?\s*\(?\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{4}/ },
  { name: 'SSN', pattern: /\b\d{3}-?\d{2}-?\d{4}\b/ },
  { name: 'Card Number', pattern: /\b\d{13,19}\b/ },
  {
    name: 'Date of Birth',
    pattern: /\b(19|20)\d{2}[-/](0[1-9]|1[0-2])[-/](0[1-9]|[12]\d|3[01])\b/,
  },
] as const;

/** Keys that are known-safe and should be skipped */
const SAFE_KEYS = new Set([
  'gdpr-consent-preferences',
  'theme-preference',
  'sidebar-collapsed',
  'locale',
  'banking-locale',
  'banking-auth',
]);

export interface StorageAuditResult {
  readonly storage: 'localStorage' | 'sessionStorage';
  readonly key: string;
  readonly piiType: string;
  readonly sample: string;
}

/**
 * Audit a single storage instance for PII patterns.
 */
export function auditStorage(
  storage: Storage,
  storageName: 'localStorage' | 'sessionStorage',
): readonly StorageAuditResult[] {
  const results: StorageAuditResult[] = [];

  for (let i = 0; i < storage.length; i++) {
    const key = storage.key(i);
    if (!key || SAFE_KEYS.has(key)) continue;

    const value = storage.getItem(key);
    if (!value) continue;

    for (const { name, pattern } of PII_PATTERNS) {
      if (pattern.test(key) || pattern.test(value)) {
        results.push({
          storage: storageName,
          key,
          piiType: name,
          sample: value.length > 20 ? `${value.slice(0, 10)}...${value.slice(-5)}` : '***',
        });
      }
    }
  }

  return results;
}

/**
 * Run a full audit of both localStorage and sessionStorage.
 */
export function runFullStorageAudit(): readonly StorageAuditResult[] {
  const results: StorageAuditResult[] = [];
  try {
    results.push(...auditStorage(localStorage, 'localStorage'));
  } catch {
    // localStorage not available
  }
  try {
    results.push(...auditStorage(sessionStorage, 'sessionStorage'));
  } catch {
    // sessionStorage not available
  }
  return results;
}
