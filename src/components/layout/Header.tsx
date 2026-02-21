// src/components/layout/Header.tsx — App header bar (Doc 03, Doc 05 §7)
import { Link } from 'react-router';
import { LogOut } from 'lucide-react';
import { useAuthStore } from '@/stores/authStore';
import { useLogout } from '@/features/auth/hooks/useLogin';
import { LanguageSwitcher } from './LanguageSwitcher';
import { ThemeToggle } from './ThemeToggle';

/**
 * Top-level application header with branding, locale/theme controls, and user menu.
 * Extracted from AppLayout to demonstrate the Header component pattern (Doc 03).
 *
 * In production, this would be imported by AppLayout:
 * ```tsx
 * export function AppLayout() {
 *   return (
 *     <>
 *       <Header />
 *       <main><Outlet /></main>
 *     </>
 *   );
 * }
 * ```
 */
export function Header() {
  const user = useAuthStore((s) => s.user);
  const logoutMutation = useLogout();

  return (
    <header className="border-b border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-3">
        {/* Branding */}
        <Link to="/" className="text-lg font-semibold text-gray-900 dark:text-white">
          Enterprise Banking
        </Link>

        {/* Right-side controls */}
        <div className="flex items-center gap-3">
          <LanguageSwitcher />
          <ThemeToggle />

          {user && (
            <div className="flex items-center gap-3 border-l border-gray-200 pl-3 dark:border-gray-600">
              <span className="text-sm text-gray-600 dark:text-gray-300">{user.name}</span>
              <button
                onClick={() => logoutMutation.mutate()}
                className="flex items-center gap-1 rounded-md px-2 py-1 text-sm text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-gray-200"
                title="Logout"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
