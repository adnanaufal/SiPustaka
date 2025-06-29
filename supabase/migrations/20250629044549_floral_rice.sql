/*
  # Bookstore Management System Database Schema

  1. New Tables
    - `users`
      - `id` (uuid, primary key, references auth.users)
      - `email` (text, unique)
      - `full_name` (text)
      - `role` (text, enum: admin, cashier, customer)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
    
    - `books`
      - `id` (uuid, primary key)
      - `title` (text)
      - `author` (text)
      - `category` (text)
      - `year` (integer)
      - `price` (decimal)
      - `stock` (integer)
      - `cover_image` (text, optional)
      - `description` (text)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
    
    - `cart_items`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references users)
      - `book_id` (uuid, references books)
      - `quantity` (integer)
      - `created_at` (timestamp)
    
    - `transactions`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references users)
      - `cashier_id` (uuid, references users, optional)
      - `total_amount` (decimal)
      - `status` (text, enum: pending, completed, cancelled)
      - `created_at` (timestamp)
    
    - `transaction_items`
      - `id` (uuid, primary key)
      - `transaction_id` (uuid, references transactions)
      - `book_id` (uuid, references books)
      - `quantity` (integer)
      - `price` (decimal)
      - `created_at` (timestamp)
    
    - `stock_logs`
      - `id` (uuid, primary key)
      - `book_id` (uuid, references books)
      - `change_type` (text, enum: add, remove, purchase, expired)
      - `quantity_change` (integer)
      - `previous_stock` (integer)
      - `new_stock` (integer)
      - `user_id` (uuid, references users)
      - `notes` (text, optional)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on all tables
    - Add policies for role-based access control
*/

-- Create users table
CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text UNIQUE NOT NULL,
  full_name text NOT NULL,
  role text NOT NULL DEFAULT 'customer' CHECK (role IN ('admin', 'cashier', 'customer')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create books table
CREATE TABLE IF NOT EXISTS books (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  author text NOT NULL,
  category text NOT NULL,
  year integer NOT NULL,
  price decimal(10,2) NOT NULL,
  stock integer NOT NULL DEFAULT 0,
  cover_image text,
  description text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create cart_items table
CREATE TABLE IF NOT EXISTS cart_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  book_id uuid NOT NULL REFERENCES books(id) ON DELETE CASCADE,
  quantity integer NOT NULL DEFAULT 1,
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, book_id)
);

-- Create transactions table
CREATE TABLE IF NOT EXISTS transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  cashier_id uuid REFERENCES users(id),
  total_amount decimal(10,2) NOT NULL,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'cancelled')),
  created_at timestamptz DEFAULT now()
);

-- Create transaction_items table
CREATE TABLE IF NOT EXISTS transaction_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  transaction_id uuid NOT NULL REFERENCES transactions(id) ON DELETE CASCADE,
  book_id uuid NOT NULL REFERENCES books(id) ON DELETE CASCADE,
  quantity integer NOT NULL,
  price decimal(10,2) NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Create stock_logs table
CREATE TABLE IF NOT EXISTS stock_logs (
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

-- Enable RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE books ENABLE ROW LEVEL SECURITY;
ALTER TABLE cart_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE transaction_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE stock_logs ENABLE ROW LEVEL SECURITY;

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
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Admin can create users" ON users
  FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Books policies
CREATE POLICY "Everyone can read books" ON books
  FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "Admin can manage books" ON books
  FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Cart policies
CREATE POLICY "Users can manage own cart" ON cart_items
  FOR ALL TO authenticated
  USING (user_id = auth.uid());

-- Transaction policies
CREATE POLICY "Users can read own transactions" ON transactions
  FOR SELECT TO authenticated
  USING (
    user_id = auth.uid() OR 
    cashier_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() AND role IN ('admin', 'cashier')
    )
  );

CREATE POLICY "Users can create transactions" ON transactions
  FOR INSERT TO authenticated
  WITH CHECK (
    user_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() AND role IN ('admin', 'cashier')
    )
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
        EXISTS (
          SELECT 1 FROM users 
          WHERE id = auth.uid() AND role IN ('admin', 'cashier')
        )
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
        t.cashier_id = auth.uid() OR
        EXISTS (
          SELECT 1 FROM users 
          WHERE id = auth.uid() AND role IN ('admin', 'cashier')
        )
      )
    )
  );

-- Stock logs policies
CREATE POLICY "Admin and cashiers can read stock logs" ON stock_logs
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() AND role IN ('admin', 'cashier')
    )
  );

CREATE POLICY "Admin and cashiers can create stock logs" ON stock_logs
  FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() AND role IN ('admin', 'cashier')
    )
  );

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_books_title ON books(title);
CREATE INDEX IF NOT EXISTS idx_books_author ON books(author);
CREATE INDEX IF NOT EXISTS idx_books_category ON books(category);
CREATE INDEX IF NOT EXISTS idx_cart_items_user_id ON cart_items(user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_user_id ON transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_stock_logs_book_id ON stock_logs(book_id);

-- Create trigger for updating updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_books_updated_at BEFORE UPDATE ON books FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();