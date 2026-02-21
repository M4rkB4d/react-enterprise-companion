// src/components/ui/Badge.tsx — Status badge component (Doc 03 §16)
import type { ReactNode } from 'react';
import { cn } from '@/utils/cn';

export interface BadgeProps {
  children: ReactNode;
  variant?: 'default' | 'primary' | 'success' | 'warning' | 'error';
  size?: 'sm' | 'md' | 'lg';
  dot?: boolean;
  className?: string;
}

const variants = {
  default: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200',
  primary: 'bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300',
  success: 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300',
  warning: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300',
  error: 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300',
};

const dotColors = {
  default: 'bg-gray-500',
  primary: 'bg-blue-500',
  success: 'bg-green-500',
  warning: 'bg-yellow-500',
  error: 'bg-red-500',
};

const sizes = {
  sm: 'px-2 py-0.5 text-xs',
  md: 'px-2.5 py-0.5 text-sm',
  lg: 'px-3 py-1 text-sm',
};

/**
 * Inline status badge for labels, tags, and indicators.
 *
 * Usage:
 * ```tsx
 * <Badge variant="success" dot>Active</Badge>
 * <Badge variant="error">Overdue</Badge>
 * <Badge variant="warning" size="sm">Pending</Badge>
 * ```
 */
export function Badge({ children, variant = 'default', size = 'md', dot, className }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center font-medium rounded-full',
        variants[variant],
        sizes[size],
        className,
      )}
    >
      {dot && (
        <span
          className={cn('w-1.5 h-1.5 rounded-full mr-1.5', dotColors[variant])}
          aria-hidden="true"
        />
      )}
      {children}
    </span>
  );
}
