// src/i18n/direction-manager.ts

import { useEffect } from 'react';
import { useLocaleStore } from './locale-store';

/**
 * Component that manages the <html> element's dir and lang attributes.
 *
 * Place this once at the app root. It subscribes to the locale store
 * and updates the document direction whenever the locale changes.
 *
 * This ensures:
 * - The browser renders RTL text correctly
 * - CSS :dir() pseudo-class works
 * - Tailwind rtl: variant works
 * - Screen readers announce the correct language
 */
export function DirectionManager() {
  const locale = useLocaleStore((s) => s.locale);
  const direction = useLocaleStore((s) => s.direction);

  useEffect(() => {
    const html = document.documentElement;

    // Set text direction
    html.setAttribute('dir', direction);
    html.style.direction = direction;

    // Set language for accessibility and CSS :lang() selector
    html.setAttribute('lang', locale);

    // Set text-align on body for RTL base alignment
    document.body.style.textAlign = direction === 'rtl' ? 'right' : 'left';

    return () => {
      html.setAttribute('dir', 'ltr');
      html.removeAttribute('lang');
      document.body.style.textAlign = '';
    };
  }, [locale, direction]);

  return null; // This component renders nothing
}
