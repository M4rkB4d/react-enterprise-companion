import { useQuery, keepPreviousData } from '@tanstack/react-query';
import { paymentsService } from '../api/paymentsService';
import { paymentQueryKeys } from '../api/queryKeys';

interface UsePaymentsOptions {
  page?: number;
  pageSize?: number;
  status?: string;
  payeeId?: string;
}

/** Fetch paginated payment history */
export function usePayments(options: UsePaymentsOptions = {}) {
  const { page = 1, pageSize = 20, ...filters } = options;

  return useQuery({
    queryKey: paymentQueryKeys.payments.list({ page, pageSize, ...filters }),
    queryFn: () => paymentsService.getAll({ page, pageSize, ...filters }),
    placeholderData: keepPreviousData,
    staleTime: 30 * 1000,
  });
}

/** Fetch a single payment detail */
export function usePaymentDetail(paymentId: string) {
  return useQuery({
    queryKey: paymentQueryKeys.payments.detail(paymentId),
    queryFn: () => paymentsService.getById(paymentId),
    enabled: !!paymentId,
  });
}
