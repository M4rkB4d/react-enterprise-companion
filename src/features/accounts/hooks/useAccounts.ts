import { useQuery } from '@tanstack/react-query';
import { accountsService } from '../services';

export const accountQueryKeys = {
  all: ['accounts'] as const,
  list: () => [...accountQueryKeys.all, 'list'] as const,
  detail: (id: string) => [...accountQueryKeys.all, 'detail', id] as const,
  transactions: (id: string, filters?: Record<string, unknown>) =>
    [...accountQueryKeys.all, 'transactions', id, filters] as const,
};

/** Fetch all user accounts */
export function useAccounts() {
  return useQuery({
    queryKey: accountQueryKeys.list(),
    queryFn: accountsService.getAll,
    staleTime: 60 * 1000,
  });
}

/** Fetch a single account by ID */
export function useAccountById(accountId: string) {
  return useQuery({
    queryKey: accountQueryKeys.detail(accountId),
    queryFn: () => accountsService.getById(accountId),
    enabled: !!accountId,
  });
}
