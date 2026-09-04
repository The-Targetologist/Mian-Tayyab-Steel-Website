import Link from "next/link";
import { signOut } from "@/lib/actions/auth";
import type { AdminUser } from "@/lib/auth/admin";

export function AdminTopbar({ user }: { user: AdminUser }) {
  return (
    <header className="flex h-16 items-center justify-between border-b border-neutral-100 bg-white px-6">
      <Link href="/admin" className="flex items-center gap-2 text-neutral-950">
        <span aria-hidden="true" className="h-6 w-1.5 bg-brand-600" />
        <span className="text-lg font-bold tracking-tight">MTS Admin</span>
      </Link>
      <div className="flex items-center gap-4">
        {user.email && <span className="text-body-sm text-neutral-500">{user.email}</span>}
        <form action={signOut}>
          <button
            type="submit"
            className="text-body-sm font-medium text-neutral-700 hover:text-brand-600"
          >
            Sign out
          </button>
        </form>
      </div>
    </header>
  );
}
