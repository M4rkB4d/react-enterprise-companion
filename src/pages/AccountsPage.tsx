import { AccountList } from '@/features/accounts/components/AccountList';

export default function AccountsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Accounts</h1>
        <p className="mt-1 text-sm text-gray-500">View your account balances and activity</p>
      </div>
      <AccountList />
    </div>
  );
}
