import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { LanguageProvider } from './contexts/LanguageContext';
import { ProtectedRoute } from './components/ProtectedRoute';

// Pages
import { HomePage } from './pages/HomePage';
import { LoginPage } from './pages/auth/LoginPage';
import { SignUpPage } from './pages/auth/SignUpPage';
import { CustomerDashboard } from './pages/customer/CustomerDashboard';
import { CartPage } from './pages/customer/CartPage';
import { WishlistPage } from './pages/customer/WishlistPage';
import { CheckoutPage } from './pages/customer/CheckoutPage';
import { OrderHistoryPage } from './pages/customer/OrderHistoryPage';
import { OrderDetailPage } from './pages/customer/OrderDetailPage';
import { AdminDashboard } from './pages/admin/AdminDashboard';
import { UserManagementPage } from './pages/admin/UserManagementPage';
import { StoreManagementPage } from './pages/admin/StoreManagementPage';
import { OrderManagementPage } from './pages/admin/OrderManagementPage';
import { CashierDashboard } from './pages/cashier/CashierDashboard';

function App() {
  return (
    <ThemeProvider>
      <LanguageProvider>
        <Router>
          <AuthProvider>
            <Toaster
              position="top-right"
              toastOptions={{
                duration: 3000,
                style: {
                  background: 'var(--toast-bg)',
                  color: 'var(--toast-color)',
                  borderRadius: '12px',
                  border: '1px solid var(--surface-border)',
                  boxShadow: '0 4px 20px rgba(93, 64, 55, 0.1)',
                },
                success: {
                  iconTheme: { primary: '#22c55e', secondary: 'white' },
                },
                error: {
                  iconTheme: { primary: '#ef4444', secondary: 'white' },
                },
              }}
            />

            <Routes>
              {/* Public */}
              <Route path="/" element={<HomePage />} />
              <Route path="/auth/login" element={<LoginPage />} />
              <Route path="/auth/signup" element={<SignUpPage />} />

              {/* Customer */}
              <Route path="/customer" element={
                <ProtectedRoute allowedRoles={['customer']}>
                  <CustomerDashboard />
                </ProtectedRoute>
              } />
              <Route path="/customer/cart" element={
                <ProtectedRoute allowedRoles={['customer']}>
                  <CartPage />
                </ProtectedRoute>
              } />
              <Route path="/customer/wishlist" element={
                <ProtectedRoute allowedRoles={['customer']}>
                  <WishlistPage />
                </ProtectedRoute>
              } />
              <Route path="/customer/checkout" element={
                <ProtectedRoute allowedRoles={['customer']}>
                  <CheckoutPage />
                </ProtectedRoute>
              } />
              <Route path="/customer/orders" element={
                <ProtectedRoute allowedRoles={['customer']}>
                  <OrderHistoryPage />
                </ProtectedRoute>
              } />
              <Route path="/customer/orders/:id" element={
                <ProtectedRoute allowedRoles={['customer']}>
                  <OrderDetailPage />
                </ProtectedRoute>
              } />

              {/* Admin */}
              <Route path="/admin" element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <AdminDashboard />
                </ProtectedRoute>
              } />
              <Route path="/admin/users" element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <UserManagementPage />
                </ProtectedRoute>
              } />
              <Route path="/admin/stores" element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <StoreManagementPage />
                </ProtectedRoute>
              } />
              <Route path="/admin/orders" element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <OrderManagementPage />
                </ProtectedRoute>
              } />

              {/* Cashier */}
              <Route path="/cashier" element={
                <ProtectedRoute allowedRoles={['cashier']}>
                  <CashierDashboard />
                </ProtectedRoute>
              } />

              {/* Fallback */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </AuthProvider>
        </Router>
      </LanguageProvider>
    </ThemeProvider>
  );
}

export default App;
