import { lazy, Suspense } from 'react';
import { Routes, Route } from 'react-router';
import { AppLayout } from '@/components/layout/AppLayout';
import { RequireAuth } from '@/components/auth/RequireAuth';
import { Spinner } from '@/components/ui/Spinner';

// Lazy-loaded pages
const LoginPage = lazy(() => import('@/features/auth/components/LoginPage'));
const DashboardPage = lazy(() => import('@/pages/DashboardPage'));
const AccountsPage = lazy(() => import('@/pages/AccountsPage'));
const AccountDetailPage = lazy(() => import('@/pages/AccountDetailPage'));

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
            path="accounts"
            element={
              <LazyWrapper>
                <AccountsPage />
              </LazyWrapper>
            }
          />
          <Route
            path="accounts/:accountId"
            element={
              <LazyWrapper>
                <AccountDetailPage />
              </LazyWrapper>
            }
          />
        </Route>
      </Route>
    </Routes>
  );
}
