import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { usePaymentWizardStore } from '../../store/paymentWizardStore';
import { Button } from '@/components/ui/Button';
import { FormField } from '@/components/form/FormField';

const paymentDetailsSchema = z.object({
  amount: z
    .number({ error: 'Please enter a valid amount' })
    .positive({ error: 'Amount must be greater than $0' })
    .max(50_000, { error: 'Maximum payment is $50,000' }),
  scheduledDate: z
    .string()
    .min(1, { error: 'Payment date is required' })
    .refine((date) => new Date(date) >= new Date(new Date().toDateString()), {
      error: 'Payment date cannot be in the past',
    }),
  memo: z.string().max(200, { error: 'Memo is too long' }).optional(),
});

type PaymentDetailsForm = z.infer<typeof paymentDetailsSchema>;

export function PaymentDetailsStep() {
  const { paymentDetails, setPaymentDetails, nextStep, prevStep } = usePaymentWizardStore();
  const selectedPayee = usePaymentWizardStore((s) => s.selectedPayee);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<PaymentDetailsForm>({
    resolver: zodResolver(paymentDetailsSchema),
    defaultValues: {
      amount: paymentDetails.amount || undefined,
      scheduledDate: paymentDetails.scheduledDate,
      memo: paymentDetails.memo,
    },
  });

  const onSubmit = handleSubmit((data) => {
    setPaymentDetails({
      amount: data.amount,
      scheduledDate: data.scheduledDate,
      memo: data.memo ?? '',
    });
    nextStep();
  });

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <h2 className="text-lg font-semibold text-gray-900">Payment Details</h2>

      <div className="rounded-md bg-blue-50 p-3">
        <p className="text-sm text-blue-800">
          Paying: <strong>{selectedPayee?.nickname}</strong> ({selectedPayee?.name})
        </p>
      </div>

      <FormField label="Amount ($)" error={errors.amount?.message}>
        <input
          type="number"
          step="0.01"
          {...register('amount', { valueAsNumber: true })}
          placeholder="0.00"
          className="w-full rounded-md border border-gray-300 px-3 py-2"
        />
      </FormField>

      <FormField label="Payment Date" error={errors.scheduledDate?.message}>
        <input
          type="date"
          {...register('scheduledDate')}
          min={new Date().toISOString().split('T')[0]}
          className="w-full rounded-md border border-gray-300 px-3 py-2"
        />
      </FormField>

      <FormField label="Memo (optional)" error={errors.memo?.message}>
        <textarea
          {...register('memo')}
          placeholder="January utility bill"
          rows={2}
          className="w-full rounded-md border border-gray-300 px-3 py-2"
        />
      </FormField>

      <div className="flex justify-between pt-4">
        <Button type="button" variant="outline" onClick={prevStep}>
          Back
        </Button>
        <Button type="submit">Continue to Review</Button>
      </div>
    </form>
  );
}
