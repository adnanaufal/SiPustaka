import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import type { CartItem, Book } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';
import { useLanguage } from '../contexts/LanguageContext';

export function useCart() {
  const [cartItems, setCartItems] = useState<(CartItem & { book: Book })[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { t } = useLanguage();

  const fetchCart = useCallback(async () => {
    if (!user) {
      setCartItems([]);
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('cart_items')
        .select('*, book:books(*)')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setCartItems((data as (CartItem & { book: Book })[]) || []);
    } catch (error) {
      console.error('Error fetching cart:', error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  const cartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);
  const cartTotal = cartItems.reduce((sum, item) => sum + item.quantity * (item.book?.price || 0), 0);
  const totalWeight = cartItems.reduce((sum, item) => sum + item.quantity * (item.book?.weight || 0), 0);

  const addToCart = async (bookId: string, quantity: number = 1) => {
    if (!user) return;

    try {
      const existing = cartItems.find((item) => item.book_id === bookId);

      if (existing) {
        const newQty = existing.quantity + quantity;
        if (existing.book && newQty > existing.book.stock) {
          toast.error(t('cart.stockExceeded'));
          return;
        }

        const { error } = await supabase
          .from('cart_items')
          .update({ quantity: newQty })
          .eq('id', existing.id);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('cart_items')
          .insert({ user_id: user.id, book_id: bookId, quantity });

        if (error) throw error;
      }

      toast.success(t('cart.addedToCart'));
      await fetchCart();
    } catch (error) {
      console.error('Error adding to cart:', error);
      toast.error(t('common.error'));
    }
  };

  const updateQuantity = async (cartItemId: string, quantity: number) => {
    if (quantity <= 0) {
      await removeFromCart(cartItemId);
      return;
    }

    try {
      const { error } = await supabase
        .from('cart_items')
        .update({ quantity })
        .eq('id', cartItemId);

      if (error) throw error;
      await fetchCart();
    } catch (error) {
      console.error('Error updating quantity:', error);
      toast.error(t('common.error'));
    }
  };

  const removeFromCart = async (cartItemId: string) => {
    try {
      const { error } = await supabase
        .from('cart_items')
        .delete()
        .eq('id', cartItemId);

      if (error) throw error;
      toast.success(t('cart.removedFromCart'));
      await fetchCart();
    } catch (error) {
      console.error('Error removing from cart:', error);
      toast.error(t('common.error'));
    }
  };

  const clearCart = async () => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('cart_items')
        .delete()
        .eq('user_id', user.id);

      if (error) throw error;
      setCartItems([]);
    } catch (error) {
      console.error('Error clearing cart:', error);
    }
  };

  return {
    cartItems,
    loading,
    cartCount,
    cartTotal,
    totalWeight,
    addToCart,
    updateQuantity,
    removeFromCart,
    clearCart,
    refreshCart: fetchCart,
  };
}
