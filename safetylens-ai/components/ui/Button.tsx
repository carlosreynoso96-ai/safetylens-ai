'use client';

import React, { forwardRef, type ButtonHTMLAttributes, type ReactNode } from 'react';
import clsx from 'clsx';
import { Loader2 } from 'lucide-react';

export type ButtonVariant = 'primary' | 'secondary' | 'danger' | 'ghost';
export type ButtonSize = 'sm' | 'md' | 'lg';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  asChild?: boolean;
  children: ReactNode;
}

const variantStyles: Record<ButtonVariant, string> = {
  primary:
    'bg-[#f97316] text-white hover:bg-[#ea580c] focus-visible:ring-[#f97316]/50 shadow-sm',
  secondary:
    'bg-gray-100 text-gray-900 hover:bg-gray-200 focus-visible:ring-gray-400/50 shadow-sm dark:bg-gray-700 dark:text-gray-100 dark:hover:bg-gray-600',
  danger:
    'bg-red-600 text-white hover:bg-red-700 focus-visible:ring-red-500/50 shadow-sm',
  ghost:
    'bg-transparent text-gray-700 hover:bg-gray-100 focus-visible:ring-gray-400/50 dark:text-gray-300 dark:hover:bg-gray-800',
};

const sizeStyles: Record<ButtonSize, string> = {
  sm: 'px-3 py-1.5 text-sm gap-1.5',
  md: 'px-4 py-2 text-sm gap-2',
  lg: 'px-6 py-3 text-base gap-2.5',
};

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = 'primary',
      size = 'md',
      loading = false,
      disabled = false,
      asChild = false,
      className,
      children,
      ...props
    },
    ref,
  ) => {
    const isDisabled = disabled || loading;

    const classes = clsx(
      'inline-flex items-center justify-center font-medium rounded-lg transition-colors duration-150',
      'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2',
      'disabled:opacity-50 disabled:pointer-events-none',
      variantStyles[variant],
      sizeStyles[size],
      className,
    );

    // asChild pattern: clone the single child element with button styles
    if (asChild) {
      const child = React.Children.only(children) as React.ReactElement<
        Record<string, unknown>
      >;
      return React.cloneElement(child, {
        className: clsx(classes, (child.props as { className?: string }).className),
        ref,
        ...props,
      });
    }

    return (
      <button
        ref={ref}
        className={classes}
        disabled={isDisabled}
        aria-busy={loading || undefined}
        {...props}
      >
        {loading && (
          <Loader2 className="animate-spin shrink-0" size={size === 'lg' ? 20 : 16} />
        )}
        {children}
      </button>
    );
  },
);

Button.displayName = 'Button';

export { Button };
