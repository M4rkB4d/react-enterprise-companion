import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useTransferStore } from '../../store/transferStore';
import { useAccounts } from '@/features/accounts/hooks/useAccounts';
import { Button } from '@/components/ui/Button';
import { FormField } from '@/components/form/FormField';

const amountFormSchema = z.object({
  amount: z
    .number({ error: 'Please enter a valid amount' })
    .positive({ error: 'Amount must be greater than $0' })
    .max(100_000, { error: 'Maximum transfer is $100,000' }),
  memo: z.string().max(200, { error: 'Memo is too long' }).optional(),
});

type AmountForm = z.infer<typeof amountFormSchema>;

export function EnterAmountStep() {
  const { fromAccountId, amount, memo, setAmount, setMemo, nextStep, prevStep } =
    useTransferStore();
  const { data: accountsData } = useAccounts();

  const fromAccount = accountsData?.data.find((a) => a.id === fromAccountId);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<AmountForm>({
    resolver: zodResolver(amountFormSchema),
    defaultValues: {
      amount: amount || undefined,
      memo: memo || undefined,
    },
  });

  const onSubmit = handleSubmit((data) => {
    setAmount(data.amount);
    setMemo(data.memo ?? '');
    nextStep();
  });

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      <h2 className="text-lg font-semibold text-gray-900">Enter Amount</h2>

      {fromAccount && (
        <div className="rounded-md bg-blue-50 p-3">
          <p className="text-sm text-blue-800">
            Available balance:{' '}
            <strong>
              $
              {(fromAccount.availableBalance / 100).toLocaleString('en-US', {
                minimumFractionDigits: 2,
              })}
            </strong>
          </p>
        </div>
      )}

      <FormField label="Transfer Amount ($)" error={errors.amount?.message}>
        <input
          type="number"
          step="0.01"
          {...register('amount', { valueAsNumber: true })}
          placeholder="0.00"
          className="w-full rounded-md border border-gray-300 px-3 py-2 text-lg"
        />
      </FormField>

      <FormField label="Memo (optional)" error={errors.memo?.message}>
        <textarea
          {...register('memo')}
          placeholder="Savings contribution"
          rows={2}
          className="w-full rounded-md border border-gray-300 px-3 py-2"
        />
      </FormField>

      <div className="flex justify-between pt-4">
        <Button type="button" variant="outline" onClick={prevStep}>
          Back
        </Button>
        <Button type="submit">Review Transfer</Button>
      </div>
    </form>
  );
}
