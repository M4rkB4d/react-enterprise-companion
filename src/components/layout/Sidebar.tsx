// src/components/layout/Sidebar.tsx — Collapsible sidebar navigation (Doc 03, Doc 05 §3)
import { useState } from 'react';
import { NavLink } from 'react-router';
import {
  LayoutDashboard,
  Landmark,
  CreditCard,
  ArrowLeftRight,
  Shield,
  ChevronLeft,
} from 'lucide-react';
import { cn } from '@/utils/cn';

const navItems = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/accounts', label: 'Accounts', icon: Landmark },
  { to: '/payments', label: 'Payments', icon: CreditCard },
  { to: '/transfers', label: 'Transfers', icon: ArrowLeftRight },
  { to: '/audit', label: 'Audit Log', icon: Shield },
];

/**
 * Collapsible sidebar navigation component.
 * Demonstrates the sidebar layout pattern from Doc 05 §3.
 *
 * The current AppLayout uses a horizontal top-nav instead.
 * This component provides the alternative sidebar layout pattern.
 *
 * Usage:
 * ```tsx
 * function SidebarLayout() {
 *   return (
 *     <div className="flex min-h-screen">
 *       <Sidebar />
 *       <main className="flex-1"><Outlet /></main>
 *     </div>
 *   );
 * }
 * ```
 */
export function Sidebar() {
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <aside
      className={cn(
        'flex flex-col border-r border-gray-200 bg-white transition-all duration-300 dark:border-gray-700 dark:bg-gray-800',
        isCollapsed ? 'w-16' : 'w-64',
      )}
    >
      {/* Navigation links */}
      <nav className="flex-1 space-y-1 p-3">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-blue-50 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300'
                    : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-gray-700 dark:hover:text-white',
                  isCollapsed && 'justify-center px-2',
                )
              }
              title={isCollapsed ? item.label : undefined}
            >
              <Icon className="h-5 w-5 flex-shrink-0" />
              {!isCollapsed && <span>{item.label}</span>}
            </NavLink>
          );
        })}
      </nav>

      {/* Collapse toggle */}
      <button
        onClick={() => setIsCollapsed((prev) => !prev)}
        className="flex items-center justify-center border-t border-gray-200 p-3 text-gray-400 hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-700"
        aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
      >
        <ChevronLeft className={cn('h-5 w-5 transition-transform', isCollapsed && 'rotate-180')} />
      </button>
    </aside>
  );
}
