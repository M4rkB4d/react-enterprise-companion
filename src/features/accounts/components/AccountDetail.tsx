import { Link, useParams } from 'react-router';
import { useAccountById } from '../hooks/useAccounts';
import { TransactionList } from './TransactionList';
import { Spinner } from '@/components/ui/Spinner';
import { ArrowLeft, AlertCircle } from 'lucide-react';

const typeLabels: Record<string, string> = {
  checking: 'Checking',
  savings: 'Savings',
  money_market: 'Money Market',
  cd: 'Certificate of Deposit',
};

export function AccountDetail() {
  const { id } = useParams<{ id: string }>();
  const { data: account, isLoading, isError, error } = useAccountById(id ?? '');

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
          <p className="text-sm text-red-800">Failed to load account: {error.message}</p>
        </div>
      </div>
    );
  }

  if (!account) return null;

  return (
    <div className="space-y-6">
      <Link
        to="/accounts"
        className="inline-flex items-center gap-1 text-sm text-blue-600 hover:text-blue-800"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Accounts
      </Link>

      <div className="rounded-lg border border-gray-200 bg-white p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{account.name}</h1>
            <p className="mt-1 text-sm text-gray-500">
              {typeLabels[account.type]} &bull; {account.accountNumber} &bull; Routing:{' '}
              {account.routingNumber}
            </p>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-500">Available Balance</p>
            <p className="text-3xl font-bold text-gray-900">
              $
              {(account.availableBalance / 100).toLocaleString('en-US', {
                minimumFractionDigits: 2,
              })}
            </p>
            {account.balance !== account.availableBalance && (
              <p className="mt-1 text-sm text-gray-400">
                Total: $
                {(account.balance / 100).toLocaleString('en-US', {
                  minimumFractionDigits: 2,
                })}
              </p>
            )}
          </div>
        </div>

        <div className="mt-4 flex gap-6 border-t border-gray-100 pt-4 text-sm text-gray-500">
          <span>Currency: {account.currency}</span>
          <span>
            Status: <span className="font-medium capitalize text-gray-700">{account.status}</span>
          </span>
          <span>Opened: {new Date(account.openedAt).toLocaleDateString()}</span>
        </div>
      </div>

      <div>
        <h2 className="mb-4 text-lg font-semibold text-gray-900">Recent Transactions</h2>
        <TransactionList accountId={account.id} />
      </div>
    </div>
  );
}
