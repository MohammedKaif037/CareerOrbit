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

// Authentication functions
export async function signUp(email: string, password: string) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${window.location.origin}/auth/callback`,
    },
  });
  
  if (error) {
    console.error('Error signing up:', error);
    throw error;
  }
  
  return data;
}

export async function signIn(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  
  if (error) {
    console.error('Error signing in:', error);
    throw error;
  }
  
  return data;
}

export async function signOut() {
  const { error } = await supabase.auth.signOut();
  
  if (error) {
    console.error('Error signing out:', error);
    throw error;
  }
  
  return true;
}

export async function getSession() {
  const { data, error } = await supabase.auth.getSession();
  
  if (error) {
    console.error('Error getting session:', error);
    throw error;
  }
  
  return data;
}

export async function getUser() {
  const { data, error } = await supabase.auth.getUser();
  
  if (error) {
    console.error('Error getting user:', error);
    throw error;
  }
  
  return data.user;
}

// Application CRUD operations
export async function createApplication(application: Omit<Application, 'id' | 'created_at' | 'updated_at'>) {
  console.log('Creating application:', application);
  
  try {
    const { data, error } = await supabase
      .from('applications')
      .insert(application)
      .select()
      .single();
    
    if (error) {
      console.error('Error creating application:', error);
      throw error;
    }
    
    console.log('Application created successfully:', data);
    return data;
  } catch (error) {
    console.error('Exception creating application:', error);
    throw error;
  }
}

export async function getApplications(userId: string) {
  const { data, error } = await supabase
    .from('applications')
    .select('*')
    .eq('user_id', userId)
    .order('application_date', { ascending: false });
  
  if (error) {
    console.error('Error getting applications:', error);
    throw error;
  }
  
  return data;
}

export async function getApplicationById(id: string) {
  const { data, error } = await supabase
    .from('applications')
    .select('*')
    .eq('id', id)
    .single();
  
  if (error) {
    console.error('Error getting application:', error);
    throw error;
  }
  
  return data;
}

export async function updateApplication(id: string, updates: Partial<Application>) {
  const { data, error } = await supabase
    .from('applications')
    .update(updates)
    .eq('id', id)
    .select()
    .single();
  
  if (error) {
    console.error('Error updating application:', error);
    throw error;
  }
  
  return data;
}

export async function deleteApplication(id: string) {
  const { error } = await supabase
    .from('applications')
    .delete()
    .eq('id', id);
  
  if (error) {
    console.error('Error deleting application:', error);
    throw error;
  }
  
  return true;
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
        total: 0,
        applied: 0,
        interviewing: 0,
        offer: 0,
        rejected: 0,
      };
    }
    
    return data || {
      total: 0,
      applied: 0,
      interviewing: 0,
      offer: 0,
      rejected: 0,
    };
  } catch (error) {
    console.error('Exception getting application stats:', error);
    return {
      total: 0,
      applied: 0,
      interviewing: 0,
      offer: 0,
      rejected: 0,
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
