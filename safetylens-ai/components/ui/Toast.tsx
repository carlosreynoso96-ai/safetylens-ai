'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import clsx from 'clsx';
import { X, CheckCircle, AlertTriangle, Info, XCircle } from 'lucide-react';

/* ─── Types ──────────────────────────────────────────────────────────── */

export type ToastType = 'success' | 'error' | 'info' | 'warning';

export interface Toast {
  id: string;
  type: ToastType;
  message: string;
  /** Duration in ms before auto-dismiss. Defaults to 5000. Set to 0 to disable. */
  duration?: number;
}

interface ToastContextValue {
  toasts: Toast[];
  addToast: (toast: Omit<Toast, 'id'>) => string;
  removeToast: (id: string) => void;
}

/* ─── Context ────────────────────────────────────────────────────────── */

const ToastContext = createContext<ToastContextValue | null>(null);

/* ─── Hook ───────────────────────────────────────────────────────────── */

function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    throw new Error('useToast must be used within a <ToastProvider>');
  }

  const toast = useCallback(
    (message: string, type: ToastType = 'info', duration?: number) =>
      ctx.addToast({ message, type, duration }),
    [ctx],
  );

  return {
    toast,
    success: (message: string, duration?: number) => toast(message, 'success', duration),
    error: (message: string, duration?: number) => toast(message, 'error', duration),
    info: (message: string, duration?: number) => toast(message, 'info', duration),
    warning: (message: string, duration?: number) => toast(message, 'warning', duration),
    dismiss: ctx.removeToast,
  };
}

/* ─── Provider ───────────────────────────────────────────────────────── */

function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const counterRef = useRef(0);

  const addToast = useCallback((incoming: Omit<Toast, 'id'>): string => {
    counterRef.current += 1;
    const id = `toast-${counterRef.current}-${Date.now()}`;
    setToasts((prev) => [...prev, { ...incoming, id }]);
    return id;
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ toasts, addToast, removeToast }}>
      {children}
      <ToastContainer toasts={toasts} onDismiss={removeToast} />
    </ToastContext.Provider>
  );
}

/* ─── Container (bottom-right) ───────────────────────────────────────── */

function ToastContainer({
  toasts,
  onDismiss,
}: {
  toasts: Toast[];
  onDismiss: (id: string) => void;
}) {
  if (toasts.length === 0) return null;

  return (
    <div
      aria-live="polite"
      aria-label="Notifications"
      className="fixed bottom-4 right-4 z-[100] flex flex-col-reverse gap-2 w-full max-w-sm"
    >
      {toasts.map((t) => (
        <ToastItem key={t.id} toast={t} onDismiss={onDismiss} />
      ))}
    </div>
  );
}

/* ─── Individual Toast ───────────────────────────────────────────────── */

const iconMap: Record<ToastType, typeof CheckCircle> = {
  success: CheckCircle,
  error: XCircle,
  warning: AlertTriangle,
  info: Info,
};

const styleMap: Record<ToastType, string> = {
  success:
    'border-green-200 bg-green-50 text-green-800 dark:border-green-800 dark:bg-green-900/40 dark:text-green-300',
  error:
    'border-red-200 bg-red-50 text-red-800 dark:border-red-800 dark:bg-red-900/40 dark:text-red-300',
  warning:
    'border-yellow-200 bg-yellow-50 text-yellow-800 dark:border-yellow-800 dark:bg-yellow-900/40 dark:text-yellow-300',
  info:
    'border-blue-200 bg-blue-50 text-blue-800 dark:border-blue-800 dark:bg-blue-900/40 dark:text-blue-300',
};

const iconColorMap: Record<ToastType, string> = {
  success: 'text-green-500',
  error: 'text-red-500',
  warning: 'text-yellow-500',
  info: 'text-blue-500',
};

function ToastItem({
  toast,
  onDismiss,
}: {
  toast: Toast;
  onDismiss: (id: string) => void;
}) {
  const duration = toast.duration ?? 5000;

  useEffect(() => {
    if (duration <= 0) return;
    const timer = setTimeout(() => onDismiss(toast.id), duration);
    return () => clearTimeout(timer);
  }, [toast.id, duration, onDismiss]);

  const Icon = iconMap[toast.type];

  return (
    <div
      role="alert"
      className={clsx(
        'flex items-start gap-3 rounded-lg border p-4 shadow-lg',
        'animate-in slide-in-from-right-full duration-300',
        styleMap[toast.type],
      )}
    >
      <Icon size={20} className={clsx('mt-0.5 shrink-0', iconColorMap[toast.type])} />

      <p className="flex-1 text-sm font-medium">{toast.message}</p>

      <button
        type="button"
        onClick={() => onDismiss(toast.id)}
        aria-label="Dismiss notification"
        className="shrink-0 rounded p-0.5 opacity-60 transition-opacity hover:opacity-100"
      >
        <X size={16} />
      </button>
    </div>
  );
}

export { ToastProvider, useToast };
