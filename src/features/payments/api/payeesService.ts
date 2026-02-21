import { apiClient } from '@/api/client';
import {
  payeeListSchema,
  payeeSchema,
  type Payee,
  type CreatePayeeInput,
  type PayeeListResponse,
} from '../schemas';

export const payeesService = {
  async getAll(): Promise<PayeeListResponse> {
    const response = await apiClient.get('/payees');
    return payeeListSchema.parse(response.data);
  },
  async create(input: CreatePayeeInput): Promise<Payee> {
    const response = await apiClient.post('/payees', input);
    return payeeSchema.parse(response.data);
  },
  async delete(payeeId: string): Promise<void> {
    await apiClient.delete(`/payees/${payeeId}`);
  },
} as const;
