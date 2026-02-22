// src/i18n/locale-detection.ts

import { match } from '@formatjs/intl-localematcher';

/**
 * Supported locales in the banking application.
 * Each locale requires a complete translation file.
 */
export const SUPPORTED_LOCALES = [
  'en-US', // English (United States) — default
  'en-GB', // English (United Kingdom)
  'ar-SA', // Arabic (Saudi Arabia) — RTL
  'ar-AE', // Arabic (UAE) — RTL
  'de-DE', // German (Germany)
  'fr-FR', // French (France)
  'fr-CA', // French (Canada)
  'es-ES', // Spanish (Spain)
  'ja-JP', // Japanese (Japan)
  'zh-CN', // Chinese Simplified (China)
  'hi-IN', // Hindi (India)
  'he-IL', // Hebrew (Israel) — RTL
] as const;

export type SupportedLocale = (typeof SUPPORTED_LOCALES)[number];

export const DEFAULT_LOCALE: SupportedLocale = 'en-US';

/** RTL locales for direction detection */
export const RTL_LOCALES: ReadonlySet<string> = new Set(['ar-SA', 'ar-AE', 'he-IL']);

/**
 * Detects the best locale using a three-tier fallback chain:
 *
 *   1. User preference (stored in localStorage via Zustand)
 *   2. Browser language (navigator.languages)
 *   3. Default locale (en-US)
 *
 * Uses @formatjs/intl-localematcher for BCP 47 negotiation.
 */
export function detectLocale(userPreference: SupportedLocale | null): SupportedLocale {
  // Tier 1: Explicit user preference
  if (userPreference && SUPPORTED_LOCALES.includes(userPreference)) {
    return userPreference;
  }

  // Tier 2: Browser languages
  try {
    const browserLocales = navigator.languages?.length
      ? [...navigator.languages]
      : [navigator.language];

    const matched = match(browserLocales, [...SUPPORTED_LOCALES], DEFAULT_LOCALE);

    return matched as SupportedLocale;
  } catch {
    // Tier 3: Default fallback
    return DEFAULT_LOCALE;
  }
}

/**
 * Determines text direction for a given locale.
 */
export function getDirection(locale: string): 'ltr' | 'rtl' {
  return RTL_LOCALES.has(locale) ? 'rtl' : 'ltr';
}

/**
 * Extracts the language subtag from a locale (e.g., 'en' from 'en-US').
 */
export function getLanguage(locale: SupportedLocale): string {
  return locale.split('-')[0];
}
