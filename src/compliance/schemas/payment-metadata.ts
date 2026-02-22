// src/compliance/schemas/payment-metadata.ts

/**
 * PAYMENT METADATA SCHEMA
 *
 * Validates payment metadata that YOUR code handles.
 * This schema deliberately EXCLUDES all card data.
 * Card data is handled entirely by Stripe's iframe.
 *
 * Cross-ref: Doc 06 §3 for Zod schema patterns
 *
 * IMPORTANT: Uses Zod 4.x syntax:
 *   - { error: '...' } instead of { message: '...' }
 */

import { z } from 'zod';

/** ISO 4217 currency codes commonly used in banking */
const SUPPORTED_CURRENCIES = [
  'usd', 'eur', 'gbp', 'jpy', 'cad', 'aud', 'chf',
] as const;

export const paymentMetadataSchema = z.object({
  /** Amount in smallest currency unit (cents for USD) */
  amount: z
    .number()
    .int({ error: 'Amount must be a whole number (in cents)' })
    .positive({ error: 'Amount must be greater than zero' })
    .max(999_999_99, { error: 'Amount exceeds maximum transaction limit' }),

  /** ISO 4217 currency code (lowercase) */
  currency: z.enum(SUPPORTED_CURRENCIES, {
    error: 'Unsupported currency',
  }),

  /** Recipient display name */
  recipientName: z
    .string()
    .min(1, { error: 'Recipient name is required' })
    .max(100, { error: 'Recipient name is too long' }),

  /** Recipient account identifier (internal ID, NOT a bank account number) */
  recipientAccountId: z
    .string()
    .min(1, { error: 'Recipient account ID is required' })
    .max(50, { error: 'Invalid recipient account ID' }),

  /** Optional payment memo / description */
  memo: z
    .string()
    .max(500, { error: 'Memo is too long' })
    .optional(),

  /** Optional scheduled date for future payments (ISO-8601) */
  scheduledDate: z
    .string()
    .datetime({ error: 'Invalid date format' })
    .optional(),
});

export type PaymentMetadata = z.infer<typeof paymentMetadataSchema>;

/**
 * WHAT IS NOT IN THIS SCHEMA (by design):
 *
 * - cardNumber / PAN
 * - expiryMonth / expiryYear
 * - cvv / cvc
 * - cardholderName (for card purposes)
 *
 * These fields are NEVER validated, stored, or processed
 * by our application code. Stripe handles them.
 */
