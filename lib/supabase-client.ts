'use client';

import { createClient } from '@supabase/supabase-js';
import { type Database } from './database.types';

// Initialize the Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
});

// Types
export type Application = {
  id?: string;
  user_id: string;
  company_name: string;
  job_title: string;
  location: string;
  job_url?: string;
  application_date: string;
  status: 'Applied' | 'Interviewing' | 'Offer' | 'Rejected';
  notes?: string;
  salary_range?: string;
  resume_sent: boolean;
  cover_letter_sent: boolean;
  application_method: string;
  contact_name?: string;
  contact_email?: string;
  follow_up_date?: string | null;
  follow_up_required: boolean;
  interview_scheduled: boolean;
  priority: number;
  created_at?: string;
  updated_at?: string;
};

// Error handling type
export type SupabaseResponse<T> = {
  data: T | null;
  error: string | null;
};

// Authentication functions
export async function signUp(email: string, password: string): Promise<SupabaseResponse<any>> {
  try {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });
    
    if (error) {
      console.error('Error signing up:', error);
      return { data: null, error: error.message };
    }
    
    return { data, error: null };
  } catch (err: any) {
    console.error('Exception signing up:', err);
    return { data: null, error: err.message || 'An unexpected error occurred during sign up' };
  }
}

export async function signIn(email: string, password: string): Promise<SupabaseResponse<any>> {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    
    if (error) {
      console.error('Error signing in:', error);
      return { data: null, error: error.message };
    }
    
    return { data, error: null };
  } catch (err: any) {
    console.error('Exception signing in:', err);
    return { data: null, error: err.message || 'An unexpected error occurred during sign in' };
  }
}

export async function signOut(): Promise<SupabaseResponse<boolean>> {
  try {
    const { error } = await supabase.auth.signOut();
    
    if (error) {
      console.error('Error signing out:', error);
      return { data: null, error: error.message };
    }
    
    return { data: true, error: null };
  } catch (err: any) {
    console.error('Exception signing out:', err);
    return { data: null, error: err.message || 'An unexpected error occurred during sign out' };
  }
}

export async function getSession(): Promise<SupabaseResponse<any>> {
  try {
    const { data, error } = await supabase.auth.getSession();
    
    if (error) {
      console.error('Error getting session:', error);
      return { data: null, error: error.message };
    }
    
    return { data, error: null };
  } catch (err: any) {
    console.error('Exception getting session:', err);
    return { data: null, error: err.message || 'An unexpected error occurred while retrieving session' };
  }
}

export async function getUser(): Promise<SupabaseResponse<any>> {
  try {
    const { data, error } = await supabase.auth.getUser();
    
    if (error) {
      console.error('Error getting user:', error);
      return { data: null, error: error.message };
    }
    
    return { data: data.user, error: null };
  } catch (err: any) {
    console.error('Exception getting user:', err);
    return { data: null, error: err.message || 'An unexpected error occurred while retrieving user' };
  }
}

// Application CRUD operations
export async function createApplication(application: Omit<Application, 'id' | 'created_at' | 'updated_at'>): Promise<SupabaseResponse<Application>> {
  console.log('Creating application:', application);
  
  try {
    const { data, error } = await supabase
      .from('applications')
      .insert(application)
      .select()
      .single();
    
    if (error) {
      console.error('Error creating application:', error);
      return { data: null, error: error.message };
    }
    
    console.log('Application created successfully:', data);
    return { data, error: null };
  } catch (err: any) {
    console.error('Exception creating application:', err);
    return { data: null, error: err.message || 'An unexpected error occurred while creating the application' };
  }
}

export async function getApplications(userId: string): Promise<SupabaseResponse<Application[]>> {
  try {
    const { data, error } = await supabase
      .from('applications')
      .select('*')
      .eq('user_id', userId)
      .order('application_date', { ascending: false });
    
    if (error) {
      console.error('Error getting applications:', error);
      return { data: null, error: error.message };
    }
    
    return { data, error: null };
  } catch (err: any) {
    console.error('Exception getting applications:', err);
    return { data: null, error: err.message || 'An unexpected error occurred while retrieving applications' };
  }
}

export async function getApplicationById(id: string): Promise<SupabaseResponse<Application>> {
  try {
    const { data, error } = await supabase
      .from('applications')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) {
      console.error('Error getting application:', error);
      return { data: null, error: error.message };
    }
    
    return { data, error: null };
  } catch (err: any) {
    console.error('Exception getting application:', err);
    return { data: null, error: err.message || 'An unexpected error occurred while retrieving the application' };
  }
}

export async function updateApplication(id: string, updates: Partial<Application>): Promise<SupabaseResponse<Application>> {
  try {
    const { data, error } = await supabase
      .from('applications')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    
    if (error) {
      console.error('Error updating application:', error);
      return { data: null, error: error.message };
    }
    
    return { data, error: null };
  } catch (err: any) {
    console.error('Exception updating application:', err);
    return { data: null, error: err.message || 'An unexpected error occurred while updating the application' };
  }
}

export async function deleteApplication(id: string): Promise<SupabaseResponse<boolean>> {
  try {
    const { error } = await supabase
      .from('applications')
      .delete()
      .eq('id', id);
    
    if (error) {
      console.error('Error deleting application:', error);
      return { data: null, error: error.message };
    }
    
    return { data: true, error: null };
  } catch (err: any) {
    console.error('Exception deleting application:', err);
    return { data: null, error: err.message || 'An unexpected error occurred while deleting the application' };
  }
}

// Statistics and analytics
export async function getApplicationStats(userId: string) {
  try {
    const { data, error } = await supabase.rpc('get_application_stats', {
      user_id: userId,
    });
    
    if (error) {
      console.error('Error getting application stats:', error);
      return {
        data: {
          total: 0,
          applied: 0,
          interviewing: 0,
          offer: 0,
          rejected: 0,
        },
        error: error.message
      };
    }
    
    return {
      data: data || {
        total: 0,
        applied: 0,
        interviewing: 0,
        offer: 0,
        rejected: 0,
      },
      error: null
    };
  } catch (err: any) {
    console.error('Exception getting application stats:', err);
    return {
      data: {
        total: 0,
        applied: 0,
        interviewing: 0,
        offer: 0,
        rejected: 0,
      },
      error: err.message || 'An unexpected error occurred while retrieving application stats'
    };
  }
}

// Helper functions
export async function setupSubscription(
  userId: string,
  callback: (payload: any) => void
) {
  return supabase
    .channel('applications-changes')
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'applications',
        filter: `user_id=eq.${userId}`,
      },
      (payload) => {
        console.log('Change received!', payload);
        callback(payload);
      }
    )
    .subscribe();
        }
