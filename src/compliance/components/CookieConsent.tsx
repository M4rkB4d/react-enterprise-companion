// src/compliance/components/CookieConsent.tsx

/**
 * GDPR COOKIE CONSENT BANNER
 *
 * Displays a full-width banner at the bottom of the screen
 * when the user has not yet made a consent choice.
 *
 * GDPR requires:
 * - Consent must be freely given (no dark patterns)
 * - Reject must be as easy as accept
 * - Essential cookies need no consent
 *
 * Cross-ref: Doc 14 §3.1 for consent management
 */

import { useConsentStore } from '@/compliance/hooks/useConsentStore';
import { ConsentPreferences } from './ConsentPreferences';

export function CookieConsent() {
  const {
    hasConsented,
    isPreferenceCenterOpen,
    acceptAll,
    rejectAll,
    openPreferenceCenter,
  } = useConsentStore();

  // Don't render if user has already made a choice
  if (hasConsented) return null;

  return (
    <>
      {/* Overlay */}
      <div className="fixed inset-0 z-40 bg-black/30" aria-hidden="true" />

      {/* Banner */}
      <div
        role="dialog"
        aria-label="Cookie consent"
        aria-modal="true"
        className="fixed inset-x-0 bottom-0 z-50 border-t border-slate-200
                   bg-white px-6 py-8 shadow-2xl sm:px-12"
      >
        <div className="mx-auto max-w-4xl">
          <h2 className="mb-3 text-xl font-semibold text-slate-900">
            Your Privacy Matters
          </h2>
          <p className="mb-6 text-base leading-relaxed text-slate-600">
            We use essential cookies to provide core banking services. We also
            use optional cookies for analytics, personalization, and marketing.
            You can customize your preferences or reject all non-essential
            cookies.{' '}
            <a
              href="/privacy-policy"
              className="font-medium text-blue-600 underline hover:text-blue-800"
            >
              Read our Privacy Policy
            </a>
          </p>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <button
              onClick={acceptAll}
              className="rounded-lg bg-blue-600 px-6 py-3 text-base font-semibold
                         text-white transition-colors hover:bg-blue-700"
            >
              Accept All
            </button>
            <button
              onClick={rejectAll}
              className="rounded-lg border-2 border-slate-300 bg-white px-6 py-3
                         text-base font-semibold text-slate-700 transition-colors
                         hover:border-slate-400 hover:bg-slate-50"
            >
              Reject Non-Essential
            </button>
            <button
              onClick={openPreferenceCenter}
              className="rounded-lg px-6 py-3 text-base font-semibold text-blue-600
                         underline transition-colors hover:text-blue-800"
            >
              Customize Preferences
            </button>
          </div>
        </div>
      </div>

      {/* Preference Center Modal */}
      {isPreferenceCenterOpen && <ConsentPreferences />}
    </>
  );
}
