// src/i18n/intl-provider.tsx

import {
  type ReactNode,
  useEffect,
  useState,
  useCallback,
  useMemo,
} from 'react';
import { IntlProvider } from 'react-intl';
import { IntlErrorCode, type OnErrorFn } from '@formatjs/intl';
import { useLocaleStore } from './locale-store';
import { loadMessages } from './message-loader';
import { DEFAULT_LOCALE } from './locale-detection';
import type { SupportedLocale } from './locale-detection';

// ─────────────────────────────────────────────────────────────
// Error Handling
// ─────────────────────────────────────────────────────────────

/**
 * react-intl error handler.
 * In development, logs missing translations as warnings.
 * In production, silently falls back to defaultMessage.
 */
const handleIntlError: OnErrorFn = (error) => {
  if (error.code === IntlErrorCode.MISSING_TRANSLATION) {
    if (import.meta.env.DEV) {
      console.warn(`[i18n] Missing translation: ${error.message}`);
    }
    return;
  }

  if (import.meta.env.DEV) {
    console.error(`[i18n] IntlError:`, error);
  }
};

// ─────────────────────────────────────────────────────────────
// Loading Fallback
// ─────────────────────────────────────────────────────────────

function LocaleLoadingFallback() {
  return (
    <div
      role="status"
      aria-label="Loading language data"
      className="flex h-screen w-screen items-center justify-center
                 bg-neutral-50 dark:bg-neutral-900"
    >
      <div className="flex flex-col items-center gap-4">
        <div
          className="h-8 w-8 animate-spin rounded-full border-4
                     border-blue-200 border-t-blue-600"
        />
        <p className="text-sm text-neutral-500">Loading...</p>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Provider Component
// ─────────────────────────────────────────────────────────────

interface AppIntlProviderProps {
  children: ReactNode;
}

/**
 * Application-level IntlProvider wrapper.
 *
 * Responsibilities:
 * 1. Reads active locale from Zustand store
 * 2. Dynamically loads compiled messages for that locale
 * 3. Provides react-intl context to all children
 * 4. Shows loading fallback during locale transitions
 * 5. Falls back to DEFAULT_LOCALE on load failure
 */
export function AppIntlProvider({ children }: AppIntlProviderProps) {
  const locale = useLocaleStore((s) => s.locale);
  const setLoading = useLocaleStore((s) => s.setLoading);
  const setError = useLocaleStore((s) => s.setError);

  const [messages, setMessages] = useState<Record<string, string> | null>(null);
  const [activeLocale, setActiveLocale] = useState<SupportedLocale>(locale);

  // Load messages when locale changes
  const loadLocaleMessages = useCallback(
    async (targetLocale: SupportedLocale) => {
      setLoading(true);
      setError(null);

      try {
        const loadedMessages = await loadMessages(targetLocale);
        setMessages(loadedMessages);
        setActiveLocale(targetLocale);
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : 'Failed to load locale';
        setError(errorMessage);
        console.error(`[i18n] Failed to load locale "${targetLocale}":`, error);

        // Attempt fallback to default locale
        if (targetLocale !== DEFAULT_LOCALE) {
          try {
            const fallbackMessages = await loadMessages(DEFAULT_LOCALE);
            setMessages(fallbackMessages);
            setActiveLocale(DEFAULT_LOCALE);
          } catch {
            setMessages({});
            setActiveLocale(DEFAULT_LOCALE);
          }
        }
      } finally {
        setLoading(false);
      }
    },
    [setLoading, setError],
  );

  useEffect(() => {
    loadLocaleMessages(locale);
  }, [locale, loadLocaleMessages]);

  // Memoize the key to force re-render only on actual locale change
  const providerKey = useMemo(() => `intl-${activeLocale}`, [activeLocale]);

  // Show loading state during initial load
  if (messages === null) {
    return <LocaleLoadingFallback />;
  }

  return (
    <IntlProvider
      key={providerKey}
      locale={activeLocale}
      defaultLocale={DEFAULT_LOCALE}
      messages={messages}
      onError={handleIntlError}
    >
      {children}
    </IntlProvider>
  );
}
