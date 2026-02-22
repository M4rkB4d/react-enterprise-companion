// src/compliance/utils/secure-deletion.ts

/**
 * Secure deletion utilities for PCI-DSS compliance.
 *
 * While JavaScript cannot guarantee physical overwriting of memory,
 * these utilities ensure that sensitive data is cleared from
 * JavaScript-accessible storage as thoroughly as possible.
 */

/**
 * Securely clear a string by overwriting with random characters.
 *
 * Note: Due to JavaScript string immutability, this creates a new
 * string. The original may persist in V8's heap until GC runs.
 * Use with TypedArrays for more reliable clearing.
 */
export function secureStringClear(value: string): string {
  // Create a replacement string of the same length
  const chars = new Uint8Array(value.length);
  crypto.getRandomValues(chars);
  return String.fromCharCode(...chars.map((c) => (c % 94) + 33));
}

/**
 * Securely clear a Uint8Array by overwriting with zeros then random bytes.
 * This is more reliable than string clearing.
 */
export function secureArrayClear(buffer: Uint8Array): void {
  // Pass 1: Zero fill
  buffer.fill(0);
  // Pass 2: Random fill
  crypto.getRandomValues(buffer);
  // Pass 3: Zero fill again
  buffer.fill(0);
}

/**
 * Clear all sensitive data from browser storage on logout.
 *
 * Called during the logout flow to ensure no PII or session
 * data remains in the browser.
 *
 * @see Doc 09 section 4 for the logout flow
 */
export function secureLogoutCleanup(): void {
  // Keys that MUST be cleared on logout
  const sensitiveKeys = [
    'auth-token',
    'auth-refresh-token',
    'banking-auth',
    'session-data',
    'user-profile',
    'account-cache',
  ];

  // Clear specific sensitive keys from localStorage
  for (const key of sensitiveKeys) {
    localStorage.removeItem(key);
  }

  // Clear all of sessionStorage (session-scoped data)
  sessionStorage.clear();

  // Clear any cached credentials
  if ('credentials' in navigator && 'preventSilentAccess' in navigator.credentials) {
    navigator.credentials.preventSilentAccess();
  }

  // Attempt to clear performance entries (may contain URLs with tokens)
  if (performance.clearResourceTimings) {
    performance.clearResourceTimings();
  }
}

/**
 * Remove a specific key from all storage types.
 * Used when a user exercises their right to erasure (GDPR Article 17).
 */
export function eraseFromAllStorage(key: string): void {
  localStorage.removeItem(key);
  sessionStorage.removeItem(key);

  // Also try to remove from IndexedDB
  const databases = indexedDB.databases?.();
  if (databases) {
    databases
      .then((dbs) => {
        for (const db of dbs) {
          if (db.name) {
            const request = indexedDB.open(db.name);
            request.onsuccess = () => {
              const transaction = request.result;
              const storeNames = Array.from(transaction.objectStoreNames);
              for (const storeName of storeNames) {
                try {
                  const tx = transaction.transaction(storeName, 'readwrite');
                  tx.objectStore(storeName).delete(key);
                } catch {
                  // Store may not contain this key
                }
              }
              transaction.close();
            };
          }
        }
      })
      .catch(() => {
        // indexedDB.databases() not supported in all browsers
      });
  }
}
