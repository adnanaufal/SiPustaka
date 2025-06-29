import React from 'react';
import { AuthLayout } from '../../components/Auth/AuthLayout';
import { LoginForm } from '../../components/Auth/LoginForm';

export function LoginPage() {
  return (
    <AuthLayout
      title="Welcome Back"
      subtitle="Sign in to your account to continue"
    >
      <LoginForm />
    </AuthLayout>
  );
}