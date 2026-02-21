import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { createPayeeSchema, type CreatePayeeInput, type PayeeCategory } from '../schemas';
import { useCreatePayee } from '../hooks/usePayees';
import { Button } from '@/components/ui/Button';
import { FormField } from '@/components/form/FormField';
import { X } from 'lucide-react';

const categoryOptions: { value: PayeeCategory; label: string }[] = [
  { value: 'utility', label: 'Utility' },
  { value: 'credit_card', label: 'Credit Card' },
  { value: 'mortgage', label: 'Mortgage' },
  { value: 'insurance', label: 'Insurance' },
  { value: 'other', label: 'Other' },
];

interface AddPayeeDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AddPayeeDialog({ isOpen, onClose }: AddPayeeDialogProps) {
  const createPayee = useCreatePayee();
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<CreatePayeeInput>({
    resolver: zodResolver(createPayeeSchema),
    defaultValues: { name: '', nickname: '', accountNumber: '', category: 'utility' },
  });

  if (!isOpen) return null;

  const onSubmit = handleSubmit(async (data) => {
    await createPayee.mutateAsync(data);
    reset();
    onClose();
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-xl">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Add New Payee</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="h-5 w-5" />
          </button>
        </div>
        <form onSubmit={onSubmit} className="mt-4 space-y-4">
          <FormField label="Payee Name" error={errors.name?.message}>
            <input
              {...register('name')}
              placeholder="Pacific Gas & Electric"
              className="w-full rounded-md border border-gray-300 px-3 py-2"
            />
          </FormField>
          <FormField label="Nickname" error={errors.nickname?.message}>
            <input
              {...register('nickname')}
              placeholder="PG&E"
              className="w-full rounded-md border border-gray-300 px-3 py-2"
            />
          </FormField>
          <FormField label="Account Number" error={errors.accountNumber?.message}>
            <input
              {...register('accountNumber')}
              placeholder="1234567890"
              className="w-full rounded-md border border-gray-300 px-3 py-2"
            />
          </FormField>
          <FormField label="Category" error={errors.category?.message}>
            <select
              {...register('category')}
              className="w-full rounded-md border border-gray-300 px-3 py-2"
            >
              {categoryOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </FormField>
          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Adding...' : 'Add Payee'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
