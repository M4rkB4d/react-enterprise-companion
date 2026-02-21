// src/features/payments/__tests__/useCreatePayment.test.ts — Doc 13 §11.2
import { renderHook, waitFor, act } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { useCreatePayment } from '../hooks/useCreatePayment';
import { createTestQueryWrapper } from '@/__tests__/test-utils';

describe('useCreatePayment', () => {
  it('submits payment and returns success', async () => {
    const { result } = renderHook(() => useCreatePayment(), {
      wrapper: createTestQueryWrapper(),
    });

    await act(async () => {
      await result.current.mutateAsync({
        payeeId: '550e8400-e29b-41d4-a716-446655440001',
        amount: 5000, // $50.00 in cents (already transformed by Zod)
        scheduledDate: new Date().toISOString(),
        memo: 'Test payment',
      });
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
      expect(result.current.data?.status).toBe('pending');
    });
  });

  it('returns payment ID on success', async () => {
    const { result } = renderHook(() => useCreatePayment(), {
      wrapper: createTestQueryWrapper(),
    });

    await act(async () => {
      await result.current.mutateAsync({
        payeeId: '550e8400-e29b-41d4-a716-446655440001',
        amount: 15099,
        scheduledDate: new Date().toISOString(),
      });
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data?.id).toBeDefined();
    expect(result.current.data?.payeeId).toBe('550e8400-e29b-41d4-a716-446655440001');
  });
});
