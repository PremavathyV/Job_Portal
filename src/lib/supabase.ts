import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'placeholder-key';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type Profile = {
  id: string;
  full_name: string;
  email: string;
  role: 'job_seeker' | 'employer';
  avatar_url?: string;
  bio?: string;
  location?: string;
  skills?: string[];
  experience?: string;
  resume_url?: string;
  company_id?: string;
  created_at: string;
};

export type Company = {
  id: string;
  name: string;
  description?: string;
  website?: string;
  logo_url?: string;
  location?: string;
  size?: string;
  created_at: string;
};

export type Job = {
  id: string;
  title: string;
  description?: string;
  requirements?: string;
  salary_min?: number;
  salary_max?: number;
  location?: string;
  type?: string;
  experience_level?: string;
  company_id: string;
  posted_by: string;
  is_active: boolean;
  created_at: string;
  company?: Company;
};

export type Application = {
  id: string;
  job_id: string;
  applicant_id: string;
  status: 'pending' | 'reviewed' | 'accepted' | 'rejected';
  cover_letter?: string;
  created_at: string;
  job?: Job;
};