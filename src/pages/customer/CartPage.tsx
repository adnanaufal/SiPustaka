import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, ShoppingBag, Plus, Minus, Trash2 } from 'lucide-react';
import { Layout } from '../../components/Layout/Layout';
import { useCart } from '../../hooks/useCart';
import { useLanguage } from '../../contexts/LanguageContext';

export function CartPage() {
  const { t } = useLanguage();
  const { items, loading, totalAmount, updateQuantity, removeFromCart, checkout } = useCart();

  const handleCheckout = async () => {
    try {
      await checkout();
    } catch (error) {
      // Error is handled in the hook
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="text-gray-600 dark:text-gray-400 mt-4">{t('cart.loadingCart')}</p>
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
            <span>{t('cart.backToBooks')}</span>
          </Link>
          
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              {t('cart.shoppingCart')}
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              {items.length} {t('cart.itemsInCart')}
            </p>
          </div>
        </div>

        {items.length === 0 ? (
          <div className="text-center py-12">
            <ShoppingBag className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              {t('cart.cartEmpty')}
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              {t('cart.startShopping')}
            </p>
            <Link
              to="/customer"
              className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
            >
              {t('cart.browseBooks')}
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2 space-y-4">
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
                      <p className="text-xl font-bold text-gray-900 dark:text-white mt-2">
                        ${item.book.price.toFixed(2)}
                      </p>

                      <div className="flex items-center justify-between mt-4">
                        <div className="flex items-center space-x-3">
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors duration-200"
                          >
                            <Minus className="w-4 h-4" />
                          </button>
                          <span className="text-lg font-medium text-gray-900 dark:text-white px-3 py-1 bg-gray-100 dark:bg-gray-700 rounded-lg">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors duration-200"
                          >
                            <Plus className="w-4 h-4" />
                          </button>
                        </div>

                        <button
                          onClick={() => removeFromCart(item.id)}
                          className="flex items-center space-x-2 px-3 py-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors duration-200"
                        >
                          <Trash2 className="w-4 h-4" />
                          <span>{t('cart.remove')}</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 sticky top-8">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  {t('cart.orderSummary')}
                </h3>

                <div className="space-y-3 mb-6">
                  {items.map((item) => (
                    <div key={item.id} className="flex justify-between text-sm">
                      <span className="text-gray-600 dark:text-gray-400">
                        {item.book.title} x {item.quantity}
                      </span>
                      <span className="text-gray-900 dark:text-white">
                        ${(item.book.price * item.quantity).toFixed(2)}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="border-t border-gray-200 dark:border-gray-700 pt-4 mb-6">
                  <div className="flex justify-between text-xl font-bold text-gray-900 dark:text-white">
                    <span>{t('cart.total')}</span>
                    <span>${totalAmount.toFixed(2)}</span>
                  </div>
                </div>

                <button
                  onClick={handleCheckout}
                  className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 font-semibold transition-colors duration-200"
                >
                  {t('cart.checkout')}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}