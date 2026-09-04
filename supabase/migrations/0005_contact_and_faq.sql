-- Phase 7 — Locations, quote requests, and global FAQs. See
-- docs/09-content-and-database-model.md §15, §18-19.
--
-- quote_requests has NO public SELECT or INSERT policy at all — per
-- docs/09 "insert inquiries only through a controlled server endpoint/action,
-- not unrestricted direct table inserts." The public site never talks to
-- this table directly; a validated Server Action uses the privileged
-- admin client (lib/supabase/admin.ts) to insert after server-side
-- validation. RLS enabled with no policies means both anon and
-- authenticated are denied by default; only the service role (which
-- bypasses RLS) can read/write.

create table locations (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  location_type text not null check (location_type in ('office', 'warehouse', 'yard', 'facility')),
  address_line_1 text not null,
  address_line_2 text,
  city text not null,
  province text,
  postal_code text,
  country text not null default 'Pakistan',
  phone text,
  email text,
  map_url text,
  map_embed_url text,
  is_primary boolean not null default false,
  sort_order integer not null default 0,
  status content_status not null default 'draft'
);

alter table locations enable row level security;

create policy "Public can read published locations"
  on locations for select
  using (status = 'published');

create index locations_status_idx on locations (status);

-- global_faqs — FAQs shown on the site-wide /faq page, distinct from
-- product/service/collection-scoped FAQs (same faqs table, different
-- assignment) -----------------------------------------------------------

create table global_faqs (
  faq_id uuid primary key references faqs(id) on delete cascade,
  sort_order integer not null default 0
);

alter table global_faqs enable row level security;

create policy "Public can read global faq links for published faqs"
  on global_faqs for select
  using (exists (
    select 1 from faqs where faqs.id = global_faqs.faq_id and faqs.status = 'published'
  ));

-- quote_requests ------------------------------------------------------------

create table quote_requests (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  company text,
  email text not null,
  phone text not null,
  city text,
  product_id uuid references products(id) on delete set null,
  service_id uuid references services(id) on delete set null,
  quantity_text text,
  specification_text text,
  message text,
  attachment_path text,
  source_page text,
  status text not null default 'new' check (status in ('new', 'contacted', 'qualified', 'quoted', 'closed', 'spam')),
  created_at timestamptz not null default now()
);

alter table quote_requests enable row level security;
-- Deliberately no policies — see note above.

create index quote_requests_status_idx on quote_requests (status);
create index quote_requests_created_at_idx on quote_requests (created_at);
