import type { ReactNode } from 'react';
import { Navigate } from 'react-router';
import { usePermission } from '@/hooks/usePermission';

interface RequirePermissionProps {
  permission: string;
  children: ReactNode;
  fallback?: ReactNode;
}

export function RequirePermission({ permission, children, fallback }: RequirePermissionProps) {
  const hasPermission = usePermission(permission);
  if (!hasPermission) {
    return fallback ?? <Navigate to="/unauthorized" replace />;
  }
  return <>{children}</>;
}
