import { describe, it, expect } from 'vitest';
import { createTransferSchema, transferSchema } from '../schemas';

describe('transferSchema', () => {
  const validTransfer = {
    id: '20000000-0000-4000-8000-000000000001',
    fromAccountId: '10000000-0000-4000-8000-000000000001',
    toAccountId: '10000000-0000-4000-8000-000000000002',
    amount: 50000,
    memo: 'Monthly savings',
    status: 'completed',
    createdAt: '2026-02-20T10:00:00Z',
    completedAt: '2026-02-20T10:01:00Z',
  };

  it('validates a correct transfer', () => {
    const result = transferSchema.safeParse(validTransfer);
    expect(result.success).toBe(true);
  });

  it('accepts all valid statuses', () => {
    for (const status of ['pending', 'processing', 'completed', 'failed']) {
      const result = transferSchema.safeParse({ ...validTransfer, status });
      expect(result.success).toBe(true);
    }
  });

  it('allows optional memo', () => {
    const { memo: _memo, ...withoutMemo } = validTransfer;
    const result = transferSchema.safeParse(withoutMemo);
    expect(result.success).toBe(true);
  });

  it('allows optional completedAt', () => {
    const { completedAt: _completedAt, ...withoutCompletedAt } = validTransfer;
    const result = transferSchema.safeParse(withoutCompletedAt);
    expect(result.success).toBe(true);
  });
});

describe('createTransferSchema', () => {
  const validInput = {
    fromAccountId: '10000000-0000-4000-8000-000000000001',
    toAccountId: '10000000-0000-4000-8000-000000000002',
    amount: 100.0,
    memo: 'Monthly savings',
  };

  it('validates a correct transfer input', () => {
    const result = createTransferSchema.safeParse(validInput);
    expect(result.success).toBe(true);
  });

  it('transforms dollars to cents', () => {
    const result = createTransferSchema.safeParse(validInput);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.amount).toBe(10000);
    }
  });

  it('transforms fractional dollars correctly', () => {
    const result = createTransferSchema.safeParse({ ...validInput, amount: 25.5 });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.amount).toBe(2550);
    }
  });

  it('rejects zero amount', () => {
    const result = createTransferSchema.safeParse({ ...validInput, amount: 0 });
    expect(result.success).toBe(false);
  });

  it('rejects negative amount', () => {
    const result = createTransferSchema.safeParse({ ...validInput, amount: -50 });
    expect(result.success).toBe(false);
  });

  it('rejects amount over $100,000', () => {
    const result = createTransferSchema.safeParse({
      ...validInput,
      amount: 100_001,
    });
    expect(result.success).toBe(false);
  });

  it('rejects same source and destination account', () => {
    const result = createTransferSchema.safeParse({
      ...validInput,
      toAccountId: validInput.fromAccountId,
    });
    expect(result.success).toBe(false);
  });

  it('rejects missing fromAccountId', () => {
    const { fromAccountId: _from, ...withoutFrom } = validInput;
    const result = createTransferSchema.safeParse(withoutFrom);
    expect(result.success).toBe(false);
  });

  it('rejects missing toAccountId', () => {
    const { toAccountId: _to, ...withoutTo } = validInput;
    const result = createTransferSchema.safeParse(withoutTo);
    expect(result.success).toBe(false);
  });

  it('allows optional memo', () => {
    const { memo: _memo, ...withoutMemo } = validInput;
    const result = createTransferSchema.safeParse(withoutMemo);
    expect(result.success).toBe(true);
  });

  it('rejects memo over 200 characters', () => {
    const result = createTransferSchema.safeParse({
      ...validInput,
      memo: 'a'.repeat(201),
    });
    expect(result.success).toBe(false);
  });
});
