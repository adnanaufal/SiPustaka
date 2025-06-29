import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { BookOpen, ShoppingCart, Sun, Moon, LogOut, User, Settings, Globe, Search, Filter, ArrowUpDown, Heart } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { useCart } from '../../hooks/useCart';
import { useWishlist } from '../../hooks/useWishlist';
import { supabase } from '../../lib/supabase';
import toast from 'react-hot-toast';

export function Header() {
  const { user, profile, signOut } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const { language, setLanguage, t } = useLanguage();
  const { totalItems } = useCart();
  const { totalItems: wishlistItems } = useWishlist();
  const navigate = useNavigate();
  const [showLanguageDropdown, setShowLanguageDropdown] = useState(false);
  
  // Search and filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [sortBy, setSortBy] = useState('title');
  const [categories, setCategories] = useState<string[]>([]);
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
  const [showSortDropdown, setShowSortDropdown] = useState(false);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const { data, error } = await supabase
        .from('books')
        .select('category')
        .order('category');

      if (error) throw error;
      
      const uniqueCategories = [...new Set(data?.map(book => book.category) || [])];
      setCategories(uniqueCategories);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      navigate('/');
      toast.success('Signed out successfully');
    } catch (error) {
      console.error('Error signing out:', error);
      toast.error('Failed to sign out');
    }
  };

  const getDashboardLink = () => {
    if (!profile) return '/';
    
    switch (profile.role) {
      case 'admin':
        return '/admin';
      case 'cashier':
        return '/cashier';
      case 'customer':
        return '/customer';
      default:
        return '/';
    }
  };

  const getFlagUrl = (lang: 'en' | 'id') => {
    return lang === 'en' 
      ? 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/83/Flag_of_the_United_Kingdom_%283-5%29.svg/1200px-Flag_of_the_United_Kingdom_%283-5%29.svg.png'
      : 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/89/Flag_of_Indonesia_%28physical_version%29.svg/1200px-Flag_of_Indonesia_%28physical_version%29.svg.png';
  };

  const getLanguageName = (lang: 'en' | 'id') => {
    return lang === 'en' ? 'English' : 'Bahasa Indonesia';
  };

  const handleSearch = () => {
    const params = new URLSearchParams();
    if (searchTerm) params.set('search', searchTerm);
    if (selectedCategory) params.set('category', selectedCategory);
    if (sortBy && sortBy !== 'title') params.set('sort', sortBy);
    
    const queryString = params.toString();
    navigate(`/customer${queryString ? `?${queryString}` : ''}`);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const sortOptions = [
    { value: 'title', label: t('customer.sortByTitle') },
    { value: 'author', label: t('customer.sortByAuthor') },
    { value: 'price_low', label: t('customer.priceLowToHigh') },
    { value: 'price_high', label: t('customer.priceHighToLow') },
    { value: 'year', label: t('customer.newestFirst') },
  ];

  return (
    <header className="sticky top-0 z-50 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Left side - Theme toggle and Logo */}
          <div className="flex items-center space-x-4">
            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors duration-200"
            >
              {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>

            {/* Logo */}
            <Link to="/" className="flex items-center space-x-3 group">
              <img 
                src="/LogoSiPustaka.png" 
                alt="SiPustaka Logo" 
                className="h-12 w-auto object-contain drop-shadow-lg group-hover:drop-shadow-xl transition-all duration-200"
              />
              <span className="text-xl font-bold text-gray-900 dark:text-white">
                SiPustaka
              </span>
            </Link>
          </div>

          {/* Center - Integrated Search Bar (visible on medium screens and up) */}
          {user && (
            <div className="hidden md:flex items-center flex-1 max-w-2xl mx-8">
              <div className="relative flex items-center w-full border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 overflow-hidden">
                {/* Search Icon */}
                <div className="pl-3 pr-2">
                  <Search className="w-4 h-4 text-gray-400" />
                </div>

                {/* Search Input */}
                <input
                  type="text"
                  placeholder={t('customer.searchBooks')}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyPress={handleKeyPress}
                  className="flex-1 py-2 px-2 text-sm bg-transparent text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none"
                />

                {/* Category Filter Button */}
                <div className="relative">
                  <button
                    onClick={() => setShowCategoryDropdown(!showCategoryDropdown)}
                    className="group flex items-center px-3 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors duration-200 border-l border-gray-200 dark:border-gray-600"
                    title={selectedCategory || t('customer.allCategories')}
                  >
                    <Filter className="w-4 h-4" />
                    <span className="ml-2 text-sm opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap">
                      {selectedCategory || t('customer.allCategories')}
                    </span>
                  </button>

                  {showCategoryDropdown && (
                    <div className="absolute top-full right-0 mt-1 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-1 z-50">
                      <button
                        onClick={() => {
                          setSelectedCategory('');
                          setShowCategoryDropdown(false);
                        }}
                        className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200 ${
                          !selectedCategory ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400' : 'text-gray-700 dark:text-gray-300'
                        }`}
                      >
                        {t('customer.allCategories')}
                      </button>
                      {categories.map((category) => (
                        <button
                          key={category}
                          onClick={() => {
                            setSelectedCategory(category);
                            setShowCategoryDropdown(false);
                          }}
                          className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200 ${
                            selectedCategory === category ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400' : 'text-gray-700 dark:text-gray-300'
                          }`}
                        >
                          {category}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Sort Filter Button */}
                <div className="relative">
                  <button
                    onClick={() => setShowSortDropdown(!showSortDropdown)}
                    className="group flex items-center px-3 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors duration-200 border-l border-gray-200 dark:border-gray-600"
                    title={sortOptions.find(opt => opt.value === sortBy)?.label}
                  >
                    <ArrowUpDown className="w-4 h-4" />
                    <span className="ml-2 text-sm opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap">
                      {sortOptions.find(opt => opt.value === sortBy)?.label}
                    </span>
                  </button>

                  {showSortDropdown && (
                    <div className="absolute top-full right-0 mt-1 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-1 z-50">
                      {sortOptions.map((option) => (
                        <button
                          key={option.value}
                          onClick={() => {
                            setSortBy(option.value);
                            setShowSortDropdown(false);
                          }}
                          className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200 ${
                            sortBy === option.value ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400' : 'text-gray-700 dark:text-gray-300'
                          }`}
                        >
                          {option.label}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Search Button */}
                <button
                  onClick={handleSearch}
                  className="px-3 py-2 bg-blue-600 text-white hover:bg-blue-700 transition-colors duration-200 border-l border-blue-600"
                >
                  <Search className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* Right side - Navigation */}
          <div className="flex items-center space-x-4">
            {/* Language Switcher */}
            <div className="relative">
              <button
                onClick={() => setShowLanguageDropdown(!showLanguageDropdown)}
                className="flex items-center space-x-2 p-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors duration-200"
                title={`Switch to ${language === 'en' ? 'Bahasa Indonesia' : 'English'}`}
              >
                <Globe className="w-5 h-5" />
                <img 
                  src={getFlagUrl(language)} 
                  alt={getLanguageName(language)}
                  className="w-5 h-3 object-cover rounded-sm"
                />
              </button>

              {/* Language Dropdown */}
              {showLanguageDropdown && (
                <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-1 z-50">
                  <button
                    onClick={() => {
                      setLanguage('en');
                      setShowLanguageDropdown(false);
                    }}
                    className={`w-full flex items-center space-x-3 px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200 ${
                      language === 'en' ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400' : 'text-gray-700 dark:text-gray-300'
                    }`}
                  >
                    <img 
                      src={getFlagUrl('en')} 
                      alt="English"
                      className="w-5 h-3 object-cover rounded-sm"
                    />
                    <span>English</span>
                    {language === 'en' && <span className="ml-auto text-blue-600 dark:text-blue-400">✓</span>}
                  </button>
                  <button
                    onClick={() => {
                      setLanguage('id');
                      setShowLanguageDropdown(false);
                    }}
                    className={`w-full flex items-center space-x-3 px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200 ${
                      language === 'id' ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400' : 'text-gray-700 dark:text-gray-300'
                    }`}
                  >
                    <img 
                      src={getFlagUrl('id')} 
                      alt="Bahasa Indonesia"
                      className="w-5 h-3 object-cover rounded-sm"
                    />
                    <span>Bahasa Indonesia</span>
                    {language === 'id' && <span className="ml-auto text-blue-600 dark:text-blue-400">✓</span>}
                  </button>
                </div>
              )}
            </div>

            {user ? (
              <>
                {/* Wishlist (for customers) */}
                {profile?.role === 'customer' && (
                  <Link
                    to="/customer/wishlist"
                    className="relative p-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors duration-200"
                  >
                    <Heart className="w-5 h-5" />
                    {wishlistItems > 0 && (
                      <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                        {wishlistItems}
                      </span>
                    )}
                  </Link>
                )}

                {/* Cart (for customers) */}
                {profile?.role === 'customer' && (
                  <Link
                    to="/customer/cart"
                    className="relative p-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors duration-200"
                  >
                    <ShoppingCart className="w-5 h-5" />
                    {totalItems > 0 && (
                      <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                        {totalItems}
                      </span>
                    )}
                  </Link>
                )}

                {/* Dashboard Link */}
                <Link
                  to={getDashboardLink()}
                  className="flex items-center space-x-2 px-3 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors duration-200"
                >
                  <User className="w-4 h-4" />
                  <span className="hidden sm:inline">{t('header.dashboard')}</span>
                </Link>

                {/* Settings */}
                {profile?.role === 'admin' && (
                  <Link
                    to="/admin/settings"
                    className="p-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors duration-200"
                  >
                    <Settings className="w-5 h-5" />
                  </Link>
                )}

                {/* Sign Out */}
                <button
                  onClick={handleSignOut}
                  className="flex items-center space-x-2 px-3 py-2 text-gray-600 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors duration-200"
                >
                  <LogOut className="w-4 h-4" />
                  <span className="hidden sm:inline">{t('header.signOut')}</span>
                </button>
              </>
            ) : (
              <div className="flex items-center space-x-2">
                <Link
                  to="/auth/login"
                  className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors duration-200"
                >
                  {t('header.signIn')}
                </Link>
                <Link
                  to="/auth/signup"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
                >
                  {t('header.signUp')}
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Overlay to close dropdowns when clicking outside */}
      {(showLanguageDropdown || showCategoryDropdown || showSortDropdown) && (
        <div 
          className="fixed inset-0 z-40" 
          onClick={() => {
            setShowLanguageDropdown(false);
            setShowCategoryDropdown(false);
            setShowSortDropdown(false);
          }}
        />
      )}
    </header>
  );
}