/*
  SiPustaka Bookstore Management System - Database Schema
  
  Tables: users, books, cart_items, wishlist_items, transactions, 
          transaction_items, stock_logs, store_locations, 
          shipping_addresses, orders, order_items
  
  Features: RLS policies, triggers, indexes, functions
*/

-- ============================================
-- DROP EXISTING TABLES (safe re-run)
-- ============================================
DROP TABLE IF EXISTS order_items CASCADE;
DROP TABLE IF EXISTS orders CASCADE;
DROP TABLE IF EXISTS stock_logs CASCADE;
DROP TABLE IF EXISTS transaction_items CASCADE;
DROP TABLE IF EXISTS transactions CASCADE;
DROP TABLE IF EXISTS shipping_addresses CASCADE;
DROP TABLE IF EXISTS wishlist_items CASCADE;
DROP TABLE IF EXISTS cart_items CASCADE;
DROP TABLE IF EXISTS store_locations CASCADE;
DROP TABLE IF EXISTS books CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- Drop existing functions
DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;
DROP FUNCTION IF EXISTS update_updated_at_column() CASCADE;

-- ============================================
-- CREATE TABLES
-- ============================================

-- Users table (synced from auth.users)
CREATE TABLE users (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text UNIQUE NOT NULL,
  full_name text NOT NULL,
  role text NOT NULL DEFAULT 'customer' CHECK (role IN ('admin', 'cashier', 'customer')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Books table
CREATE TABLE books (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  author text NOT NULL,
  category text NOT NULL,
  year integer NOT NULL,
  price decimal(10,2) NOT NULL,
  stock integer NOT NULL DEFAULT 0,
  weight integer NOT NULL DEFAULT 500, -- weight in grams for shipping calculation
  cover_image text,
  description text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Cart items
CREATE TABLE cart_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  book_id uuid NOT NULL REFERENCES books(id) ON DELETE CASCADE,
  quantity integer NOT NULL DEFAULT 1,
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, book_id)
);

-- Wishlist items
CREATE TABLE wishlist_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  book_id uuid NOT NULL REFERENCES books(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, book_id)
);

-- Transactions (for POS/cashier - Phase 2)
CREATE TABLE transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  cashier_id uuid REFERENCES users(id),
  total_amount decimal(10,2) NOT NULL,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'cancelled')),
  created_at timestamptz DEFAULT now()
);

-- Transaction items
CREATE TABLE transaction_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  transaction_id uuid NOT NULL REFERENCES transactions(id) ON DELETE CASCADE,
  book_id uuid NOT NULL REFERENCES books(id) ON DELETE CASCADE,
  quantity integer NOT NULL,
  price decimal(10,2) NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Stock logs (audit trail)
CREATE TABLE stock_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  book_id uuid NOT NULL REFERENCES books(id) ON DELETE CASCADE,
  change_type text NOT NULL CHECK (change_type IN ('add', 'remove', 'purchase', 'expired')),
  quantity_change integer NOT NULL,
  previous_stock integer NOT NULL,
  new_stock integer NOT NULL,
  user_id uuid NOT NULL REFERENCES users(id),
  notes text,
  created_at timestamptz DEFAULT now()
);

-- Store locations (Jabodetabek)
CREATE TABLE store_locations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  address text NOT NULL,
  city text NOT NULL,
  city_id integer, -- RajaOngkir city ID
  province text NOT NULL,
  phone text,
  latitude decimal(10,8),
  longitude decimal(11,8),
  operating_hours text,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

-- Shipping addresses
CREATE TABLE shipping_addresses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  label text NOT NULL DEFAULT 'Rumah',
  recipient_name text NOT NULL,
  phone text NOT NULL,
  address_line text NOT NULL,
  city text NOT NULL,
  city_id integer, -- RajaOngkir city ID
  province text NOT NULL,
  postal_code text,
  is_default boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- Orders (online checkout)
CREATE TABLE orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  order_number text UNIQUE NOT NULL,

  -- Shipping
  delivery_method text NOT NULL CHECK (delivery_method IN ('shipping', 'pickup')),
  shipping_address_id uuid REFERENCES shipping_addresses(id),
  store_location_id uuid REFERENCES store_locations(id),
  courier_code text,
  courier_service text,
  shipping_cost decimal(10,2) DEFAULT 0,
  tracking_number text,

  -- Payment (Midtrans)
  subtotal decimal(10,2) NOT NULL,
  total_amount decimal(10,2) NOT NULL,
  payment_method text,
  payment_status text NOT NULL DEFAULT 'pending'
    CHECK (payment_status IN ('pending', 'paid', 'failed', 'expired', 'refunded')),
  midtrans_transaction_id text,
  midtrans_order_id text,
  snap_token text,
  paid_at timestamptz,

  -- Order status
  order_status text NOT NULL DEFAULT 'pending_payment'
    CHECK (order_status IN (
      'pending_payment', 'processing', 'shipped',
      'ready_for_pickup', 'completed', 'cancelled'
    )),

  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Order items
CREATE TABLE order_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  book_id uuid NOT NULL REFERENCES books(id),
  quantity integer NOT NULL,
  price decimal(10,2) NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- ============================================
-- ENABLE RLS ON ALL TABLES
-- ============================================
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE books ENABLE ROW LEVEL SECURITY;
ALTER TABLE cart_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE wishlist_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE transaction_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE stock_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE store_locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE shipping_addresses ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;

-- ============================================
-- RLS POLICIES
-- ============================================

