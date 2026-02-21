// src/features/payments/__tests__/usePayees.test.ts — Doc 13 §11.1
import { renderHook, waitFor } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { usePayees } from '../hooks/usePayees';
import { createTestQueryWrapper } from '@/__tests__/test-utils';

describe('usePayees', () => {
  it('fetches and returns payees list', async () => {
    const { result } = renderHook(() => usePayees(), {
      wrapper: createTestQueryWrapper(),
    });

    // Initially loading
    expect(result.current.isLoading).toBe(true);

    // Wait for data
    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    // Verify data shape (MSW returns 2 mock payees)
    expect(result.current.data?.data).toHaveLength(2);
    expect(result.current.data?.data[0].nickname).toBe('PG&E');
    expect(result.current.data?.data[1].nickname).toBe('Chase CC');
  });

  it('returns correct total count', async () => {
    const { result } = renderHook(() => usePayees(), {
      wrapper: createTestQueryWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data?.total).toBe(2);
  });
});
