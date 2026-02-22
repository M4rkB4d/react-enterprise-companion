// src/components/locale-live-region.tsx

import { useRef, useEffect, useCallback } from 'react';
import { useLocaleStore } from '@/i18n/locale-store';

/**
 * Live region for announcing locale-aware messages to screen readers.
 *
 * Ensures announcements use the correct `lang` attribute so that
 * the screen reader switches to the appropriate TTS voice.
 *
 * @see Doc 11 section 4 for live region patterns
 */
export function useLocaleAnnouncer() {
  const locale = useLocaleStore((s) => s.locale);
  const regionRef = useRef<HTMLDivElement | null>(null);

  // Create the live region on mount
  useEffect(() => {
    const region = document.createElement('div');
    region.setAttribute('role', 'status');
    region.setAttribute('aria-live', 'polite');
    region.setAttribute('aria-atomic', 'true');
    region.setAttribute('lang', locale);
    region.className = 'sr-only';
    document.body.appendChild(region);
    regionRef.current = region;

    return () => {
      document.body.removeChild(region);
    };
  }, [locale]);

  // Update lang when locale changes
  useEffect(() => {
    if (regionRef.current) {
      regionRef.current.setAttribute('lang', locale);
    }
  }, [locale]);

  /**
   * Announce a message to screen readers in the current locale.
   */
  const announce = useCallback((message: string) => {
    if (regionRef.current) {
      // Clear and re-set to ensure re-announcement
      regionRef.current.textContent = '';
      requestAnimationFrame(() => {
        if (regionRef.current) {
          regionRef.current.textContent = message;
        }
      });
    }
  }, []);

  return announce;
}
