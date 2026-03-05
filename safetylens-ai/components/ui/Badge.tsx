import type { HTMLAttributes, ReactNode } from 'react';
import clsx from 'clsx';

export type BadgeVariant = 'default' | 'success' | 'warning' | 'danger' | 'info';

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
  children: ReactNode;
}

const variantStyles: Record<BadgeVariant, string> = {
  default:
    'bg-gray-100 text-gray-700 ring-gray-300 dark:bg-gray-700 dark:text-gray-300 dark:ring-gray-600',
  success:
    'bg-green-50 text-green-700 ring-green-300 dark:bg-green-900/30 dark:text-green-400 dark:ring-green-700',
  warning:
    'bg-yellow-50 text-yellow-800 ring-yellow-300 dark:bg-yellow-900/30 dark:text-yellow-400 dark:ring-yellow-700',
  danger:
    'bg-red-50 text-red-700 ring-red-300 dark:bg-red-900/30 dark:text-red-400 dark:ring-red-700',
  info:
    'bg-blue-50 text-blue-700 ring-blue-300 dark:bg-blue-900/30 dark:text-blue-400 dark:ring-blue-700',
};

function Badge({ variant = 'default', className, children, ...props }: BadgeProps) {
  return (
    <span
      className={clsx(
        'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset',
        variantStyles[variant],
        className,
      )}
      {...props}
    >
      {children}
    </span>
  );
}

export { Badge };
