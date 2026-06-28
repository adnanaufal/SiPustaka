import React from 'react';
import { ShoppingCart, Heart, Eye, BookOpen } from 'lucide-react';
import type { Book } from '../../lib/supabase';
import { useLanguage } from '../../contexts/LanguageContext';
import { formatCurrency } from '../../utils/formatters';
import { Badge } from '../Common/Badge';

interface BookCardProps {
  book: Book;
  onAddToCart?: () => void;
  onBuyNow?: () => void;
  onToggleWishlist?: () => void;
  onViewDetails?: () => void;
  isInWishlist?: boolean;
  showAdminActions?: boolean;
  onEdit?: () => void;
  onDelete?: () => void;
}

export function BookCard({
  book,
  onAddToCart,
  onBuyNow,
  onToggleWishlist,
  onViewDetails,
  isInWishlist = false,
  showAdminActions = false,
  onEdit,
  onDelete,
}: BookCardProps) {
  const { t } = useLanguage();

  const stockVariant = book.stock === 0 ? 'error' : book.stock <= 5 ? 'warning' : 'success';
  const stockLabel = book.stock === 0
    ? t('book.outOfStock')
    : book.stock <= 5
    ? `${book.stock} ${t('book.left')}`
    : t('book.inStock');

  return (
    <div className="group glass-card overflow-hidden hover:shadow-large transition-all duration-300 hover:-translate-y-1">
      {/* Cover Image */}
      <div className="relative aspect-[3/4] bg-primary-100 dark:bg-primary-800 overflow-hidden">
        {book.cover_image ? (
          <img
            src={book.cover_image}
            alt={book.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <BookOpen className="h-16 w-16 text-primary-300 dark:text-primary-600" />
          </div>
        )}

        {/* Overlay on hover */}
        <div className="absolute inset-0 bg-gradient-to-t from-primary-900/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <div className="absolute bottom-4 left-4 right-4 flex gap-2">
            {onViewDetails && (
              <button
                onClick={onViewDetails}
                className="flex-1 flex items-center justify-center gap-1.5 bg-white/90 text-primary-800 py-2 rounded-lg text-sm font-medium hover:bg-white transition-colors"
              >
                <Eye className="h-4 w-4" /> {t('book.viewDetails')}
              </button>
            )}
            {onToggleWishlist && (
              <button
                onClick={onToggleWishlist}
                className={`p-2 rounded-lg transition-colors ${
                  isInWishlist
                    ? 'bg-error-500 text-white'
                    : 'bg-white/90 text-primary-600 hover:bg-white'
                }`}
              >
                <Heart className={`h-4 w-4 ${isInWishlist ? 'fill-current' : ''}`} />
              </button>
            )}
          </div>
        </div>

        {/* Stock badge */}
        <div className="absolute top-3 right-3">
          <Badge variant={stockVariant} size="sm">{stockLabel}</Badge>
        </div>
      </div>

      {/* Info */}
      <div className="p-4">
        <Badge variant="neutral" size="sm">{book.category}</Badge>
        <h3 className="mt-2 font-semibold text-primary-800 dark:text-primary-100 line-clamp-2 leading-tight">
          {book.title}
        </h3>
        <p className="mt-1 text-sm text-primary-500 dark:text-primary-400">{book.author}</p>
        <div className="mt-3 flex items-center justify-between">
          <span className="text-lg font-bold text-primary-700 dark:text-secondary-400">
            {formatCurrency(book.price)}
          </span>
          <span className="text-xs text-primary-400">{book.year}</span>
        </div>

        {/* Action buttons */}
        <div className="mt-3">
          {showAdminActions ? (
            <div className="flex gap-2">
              <button onClick={onEdit} className="flex-1 btn-outline !py-1.5 !px-3 text-xs">
                {t('book.edit')}
              </button>
              <button
                onClick={onDelete}
                className="px-3 py-1.5 text-xs font-medium text-error-600 border-2 border-error-300 dark:border-error-700 rounded-xl hover:bg-error-50 dark:hover:bg-error-900/20 transition-colors"
              >
                {t('book.delete')}
              </button>
            </div>
          ) : (
            onAddToCart && (
              <div className="flex gap-2">
                <button
                  onClick={onAddToCart}
                  disabled={book.stock === 0}
                  className="btn-outline !p-2 text-sm flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  title={t('book.addToCart')}
                >
                  <ShoppingCart className="h-4 w-4" />
                </button>
                {onBuyNow && (
                  <button
                    onClick={onBuyNow}
                    disabled={book.stock === 0}
                    className="flex-1 btn-primary text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {t('book.buyNow')}
                  </button>
                )}
              </div>
            )
          )}
        </div>
      </div>
    </div>
  );
}
