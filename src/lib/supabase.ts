import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'placeholder';

if (!import.meta.env.VITE_SUPABASE_URL || !import.meta.env.VITE_SUPABASE_ANON_KEY) {
  console.warn('CRITICAL: Supabase credentials missing during build. Check .env file.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Centralización de canales para evitar desincronización entre versiones
export const CHANNELS = {
  MESSAGES: 'public_messages_v12',
  PRESENCE: 'presence_layer_v12',
  SIDEBAR: 'sidebar_updates_v12'
};
