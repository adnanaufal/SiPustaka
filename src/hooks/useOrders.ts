import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import type { Order, OrderItem, Book } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

export function useOrders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  const fetchOrders = useCallback(async () => {
    if (!user) {
      setOrders([]);
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setOrders((data as Order[]) || []);
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const getOrderById = async (id: string): Promise<Order | null> => {
    try {
      const { data: orderData, error: orderError } = await supabase
        .from('orders')
        .select('*, shipping_address:shipping_addresses(*), store_location:store_locations(*)')
        .eq('id', id)
        .single();

      if (orderError) throw orderError;

      const { data: itemsData, error: itemsError } = await supabase
        .from('order_items')
        .select('*, book:books(*)')
        .eq('order_id', id);

      if (itemsError) throw itemsError;

      return {
        ...orderData,
        items: itemsData as (OrderItem & { book: Book })[],
      } as Order;
    } catch (error) {
      console.error('Error fetching order:', error);
      return null;
    }
  };

  const cancelOrder = async (orderId: string) => {
    const { error } = await supabase
      .from('orders')
      .update({
        order_status: 'cancelled',
        payment_status: 'refunded',
      })
      .eq('id', orderId)
      .eq('order_status', 'pending_payment');

    if (error) throw error;
    await fetchOrders();
  };

  return {
    orders,
    loading,
    fetchOrders,
    getOrderById,
    cancelOrder,
  };
}
