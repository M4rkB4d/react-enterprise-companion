import { useMutation, useQueryClient } from '@tanstack/react-query';
import { transfersService } from '../services';
import { accountQueryKeys } from '@/features/accounts/hooks/useAccounts';
import { useNotificationStore } from '@/stores/notificationStore';
import type { CreateTransferInput } from '../schemas';
import type { AccountListResponse } from '@/features/accounts/types';

/** Create a transfer with optimistic balance update */
export function useCreateTransfer() {
  const queryClient = useQueryClient();
  const { addNotification } = useNotificationStore();

  return useMutation({
    mutationFn: (input: CreateTransferInput) => transfersService.create(input),

    onMutate: async (newTransfer) => {
      await queryClient.cancelQueries({
        queryKey: accountQueryKeys.list(),
      });

      const previousAccounts = queryClient.getQueryData<AccountListResponse>(
        accountQueryKeys.list(),
      );

      if (previousAccounts) {
        queryClient.setQueryData<AccountListResponse>(accountQueryKeys.list(), {
          ...previousAccounts,
          data: previousAccounts.data.map((account) => {
            if (account.id === newTransfer.fromAccountId) {
              return {
                ...account,
                balance: account.balance - newTransfer.amount,
                availableBalance: account.availableBalance - newTransfer.amount,
              };
            }
            if (account.id === newTransfer.toAccountId) {
              return {
                ...account,
                balance: account.balance + newTransfer.amount,
                availableBalance: account.availableBalance + newTransfer.amount,
              };
            }
            return account;
          }),
        });
      }

      return { previousAccounts };
    },

    onError: (_err, _input, context) => {
      if (context?.previousAccounts) {
        queryClient.setQueryData(accountQueryKeys.list(), context.previousAccounts);
      }
      addNotification({
        type: 'error',
        message: 'Transfer failed. Please try again.',
      });
    },

    onSuccess: (transfer) => {
      addNotification({
        type: 'success',
        message: `Transfer of $${(transfer.amount / 100).toFixed(2)} completed successfully.`,
      });
    },

    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: accountQueryKeys.all });
    },
  });
}
