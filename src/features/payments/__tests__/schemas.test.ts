import { describe, it, expect } from 'vitest';
import { createPaymentSchema, createPayeeSchema } from '../schemas';

describe('createPaymentSchema', () => {
  it('validates a correct payment', () => {
    const result = createPaymentSchema.safeParse({
      payeeId: '550e8400-e29b-41d4-a716-446655440001',
      amount: 50.0,
      scheduledDate: new Date(Date.now() + 86400000).toISOString().split('T')[0],
      memo: 'January bill',
    });
    expect(result.success).toBe(true);
  });

  it('rejects zero amount', () => {
    const result = createPaymentSchema.safeParse({
      payeeId: '550e8400-e29b-41d4-a716-446655440001',
      amount: 0,
      scheduledDate: '2027-03-01',
    });
    expect(result.success).toBe(false);
  });

  it('rejects amount over $50,000', () => {
    const result = createPaymentSchema.safeParse({
      payeeId: '550e8400-e29b-41d4-a716-446655440001',
      amount: 50001,
      scheduledDate: '2027-03-01',
    });
    expect(result.success).toBe(false);
  });

  it('transforms dollars to cents', () => {
    const result = createPaymentSchema.safeParse({
      payeeId: '550e8400-e29b-41d4-a716-446655440001',
      amount: 25.5,
      scheduledDate: '2027-03-01',
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.amount).toBe(2550);
    }
  });
});

describe('createPayeeSchema', () => {
  it('validates correct payee input', () => {
    const result = createPayeeSchema.safeParse({
      name: 'Pacific Gas & Electric',
      nickname: 'PG&E',
      accountNumber: '1234567890',
      category: 'utility',
    });
    expect(result.success).toBe(true);
  });

  it('rejects non-numeric account number', () => {
    const result = createPayeeSchema.safeParse({
      name: 'Test Company',
      nickname: 'Test',
      accountNumber: 'abc123',
      category: 'utility',
    });
    expect(result.success).toBe(false);
  });

  it('rejects too-short account number', () => {
    const result = createPayeeSchema.safeParse({
      name: 'Test Company',
      nickname: 'Test',
      accountNumber: '12',
      category: 'utility',
    });
    expect(result.success).toBe(false);
  });

  it('rejects empty nickname', () => {
    const result = createPayeeSchema.safeParse({
      name: 'Test',
      nickname: '',
      accountNumber: '123456',
      category: 'other',
    });
    expect(result.success).toBe(false);
  });
});
