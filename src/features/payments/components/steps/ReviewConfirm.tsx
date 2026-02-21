import { useActionState } from 'react';
import { useFormStatus } from 'react-dom';
import { useNavigate } from 'react-router';
import { usePaymentWizardStore } from '../../store/paymentWizardStore';
import { useCreatePayment } from '../../hooks/useCreatePayment';
import { createPaymentSchema } from '../../schemas';
import { Button } from '@/components/ui/Button';
import { Loader2, CheckCircle, AlertCircle } from 'lucide-react';

function ConfirmButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending} className="w-full">
      {pending ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Processing Payment...
        </>
      ) : (
        'Confirm & Pay'
      )}
    </Button>
  );
}

interface SubmitResult {
  success: boolean;
  message: string;
}

export function ReviewConfirmStep() {
  const navigate = useNavigate();
  const { selectedPayee, paymentDetails, prevStep, reset } = usePaymentWizardStore();
  const createPayment = useCreatePayment();

  const [result, submitAction] = useActionState<SubmitResult | null, FormData>(async () => {
    if (!selectedPayee) return { success: false, message: 'No payee selected' };

    const parsed = createPaymentSchema.safeParse({
      payeeId: selectedPayee.id,
      amount: paymentDetails.amount,
      scheduledDate: new Date(paymentDetails.scheduledDate).toISOString(),
      memo: paymentDetails.memo || undefined,
    });

    if (!parsed.success) {
      const firstError = parsed.error.issues[0]?.message ?? 'Validation failed';
      return { success: false, message: firstError };
    }

    try {
      await createPayment.mutateAsync(parsed.data);
      // Don't reset wizard here — show success screen first, reset on navigation
      return { success: true, message: 'Payment submitted successfully!' };
    } catch {
      return { success: false, message: 'Payment failed. Please try again.' };
    }
  }, null);

  if (result?.success) {
    return (
      <div className="space-y-4 text-center">
        <CheckCircle className="mx-auto h-16 w-16 text-green-500" />
        <h2 className="text-xl font-semibold text-gray-900">Payment Submitted!</h2>
        <p className="text-gray-600">{result.message}</p>
        <Button
          onClick={() => {
            reset();
            navigate('/payments');
          }}
        >
          Back to Payments
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h2 className="text-lg font-semibold text-gray-900">Review Payment</h2>

      {result && !result.success && (
        <div className="flex items-center gap-2 rounded-md bg-red-50 p-3">
          <AlertCircle className="h-5 w-5 text-red-600" />
          <p className="text-sm text-red-800">{result.message}</p>
        </div>
      )}

      <div className="divide-y divide-gray-100 rounded-lg border border-gray-200">
        <div className="flex justify-between p-4">
          <span className="text-sm text-gray-500">Payee</span>
          <span className="text-sm font-medium text-gray-900">
            {selectedPayee?.nickname} ({selectedPayee?.name})
          </span>
        </div>
        <div className="flex justify-between p-4">
          <span className="text-sm text-gray-500">Account</span>
          <span className="text-sm font-medium text-gray-900">{selectedPayee?.accountNumber}</span>
        </div>
        <div className="flex justify-between p-4">
          <span className="text-sm text-gray-500">Amount</span>
          <span className="text-lg font-bold text-gray-900">
            ${paymentDetails.amount.toFixed(2)}
          </span>
        </div>
        <div className="flex justify-between p-4">
          <span className="text-sm text-gray-500">Payment Date</span>
          <span className="text-sm font-medium text-gray-900">
            {new Date(paymentDetails.scheduledDate).toLocaleDateString()}
          </span>
        </div>
        {paymentDetails.memo && (
          <div className="flex justify-between p-4">
            <span className="text-sm text-gray-500">Memo</span>
            <span className="text-sm text-gray-900">{paymentDetails.memo}</span>
          </div>
        )}
      </div>

      <form action={submitAction}>
        <div className="space-y-3">
          <ConfirmButton />
          <Button type="button" variant="outline" className="w-full" onClick={prevStep}>
            Back to Edit
          </Button>
        </div>
      </form>
    </div>
  );
}
