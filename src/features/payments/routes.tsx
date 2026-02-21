// src/features/payments/routes.tsx — Doc 13 §7.1
/* eslint-disable react-refresh/only-export-components */
import { lazy, Suspense } from 'react';
import type { RouteObject } from 'react-router';
import { RequirePermission } from '@/components/auth/RequirePermission';
import { Spinner } from '@/components/ui/Spinner';

// Lazy-load feature components (Doc 10 §2: code splitting)
const PaymentsPage = lazy(() => import('./components/PaymentsPage'));
const PaymentWizard = lazy(() => import('./components/PaymentWizard'));
const PaymentHistory = lazy(() => import('./components/PaymentHistory'));

function LazyWrapper({ children }: { children: React.ReactNode }) {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center py-12">
          <Spinner size="lg" />
        </div>
      }
    >
      {children}
    </Suspense>
  );
}

export const paymentRoutes: RouteObject[] = [
  {
    path: 'payments',
    element: (
      <RequirePermission permission="payments:read">
        <LazyWrapper>
          <PaymentsPage />
        </LazyWrapper>
      </RequirePermission>
    ),
    children: [
      {
        index: true,
        element: (
          <LazyWrapper>
            <PaymentHistory />
          </LazyWrapper>
        ),
      },
      {
        path: 'new',
        element: (
          <RequirePermission permission="payments:write">
            <LazyWrapper>
              <PaymentWizard />
            </LazyWrapper>
          </RequirePermission>
        ),
      },
    ],
  },
];
