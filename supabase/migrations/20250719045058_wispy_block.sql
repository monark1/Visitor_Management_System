/*
  # Create visitors table

  1. New Tables
    - `visitors`
      - `id` (uuid, primary key)
      - `full_name` (text)
      - `contact_number` (text)
      - `email` (text)
      - `purpose` (text)
      - `host_employee_id` (uuid, foreign key)
      - `host_employee_name` (text)
      - `host_department` (text)
      - `company_name` (text)
      - `check_in_time` (timestamp)
      - `check_out_time` (timestamp)
      - `photo_url` (text)
      - `badge_number` (text, unique)
      - `qr_code` (text)
      - `status` (enum)
      - `approval_time` (timestamp)
      - `approved_by` (uuid, foreign key)
      - `pre_approved` (boolean)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on `visitors` table
    - Add policies for different user roles
*/

-- Create enum for visitor status
CREATE TYPE visitor_status AS ENUM ('pending', 'approved', 'rejected', 'checked-in', 'checked-out');

-- Create visitors table
CREATE TABLE IF NOT EXISTS visitors (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name text NOT NULL,
  contact_number text NOT NULL,
  email text NOT NULL,
  purpose text NOT NULL,
  host_employee_id uuid REFERENCES users(id),
  host_employee_name text NOT NULL,
  host_department text NOT NULL,
  company_name text,
  check_in_time timestamptz DEFAULT now(),
  check_out_time timestamptz,
  photo_url text,
  badge_number text UNIQUE,
  qr_code text,
  status visitor_status DEFAULT 'pending',
  approval_time timestamptz,
  approved_by uuid REFERENCES users(id),
  pre_approved boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE visitors ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Guards and admins can create visitors"
  ON visitors
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users 
      WHERE auth_user_id = auth.uid() 
      AND role IN ('guard', 'admin')
    )
  );

CREATE POLICY "Users can read visitors they host"
  ON visitors
  FOR SELECT
  TO authenticated
  USING (
    host_employee_id IN (
      SELECT id FROM users WHERE auth_user_id = auth.uid()
    )
    OR
    EXISTS (
      SELECT 1 FROM users 
      WHERE auth_user_id = auth.uid() 
      AND role IN ('admin', 'guard')
    )
  );

CREATE POLICY "Employees can update visitors they host"
  ON visitors
  FOR UPDATE
  TO authenticated
  USING (
    host_employee_id IN (
      SELECT id FROM users WHERE auth_user_id = auth.uid()
    )
    OR
    EXISTS (
      SELECT 1 FROM users 
      WHERE auth_user_id = auth.uid() 
      AND role IN ('admin', 'guard')
    )
  );

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for updated_at
CREATE TRIGGER update_visitors_updated_at 
  BEFORE UPDATE ON visitors 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();