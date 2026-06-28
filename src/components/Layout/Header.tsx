import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  BookOpen, ShoppingCart, Heart, LogOut, LogIn, UserPlus,
  Sun, Moon, Menu, X, User, Settings, Globe, Package,
  LayoutDashboard, Users, Store, ClipboardList,
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { useCart } from '../../hooks/useCart';
import toast from 'react-hot-toast';

export function Header() {
  const { user, profile, signOut } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const { language, setLanguage, t } = useLanguage();
  const { cartCount } = useCart();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);

  const handleSignOut = async () => {
    try {
      await signOut();
      toast.success(t('auth.signOutSuccess'));
      navigate('/');
    } catch {
      toast.error(t('common.error'));
    }
    setMobileMenuOpen(false);
  };

  const isActive = (path: string) => location.pathname === path;
  const linkClass = (path: string) =>
    `flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
      isActive(path)
        ? 'bg-primary-100 dark:bg-primary-800 text-primary-700 dark:text-primary-200'
        : 'text-primary-600 dark:text-primary-400 hover:bg-primary-50 dark:hover:bg-primary-800/50'
    }`;

  return (
    <header className="fixed top-0 left-0 right-0 z-40 bg-white/40 dark:bg-black/30 backdrop-blur-2xl border-b border-white/10 dark:border-white/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group">
            <img src="/logo.png" alt="SiPustaka" className="h-10 object-contain dark:hidden" />
            <img src="/logo-white.png" alt="SiPustaka" className="h-10 object-contain hidden dark:block" />
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-1">
            {profile?.role === 'customer' && (
              <>
                <Link to="/customer" className={linkClass('/customer')}>
                  <LayoutDashboard className="h-4 w-4" /> {t('header.dashboard')}
                </Link>
                <Link to="/customer/cart" className={linkClass('/customer/cart')}>
                  <div className="relative">
                    <ShoppingCart className="h-4 w-4" />
                    {cartCount > 0 && (
                      <span className="absolute -top-2 -right-2 bg-secondary-500 text-primary-900 text-[10px] font-bold rounded-full h-4 w-4 flex items-center justify-center">
                        {cartCount}
                      </span>
                    )}
                  </div>
                  {t('header.cart')}
                </Link>
                <Link to="/customer/wishlist" className={linkClass('/customer/wishlist')}>
                  <Heart className="h-4 w-4" /> {t('header.wishlist')}
                </Link>
                <Link to="/customer/orders" className={linkClass('/customer/orders')}>
                  <Package className="h-4 w-4" /> {t('header.orders')}
                </Link>
              </>
            )}

            {profile?.role === 'admin' && (
              <>
                <Link to="/admin" className={linkClass('/admin')}>
                  <LayoutDashboard className="h-4 w-4" /> {t('header.dashboard')}
                </Link>
                <Link to="/admin/users" className={linkClass('/admin/users')}>
                  <Users className="h-4 w-4" /> {t('header.users')}
                </Link>
                <Link to="/admin/stores" className={linkClass('/admin/stores')}>
                  <Store className="h-4 w-4" /> {t('header.stores')}
                </Link>
                <Link to="/admin/orders" className={linkClass('/admin/orders')}>
                  <ClipboardList className="h-4 w-4" /> {t('header.orderManagement')}
                </Link>
              </>
            )}

            {profile?.role === 'cashier' && (
              <Link to="/cashier" className={linkClass('/cashier')}>
                <LayoutDashboard className="h-4 w-4" /> {t('header.dashboard')}
              </Link>
            )}
          </nav>

          {/* Right section */}
          <div className="flex items-center gap-2">
            {/* Settings dropdown */}
            <div className="relative">
              <button
                onClick={() => setSettingsOpen(!settingsOpen)}
                className="p-2 rounded-xl hover:bg-primary-100 dark:hover:bg-primary-800 transition-colors"
                aria-label={t('header.settings')}
              >
                <Settings className="h-5 w-5 text-primary-600 dark:text-primary-400" />
              </button>

              {settingsOpen && (
                <>
                  <div className="fixed inset-0" onClick={() => setSettingsOpen(false)} />
                  <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-primary-900 rounded-xl shadow-large border border-primary-200 dark:border-primary-700 py-2 z-50">
                    <button
                      onClick={() => { toggleTheme(); setSettingsOpen(false); }}
                      className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-primary-700 dark:text-primary-300 hover:bg-primary-50 dark:hover:bg-primary-800"
                    >
                      {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
                      {isDark ? 'Light Mode' : 'Dark Mode'}
                    </button>
                    <button
                      onClick={() => { setLanguage(language === 'id' ? 'en' : 'id'); setSettingsOpen(false); }}
                      className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-primary-700 dark:text-primary-300 hover:bg-primary-50 dark:hover:bg-primary-800"
                    >
                      <Globe className="h-4 w-4" />
                      {language === 'id' ? '🇬🇧 English' : '🇮🇩 Bahasa Indonesia'}
                    </button>
                  </div>
                </>
              )}
            </div>

            {/* Auth buttons */}
            {user && profile ? (
              <div className="hidden md:flex items-center gap-2">
                <div className="flex items-center gap-2 px-3 py-1.5 bg-primary-50 dark:bg-primary-800 rounded-xl">
                  <User className="h-4 w-4 text-primary-600 dark:text-primary-400" />
                  <span className="text-sm font-medium text-primary-700 dark:text-primary-300">
                    {profile.full_name}
                  </span>
                </div>
                <button
                  onClick={handleSignOut}
                  className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-error-600 hover:bg-error-50 dark:hover:bg-error-900/20 rounded-xl transition-colors"
                >
                  <LogOut className="h-4 w-4" /> {t('header.signOut')}
                </button>
              </div>
            ) : (
              <div className="hidden md:flex items-center gap-2">
                <Link
                  to="/auth/login"
                  className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-primary-700 dark:text-primary-300 hover:bg-primary-50 dark:hover:bg-primary-800 rounded-xl transition-colors"
                >
                  <LogIn className="h-4 w-4" /> {t('header.signIn')}
                </Link>
                <Link to="/auth/signup" className="btn-primary text-sm !px-4 !py-2">
                  <UserPlus className="h-4 w-4 inline mr-1" /> {t('header.signUp')}
                </Link>
              </div>
            )}

            {/* Mobile menu toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-xl hover:bg-primary-100 dark:hover:bg-primary-800 transition-colors"
            >
              {mobileMenuOpen ? (
                <X className="h-5 w-5 text-primary-600" />
              ) : (
                <Menu className="h-5 w-5 text-primary-600" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-primary-200 dark:border-primary-800 bg-white dark:bg-primary-950 px-4 py-3 space-y-1">
          {profile?.role === 'customer' && (
            <>
              <Link to="/customer" className={linkClass('/customer')} onClick={() => setMobileMenuOpen(false)}>
                <LayoutDashboard className="h-4 w-4" /> {t('header.dashboard')}
              </Link>
              <Link to="/customer/cart" className={linkClass('/customer/cart')} onClick={() => setMobileMenuOpen(false)}>
                <ShoppingCart className="h-4 w-4" /> {t('header.cart')} {cartCount > 0 && `(${cartCount})`}
              </Link>
              <Link to="/customer/wishlist" className={linkClass('/customer/wishlist')} onClick={() => setMobileMenuOpen(false)}>
                <Heart className="h-4 w-4" /> {t('header.wishlist')}
              </Link>
              <Link to="/customer/orders" className={linkClass('/customer/orders')} onClick={() => setMobileMenuOpen(false)}>
                <Package className="h-4 w-4" /> {t('header.orders')}
              </Link>
            </>
          )}
          {profile?.role === 'admin' && (
            <>
              <Link to="/admin" className={linkClass('/admin')} onClick={() => setMobileMenuOpen(false)}>
                <LayoutDashboard className="h-4 w-4" /> {t('header.dashboard')}
              </Link>
              <Link to="/admin/users" className={linkClass('/admin/users')} onClick={() => setMobileMenuOpen(false)}>
                <Users className="h-4 w-4" /> {t('header.users')}
              </Link>
              <Link to="/admin/stores" className={linkClass('/admin/stores')} onClick={() => setMobileMenuOpen(false)}>
                <Store className="h-4 w-4" /> {t('header.stores')}
              </Link>
              <Link to="/admin/orders" className={linkClass('/admin/orders')} onClick={() => setMobileMenuOpen(false)}>
                <ClipboardList className="h-4 w-4" /> {t('header.orderManagement')}
              </Link>
            </>
          )}
          {profile?.role === 'cashier' && (
            <Link to="/cashier" className={linkClass('/cashier')} onClick={() => setMobileMenuOpen(false)}>
              <LayoutDashboard className="h-4 w-4" /> {t('header.dashboard')}
            </Link>
          )}
          <div className="pt-2 border-t border-primary-200 dark:border-primary-800">
            {user ? (
              <>
                <div className="flex items-center gap-2 px-3 py-2 text-sm text-primary-600 dark:text-primary-400">
                  <User className="h-4 w-4" /> {profile?.full_name}
                </div>
                <button onClick={handleSignOut} className="w-full flex items-center gap-2 px-3 py-2 text-sm text-error-600 hover:bg-error-50 dark:hover:bg-error-900/20 rounded-xl">
                  <LogOut className="h-4 w-4" /> {t('header.signOut')}
                </button>
              </>
            ) : (
              <>
                <Link to="/auth/login" className={linkClass('/auth/login')} onClick={() => setMobileMenuOpen(false)}>
                  <LogIn className="h-4 w-4" /> {t('header.signIn')}
                </Link>
                <Link to="/auth/signup" className={linkClass('/auth/signup')} onClick={() => setMobileMenuOpen(false)}>
                  <UserPlus className="h-4 w-4" /> {t('header.signUp')}
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
