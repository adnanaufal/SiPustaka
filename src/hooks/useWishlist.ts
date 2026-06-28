import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import type { WishlistItem, Book } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';
import { useLanguage } from '../contexts/LanguageContext';

export function useWishlist() {
  const [wishlistItems, setWishlistItems] = useState<(WishlistItem & { book: Book })[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { t } = useLanguage();

  const fetchWishlist = useCallback(async () => {
    if (!user) {
      setWishlistItems([]);
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('wishlist_items')
        .select('*, book:books(*)')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setWishlistItems((data as (WishlistItem & { book: Book })[]) || []);
    } catch (error) {
      console.error('Error fetching wishlist:', error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchWishlist();
  }, [fetchWishlist]);

  const isInWishlist = useCallback(
    (bookId: string) => wishlistItems.some((item) => item.book_id === bookId),
    [wishlistItems]
  );

  const addToWishlist = async (bookId: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('wishlist_items')
        .insert({ user_id: user.id, book_id: bookId });

      if (error) throw error;
      toast.success(t('wishlist.addedToWishlist'));
      await fetchWishlist();
    } catch (error) {
      console.error('Error adding to wishlist:', error);
      toast.error(t('common.error'));
    }
  };

  const removeFromWishlist = async (bookId: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('wishlist_items')
        .delete()
        .eq('user_id', user.id)
        .eq('book_id', bookId);

      if (error) throw error;
      toast.success(t('wishlist.removedFromWishlist'));
      await fetchWishlist();
    } catch (error) {
      console.error('Error removing from wishlist:', error);
      toast.error(t('common.error'));
    }
  };

  const toggleWishlist = async (bookId: string) => {
    if (isInWishlist(bookId)) {
      await removeFromWishlist(bookId);
    } else {
      await addToWishlist(bookId);
    }
  };

  return {
    wishlistItems,
    loading,
    isInWishlist,
    addToWishlist,
    removeFromWishlist,
    toggleWishlist,
    refreshWishlist: fetchWishlist,
  };
}
