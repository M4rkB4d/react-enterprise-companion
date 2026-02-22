// src/compliance/hooks/useConsentStore.ts

/**
 * GDPR CONSENT STATE MANAGEMENT
 *
 * Zustand 5.x store managing user consent preferences.
 * Persisted to localStorage and synced to the backend
 * so that server-side processing respects user choices.
 *
 * Cross-ref: Doc 04 §3 for Zustand store patterns
 */

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { ConsentPreferences, ConsentCategory } from '@/compliance/types/regulations';

/** Consent store state */
interface ConsentState {
  /** Current user consent preferences */
  preferences: ConsentPreferences;
  /** Whether the user has made a consent choice (banner dismissed) */
  hasConsented: boolean;
  /** Whether the preference center modal is open */
  isPreferenceCenterOpen: boolean;
}

/** Consent store actions */
interface ConsentActions {
  /** Accept all non-essential categories */
  acceptAll: () => void;
  /** Reject all non-essential categories */
  rejectAll: () => void;
  /** Toggle a specific consent category */
  toggleCategory: (category: Exclude<ConsentCategory, 'essential'>) => void;
  /** Save custom preferences from the preference center */
  savePreferences: (prefs: Partial<ConsentPreferences>) => void;
  /** Open the preference center modal */
  openPreferenceCenter: () => void;
  /** Close the preference center modal */
  closePreferenceCenter: () => void;
  /** Check if a specific category is consented */
  hasConsentFor: (category: ConsentCategory) => boolean;
  /** Reset all consent (for testing or account deletion) */
  resetConsent: () => void;
}

const CURRENT_POLICY_VERSION = '2.1.0';

const DEFAULT_PREFERENCES: ConsentPreferences = {
  essential: true, // Always true, cannot be changed
  analytics: false,
  marketing: false,
  personalization: false,
  third_party: false,
  updatedAt: new Date().toISOString(),
  policyVersion: CURRENT_POLICY_VERSION,
};

export const useConsentStore = create<ConsentState & ConsentActions>()(
  persist(
    (set, get) => ({
      // --- State ---
      preferences: { ...DEFAULT_PREFERENCES },
      hasConsented: false,
      isPreferenceCenterOpen: false,

      // --- Actions ---
      acceptAll: () => {
        const now = new Date().toISOString();
        set({
          preferences: {
            essential: true,
            analytics: true,
            marketing: true,
            personalization: true,
            third_party: true,
            updatedAt: now,
            policyVersion: CURRENT_POLICY_VERSION,
          },
          hasConsented: true,
        });
        // Sync to backend (fire-and-forget)
        syncConsentToBackend(get().preferences);
      },

      rejectAll: () => {
        const now = new Date().toISOString();
        set({
          preferences: {
            ...DEFAULT_PREFERENCES,
            updatedAt: now,
          },
          hasConsented: true,
        });
        syncConsentToBackend(get().preferences);
      },

      toggleCategory: (category) => {
        const current = get().preferences;
        const now = new Date().toISOString();
        set({
          preferences: {
            ...current,
            [category]: !current[category],
            updatedAt: now,
          },
        });
      },

      savePreferences: (prefs) => {
        const now = new Date().toISOString();
        set((state) => ({
          preferences: {
            ...state.preferences,
            ...prefs,
            essential: true, // Force essential to always be true
            updatedAt: now,
            policyVersion: CURRENT_POLICY_VERSION,
          },
          hasConsented: true,
          isPreferenceCenterOpen: false,
        }));
        syncConsentToBackend(get().preferences);
      },

      openPreferenceCenter: () => set({ isPreferenceCenterOpen: true }),
      closePreferenceCenter: () => set({ isPreferenceCenterOpen: false }),

      hasConsentFor: (category) => {
        if (category === 'essential') return true;
        return get().preferences[category] ?? false;
      },

      resetConsent: () => {
        set({
          preferences: { ...DEFAULT_PREFERENCES },
          hasConsented: false,
          isPreferenceCenterOpen: false,
        });
      },
    }),
    {
      name: 'gdpr-consent-preferences',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        preferences: state.preferences,
        hasConsented: state.hasConsented,
      }),
    },
  ),
);

/** Sync consent preferences to the backend (fire-and-forget) */
async function syncConsentToBackend(preferences: ConsentPreferences): Promise<void> {
  try {
    await fetch('/api/v1/consent', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(preferences),
    });
  } catch {
    console.warn('[GDPR] Failed to sync consent to backend');
  }
}
