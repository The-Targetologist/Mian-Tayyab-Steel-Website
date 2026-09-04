import "server-only";
import { createClient } from "@supabase/supabase-js";

// Privileged client for server-only operations that genuinely require
// bypassing RLS. Uses SUPABASE_SECRET_KEY, which must never reach the
// browser bundle or be referenced from a Client Component.
export function createSupabaseAdminClient() {
  const secretKey = process.env.SUPABASE_SECRET_KEY;

  if (!secretKey) {
    throw new Error("SUPABASE_SECRET_KEY is not set.");
  }

  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, secretKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}
