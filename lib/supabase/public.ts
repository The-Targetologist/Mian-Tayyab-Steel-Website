import "server-only";
import { createClient } from "@supabase/supabase-js";

// Stateless anon client — no cookies, no session awareness at all. Used by
// every public content query (products/collections/services/posts/
// locations/faqs/settings/search/partners/certifications): none of them
// need auth state, since their RLS policies gate purely on
// `status = 'published'`, never on the caller's session.
//
// Deliberately distinct from createSupabaseServerClient() (which reads the
// request's cookies to stay session-aware) — that one stays reserved for
// code that genuinely needs to know the current user (lib/auth/admin.ts,
// lib/actions/auth.ts). A visitor's browser carrying a stale or
// clock-skewed session cookie must never be able to break public,
// unauthenticated pages — which is exactly what happened when a session
// cookie's JWT started failing PostgREST's "issued at future" check
// (a local/sandbox clock-skew symptom, not a real user problem) and took
// the entire public site down with it, since every public query routed
// through the same cookie-bound client used for admin auth.
export function createSupabasePublicClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
  );
}
