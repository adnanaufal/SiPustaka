import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { LoadingSpinner } from './Common/LoadingSpinner';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: string[];
  redirectTo?: string;
}

export function ProtectedRoute({
  children,
  allowedRoles = [],
  redirectTo = '/auth/login',
}: ProtectedRouteProps) {
  const { user, profile, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center warm-gradient">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!user || !profile) {
    return <Navigate to={redirectTo} replace />;
  }

  if (allowedRoles.length > 0 && !allowedRoles.includes(profile.role)) {
    const dashboardMap: Record<string, string> = {
      admin: '/admin',
      cashier: '/cashier',
      customer: '/customer',
    };

    return <Navigate to={dashboardMap[profile.role] || '/'} replace />;
  }

  return <>{children}</>;
}
