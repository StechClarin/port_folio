import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Supabase URL and Anon Key are required!');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    // Contourne le bug de verrouillage exclusif Navigator LockManager du navigateur
    // (Timeout / Deadlock fréquent lors du rechargement à chaud Vite ou avec plusieurs onglets)
    lock: async (name, acquireTimeout, fn) => {
      return await fn();
    },
  },
});
