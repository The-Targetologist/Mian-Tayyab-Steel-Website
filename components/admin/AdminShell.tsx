import type { ReactNode } from "react";
import { AdminSidebar } from "./AdminSidebar";
import { AdminTopbar } from "./AdminTopbar";
import type { AdminUser } from "@/lib/auth/admin";

export function AdminShell({ user, children }: { user: AdminUser; children: ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col">
      <AdminTopbar user={user} />
      <div className="flex flex-1">
        <AdminSidebar />
        <main className="flex-1 bg-neutral-50 p-8">{children}</main>
      </div>
    </div>
  );
}
