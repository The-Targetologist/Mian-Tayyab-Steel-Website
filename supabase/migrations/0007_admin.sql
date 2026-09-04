-- Phase 9 — Admin foundation. See docs/10-admin-panel.md "Roles" and
-- docs/09-content-and-database-model.md "Row Level Security": do not equate
-- authenticated with admin — this table is the explicit role check.
--
-- No public signup path exists anywhere in the app. The first admin user is
-- created directly in Supabase (Dashboard or admin API), then granted
-- access by inserting a row here — see docs/PROJECT_STATE.md Phase 9 notes.
--
-- Content tables' RLS is unchanged by this migration. Admin writes/reads of
-- draft content go through the privileged service-role client
-- (lib/supabase/admin.ts), gated by an application-level check
-- (lib/auth/admin.ts) that this table backs — not by adding "authenticated
-- can write" policies to every content table.

create table admin_users (
  id uuid primary key references auth.users(id) on delete cascade,
  role text not null default 'admin' check (role in ('admin', 'editor')),
  created_at timestamptz not null default now()
);

alter table admin_users enable row level security;

create policy "Users can read their own admin_users row"
  on admin_users for select
  using (auth.uid() = id);
