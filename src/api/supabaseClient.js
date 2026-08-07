import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error(
    '[supabaseClient] Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY. ' +
    'Copy .env.example to .env.local and fill in your Supabase project credentials.'
  );
}

const cleanSupabaseUrl = supabaseUrl ? supabaseUrl.replace(/\/rest\/v1\/?$/, '') : '';
const safeSupabaseUrl = cleanSupabaseUrl || 'https://placeholder.supabase.co';
const safeSupabaseAnonKey = supabaseAnonKey || 'placeholder-anon-key';

export const supabase = createClient(safeSupabaseUrl, safeSupabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});

