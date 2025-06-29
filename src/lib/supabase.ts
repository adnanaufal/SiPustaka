import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type Database = {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          email: string;
          full_name: string;
          role: 'admin' | 'cashier' | 'customer';
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email: string;
          full_name: string;
          role?: 'admin' | 'cashier' | 'customer';
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          full_name?: string;
          role?: 'admin' | 'cashier' | 'customer';
          created_at?: string;
          updated_at?: string;
        };
      };
      books: {
        Row: {
          id: string;
          title: string;
          author: string;
          category: string;
          year: number;
          price: number;
          stock: number;
          cover_image: string | null;
          description: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          title: string;
          author: string;
          category: string;
          year: number;
          price: number;
          stock?: number;
          cover_image?: string | null;
          description: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          title?: string;
          author?: string;
          category?: string;
          year?: number;
          price?: number;
          stock?: number;
          cover_image?: string | null;
          description?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      cart_items: {
        Row: {
          id: string;
          user_id: string;
          book_id: string;
          quantity: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          book_id: string;
          quantity?: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          book_id?: string;
          quantity?: number;
          created_at?: string;
        };
      };
      transactions: {
        Row: {
          id: string;
          user_id: string;
          cashier_id: string | null;
          total_amount: number;
          status: 'pending' | 'completed' | 'cancelled';
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          cashier_id?: string | null;
          total_amount: number;
          status?: 'pending' | 'completed' | 'cancelled';
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          cashier_id?: string | null;
          total_amount?: number;
          status?: 'pending' | 'completed' | 'cancelled';
          created_at?: string;
        };
      };
      transaction_items: {
        Row: {
          id: string;
          transaction_id: string;
          book_id: string;
          quantity: number;
          price: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          transaction_id: string;
          book_id: string;
          quantity: number;
          price: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          transaction_id?: string;
          book_id?: string;
          quantity?: number;
          price?: number;
          created_at?: string;
        };
      };
      stock_logs: {
        Row: {
          id: string;
          book_id: string;
          change_type: 'add' | 'remove' | 'purchase' | 'expired';
          quantity_change: number;
          previous_stock: number;
          new_stock: number;
          user_id: string;
          notes: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          book_id: string;
          change_type: 'add' | 'remove' | 'purchase' | 'expired';
          quantity_change: number;
          previous_stock: number;
          new_stock: number;
          user_id: string;
          notes?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          book_id?: string;
          change_type?: 'add' | 'remove' | 'purchase' | 'expired';
          quantity_change?: number;
          previous_stock?: number;
          new_stock?: number;
          user_id?: string;
          notes?: string | null;
          created_at?: string;
        };
      };
    };
  };
};