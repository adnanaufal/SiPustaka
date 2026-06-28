import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { AuthLayout } from '../../components/Auth/AuthLayout';
import { LoginForm } from '../../components/Auth/LoginForm';

export function LoginPage() {
  const { user, profile } = useAuth();

  if (user && profile) {
    const dashboardMap: Record<string, string> = { admin: '/admin', cashier: '/cashier', customer: '/customer' };
    return <Navigate to={dashboardMap[profile.role] || '/'} replace />;
  }

  return (
    <AuthLayout>
      <LoginForm />
    </AuthLayout>
  );
}
