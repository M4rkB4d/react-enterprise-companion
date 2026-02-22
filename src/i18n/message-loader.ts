// src/i18n/message-loader.ts

import type { SupportedLocale } from './locale-detection';
import { DEFAULT_LOCALE } from './locale-detection';

/**
 * Cache for loaded message modules.
 * Prevents re-importing the same locale on subsequent switches.
 */
const messageCache = new Map<SupportedLocale, Record<string, string>>();

/**
 * Dynamically imports compiled messages for a given locale.
 *
 * Uses Vite's dynamic import with a glob pattern so that each locale
 * becomes a separate chunk in the production build.
 *
 * Falls back to DEFAULT_LOCALE if the requested locale file is missing.
 */
export async function loadMessages(
  locale: SupportedLocale,
): Promise<Record<string, string>> {
  // Return cached messages if available
  const cached = messageCache.get(locale);
  if (cached) return cached;

  try {
    // Dynamic import — each locale is a separate chunk
    const module = await import(`./messages/${locale}.json`);
    const messages = module.default as Record<string, string>;

    // Cache for future use
    messageCache.set(locale, messages);
    return messages;
  } catch (error) {
    console.warn(
      `[i18n] Failed to load messages for "${locale}". ` +
        `Falling back to "${DEFAULT_LOCALE}".`,
      error,
    );

    // Fallback: load default locale
    if (locale !== DEFAULT_LOCALE) {
      return loadMessages(DEFAULT_LOCALE);
    }

    // If even the default fails, return empty (react-intl will use defaultMessage)
    return {};
  }
}

/**
 * Preloads messages for a locale without activating it.
 * Useful for preloading likely next locales.
 */
export function preloadMessages(locale: SupportedLocale): void {
  if (!messageCache.has(locale)) {
    loadMessages(locale).catch(() => {
      // Silently ignore preload failures
    });
  }
}

/**
 * Clears the message cache. Useful for testing or forced reload.
 */
export function clearMessageCache(): void {
  messageCache.clear();
}
