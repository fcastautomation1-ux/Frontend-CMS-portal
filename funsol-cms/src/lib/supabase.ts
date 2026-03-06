import { createClient, SupabaseClient } from "@supabase/supabase-js";

// Browser client (lazy initialization)
let _browserClient: SupabaseClient | null = null;

export function getSupabase() {
  if (!_browserClient) {
    _browserClient = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
  }
  return _browserClient;
}

// For backward compat — pages import this
export const supabase = typeof window !== "undefined"
  ? createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL || "",
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ""
    )
  : (null as unknown as SupabaseClient);

// Server-side client with service role key for API routes
export function createServerClient() {
  const url = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) {
    throw new Error("Supabase URL and key must be set in environment variables");
  }
  return createClient(url, key);
}
