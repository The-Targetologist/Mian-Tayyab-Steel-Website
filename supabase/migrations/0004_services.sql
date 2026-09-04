-- Phase 6 — Service system schema. See docs/09-content-and-database-model.md
-- §9-11 and docs/02-reference-site-audit.md's "structured operational
-- fields" note (materials/tolerance/formats/turnaround — not invented,
-- populated later when real service data is supplied).
--
-- RLS follows the same pattern as products/collections: public SELECT
-- scoped to published content only; writes are service-role only.

create table services (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  short_description text,
  intro_richtext text,
  body_richtext text,
  featured_image_id uuid references media_assets(id) on delete set null,
  service_area text,
  status content_status not null default 'draft',
  sort_order integer not null default 0,
  is_featured boolean not null default false,
  seo_title text,
  seo_description text,
  canonical_url text,
  og_image_id uuid references media_assets(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  published_at timestamptz
);

alter table services enable row level security;

create policy "Public can read published services"
  on services for select
  using (status = 'published');

create index services_status_idx on services (status);
create index services_sort_order_idx on services (sort_order);

create trigger services_set_updated_at
  before update on services
  for each row
  execute function set_updated_at();

-- service_media (same role enum as product_media) ---------------------------

create table service_media (
  id uuid primary key default gen_random_uuid(),
  service_id uuid not null references services(id) on delete cascade,
  media_id uuid not null references media_assets(id) on delete cascade,
  role product_media_role not null default 'gallery',
  sort_order integer not null default 0
);

alter table service_media enable row level security;

create policy "Public can read media of published services"
  on service_media for select
  using (exists (
    select 1 from services
    where services.id = service_media.service_id
      and services.status = 'published'
  ));

create index service_media_service_id_idx on service_media (service_id);

-- service_capabilities (CapabilityList — label/value/unit, like product specs) --

create table service_capabilities (
  id uuid primary key default gen_random_uuid(),
  service_id uuid not null references services(id) on delete cascade,
  label text not null,
  value text not null,
  unit text,
  sort_order integer not null default 0,
  unique (service_id, label)
);

alter table service_capabilities enable row level security;

create policy "Public can read capabilities of published services"
  on service_capabilities for select
  using (exists (
    select 1 from services
    where services.id = service_capabilities.service_id
      and services.status = 'published'
  ));

create index service_capabilities_service_id_idx on service_capabilities (service_id);

-- service_requirements (ProjectRequirementBlock) -----------------------------

create table service_requirements (
  id uuid primary key default gen_random_uuid(),
  service_id uuid not null references services(id) on delete cascade,
  title text not null,
  description text,
  sort_order integer not null default 0,
  unique (service_id, title)
);

alter table service_requirements enable row level security;

create policy "Public can read requirements of published services"
  on service_requirements for select
  using (exists (
    select 1 from services
    where services.id = service_requirements.service_id
      and services.status = 'published'
  ));

create index service_requirements_service_id_idx on service_requirements (service_id);

-- product_services (many-to-many) --------------------------------------------

create table product_services (
  product_id uuid not null references products(id) on delete cascade,
  service_id uuid not null references services(id) on delete cascade,
  sort_order integer not null default 0,
  primary key (product_id, service_id)
);

alter table product_services enable row level security;

create policy "Public can read product-service links when both published"
  on product_services for select
  using (exists (
    select 1 from products
    join services on services.id = product_services.service_id
    where products.id = product_services.product_id
      and products.status = 'published'
      and services.status = 'published'
  ));

create index product_services_product_id_idx on product_services (product_id);
create index product_services_service_id_idx on product_services (service_id);

-- service_faqs ----------------------------------------------------------------

create table service_faqs (
  service_id uuid not null references services(id) on delete cascade,
  faq_id uuid not null references faqs(id) on delete cascade,
  sort_order integer not null default 0,
  primary key (service_id, faq_id)
);

alter table service_faqs enable row level security;

create policy "Public can read faq links of published services"
  on service_faqs for select
  using (exists (
    select 1 from services
    join faqs on faqs.id = service_faqs.faq_id
    where services.id = service_faqs.service_id
      and services.status = 'published'
      and faqs.status = 'published'
  ));

create index service_faqs_service_id_idx on service_faqs (service_id);
