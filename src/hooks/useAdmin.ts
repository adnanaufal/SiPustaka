import { useState, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import type { UserProfile, StockLog, Order } from '../lib/supabase';

interface DashboardStats {
  totalBooks: number;
  totalUsers: number;
  totalOrders: number;
  totalRevenue: number;
}

export function useAdmin() {
  const [stats, setStats] = useState<DashboardStats>({
    totalBooks: 0,
    totalUsers: 0,
    totalOrders: 0,
    totalRevenue: 0,
  });
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [stockLogs, setStockLogs] = useState<StockLog[]>([]);
  const [recentOrders, setRecentOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchDashboardStats = useCallback(async () => {
    setLoading(true);
    try {
      const [booksRes, usersRes, ordersRes] = await Promise.all([
        supabase.from('books').select('id', { count: 'exact', head: true }),
        supabase.from('users').select('id', { count: 'exact', head: true }),
        supabase.from('orders').select('total_amount, payment_status'),
      ]);

      const paidOrders = (ordersRes.data || []).filter(
        (o: { payment_status: string }) => o.payment_status === 'paid'
      );
      const totalRevenue = paidOrders.reduce(
        (sum: number, o: { total_amount: number }) => sum + o.total_amount,
        0
      );

      setStats({
        totalBooks: booksRes.count || 0,
        totalUsers: usersRes.count || 0,
        totalOrders: paidOrders.length,
        totalRevenue,
      });
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchAllUsers = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setUsers((data as UserProfile[]) || []);
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  }, []);

  const updateUserRole = async (userId: string, role: string) => {
    const { error } = await supabase
      .from('users')
      .update({ role })
      .eq('id', userId);

    if (error) throw error;
    await fetchAllUsers();
  };

  const createUser = async (payload: { email: string; password?: string; full_name: string; role: string }) => {
    const { data, error } = await supabase.functions.invoke('manage-users', {
      body: { action: 'create', ...payload },
    });
    if (error) throw error;
    if (data.error) throw new Error(data.error);
    await fetchAllUsers();
  };

  const deleteUser = async (userId: string) => {
    const { data, error } = await supabase.functions.invoke('manage-users', {
      body: { action: 'delete', userId },
    });
    if (error) throw error;
    if (data.error) throw new Error(data.error);
    await fetchAllUsers();
  };

  const fetchStockLogs = useCallback(async (bookId?: string) => {
    try {
      let query = supabase
        .from('stock_logs')
        .select('*, book:books(title), user:users(full_name)')
        .order('created_at', { ascending: false })
        .limit(50);

      if (bookId) {
        query = query.eq('book_id', bookId);
      }

      const { data, error } = await query;
      if (error) throw error;
      setStockLogs((data as StockLog[]) || []);
    } catch (error) {
      console.error('Error fetching stock logs:', error);
    }
  }, []);

  const fetchRecentOrders = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) throw error;
      setRecentOrders((data as Order[]) || []);
    } catch (error) {
      console.error('Error fetching recent orders:', error);
    }
  }, []);

  const updateOrderStatus = async (orderId: string, orderStatus: string) => {
    const { error } = await supabase
      .from('orders')
      .update({ order_status: orderStatus })
      .eq('id', orderId);

    if (error) throw error;
    await fetchRecentOrders();
  };

  const updateTrackingNumber = async (orderId: string, trackingNumber: string) => {
    const { error } = await supabase
      .from('orders')
      .update({ tracking_number: trackingNumber, order_status: 'shipped' })
      .eq('id', orderId);

    if (error) throw error;
    await fetchRecentOrders();
  };

  return {
    stats,
    users,
    stockLogs,
    recentOrders,
    loading,
    fetchDashboardStats,
    fetchAllUsers,
    updateUserRole,
    createUser,
    deleteUser,
    fetchStockLogs,
    fetchRecentOrders,
    updateOrderStatus,
    updateTrackingNumber,
  };
}
