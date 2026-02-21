import { memo } from 'react';
import { Link } from 'react-router';
import { Landmark, PiggyBank, TrendingUp, Clock, ArrowRight } from 'lucide-react';
import { cn } from '@/utils/cn';
import type { Account, AccountType } from '../types';

const typeIcons: Record<AccountType, React.ElementType> = {
  checking: Landmark,
  savings: PiggyBank,
  money_market: TrendingUp,
  cd: Clock,
};

const typeLabels: Record<AccountType, string> = {
  checking: 'Checking',
  savings: 'Savings',
  money_market: 'Money Market',
  cd: 'Certificate of Deposit',
};

const statusColors: Record<string, string> = {
  active: 'bg-green-100 text-green-800',
  inactive: 'bg-gray-100 text-gray-800',
  frozen: 'bg-red-100 text-red-800',
};

interface AccountCardProps {
  account: Account;
}

export const AccountCard = memo(function AccountCard({ account }: AccountCardProps) {
  const Icon = typeIcons[account.type];

  return (
    <Link
      to={`/accounts/${account.id}`}
      className="group flex flex-col rounded-lg border border-gray-200 bg-white p-6 transition-shadow hover:shadow-md"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100">
            <Icon className="h-5 w-5 text-blue-600" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">{account.name}</h3>
            <p className="text-xs text-gray-500">
              {typeLabels[account.type]} &bull; {account.accountNumber}
            </p>
          </div>
        </div>
        <ArrowRight className="h-5 w-5 text-gray-400 transition-transform group-hover:translate-x-1" />
      </div>

      <div className="mt-4 flex items-end justify-between">
        <div>
          <p className="text-sm text-gray-500">Available Balance</p>
          <p className="text-2xl font-bold text-gray-900">
            $
            {(account.availableBalance / 100).toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </p>
        </div>
        <span
          className={cn(
            'inline-flex rounded-full px-2 py-0.5 text-xs font-medium capitalize',
            statusColors[account.status],
          )}
        >
          {account.status}
        </span>
      </div>

      {account.balance !== account.availableBalance && (
        <p className="mt-1 text-xs text-gray-400">
          Total balance: $
          {(account.balance / 100).toLocaleString('en-US', { minimumFractionDigits: 2 })}
        </p>
      )}
    </Link>
  );
});
