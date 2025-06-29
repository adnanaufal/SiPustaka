import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';

export interface WishlistItem {
  id: string;
  book_id: string;
  book: {
    id: string;
    title: string;
    author: string;
    price: number;
    stock: number;
    cover_image: string | null;
    category: string;
    year: number;
    description: string;
  };
}

export function useWishlist() {
  const { user } = useAuth();
  const [items, setItems] = useState<WishlistItem[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchWishlistItems = async () => {
    if (!user) return;

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('wishlist_items')
        .select(`
          id,
          book_id,
          book:books (
            id,
            title,
            author,
            price,
            stock,
            cover_image,
            category,
            year,
            description
          )
        `)
        .eq('user_id', user.id);

      if (error) throw error;
      setItems(data || []);
    } catch (error) {
      console.error('Error fetching wishlist items:', error);
      toast.error('Failed to load wishlist items');
    } finally {
      setLoading(false);
    }
  };

  const addToWishlist = async (bookId: string) => {
    if (!user) {
      toast.error('Please log in to add items to wishlist');
      return;
    }

    try {
      // Check if item already exists in wishlist
      const { data: existingItems } = await supabase
        .from('wishlist_items')
        .select('*')
        .eq('user_id', user.id)
        .eq('book_id', bookId);

      if (existingItems && existingItems.length > 0) {
        toast.error('Item already in wishlist');
        return;
      }

      // Add new item
      const { error } = await supabase
        .from('wishlist_items')
        .insert({
          user_id: user.id,
          book_id: bookId,
        });

      if (error) throw error;

      toast.success('Item added to wishlist');
      fetchWishlistItems();
    } catch (error) {
      console.error('Error adding to wishlist:', error);
      toast.error('Failed to add item to wishlist');
    }
  };

  const removeFromWishlist = async (itemId: string) => {
    try {
      const { error } = await supabase
        .from('wishlist_items')
        .delete()
        .eq('id', itemId);

      if (error) throw error;

      toast.success('Item removed from wishlist');
      fetchWishlistItems();
    } catch (error) {
      console.error('Error removing from wishlist:', error);
      toast.error('Failed to remove item from wishlist');
    }
  };

  const removeFromWishlistByBookId = async (bookId: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('wishlist_items')
        .delete()
        .eq('user_id', user.id)
        .eq('book_id', bookId);

      if (error) throw error;

      toast.success('Item removed from wishlist');
      fetchWishlistItems();
    } catch (error) {
      console.error('Error removing from wishlist:', error);
      toast.error('Failed to remove item from wishlist');
    }
  };

  const isInWishlist = (bookId: string): boolean => {
    return items.some(item => item.book_id === bookId);
  };

  const clearWishlist = async () => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('wishlist_items')
        .delete()
        .eq('user_id', user.id);

      if (error) throw error;

      setItems([]);
      toast.success('Wishlist cleared');
    } catch (error) {
      console.error('Error clearing wishlist:', error);
      toast.error('Failed to clear wishlist');
    }
  };

  useEffect(() => {
    fetchWishlistItems();
  }, [user]);

  const totalItems = items.length;

  return {
    items,
    loading,
    totalItems,
    addToWishlist,
    removeFromWishlist,
    removeFromWishlistByBookId,
    isInWishlist,
    clearWishlist,
    refreshWishlist: fetchWishlistItems,
  };
}