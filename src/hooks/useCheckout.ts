import { useState } from 'react';
import { supabase } from '../lib/supabase';
import type { ShippingAddress, Order } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { generateOrderNumber } from '../utils/formatters';
import toast from 'react-hot-toast';

export type CheckoutStep = 'shipping' | 'payment' | 'confirmation';

interface ShippingCostResult {
  service: string;
  description: string;
  cost: number;
  etd: string;
}

interface CheckoutState {
  step: CheckoutStep;
  deliveryMethod: 'shipping' | 'pickup';
  selectedAddressId: string | null;
  selectedStoreId: string | null;
  courierCode: string;
  courierService: string;
  shippingCost: number;
  shippingOptions: ShippingCostResult[];
}

export function useCheckout() {
  const { user } = useAuth();
  const [addresses, setAddresses] = useState<ShippingAddress[]>([]);
  const [loadingAddresses, setLoadingAddresses] = useState(false);
  const [loadingShipping, setLoadingShipping] = useState(false);
  const [creatingOrder, setCreatingOrder] = useState(false);

  const [checkoutState, setCheckoutState] = useState<CheckoutState>({
    step: 'shipping',
    deliveryMethod: 'shipping',
    selectedAddressId: null,
    selectedStoreId: null,
    courierCode: '',
    courierService: '',
    shippingCost: 0,
    shippingOptions: [],
  });

  const updateCheckout = (updates: Partial<CheckoutState>) => {
    setCheckoutState((prev) => ({ ...prev, ...updates }));
  };

  const fetchAddresses = async () => {
    if (!user) return;
    setLoadingAddresses(true);

    try {
      const { data, error } = await supabase
        .from('shipping_addresses')
        .select('*')
        .eq('user_id', user.id)
        .order('is_default', { ascending: false });

      if (error) throw error;
      setAddresses((data as ShippingAddress[]) || []);
    } catch (error) {
      console.error('Error fetching addresses:', error);
    } finally {
      setLoadingAddresses(false);
    }
  };

  const addAddress = async (addressData: Omit<ShippingAddress, 'id' | 'user_id' | 'created_at'>) => {
    if (!user) return;

    const { error } = await supabase
      .from('shipping_addresses')
      .insert({ ...addressData, user_id: user.id });

    if (error) throw error;
    await fetchAddresses();
  };

  const checkShippingCost = async (
    originCityId: number,
    destinationCityId: number,
    weight: number,
    courier: string
  ) => {
    setLoadingShipping(true);

    try {
      const { data, error } = await supabase.functions.invoke('check-shipping', {
        body: {
          origin: originCityId,
          destination: destinationCityId,
          weight,
          courier,
        },
      });

      if (error) throw error;

      const options: ShippingCostResult[] = (data?.results || []).map(
        (r: { service: string; description: string; cost: { value: number; etd: string }[] }) => ({
          service: r.service,
          description: r.description,
          cost: r.cost[0]?.value || 0,
          etd: r.cost[0]?.etd || '',
        })
      );

      updateCheckout({ shippingOptions: options });
      return options;
    } catch (error) {
      console.error('Error checking shipping cost:', error);
      toast.error('Gagal mengecek ongkos kirim');
      return [];
    } finally {
      setLoadingShipping(false);
    }
  };

  const createOrder = async (
    cartItems: { book_id: string; quantity: number; price: number }[],
    subtotal: number
  ): Promise<Order | null> => {
    if (!user) return null;
    setCreatingOrder(true);

    try {
      const orderNumber = generateOrderNumber();
      const totalAmount = subtotal + checkoutState.shippingCost;

      const orderData = {
        user_id: user.id,
        order_number: orderNumber,
        delivery_method: checkoutState.deliveryMethod,
        shipping_address_id: checkoutState.selectedAddressId,
        store_location_id: checkoutState.selectedStoreId,
        courier_code: checkoutState.courierCode || null,
        courier_service: checkoutState.courierService || null,
        shipping_cost: checkoutState.shippingCost,
        subtotal,
        total_amount: totalAmount,
        payment_status: 'pending' as const,
        order_status: 'pending_payment' as const,
      };

      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert(orderData)
        .select()
        .single();

      if (orderError) throw orderError;

      const orderItems = cartItems.map((item) => ({
        order_id: order.id,
        book_id: item.book_id,
        quantity: item.quantity,
        price: item.price,
      }));

      const { error: itemsError } = await supabase
        .from('order_items')
        .insert(orderItems);

      if (itemsError) throw itemsError;

      return order as Order;
    } catch (error) {
      console.error('Error creating order:', error);
      toast.error('Gagal membuat pesanan');
      return null;
    } finally {
      setCreatingOrder(false);
    }
  };

  const initiatePayment = async (orderId: string, orderDetails: {
    order_number: string;
    total_amount: number;
    customer_name: string;
    customer_email: string;
    items: { name: string; price: number; quantity: number }[];
  }) => {
    try {
      const { data, error } = await supabase.functions.invoke('create-payment', {
        body: {
          order_id: orderId,
          order_number: orderDetails.order_number,
          gross_amount: orderDetails.total_amount,
          customer_name: orderDetails.customer_name,
          customer_email: orderDetails.customer_email,
          items: orderDetails.items,
        },
      });

      if (error) throw error;

      // Save snap token to order
      await supabase
        .from('orders')
        .update({
          snap_token: data.token,
          midtrans_order_id: orderDetails.order_number,
        })
        .eq('id', orderId);

      return data.token as string;
    } catch (error) {
      console.error('Error initiating payment:', error);
      toast.error('Gagal memulai pembayaran');
      return null;
    }
  };

  const resetCheckout = () => {
    setCheckoutState({
      step: 'shipping',
      deliveryMethod: 'shipping',
      selectedAddressId: null,
      selectedStoreId: null,
      courierCode: '',
      courierService: '',
      shippingCost: 0,
      shippingOptions: [],
    });
  };

  return {
    checkoutState,
    addresses,
    loadingAddresses,
    loadingShipping,
    creatingOrder,
    updateCheckout,
    fetchAddresses,
    addAddress,
    checkShippingCost,
    createOrder,
    initiatePayment,
    resetCheckout,
  };
}
