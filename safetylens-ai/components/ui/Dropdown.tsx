'use client';

import { forwardRef, type SelectHTMLAttributes, useId, type ReactNode } from 'react';
import clsx from 'clsx';
import { ChevronDown } from 'lucide-react';

export interface DropdownOption {
  label: string;
  value: string;
  disabled?: boolean;
}

export interface DropdownProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  hint?: string;
  placeholder?: string;
  options?: DropdownOption[];
  wrapperClassName?: string;
  children?: ReactNode;
}

const Dropdown = forwardRef<HTMLSelectElement, DropdownProps>(
  (
    {
      label,
      error,
      hint,
      placeholder,
      options,
      id,
      wrapperClassName,
      className,
      children,
      ...props
    },
    ref,
  ) => {
    const generatedId = useId();
    const selectId = id || generatedId;
    const errorId = error ? `${selectId}-error` : undefined;
    const hintId = hint ? `${selectId}-hint` : undefined;

    return (
      <div className={clsx('flex flex-col gap-1.5', wrapperClassName)}>
        {label && (
          <label
            htmlFor={selectId}
            className="text-sm font-medium text-gray-700 dark:text-gray-300"
          >
            {label}
          </label>
        )}

        <div className="relative">
          <select
            ref={ref}
            id={selectId}
            aria-invalid={error ? true : undefined}
            aria-describedby={
              [errorId, hintId].filter(Boolean).join(' ') || undefined
            }
            className={clsx(
              'block w-full appearance-none rounded-lg border px-3 py-2 pr-10 text-sm',
              'bg-white dark:bg-gray-900',
              'text-gray-900 dark:text-gray-100',
              'transition-colors duration-150',
              'focus:outline-none focus:ring-2 focus:ring-offset-1',
              'disabled:cursor-not-allowed disabled:opacity-50',
              error
                ? 'border-red-500 focus:border-red-500 focus:ring-red-500/30'
                : 'border-gray-300 dark:border-gray-600 focus:border-[#f97316] focus:ring-[#f97316]/30',
              className,
            )}
            {...props}
          >
            {placeholder && (
              <option value="" disabled>
                {placeholder}
              </option>
            )}
            {options
              ? options.map((opt) => (
                  <option key={opt.value} value={opt.value} disabled={opt.disabled}>
                    {opt.label}
                  </option>
                ))
              : children}
          </select>

          {/* Chevron icon */}
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
            <ChevronDown size={16} className="text-gray-400" />
          </div>
        </div>

        {hint && !error && (
          <p id={hintId} className="text-xs text-gray-500 dark:text-gray-400">
            {hint}
          </p>
        )}

        {error && (
          <p id={errorId} role="alert" className="text-xs text-red-600 dark:text-red-400">
            {error}
          </p>
        )}
      </div>
    );
  },
);

Dropdown.displayName = 'Dropdown';

export { Dropdown };
