import { memo } from 'react';
import { Building2, CreditCard, Home, Shield, MoreHorizontal } from 'lucide-react';
import { cn } from '@/utils/cn';
import type { Payee, PayeeCategory } from '../schemas';

const categoryIcons: Record<PayeeCategory, React.ElementType> = {
  utility: Building2,
  credit_card: CreditCard,
  mortgage: Home,
  insurance: Shield,
  other: MoreHorizontal,
};

interface PayeeCardProps {
  payee: Payee;
  isSelected: boolean;
  onSelect: () => void;
}

export const PayeeCard = memo(function PayeeCard({ payee, isSelected, onSelect }: PayeeCardProps) {
  const Icon = categoryIcons[payee.category];

  return (
    <button
      type="button"
      onClick={onSelect}
      className={cn(
        'flex items-center gap-3 rounded-lg border p-4 text-left transition-colors',
        isSelected
          ? 'border-blue-600 bg-blue-50 ring-2 ring-blue-600'
          : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50',
      )}
    >
      <div
        className={cn(
          'flex h-10 w-10 items-center justify-center rounded-full',
          isSelected ? 'bg-blue-100' : 'bg-gray-100',
        )}
      >
        <Icon className={cn('h-5 w-5', isSelected ? 'text-blue-600' : 'text-gray-600')} />
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium text-gray-900">{payee.nickname}</p>
        <p className="truncate text-xs text-gray-500">{payee.name}</p>
        <p className="text-xs text-gray-400">Acct: {payee.accountNumber}</p>
      </div>
    </button>
  );
});
