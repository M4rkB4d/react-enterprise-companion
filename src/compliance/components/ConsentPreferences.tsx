// src/compliance/components/ConsentPreferences.tsx

/**
 * GDPR CONSENT PREFERENCE CENTER
 *
 * Modal dialog allowing granular consent control.
 * Essential cookies are always enabled (locked toggle).
 *
 * Cross-ref: Doc 14 §3.1 for consent categories
 * Cross-ref: Doc 03 §5 for modal patterns
 */

import { useState } from 'react';
import { useConsentStore } from '@/compliance/hooks/useConsentStore';
import type { ConsentCategory } from '@/compliance/types/regulations';

interface CategoryInfo {
  readonly key: Exclude<ConsentCategory, 'essential'>;
  readonly label: string;
  readonly description: string;
}

const CATEGORIES: readonly CategoryInfo[] = [
  {
    key: 'analytics',
    label: 'Analytics',
    description:
      'Help us understand how you use our services to improve the experience. Includes page views and feature usage.',
  },
  {
    key: 'marketing',
    label: 'Marketing',
    description: 'Allow us to show you relevant offers and products based on your banking profile.',
  },
  {
    key: 'personalization',
    label: 'Personalization',
    description:
      'Remember your preferences like dashboard layout, language, and accessibility settings.',
  },
  {
    key: 'third_party',
    label: 'Third-Party Services',
    description:
      'Enable integrations with partner services like credit score monitoring and insurance quotes.',
  },
] as const;

export function ConsentPreferences() {
  const { preferences, savePreferences, closePreferenceCenter } = useConsentStore();

  const [localPrefs, setLocalPrefs] = useState({
    analytics: preferences.analytics,
    marketing: preferences.marketing,
    personalization: preferences.personalization,
    third_party: preferences.third_party,
  });

  const handleToggle = (key: Exclude<ConsentCategory, 'essential'>) => {
    setLocalPrefs((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleSave = () => {
    savePreferences(localPrefs);
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50">
      <div
        role="dialog"
        aria-label="Cookie preferences"
        className="mx-4 max-h-[80vh] w-full max-w-lg overflow-y-auto rounded-xl
                   bg-white p-8 shadow-2xl"
      >
        <h2 className="mb-2 text-xl font-bold text-slate-900">Cookie Preferences</h2>
        <p className="mb-6 text-sm text-slate-500">
          Choose which cookies you want to allow. Essential cookies cannot be disabled as they are
          required for core banking functionality.
        </p>

        {/* Essential — always on */}
        <div className="mb-4 rounded-lg border border-green-200 bg-green-50 p-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-slate-900">Essential</h3>
              <p className="mt-1 text-sm text-slate-600">
                Required for authentication, security, and core banking services. Cannot be
                disabled.
              </p>
            </div>
            <div
              className="flex h-6 w-11 items-center rounded-full bg-green-500 px-1"
              aria-label="Essential cookies: always enabled"
            >
              <div className="h-4 w-4 translate-x-5 rounded-full bg-white shadow" />
            </div>
          </div>
        </div>

        {/* Toggleable categories */}
        {CATEGORIES.map((cat) => (
          <div key={cat.key} className="mb-4 rounded-lg border border-slate-200 p-4">
            <div className="flex items-center justify-between">
              <div className="mr-4">
                <h3 className="font-semibold text-slate-900">{cat.label}</h3>
                <p className="mt-1 text-sm text-slate-600">{cat.description}</p>
              </div>
              <button
                type="button"
                role="switch"
                aria-checked={localPrefs[cat.key]}
                aria-label={`${cat.label}: ${localPrefs[cat.key] ? 'enabled' : 'disabled'}`}
                onClick={() => handleToggle(cat.key)}
                className={`flex h-6 w-11 shrink-0 items-center rounded-full px-1
                  transition-colors ${localPrefs[cat.key] ? 'bg-blue-600' : 'bg-slate-300'}`}
              >
                <div
                  className={`h-4 w-4 rounded-full bg-white shadow transition-transform ${
                    localPrefs[cat.key] ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>
          </div>
        ))}

        <div className="mt-6 flex gap-3">
          <button
            onClick={handleSave}
            className="flex-1 rounded-lg bg-blue-600 px-6 py-3 text-base
                       font-semibold text-white hover:bg-blue-700"
          >
            Save Preferences
          </button>
          <button
            onClick={closePreferenceCenter}
            className="flex-1 rounded-lg border border-slate-300 px-6 py-3
                       text-base font-semibold text-slate-700 hover:bg-slate-50"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
