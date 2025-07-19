/*
  # Create pre-approvals table

  1. New Tables
    - `pre_approvals`
      - `id` (uuid, primary key)
      - `visitor_name` (text)
      - `visitor_email` (text)
      - `visitor_phone` (text)
      - `purpose` (text)
      - `scheduled_date` (date)
      - `start_time` (time)
      - `end_time` (time)
      - `host_employee_id` (uuid, foreign key)
      - `host_employee_name` (text)
      - `status` (enum)
      - `qr_code` (text)
      - `qr_sent` (boolean)
      - `qr_sent_at` (timestamp)
      - `qr_sent_status` (enum)
      - `valid_until` (timestamp)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on `pre_approvals` table
    - Add policies for employees and admins
*/

-- Create enum for pre-approval status
CREATE TYPE pre_approval_status AS ENUM ('active', 'expired', 'used');
CREATE TYPE qr_sent_status AS ENUM ('not-sent', 'sending', 'sent', 'failed');

-- Create pre_approvals table
CREATE TABLE IF NOT EXISTS pre_approvals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  visitor_name text NOT NULL,
  visitor_email text NOT NULL,
  visitor_phone text NOT NULL,
  purpose text NOT NULL,
  scheduled_date date NOT NULL,
  start_time time NOT NULL,
  end_time time NOT NULL,
  host_employee_id uuid REFERENCES users(id) NOT NULL,
  host_employee_name text NOT NULL,
  status pre_approval_status DEFAULT 'active',
  qr_code text,
  qr_sent boolean DEFAULT false,
  qr_sent_at timestamptz,
  qr_sent_status qr_sent_status DEFAULT 'not-sent',
  valid_until timestamptz NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE pre_approvals ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Employees can create pre-approvals"
  ON pre_approvals
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users 
      WHERE auth_user_id = auth.uid() 
      AND role IN ('employee', 'admin')
    )
  );

CREATE POLICY "Users can read their own pre-approvals"
  ON pre_approvals
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
      AND role = 'admin'
    )
  );

CREATE POLICY "Users can update their own pre-approvals"
  ON pre_approvals
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
      AND role = 'admin'
    )
  );

-- Create trigger for updated_at
CREATE TRIGGER update_pre_approvals_updated_at 
  BEFORE UPDATE ON pre_approvals 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();