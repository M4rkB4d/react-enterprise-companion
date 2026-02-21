import { apiClient } from '@/api/client';
import { accountListSchema, accountSchema, transactionListSchema } from './schemas';
import type { Account, AccountListResponse, TransactionListResponse } from './types';

interface TransactionFilters {
  cursor?: string;
  limit?: number;
  type?: string;
  category?: string;
  from?: string;
  to?: string;
}

export const accountsService = {
  async getAll(): Promise<AccountListResponse> {
    const response = await apiClient.get('/accounts');
    return accountListSchema.parse(response.data);
  },

  async getById(accountId: string): Promise<Account> {
    const response = await apiClient.get(`/accounts/${accountId}`);
    return accountSchema.parse(response.data);
  },

  async getTransactions(
    accountId: string,
    filters: TransactionFilters = {},
  ): Promise<TransactionListResponse> {
    const response = await apiClient.get(`/accounts/${accountId}/transactions`, {
      params: filters,
    });
    return transactionListSchema.parse(response.data);
  },
} as const;
