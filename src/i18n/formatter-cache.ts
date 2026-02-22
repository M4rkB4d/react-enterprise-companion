// src/i18n/formatter-cache.ts

/**
 * Intl.NumberFormat and Intl.DateTimeFormat constructors are expensive.
 * Creating a new formatter on every render wastes CPU cycles.
 *
 * This module provides a LRU cache for formatter instances.
 * react-intl does this internally, but when using Intl directly
 * (e.g., in custom hooks), manual caching is important.
 *
 * @see Doc 10 section 5 for memoization patterns
 */

const CACHE_SIZE = 50;

class FormatterCache<T> {
  private cache = new Map<string, T>();

  get(key: string): T | undefined {
    const value = this.cache.get(key);
    if (value !== undefined) {
      // Move to end (most recently used)
      this.cache.delete(key);
      this.cache.set(key, value);
    }
    return value;
  }

  set(key: string, value: T): void {
    if (this.cache.size >= CACHE_SIZE) {
      // Evict least recently used (first entry)
      const firstKey = this.cache.keys().next().value;
      if (firstKey !== undefined) {
        this.cache.delete(firstKey);
      }
    }
    this.cache.set(key, value);
  }
}

const numberFormatCache = new FormatterCache<Intl.NumberFormat>();
const dateFormatCache = new FormatterCache<Intl.DateTimeFormat>();

/**
 * Get a cached Intl.NumberFormat instance.
 */
export function getNumberFormat(
  locale: string,
  options?: Intl.NumberFormatOptions,
): Intl.NumberFormat {
  const key = `${locale}-${JSON.stringify(options ?? {})}`;
  let formatter = numberFormatCache.get(key);
  if (!formatter) {
    formatter = new Intl.NumberFormat(locale, options);
    numberFormatCache.set(key, formatter);
  }
  return formatter;
}

/**
 * Get a cached Intl.DateTimeFormat instance.
 */
export function getDateFormat(
  locale: string,
  options?: Intl.DateTimeFormatOptions,
): Intl.DateTimeFormat {
  const key = `${locale}-${JSON.stringify(options ?? {})}`;
  let formatter = dateFormatCache.get(key);
  if (!formatter) {
    formatter = new Intl.DateTimeFormat(locale, options);
    dateFormatCache.set(key, formatter);
  }
  return formatter;
}
