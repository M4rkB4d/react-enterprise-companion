import { useActionState } from 'react';
import { useFormStatus } from 'react-dom';
import { useNavigate } from 'react-router';
import { useTransferStore } from '../../store/transferStore';
import { useCreateTransfer } from '../../hooks/useCreateTransfer';
import { useAccounts } from '@/features/accounts/hooks/useAccounts';
import { createTransferSchema } from '../../schemas';
import { Button } from '@/components/ui/Button';
import { Loader2, CheckCircle, AlertCircle } from 'lucide-react';

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending} className="w-full">
      {pending ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Processing Transfer...
        </>
      ) : (
        'Confirm Transfer'
      )}
    </Button>
  );
}

interface SubmitResult {
  success: boolean;
  message: string;
}

export function ConfirmTransferStep() {
  const navigate = useNavigate();
  const { fromAccountId, toAccountId, amount, memo, prevStep, reset } = useTransferStore();
  const createTransfer = useCreateTransfer();
  const { data: accountsData } = useAccounts();

  const fromAccount = accountsData?.data.find((a) => a.id === fromAccountId);
  const toAccount = accountsData?.data.find((a) => a.id === toAccountId);

  const [result, submitAction] = useActionState<SubmitResult | null, FormData>(async () => {
    const parsed = createTransferSchema.safeParse({
      fromAccountId,
      toAccountId,
      amount,
      memo: memo || undefined,
    });

    if (!parsed.success) {
      const firstError = parsed.error.issues[0]?.message ?? 'Validation failed';
      return { success: false, message: firstError };
    }

    try {
      await createTransfer.mutateAsync(parsed.data);
      reset();
      return { success: true, message: 'Transfer completed successfully!' };
    } catch {
      return { success: false, message: 'Transfer failed. Please try again.' };
    }
  }, null);

  if (result?.success) {
    return (
      <div className="space-y-4 text-center">
        <CheckCircle className="mx-auto h-16 w-16 text-green-500" />
        <h2 className="text-xl font-semibold text-gray-900">Transfer Complete!</h2>
        <p className="text-gray-600">{result.message}</p>
        <div className="flex justify-center gap-3">
          <Button variant="outline" onClick={() => navigate('/accounts')}>
            View Accounts
          </Button>
          <Button
            onClick={() => {
              reset();
              navigate('/transfers');
            }}
          >
            New Transfer
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h2 className="text-lg font-semibold text-gray-900">Review Transfer</h2>

      {result && !result.success && (
        <div className="flex items-center gap-2 rounded-md bg-red-50 p-3">
          <AlertCircle className="h-5 w-5 text-red-600" />
          <p className="text-sm text-red-800">{result.message}</p>
        </div>
      )}

      <div className="divide-y divide-gray-100 rounded-lg border border-gray-200">
        <div className="flex justify-between p-4">
          <span className="text-sm text-gray-500">From</span>
          <span className="text-sm font-medium text-gray-900">
            {fromAccount?.name} ({fromAccount?.accountNumber})
          </span>
        </div>
        <div className="flex justify-between p-4">
          <span className="text-sm text-gray-500">To</span>
          <span className="text-sm font-medium text-gray-900">
            {toAccount?.name} ({toAccount?.accountNumber})
          </span>
        </div>
        <div className="flex justify-between p-4">
          <span className="text-sm text-gray-500">Amount</span>
          <span className="text-lg font-bold text-gray-900">${amount.toFixed(2)}</span>
        </div>
        {memo && (
          <div className="flex justify-between p-4">
            <span className="text-sm text-gray-500">Memo</span>
            <span className="text-sm text-gray-900">{memo}</span>
          </div>
        )}
      </div>

      <form action={submitAction}>
        <div className="space-y-3">
          <SubmitButton />
          <Button type="button" variant="outline" className="w-full" onClick={prevStep}>
            Back to Edit
          </Button>
        </div>
      </form>
    </div>
  );
}
