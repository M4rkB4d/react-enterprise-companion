import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { payeesService } from '../api/payeesService';
import { paymentQueryKeys } from '../api/queryKeys';
import { useNotificationStore } from '@/stores/notificationStore';
import type { CreatePayeeInput, Payee } from '../schemas';

/** Fetch all saved payees */
export function usePayees() {
  return useQuery({
    queryKey: paymentQueryKeys.payees.list(),
    queryFn: payeesService.getAll,
    staleTime: 5 * 60 * 1000,
  });
}

/** Add a new payee with optimistic list update */
export function useCreatePayee() {
  const queryClient = useQueryClient();
  const { addNotification } = useNotificationStore();

  return useMutation({
    mutationFn: (input: CreatePayeeInput) => payeesService.create(input),

    onMutate: async (newPayee) => {
      await queryClient.cancelQueries({
        queryKey: paymentQueryKeys.payees.list(),
      });
      const previousPayees = queryClient.getQueryData(paymentQueryKeys.payees.list());
      queryClient.setQueryData(
        paymentQueryKeys.payees.list(),
        (old: { data: Payee[]; total: number } | undefined) => {
          if (!old) return old;
          const tempPayee: Payee = {
            id: `temp-${Date.now()}`,
            ...newPayee,
            accountNumber: `****${newPayee.accountNumber.slice(-4)}`,
            createdAt: new Date().toISOString(),
          };
          return { data: [...old.data, tempPayee], total: old.total + 1 };
        },
      );
      return { previousPayees };
    },

    onError: (_err, _newPayee, context) => {
      if (context?.previousPayees) {
        queryClient.setQueryData(paymentQueryKeys.payees.list(), context.previousPayees);
      }
      addNotification({ type: 'error', message: 'Failed to add payee' });
    },

    onSuccess: () => {
      addNotification({ type: 'success', message: 'Payee added successfully' });
    },

    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: paymentQueryKeys.payees.all,
      });
    },
  });
}

/** Delete a payee */
export function useDeletePayee() {
  const queryClient = useQueryClient();
  const { addNotification } = useNotificationStore();

  return useMutation({
    mutationFn: (payeeId: string) => payeesService.delete(payeeId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: paymentQueryKeys.payees.all });
      addNotification({ type: 'success', message: 'Payee removed' });
    },
    onError: () => {
      addNotification({ type: 'error', message: 'Failed to remove payee' });
    },
  });
}
