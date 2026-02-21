import { apiClient } from '@/api/client';
import { transferSchema } from './schemas';
import type { Transfer } from './types';
import type { CreateTransferInput } from './schemas';

export const transfersService = {
  async create(input: CreateTransferInput): Promise<Transfer> {
    const response = await apiClient.post('/transfers', input);
    return transferSchema.parse(response.data);
  },
} as const;
