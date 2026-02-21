import { useInfiniteQuery } from '@tanstack/react-query';
import { accountsService } from '../services';
import { accountQueryKeys } from './useAccounts';

interface UseTransactionsOptions {
  accountId: string;
  limit?: number;
  type?: string;
  category?: string;
}

/** Fetch paginated transactions with infinite scroll */
export function useTransactions({ accountId, limit = 20, type, category }: UseTransactionsOptions) {
  return useInfiniteQuery({
    queryKey: accountQueryKeys.transactions(accountId, { limit, type, category }),
    queryFn: ({ pageParam }) =>
      accountsService.getTransactions(accountId, {
        cursor: pageParam,
        limit,
        type: type || undefined,
        category: category || undefined,
      }),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) => (lastPage.hasMore ? lastPage.nextCursor : undefined),
    enabled: !!accountId,
    staleTime: 30 * 1000,
  });
}
