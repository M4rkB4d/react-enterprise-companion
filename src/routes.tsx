import { lazy, Suspense } from 'react';
import { Routes, Route } from 'react-router';
import { AppLayout } from '@/components/layout/AppLayout';
import { RequireAuth } from '@/components/auth/RequireAuth';
import { Spinner } from '@/components/ui/Spinner';

// Lazy-loaded pages
const LoginPage = lazy(() => import('@/features/auth/components/LoginPage'));
const DashboardPage = lazy(() => import('@/pages/DashboardPage'));
const PaymentsPage = lazy(() =>
  import('@/features/payments/components/PaymentsPage').then((m) => ({
    default: m.default,
  })),
);
const PaymentWizard = lazy(() => import('@/features/payments/components/PaymentWizard'));
const PaymentHistory = lazy(() => import('@/features/payments/components/PaymentHistory'));

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

export function AppRoutes() {
  return (
    <Routes>
      {/* Public route */}
      <Route
        path="login"
        element={
          <LazyWrapper>
            <LoginPage />
          </LazyWrapper>
        }
      />

      {/* Protected routes */}
      <Route element={<RequireAuth />}>
        <Route element={<AppLayout />}>
          <Route
            index
            element={
              <LazyWrapper>
                <DashboardPage />
              </LazyWrapper>
            }
          />
          <Route
            path="payments"
            element={
              <LazyWrapper>
                <PaymentsPage />
              </LazyWrapper>
            }
          >
            <Route
              index
              element={
                <LazyWrapper>
                  <PaymentHistory />
                </LazyWrapper>
              }
            />
            <Route
              path="new"
              element={
                <LazyWrapper>
                  <PaymentWizard />
                </LazyWrapper>
              }
            />
          </Route>
        </Route>
      </Route>
    </Routes>
  );
}
