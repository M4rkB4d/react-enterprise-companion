import { Link } from 'react-router';
import { CreditCard, ArrowRight } from 'lucide-react';

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="mt-1 text-sm text-gray-500">Welcome to Enterprise Banking</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Link
          to="/payments"
          className="group flex items-center gap-4 rounded-lg border border-gray-200 bg-white p-6 transition-shadow hover:shadow-md"
        >
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-100">
            <CreditCard className="h-6 w-6 text-blue-600" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-gray-900">Bill Payments</h3>
            <p className="text-sm text-gray-500">Manage payees and payments</p>
          </div>
          <ArrowRight className="h-5 w-5 text-gray-400 transition-transform group-hover:translate-x-1" />
        </Link>
      </div>
    </div>
  );
}
