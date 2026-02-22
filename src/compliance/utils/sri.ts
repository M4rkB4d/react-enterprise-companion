// src/compliance/utils/sri.ts

/**
 * SUBRESOURCE INTEGRITY (SRI)
 *
 * SRI ensures that CDN-loaded scripts have not been tampered with.
 * The browser compares the script's hash against the expected hash
 * and refuses to execute it if they do not match.
 *
 * Cross-ref: Doc 02 §8 for dependency management
 * Cross-ref: Doc 12 §5 for deployment configuration
 */

/**
 * SRI hashes for critical third-party scripts.
 * Update these when upgrading the scripts.
 *
 * Generate hashes with:
 *   shasum -b -a 384 script.js | xxd -r -p | base64
 *
 * Or use https://www.srihash.org/
 */
export const SRI_HASHES: Record<string, string> = {
  // Stripe.js — update when Stripe releases new versions
  'https://js.stripe.com/v3/': 'sha384-{HASH_FROM_STRIPE}',
} as const;

/**
 * Generate a script tag with SRI attributes.
 * Used when dynamically loading scripts.
 */
export function createSRIScript(src: string, integrity: string): HTMLScriptElement {
  const script = document.createElement('script');
  script.src = src;
  script.integrity = integrity;
  script.crossOrigin = 'anonymous'; // Required for SRI
  return script;
}
