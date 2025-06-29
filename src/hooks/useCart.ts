import { useState, useEffect } from 'react';
import { supabase, testConnection } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';

export interface CartItem {
  id: string;
  book_id: string;
  quantity: number;
  book: {
    id: string;
    title: string;
    author: string;
    price: number;
    stock: number;
    cover_image: string | null;
  };
}

export function useCart() {
  const { user } = useAuth();
  const [items, setItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [connectionError, setConnectionError] = useState<string | null>(null);

  const fetchCartItems = async () => {
    if (!user) return;

    setLoading(true);
    setConnectionError(null);
    
    try {
      // Test connection first
      const connectionTest = await testConnection();
      if (!connectionTest.success) {
        throw new Error(`Connection failed: ${connectionTest.message}`);
      }

      const { data, error } = await supabase
        .from('cart_items')
        .select(`
          id,
          book_id,
          quantity,
          book:books (
            id,
            title,
            author,
            price,
            stock,
            cover_image
          )
        `)
        .eq('user_id', user.id);

      if (error) {
        console.error('Supabase error:', error);
        throw new Error(`Database error: ${error.message}`);
      }
      
      setItems(data || []);
    } catch (error) {
      console.error('Error fetching cart items:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      setConnectionError(errorMessage);
      
      if (errorMessage.includes('Failed to fetch') || errorMessage.includes('Connection failed')) {
        toast.error('Unable to connect to the server. Please check your internet connection and try again.');
      } else {
        toast.error('Failed to load cart items');
      }
    } finally {
      setLoading(false);
    }
  };

  const addToCart = async (bookId: string, quantity: number = 1) => {
    if (!user) {
      toast.error('Please log in to add items to cart');
      return;
    }

    try {
      // Test connection first
      const connectionTest = await testConnection();
      if (!connectionTest.success) {
        throw new Error(`Connection failed: ${connectionTest.message}`);
      }

      // First, check if book has enough stock
      const { data: book, error: bookError } = await supabase
        .from('books')
        .select('stock')
        .eq('id', bookId)
        .single();

      if (bookError) {
        console.error('Error fetching book:', bookError);
        throw new Error(`Failed to fetch book data: ${bookError.message}`);
      }

      if (!book || book.stock < quantity) {
        toast.error('Not enough stock available');
        return;
      }

      // Check if item already exists in cart
      const { data: existingItem, error: existingError } = await supabase
        .from('cart_items')
        .select('*')
        .eq('user_id', user.id)
        .eq('book_id', bookId)
        .single();

      if (existingError && existingError.code !== 'PGRST116') {
        console.error('Error checking existing cart item:', existingError);
        throw new Error(`Failed to check cart: ${existingError.message}`);
      }

      if (existingItem) {
        // Update quantity
        const newQuantity = existingItem.quantity + quantity;
        if (book.stock < newQuantity) {
          toast.error('Not enough stock available');
          return;
        }

        const { error } = await supabase
          .from('cart_items')
          .update({ quantity: newQuantity })
          .eq('id', existingItem.id);

        if (error) throw error;
      } else {
        // Add new item
        const { error } = await supabase
          .from('cart_items')
          .insert({
            user_id: user.id,
            book_id: bookId,
            quantity,
          });

        if (error) throw error;
      }

      // Update book stock (reserve stock)
      const { error: stockError } = await supabase
        .from('books')
        .update({ stock: book.stock - quantity })
        .eq('id', bookId);

      if (stockError) throw stockError;

      // Log stock change
      await supabase
        .from('stock_logs')
        .insert({
          book_id: bookId,
          change_type: 'remove',
          quantity_change: -quantity,
          previous_stock: book.stock,
          new_stock: book.stock - quantity,
          user_id: user.id,
          notes: 'Added to cart',
        });

      toast.success('Item added to cart');
      fetchCartItems();
    } catch (error) {
      console.error('Error adding to cart:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      
      if (errorMessage.includes('Failed to fetch') || errorMessage.includes('Connection failed')) {
        toast.error('Unable to connect to the server. Please check your internet connection and try again.');
      } else {
        toast.error('Failed to add item to cart');
      }
    }
  };

  const updateQuantity = async (itemId: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      await removeFromCart(itemId);
      return;
    }

    try {
      // Test connection first
      const connectionTest = await testConnection();
      if (!connectionTest.success) {
        throw new Error(`Connection failed: ${connectionTest.message}`);
      }

      const item = items.find(i => i.id === itemId);
      if (!item) return;

      const quantityDiff = newQuantity - item.quantity;
      
      // Check stock availability
      if (quantityDiff > 0 && item.book.stock < quantityDiff) {
        toast.error('Not enough stock available');
        return;
      }

      // Update cart item
      const { error } = await supabase
        .from('cart_items')
        .update({ quantity: newQuantity })
        .eq('id', itemId);

      if (error) throw error;

      // Update book stock
      const newStock = item.book.stock - quantityDiff;
      const { error: stockError } = await supabase
        .from('books')
        .update({ stock: newStock })
        .eq('id', item.book_id);

      if (stockError) throw stockError;

      // Log stock change
      if (quantityDiff !== 0) {
        await supabase
          .from('stock_logs')
          .insert({
            book_id: item.book_id,
            change_type: quantityDiff > 0 ? 'remove' : 'add',
            quantity_change: -quantityDiff,
            previous_stock: item.book.stock,
            new_stock: newStock,
            user_id: user.id,
            notes: 'Cart quantity updated',
          });
      }

      fetchCartItems();
    } catch (error) {
      console.error('Error updating quantity:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      
      if (errorMessage.includes('Failed to fetch') || errorMessage.includes('Connection failed')) {
        toast.error('Unable to connect to the server. Please check your internet connection and try again.');
      } else {
        toast.error('Failed to update quantity');
      }
    }
  };

  const removeFromCart = async (itemId: string) => {
    try {
      // Test connection first
      const connectionTest = await testConnection();
      if (!connectionTest.success) {
        throw new Error(`Connection failed: ${connectionTest.message}`);
      }

      const item = items.find(i => i.id === itemId);
      if (!item) return;

      // Remove from cart
      const { error } = await supabase
        .from('cart_items')
        .delete()
        .eq('id', itemId);

      if (error) throw error;

      // Return stock
      const newStock = item.book.stock + item.quantity;
      const { error: stockError } = await supabase
        .from('books')
        .update({ stock: newStock })
        .eq('id', item.book_id);

      if (stockError) throw stockError;

      // Log stock change
      await supabase
        .from('stock_logs')
        .insert({
          book_id: item.book_id,
          change_type: 'add',
          quantity_change: item.quantity,
          previous_stock: item.book.stock,
          new_stock: newStock,
          user_id: user.id,
          notes: 'Removed from cart',
        });

      toast.success('Item removed from cart');
      fetchCartItems();
    } catch (error) {
      console.error('Error removing from cart:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      
      if (errorMessage.includes('Failed to fetch') || errorMessage.includes('Connection failed')) {
        toast.error('Unable to connect to the server. Please check your internet connection and try again.');
      } else {
        toast.error('Failed to remove item from cart');
      }
    }
  };

  const clearCart = async () => {
    if (!user) return;

    try {
      // Test connection first
      const connectionTest = await testConnection();
      if (!connectionTest.success) {
        throw new Error(`Connection failed: ${connectionTest.message}`);
      }

      // Return all stock first
      for (const item of items) {
        const newStock = item.book.stock + item.quantity;
        await supabase
          .from('books')
          .update({ stock: newStock })
          .eq('id', item.book_id);

        // Log stock change
        await supabase
          .from('stock_logs')
          .insert({
            book_id: item.book_id,
            change_type: 'add',
            quantity_change: item.quantity,
            previous_stock: item.book.stock,
            new_stock: newStock,
            user_id: user.id,
            notes: 'Cart cleared',
          });
      }

      // Clear cart
      const { error } = await supabase
        .from('cart_items')
        .delete()
        .eq('user_id', user.id);

      if (error) throw error;

      setItems([]);
      toast.success('Cart cleared');
    } catch (error) {
      console.error('Error clearing cart:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      
      if (errorMessage.includes('Failed to fetch') || errorMessage.includes('Connection failed')) {
        toast.error('Unable to connect to the server. Please check your internet connection and try again.');
      } else {
        toast.error('Failed to clear cart');
      }
    }
  };

  const checkout = async () => {
    if (!user || items.length === 0) return;

    try {
      // Test connection first
      const connectionTest = await testConnection();
      if (!connectionTest.success) {
        throw new Error(`Connection failed: ${connectionTest.message}`);
      }

      const totalAmount = items.reduce((sum, item) => sum + (item.book.price * item.quantity), 0);

      // Create transaction
      const { data: transaction, error: transactionError } = await supabase
        .from('transactions')
        .insert({
          user_id: user.id,
          total_amount: totalAmount,
          status: 'completed',
        })
        .select()
        .single();

      if (transactionError) throw transactionError;

      // Create transaction items
      const transactionItems = items.map(item => ({
        transaction_id: transaction.id,
        book_id: item.book_id,
        quantity: item.quantity,
        price: item.book.price,
      }));

      const { error: itemsError } = await supabase
        .from('transaction_items')
        .insert(transactionItems);

      if (itemsError) throw itemsError;

      // Clear cart (stock is already deducted)
      const { error: cartError } = await supabase
        .from('cart_items')
        .delete()
        .eq('user_id', user.id);

      if (cartError) throw cartError;

      // Log purchases
      for (const item of items) {
        await supabase
          .from('stock_logs')
          .insert({
            book_id: item.book_id,
            change_type: 'purchase',
            quantity_change: -item.quantity,
            previous_stock: item.book.stock + item.quantity,
            new_stock: item.book.stock,
            user_id: user.id,
            notes: `Transaction #${transaction.id}`,
          });
      }

      setItems([]);
      toast.success('Purchase completed successfully!');
      return transaction.id;
    } catch (error) {
      console.error('Error during checkout:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      
      if (errorMessage.includes('Failed to fetch') || errorMessage.includes('Connection failed')) {
        toast.error('Unable to connect to the server. Please check your internet connection and try again.');
      } else {
        toast.error('Failed to complete purchase');
      }
      throw error;
    }
  };

  useEffect(() => {
    fetchCartItems();
  }, [user]);

  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
  const totalAmount = items.reduce((sum, item) => sum + (item.book.price * item.quantity), 0);

  return {
    items,
    loading,
    connectionError,
    totalItems,
    totalAmount,
    addToCart,
    updateQuantity,
    removeFromCart,
    clearCart,
    checkout,
    refreshCart: fetchCartItems,
  };
}