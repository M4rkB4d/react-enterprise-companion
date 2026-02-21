// src/i18n/locale-store.ts

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import {
  type SupportedLocale,
  DEFAULT_LOCALE,
  SUPPORTED_LOCALES,
  detectLocale,
  getDirection,
} from './locale-detection';

// ─────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────

interface LocaleState {
  /** The currently active locale */
  locale: SupportedLocale;
  /** Text direction derived from the active locale */
  direction: 'ltr' | 'rtl';
  /** Whether locale data is currently being loaded */
  isLoading: boolean;
  /** Error from last locale change attempt */
  error: string | null;
}

interface LocaleActions {
  /** Set the active locale and persist to localStorage */
  setLocale: (locale: SupportedLocale) => void;
  /** Reset to auto-detected locale (clears user preference) */
  resetToDetected: () => void;
  /** Set loading state (used by IntlProvider during message loading) */
  setLoading: (isLoading: boolean) => void;
  /** Set error state */
  setError: (error: string | null) => void;
}

type LocaleStore = LocaleState & LocaleActions;

// ─────────────────────────────────────────────────────────────
// Store
// ─────────────────────────────────────────────────────────────

export const useLocaleStore = create<LocaleStore>()(
  persist(
    (set, get) => ({
      // State — initial locale detected from browser/preference
      locale: DEFAULT_LOCALE,
      direction: 'ltr',
      isLoading: false,
      error: null,

      // Actions
      setLocale: (locale: SupportedLocale) => {
        if (!SUPPORTED_LOCALES.includes(locale)) {
          set({ error: `Unsupported locale: ${locale}` });
          return;
        }

        // Update direction attribute on <html> element
        const direction = getDirection(locale);
        document.documentElement.setAttribute('dir', direction);
        document.documentElement.setAttribute('lang', locale);

        set({
          locale,
          direction,
          error: null,
        });
      },

      resetToDetected: () => {
        const detected = detectLocale(null);
        get().setLocale(detected);
      },

      setLoading: (isLoading: boolean) => set({ isLoading }),
      setError: (error: string | null) => set({ error }),
    }),
    {
      name: 'banking-locale',
      storage: createJSONStorage(() => localStorage),
      // Only persist the locale preference, not transient state
      partialize: (state) => ({ locale: state.locale }),
    },
  ),
);
