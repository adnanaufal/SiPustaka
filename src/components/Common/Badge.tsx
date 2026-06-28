import React from 'react';

type BadgeVariant = 'success' | 'warning' | 'error' | 'info' | 'neutral' | 'primary';

interface BadgeProps {
  children: React.ReactNode;
  variant?: BadgeVariant;
  size?: 'sm' | 'md';
}

export function Badge({ children, variant = 'neutral', size = 'sm' }: BadgeProps) {
  const variantClasses: Record<BadgeVariant, string> = {
    success: 'bg-accent-100 text-accent-700 dark:bg-accent-900/30 dark:text-accent-400',
    warning: 'bg-secondary-100 text-secondary-800 dark:bg-secondary-900/30 dark:text-secondary-400',
    error: 'bg-error-100 text-error-700 dark:bg-error-900/30 dark:text-error-400',
    info: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
    neutral: 'bg-primary-100 text-primary-600 dark:bg-primary-800 dark:text-primary-300',
    primary: 'bg-primary-100 text-primary-700 dark:bg-primary-800 dark:text-primary-300',
  };

  const sizeClasses = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-3 py-1 text-sm',
  };

  return (
    <span
      className={`inline-flex items-center font-medium rounded-full ${variantClasses[variant]} ${sizeClasses[size]}`}
    >
      {children}
    </span>
  );
}
