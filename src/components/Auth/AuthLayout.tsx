import React from 'react';
import { BookOpen } from 'lucide-react';

interface AuthLayoutProps {
  children: React.ReactNode;
  title: string;
  subtitle: string;
}

export function AuthLayout({ children, title, subtitle }: AuthLayoutProps) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-indigo-900 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 p-8">
          <div className="text-center">
            <div className="flex justify-center">
              <div className="p-3 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl">
                <BookOpen className="w-8 h-8 text-white" />
              </div>
            </div>
            <h2 className="mt-6 text-3xl font-bold text-gray-900 dark:text-white">
              {title}
            </h2>
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
              {subtitle}
            </p>
          </div>
          
          <div className="mt-8">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}