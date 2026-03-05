'use client';

import {
  useEffect,
  useCallback,
  useRef,
  type ReactNode,
  type MouseEvent,
} from 'react';
import { createPortal } from 'react-dom';
import clsx from 'clsx';
import { X } from 'lucide-react';

export interface ModalProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
  /** Max-width utility class, e.g. "max-w-lg" */
  maxWidth?: string;
  className?: string;
  /** If true the user cannot dismiss by clicking the backdrop */
  persistent?: boolean;
}

function Modal({
  open,
  onClose,
  title,
  children,
  maxWidth = 'max-w-lg',
  className,
  persistent = false,
}: ModalProps) {
  const overlayRef = useRef<HTMLDivElement>(null);

  // Close on Escape
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !persistent) {
        onClose();
      }
    },
    [onClose, persistent],
  );

  useEffect(() => {
    if (!open) return;
    document.addEventListener('keydown', handleKeyDown);
    // Prevent body scroll while modal is open
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = prev;
    };
  }, [open, handleKeyDown]);

  // Close when clicking the backdrop
  const handleBackdropClick = (e: MouseEvent<HTMLDivElement>) => {
    if (e.target === overlayRef.current && !persistent) {
      onClose();
    }
  };

  if (!open) return null;

  return createPortal(
    <div
      ref={overlayRef}
      role="dialog"
      aria-modal="true"
      aria-label={title}
      onClick={handleBackdropClick}
      className={clsx(
        'fixed inset-0 z-50 flex items-center justify-center p-4',
        'bg-black/50 backdrop-blur-sm',
        'animate-in fade-in duration-200',
      )}
    >
      <div
        className={clsx(
          'relative w-full rounded-xl bg-white shadow-xl',
          'dark:bg-gray-900 dark:border dark:border-gray-700',
          'animate-in zoom-in-95 duration-200',
          maxWidth,
          className,
        )}
      >
        {/* Header */}
        {title && (
          <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4 dark:border-gray-700">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              {title}
            </h2>
            <button
              type="button"
              onClick={onClose}
              aria-label="Close modal"
              className="rounded-lg p-1.5 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-800 dark:hover:text-gray-300"
            >
              <X size={20} />
            </button>
          </div>
        )}

        {/* Close button when there is no title */}
        {!title && (
          <button
            type="button"
            onClick={onClose}
            aria-label="Close modal"
            className="absolute right-3 top-3 rounded-lg p-1.5 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-800 dark:hover:text-gray-300"
          >
            <X size={20} />
          </button>
        )}

        {/* Body */}
        <div className="px-6 py-4">{children}</div>
      </div>
    </div>,
    document.body,
  );
}

export { Modal };
