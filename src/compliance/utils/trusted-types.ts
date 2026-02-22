// src/compliance/utils/trusted-types.ts

/**
 * TRUSTED TYPES CONFIGURATION
 *
 * Trusted Types is a browser API that prevents DOM XSS
 * by requiring all DOM sink assignments (innerHTML, etc.)
 * to go through a "policy" that sanitizes the input.
 *
 * Cross-ref: Doc 09 §5 for XSS prevention patterns
 */

/**
 * Initialize Trusted Types policy.
 * Call this once at app startup (in main.tsx).
 *
 * CSP header must include:
 *   require-trusted-types-for 'script';
 *   trusted-types banking-app;
 */
export function initTrustedTypes(): void {
  if (typeof window === 'undefined') return;

  if (
    'trustedTypes' in window &&
    (window as Record<string, unknown>).trustedTypes &&
    typeof ((window as Record<string, unknown>).trustedTypes as Record<string, unknown>).createPolicy === 'function'
  ) {
    const trustedTypes = (window as Record<string, unknown>).trustedTypes as {
      createPolicy: (name: string, policy: Record<string, unknown>) => void;
    };

    trustedTypes.createPolicy('banking-app', {
      /**
       * Sanitize HTML — only used for trusted content.
       * In a banking app, you should almost NEVER use innerHTML.
       * This policy exists as a safety net.
       */
      createHTML: (input: string): string => {
        // Strip all script tags and event handlers
        return input
          .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
          .replace(/on\w+\s*=\s*"[^"]*"/gi, '')
          .replace(/on\w+\s*=\s*'[^']*'/gi, '');
      },

      /**
       * Sanitize URLs — prevent javascript: protocol.
       */
      createScriptURL: (input: string): string => {
        const url = new URL(input, window.location.origin);
        if (url.protocol !== 'https:' && url.protocol !== 'http:') {
          throw new TypeError(`Blocked script URL with protocol: ${url.protocol}`);
        }
        return input;
      },
    });
  }
}
