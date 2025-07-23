import * as React from 'react';
import { cn } from '@/lib/utils';

interface DialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title?: React.ReactNode;
  description?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}

export function Dialog({
  open,
  onOpenChange,
  title,
  description,
  children,
  className = '',
}: DialogProps) {
  React.useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') onOpenChange(false);
    }
    if (open) {
      document.addEventListener('keydown', onKeyDown);
    } else {
      document.removeEventListener('keydown', onKeyDown);
    }
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [open, onOpenChange]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
      <div
        className={cn(
          'bg-white dark:bg-[#222] rounded-xl shadow-lg max-w-lg w-full p-6 relative',
          className
        )}
        role="dialog"
        aria-modal="true"
      >
        <button
          onClick={() => onOpenChange(false)}
          className="absolute top-3 right-3 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 focus:outline-none"
          aria-label="Close dialog"
        >
          <svg width="20" height="20" fill="none" viewBox="0 0 24 24">
            <path stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
        {title && <h2 className="text-lg font-semibold mb-1">{title}</h2>}
        {description && <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">{description}</p>}
        <div>{children}</div>
      </div>
    </div>
  );
} 