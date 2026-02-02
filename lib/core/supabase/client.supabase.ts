import { createClient } from '@supabase/supabase-js';
import { storageAdapter } from '../storage/storage.adapter';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    'Faltan variables de entorno: EXPO_PUBLIC_SUPABASE_URL y EXPO_PUBLIC_SUPABASE_ANON_KEY'
  );
}

/**
 * Cliente de Supabase configurado con:
 * - Storage adaptador multiplataforma
 * - Auto-refresh de tokens
 * - Persistencia de sesión
 */
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: storageAdapter,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});
