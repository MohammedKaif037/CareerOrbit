import { createClient } from "@supabase/supabase-js";

// Define types for your database tables
export type Application = {
  id: string;
  company_name: string;
  job_title: string;
  application_date: string;
  application_method?: string;
  resume_sent: boolean;
  cover_letter_sent: boolean;
  interview_scheduled: boolean;
  interview_type?: string;
  interviewers?: string[];
  follow_up_required: boolean;
  follow_up_date?: string;
  notes?: string;
  status: 'Applied' | 'Interviewing' | 'Offer' | 'Rejected' | 'Archived';
  job_url?: string;
  salary_range?: string;
  location?: string;
  priority?: number;
  user_id: string;
  created_at: string;
  updated_at: string;
};

export type Contact = {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  position?: string;
  company_id: string;
  linkedin_url?: string;
  notes?: string;
  user_id: string;
  created_at: string;
};

export type Document = {
  id: string;
  application_id: string;
  name: string;
  type: 'Resume' | 'Cover Letter' | 'Other';
  file_path: string;
  version?: string;
  user_id: string;
  created_at: string;
};

export type InterviewEvent = {
  id: string;
  application_id: string;
  event_type: 'Phone Screen' | 'Technical' | 'Behavioral' | 'Onsite' | 'Final';
  scheduled_time: string;
  duration_minutes?: number;
  interviewers?: string[];
  meeting_url?: string;
  notes?: string;
  feedback?: string;
  user_id: string;
  created_at: string;
};

export type StatusHistory = {
  id: string;
  application_id: string;
  old_status?: string;
  new_status: string;
  changed_at: string;
  user_id: string;
};

export type ApplicationStats = {
  total: number;
  applied: number;
  interviewing: number;
  offer: number;
  rejected: number;
  archived: number;
};

// Create a Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error("Missing Supabase environment variables");
}

export const supabase = createClient(
  supabaseUrl || '',
  supabaseAnonKey || ''
);

// Applications API
export async function getApplications() {
  const { data, error } = await supabase
    .from('applications')
    .select('*')
    .order('application_date', { ascending: false });
  
  if (error) {
    console.error('Error fetching applications:', error);
    return [];
  }
  
  return data as Application[];
}

export async function getApplicationById(id: string) {
  const { data, error } = await supabase
    .from('applications')
    .select(`
      *,
      contacts(*),
      documents(*),
      interview_events(*)
    `)
    .eq('id', id)
    .single();
  
  if (error) {
    console.error('Error fetching application details:', error);
    return null;
  }
  
  return data as Application & {
    contacts: Contact[];
    documents: Document[];
    interview_events: InterviewEvent[];
  };
}

export async function createApplication(applicationData: Omit<Application, 'id' | 'created_at' | 'updated_at' | 'user_id'>) {
  const { data, error } = await supabase
    .from('applications')
    .insert([applicationData])
    .select();
  
  if (error) {
    console.error('Error creating application:', error);
    return null;
  }
  
  return data[0] as Application;
}

export async function updateApplication(id: string, updates: Partial<Application>) {
  const { data, error } = await supabase
    .from('applications')
    .update(updates)
    .eq('id', id)
    .select();
  
  if (error) {
    console.error('Error updating application:', error);
    return null;
  }
  
  return data[0] as Application;
}

export async function updateApplicationStatus(applicationId: string, newStatus: Application['status']) {
  // This will use the database function you've created
  const { data, error } = await supabase
    .rpc('update_application_status', { 
      app_id: applicationId,
      new_status: newStatus
    });
  
  if (error) {
    console.error('Error updating application status:', error);
    return false;
  }
  
  return true;
}

export async function deleteApplication(id: string) {
  const { error } = await supabase
    .from('applications')
    .delete()
    .eq('id', id);
  
  if (error) {
    console.error('Error deleting application:', error);
    return false;
  }
  
  return true;
}

// Contacts API
export async function createContact(contactData: Omit<Contact, 'id' | 'created_at' | 'user_id'>) {
  const { data, error } = await supabase
    .from('contacts')
    .insert([contactData])
    .select();
  
  if (error) {
    console.error('Error creating contact:', error);
    return null;
  }
  
  return data[0] as Contact;
}

// Interview Events API
export async function createInterviewEvent(eventData: Omit<InterviewEvent, 'id' | 'created_at' | 'user_id'>) {
  const { data, error } = await supabase
    .from('interview_events')
    .insert([eventData])
    .select();
  
  if (error) {
    console.error('Error creating interview event:', error);
    return null;
  }
  
  return data[0] as InterviewEvent;
}

export async function getUpcomingInterviews() {
  const { data, error } = await supabase
    .from('interview_events')
    .select(`
      *,
      applications!inner(company_name, job_title)
    `)
    .gte('scheduled_time', new Date().toISOString())
    .order('scheduled_time', { ascending: true });
  
  if (error) {
    console.error('Error fetching upcoming interviews:', error);
    return [];
  }
  
  return data as (InterviewEvent & { applications: Pick<Application, 'company_name' | 'job_title'> })[];
}

// Documents API
export async function uploadDocument(
  file: File, 
  applicationId: string, 
  type: Document['type'],
  userId: string
) {
  const filePath = `user-${userId}/app-${applicationId}/${file.name}`;
  
  // Upload to storage
  const { data: uploadData, error: uploadError } = await supabase
    .storage
    .from('documents')
    .upload(filePath, file);
  
  if (uploadError) {
    console.error('Error uploading document:', uploadError);
    return null;
  }
  
  // Add to documents table
  const { data, error } = await supabase
    .from('documents')
    .insert([{
      application_id: applicationId,
      name: file.name,
      type: type,
      file_path: filePath,
      user_id: userId
    }])
    .select();
  
  if (error) {
    console.error('Error saving document reference:', error);
    return null;
  }
  
  return data[0] as Document;
}

export async function getDocumentUrl(filePath: string) {
  const { data, error } = await supabase
    .storage
    .from('documents')
    .createSignedUrl(filePath, 60 * 60); // 1 hour expiry
  
  if (error) {
    console.error('Error getting document URL:', error);
    return null;
  }
  
  return data.signedUrl;
}

// Stats API
export async function getApplicationStats(userId: string) {
  const { data, error } = await supabase
    .rpc('get_application_stats', { user_id: userId });
  
  if (error) {
    console.error('Error fetching application stats:', error);
    return null;
  }
  
  return data as ApplicationStats;
}
