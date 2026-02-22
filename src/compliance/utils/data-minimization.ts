// src/compliance/utils/data-minimization.ts

/**
 * DATA MINIMIZATION UTILITIES
 *
 * GDPR Article 5(1)(c) — "adequate, relevant and limited
 * to what is necessary" (data minimization principle).
 *
 * These utilities help strip PII from data objects before
 * sending them to analytics, logging, or error tracking.
 *
 * Cross-ref: Doc 14 §3.6 for GDPR data minimization
 */

/**
 * Remove specified PII fields from a data object.
 * Returns a new object without the PII fields.
 */
export function stripPII<T extends Record<string, unknown>>(
  data: T,
  piiFields: readonly (keyof T)[],
): Omit<T, (typeof piiFields)[number]> {
  const result = { ...data };
  for (const field of piiFields) {
    delete result[field];
  }
  return result;
}

/**
 * Pick only the specified fields from a data object.
 * Allowlist approach — only known-safe fields are included.
 */
export function pickFields<T extends Record<string, unknown>, K extends keyof T>(
  data: T,
  fields: readonly K[],
): Pick<T, K> {
  const result = {} as Pick<T, K>;
  for (const field of fields) {
    if (field in data) {
      result[field] = data[field];
    }
  }
  return result;
}

/**
 * Creates a reusable PII stripper function for a given set of fields.
 * Useful for creating per-domain strippers.
 */
export function createPIIStripper<T extends Record<string, unknown>>(
  piiFields: readonly (keyof T)[],
): (data: T) => Omit<T, (typeof piiFields)[number]> {
  return (data: T) => stripPII(data, piiFields);
}
