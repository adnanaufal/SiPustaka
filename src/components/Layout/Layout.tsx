import React from 'react';
import { Header } from './Header';

interface LayoutProps {
  children: React.ReactNode;
}

export function Layout({ children }: LayoutProps) {
  return (
    <div className="min-h-screen warm-gradient">
      <Header />
      <main className="pt-20">{children}</main>
    </div>
  );
}
