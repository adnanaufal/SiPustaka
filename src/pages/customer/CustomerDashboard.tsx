import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, Filter, ShoppingCart } from 'lucide-react';
import { Layout } from '../../components/Layout/Layout';
import { BookCard } from '../../components/Books/BookCard';
import { BookDetailModal } from '../../components/Books/BookDetailModal';
import { CartSidebar } from '../../components/Cart/CartSidebar';
import { useLanguage } from '../../contexts/LanguageContext';
import { supabase } from '../../lib/supabase';
import type { Database } from '../../lib/supabase';

type Book = Database['public']['Tables']['books']['Row'];

export function CustomerDashboard() {
  const { t } = useLanguage();
  const [searchParams, setSearchParams] = useSearchParams();
  const [books, setBooks] = useState<Book[]>([]);
  const [filteredBooks, setFilteredBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState(searchParams.get('search') || '');
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || '');
  const [sortBy, setSortBy] = useState(searchParams.get('sort') || 'title');
  const [showCart, setShowCart] = useState(false);
  const [selectedBookForDetail, setSelectedBookForDetail] = useState<Book | null>(null);

  useEffect(() => {
    fetchBooks();
  }, []);

  useEffect(() => {
    filterBooks();
  }, [books, searchTerm, selectedCategory, sortBy]);

  useEffect(() => {
    // Update state when URL parameters change
    setSearchTerm(searchParams.get('search') || '');
    setSelectedCategory(searchParams.get('category') || '');
    setSortBy(searchParams.get('sort') || 'title');
  }, [searchParams]);

  useEffect(() => {
    // Update URL parameters when state changes
    const params = new URLSearchParams();
    if (searchTerm) params.set('search', searchTerm);
    if (selectedCategory) params.set('category', selectedCategory);
    if (sortBy && sortBy !== 'title') params.set('sort', sortBy);
    
    setSearchParams(params);
  }, [searchTerm, selectedCategory, sortBy, setSearchParams]);

  const fetchBooks = async () => {
    try {
      const { data, error } = await supabase
        .from('books')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setBooks(data || []);
    } catch (error) {
      console.error('Error fetching books:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterBooks = () => {
    let filtered = [...books];

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(
        (book) =>
          book.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          book.author.toLowerCase().includes(searchTerm.toLowerCase()) ||
          book.category.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Category filter
    if (selectedCategory) {
      filtered = filtered.filter((book) => book.category === selectedCategory);
    }

    // Sort
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'title':
          return a.title.localeCompare(b.title);
        case 'author':
          return a.author.localeCompare(b.author);
        case 'price_low':
          return a.price - b.price;
        case 'price_high':
          return b.price - a.price;
        case 'year':
          return b.year - a.year;
        default:
          return 0;
      }
    });

    setFilteredBooks(filtered);
  };

  const handleViewDetail = (book: Book) => {
    setSelectedBookForDetail(book);
  };

  const closeDetailModal = () => {
    setSelectedBookForDetail(null);
  };

  const categories = [...new Set(books.map((book) => book.category))];

  if (loading) {
    return (
      <Layout>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="text-gray-600 dark:text-gray-400 mt-4">{t('customer.loadingBooks')}</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              {t('customer.browseBooks')}
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              {t('customer.discoverBooks')}
            </p>
          </div>
          
          <button
            onClick={() => setShowCart(true)}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
          >
            <ShoppingCart className="w-5 h-5" />
            <span>{t('customer.viewCart')}</span>
          </button>
        </div>

        {/* Mobile Filters - Only show on small screens */}
        <div className="md:hidden bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-8">
          <div className="space-y-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder={t('customer.searchBooks')}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Category Filter */}
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">{t('customer.allCategories')}</option>
                {categories.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>

            {/* Sort */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="title">{t('customer.sortByTitle')}</option>
              <option value="author">{t('customer.sortByAuthor')}</option>
              <option value="price_low">{t('customer.priceLowToHigh')}</option>
              <option value="price_high">{t('customer.priceHighToLow')}</option>
              <option value="year">{t('customer.newestFirst')}</option>
            </select>

            {/* Results Count */}
            <div className="text-sm text-gray-600 dark:text-gray-400">
              {filteredBooks.length} {t('customer.booksFound')}
            </div>
          </div>
        </div>

        {/* Desktop Results Count - Only show on medium screens and up */}
        <div className="hidden md:block mb-6">
          <div className="text-sm text-gray-600 dark:text-gray-400">
            {filteredBooks.length} {t('customer.booksFound')}
            {searchTerm && (
              <span className="ml-2">
                for "{searchTerm}"
              </span>
            )}
            {selectedCategory && (
              <span className="ml-2">
                in {selectedCategory}
              </span>
            )}
          </div>
        </div>

        {/* Books Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredBooks.map((book) => (
            <BookCard 
              key={book.id} 
              book={book} 
              onViewDetail={handleViewDetail}
            />
          ))}
        </div>

        {/* Empty State */}
        {filteredBooks.length === 0 && (
          <div className="text-center py-12">
            <Search className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              {t('customer.noBooksFound')}
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              {t('customer.adjustFilters')}
            </p>
            {(searchTerm || selectedCategory) && (
              <button
                onClick={() => {
                  setSearchTerm('');
                  setSelectedCategory('');
                  setSortBy('title');
                }}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
              >
                Clear Filters
              </button>
            )}
          </div>
        )}
      </div>

      <CartSidebar isOpen={showCart} onClose={() => setShowCart(false)} />
      
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