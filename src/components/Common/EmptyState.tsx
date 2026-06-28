import React from 'react';
import { PackageOpen } from 'lucide-react';

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: React.ReactNode;
}

export function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center animate-fade-in">
      <div className="mb-4 text-primary-300 dark:text-primary-600">
        {icon || <PackageOpen className="h-16 w-16" />}
      </div>
      <h3 className="text-lg font-semibold text-primary-700 dark:text-primary-300 mb-2">{title}</h3>
      {description && (
        <p className="text-primary-500 dark:text-primary-400 mb-6 max-w-md">{description}</p>
      )}
      {action && <div>{action}</div>}
    </div>
  );
}
