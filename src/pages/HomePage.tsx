import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  BookOpen, ShoppingCart, Users, ArrowRight,
  MapPin, Phone, Clock, Shield, Star
} from 'lucide-react';
import { Layout } from '../components/Layout/Layout';
import { BookCard } from '../components/Books/BookCard';
import { LoadingSpinner } from '../components/Common/LoadingSpinner';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { useBooks } from '../hooks/useBooks';
import { useCart } from '../hooks/useCart';
import { useWishlist } from '../hooks/useWishlist';
import { useStoreLocations } from '../hooks/useStoreLocations';
import type { Book } from '../lib/supabase';


export function HomePage() {
  const { user, profile } = useAuth();
  const { t } = useLanguage();
  const { books, loading: booksLoading } = useBooks();
  const { addToCart } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();
  const { storeLocations } = useStoreLocations();
  const navigate = useNavigate();

  const handleBuyNow = async (bookId: string) => {
    if (!user) {
      navigate('/auth/login');
      return;
    }
    await addToCart(bookId);
    navigate('/customer/checkout');
  };

  const newArrivals = books.slice(0, 4);

  return (
    <Layout>
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="warm-gradient-hero">
          <div className="absolute inset-0 opacity-5">
            {[...Array(6)].map((_, i) => (
              <div
                key={i}
                className="absolute border-2 border-white/30 rounded-lg"
                style={{
                  top: `${15 + (i * 15)}%`,
                  left: `${5 + (i * 18)}%`,
                  width: `${60 + (i * 8)}px`,
                  height: `${80 + (i * 10)}px`,
                  transform: `rotate(${-15 + (i * 6)}deg)`,
                }}
              />
            ))}
          </div>
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 py-24 md:py-32">
            <div className="max-w-2xl">
              <div className="flex items-center gap-2 mb-4">
                <div className="p-2 bg-white/20 backdrop-blur-sm rounded-xl">
                  <BookOpen className="h-6 w-6 text-white" />
                </div>
                <span className="text-white/80 font-medium">SiPustaka</span>
              </div>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-serif font-bold text-white leading-tight mb-6">
                {user && profile
                  ? t('home.welcomeUser', { name: profile.full_name.split(' ')[0] })
                  : t('home.welcome')}
              </h1>
              <p className="text-lg text-white/80 leading-relaxed mb-8 max-w-xl">
                {t('home.subtitle')}
              </p>
              <div className="flex flex-wrap gap-4">
                {user ? (
                  <Link
                    to={profile?.role === 'admin' ? '/admin' : profile?.role === 'cashier' ? '/cashier' : '/customer'}
                    className="inline-flex items-center gap-2 bg-white text-primary-800 px-6 py-3 rounded-xl font-semibold hover:bg-white/90 transition-colors shadow-large"
                  >
                    {t('home.getStarted')} <ArrowRight className="h-5 w-5" />
                  </Link>
                ) : (
                  <>
                    <Link
                      to="/auth/signup"
                      className="inline-flex items-center gap-2 bg-white text-primary-800 px-6 py-3 rounded-xl font-semibold hover:bg-white/90 transition-colors shadow-large"
                    >
                      {t('home.getStarted')} <ArrowRight className="h-5 w-5" />
                    </Link>
                    <Link
                      to="/auth/login"
                      className="inline-flex items-center gap-2 border-2 border-white/50 text-white px-6 py-3 rounded-xl font-semibold hover:bg-white/10 transition-colors"
                    >
                      {t('home.signIn')}
                    </Link>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* New Arrivals */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-16">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-serif font-bold text-primary-800 dark:text-primary-100">
            {t('home.newArrivals')}
          </h2>
          <p className="text-primary-500 dark:text-primary-400 mt-2">{t('home.newArrivalsSubtitle')}</p>
        </div>

        {booksLoading ? (
          <LoadingSpinner text={t('home.loadingNewArrivals')} />
        ) : newArrivals.length === 0 ? (
          <p className="text-center text-primary-500">{t('home.noBooksAvailable')}</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {newArrivals.map((book) => (
              <BookCard
                key={book.id}
                book={book}
                onAddToCart={user ? () => addToCart(book.id) : undefined}
                onBuyNow={user ? () => handleBuyNow(book.id) : undefined}
                onToggleWishlist={user ? () => toggleWishlist(book.id) : undefined}
                isInWishlist={isInWishlist(book.id)}
              />
            ))}
          </div>
        )}
      </section>

      {/* Features */}
      <section className="bg-surface-100 dark:bg-primary-900/30 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-serif font-bold text-primary-800 dark:text-primary-100">
              {t('home.powerfulFeatures')}
            </h2>
            <p className="text-primary-500 dark:text-primary-400 mt-2">{t('home.featuresSubtitle')}</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { icon: BookOpen, title: t('home.bookManagement'), desc: t('home.bookManagementDesc'), color: 'text-primary-600', bg: 'bg-primary-100 dark:bg-primary-800' },
              { icon: ShoppingCart, title: t('home.shoppingCart'), desc: t('home.shoppingCartDesc'), color: 'text-secondary-600', bg: 'bg-secondary-100 dark:bg-secondary-900/30' },
              { icon: Shield, title: t('home.userManagement'), desc: t('home.userManagementDesc'), color: 'text-accent-600', bg: 'bg-accent-100 dark:bg-accent-900/30' },
            ].map((feature) => (
              <div key={feature.title} className="glass-card p-6 hover:shadow-medium transition-all group">
                <div className={`w-12 h-12 rounded-xl ${feature.bg} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                  <feature.icon className={`h-6 w-6 ${feature.color}`} />
                </div>
                <h3 className="font-semibold text-lg text-primary-800 dark:text-primary-100 mb-2">{feature.title}</h3>
                <p className="text-sm text-primary-500 dark:text-primary-400">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Store Locations */}
      {storeLocations.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 py-16">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-serif font-bold text-primary-800 dark:text-primary-100">
              {t('home.ourStores')}
            </h2>
            <p className="text-primary-500 dark:text-primary-400 mt-2">{t('home.ourStoresSubtitle')}</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {storeLocations.map((store) => (
              <div key={store.id} className="glass-card p-5 hover:shadow-medium transition-all">
                <h3 className="font-serif font-bold text-primary-800 dark:text-primary-100 mb-3">{store.name}</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex items-start gap-2 text-primary-600 dark:text-primary-400">
                    <MapPin className="h-4 w-4 mt-0.5 flex-shrink-0" />
                    <span>{store.address}, {store.city}</span>
                  </div>
                  {store.phone && (
                    <div className="flex items-center gap-2 text-primary-600 dark:text-primary-400">
                      <Phone className="h-4 w-4 flex-shrink-0" />
                      <span>{store.phone}</span>
                    </div>
                  )}
                  {store.operating_hours && (
                    <div className="flex items-center gap-2 text-primary-600 dark:text-primary-400">
                      <Clock className="h-4 w-4 flex-shrink-0" />
                      <span>{store.operating_hours}</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Footer */}
      <footer className="bg-primary-900 dark:bg-primary-950 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary-700 rounded-xl">
                <BookOpen className="h-6 w-6" />
              </div>
              <div>
                <span className="font-serif font-bold text-xl">SiPustaka</span>
                <p className="text-sm text-primary-400">Toko Buku Online Terpercaya</p>
              </div>
            </div>
            <p className="text-primary-400 text-sm">
              &copy; {new Date().getFullYear()} SiPustaka. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </Layout>
  );
}
