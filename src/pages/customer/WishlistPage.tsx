import React from 'react';
import { Link } from 'react-router-dom';
import { Heart, ShoppingCart } from 'lucide-react';
import { Layout } from '../../components/Layout/Layout';
import { LoadingSpinner } from '../../components/Common/LoadingSpinner';
import { EmptyState } from '../../components/Common/EmptyState';
import { BookCard } from '../../components/Books/BookCard';
import { useWishlist } from '../../hooks/useWishlist';
import { useCart } from '../../hooks/useCart';
import { useLanguage } from '../../contexts/LanguageContext';

export function WishlistPage() {
  const { wishlistItems, loading, removeFromWishlist } = useWishlist();
  const { addToCart } = useCart();
  const { t } = useLanguage();

  if (loading) return <Layout><LoadingSpinner text={t('wishlist.loadingWishlist')} /></Layout>;

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <h1 className="text-3xl font-serif font-bold text-primary-800 dark:text-primary-100 mb-2">
          {t('wishlist.title')}
        </h1>
        <p className="text-primary-500 dark:text-primary-400 mb-8">
          {t('wishlist.itemsInWishlist', { count: String(wishlistItems.length) })}
        </p>

        {wishlistItems.length === 0 ? (
          <EmptyState
            icon={<Heart className="h-16 w-16" />}
            title={t('wishlist.empty')}
            description={t('wishlist.startBrowsing')}
            action={<Link to="/customer" className="btn-primary">{t('cart.browseBooks')}</Link>}
          />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {wishlistItems.map((item) => (
              <BookCard
                key={item.id}
                book={item.book}
                onAddToCart={() => addToCart(item.book_id)}
                onToggleWishlist={() => removeFromWishlist(item.book_id)}
                isInWishlist={true}
              />
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}
