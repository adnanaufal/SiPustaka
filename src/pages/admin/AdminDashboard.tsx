import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  BookOpen, Users, DollarSign, Package,
  TrendingUp, AlertTriangle, ClipboardList, Store, UserCog
} from 'lucide-react';
import { Layout } from '../../components/Layout/Layout';
import { LoadingSpinner } from '../../components/Common/LoadingSpinner';
import { Badge } from '../../components/Common/Badge';
import { useAdmin } from '../../hooks/useAdmin';
import { useBooks } from '../../hooks/useBooks';
import { useLanguage } from '../../contexts/LanguageContext';
import { formatCurrency, formatDate } from '../../utils/formatters';

export function AdminDashboard() {
  const { stats, recentOrders, loading, fetchDashboardStats, fetchRecentOrders } = useAdmin();
  const { books } = useBooks();
  const { t } = useLanguage();

  useEffect(() => {
    fetchDashboardStats();
    fetchRecentOrders();
  }, [fetchDashboardStats, fetchRecentOrders]);

  const lowStockBooks = books.filter((b) => b.stock <= 5 && b.stock > 0);

  if (loading) return <Layout><LoadingSpinner text={t('admin.loadingDashboard')} /></Layout>;

  const statCards = [
    { label: t('admin.totalBooks'), value: stats.totalBooks, icon: BookOpen, color: 'text-primary-600', bg: 'bg-primary-100 dark:bg-primary-800' },
    { label: t('admin.totalUsers'), value: stats.totalUsers, icon: Users, color: 'text-accent-600', bg: 'bg-accent-100 dark:bg-accent-900/30' },
    { label: t('admin.transactions'), value: stats.totalOrders, icon: Package, color: 'text-secondary-600', bg: 'bg-secondary-100 dark:bg-secondary-900/30' },
    { label: t('admin.revenue'), value: formatCurrency(stats.totalRevenue), icon: DollarSign, color: 'text-accent-600', bg: 'bg-accent-100 dark:bg-accent-900/30' },
  ];

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-serif font-bold text-primary-800 dark:text-primary-100">
            {t('admin.dashboard')}
          </h1>
          <p className="text-primary-500 dark:text-primary-400 mt-1">{t('admin.manageOperations')}</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {statCards.map((stat) => (
            <div key={stat.label} className="glass-card p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-primary-500 dark:text-primary-400">{stat.label}</p>
                  <p className="text-2xl font-bold text-primary-800 dark:text-primary-100 mt-1">
                    {stat.value}
                  </p>
                </div>
                <div className={`p-3 rounded-xl ${stat.bg}`}>
                  <stat.icon className={`h-6 w-6 ${stat.color}`} />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Quick actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Link to="/admin/users" className="glass-card p-5 hover:shadow-medium transition-all group">
            <UserCog className="h-8 w-8 text-primary-500 group-hover:text-primary-600 transition-colors mb-3" />
            <h3 className="font-semibold text-primary-800 dark:text-primary-100">{t('admin.manageUsers')}</h3>
            <p className="text-sm text-primary-500 dark:text-primary-400 mt-1">Kelola role dan akses pengguna</p>
          </Link>
          <Link to="/admin/stores" className="glass-card p-5 hover:shadow-medium transition-all group">
            <Store className="h-8 w-8 text-secondary-500 group-hover:text-secondary-600 transition-colors mb-3" />
            <h3 className="font-semibold text-primary-800 dark:text-primary-100">{t('admin.manageStores')}</h3>
            <p className="text-sm text-primary-500 dark:text-primary-400 mt-1">Kelola lokasi toko fisik</p>
          </Link>
          <Link to="/admin/orders" className="glass-card p-5 hover:shadow-medium transition-all group">
            <ClipboardList className="h-8 w-8 text-accent-500 group-hover:text-accent-600 transition-colors mb-3" />
            <h3 className="font-semibold text-primary-800 dark:text-primary-100">{t('admin.manageOrders')}</h3>
            <p className="text-sm text-primary-500 dark:text-primary-400 mt-1">Proses dan lacak semua pesanan</p>
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Low stock alert */}
          <div className="glass-card p-6">
            <div className="flex items-center gap-2 mb-4">
              <AlertTriangle className="h-5 w-5 text-warning-500" />
              <h2 className="font-serif font-bold text-primary-800 dark:text-primary-100">
                {t('admin.lowStockBooks')}
              </h2>
            </div>
            {lowStockBooks.length === 0 ? (
              <p className="text-primary-500 text-sm">{t('admin.noLowStockBooks')}</p>
            ) : (
              <div className="space-y-3">
                {lowStockBooks.slice(0, 5).map((book) => (
                  <div key={book.id} className="flex items-center justify-between text-sm">
                    <span className="text-primary-700 dark:text-primary-300 truncate mr-3">{book.title}</span>
                    <Badge variant="warning">{book.stock} {t('book.left')}</Badge>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Recent orders */}
          <div className="glass-card p-6">
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp className="h-5 w-5 text-accent-500" />
              <h2 className="font-serif font-bold text-primary-800 dark:text-primary-100">
                {t('admin.recentOrders')}
              </h2>
            </div>
            {recentOrders.length === 0 ? (
              <p className="text-primary-500 text-sm">{t('common.noData')}</p>
            ) : (
              <div className="space-y-3">
                {recentOrders.slice(0, 5).map((order) => (
                  <div key={order.id} className="flex items-center justify-between text-sm">
                    <div>
                      <span className="font-mono text-primary-700 dark:text-primary-300">{order.order_number}</span>
                      <span className="text-primary-500 ml-2">{formatDate(order.created_at)}</span>
                    </div>
                    <span className="font-semibold text-primary-700 dark:text-secondary-400">
                      {formatCurrency(order.total_amount)}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}
