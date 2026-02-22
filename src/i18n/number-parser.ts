// src/i18n/number-parser.ts

/**
 * Locale-aware number parser.
 *
 * Converts locale-formatted number strings to JavaScript numbers:
 *   "1,234.56" (en-US) -> 1234.56
 *   "1.234,56" (de-DE) -> 1234.56
 *   "1 234,56" (fr-FR) -> 1234.56
 *
 * This is essential for parsing user input in currency/number fields.
 */
export class LocaleNumberParser {
  private groupSep: string;
  private decimalSep: string;
  private numeralMap: Map<string, string>;

  constructor(locale: string) {
    // Detect grouping and decimal separators for this locale
    const parts = new Intl.NumberFormat(locale).formatToParts(1234567.89);
    this.groupSep = parts.find((p) => p.type === 'group')?.value ?? ',';
    this.decimalSep = parts.find((p) => p.type === 'decimal')?.value ?? '.';

    // Build a map from locale numerals to ASCII digits
    // This handles Arabic-Indic numerals, Devanagari, etc.
    this.numeralMap = new Map();
    const localeDigits = new Intl.NumberFormat(locale, {
      useGrouping: false,
    })
      .format(9876543210)
      .split('')
      .reverse();

    localeDigits.forEach((digit, index) => {
      this.numeralMap.set(digit, String(index));
    });
  }

  /**
   * Parse a locale-formatted string to a number.
   * Returns null if the input cannot be parsed.
   */
  parse(input: string): number | null {
    if (!input || typeof input !== 'string') return null;

    let normalized = input.trim();

    // Replace locale-specific numerals with ASCII digits
    this.numeralMap.forEach((ascii, localeDigit) => {
      normalized = normalized.replaceAll(localeDigit, ascii);
    });

    // Remove grouping separators
    normalized = normalized.replaceAll(this.groupSep, '');

    // Replace decimal separator with '.'
    normalized = normalized.replace(this.decimalSep, '.');

    // Remove any remaining non-numeric characters except . and -
    normalized = normalized.replace(/[^\d.\-]/g, '');

    const result = parseFloat(normalized);
    return Number.isFinite(result) ? result : null;
  }
}

/**
 * Factory function to create a parser for the current locale.
 * Caches parser instances per locale.
 */
const parserCache = new Map<string, LocaleNumberParser>();

export function getNumberParser(locale: string): LocaleNumberParser {
  let parser = parserCache.get(locale);
  if (!parser) {
    parser = new LocaleNumberParser(locale);
    parserCache.set(locale, parser);
  }
  return parser;
}
