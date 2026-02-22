// src/compliance/utils/web-crypto.ts

/**
 * WEB CRYPTO API ENCRYPTION UTILITIES
 *
 * Uses the browser's native Web Crypto API (not a JS library)
 * for encrypting sensitive data stored in localStorage.
 *
 * Algorithm: AES-GCM (authenticated encryption)
 * Key derivation: PBKDF2 from user credentials
 *
 * Cross-ref: Doc 09 §7 for security best practices
 */

/**
 * Derive an encryption key from a user-provided password.
 * Uses PBKDF2 with a random salt for key derivation.
 */
export async function deriveKey(
  password: string,
  salt: Uint8Array<ArrayBuffer>,
): Promise<CryptoKey> {
  const encoder = new TextEncoder();
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    encoder.encode(password),
    'PBKDF2',
    false,
    ['deriveKey'],
  );

  return crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt,
      iterations: 100_000, // OWASP recommended minimum
      hash: 'SHA-256',
    },
    keyMaterial,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt'],
  );
}

/**
 * Encrypt data using AES-GCM.
 * Returns the encrypted data with the IV prepended.
 */
export async function encryptData(key: CryptoKey, plaintext: string): Promise<string> {
  const encoder = new TextEncoder();
  const iv = crypto.getRandomValues(new Uint8Array(12)); // 96-bit IV for GCM

  const ciphertext = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv },
    key,
    encoder.encode(plaintext),
  );

  // Combine IV + ciphertext and encode as base64
  const combined = new Uint8Array(iv.length + new Uint8Array(ciphertext).length);
  combined.set(iv);
  combined.set(new Uint8Array(ciphertext), iv.length);

  return btoa(String.fromCharCode(...combined));
}

/**
 * Decrypt data using AES-GCM.
 */
export async function decryptData(key: CryptoKey, encryptedBase64: string): Promise<string> {
  const combined = Uint8Array.from(atob(encryptedBase64), (c) => c.charCodeAt(0));

  const iv = combined.slice(0, 12);
  const ciphertext = combined.slice(12);

  const plaintext = await crypto.subtle.decrypt({ name: 'AES-GCM', iv }, key, ciphertext);

  return new TextDecoder().decode(plaintext);
}

/**
 * Generate a random salt for key derivation.
 * Store this alongside the encrypted data (salts are not secret).
 */
export function generateSalt(): Uint8Array<ArrayBuffer> {
  return crypto.getRandomValues(new Uint8Array(16));
}
