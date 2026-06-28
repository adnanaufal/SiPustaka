import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Clock, CreditCard, XCircle, Package } from 'lucide-react';
import { Layout } from '../../components/Layout/Layout';
import { LoadingSpinner } from '../../components/Common/LoadingSpinner';
import { Badge } from '../../components/Common/Badge';
import { useOrders } from '../../hooks/useOrders';
import { useLanguage } from '../../contexts/LanguageContext';
import { formatCurrency, formatDateTime } from '../../utils/formatters';
import type { Order } from '../../lib/supabase';
import { supabase } from '../../lib/supabase';
import toast from 'react-hot-toast';

export function OrderDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { getOrderById } = useOrders();
  const { t } = useLanguage();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeLeft, setTimeLeft] = useState<number>(0);
  const [processingPayment, setProcessingPayment] = useState(false);
  const [cancellingOrder, setCancellingOrder] = useState(false);

  useEffect(() => {
    if (!id) return;

    getOrderById(id).then((data) => {
      setOrder(data);
      setLoading(false);
    });

    // Realtime listener for order status changes (webhook updates)
    const channel = supabase
      .channel(`order-updates-${id}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'orders',
          filter: `id=eq.${id}`,
        },
        async () => {
          const updated = await getOrderById(id);
          if (updated) setOrder(updated);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [id, getOrderById]);

  // Timeout logic (Auto-cancel after 24 hours of creation)
  useEffect(() => {
    if (order && order.order_status === 'pending_payment') {
      const calculateTimeLeft = () => {
        const createdTime = new Date(order.created_at).getTime();
        const expiryTime = createdTime + 24 * 60 * 60 * 1000; // 24 hours expiry
        const now = Date.now();
        const diff = expiryTime - now;
        return diff > 0 ? diff : 0;
      };

      setTimeLeft(calculateTimeLeft());

      const timer = setInterval(async () => {
        const remaining = calculateTimeLeft();
        setTimeLeft(remaining);

        if (remaining <= 0) {
          clearInterval(timer);
          try {
            await supabase
              .from('orders')
              .update({ order_status: 'cancelled' })
              .eq('id', order.id);

            const updatedOrder = await getOrderById(order.id);
            if (updatedOrder) setOrder(updatedOrder);
            toast.error('Pesanan dibatalkan otomatis karena batas waktu pembayaran habis.');
          } catch (err) {
            console.error('Error auto-cancelling order:', err);
          }
        }
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [order, getOrderById]);

  if (loading) return <Layout><LoadingSpinner /></Layout>;
  if (!order) return <Layout><div className="p-8 text-center text-primary-500">Order tidak ditemukan</div></Layout>;

  const statusVariant = (s: string) => {
    const map: Record<string, 'success' | 'warning' | 'error' | 'info'> = {
      pending_payment: 'warning',
      processing: 'info',
      shipped: 'info',
      ready_for_pickup: 'info',
      completed: 'success',
      cancelled: 'error',
    };
    return map[s] || 'info';
  };

  const formatTimeLeft = (milliseconds: number) => {
    const totalSeconds = Math.floor(milliseconds / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  };

  const handlePayNow = async () => {
    if (!order) return;
    setProcessingPayment(true);

    let token = order.snap_token;

    if (!token) {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        const email = user?.email || 'customer@sipustaka.com';
        const name = user?.user_metadata?.full_name || 'Pelanggan';

        // Prepare item payload matching exact sum logic (includes shipping cost item)
        const itemsPayload = [
          ...(order.items?.map((item) => ({
            name: (item.book?.title || 'Buku').substring(0, 50),
            price: item.price,
            quantity: item.quantity,
          })) || []),
          ...(order.shipping_cost > 0 ? [{
            name: `Ongkir Kurir`,
            price: order.shipping_cost,
            quantity: 1,
          }] : [])
        ];

        const { data, error } = await supabase.functions.invoke('create-payment', {
          body: {
            order_id: order.id,
            order_number: order.order_number,
            gross_amount: order.total_amount,
            customer_name: name,
            customer_email: email,
            items: itemsPayload,
          },
        });

        if (error) throw error;
        token = data.token;

        // Save token to DB
        await supabase
          .from('orders')
          .update({ snap_token: token, midtrans_order_id: order.order_number })
          .eq('id', order.id);

        setOrder({ ...order, snap_token: token });
      } catch (err) {
        console.error('Error generating snap token:', err);
        toast.error('Gagal memproses pembayaran');
        setProcessingPayment(false);
        return;
      }
    }

    if (token && window.snap) {
      setProcessingPayment(false);
      window.snap.pay(token, {
        onSuccess: async () => {
          toast.success('Pembayaran sukses!');
          const updated = await getOrderById(order.id);
          if (updated) setOrder(updated);
        },
        onPending: async () => {
          toast.success('Menunggu pembayaran.');
          const updated = await getOrderById(order.id);
          if (updated) setOrder(updated);
        },
        onError: () => {
          toast.error('Pembayaran gagal.');
        },
        onClose: () => {
          toast.error('Pembayaran ditunda/dibatalkan.');
        },
      });
    } else {
      setProcessingPayment(false);
      toast.error('Sistem Midtrans Snap tidak ter-load');
    }
  };

  const handleCancelOrder = async () => {
    if (!order) return;
    if (!window.confirm('Apakah Anda yakin ingin membatalkan pesanan ini?')) return;

    setCancellingOrder(true);
    try {
      const { error } = await supabase
        .from('orders')
        .update({ order_status: 'cancelled' })
        .eq('id', order.id);

      if (error) throw error;
      toast.success('Pesanan berhasil dibatalkan');

      const updated = await getOrderById(order.id);
      if (updated) setOrder(updated);
    } catch (err) {
      console.error('Error cancelling order:', err);
      toast.error('Gagal membatalkan pesanan');
    } finally {
      setCancellingOrder(false);
    }
  };

  return (
    <Layout>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
        <Link to="/customer/orders" className="inline-flex items-center gap-2 text-primary-600 dark:text-primary-400 hover:text-primary-700 mb-6">
          <ArrowLeft className="h-4 w-4" /> {t('common.back')}
        </Link>

        <div className="flex items-center gap-4 mb-8">
          <h1 className="text-2xl font-serif font-bold text-primary-800 dark:text-primary-100">
            {t('order.orderDetail')}
          </h1>
          <Badge variant={statusVariant(order.order_status)} size="md">
            {t(`status.${order.order_status}`)}
          </Badge>
        </div>

        <div className="space-y-6">
          {/* Unpaid Warning & Actions */}
          {order.order_status === 'pending_payment' && (
            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6 flex flex-col md:flex-row md:items-center justify-between gap-6 animate-pulse">
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-amber-800 font-semibold">
                  <Clock className="h-5 w-5" />
                  <span>Menunggu Pembayaran</span>
                </div>
                <p className="text-sm text-amber-700">
                  Selesaikan pembayaran Anda sebelum waktu habis.
                </p>
                <div className="text-sm font-bold text-amber-800 bg-amber-100/50 inline-block px-3 py-1 rounded-lg">
                  Sisa Waktu: {formatTimeLeft(timeLeft)}
                </div>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={handleCancelOrder}
                  disabled={cancellingOrder}
                  className="btn-outline border-amber-300 text-amber-700 hover:bg-amber-100/50 flex items-center gap-1.5 !py-2.5 !px-4"
                >
                  <XCircle className="h-4 w-4" />
                  Batalkan
                </button>
                <button
                  onClick={handlePayNow}
                  disabled={processingPayment}
                  className="btn-secondary bg-amber-600 hover:bg-amber-700 text-white flex items-center gap-1.5 !py-2.5 !px-5"
                >
                  <CreditCard className="h-4 w-4" />
                  Bayar Sekarang
                </button>
              </div>
            </div>
          )}

          {/* Order info */}
          <div className="glass-card p-6">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-primary-500">{t('order.orderNumber')}</span>
                <p className="font-mono font-semibold text-primary-800 dark:text-primary-200">{order.order_number}</p>
              </div>
              <div>
                <span className="text-primary-500">{t('order.orderDate')}</span>
                <p className="font-semibold text-primary-800 dark:text-primary-200">{formatDateTime(order.created_at)}</p>
              </div>
              {order.tracking_number && (
                <div className="col-span-2">
                  <span className="text-primary-500">{t('order.trackingNumber')}</span>
                  <p className="font-mono font-semibold text-primary-800 dark:text-primary-200">{order.tracking_number}</p>
                </div>
              )}
            </div>
          </div>

          {/* Items */}
          <div className="glass-card p-6">
            <h2 className="font-semibold text-primary-800 dark:text-primary-100 mb-4">Items</h2>
            <div className="space-y-3">
              {order.items?.map((item) => (
                <div key={item.id} className="flex items-center gap-3">
                  <div className="w-12 h-16 rounded-lg overflow-hidden bg-primary-100 dark:bg-primary-800 flex-shrink-0">
                    {item.book?.cover_image && (
                      <img src={item.book.cover_image} alt="" className="w-full h-full object-cover" />
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-primary-800 dark:text-primary-200">{item.book?.title}</p>
                    <p className="text-sm text-primary-500">× {item.quantity}</p>
                  </div>
                  <span className="font-semibold text-primary-700 dark:text-primary-300">
                    {formatCurrency(item.price * item.quantity)}
                  </span>
                </div>
              ))}
            </div>

            <div className="border-t border-primary-200 dark:border-primary-700 mt-4 pt-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-primary-500">{t('cart.subtotal')}</span>
                <span>{formatCurrency(order.subtotal)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-primary-500">{t('checkout.shippingCost')}</span>
                <span>{formatCurrency(order.shipping_cost)}</span>
              </div>
              <div className="flex justify-between font-bold text-lg pt-2 border-t border-primary-200 dark:border-primary-700">
                <span>{t('cart.total')}</span>
                <span className="text-primary-700 dark:text-secondary-400">{formatCurrency(order.total_amount)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
