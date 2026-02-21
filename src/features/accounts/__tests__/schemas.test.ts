import { describe, it, expect } from 'vitest';
import { accountSchema, transactionSchema } from '../schemas';

describe('accountSchema', () => {
  const validAccount = {
    id: '10000000-0000-4000-8000-000000000001',
    name: 'Primary Checking',
    type: 'checking',
    accountNumber: '****4521',
    routingNumber: '021000021',
    balance: 1234567,
    availableBalance: 1200000,
    currency: 'USD',
    status: 'active',
    openedAt: '2022-03-15T00:00:00Z',
    updatedAt: '2026-02-20T14:30:00Z',
  };

  it('validates a correct account', () => {
    const result = accountSchema.safeParse(validAccount);
    expect(result.success).toBe(true);
  });

  it('accepts all valid account types', () => {
    for (const type of ['checking', 'savings', 'money_market', 'cd']) {
      const result = accountSchema.safeParse({ ...validAccount, type });
      expect(result.success).toBe(true);
    }
  });

  it('rejects invalid account type', () => {
    const result = accountSchema.safeParse({ ...validAccount, type: 'crypto' });
    expect(result.success).toBe(false);
  });

  it('accepts all valid account statuses', () => {
    for (const status of ['active', 'inactive', 'frozen']) {
      const result = accountSchema.safeParse({ ...validAccount, status });
      expect(result.success).toBe(true);
    }
  });

  it('rejects invalid account status', () => {
    const result = accountSchema.safeParse({ ...validAccount, status: 'closed' });
    expect(result.success).toBe(false);
  });

  it('rejects missing required fields', () => {
    const { name: _name, ...withoutName } = validAccount;
    const result = accountSchema.safeParse(withoutName);
    expect(result.success).toBe(false);
  });

  it('rejects invalid UUID for id', () => {
    const result = accountSchema.safeParse({ ...validAccount, id: 'not-a-uuid' });
    expect(result.success).toBe(false);
  });

  it('allows negative balance', () => {
    const result = accountSchema.safeParse({ ...validAccount, balance: -500 });
    expect(result.success).toBe(true);
  });
});

describe('transactionSchema', () => {
  const validTransaction = {
    id: 'a0000000-0000-4000-8000-000000000001',
    accountId: '10000000-0000-4000-8000-000000000001',
    type: 'credit',
    category: 'deposit',
    amount: 50000,
    balance: 1284567,
    description: 'Direct Deposit - Payroll',
    merchant: 'ACME Corp',
    reference: 'REF123456789',
    status: 'posted',
    createdAt: '2026-02-20T08:30:00Z',
  };

  it('validates a correct transaction', () => {
    const result = transactionSchema.safeParse(validTransaction);
    expect(result.success).toBe(true);
  });

  it('accepts credit and debit types', () => {
    for (const type of ['credit', 'debit']) {
      const result = transactionSchema.safeParse({ ...validTransaction, type });
      expect(result.success).toBe(true);
    }
  });

  it('rejects invalid transaction type', () => {
    const result = transactionSchema.safeParse({ ...validTransaction, type: 'wire' });
    expect(result.success).toBe(false);
  });

  it('accepts all valid categories', () => {
    const categories = [
      'deposit',
      'withdrawal',
      'transfer',
      'payment',
      'fee',
      'interest',
      'refund',
    ];
    for (const category of categories) {
      const result = transactionSchema.safeParse({ ...validTransaction, category });
      expect(result.success).toBe(true);
    }
  });

  it('rejects zero amount', () => {
    const result = transactionSchema.safeParse({ ...validTransaction, amount: 0 });
    expect(result.success).toBe(false);
  });

  it('rejects negative amount', () => {
    const result = transactionSchema.safeParse({ ...validTransaction, amount: -100 });
    expect(result.success).toBe(false);
  });

  it('allows optional merchant field', () => {
    const { merchant: _merchant, ...withoutMerchant } = validTransaction;
    const result = transactionSchema.safeParse(withoutMerchant);
    expect(result.success).toBe(true);
  });

  it('accepts posted and pending status', () => {
    for (const status of ['posted', 'pending']) {
      const result = transactionSchema.safeParse({ ...validTransaction, status });
      expect(result.success).toBe(true);
    }
  });
});
