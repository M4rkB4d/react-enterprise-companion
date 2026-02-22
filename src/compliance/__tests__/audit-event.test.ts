import { describe, it, expect } from 'vitest';
import { auditEventSchema } from '../schemas/audit-event';

const validBase = {
  id: '550e8400-e29b-41d4-a716-446655440000',
  timestamp: '2025-06-15T10:30:00Z',
  userId: 'user-123',
  correlationId: '660e8400-e29b-41d4-a716-446655440000',
  previousHash: null,
  hash: 'abc123hash',
};

describe('auditEventSchema', () => {
  describe('auth events', () => {
    it('accepts a valid auth.login event', () => {
      const event = {
        ...validBase,
        action: 'auth.login',
        resource: 'session:abc',
        metadata: { ipAddress: '192.168.1.1', userAgent: 'Mozilla/5.0' },
      };
      const result = auditEventSchema.safeParse(event);
      expect(result.success).toBe(true);
    });

    it('rejects an auth event with invalid resource prefix', () => {
      const event = {
        ...validBase,
        action: 'auth.login',
        resource: 'account:abc',
        metadata: {},
      };
      const result = auditEventSchema.safeParse(event);
      expect(result.success).toBe(false);
    });

    it('accepts auth event with optional mfaMethod', () => {
      const event = {
        ...validBase,
        action: 'auth.mfa_verified',
        resource: 'session:xyz',
        metadata: { mfaMethod: 'totp' },
      };
      const result = auditEventSchema.safeParse(event);
      expect(result.success).toBe(true);
    });
  });

  describe('payment events', () => {
    it('accepts a valid payment.initiated event', () => {
      const event = {
        ...validBase,
        action: 'payment.initiated',
        resource: 'payment:pay-001',
        metadata: { amount: 100.5, currency: 'USD' },
      };
      const result = auditEventSchema.safeParse(event);
      expect(result.success).toBe(true);
    });

    it('rejects payment event with non-positive amount', () => {
      const event = {
        ...validBase,
        action: 'payment.initiated',
        resource: 'payment:pay-001',
        metadata: { amount: -5, currency: 'USD' },
      };
      const result = auditEventSchema.safeParse(event);
      expect(result.success).toBe(false);
    });

    it('rejects payment event with invalid currency length', () => {
      const event = {
        ...validBase,
        action: 'payment.succeeded',
        resource: 'payment:pay-002',
        metadata: { amount: 50, currency: 'US' },
      };
      const result = auditEventSchema.safeParse(event);
      expect(result.success).toBe(false);
    });
  });

  describe('consent events', () => {
    it('accepts a valid consent.granted event', () => {
      const event = {
        ...validBase,
        action: 'consent.granted',
        resource: 'consent:user',
        metadata: {
          categories: { marketing: true, analytics: false },
          policyVersion: '2.0',
        },
      };
      const result = auditEventSchema.safeParse(event);
      expect(result.success).toBe(true);
    });

    it('rejects consent event with wrong resource literal', () => {
      const event = {
        ...validBase,
        action: 'consent.granted',
        resource: 'consent:admin',
        metadata: {
          categories: { marketing: true },
          policyVersion: '2.0',
        },
      };
      const result = auditEventSchema.safeParse(event);
      expect(result.success).toBe(false);
    });
  });

  describe('base field validation', () => {
    it('rejects event with invalid UUID for id', () => {
      const event = {
        ...validBase,
        id: 'not-a-uuid',
        action: 'page.viewed',
        resource: 'page:/home',
        metadata: { path: '/home' },
      };
      const result = auditEventSchema.safeParse(event);
      expect(result.success).toBe(false);
    });

    it('rejects event with empty userId', () => {
      const event = {
        ...validBase,
        userId: '',
        action: 'page.viewed',
        resource: 'page:/home',
        metadata: { path: '/home' },
      };
      const result = auditEventSchema.safeParse(event);
      expect(result.success).toBe(false);
    });

    it('rejects event with invalid timestamp', () => {
      const event = {
        ...validBase,
        timestamp: 'not-a-date',
        action: 'page.viewed',
        resource: 'page:/dashboard',
        metadata: { path: '/dashboard' },
      };
      const result = auditEventSchema.safeParse(event);
      expect(result.success).toBe(false);
    });
  });

  describe('navigation events', () => {
    it('accepts a valid page.viewed event', () => {
      const event = {
        ...validBase,
        action: 'page.viewed',
        resource: 'page:/dashboard',
        metadata: { path: '/dashboard', referrer: '/home' },
      };
      const result = auditEventSchema.safeParse(event);
      expect(result.success).toBe(true);
    });
  });
});
