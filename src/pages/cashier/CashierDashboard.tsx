import React from 'react';
import { Layout } from '../../components/Layout/Layout';
import { useAuth } from '../../contexts/AuthContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { ScanLine, BookOpen, Calculator } from 'lucide-react';

export function CashierDashboard() {
  const { profile } = useAuth();
  const { t } = useLanguage();

  return (
    <Layout>
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-serif font-bold text-primary-800 dark:text-primary-100">
            Dasbor Kasir
          </h1>
          <p className="text-primary-500 dark:text-primary-400 mt-1">
            Selamat datang, {profile?.full_name}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="glass-card p-8 text-center hover:shadow-medium transition-all cursor-pointer group">
            <div className="w-16 h-16 bg-primary-100 dark:bg-primary-800 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
              <ScanLine className="h-8 w-8 text-primary-600" />
            </div>
            <h3 className="font-serif font-bold text-lg text-primary-800 dark:text-primary-100">
              Transaksi Baru
            </h3>
            <p className="text-sm text-primary-500 dark:text-primary-400 mt-2">
              Proses pembelian langsung di toko
            </p>
          </div>

          <div className="glass-card p-8 text-center hover:shadow-medium transition-all cursor-pointer group">
            <div className="w-16 h-16 bg-secondary-100 dark:bg-secondary-900/30 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
              <BookOpen className="h-8 w-8 text-secondary-600" />
            </div>
            <h3 className="font-serif font-bold text-lg text-primary-800 dark:text-primary-100">
              Cek Stok Buku
            </h3>
            <p className="text-sm text-primary-500 dark:text-primary-400 mt-2">
              Periksa ketersediaan buku
            </p>
          </div>

          <div className="glass-card p-8 text-center hover:shadow-medium transition-all cursor-pointer group">
            <div className="w-16 h-16 bg-accent-100 dark:bg-accent-900/30 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
              <Calculator className="h-8 w-8 text-accent-600" />
            </div>
            <h3 className="font-serif font-bold text-lg text-primary-800 dark:text-primary-100">
              Riwayat Transaksi
            </h3>
            <p className="text-sm text-primary-500 dark:text-primary-400 mt-2">
              Lihat transaksi hari ini
            </p>
          </div>
        </div>
      </div>
    </Layout>
  );
}
