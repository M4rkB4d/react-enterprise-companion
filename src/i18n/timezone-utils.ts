// src/i18n/timezone-utils.ts

/**
 * Time zone utilities for international banking.
 *
 * Banking often needs to display times in multiple zones:
 * - User's local time (for personal context)
 * - Transaction time (where the payment was processed)
 * - Market time (for FX rates)
 * - Cut-off time (when transactions are batched)
 */

/**
 * Common banking time zones with their display names.
 */
export const BANKING_TIME_ZONES = {
  'America/New_York': 'New York (ET)',
  'America/Chicago': 'Chicago (CT)',
  'America/Los_Angeles': 'Los Angeles (PT)',
  'America/Toronto': 'Toronto (ET)',
  'Europe/London': 'London (GMT/BST)',
  'Europe/Berlin': 'Frankfurt (CET)',
  'Europe/Zurich': 'Zurich (CET)',
  'Asia/Tokyo': 'Tokyo (JST)',
  'Asia/Shanghai': 'Shanghai (CST)',
  'Asia/Hong_Kong': 'Hong Kong (HKT)',
  'Asia/Singapore': 'Singapore (SGT)',
  'Asia/Dubai': 'Dubai (GST)',
  'Asia/Riyadh': 'Riyadh (AST)',
  'Asia/Kolkata': 'Mumbai (IST)',
  'Asia/Jerusalem': 'Tel Aviv (IST)',
} as const;

/**
 * Get the user's current time zone.
 */
export function getUserTimeZone(): string {
  return Intl.DateTimeFormat().resolvedOptions().timeZone;
}

/**
 * Format a date in a specific time zone.
 */
export function formatInTimeZone(
  date: Date | string,
  locale: string,
  timeZone: string,
  options?: Intl.DateTimeFormatOptions,
): string {
  const dateObj = date instanceof Date ? date : new Date(date);
  return new Intl.DateTimeFormat(locale, {
    ...options,
    timeZone,
  }).format(dateObj);
}

/**
 * Format a date showing both local time and a reference time zone.
 *
 * Example: "2:30 PM (11:30 AM ET)"
 */
export function formatDualTimeZone(
  date: Date | string,
  locale: string,
  referenceTimeZone: string,
): string {
  const dateObj = date instanceof Date ? date : new Date(date);
  const localTime = new Intl.DateTimeFormat(locale, {
    hour: 'numeric',
    minute: 'numeric',
  }).format(dateObj);

  const refTime = new Intl.DateTimeFormat(locale, {
    hour: 'numeric',
    minute: 'numeric',
    timeZone: referenceTimeZone,
    timeZoneName: 'short',
  }).format(dateObj);

  return `${localTime} (${refTime})`;
}
