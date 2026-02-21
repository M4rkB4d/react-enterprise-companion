import { useAuthStore } from '@/stores/authStore';

export function usePermission(permission: string): boolean {
  const permissions = useAuthStore((s) => s.user?.permissions ?? []);
  return permissions.includes(permission);
}
