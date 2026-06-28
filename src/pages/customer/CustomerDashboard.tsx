import React, { useState, useEffect, useCallback } from 'react';
import { ShoppingCart } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Layout } from '../../components/Layout/Layout';
import { BookCard } from '../../components/Books/BookCard';
import { BookDetailModal } from '../../components/Books/BookDetailModal';
import { BookFilter } from '../../components/Books/BookFilter';
import { LoadingSpinner } from '../../components/Common/LoadingSpinner';
import { EmptyState } from '../../components/Common/EmptyState';
import { useBooks, SortOption } from '../../hooks/useBooks';
import { useCart } from '../../hooks/useCart';
import { useWishlist } from '../../hooks/useWishlist';
import { useLanguage } from '../../contexts/LanguageContext';
import type { Book } from '../../lib/supabase';

export function CustomerDashboard() {
  const { books, categories, loading, fetchBooks } = useBooks();
  const { addToCart, cartCount } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();
  const { t } = useLanguage();
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [sort, setSort] = useState<SortOption>('newest');
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);

  const applyFilters = useCallback(() => {
    fetchBooks({ search, category, sort });
  }, [search, category, sort, fetchBooks]);

  useEffect(() => {
    const timer = setTimeout(applyFilters, 300);
    return () => clearTimeout(timer);
  }, [applyFilters]);

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-serif font-bold text-primary-800 dark:text-primary-100">
              {t('customer.browseBooks')}
            </h1>
            <p className="text-primary-500 dark:text-primary-400 mt-1">{t('customer.discoverBooks')}</p>
          </div>
          <Link to="/customer/cart" className="btn-secondary flex items-center gap-2 self-start">
            <div className="relative">
              <ShoppingCart className="h-5 w-5" />
              {cartCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-primary-700 text-white text-[10px] font-bold rounded-full h-4 w-4 flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </div>
            {t('customer.viewCart')}
          </Link>
        </div>

        {/* Filters */}
        <BookFilter
          search={search}
          onSearchChange={setSearch}
          category={category}
          onCategoryChange={setCategory}
          sort={sort}
          onSortChange={setSort}
          categories={categories}
          totalBooks={books.length}
        />

        {/* Book Grid */}
        {loading ? (
          <LoadingSpinner text={t('customer.loadingBooks')} />
        ) : books.length === 0 ? (
          <EmptyState
            title={t('customer.noBooksFound')}
            description={t('customer.adjustFilters')}
          />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mt-6">
            {books.map((book) => (
              <BookCard
                key={book.id}
                book={book}
                onAddToCart={() => addToCart(book.id)}
                onToggleWishlist={() => toggleWishlist(book.id)}
                onViewDetails={() => setSelectedBook(book)}
                isInWishlist={isInWishlist(book.id)}
              />
            ))}
          </div>
        )}

        {/* Book Detail Modal */}
        <BookDetailModal
          book={selectedBook}
          isOpen={!!selectedBook}
          onClose={() => setSelectedBook(null)}
          onAddToCart={() => { if (selectedBook) { addToCart(selectedBook.id); setSelectedBook(null); } }}
          onToggleWishlist={() => { if (selectedBook) toggleWishlist(selectedBook.id); }}
          isInWishlist={selectedBook ? isInWishlist(selectedBook.id) : false}
        />
      </div>
    </Layout>
  );
}
