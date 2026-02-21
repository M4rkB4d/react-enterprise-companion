import { useState, useMemo } from 'react';
import { useTransactions } from '../hooks/useTransactions';
import { Spinner } from '@/components/ui/Spinner';
import { Button } from '@/components/ui/Button';
import { cn } from '@/utils/cn';
import { ArrowDownLeft, ArrowUpRight, Loader2 } from 'lucide-react';

interface TransactionListProps {
  accountId: string;
}

const categoryLabels: Record<string, string> = {
  deposit: 'Deposit',
  withdrawal: 'Withdrawal',
  transfer: 'Transfer',
  payment: 'Payment',
  fee: 'Fee',
  interest: 'Interest',
  refund: 'Refund',
};

export function TransactionList({ accountId }: TransactionListProps) {
  const [typeFilter, setTypeFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');

  const { data, isLoading, hasNextPage, fetchNextPage, isFetchingNextPage } = useTransactions({
    accountId,
    type: typeFilter,
    category: categoryFilter,
  });

  const transactions = useMemo(() => data?.pages.flatMap((page) => page.data) ?? [], [data]);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <label className="text-sm font-medium text-gray-700">Type:</label>
        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          className="rounded-md border border-gray-300 px-3 py-1.5 text-sm"
        >
          <option value="">All</option>
          <option value="credit">Credit</option>
          <option value="debit">Debit</option>
        </select>

        <label className="text-sm font-medium text-gray-700">Category:</label>
        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="rounded-md border border-gray-300 px-3 py-1.5 text-sm"
        >
          <option value="">All</option>
          {Object.entries(categoryLabels).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12">
          <Spinner size="lg" />
        </div>
      ) : transactions.length === 0 ? (
        <div className="rounded-lg border-2 border-dashed border-gray-300 p-8 text-center">
          <p className="text-gray-500">No transactions found.</p>
        </div>
      ) : (
        <>
          <div className="overflow-hidden rounded-lg border border-gray-200">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">
                    Description
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">
                    Category
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">
                    Date
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium uppercase text-gray-500">
                    Amount
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium uppercase text-gray-500">
                    Balance
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white">
                {transactions.map((txn) => (
                  <tr key={txn.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        {txn.type === 'credit' ? (
                          <ArrowDownLeft className="h-4 w-4 text-green-600" />
                        ) : (
                          <ArrowUpRight className="h-4 w-4 text-red-600" />
                        )}
                        <div>
                          <p className="text-sm font-medium text-gray-900">{txn.description}</p>
                          {txn.merchant && <p className="text-xs text-gray-500">{txn.merchant}</p>}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-500">
                      {categoryLabels[txn.category] ?? txn.category}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-500">
                      {new Date(txn.createdAt).toLocaleDateString()}
                    </td>
                    <td
                      className={cn(
                        'px-4 py-3 text-right text-sm font-medium',
                        txn.type === 'credit' ? 'text-green-700' : 'text-red-700',
                      )}
                    >
                      {txn.type === 'credit' ? '+' : '-'}${(txn.amount / 100).toFixed(2)}
                    </td>
                    <td className="px-4 py-3 text-right text-sm text-gray-900">
                      ${(txn.balance / 100).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {hasNextPage && (
            <div className="flex justify-center">
              <Button
                variant="outline"
                onClick={() => fetchNextPage()}
                disabled={isFetchingNextPage}
              >
                {isFetchingNextPage ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Loading...
                  </>
                ) : (
                  'Load More Transactions'
                )}
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
