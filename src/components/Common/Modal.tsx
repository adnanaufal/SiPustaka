import React, { useEffect } from 'react';
import { X } from 'lucide-react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl';
}

export function Modal({ isOpen, onClose, title, children, maxWidth = 'md' }: ModalProps) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      window.addEventListener('keydown', handleEsc);
    }
    return () => window.removeEventListener('keydown', handleEsc);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const maxWidthClasses = {
    sm: 'max-w-sm',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="fixed inset-0 bg-primary-900/50 dark:bg-black/70 backdrop-blur-sm"
        onClick={onClose}
      />
      <div
        className={`relative ${maxWidthClasses[maxWidth]} w-full bg-white dark:bg-primary-900 rounded-2xl shadow-large
          max-h-[90vh] overflow-y-auto animate-fade-in`}
      >
        {title && (
          <div className="flex items-center justify-between px-6 py-4 border-b border-primary-200 dark:border-primary-700">
            <h2 className="text-lg font-semibold text-primary-800 dark:text-primary-100 font-serif">
              {title}
            </h2>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg hover:bg-primary-100 dark:hover:bg-primary-800 transition-colors"
            >
              <X className="h-5 w-5 text-primary-500" />
            </button>
          </div>
        )}
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
}
