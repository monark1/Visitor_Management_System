import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, AuthContextType, LoginCredentials, SignupCredentials } from '../types/auth';
import { supabase } from '../lib/supabase';
import type { User as SupabaseUser } from '@supabase/supabase-js';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Get initial session
    const getInitialSession = async () => {
      try {
        console.log('🔄 Starting authentication check...');
        console.log('📡 Supabase URL:', import.meta.env.VITE_SUPABASE_URL ? 'Present' : 'Missing');
        console.log('🔑 Supabase Key:', import.meta.env.VITE_SUPABASE_ANON_KEY ? 'Present' : 'Missing');
        
        // Check if environment variables are missing
        if (!import.meta.env.VITE_SUPABASE_URL || !import.meta.env.VITE_SUPABASE_ANON_KEY) {
          console.error('❌ Missing Supabase environment variables');
          setIsLoading(false);
          return;
        }

        console.log('🔍 Getting Supabase session...');
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('❌ Error getting session:', error.message);
          setIsLoading(false);
          return;
        }
        
        console.log('✅ Session check complete:', session ? 'User found' : 'No active session');
        
        if (session?.user) {
          console.log('👤 Fetching user profile for:', session.user.email);
          await fetchUserProfile(session.user);
        } else {
          console.log('🚪 No active session, showing login form');
          setIsLoading(false);
        }
      } catch (error) {
        console.error('💥 Critical error in getInitialSession:', error);
        setIsLoading(false);
      }
    };

    getInitialSession();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('🔄 Auth state changed:', event);
      if (session?.user) {
        await fetchUserProfile(session.user);
      } else {
        setUser(null);
      }
      setIsLoading(false);
    });
    
    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const fetchUserProfile = async (authUser: SupabaseUser) => {
    try {
      console.log('🔍 Fetching profile for user ID:', authUser.id);
      const { data: userProfile, error } = await supabase
        .from('users')
        .select('*')
        .eq('auth_user_id', authUser.id)
        .maybeSingle();

      if (error) {
        console.error('❌ Error fetching user profile:', error.message);
        setIsLoading(false);
        return;
      }

      if (userProfile) {
        console.log('✅ User profile found:', userProfile.name, `(${userProfile.role})`);
        const userData: User = {
          id: userProfile.id,
          name: userProfile.name,
          email: userProfile.email,
          role: userProfile.role,
          department: userProfile.department,
          createdAt: new Date(userProfile.created_at),
          lastLogin: userProfile.last_login ? new Date(userProfile.last_login) : undefined,
        };
        setUser(userData);

        // Update last login
        const { error: updateError } = await supabase
          .from('users')
          .update({ last_login: new Date().toISOString() })
          .eq('id', userProfile.id);
        
        if (updateError) {
          console.warn('⚠️ Could not update last login:', updateError.message);
        }
      } else {
        console.warn('⚠️ No user profile found for auth user:', authUser.id);
        setUser(null);
      }
    } catch (error) {
      console.error('💥 Error in fetchUserProfile:', error);
    } finally {
      console.log('✅ Authentication check complete');
      setIsLoading(false);
    }
  };

  const login = async (credentials: LoginCredentials): Promise<{ success: boolean; message?: string }> => {
    setIsLoading(true);
    
    try {
      // First, sign in with Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email: credentials.email,
        password: credentials.password,
      });

      if (authError) {
        console.error('Auth error:', authError);
        setIsLoading(false);
        return { success: false, message: 'Invalid email or password. Please check your credentials.' };
      }

      if (authData.user) {
        // Fetch user profile to check role
        const { data: userProfile, error: profileError } = await supabase
          .from('users')
          .select('*')
          .eq('auth_user_id', authData.user.id)
          .maybeSingle();

        if (profileError || !userProfile) {
          console.error('Profile error:', profileError);
          await supabase.auth.signOut();
          setIsLoading(false);
          return { success: false, message: 'Login failed. Your user profile could not be found or is incomplete. Please contact support.' };
        }

        // Check if role matches
        if (userProfile.role !== credentials.role) {
          await supabase.auth.signOut();
          setIsLoading(false);
          return { success: false, message: `Access denied. You are not registered as ${credentials.role}. Please select the correct role.` };
        }

        // User profile will be set by the auth state change listener
        setIsLoading(false);
        return { success: true };
      }

      setIsLoading(false);
      return { success: false, message: 'Login failed. Please try again.' };
    } catch (error) {
      console.error('Login error:', error);
      setIsLoading(false);
      return { success: false, message: 'An unexpected error occurred. Please try again.' };
    }
  };

  const signup = async (credentials: SignupCredentials): Promise<{ success: boolean; message?: string }> => {
    setIsLoading(true);
    
    try {
      // First, sign up with Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: credentials.email,
        password: credentials.password,
      });

      if (authError) {
        console.error('Auth signup error:', authError);
        setIsLoading(false);
        
        if (authError.message?.includes('User already registered') || authError.message?.includes('already been registered')) {
          return { success: false, message: 'This email is already registered. Please sign in instead.' };
        }
        
        return { success: false, message: authError.message || 'Registration failed. Please try again.' };
      }

      if (authData.user) {
        // Create user profile
        const { error: profileError } = await supabase
          .from('users')
          .insert({
            auth_user_id: authData.user.id,
            email: credentials.email,
            name: credentials.name,
            role: credentials.role,
            department: credentials.department || 'General',
          });

        if (profileError) {
          console.error('Profile creation error:', profileError);
          // Clean up auth user if profile creation fails
          await supabase.auth.signOut();
          setIsLoading(false);
          return { success: false, message: 'Registration failed. Could not create user profile. Please try again.' };
        }

        // User profile will be set by the auth state change listener
        setIsLoading(false);
        return { success: true, message: 'Account created successfully! You can now sign in.' };
      }

      setIsLoading(false);
      return { success: false, message: 'Registration failed. Please try again.' };
    } catch (error) {
      console.error('Signup error:', error);
      setIsLoading(false);
      return { success: false, message: 'An unexpected error occurred during registration. Please try again.' };
    }
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setUser(null);
  };

  const value: AuthContextType = {
    user,
    isAuthenticated: !!user,
    isLoading,
    login,
    signup,
    logout,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};