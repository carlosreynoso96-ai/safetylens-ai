import type { HTMLAttributes, ReactNode } from 'react';
import clsx from 'clsx';

/* ─── Card Root ──────────────────────────────────────────────────────── */

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  hover?: boolean;
  children: ReactNode;
}

function Card({ hover = false, className, children, ...props }: CardProps) {
  return (
    <div
      className={clsx(
        'rounded-xl border border-gray-200 bg-white shadow-sm',
        'dark:border-gray-700 dark:bg-gray-900',
        hover &&
          'transition-shadow duration-200 hover:shadow-md hover:border-gray-300 dark:hover:border-gray-600',
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}

/* ─── Card Header ────────────────────────────────────────────────────── */

export interface CardHeaderProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
}

function CardHeader({ className, children, ...props }: CardHeaderProps) {
  return (
    <div
      className={clsx(
        'border-b border-gray-200 px-6 py-4 dark:border-gray-700',
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}

/* ─── Card Body ──────────────────────────────────────────────────────── */

export interface CardBodyProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
}

function CardBody({ className, children, ...props }: CardBodyProps) {
  return (
    <div className={clsx('px-6 py-4', className)} {...props}>
      {children}
    </div>
  );
}

/* ─── Card Footer ────────────────────────────────────────────────────── */

export interface CardFooterProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
}

function CardFooter({ className, children, ...props }: CardFooterProps) {
  return (
    <div
      className={clsx(
        'border-t border-gray-200 px-6 py-4 dark:border-gray-700',
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export { Card, CardHeader, CardBody, CardFooter };
