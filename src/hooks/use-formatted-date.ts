// src/hooks/use-formatted-date.ts

import { useCallback } from 'react';
import { useIntl } from 'react-intl';

/**
 * Predefined date format presets for banking UIs.
 */
const DATE_PRESETS = {
  /** "Jan 15, 2025" -- for transaction lists */
  short: {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  } as const,

  /** "January 15, 2025" -- for statements and reports */
  long: {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  } as const,

  /** "01/15/2025" -- for compact displays (locale-aware) */
  numeric: {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  } as const,

  /** "Jan 15, 2025, 2:30 PM" -- for transaction details */
  dateTime: {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: 'numeric',
  } as const,

  /** "2:30:45 PM EST" -- for audit logs */
  fullTime: {
    hour: 'numeric',
    minute: 'numeric',
    second: 'numeric',
    timeZoneName: 'short',
  } as const,

  /** "Wednesday, January 15, 2025" -- for statements */
  full: {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  } as const,
};

type DatePreset = keyof typeof DATE_PRESETS;

/**
 * Hook providing locale-aware date and time formatting utilities.
 *
 * @example
 * const { formatDate, formatRelative, formatRange } = useFormattedDate();
 * formatDate(new Date(), 'short')   // "Jan 15, 2025" (en-US)
 * formatRelative(pastDate)          // "2 hours ago"
 * formatRange(start, end, 'short')  // "Jan 15 - 20, 2025"
 */
export function useFormattedDate() {
  const intl = useIntl();
  const { locale } = intl;

  /** Format a date using a preset or custom options */
  const formatDate = useCallback(
    (date: Date | string | number, preset: DatePreset = 'short', timeZone?: string): string => {
      const dateObj = date instanceof Date ? date : new Date(date);
      const options = { ...DATE_PRESETS[preset], timeZone };
      return new Intl.DateTimeFormat(locale, options).format(dateObj);
    },
    [locale],
  );

  /** Format a date as relative time ("2 hours ago", "in 3 days") */
  const formatRelative = useCallback(
    (date: Date | string | number, style: 'long' | 'short' | 'narrow' = 'long'): string => {
      const dateObj = date instanceof Date ? date : new Date(date);
      const now = Date.now();
      const diffMs = dateObj.getTime() - now;
      const diffSec = Math.round(diffMs / 1000);
      const diffMin = Math.round(diffSec / 60);
      const diffHr = Math.round(diffMin / 60);
      const diffDay = Math.round(diffHr / 24);
      const diffMonth = Math.round(diffDay / 30);
      const diffYear = Math.round(diffDay / 365);

      const formatter = new Intl.RelativeTimeFormat(locale, {
        numeric: 'auto',
        style,
      });

      if (Math.abs(diffSec) < 60) return formatter.format(diffSec, 'second');
      if (Math.abs(diffMin) < 60) return formatter.format(diffMin, 'minute');
      if (Math.abs(diffHr) < 24) return formatter.format(diffHr, 'hour');
      if (Math.abs(diffDay) < 30) return formatter.format(diffDay, 'day');
      if (Math.abs(diffMonth) < 12) return formatter.format(diffMonth, 'month');
      return formatter.format(diffYear, 'year');
    },
    [locale],
  );

  /** Format a date range ("Jan 15 - 20, 2025") */
  const formatRange = useCallback(
    (startDate: Date | string, endDate: Date | string, preset: DatePreset = 'short'): string => {
      const start = startDate instanceof Date ? startDate : new Date(startDate);
      const end = endDate instanceof Date ? endDate : new Date(endDate);
      const options = DATE_PRESETS[preset];

      try {
        return new Intl.DateTimeFormat(locale, options).formatRange(start, end);
      } catch {
        // Fallback: format individually with separator
        const fmt = new Intl.DateTimeFormat(locale, options);
        return `${fmt.format(start)} \u2013 ${fmt.format(end)}`;
      }
    },
    [locale],
  );

  return { formatDate, formatRelative, formatRange };
}
