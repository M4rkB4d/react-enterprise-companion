// src/compliance/schemas/audit-event.ts

/**
 * AUDIT EVENT VALIDATION SCHEMAS
 *
 * Uses Zod's discriminated union pattern to validate
 * different categories of audit events, each with its
 * own metadata shape.
 *
 * Cross-ref: Doc 06 §3 for Zod schema patterns
 * Cross-ref: Doc 14 §5 for audit trail system
 */

import { z } from 'zod';

const baseAuditEventSchema = z.object({
  id: z.uuid({ error: 'Invalid event ID' }),
  timestamp: z.string().datetime({ error: 'Invalid timestamp' }),
  userId: z.string().min(1, { error: 'User ID is required' }),
  correlationId: z.uuid({ error: 'Invalid correlation ID' }),
  previousHash: z.string().nullable(),
  hash: z.string().min(1, { error: 'Event hash is required' }),
});

const authEventSchema = baseAuditEventSchema.extend({
  action: z.enum([
    'auth.login',
    'auth.logout',
    'auth.mfa_verified',
    'auth.session_expired',
    'auth.password_changed',
  ]),
  resource: z.string().startsWith('session:'),
  metadata: z.object({
    ipAddress: z.string().optional(),
    userAgent: z.string().optional(),
    mfaMethod: z.enum(['totp', 'sms', 'email']).optional(),
  }),
});

const paymentEventSchema = baseAuditEventSchema.extend({
  action: z.enum([
    'payment.initiated',
    'payment.succeeded',
    'payment.failed',
    'payment.cancelled',
    'payment.refund_requested',
  ]),
  resource: z.string().startsWith('payment:'),
  metadata: z.object({
    amount: z.number().positive(),
    currency: z.string().length(3),
    status: z.string().optional(),
    errorCode: z.string().optional(),
  }),
});

const accountEventSchema = baseAuditEventSchema.extend({
  action: z.enum(['account.viewed', 'account.statement_downloaded', 'account.settings_changed']),
  resource: z.string().startsWith('account:'),
  metadata: z.object({
    accountType: z.string().optional(),
    settingChanged: z.string().optional(),
  }),
});

const transferEventSchema = baseAuditEventSchema.extend({
  action: z.enum([
    'transfer.initiated',
    'transfer.approved',
    'transfer.completed',
    'transfer.rejected',
  ]),
  resource: z.string().startsWith('transfer:'),
  metadata: z.object({
    amount: z.number().positive(),
    currency: z.string().length(3),
    fromAccount: z.string(),
    toAccount: z.string(),
    approvedBy: z.string().optional(),
  }),
});

const piiEventSchema = baseAuditEventSchema.extend({
  action: z.enum(['pii.revealed', 'pii.exported', 'pii.deletion_requested']),
  resource: z.string(),
  metadata: z.object({
    dataType: z.string(),
    reason: z.string().optional(),
  }),
});

const consentEventSchema = baseAuditEventSchema.extend({
  action: z.enum(['consent.granted', 'consent.revoked', 'consent.updated']),
  resource: z.literal('consent:user'),
  metadata: z.object({
    categories: z.record(z.string(), z.boolean()),
    policyVersion: z.string(),
  }),
});

const navigationEventSchema = baseAuditEventSchema.extend({
  action: z.literal('page.viewed'),
  resource: z.string().startsWith('page:'),
  metadata: z.object({
    path: z.string(),
    referrer: z.string().optional(),
  }),
});

/**
 * Union schema for all audit event types.
 */
export const auditEventSchema = z.union([
  authEventSchema,
  paymentEventSchema,
  accountEventSchema,
  transferEventSchema,
  piiEventSchema,
  consentEventSchema,
  navigationEventSchema,
]);

export type AuditEventUnion = z.infer<typeof auditEventSchema>;
