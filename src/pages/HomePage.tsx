import React, { useEffect, useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  BookOpen, ShoppingCart, Users, ArrowRight,
  MapPin, Phone, Clock, Shield
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

// ScrollReveal component using IntersectionObserver
function ScrollReveal({ children }: { children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.unobserve(entry.target);
        }
      },
      { threshold: 0.1, rootMargin: '0px 0px -50px 0px' }
    );

    const currentRef = ref.current;
    if (currentRef) {
      observer.observe(currentRef);
    }

    return () => {
      if (currentRef) {
        observer.unobserve(currentRef);
      }
    };
  }, []);

  return (
    <div
      ref={ref}
      className={`transition-all duration-1000 ease-out transform ${
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'
      }`}
    >
      {children}
    </div>
  );
}

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

  const welcomeText = user && profile
    ? t('home.welcomeUser', { name: profile.full_name.split(' ')[0] })
    : t('home.welcome');

  const headingRef = useRef<HTMLHeadingElement>(null);
  const [mousePos, setMousePos] = useState({ x: -1000, y: -1000 });
  const [isMouseOver, setIsMouseOver] = useState(false);

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!headingRef.current) return;
    const rect = headingRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    setMousePos({ x, y });
  };

  return (
    <Layout>
      {/* Fullscreen Video Hero Section */}
      <section className="relative w-full h-[calc(100vh-5rem)] md:h-[calc(100vh-5rem)] lg:h-[calc(100vh-5rem)] xl:h-screen min-h-[600px] flex items-center justify-center overflow-hidden bg-primary-950">
        <video
          autoPlay
          loop
          muted
          playsInline
          className="absolute inset-0 w-full h-full object-cover z-0"
        >
          <source src="/hero-background.mp4" type="video/mp4" />
        </video>
        {/* Adjusted Video Opacity via overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-primary-950/60 via-primary-950/45 to-primary-950/75 dark:from-black/75 dark:via-black/60 dark:to-black/80 z-10" />

        {/* Hero Content */}
        <div className="relative z-20 max-w-7xl mx-auto px-4 sm:px-6 py-24 md:py-32 w-full text-center md:text-left">
          <div className="max-w-2xl">
            <div className="flex items-center justify-center md:justify-start gap-3 mb-6">
              <img src="/logo-white.png" alt="SiPustaka" className="h-10 object-contain drop-shadow-lg" />
            </div>
            <h1
              ref={headingRef}
              onMouseMove={handleMouseMove}
              onMouseEnter={() => setIsMouseOver(true)}
              onMouseLeave={() => setIsMouseOver(false)}
              className="text-5xl md:text-6xl lg:text-7xl font-serif font-bold leading-tight mb-6 drop-shadow-md tracking-wide relative inline-block select-none w-full animate-in"
              style={{
                '--mouse-x': `${mousePos.x}px`,
                '--mouse-y': `${mousePos.y}px`,
                '--mouse-opacity': isMouseOver ? 1 : 0
              } as React.CSSProperties}
            >
              {/* Solid Text (base layer) */}
              <span className={`radial-solid-text ${isMouseOver ? 'radial-solid-text-active' : ''}`}>
                {welcomeText}
              </span>
              {/* Hollow Text (reveal layer) */}
              <span className="radial-hollow-text">
                {welcomeText}
              </span>
            </h1>
            <p className="text-lg text-white/90 leading-relaxed mb-8 max-w-xl drop-shadow">
              {t('home.subtitle')}
            </p>
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-4">
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
      </section>

      {/* Subsequent Sections Wrapper with dark chocolate/black gradient */}
      <div className="bg-gradient-to-b from-[#1a1210] via-[#0f0a09] to-black text-white py-12 space-y-16">
        
        {/* New Arrivals Section with ScrollReveal */}
        <ScrollReveal>
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <div className="bg-white/5 dark:bg-white/3 backdrop-blur-xl border border-white/10 dark:border-white/5 rounded-3xl p-8 sm:p-12 shadow-glow">
              <div className="text-center mb-12">
                <h2 className="text-3xl md:text-4xl font-serif font-bold text-secondary-400">
                  {t('home.newArrivals')}
                </h2>
                <p className="text-white/70 mt-2">{t('home.newArrivalsSubtitle')}</p>
              </div>

              {booksLoading ? (
                <LoadingSpinner text={t('home.loadingNewArrivals')} />
              ) : newArrivals.length === 0 ? (
                <p className="text-center text-white/50">{t('home.noBooksAvailable')}</p>
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
            </div>
          </div>
        </ScrollReveal>

        {/* Features Section with ScrollReveal */}
        <ScrollReveal>
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <div className="bg-white/5 dark:bg-white/3 backdrop-blur-xl border border-white/10 dark:border-white/5 rounded-3xl p-8 sm:p-12 shadow-glow">
              <div className="text-center mb-12">
                <h2 className="text-3xl md:text-4xl font-serif font-bold text-secondary-400">
                  {t('home.powerfulFeatures')}
                </h2>
                <p className="text-white/70 mt-2">{t('home.featuresSubtitle')}</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[
                  { icon: BookOpen, title: t('home.bookManagement'), desc: t('home.bookManagementDesc'), bg: 'bg-white/10' },
                  { icon: ShoppingCart, title: t('home.shoppingCart'), desc: t('home.shoppingCartDesc'), bg: 'bg-white/10' },
                  { icon: Users, title: t('home.userManagement'), desc: t('home.userManagementDesc'), bg: 'bg-white/10' },
                ].map((feature) => (
                  <div key={feature.title} className="bg-white/5 backdrop-blur-lg border border-white/10 hover:border-white/20 rounded-2xl p-6 hover:bg-white/10 hover:shadow-glow transition-all group">
                    <div className={`w-12 h-12 rounded-xl ${feature.bg} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                      <feature.icon className="h-6 w-6 text-secondary-400" />
                    </div>
                    <h3 className="font-semibold text-lg text-white mb-2">{feature.title}</h3>
                    <p className="text-sm text-white/70">{feature.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </ScrollReveal>

        {/* Store Locations Section with ScrollReveal */}
        {storeLocations.length > 0 && (
          <ScrollReveal>
            <div className="max-w-7xl mx-auto px-4 sm:px-6">
              <div className="bg-white/5 dark:bg-white/3 backdrop-blur-xl border border-white/10 dark:border-white/5 rounded-3xl p-8 sm:p-12 shadow-glow">
                <div className="text-center mb-12">
                  <h2 className="text-3xl md:text-4xl font-serif font-bold text-secondary-400">
                    {t('home.ourStores')}
                  </h2>
                  <p className="text-white/70 mt-2">{t('home.ourStoresSubtitle')}</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {storeLocations.map((store) => (
                    <div key={store.id} className="bg-white/5 backdrop-blur-lg border border-white/10 hover:border-white/20 rounded-2xl p-6 hover:bg-white/10 hover:shadow-glow transition-all">
                      <h3 className="font-serif font-bold text-white text-lg mb-3">{store.name}</h3>
                      <div className="space-y-2 text-sm text-white/70">
                        <div className="flex items-start gap-2">
                          <MapPin className="h-4 w-4 mt-0.5 flex-shrink-0 text-secondary-400" />
                          <span>{store.address}, {store.city}</span>
                        </div>
                        {store.phone && (
                          <div className="flex items-center gap-2">
                            <Phone className="h-4 w-4 flex-shrink-0 text-secondary-400" />
                            <span>{store.phone}</span>
                          </div>
                        )}
                        {store.operating_hours && (
                          <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4 flex-shrink-0 text-secondary-400" />
                            <span>{store.operating_hours}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </ScrollReveal>
        )}

      </div>

      {/* Footer */}
      <footer className="bg-black text-white py-12 border-t border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary-800 rounded-xl">
                <BookOpen className="h-6 w-6 text-secondary-400" />
              </div>
              <div>
                <span className="font-serif font-bold text-xl text-white">SiPustaka</span>
                <p className="text-sm text-white/50">Toko Buku Online Terpercaya</p>
              </div>
            </div>
            <p className="text-white/40 text-sm">
              &copy; {new Date().getFullYear()} SiPustaka. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </Layout>
  );
}
