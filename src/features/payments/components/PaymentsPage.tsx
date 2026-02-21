import { Outlet, NavLink, useNavigate } from 'react-router';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { usePermission } from '@/hooks/usePermission';
import { PaymentErrorBoundary } from './PaymentErrorBoundary';

export default function PaymentsPage() {
  const navigate = useNavigate();
  const canWrite = usePermission('payments:write');

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Bill Payments</h1>
          <p className="mt-1 text-sm text-gray-500">Manage your payees and make payments</p>
        </div>
        {canWrite && (
          <Button onClick={() => navigate('new')}>
            <Plus className="mr-2 h-4 w-4" />
            New Payment
          </Button>
        )}
      </div>

      <nav className="flex gap-4 border-b border-gray-200">
        <NavLink
          to="."
          end
          className={({ isActive }) =>
            `pb-2 text-sm font-medium ${
              isActive
                ? 'border-b-2 border-blue-600 text-blue-600'
                : 'text-gray-500 hover:text-gray-700'
            }`
          }
        >
          Payment History
        </NavLink>
        <NavLink
          to="new"
          className={({ isActive }) =>
            `pb-2 text-sm font-medium ${
              isActive
                ? 'border-b-2 border-blue-600 text-blue-600'
                : 'text-gray-500 hover:text-gray-700'
            }`
          }
        >
          New Payment
        </NavLink>
      </nav>

      <PaymentErrorBoundary>
        <Outlet />
      </PaymentErrorBoundary>
    </div>
  );
}
