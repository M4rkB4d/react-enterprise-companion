// src/hooks/use-currency-formatter.ts

import { useCallback } from 'react';
import { useIntl } from 'react-intl';
import { getCurrencyDecimals } from '@/i18n/currency-config';

/**
 * Options for currency formatting.
 */
interface CurrencyFormatOptions {
  /** Whether to show the currency symbol or code */
  display?: 'symbol' | 'code' | 'name' | 'narrowSymbol';
  /** Override the number of fraction digits */
  fractionDigits?: number;
  /** Whether to use accounting format for negative numbers: (100) vs -100 */
  accounting?: boolean;
  /** Compact notation: "$1.2K" instead of "$1,200" */
  compact?: boolean;
}

/**
 * Hook that provides locale-aware currency formatting functions.
 *
 * Uses the current locale from react-intl context to format amounts
 * according to the user's locale preferences.
 *
 * @example
 * const { format, formatParts } = useCurrencyFormatter('USD');
 * format(1234.56)        // -> "$1,234.56" (en-US) or "1.234,56 $" (de-DE)
 * format(-500, { accounting: true }) // -> "($500.00)"
 */
export function useCurrencyFormatter(defaultCurrency: string = 'USD') {
  const intl = useIntl();
  const { locale } = intl;

  /**
   * Format an amount as a currency string.
   */
  const format = useCallback(
    (
      amount: number,
      currencyCode: string = defaultCurrency,
      options: CurrencyFormatOptions = {},
    ): string => {
      const { display = 'symbol', fractionDigits, accounting = false, compact = false } = options;

      const decimals = fractionDigits ?? getCurrencyDecimals(currencyCode);

      return new Intl.NumberFormat(locale, {
        style: 'currency',
        currency: currencyCode,
        currencyDisplay: display,
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
        currencySign: accounting ? 'accounting' : 'standard',
        notation: compact ? 'compact' : 'standard',
      }).format(amount);
    },
    [locale, defaultCurrency],
  );

  /**
   * Format an amount and return its constituent parts.
   * Useful for custom styling (e.g., smaller decimal digits).
   */
  const formatParts = useCallback(
    (amount: number, currencyCode: string = defaultCurrency): Intl.NumberFormatPart[] => {
      const decimals = getCurrencyDecimals(currencyCode);

      return new Intl.NumberFormat(locale, {
        style: 'currency',
        currency: currencyCode,
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
      }).formatToParts(amount);
    },
    [locale, defaultCurrency],
  );

  /**
   * Parse a locale-formatted currency string back to a number.
   */
  const parse = useCallback(
    (formattedValue: string, currencyCode: string = defaultCurrency): number | null => {
      const parts = new Intl.NumberFormat(locale, {
        style: 'currency',
        currency: currencyCode,
      }).formatToParts(1234.56);

      const decimalSep = parts.find((p) => p.type === 'decimal')?.value ?? '.';

      const cleaned = formattedValue
        .replace(new RegExp(`[^0-9${escapeRegex(decimalSep)}\\-]`, 'g'), '')
        .replace(decimalSep, '.');

      const result = parseFloat(cleaned);
      return Number.isFinite(result) ? result : null;
    },
    [locale, defaultCurrency],
  );

  return { format, formatParts, parse, locale };
}

/** Escapes special regex characters in a string. */
function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
