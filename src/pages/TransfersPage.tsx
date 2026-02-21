import { lazy, Suspense } from 'react';
import { Spinner } from '@/components/ui/Spinner';

const TransferWizard = lazy(() => import('@/features/transfers/components/TransferWizard'));

export default function TransfersPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Transfer Funds</h1>
        <p className="mt-1 text-sm text-gray-500">Move money between your accounts</p>
      </div>
      <Suspense
        fallback={
          <div className="flex justify-center py-12">
            <Spinner size="lg" />
          </div>
        }
      >
        <TransferWizard />
      </Suspense>
    </div>
  );
}
