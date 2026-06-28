import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import type { StoreLocation } from '../lib/supabase';

export function useStoreLocations() {
  const [storeLocations, setStoreLocations] = useState<StoreLocation[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchStoreLocations = useCallback(async (activeOnly = true) => {
    try {
      let query = supabase.from('store_locations').select('*').order('name');

      if (activeOnly) {
        query = query.eq('is_active', true);
      }

      const { data, error } = await query;
      if (error) throw error;
      setStoreLocations((data as StoreLocation[]) || []);
    } catch (error) {
      console.error('Error fetching store locations:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStoreLocations();
  }, [fetchStoreLocations]);

  const addStore = async (storeData: Omit<StoreLocation, 'id' | 'created_at'>) => {
    const { error } = await supabase.from('store_locations').insert(storeData);
    if (error) throw error;
    await fetchStoreLocations(false);
  };

  const updateStore = async (id: string, storeData: Partial<StoreLocation>) => {
    const { error } = await supabase.from('store_locations').update(storeData).eq('id', id);
    if (error) throw error;
    await fetchStoreLocations(false);
  };

  const deleteStore = async (id: string) => {
    const { error } = await supabase.from('store_locations').delete().eq('id', id);
    if (error) throw error;
    await fetchStoreLocations(false);
  };

  return {
    storeLocations,
    loading,
    fetchStoreLocations,
    addStore,
    updateStore,
    deleteStore,
  };
}
