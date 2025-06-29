import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { BookOpen, ShoppingCart, Sun, Moon, LogOut, User, Settings, Globe, Search, Filter, ListFilter, Heart } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { useCart } from '../../hooks/useCart';
import { useWishlist } from '../../hooks/useWishlist';
import { supabase } from '../../lib/supabase';
import toast from 'react-hot-toast';

type Book = {
  id: string;
  title: string;
  author: string;
  price: number;
  cover_image: string | null;
  category: string;
  year: number;
};

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
  
  // Live search states
  const [liveSearchResults, setLiveSearchResults] = useState<Book[]>([]);
  const [showLiveSearchResults, setShowLiveSearchResults] = useState(false);
  const [isSearchingLive, setIsSearchingLive] = useState(false);
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchCategories();
  }, []);

  // Live search effect
  useEffect(() => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    if (searchTerm.trim().length > 0) {
      searchTimeoutRef.current = setTimeout(() => {
        fetchLiveSearchResults();
      }, 300); // Debounce for 300ms
    } else {
      setLiveSearchResults([]);
      setShowLiveSearchResults(false);
    }

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [searchTerm, selectedCategory, sortBy]);

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

  const fetchLiveSearchResults = async () => {
    if (!searchTerm.trim()) return;

    setIsSearchingLive(true);
    try {
      let query = supabase
        .from('books')
        .select('id, title, author, price, cover_image, category, year');

      // Apply search filter
      query = query.or(`title.ilike.%${searchTerm}%,author.ilike.%${searchTerm}%,category.ilike.%${searchTerm}%`);

      // Apply category filter if selected
      if (selectedCategory) {
        query = query.eq('category', selectedCategory);
      }

      // Apply sorting
      switch (sortBy) {
        case 'title':
          query = query.order('title');
          break;
        case 'author':
          query = query.order('author');
          break;
        case 'price_low':
          query = query.order('price', { ascending: true });
          break;
        case 'price_high':
          query = query.order('price', { ascending: false });
          break;
        case 'year':
          query = query.order('year', { ascending: false });
          break;
        default:
          query = query.order('title');
      }

      // Limit results for preview
      query = query.limit(7);

      const { data, error } = await query;

      if (error) throw error;
      setLiveSearchResults(data || []);
      setShowLiveSearchResults(true);
    } catch (error) {
      console.error('Error fetching live search results:', error);
    } finally {
      setIsSearchingLive(false);
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

  const toggleLanguage = () => {
    const newLanguage = language === 'en' ? 'id' : 'en';
    setLanguage(newLanguage);
    setShowLanguageDropdown(false);
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
    setShowLiveSearchResults(false);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const handleLiveSearchResultClick = (book: Book) => {
    setSearchTerm(book.title);
    setShowLiveSearchResults(false);
    
    const params = new URLSearchParams();
    params.set('search', book.title);
    if (selectedCategory) params.set('category', selectedCategory);
    if (sortBy && sortBy !== 'title') params.set('sort', sortBy);
    
    const queryString = params.toString();
    navigate(`/customer${queryString ? `?${queryString}` : ''}`);
  };

  const handleSearchInputFocus = () => {
    if (searchTerm.trim() && liveSearchResults.length > 0) {
      setShowLiveSearchResults(true);
    }
  };

  const handleSearchInputBlur = () => {
    // Delay hiding to allow clicking on results
    setTimeout(() => {
      setShowLiveSearchResults(false);
    }, 200);
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

          {/* Center - Integrated Search Bar with Live Preview (visible on medium screens and up) */}
          {user && (
            <div className="hidden md:flex flex-1 max-w-2xl mx-8 relative">
              <div className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 flex items-center">
                {/* Search Input */}
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    ref={searchInputRef}
                    type="text"
                    placeholder={t('customer.searchBooks')}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    onKeyPress={handleKeyPress}
                    onFocus={handleSearchInputFocus}
                    onBlur={handleSearchInputBlur}
                    className="w-full pl-10 pr-4 py-2 text-sm text-gray-900 dark:text-white bg-transparent focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-l-lg"
                  />
                </div>

                {/* Category Filter */}
                <div className="relative">
                  <button
                    onClick={() => setShowCategoryDropdown(!showCategoryDropdown)}
                    className="relative group p-2 border-l border-gray-300 dark:border-gray-600 h-full flex items-center justify-center text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200"
                  >
                    <Filter className="w-4 h-4" />
                    <span className="absolute left-full ml-2 top-1/2 -translate-y-1/2 bg-gray-800 text-white text-xs px-2 py-1 rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-10">
                      {selectedCategory || t('customer.allCategories')}
                    </span>
                  </button>

                  {showCategoryDropdown && (
                    <div className="absolute top-full mt-1 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-1 z-50">
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

                {/* Sort Filter */}
                <div className="relative">
                  <button
                    onClick={() => setShowSortDropdown(!showSortDropdown)}
                    className="relative group p-2 border-l border-gray-300 dark:border-gray-600 h-full flex items-center justify-center text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200"
                  >
                    <ListFilter className="w-4 h-4" />
                    <span className="absolute left-full ml-2 top-1/2 -translate-y-1/2 bg-gray-800 text-white text-xs px-2 py-1 rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-10">
                      {sortOptions.find(opt => opt.value === sortBy)?.label}
                    </span>
                  </button>

                  {showSortDropdown && (
                    <div className="absolute top-full mt-1 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-1 z-50">
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
                  className="px-4 py-2 bg-blue-600 text-white rounded-r-lg hover:bg-blue-700 transition-colors duration-200"
                >
                  <Search className="w-4 h-4" />
                </button>
              </div>

              {/* Live Search Results Preview */}
              {showLiveSearchResults && (
                <div className="absolute top-full mt-1 w-full bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 py-2 z-50 max-h-96 overflow-y-auto">
                  {isSearchingLive ? (
                    <div className="flex items-center justify-center py-4">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
                      <span className="ml-2 text-sm text-gray-600 dark:text-gray-400">Searching...</span>
                    </div>
                  ) : liveSearchResults.length > 0 ? (
                    <>
                      {liveSearchResults.map((book) => (
                        <button
                          key={book.id}
                          onClick={() => handleLiveSearchResultClick(book)}
                          className="w-full flex items-center space-x-3 px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200 text-left"
                        >
                          <div className="w-10 h-12 bg-gray-200 dark:bg-gray-600 rounded overflow-hidden flex-shrink-0">
                            {book.cover_image ? (
                              <img
                                src={book.cover_image}
                                alt={book.title}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                <BookOpen className="w-4 h-4 text-gray-400" />
                              </div>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="text-sm font-medium text-gray-900 dark:text-white truncate">
                              {book.title}
                            </h4>
                            <p className="text-xs text-gray-600 dark:text-gray-400 truncate">
                              by {book.author}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-500">
                              {book.category} • {book.year}
                            </p>
                          </div>
                          <div className="text-sm font-semibold text-blue-600 dark:text-blue-400">
                            ${book.price.toFixed(2)}
                          </div>
                        </button>
                      ))}
                      {liveSearchResults.length === 7 && (
                        <div className="border-t border-gray-200 dark:border-gray-700 pt-2 mt-2">
                          <button
                            onClick={handleSearch}
                            className="w-full px-4 py-2 text-sm text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors duration-200"
                          >
                            View all results →
                          </button>
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400 text-center">
                      No books found for "{searchTerm}"
                    </div>
                  )}
                </div>
              )}
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