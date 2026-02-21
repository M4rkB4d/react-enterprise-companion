// src/i18n/sorting.ts

/**
 * Locale-aware string comparison for sorting.
 *
 * Different locales sort differently:
 * - German: a-umlaut sorts with a (not after z)
 * - Swedish: a-umlaut sorts after z
 * - Arabic: right-to-left sort order
 * - Japanese: kanji have multiple reading-based sort orders
 *
 * Always use Intl.Collator instead of String.localeCompare
 * for performance (Collator is reusable; localeCompare creates
 * a new internal Collator each time).
 */

/**
 * Creates a locale-aware comparator function for sorting strings.
 */
export function createCollator(
  locale: string,
  options?: Intl.CollatorOptions,
): (a: string, b: string) => number {
  const collator = new Intl.Collator(locale, {
    sensitivity: 'base',
    numeric: true,
    ...options,
  });

  return collator.compare.bind(collator);
}

/**
 * Sort an array of objects by a string property, locale-aware.
 *
 * @example
 * const sorted = sortByLocale(accounts, 'accountName', 'de-DE');
 */
export function sortByLocale<T>(
  items: T[],
  key: keyof T & string,
  locale: string,
  direction: 'asc' | 'desc' = 'asc',
): T[] {
  const compare = createCollator(locale);
  const sorted = [...items].sort((a, b) => {
    const valA = String(a[key] ?? '');
    const valB = String(b[key] ?? '');
    return compare(valA, valB);
  });

  return direction === 'desc' ? sorted.reverse() : sorted;
}
