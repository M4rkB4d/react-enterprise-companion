import { usePayees } from '../hooks/usePayees';
import { PayeeCard } from './PayeeCard';
import { Spinner } from '@/components/ui/Spinner';
import { AlertCircle } from 'lucide-react';
import type { Payee } from '../schemas';

interface PayeeListProps {
  onSelect: (payee: Payee) => void;
  selectedId?: string;
}

export function PayeeList({ onSelect, selectedId }: PayeeListProps) {
  const { data, isLoading, isError, error } = usePayees();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Spinner size="lg" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-4">
        <div className="flex items-center gap-2">
          <AlertCircle className="h-5 w-5 text-red-600" />
          <p className="text-sm text-red-800">Failed to load payees: {error.message}</p>
        </div>
      </div>
    );
  }

  if (!data?.data.length) {
    return (
      <div className="rounded-lg border-2 border-dashed border-gray-300 p-12 text-center">
        <p className="text-gray-500">No payees saved yet.</p>
        <p className="mt-1 text-sm text-gray-400">Add a payee to get started.</p>
      </div>
    );
  }

  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {data.data.map((payee) => (
        <PayeeCard
          key={payee.id}
          payee={payee}
          isSelected={payee.id === selectedId}
          onSelect={() => onSelect(payee)}
        />
      ))}
    </div>
  );
}
