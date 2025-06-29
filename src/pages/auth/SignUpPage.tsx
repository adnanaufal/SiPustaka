import React from 'react';
import { AuthLayout } from '../../components/Auth/AuthLayout';
import { SignUpForm } from '../../components/Auth/SignUpForm';

export function SignUpPage() {
  return (
    <AuthLayout
      title="Create Account"
      subtitle="Join our bookstore community today"
    >
      <SignUpForm />
    </AuthLayout>
  );
}