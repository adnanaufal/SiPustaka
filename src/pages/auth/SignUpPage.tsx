import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { AuthLayout } from '../../components/Auth/AuthLayout';
import { SignUpForm } from '../../components/Auth/SignUpForm';

export function SignUpPage() {
  const { user, profile } = useAuth();

  if (user && profile) {
    const dashboardMap: Record<string, string> = { admin: '/admin', cashier: '/cashier', customer: '/customer' };
    return <Navigate to={dashboardMap[profile.role] || '/'} replace />;
  }

  return (
    <AuthLayout>
      <SignUpForm />
    </AuthLayout>
  );
}
