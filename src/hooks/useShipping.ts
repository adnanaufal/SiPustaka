import { useState, useCallback } from 'react';
import { supabase } from '../lib/supabase';

interface City {
  city_id: string;
  city_name: string;
  province: string;
  type: string;
  postal_code: string;
}

interface ShippingService {
  service: string;
  description: string;
  cost: number;
  etd: string;
}

export function useShipping() {
  const [cities, setCities] = useState<City[]>([]);
  const [loadingCities, setLoadingCities] = useState(false);
  const [shippingServices, setShippingServices] = useState<ShippingService[]>([]);
  const [loadingCost, setLoadingCost] = useState(false);

  const availableCouriers = [
    { code: 'jne', name: 'JNE' },
    { code: 'tiki', name: 'TIKI' },
    { code: 'pos', name: 'POS Indonesia' },
  ];

  const getCities = useCallback(async (search?: string) => {
    setLoadingCities(true);
    try {
      const { data, error } = await supabase.functions.invoke('get-cities', {
        body: { search: search || '' },
      });

      if (error) throw error;
      setCities((data?.cities || []) as City[]);
      return (data?.cities || []) as City[];
    } catch (error) {
      console.error('Error fetching cities:', error);
      return [];
    } finally {
      setLoadingCities(false);
    }
  }, []);

  const checkCost = useCallback(async (
    origin: number,
    destination: number,
    weight: number,
    courier: string
  ) => {
    setLoadingCost(true);
    try {
      const { data, error } = await supabase.functions.invoke('check-shipping', {
        body: { origin, destination, weight, courier },
      });

      if (error) throw error;

      const services: ShippingService[] = (data?.results || []).map(
        (r: { service: string; description: string; cost: { value: number; etd: string }[] }) => ({
          service: r.service,
          description: r.description,
          cost: r.cost[0]?.value || 0,
          etd: r.cost[0]?.etd || '-',
        })
      );

      setShippingServices(services);
      return services;
    } catch (error) {
      console.error('Error checking shipping cost:', error);
      return [];
    } finally {
      setLoadingCost(false);
    }
  }, []);

  return {
    cities,
    loadingCities,
    shippingServices,
    loadingCost,
    availableCouriers,
    getCities,
    checkCost,
  };
}
