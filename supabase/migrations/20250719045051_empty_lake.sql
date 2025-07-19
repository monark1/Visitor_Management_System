/*
  # Create users table for authentication

  1. New Tables
    - `users`
      - `id` (uuid, primary key)
      - `email` (text, unique)
      - `name` (text)
      - `role` (enum: admin, employee, guard)
      - `department` (text)
      - `created_at` (timestamp)
      - `last_login` (timestamp)

  2. Security
    - Enable RLS on `users` table
    - Add policy for users to read their own data
    - Add policy for admins to read all users
*/

-- Create enum for user roles
CREATE TYPE user_role AS ENUM ('admin', 'employee', 'guard');

-- Create users table
CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text UNIQUE NOT NULL,
  name text NOT NULL,
  role user_role NOT NULL DEFAULT 'employee',
  department text DEFAULT 'General',
  created_at timestamptz DEFAULT now(),
  last_login timestamptz,
  auth_user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE
);

-- Enable RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can read own data"
  ON users
  FOR SELECT
  TO authenticated
  USING (auth.uid() = auth_user_id);

CREATE POLICY "Admins can read all users"
  ON users
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE auth_user_id = auth.uid() 
      AND role = 'admin'
    )
  );

CREATE POLICY "Users can update own data"
  ON users
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = auth_user_id);

-- Insert default admin user (will be linked after auth signup)
INSERT INTO users (email, name, role, department) VALUES
  ('admin@company.com', 'System Administrator', 'admin', 'IT'),
  ('john@company.com', 'John Employee', 'employee', 'Sales'),
  ('guard@company.com', 'Security Guard', 'guard', 'Security')
ON CONFLICT (email) DO NOTHING;