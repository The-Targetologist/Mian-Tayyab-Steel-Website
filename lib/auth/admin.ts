import "server-only";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export interface AdminUser {
  id: string;
  email: string | null;
  role: "admin" | "editor";
}

interface AdminUserRow {
  id: string;
  role: "admin" | "editor";
}

// The real authorization gate — docs/09-content-and-database-model.md
// "do not equate authenticated with admin." Used by the (protected) admin
// layout to redirect non-admins, and safe to call anywhere server-only
// before using the privileged admin client for admin-panel data.
export async function getCurrentAdminUser(): Promise<AdminUser | null> {
  const supabase = await createSupabaseServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data } = await supabase
    .from("admin_users")
    .select("id, role")
    .eq("id", user.id)
    .maybeSingle();

  const adminRow = data as AdminUserRow | null;
  if (!adminRow) return null;

  return { id: adminRow.id, email: user.email ?? null, role: adminRow.role };
}
