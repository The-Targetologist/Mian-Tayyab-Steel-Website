-- Phase 10 — Partners & Certifications admin CRUD. See
-- docs/09-content-and-database-model.md §16-17 and docs/10-admin-panel.md
-- "Partners & Certifications" ("Manage logo, title, relationship/certificate
-- data, links and ordering"). Schema was already fully specified in doc09
-- but never implemented until this increment.
--
-- Both are simple standalone entities — no slug (not individually
-- routable), no relations, no created_at/updated_at (same shape as
-- Phase 7's locations/global_faqs). RLS follows the same pattern as every
-- other content table.

create table partners (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  logo_media_id uuid references media_assets(id) on delete set null,
  website_url text,
  relationship_label text,
  status content_status not null default 'draft',
  sort_order integer not null default 0
);

alter table partners enable row level security;

create policy "Public can read published partners"
  on partners for select
  using (status = 'published');

create index partners_status_idx on partners (status);
create index partners_sort_order_idx on partners (sort_order);

create table certifications (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  issuer text,
  description text,
  media_id uuid references media_assets(id) on delete set null,
  certificate_url text,
  status content_status not null default 'draft',
  sort_order integer not null default 0
);

alter table certifications enable row level security;

create policy "Public can read published certifications"
  on certifications for select
  using (status = 'published');

create index certifications_status_idx on certifications (status);
create index certifications_sort_order_idx on certifications (sort_order);
