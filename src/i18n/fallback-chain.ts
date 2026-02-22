// src/i18n/fallback-chain.ts

import type { SupportedLocale } from './locale-detection';

/**
 * Defines the fallback chain for message resolution.
 *
 * When a message is missing for a specific locale, react-intl will:
 * 1. Look for the message in the current locale (e.g., fr-CA)
 * 2. Fall back to the base language (e.g., fr-FR)
 * 3. Fall back to the default locale (en-US)
 * 4. Use the defaultMessage from the defineMessages call
 */
export function getFallbackLocales(
  locale: SupportedLocale,
): SupportedLocale[] {
  const fallbacks: Record<string, SupportedLocale[]> = {
    'en-GB': ['en-US'],
    'fr-CA': ['fr-FR', 'en-US'],
    'ar-AE': ['ar-SA', 'en-US'],
    // All others fall back directly to en-US
  };

  return fallbacks[locale] ?? ['en-US'];
}

/**
 * Merges messages with fallback chain.
 * Priority: specific locale > fallback locale > default locale
 */
export function mergeWithFallbacks(
  messages: Record<string, string>,
  fallbackMessages: Record<string, string>[],
): Record<string, string> {
  // Start with the most general fallback and layer on specifics
  const merged = {
    ...fallbackMessages.reduceRight(
      (acc, fb) => ({ ...acc, ...fb }),
      {},
    ),
  };

  // Apply the specific locale messages last (highest priority)
  return { ...merged, ...messages };
}
