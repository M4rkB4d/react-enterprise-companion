import { useMutation, useQueryClient } from '@tanstack/react-query';
import { paymentsService } from '../api/paymentsService';
import { paymentQueryKeys } from '../api/queryKeys';
import { useNotificationStore } from '@/stores/notificationStore';
import type { CreateScheduledPaymentInput } from '../schemas';

/** Create a scheduled recurring payment */
export function useSchedulePayment() {
  const queryClient = useQueryClient();
  const { addNotification } = useNotificationStore();

  return useMutation({
    mutationFn: (input: CreateScheduledPaymentInput) => paymentsService.schedule(input),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: paymentQueryKeys.scheduled.all,
      });
      addNotification({ type: 'success', message: 'Recurring payment scheduled' });
    },
    onError: () => {
      addNotification({ type: 'error', message: 'Failed to schedule payment' });
    },
  });
}

/** Cancel a scheduled payment */
export function useCancelScheduledPayment() {
  const queryClient = useQueryClient();
  const { addNotification } = useNotificationStore();

  return useMutation({
    mutationFn: (scheduledId: string) => paymentsService.cancelScheduled(scheduledId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: paymentQueryKeys.scheduled.all,
      });
      addNotification({ type: 'success', message: 'Scheduled payment cancelled' });
    },
    onError: () => {
      addNotification({
        type: 'error',
        message: 'Failed to cancel scheduled payment',
      });
    },
  });
}
