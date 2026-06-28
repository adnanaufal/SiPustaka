import React from 'react';
import { X, BookOpen, ShoppingCart, Heart } from 'lucide-react';
import type { Book } from '../../lib/supabase';
import { useLanguage } from '../../contexts/LanguageContext';
import { formatCurrency, formatWeight } from '../../utils/formatters';
import { Badge } from '../Common/Badge';

interface BookDetailModalProps {
  book: Book | null;
  isOpen: boolean;
  onClose: () => void;
  onAddToCart?: () => void;
  onToggleWishlist?: () => void;
  isInWishlist?: boolean;
}

export function BookDetailModal({
  book,
  isOpen,
  onClose,
  onAddToCart,
  onToggleWishlist,
  isInWishlist = false,
}: BookDetailModalProps) {
  const { t } = useLanguage();

  if (!isOpen || !book) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-primary-900/50 dark:bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-3xl bg-white dark:bg-primary-900 rounded-2xl shadow-large max-h-[90vh] overflow-y-auto animate-fade-in">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 p-2 bg-white/80 dark:bg-primary-800/80 backdrop-blur-sm rounded-full hover:bg-white dark:hover:bg-primary-800 transition-colors"
        >
          <X className="h-5 w-5 text-primary-600" />
        </button>

        <div className="flex flex-col md:flex-row">
          {/* Cover */}
          <div className="md:w-2/5 bg-primary-100 dark:bg-primary-800">
            {book.cover_image ? (
              <img src={book.cover_image} alt={book.title} className="w-full h-full object-cover min-h-[300px]" />
            ) : (
              <div className="w-full min-h-[300px] flex items-center justify-center">
                <BookOpen className="h-20 w-20 text-primary-300 dark:text-primary-600" />
              </div>
            )}
          </div>

          {/* Details */}
          <div className="md:w-3/5 p-6">
            <Badge variant="neutral">{book.category}</Badge>
            <h2 className="mt-3 text-2xl font-serif font-bold text-primary-800 dark:text-primary-100">
              {book.title}
            </h2>
            <p className="mt-1 text-primary-500 dark:text-primary-400">oleh {book.author}</p>

            <div className="mt-6 grid grid-cols-2 gap-4">
              <div className="bg-surface-100 dark:bg-primary-800 rounded-xl p-3">
                <p className="text-xs text-primary-500 uppercase tracking-wider">{t('bookDetail.price')}</p>
                <p className="text-xl font-bold text-primary-700 dark:text-secondary-400 mt-1">
                  {formatCurrency(book.price)}
                </p>
              </div>
              <div className="bg-surface-100 dark:bg-primary-800 rounded-xl p-3">
                <p className="text-xs text-primary-500 uppercase tracking-wider">{t('bookDetail.stock')}</p>
                <p className="text-xl font-bold text-primary-700 dark:text-primary-200 mt-1">
                  {book.stock} <span className="text-sm font-normal">{t('bookDetail.available')}</span>
                </p>
              </div>
              <div className="bg-surface-100 dark:bg-primary-800 rounded-xl p-3">
                <p className="text-xs text-primary-500 uppercase tracking-wider">{t('bookDetail.year')}</p>
                <p className="text-xl font-bold text-primary-700 dark:text-primary-200 mt-1">{book.year}</p>
              </div>
              <div className="bg-surface-100 dark:bg-primary-800 rounded-xl p-3">
                <p className="text-xs text-primary-500 uppercase tracking-wider">{t('book.weight')}</p>
                <p className="text-xl font-bold text-primary-700 dark:text-primary-200 mt-1">
                  {formatWeight(book.weight)}
                </p>
              </div>
            </div>

            {book.description && (
              <div className="mt-6">
                <h3 className="text-sm font-semibold text-primary-700 dark:text-primary-300 uppercase tracking-wider mb-2">
                  {t('bookDetail.description')}
                </h3>
                <p className="text-primary-600 dark:text-primary-400 leading-relaxed">{book.description}</p>
              </div>
            )}

            <div className="mt-6 flex gap-3">
              {onAddToCart && (
                <button
                  onClick={onAddToCart}
                  disabled={book.stock === 0}
                  className="flex-1 btn-secondary flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  <ShoppingCart className="h-5 w-5" /> {t('book.addToCart')}
                </button>
              )}
              {onToggleWishlist && (
                <button
                  onClick={onToggleWishlist}
                  className={`px-4 py-2.5 rounded-xl border-2 transition-all duration-200 ${
                    isInWishlist
                      ? 'bg-error-50 border-error-300 text-error-600 dark:bg-error-900/20 dark:border-error-700'
                      : 'border-primary-300 text-primary-600 hover:bg-primary-50 dark:border-primary-600 dark:text-primary-400'
                  }`}
                >
                  <Heart className={`h-5 w-5 ${isInWishlist ? 'fill-current' : ''}`} />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
