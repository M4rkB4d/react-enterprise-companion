// src/compliance/utils/csp-generator.ts

/**
 * CSP HEADER GENERATOR
 *
 * Generates Content Security Policy headers for banking apps.
 * CSP prevents XSS attacks by controlling which resources
 * the browser is allowed to load.
 *
 * Cross-ref: Doc 12 §5 for deployment header configuration
 * Cross-ref: §2.4 for Stripe-specific CSP directives
 */

export interface CSPDirectives {
  'default-src': string[];
  'script-src': string[];
  'style-src': string[];
  'img-src': string[];
  'font-src': string[];
  'connect-src': string[];
  'frame-src': string[];
  'object-src': string[];
  'base-uri': string[];
  'form-action': string[];
  'frame-ancestors': string[];
  'require-trusted-types-for'?: string[];
  'trusted-types'?: string[];
}

/**
 * Base CSP directives for a banking SPA.
 * These are intentionally restrictive — add exceptions
 * only when required by specific integrations.
 */
export const BASE_CSP_DIRECTIVES: CSPDirectives = {
  'default-src': ["'self'"],
  'script-src': ["'self'"],
  'style-src': ["'self'", "'unsafe-inline'"], // Tailwind needs unsafe-inline
  'img-src': ["'self'", 'data:', 'https:'],
  'font-src': ["'self'"],
  'connect-src': ["'self'"],
  'frame-src': ["'none'"],
  'object-src': ["'none'"],
  'base-uri': ["'self'"],
  'form-action': ["'self'"],
  'frame-ancestors': ["'none'"], // Prevent clickjacking
};

/**
 * Generate a CSP header string from directives.
 */
export function generateCSPHeader(directives: CSPDirectives): string {
  return Object.entries(directives)
    .filter(([, values]) => values.length > 0)
    .map(([directive, values]) => `${directive} ${values.join(' ')}`)
    .join('; ');
}

/**
 * Merge additional directives into the base CSP.
 * Used to add Stripe, analytics, or other integration-specific rules.
 */
export function mergeCSPDirectives(
  base: CSPDirectives,
  additional: Partial<CSPDirectives>,
): CSPDirectives {
  const merged = { ...base };

  for (const [directive, values] of Object.entries(additional)) {
    const key = directive as keyof CSPDirectives;
    if (merged[key] && values) {
      merged[key] = [...new Set([...(merged[key] as string[]), ...values])];
    } else if (values) {
      (merged as Record<string, string[]>)[key] = values;
    }
  }

  return merged;
}

/**
 * Banking-specific CSP with Stripe Elements support.
 * This is the recommended CSP for production use.
 */
export function getBankingCSP(): string {
  const withStripe = mergeCSPDirectives(BASE_CSP_DIRECTIVES, {
    'script-src': ['https://js.stripe.com'],
    'frame-src': ['https://js.stripe.com'],
    'connect-src': ['https://api.stripe.com'],
  });

  return generateCSPHeader(withStripe);
}
