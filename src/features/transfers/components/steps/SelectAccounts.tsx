import { useState } from 'react';
import { useAccounts } from '@/features/accounts/hooks/useAccounts';
import { useTransferStore } from '../../store/transferStore';
import { Button } from '@/components/ui/Button';
import { Spinner } from '@/components/ui/Spinner';
import { AlertCircle } from 'lucide-react';

export function SelectAccountsStep() {
  const { data, isLoading, isError } = useAccounts();
  const { fromAccountId, toAccountId, setAccounts, nextStep } = useTransferStore();
  const [fromId, setFromId] = useState(fromAccountId);
  const [toId, setToId] = useState(toAccountId);
  const [error, setError] = useState('');

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <Spinner size="lg" />
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-4">
        <p className="text-sm text-red-800">Failed to load accounts.</p>
      </div>
    );
  }

  const activeAccounts = data.data.filter((a) => a.status === 'active');

  const handleContinue = () => {
    if (!fromId) {
      setError('Please select a source account.');
      return;
    }
    if (!toId) {
      setError('Please select a destination account.');
      return;
    }
    if (fromId === toId) {
      setError('Source and destination accounts must be different.');
      return;
    }
    setError('');
    setAccounts(fromId, toId);
    nextStep();
  };

  return (
    <div className="space-y-6">
      <h2 className="text-lg font-semibold text-gray-900">Select Accounts</h2>

      {error && (
        <div className="flex items-center gap-2 rounded-md bg-red-50 p-3">
          <AlertCircle className="h-5 w-5 text-red-600" />
          <p className="text-sm text-red-800">{error}</p>
        </div>
      )}

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">From Account</label>
          <select
            value={fromId}
            onChange={(e) => setFromId(e.target.value)}
            className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2"
          >
            <option value="">Select source account...</option>
            {activeAccounts.map((account) => (
              <option key={account.id} value={account.id}>
                {account.name} ({account.accountNumber}) - $
                {(account.availableBalance / 100).toLocaleString('en-US', {
                  minimumFractionDigits: 2,
                })}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">To Account</label>
          <select
            value={toId}
            onChange={(e) => setToId(e.target.value)}
            className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2"
          >
            <option value="">Select destination account...</option>
            {activeAccounts
              .filter((a) => a.id !== fromId)
              .map((account) => (
                <option key={account.id} value={account.id}>
                  {account.name} ({account.accountNumber})
                </option>
              ))}
          </select>
        </div>
      </div>

      <div className="flex justify-end pt-4">
        <Button onClick={handleContinue}>Continue</Button>
      </div>
    </div>
  );
}
