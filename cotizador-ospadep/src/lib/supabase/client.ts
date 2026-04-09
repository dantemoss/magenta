import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export function isSupabaseConfigured(): boolean {
  return Boolean(supabaseUrl && supabaseAnonKey);
}

function assertSafeBrowserKey(key: string): void {
  const k = key.trim();
  if (k.startsWith("sb_secret__") || k.toLowerCase().includes("service_role")) {
    throw new Error(
      "La key configurada es secreta (service_role/sb_secret) y no puede usarse en el navegador. Usá la 'anon public key' en NEXT_PUBLIC_SUPABASE_ANON_KEY.",
    );
  }
}

export const supabase = isSupabaseConfigured()
  ? (assertSafeBrowserKey(supabaseAnonKey!),
    createClient(supabaseUrl!, supabaseAnonKey!, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
    }))
  : null;

