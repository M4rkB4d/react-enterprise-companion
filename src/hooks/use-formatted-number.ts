// src/hooks/use-formatted-number.ts

import { useCallback } from 'react';
import { useIntl } from 'react-intl';

type CompactDisplay = 'short' | 'long';

/**
 * Hook providing locale-aware number formatting utilities.
 *
 * All formatting uses the current locale from the nearest IntlProvider.
 *
 * @example
 * const { formatDecimal, formatPercent, formatCompact } = useFormattedNumber();
 * formatDecimal(1234.56)     // "1,234.56" (en-US) or "1.234,56" (de-DE)
 * formatPercent(0.1256)      // "12.56%" (en-US) or "12,56 %" (de-DE)
 * formatCompact(1_500_000)   // "1.5M" (en-US) or "1,5 Mio." (de-DE)
 */
export function useFormattedNumber() {
  const intl = useIntl();
  const { locale } = intl;

  /** Format a plain decimal number */
  const formatDecimal = useCallback(
    (value: number, options?: Partial<Intl.NumberFormatOptions>): string => {
      return new Intl.NumberFormat(locale, {
        style: 'decimal',
        minimumFractionDigits: options?.minimumFractionDigits ?? 0,
        maximumFractionDigits: options?.maximumFractionDigits ?? 2,
        ...options,
      }).format(value);
    },
    [locale],
  );

  /** Format a number as a percentage (0.125 -> "12.5%") */
  const formatPercent = useCallback(
    (value: number, fractionDigits: number = 2): string => {
      return new Intl.NumberFormat(locale, {
        style: 'percent',
        minimumFractionDigits: fractionDigits,
        maximumFractionDigits: fractionDigits,
      }).format(value);
    },
    [locale],
  );

  /** Format a number in compact notation ("1.5M", "1,5 Mio.") */
  const formatCompact = useCallback(
    (value: number, display: CompactDisplay = 'short'): string => {
      return new Intl.NumberFormat(locale, {
        notation: 'compact',
        compactDisplay: display,
        maximumFractionDigits: 1,
      }).format(value);
    },
    [locale],
  );

  /** Format a number with explicit sign display ("+5.2%", "-3.1%") */
  const formatSigned = useCallback(
    (value: number, fractionDigits: number = 2): string => {
      return new Intl.NumberFormat(locale, {
        style: 'decimal',
        signDisplay: 'exceptZero',
        minimumFractionDigits: fractionDigits,
        maximumFractionDigits: fractionDigits,
      }).format(value);
    },
    [locale],
  );

  /**
   * Parse a locale-formatted number string to a numeric value.
   */
  const parseNumber = useCallback(
    (formatted: string): number | null => {
      const parts = new Intl.NumberFormat(locale).formatToParts(1234.5);
      const groupSep = parts.find((p) => p.type === 'group')?.value ?? ',';
      const decimalSep = parts.find((p) => p.type === 'decimal')?.value ?? '.';

      const normalized = formatted
        .replace(new RegExp(`\\${groupSep}`, 'g'), '')
        .replace(decimalSep, '.');

      const result = parseFloat(normalized);
      return Number.isFinite(result) ? result : null;
    },
    [locale],
  );

  return {
    formatDecimal,
    formatPercent,
    formatCompact,
    formatSigned,
    parseNumber,
  };
}
