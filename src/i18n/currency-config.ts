// src/i18n/currency-config.ts

/**
 * Currency metadata used throughout the banking application.
 * Maps ISO 4217 currency codes to display properties.
 */
export interface CurrencyConfig {
  /** ISO 4217 currency code (e.g., 'USD') */
  code: string;
  /** Number of decimal places for this currency */
  decimalPlaces: number;
  /** Smallest unit multiplier (e.g., 100 for cents) */
  smallestUnit: number;
  /** Common display name (used in dropdowns) */
  displayName: string;
}

/**
 * Currency configurations for supported currencies.
 * Decimal places follow ISO 4217 standards.
 */
export const CURRENCY_CONFIG: Record<string, CurrencyConfig> = {
  USD: { code: 'USD', decimalPlaces: 2, smallestUnit: 100, displayName: 'US Dollar' },
  EUR: { code: 'EUR', decimalPlaces: 2, smallestUnit: 100, displayName: 'Euro' },
  GBP: { code: 'GBP', decimalPlaces: 2, smallestUnit: 100, displayName: 'British Pound' },
  JPY: { code: 'JPY', decimalPlaces: 0, smallestUnit: 1, displayName: 'Japanese Yen' },
  SAR: { code: 'SAR', decimalPlaces: 2, smallestUnit: 100, displayName: 'Saudi Riyal' },
  AED: { code: 'AED', decimalPlaces: 2, smallestUnit: 100, displayName: 'UAE Dirham' },
  BHD: { code: 'BHD', decimalPlaces: 3, smallestUnit: 1000, displayName: 'Bahraini Dinar' },
  INR: { code: 'INR', decimalPlaces: 2, smallestUnit: 100, displayName: 'Indian Rupee' },
  CNY: { code: 'CNY', decimalPlaces: 2, smallestUnit: 100, displayName: 'Chinese Yuan' },
  CHF: { code: 'CHF', decimalPlaces: 2, smallestUnit: 100, displayName: 'Swiss Franc' },
  CAD: { code: 'CAD', decimalPlaces: 2, smallestUnit: 100, displayName: 'Canadian Dollar' },
  ILS: { code: 'ILS', decimalPlaces: 2, smallestUnit: 100, displayName: 'Israeli Shekel' },
};

/**
 * Returns the number of decimal places for a given currency code.
 * Falls back to 2 decimal places for unknown currencies.
 */
export function getCurrencyDecimals(currencyCode: string): number {
  return CURRENCY_CONFIG[currencyCode]?.decimalPlaces ?? 2;
}

/**
 * Returns the smallest unit multiplier for a given currency.
 * USD: 100 (1 dollar = 100 cents)
 * JPY: 1 (no sub-units)
 * BHD: 1000 (1 dinar = 1000 fils)
 */
export function getSmallestUnit(currencyCode: string): number {
  return CURRENCY_CONFIG[currencyCode]?.smallestUnit ?? 100;
}
