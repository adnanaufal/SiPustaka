import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, Users, ShoppingCart, Shield } from 'lucide-react';
import { Layout } from '../components/Layout/Layout';
import { BookCard } from '../components/Books/BookCard';
import { BookDetailModal } from '../components/Books/BookDetailModal';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import type { Database } from '../lib/supabase';

type Book = Database['public']['Tables']['books']['Row'];

export function HomePage() {
  const { profile } = useAuth();
  const [newArrivals, setNewArrivals] = useState<Book[]>([]);
  const [selectedBookForDetail, setSelectedBookForDetail] = useState<Book | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchNewArrivals();
  }, []);

  const fetchNewArrivals = async () => {
    try {
      const { data, error } = await supabase
        .from('books')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(6);

      if (error) throw error;
      setNewArrivals(data || []);
    } catch (error) {
      console.error('Error fetching new arrivals:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetail = (book: Book) => {
    setSelectedBookForDetail(book);
  };

  const closeDetailModal = () => {
    setSelectedBookForDetail(null);
  };

  return (
    <Layout>
      <div className="relative">
        {/* Hero Section */}
        <section className="relative bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 text-white py-20">
          <div className="absolute inset-0 bg-black/20"></div>
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <h1 className="text-4xl md:text-6xl font-bold mb-6">
                {profile ? `Welcome ${profile.full_name} to SiPustaka` : 'Welcome to SiPustaka'}
              </h1>
              <p className="text-xl md:text-2xl text-blue-100 mb-8 max-w-3xl mx-auto">
                Your comprehensive bookstore management system with role-based access,
                inventory tracking, and seamless shopping experience.
              </p>
              <div className="flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-6">
                <Link
                  to="/auth/signup"
                  className="inline-flex items-center px-8 py-3 bg-white text-blue-600 font-semibold rounded-lg hover:bg-blue-50 transition-colors duration-200"
                >
                  Get Started
                </Link>
                <Link
                  to="/auth/login"
                  className="inline-flex items-center px-8 py-3 border-2 border-white text-white font-semibold rounded-lg hover:bg-white hover:text-blue-600 transition-colors duration-200"
                >
                  Sign In
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* New Arrivals Section */}
        <section className="py-20 bg-white dark:bg-gray-900">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
                New Arrivals
              </h2>
              <p className="text-xl text-gray-600 dark:text-gray-400">
                Discover the latest books added to our collection
              </p>
            </div>

            {loading ? (
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                <p className="text-gray-600 dark:text-gray-400 mt-4">Loading new arrivals...</p>
              </div>
            ) : newArrivals.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                {newArrivals.map((book) => (
                  <BookCard
                    key={book.id}
                    book={book}
                    onViewDetail={handleViewDetail}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <BookOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                  No books available yet
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Check back later for new arrivals
                </p>
              </div>
            )}
          </div>
        </section>

        {/* Role-Based Access Section */}
        <section className="py-20 bg-gray-50 dark:bg-gray-800">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
                Access Your Dashboard
              </h2>
              <p className="text-xl text-gray-600 dark:text-gray-400">
                Choose your role to access the appropriate features
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              {/* Admin */}
              <div className="bg-white dark:bg-gray-700 rounded-xl shadow-lg p-8 text-center hover:shadow-xl transition-shadow duration-300">
                <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Shield className="w-8 h-8 text-red-600 dark:text-red-400" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                  Admin
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                  Full system access - manage books, users, transactions, and view comprehensive reports.
                </p>
                <Link
                  to="/auth/login?role=admin"
                  className="inline-flex items-center px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors duration-200"
                >
                  Admin Login
                </Link>
              </div>

              {/* Cashier */}
              <div className="bg-white dark:bg-gray-700 rounded-xl shadow-lg p-8 text-center hover:shadow-xl transition-shadow duration-300">
                <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Users className="w-8 h-8 text-green-600 dark:text-green-400" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                  Cashier
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                  Process transactions, manage stock, and assist customers with their purchases.
                </p>
                <Link
                  to="/auth/login?role=cashier"
                  className="inline-flex items-center px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors duration-200"
                >
                  Cashier Login
                </Link>
              </div>

              {/* Customer */}
              <div className="bg-white dark:bg-gray-700 rounded-xl shadow-lg p-8 text-center hover:shadow-xl transition-shadow duration-300">
                <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
                  <ShoppingCart className="w-8 h-8 text-blue-600 dark:text-blue-400" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                  Customer
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                  Browse books, add to cart, make purchases, and track your order history.
                </p>
                <Link
                  to="/auth/login"
                  className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
                >
                  Customer Login
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-20 bg-white dark:bg-gray-900">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
                Powerful Features
              </h2>
              <p className="text-xl text-gray-600 dark:text-gray-400">
                Everything you need for a complete bookstore management system
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <BookOpen className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  Book Management
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Complete CRUD operations for books with cover images and detailed information.
                </p>
              </div>

              <div className="text-center">
                <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <ShoppingCart className="w-6 h-6 text-green-600 dark:text-green-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  Shopping Cart
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Real-time cart management with automatic stock updates and reservation.
                </p>
              </div>

              <div className="text-center">
                <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <Users className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  User Management
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Role-based access control with secure authentication and user profiles.
                </p>
              </div>
            </div>
          </div>
        </section>
      </div>

      {/* Book Detail Modal */}
      {selectedBookForDetail && (
        <BookDetailModal
          book={selectedBookForDetail}
          onClose={closeDetailModal}
        />
      )}
    </Layout>
  );
}