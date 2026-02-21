import { apiClient } from '@/api/client';
import {
  paymentListSchema,
  paymentSchema,
  scheduledPaymentSchema,
  type Payment,
  type CreatePaymentInput,
  type PaymentListResponse,
  type CreateScheduledPaymentInput,
  type ScheduledPayment,
} from '../schemas';

interface PaymentFilters {
  page?: number;
  pageSize?: number;
  status?: string;
  payeeId?: string;
  from?: string;
  to?: string;
}

export const paymentsService = {
  async getAll(filters: PaymentFilters = {}): Promise<PaymentListResponse> {
    const response = await apiClient.get('/payments', { params: filters });
    return paymentListSchema.parse(response.data);
  },
  async getById(paymentId: string): Promise<Payment> {
    const response = await apiClient.get(`/payments/${paymentId}`);
    return paymentSchema.parse(response.data);
  },
  async create(input: CreatePaymentInput): Promise<Payment> {
    const response = await apiClient.post('/payments', input);
    return paymentSchema.parse(response.data);
  },
  async schedule(input: CreateScheduledPaymentInput): Promise<ScheduledPayment> {
    const response = await apiClient.post('/payments/scheduled', input);
    return scheduledPaymentSchema.parse(response.data);
  },
  async cancelScheduled(scheduledId: string): Promise<void> {
    await apiClient.delete(`/payments/scheduled/${scheduledId}`);
  },
} as const;
