// src/i18n/a11y-lang-manager.ts

import { useEffect, type ReactNode } from 'react';
import { useLocaleStore } from './locale-store';

/**
 * Manages the `lang` attribute on the <html> element.
 *
 * WCAG 2.2 Success Criteria:
 * - 3.1.1 Language of Page (Level A) -- <html lang> is set
 * - 3.1.2 Language of Parts (Level AA) -- inline lang for mixed content
 *
 * @see Doc 14 section 6 for WCAG compliance requirements
 */
export function useLanguageAttribute() {
  const locale = useLocaleStore((s) => s.locale);
  const direction = useLocaleStore((s) => s.direction);

  useEffect(() => {
    const html = document.documentElement;

    // Set primary language (BCP 47 tag)
    html.setAttribute('lang', locale);

    // Set text direction
    html.setAttribute('dir', direction);

    // Set xml:lang for XHTML compatibility
    html.setAttribute('xml:lang', locale);

    return () => {
      html.removeAttribute('xml:lang');
    };
  }, [locale, direction]);
}

/**
 * Component for inline language switches.
 *
 * Use this when a block of content is in a different language
 * than the page's main language.
 *
 * @example
 * <LangBlock lang="ar-SA" dir="rtl">
 *   <p>Arabic text here</p>
 * </LangBlock>
 */
export function LangBlock({
  lang,
  dir,
  children,
  className = '',
}: {
  lang: string;
  dir?: 'ltr' | 'rtl';
  children: ReactNode;
  className?: string;
}) {
  return (
    <span lang={lang} dir={dir} className={className}>
      {children}
    </span>
  );
}
