import { useMutation, useQueryClient } from '@tanstack/react-query';
import { paymentsService } from '../api/paymentsService';
import { paymentQueryKeys } from '../api/queryKeys';
import { useNotificationStore } from '@/stores/notificationStore';
import type { CreatePaymentInput } from '../schemas';

/** Create a one-time payment */
export function useCreatePayment() {
  const queryClient = useQueryClient();
  const { addNotification } = useNotificationStore();

  return useMutation({
    mutationFn: (input: CreatePaymentInput) => paymentsService.create(input),
    onSuccess: (payment) => {
      queryClient.invalidateQueries({
        queryKey: paymentQueryKeys.payments.all,
      });
      addNotification({
        type: 'success',
        message: `Payment of $${(payment.amount / 100).toFixed(2)} submitted`,
      });
    },
    onError: () => {
      addNotification({
        type: 'error',
        message: 'Payment failed. Please try again.',
      });
    },
  });
}
