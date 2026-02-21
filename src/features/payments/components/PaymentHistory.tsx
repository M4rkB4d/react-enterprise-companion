import { useState, useMemo } from 'react';
import { usePayments } from '../hooks/usePayments';
import { usePayees } from '../hooks/usePayees';
import { Spinner } from '@/components/ui/Spinner';
import { cn } from '@/utils/cn';
import type { PaymentStatus } from '../schemas';

const statusStyles: Record<PaymentStatus, string> = {
  pending: 'bg-yellow-100 text-yellow-800',
  processing: 'bg-blue-100 text-blue-800',
  completed: 'bg-green-100 text-green-800',
  failed: 'bg-red-100 text-red-800',
  cancelled: 'bg-gray-100 text-gray-800',
};

export default function PaymentHistory() {
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState<string>('');

  const { data: payments, isLoading } = usePayments({
    page,
    pageSize: 20,
    status: statusFilter || undefined,
  });

  const { data: payeesData } = usePayees();

  const payeeMap = useMemo(() => {
    const map = new Map<string, string>();
    payeesData?.data.forEach((p) => map.set(p.id, p.nickname));
    return map;
  }, [payeesData]);

  if (isLoading && !payments) {
    return (
      <div className="flex justify-center py-12">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <label className="text-sm font-medium text-gray-700">Status:</label>
        <select
          value={statusFilter}
          onChange={(e) => {
            setStatusFilter(e.target.value);
            setPage(1);
          }}
          className="rounded-md border border-gray-300 px-3 py-1.5 text-sm"
        >
          <option value="">All</option>
          <option value="pending">Pending</option>
          <option value="processing">Processing</option>
          <option value="completed">Completed</option>
          <option value="failed">Failed</option>
        </select>
      </div>

      <div className="overflow-hidden rounded-lg border border-gray-200">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">
                Payee
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">
                Amount
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">
                Date
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">
                Status
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 bg-white">
            {payments?.data.map((payment) => (
              <tr key={payment.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 text-sm text-gray-900">
                  {payeeMap.get(payment.payeeId) ?? 'Unknown'}
                </td>
                <td className="px-4 py-3 text-sm font-medium text-gray-900">
                  ${(payment.amount / 100).toFixed(2)}
                </td>
                <td className="px-4 py-3 text-sm text-gray-500">
                  {new Date(payment.scheduledDate).toLocaleDateString()}
                </td>
                <td className="px-4 py-3">
                  <span
                    className={cn(
                      'inline-flex rounded-full px-2 py-0.5 text-xs font-medium',
                      statusStyles[payment.status],
                    )}
                  >
                    {payment.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {payments && payments.totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-500">
            Page {payments.page} of {payments.totalPages} ({payments.total} total)
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="rounded-md border px-3 py-1 text-sm disabled:opacity-50"
            >
              Previous
            </button>
            <button
              onClick={() => setPage((p) => Math.min(payments.totalPages, p + 1))}
              disabled={page === payments.totalPages}
              className="rounded-md border px-3 py-1 text-sm disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
