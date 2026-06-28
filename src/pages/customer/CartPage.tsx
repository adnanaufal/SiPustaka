import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Minus, Plus, Trash2, ShoppingBag } from 'lucide-react';
import { Layout } from '../../components/Layout/Layout';
import { LoadingSpinner } from '../../components/Common/LoadingSpinner';
import { EmptyState } from '../../components/Common/EmptyState';
import { useCart } from '../../hooks/useCart';
import { useLanguage } from '../../contexts/LanguageContext';
import { formatCurrency } from '../../utils/formatters';

export function CartPage() {
  const { cartItems, loading, cartTotal, updateQuantity, removeFromCart } = useCart();
  const { t } = useLanguage();

  if (loading) return <Layout><LoadingSpinner text={t('cart.loadingCart')} /></Layout>;

  return (
    <Layout>
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
        <Link to="/customer" className="inline-flex items-center gap-2 text-primary-600 dark:text-primary-400 hover:text-primary-700 mb-6">
          <ArrowLeft className="h-4 w-4" /> {t('cart.backToBooks')}
        </Link>

        <h1 className="text-3xl font-serif font-bold text-primary-800 dark:text-primary-100 mb-2">
          {t('cart.shoppingCart')}
        </h1>
        <p className="text-primary-500 dark:text-primary-400 mb-8">
          {t('cart.itemsInCart', { count: String(cartItems.length) })}
        </p>

        {cartItems.length === 0 ? (
          <EmptyState
            icon={<ShoppingBag className="h-16 w-16" />}
            title={t('cart.cartEmpty')}
            description={t('cart.startShopping')}
            action={<Link to="/customer" className="btn-primary">{t('cart.browseBooks')}</Link>}
          />
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Cart items */}
            <div className="lg:col-span-2 space-y-4">
              {cartItems.map((item) => (
                <div key={item.id} className="glass-card p-4 flex gap-4">
                  <div className="w-20 h-28 rounded-lg overflow-hidden bg-primary-100 dark:bg-primary-800 flex-shrink-0">
                    {item.book?.cover_image ? (
                      <img src={item.book.cover_image} alt={item.book.title} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-primary-300">
                        <ShoppingBag className="h-8 w-8" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-primary-800 dark:text-primary-100 truncate">
                      {item.book?.title}
                    </h3>
                    <p className="text-sm text-primary-500 dark:text-primary-400">{item.book?.author}</p>
                    <p className="text-lg font-bold text-primary-700 dark:text-secondary-400 mt-2">
                      {formatCurrency(item.book?.price || 0)}
                    </p>
                  </div>
                  <div className="flex flex-col items-end justify-between">
                    <button
                      onClick={() => removeFromCart(item.id)}
                      className="p-1.5 text-error-500 hover:bg-error-50 dark:hover:bg-error-900/20 rounded-lg transition-colors"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        className="p-1 rounded-lg border border-primary-300 dark:border-primary-600 hover:bg-primary-50 dark:hover:bg-primary-800 transition-colors"
                      >
                        <Minus className="h-4 w-4 text-primary-600" />
                      </button>
                      <span className="w-8 text-center font-medium text-primary-800 dark:text-primary-200">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        disabled={item.quantity >= (item.book?.stock || 0)}
                        className="p-1 rounded-lg border border-primary-300 dark:border-primary-600 hover:bg-primary-50 dark:hover:bg-primary-800 transition-colors disabled:opacity-50"
                      >
                        <Plus className="h-4 w-4 text-primary-600" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Order summary */}
            <div className="lg:col-span-1">
              <div className="glass-card p-6 sticky top-24">
                <h2 className="text-lg font-serif font-bold text-primary-800 dark:text-primary-100 mb-4">
                  {t('cart.orderSummary')}
                </h2>
                <div className="space-y-3 mb-6">
                  {cartItems.map((item) => (
                    <div key={item.id} className="flex justify-between text-sm">
                      <span className="text-primary-600 dark:text-primary-400 truncate mr-2">
                        {item.book?.title} × {item.quantity}
                      </span>
                      <span className="text-primary-700 dark:text-primary-300 whitespace-nowrap">
                        {formatCurrency((item.book?.price || 0) * item.quantity)}
                      </span>
                    </div>
                  ))}
                </div>
                <div className="border-t border-primary-200 dark:border-primary-700 pt-4 mb-6">
                  <div className="flex justify-between">
                    <span className="text-lg font-bold text-primary-800 dark:text-primary-100">{t('cart.total')}</span>
                    <span className="text-xl font-bold text-primary-700 dark:text-secondary-400">
                      {formatCurrency(cartTotal)}
                    </span>
                  </div>
                </div>
                <Link to="/customer/checkout" className="btn-secondary w-full text-center block">
                  {t('cart.checkout')}
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}
