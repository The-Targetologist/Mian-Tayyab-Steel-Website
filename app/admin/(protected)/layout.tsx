import { redirect } from "next/navigation";
import { getCurrentAdminUser } from "@/lib/auth/admin";
import { AdminShell } from "@/components/admin/AdminShell";

// The real authorization gate for every /admin route except /admin/login —
// docs/10-admin-panel.md "Protect all admin routes server-side." Middleware
// (middleware.ts) only refreshes the session; this layout is what actually
// checks admin_users membership and redirects if absent.
export default async function ProtectedAdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentAdminUser();

  if (!user) {
    redirect("/admin/login");
  }

  return <AdminShell user={user}>{children}</AdminShell>;
}
