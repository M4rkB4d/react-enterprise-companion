// src/compliance/utils/csp-stripe.ts

/**
 * CSP DIRECTIVES REQUIRED FOR STRIPE ELEMENTS
 *
 * These directives must be added to your CSP header
 * for Stripe Elements to function. See §7.8 for the
 * full CSP generator utility.
 *
 * Cross-ref: Doc 12 §5 for deployment header configuration
 */

export const STRIPE_CSP_DIRECTIVES = {
  /**
   * Stripe's JavaScript SDK loads from js.stripe.com.
   * The iframe content loads from js.stripe.com as well.
   */
  'script-src': ["'self'", 'https://js.stripe.com'],

  /**
   * The card input iframe is hosted by Stripe.
   */
  'frame-src': ["'self'", 'https://js.stripe.com'],

  /**
   * Stripe's iframe needs to send card data to Stripe's API.
   */
  'connect-src': ["'self'", 'https://api.stripe.com'],

  /**
   * Stripe loads its own styles inside the iframe.
   * 'unsafe-inline' is required because Stripe injects styles.
   * This is scoped to the iframe — your main app can use
   * stricter style-src if needed (see §7.8).
   */
  'style-src': ["'self'", "'unsafe-inline'"],

  /**
   * Stripe loads the card brand icons (Visa, Mastercard, etc.)
   */
  'img-src': ["'self'", 'https://*.stripe.com'],
} as const;
