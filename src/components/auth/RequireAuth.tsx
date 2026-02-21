// src/components/auth/RequireAuth.tsx — Route-level auth guard (Doc 09 §3)
import type { ReactNode } from 'react';
import { Navigate, Outlet, useLocation } from 'react-router';
import { useAuthStore } from '@/stores/authStore';

interface RequireAuthProps {
  children?: ReactNode;
  redirectTo?: string;
}

/**
 * Wraps routes that require authentication.
 * Redirects unauthenticated users to the login page,
 * preserving the original location for post-login redirect.
 *
 * Can be used as a layout route (renders Outlet) or as a wrapper (renders children):
 * ```tsx
 * // Layout route pattern (preferred)
 * <Route element={<RequireAuth />}>
 *   <Route element={<AppLayout />}>...</Route>
 * </Route>
 *
 * // Wrapper pattern
 * <Route element={<RequireAuth><AppLayout /></RequireAuth>}>
 *   <Route index element={<DashboardPage />} />
 * </Route>
 * ```
 */
export function RequireAuth({ children, redirectTo = '/login' }: RequireAuthProps) {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to={redirectTo} state={{ from: location }} replace />;
  }

  return children ? <>{children}</> : <Outlet />;
}
