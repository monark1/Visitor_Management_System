import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Check for environment variables and provide helpful error messages
if (!supabaseUrl) {
  console.error('VITE_SUPABASE_URL is missing from environment variables');
  console.log('Please add VITE_SUPABASE_URL to your .env file');
}

if (!supabaseAnonKey) {
  console.error('VITE_SUPABASE_ANON_KEY is missing from environment variables');
  console.log('Please add VITE_SUPABASE_ANON_KEY to your .env file');
}

// Create a fallback client if env vars are missing (for development)
const fallbackUrl = 'https://placeholder.supabase.co';
const fallbackKey = 'placeholder-key';

export const supabase = createClient(
  supabaseUrl || fallbackUrl, 
  supabaseAnonKey || fallbackKey, 
  {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
});

// Database types
export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          email: string;
          name: string;
          role: 'admin' | 'employee' | 'guard';
          department: string;
          created_at: string;
          last_login: string | null;
          auth_user_id: string;
        };
        Insert: {
          id?: string;
          email: string;
          name: string;
          role?: 'admin' | 'employee' | 'guard';
          department?: string;
          created_at?: string;
          last_login?: string | null;
          auth_user_id: string;
        };
        Update: {
          id?: string;
          email?: string;
          name?: string;
          role?: 'admin' | 'employee' | 'guard';
          department?: string;
          created_at?: string;
          last_login?: string | null;
          auth_user_id?: string;
        };
      };
      visitors: {
        Row: {
          id: string;
          full_name: string;
          contact_number: string;
          email: string;
          purpose: string;
          host_employee_id: string | null;
          host_employee_name: string;
          host_department: string;
          company_name: string | null;
          check_in_time: string;
          check_out_time: string | null;
          photo_url: string | null;
          badge_number: string | null;
          qr_code: string | null;
          status: 'pending' | 'approved' | 'rejected' | 'checked-in' | 'checked-out';
          approval_time: string | null;
          approved_by: string | null;
          pre_approved: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          full_name: string;
          contact_number: string;
          email: string;
          purpose: string;
          host_employee_id?: string | null;
          host_employee_name: string;
          host_department: string;
          company_name?: string | null;
          check_in_time?: string;
          check_out_time?: string | null;
          photo_url?: string | null;
          badge_number?: string | null;
          qr_code?: string | null;
          status?: 'pending' | 'approved' | 'rejected' | 'checked-in' | 'checked-out';
          approval_time?: string | null;
          approved_by?: string | null;
          pre_approved?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          full_name?: string;
          contact_number?: string;
          email?: string;
          purpose?: string;
          host_employee_id?: string | null;
          host_employee_name?: string;
          host_department?: string;
          company_name?: string | null;
          check_in_time?: string;
          check_out_time?: string | null;
          photo_url?: string | null;
          badge_number?: string | null;
          qr_code?: string | null;
          status?: 'pending' | 'approved' | 'rejected' | 'checked-in' | 'checked-out';
          approval_time?: string | null;
          approved_by?: string | null;
          pre_approved?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      pre_approvals: {
        Row: {
          id: string;
          visitor_name: string;
          visitor_email: string;
          visitor_phone: string;
          purpose: string;
          scheduled_date: string;
          start_time: string;
          end_time: string;
          host_employee_id: string;
          host_employee_name: string;
          status: 'active' | 'expired' | 'used';
          qr_code: string | null;
          qr_sent: boolean;
          qr_sent_at: string | null;
          qr_sent_status: 'not-sent' | 'sending' | 'sent' | 'failed';
          valid_until: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          visitor_name: string;
          visitor_email: string;
          visitor_phone: string;
          purpose: string;
          scheduled_date: string;
          start_time: string;
          end_time: string;
          host_employee_id: string;
          host_employee_name: string;
          status?: 'active' | 'expired' | 'used';
          qr_code?: string | null;
          qr_sent?: boolean;
          qr_sent_at?: string | null;
          qr_sent_status?: 'not-sent' | 'sending' | 'sent' | 'failed';
          valid_until: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          visitor_name?: string;
          visitor_email?: string;
          visitor_phone?: string;
          purpose?: string;
          scheduled_date?: string;
          start_time?: string;
          end_time?: string;
          host_employee_id?: string;
          host_employee_name?: string;
          status?: 'active' | 'expired' | 'used';
          qr_code?: string | null;
          qr_sent?: boolean;
          qr_sent_at?: string | null;
          qr_sent_status?: 'not-sent' | 'sending' | 'sent' | 'failed';
          valid_until?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
    };
  };
}