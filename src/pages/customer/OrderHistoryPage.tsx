import React from 'react';
import { Layout } from '../../components/Layout/Layout';
import { EmptyState } from '../../components/Common/EmptyState';
import { LoadingSpinner } from '../../components/Common/LoadingSpinner';
import { Badge } from '../../components/Common/Badge';
import { useOrders } from '../../hooks/useOrders';
import { useLanguage } from '../../contexts/LanguageContext';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { Package, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export function OrderHistoryPage() {
  const { orders, loading } = useOrders();
  const { t } = useLanguage();

  const statusVariant = (status: string) => {
    const map: Record<string, 'success' | 'warning' | 'error' | 'info' | 'neutral'> = {
      pending_payment: 'warning', processing: 'info', shipped: 'info',
      ready_for_pickup: 'info', completed: 'success', cancelled: 'error',
    };
    return map[status] || 'neutral';
  };

  if (loading) return <Layout><LoadingSpinner text={t('common.loading')} /></Layout>;

  return (
    <Layout>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
        <h1 className="text-3xl font-serif font-bold text-primary-800 dark:text-primary-100 mb-8">
          {t('order.title')}
        </h1>

        {orders.length === 0 ? (
          <EmptyState
            icon={<Package className="h-16 w-16" />}
            title={t('order.noOrders')}
            description={t('order.startShopping')}
            action={<Link to="/customer" className="btn-primary">{t('home.getStarted')}</Link>}
          />
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <Link
                key={order.id}
                to={`/customer/orders/${order.id}`}
                className="glass-card p-5 flex items-center justify-between hover:shadow-medium transition-all group"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="font-mono text-sm font-semibold text-primary-700 dark:text-primary-300">
                      {order.order_number}
                    </span>
                    <Badge variant={statusVariant(order.order_status)}>
                      {t(`status.${order.order_status}`)}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-primary-500 dark:text-primary-400">
                    <span>{formatDate(order.created_at)}</span>
                    <span className="font-semibold text-primary-700 dark:text-secondary-400">
                      {formatCurrency(order.total_amount)}
                    </span>
                  </div>
                </div>
                <ChevronRight className="h-5 w-5 text-primary-400 group-hover:text-primary-600 transition-colors" />
              </Link>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}
