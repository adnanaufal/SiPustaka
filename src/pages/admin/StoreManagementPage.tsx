import React, { useEffect, useState } from 'react';
import { Layout } from '../../components/Layout/Layout';
import { LoadingSpinner } from '../../components/Common/LoadingSpinner';
import { Badge } from '../../components/Common/Badge';
import { useStoreLocations } from '../../hooks/useStoreLocations';
import { useLanguage } from '../../contexts/LanguageContext';
import { Store, MapPin, Phone, Clock } from 'lucide-react';

export function StoreManagementPage() {
  const { storeLocations, loading, fetchStoreLocations } = useStoreLocations();
  const { t } = useLanguage();

  useEffect(() => {
    fetchStoreLocations(false);
  }, [fetchStoreLocations]);

  if (loading) return <Layout><LoadingSpinner /></Layout>;

  return (
    <Layout>
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <Store className="h-8 w-8 text-primary-600" />
            <div>
              <h1 className="text-3xl font-serif font-bold text-primary-800 dark:text-primary-100">
                {t('store.management')}
              </h1>
              <p className="text-primary-500 dark:text-primary-400">{storeLocations.length} toko terdaftar</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {storeLocations.map((store) => (
            <div key={store.id} className="glass-card p-6">
              <div className="flex items-start justify-between mb-3">
                <h3 className="font-serif font-bold text-lg text-primary-800 dark:text-primary-100">
                  {store.name}
                </h3>
                <Badge variant={store.is_active ? 'success' : 'error'}>
                  {store.is_active ? t('store.active') : t('store.inactive')}
                </Badge>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex items-start gap-2 text-primary-600 dark:text-primary-400">
                  <MapPin className="h-4 w-4 mt-0.5 flex-shrink-0" />
                  <span>{store.address}, {store.city}, {store.province}</span>
                </div>
                {store.phone && (
                  <div className="flex items-center gap-2 text-primary-600 dark:text-primary-400">
                    <Phone className="h-4 w-4 flex-shrink-0" />
                    <span>{store.phone}</span>
                  </div>
                )}
                {store.operating_hours && (
                  <div className="flex items-center gap-2 text-primary-600 dark:text-primary-400">
                    <Clock className="h-4 w-4 flex-shrink-0" />
                    <span>{store.operating_hours}</span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </Layout>
  );
}
