import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

try {
  new URL(supabaseUrl);
} catch {
  throw new Error('Invalid Supabase URL format');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
  },
  global: {
    headers: {
      'X-Client-Info': 'sipustaka-web',
    },
  },
});

export const testConnection = async () => {
  try {
    const { error } = await supabase.from('books').select('count').limit(1);
    if (error) throw error;
    return { success: true, message: 'Connection successful' };
  } catch (error) {
    console.error('Supabase connection test failed:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Unknown connection error',
    };
  }
};

// ============================================
// Database Types
// ============================================

export type UserRole = 'admin' | 'cashier' | 'customer';
export type OrderStatus = 'pending_payment' | 'processing' | 'shipped' | 'ready_for_pickup' | 'completed' | 'cancelled';
export type PaymentStatus = 'pending' | 'paid' | 'failed' | 'expired' | 'refunded';
export type DeliveryMethod = 'shipping' | 'pickup';
export type StockChangeType = 'add' | 'remove' | 'purchase' | 'expired';
export type TransactionStatus = 'pending' | 'completed' | 'cancelled';

export interface UserProfile {
  id: string;
  email: string;
  full_name: string;
  role: UserRole;
  created_at: string;
  updated_at: string;
}

export interface Book {
  id: string;
  title: string;
  author: string;
  category: string;
  year: number;
  price: number;
  stock: number;
  weight: number;
  cover_image: string | null;
  description: string | null;
  created_at: string;
  updated_at: string;
}

export interface CartItem {
  id: string;
  user_id: string;
  book_id: string;
  quantity: number;
  created_at: string;
  book?: Book;
}

export interface WishlistItem {
  id: string;
  user_id: string;
  book_id: string;
  created_at: string;
  book?: Book;
}

export interface Transaction {
  id: string;
  user_id: string;
  cashier_id: string | null;
  total_amount: number;
  status: TransactionStatus;
  created_at: string;
}

export interface TransactionItem {
  id: string;
  transaction_id: string;
  book_id: string;
  quantity: number;
  price: number;
  created_at: string;
  book?: Book;
}

export interface StockLog {
  id: string;
  book_id: string;
  change_type: StockChangeType;
  quantity_change: number;
  previous_stock: number;
  new_stock: number;
  user_id: string;
  notes: string | null;
  created_at: string;
  book?: Book;
  user?: UserProfile;
}

export interface StoreLocation {
  id: string;
  name: string;
  address: string;
  city: string;
  city_id: number | null;
  province: string;
  phone: string | null;
  latitude: number | null;
  longitude: number | null;
  operating_hours: string | null;
  is_active: boolean;
  created_at: string;
}

export interface ShippingAddress {
  id: string;
  user_id: string;
  label: string;
  recipient_name: string;
  phone: string;
  address_line: string;
  city: string;
  city_id: number | null;
  province: string;
  postal_code: string | null;
  is_default: boolean;
  created_at: string;
}

export interface Order {
  id: string;
  user_id: string;
  order_number: string;
  delivery_method: DeliveryMethod;
  shipping_address_id: string | null;
  store_location_id: string | null;
  courier_code: string | null;
  courier_service: string | null;
  shipping_cost: number;
  tracking_number: string | null;
  subtotal: number;
  total_amount: number;
  payment_method: string | null;
  payment_status: PaymentStatus;
  midtrans_transaction_id: string | null;
  midtrans_order_id: string | null;
  snap_token: string | null;
  paid_at: string | null;
  order_status: OrderStatus;
  notes: string | null;
  created_at: string;
  updated_at: string;
  // Joined data
  items?: OrderItem[];
  shipping_address?: ShippingAddress;
  store_location?: StoreLocation;
}

export interface OrderItem {
  id: string;
  order_id: string;
  book_id: string;
  quantity: number;
  price: number;
  created_at: string;
  book?: Book;
}
