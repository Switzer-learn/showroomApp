import { createClient as createSupabaseClient } from '@supabase/supabase-js';

// Create a client-side Supabase client
export function createClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL as string;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string;
  
  return createSupabaseClient(supabaseUrl, supabaseAnonKey);
} 