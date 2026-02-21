// src/compliance/utils/hash-chain.ts

/**
 * TAMPER-EVIDENT HASH CHAINING
 *
 * Each audit event includes a hash of the previous event.
 * If any event is modified or deleted, the chain breaks,
 * and the tampering is detectable.
 *
 * This is a simplified version of blockchain-style integrity.
 * The backend should also implement server-side hash chaining.
 *
 * Note: This is a defense-in-depth measure. The browser's
 * Web Crypto API provides the hashing. An attacker with full
 * browser access could bypass this, which is why server-side
 * verification is also required.
 */

/**
 * Generate a SHA-256 hash of an event's content.
 * Uses the Web Crypto API (available in all modern browsers).
 */
export async function hashEvent(
  eventData: string,
  previousHash: string | null,
): Promise<string> {
  const input = `${previousHash ?? 'GENESIS'}:${eventData}`;
  const encoder = new TextEncoder();
  const data = encoder.encode(input);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
}

/**
 * Verify a chain of audit events.
 * Returns the index of the first broken link, or -1 if valid.
 */
export async function verifyHashChain(
  events: readonly { hash: string; previousHash: string | null; data: string }[],
): Promise<number> {
  for (let i = 0; i < events.length; i++) {
    const event = events[i];
    const expectedHash = await hashEvent(event.data, event.previousHash);

    if (expectedHash !== event.hash) {
      return i; // Chain broken at this index
    }

    // Verify the link to the previous event
    if (i > 0 && event.previousHash !== events[i - 1].hash) {
      return i; // Previous hash does not match
    }
  }

  return -1; // Chain is valid
}
