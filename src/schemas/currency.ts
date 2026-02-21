// src/schemas/currency.ts

import { z } from 'zod';
import { CURRENCY_CONFIG, getCurrencyDecimals } from '@/i18n/currency-config';

/**
 * Validates a currency code against supported currencies.
 */
export const currencyCodeSchema = z.enum(
  Object.keys(CURRENCY_CONFIG) as [string, ...string[]],
  { error: 'validation.invalidCurrency' },
);

/**
 * A monetary amount paired with its currency.
 *
 * Validates:
 * - Amount is a finite, positive number
 * - Currency is a supported ISO 4217 code
 * - Amount precision matches the currency's decimal places
 *
 * @see Doc 06 section 3 for Zod schema patterns
 */
export const monetaryAmountSchema = z
  .object({
    amount: z
      .number({ error: 'validation.invalidAmount' })
      .finite({ error: 'validation.invalidAmount' })
      .nonnegative({ error: 'validation.invalidAmount' }),
    currency: currencyCodeSchema,
  })
  .refine(
    (data) => {
      const decimals = getCurrencyDecimals(data.currency);
      const multiplied = data.amount * Math.pow(10, decimals);
      return Math.abs(multiplied - Math.round(multiplied)) < 0.001;
    },
    { message: 'validation.currencyPrecision' },
  );

export type MonetaryAmount = z.infer<typeof monetaryAmountSchema>;

/**
 * Schema for a currency exchange rate pair.
 */
export const exchangeRateSchema = z.object({
  fromCurrency: currencyCodeSchema,
  toCurrency: currencyCodeSchema,
  rate: z.number().positive({ error: 'validation.invalidRate' }),
  inverseRate: z.number().positive({ error: 'validation.invalidRate' }),
  timestamp: z.string().datetime({ error: 'validation.invalidDate' }),
  source: z.string().min(1, { error: 'validation.required' }),
});

export type ExchangeRate = z.infer<typeof exchangeRateSchema>;

/**
 * Schema for a transfer involving currency conversion.
 */
export const currencyTransferSchema = z
  .object({
    sourceAmount: monetaryAmountSchema,
    targetAmount: monetaryAmountSchema,
    exchangeRate: z.number().positive({ error: 'validation.invalidRate' }),
    sourceAccountId: z.string().uuid({ error: 'validation.required' }),
    targetAccountId: z.string().uuid({ error: 'validation.required' }),
  })
  .refine(
    (data) => data.sourceAmount.currency !== data.targetAmount.currency,
    { message: 'validation.sameCurrency' },
  );

export type CurrencyTransfer = z.infer<typeof currencyTransferSchema>;
