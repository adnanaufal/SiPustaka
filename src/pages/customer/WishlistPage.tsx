import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Heart, ShoppingBag, ShoppingCart } from 'lucide-react';
import { Layout } from '../../components/Layout/Layout';
import { useWishlist } from '../../hooks/useWishlist';
import { useCart } from '../../hooks/useCart';
import { useLanguage } from '../../contexts/LanguageContext';
import { formatRupiah } from '../../utils/formatters';

export function WishlistPage() {
  const { t } = useLanguage();
  const { items, loading, removeFromWishlist } = useWishlist();
  const { addToCart } = useCart();

  const handleAddToCart = (bookId: string) => {
    addToCart(bookId, 1);
  };

  if (loading) {
    return (
      <Layout>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="text-gray-600 dark:text-gray-400 mt-4">{t('wishlist.loadingWishlist')}</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center mb-8">
          <Link
            to="/customer"
            className="flex items-center space-x-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors duration-200 mr-6"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Back to Books</span>
          </Link>
          
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              {t('wishlist.title')}
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              {items.length} {t('wishlist.itemsInWishlist')}
            </p>
          </div>
        </div>

        {items.length === 0 ? (
          <div className="text-center py-12">
            <Heart className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              {t('wishlist.empty')}
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              {t('wishlist.startBrowsing')}
            </p>
            <Link
              to="/customer"
              className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
            >
              Browse Books
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {items.map((item) => (
              <div key={item.id} className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                <div className="flex items-start space-x-4">
                  <div className="w-20 h-24 bg-gray-200 dark:bg-gray-700 rounded-lg overflow-hidden flex-shrink-0">
                    {item.book.cover_image ? (
                      <img
                        src={item.book.cover_image}
                        alt={item.book.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <ShoppingBag className="w-8 h-8 text-gray-400" />
                      </div>
                    )}
                  </div>

                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      {item.book.title}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400">
                      by {item.book.author}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-500 mt-1">
                      {item.book.category} • {item.book.year}
                    </p>
                    <p className="text-xl font-bold text-gray-900 dark:text-white mt-2">
                      {formatRupiah(item.book.price)}
                    </p>

                    <div className="flex items-center space-x-3 mt-4">
                      <button
                        onClick={() => handleAddToCart(item.book_id)}
                        disabled={item.book.stock === 0}
                        className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors duration-200"
                      >
                        <ShoppingCart className="w-4 h-4" />
                        <span>{t('book.addToCart')}</span>
                      </button>

                      <button
                        onClick={() => removeFromWishlist(item.id)}
                        className="flex items-center space-x-2 px-4 py-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors duration-200"
                      >
                        <Heart className="w-4 h-4 fill-current" />
                        <span>Remove</span>
                      </button>
                    </div>

                    {item.book.stock === 0 && (
                      <p className="text-red-600 text-sm mt-2">Out of stock</p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}