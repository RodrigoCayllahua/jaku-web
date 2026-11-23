import { createBrowserClient } from '@supabase/ssr';
import type { SupabaseClient } from '@supabase/supabase-js';

let clienteBrowser: SupabaseClient | null = null;

export function crearClienteSupabaseBrowser(): SupabaseClient {
  if (clienteBrowser) {
    return clienteBrowser;
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error(
      'Faltan NEXT_PUBLIC_SUPABASE_URL o NEXT_PUBLIC_SUPABASE_ANON_KEY en el entorno.'
    );
  }

  clienteBrowser = createBrowserClient(supabaseUrl, supabaseAnonKey);
  return clienteBrowser;
}
