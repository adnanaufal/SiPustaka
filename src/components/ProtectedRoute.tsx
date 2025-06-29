import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: string[];
  redirectTo?: string;
}

export function ProtectedRoute({ 
  children, 
  allowedRoles = [], 
  redirectTo = '/auth/login' 
}: ProtectedRouteProps) {
  const { user, profile, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="text-gray-600 dark:text-gray-400 mt-4">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user || !profile) {
    return <Navigate to={redirectTo} replace />;
  }

  if (allowedRoles.length > 0 && !allowedRoles.includes(profile.role)) {
    // Redirect to appropriate dashboar based on role
    const dashboardMap = {
      admin: '/admin',
      cashier: '/cashier',
      customer: '/customer',
    };
    
    return <Navigate to={dashboardMap[profile.role] || '/'} replace />;
  }

  return <>{children}</>;
}