-- Users policies
CREATE POLICY "Users can read own data" ON users
  FOR SELECT TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own data" ON users
  FOR UPDATE TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Admin can read all users" ON users
  FOR SELECT TO authenticated
  USING (
    public.get_user_role(auth.uid()) = 'admin'
  );

CREATE POLICY "Admin can create users" ON users
  FOR INSERT TO authenticated
  WITH CHECK (
    public.get_user_role(auth.uid()) = 'admin'
  );

CREATE POLICY "Admin can update users" ON users
  FOR UPDATE TO authenticated
  USING (
    public.get_user_role(auth.uid()) = 'admin'
  );


-- Books policies
CREATE POLICY "Everyone can read books" ON books
  FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "Public can read books" ON books
  FOR SELECT TO anon
  USING (true);

CREATE POLICY "Admin can manage books" ON books
  FOR ALL TO authenticated
  USING (
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
  );

-- Cart policies
CREATE POLICY "Users can manage own cart" ON cart_items
  FOR ALL TO authenticated
  USING (user_id = auth.uid());

-- Wishlist policies
CREATE POLICY "Users can manage own wishlist" ON wishlist_items
  FOR ALL TO authenticated
  USING (user_id = auth.uid());

-- Transaction policies
CREATE POLICY "Users can read own transactions" ON transactions
  FOR SELECT TO authenticated
  USING (
    user_id = auth.uid() OR
    cashier_id = auth.uid() OR
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role IN ('admin', 'cashier'))
  );

CREATE POLICY "Users can create transactions" ON transactions
  FOR INSERT TO authenticated
  WITH CHECK (
    user_id = auth.uid() OR
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role IN ('admin', 'cashier'))
  );

-- Transaction items policies
CREATE POLICY "Users can read transaction items" ON transaction_items
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM transactions t
      WHERE t.id = transaction_id AND (
        t.user_id = auth.uid() OR
        t.cashier_id = auth.uid() OR
        EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role IN ('admin', 'cashier'))
      )
    )
  );

CREATE POLICY "Users can create transaction items" ON transaction_items
  FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM transactions t
      WHERE t.id = transaction_id AND (
        t.user_id = auth.uid() OR
        EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role IN ('admin', 'cashier'))
      )
    )
  );

-- Stock logs policies
CREATE POLICY "Admin and cashiers can read stock logs" ON stock_logs
  FOR SELECT TO authenticated
  USING (
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role IN ('admin', 'cashier'))
  );

CREATE POLICY "Admin and cashiers can create stock logs" ON stock_logs
  FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role IN ('admin', 'cashier'))
  );

-- Store locations policies
CREATE POLICY "Everyone can read active stores" ON store_locations
  FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "Public can read active stores" ON store_locations
  FOR SELECT TO anon
  USING (is_active = true);

CREATE POLICY "Admin can manage stores" ON store_locations
  FOR ALL TO authenticated
  USING (
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
  );

-- Shipping addresses policies
CREATE POLICY "Users can manage own addresses" ON shipping_addresses
  FOR ALL TO authenticated
  USING (user_id = auth.uid());

-- Orders policies
CREATE POLICY "Users can read own orders" ON orders
  FOR SELECT TO authenticated
  USING (
    user_id = auth.uid() OR
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role IN ('admin', 'cashier'))
  );

CREATE POLICY "Users can create orders" ON orders
  FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Admin can update orders" ON orders
  FOR UPDATE TO authenticated
  USING (
    user_id = auth.uid() OR
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role IN ('admin', 'cashier'))
  );

-- Order items policies
CREATE POLICY "Users can read own order items" ON order_items
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM orders o
      WHERE o.id = order_id AND (
        o.user_id = auth.uid() OR
        EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role IN ('admin', 'cashier'))
      )
    )
  );

CREATE POLICY "Users can create order items" ON order_items
  FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM orders o
      WHERE o.id = order_id AND o.user_id = auth.uid()
    )
  );

-- ============================================
-- INDEXES
-- ============================================
CREATE INDEX idx_books_title ON books(title);
CREATE INDEX idx_books_author ON books(author);
CREATE INDEX idx_books_category ON books(category);
CREATE INDEX idx_cart_items_user_id ON cart_items(user_id);
CREATE INDEX idx_wishlist_items_user_id ON wishlist_items(user_id);
CREATE INDEX idx_transactions_user_id ON transactions(user_id);
CREATE INDEX idx_stock_logs_book_id ON stock_logs(book_id);
CREATE INDEX idx_shipping_addresses_user_id ON shipping_addresses(user_id);
CREATE INDEX idx_orders_user_id ON orders(user_id);
CREATE INDEX idx_orders_order_number ON orders(order_number);
CREATE INDEX idx_orders_payment_status ON orders(payment_status);
CREATE INDEX idx_orders_order_status ON orders(order_status);
CREATE INDEX idx_order_items_order_id ON order_items(order_id);

-- ============================================
-- FUNCTIONS & TRIGGERS
-- ============================================

-- Get user role bypassing RLS to prevent infinite recursion
CREATE OR REPLACE FUNCTION public.get_user_role(user_id uuid)
RETURNS text AS $$
  SELECT role FROM public.users WHERE id = user_id;
$$ LANGUAGE sql SECURITY DEFINER;


-- Auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE 'plpgsql';

CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

CREATE TRIGGER update_books_updated_at
  BEFORE UPDATE ON books
  FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

CREATE TRIGGER update_orders_updated_at
  BEFORE UPDATE ON orders
  FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

-- Auto-create user profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.users (id, email, full_name, role)
  VALUES (
    new.id,
    new.email,
    COALESCE(new.raw_user_meta_data->>'full_name', 'Pengguna Baru'),
    'customer'
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
