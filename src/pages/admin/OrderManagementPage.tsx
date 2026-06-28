import React, { useEffect, useState } from 'react';
import { Layout } from '../../components/Layout/Layout';
import { LoadingSpinner } from '../../components/Common/LoadingSpinner';
import { Badge } from '../../components/Common/Badge';
import { useAdmin } from '../../hooks/useAdmin';
import { useLanguage } from '../../contexts/LanguageContext';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { ClipboardList } from 'lucide-react';
import toast from 'react-hot-toast';

export function OrderManagementPage() {
  const { recentOrders, loading, fetchRecentOrders, updateOrderStatus, updateTrackingNumber } = useAdmin();
  const { t } = useLanguage();
  const [pageLoading, setPageLoading] = useState(true);

  useEffect(() => {
    fetchRecentOrders().then(() => setPageLoading(false));
  }, [fetchRecentOrders]);

  const handleStatusChange = async (orderId: string, status: string) => {
    try {
      await updateOrderStatus(orderId, status);
      toast.success(t('common.success'));
    } catch {
      toast.error(t('common.error'));
    }
  };

  const statusVariant = (s: string) => {
    const map: Record<string, 'success' | 'warning' | 'error' | 'info'> = {
      pending_payment: 'warning', processing: 'info', shipped: 'info',
      ready_for_pickup: 'info', completed: 'success', cancelled: 'error',
    };
    return map[s] || 'info';
  };

  if (pageLoading) return <Layout><LoadingSpinner /></Layout>;

  return (
    <Layout>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
        <div className="flex items-center gap-3 mb-8">
          <ClipboardList className="h-8 w-8 text-primary-600" />
          <div>
            <h1 className="text-3xl font-serif font-bold text-primary-800 dark:text-primary-100">
              {t('admin.manageOrders')}
            </h1>
            <p className="text-primary-500 dark:text-primary-400">{recentOrders.length} pesanan</p>
          </div>
        </div>

        <div className="glass-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-primary-200 dark:border-primary-700 bg-primary-50 dark:bg-primary-900/50">
                  <th className="text-left px-4 py-3 text-xs font-semibold text-primary-500 uppercase">No. Pesanan</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-primary-500 uppercase">Tanggal</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-primary-500 uppercase">Total</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-primary-500 uppercase">Pembayaran</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-primary-500 uppercase">Status</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-primary-500 uppercase">{t('common.actions')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-primary-100 dark:divide-primary-800">
                {recentOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-primary-50/50 dark:hover:bg-primary-800/30">
                    <td className="px-4 py-3 font-mono text-sm text-primary-700 dark:text-primary-300">
                      {order.order_number}
                    </td>
                    <td className="px-4 py-3 text-sm text-primary-500">{formatDate(order.created_at)}</td>
                    <td className="px-4 py-3 text-sm font-semibold text-primary-700 dark:text-secondary-400">
                      {formatCurrency(order.total_amount)}
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant={order.payment_status === 'paid' ? 'success' : 'warning'} size="sm">
                        {t(`status.${order.payment_status}`)}
                      </Badge>
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant={statusVariant(order.order_status)} size="sm">
                        {t(`status.${order.order_status}`)}
                      </Badge>
                    </td>
                    <td className="px-4 py-3">
                      <select
                        value={order.order_status}
                        onChange={(e) => handleStatusChange(order.id, e.target.value)}
                        className="input-field !w-auto !py-1 !px-2 text-xs"
                      >
                        <option value="pending_payment">Pending Payment</option>
                        <option value="processing">Processing</option>
                        <option value="shipped">Shipped</option>
                        <option value="ready_for_pickup">Ready for Pickup</option>
                        <option value="completed">Completed</option>
                        <option value="cancelled">Cancelled</option>
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </Layout>
  );
}
