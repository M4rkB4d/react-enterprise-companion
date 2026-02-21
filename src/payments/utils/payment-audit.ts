// src/payments/utils/payment-audit.ts

/**
 * PAYMENT AUDIT LOGGING
 *
 * Logs payment events for regulatory compliance.
 *
 * CRITICAL: This logger must NEVER include:
 *   - Card numbers (PAN)
 *   - CVV/CVC codes
 *   - Full expiry dates
 *   - Any data that could identify a card
 *
 * It MAY include:
 *   - Payment amounts
 *   - Currency
 *   - Payment intent IDs (Stripe tokens, not card data)
 *   - Recipient identifiers
 *   - Transaction status
 *   - Error codes (not error messages that might contain card data)
 *
 * Cross-ref: §5 for the full audit trail system
 * Cross-ref: Doc 11 §6 for error logging patterns
 */

/** Payment-specific audit event types (discriminated union) */
export type PaymentAuditAction =
  | 'payment.initiated'
  | 'payment.intent_created'
  | 'payment.succeeded'
  | 'payment.failed'
  | 'payment.cancelled'
  | 'payment.refund_requested'
  | 'payment.refund_completed';

/** Metadata allowed in payment audit events */
export interface PaymentAuditMetadata {
  readonly amount?: number;
  readonly currency?: string;
  readonly paymentIntentId?: string;
  readonly recipientAccountId?: string;
  readonly status?: string;
  readonly errorCode?: string;
  /** Last 4 digits of card (provided by Stripe, not by us) */
  readonly cardLast4?: string;
  readonly cardBrand?: string;
}

/**
 * Sanitize payment metadata before logging.
 * This is a defense-in-depth measure — even if someone
 * accidentally passes card data, this function strips it.
 */
export function sanitizePaymentMetadata(
  metadata: Record<string, unknown>,
): PaymentAuditMetadata {
  const sanitized: PaymentAuditMetadata = {};

  if (typeof metadata.amount === 'number') {
    (sanitized as Record<string, unknown>).amount = metadata.amount;
  }
  if (typeof metadata.currency === 'string') {
    (sanitized as Record<string, unknown>).currency = metadata.currency;
  }
  if (typeof metadata.paymentIntentId === 'string') {
    (sanitized as Record<string, unknown>).paymentIntentId = metadata.paymentIntentId;
  }
  if (typeof metadata.recipientAccountId === 'string') {
    (sanitized as Record<string, unknown>).recipientAccountId = metadata.recipientAccountId;
  }
  if (typeof metadata.status === 'string') {
    (sanitized as Record<string, unknown>).status = metadata.status;
  }
  if (typeof metadata.errorCode === 'string') {
    (sanitized as Record<string, unknown>).errorCode = metadata.errorCode;
  }
  if (typeof metadata.cardLast4 === 'string' && metadata.cardLast4.length === 4) {
    (sanitized as Record<string, unknown>).cardLast4 = metadata.cardLast4;
  }
  if (typeof metadata.cardBrand === 'string') {
    (sanitized as Record<string, unknown>).cardBrand = metadata.cardBrand;
  }

  return sanitized;
}

/**
 * List of patterns that should NEVER appear in audit logs.
 * Used by the compliance test suite (§9) to scan logs.
 */
export const FORBIDDEN_LOG_PATTERNS = [
  /\b\d{13,19}\b/, // Card numbers (13-19 digits)
  /\b\d{3,4}\b.*cvv/i, // CVV codes
  /\b\d{2}\/\d{2,4}\b/, // Expiry dates (MM/YY or MM/YYYY)
  /\bpan[=:]\s*\d/i, // PAN field
  /\bcard_number[=:]/i, // Card number field
] as const;
