-- Phase 4 — Product system schema. See docs/09-content-and-database-model.md.
--
-- RLS: public SELECT is scoped to published content only (child tables check
-- their parent product's status). Writes are service-role only for now —
-- authenticated admin write policies land with Supabase Auth + role checks
-- in Phase 9/10 (docs/09-content-and-database-model.md "Row Level Security":
-- do not equate authenticated with admin).

create extension if not exists pgcrypto;

create type content_status as enum ('draft', 'published', 'archived');

-- media_assets ---------------------------------------------------------

create table media_assets (
  id uuid primary key default gen_random_uuid(),
  bucket text not null,
  path text not null,
  public_url text not null,
  alt_text text,
  caption text,
  width integer,
  height integer,
  mime_type text not null,
  size_bytes integer not null,
  created_at timestamptz not null default now()
);

alter table media_assets enable row level security;

create policy "Public can read media assets"
  on media_assets for select
  using (true);

-- products ---------------------------------------------------------------

create table products (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  short_name text,
  short_description text,
  intro_richtext text,
  body_richtext text,
  featured_image_id uuid references media_assets(id) on delete set null,
  origin text,
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

alter table products enable row level security;

create policy "Public can read published products"
  on products for select
  using (status = 'published');

create index products_status_idx on products (status);
create index products_sort_order_idx on products (sort_order);

-- product_specifications ---------------------------------------------------

create table product_specifications (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references products(id) on delete cascade,
  label text not null,
  value text not null,
  unit text,
  sort_order integer not null default 0
);

alter table product_specifications enable row level security;

create policy "Public can read specs of published products"
  on product_specifications for select
  using (exists (
    select 1 from products
    where products.id = product_specifications.product_id
      and products.status = 'published'
  ));

create index product_specifications_product_id_idx on product_specifications (product_id);

-- product_features ----------------------------------------------------------

create table product_features (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references products(id) on delete cascade,
  title text,
  description text not null,
  sort_order integer not null default 0
);

alter table product_features enable row level security;

create policy "Public can read features of published products"
  on product_features for select
  using (exists (
    select 1 from products
    where products.id = product_features.product_id
      and products.status = 'published'
  ));

create index product_features_product_id_idx on product_features (product_id);

-- product_applications --------------------------------------------------

create table product_applications (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references products(id) on delete cascade,
  title text not null,
  description text,
  sort_order integer not null default 0
);

alter table product_applications enable row level security;

create policy "Public can read applications of published products"
  on product_applications for select
  using (exists (
    select 1 from products
    where products.id = product_applications.product_id
      and products.status = 'published'
  ));

create index product_applications_product_id_idx on product_applications (product_id);

-- product_media -----------------------------------------------------------

create type product_media_role as enum ('gallery', 'featured', 'diagram', 'document');

create table product_media (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references products(id) on delete cascade,
  media_id uuid not null references media_assets(id) on delete cascade,
  role product_media_role not null default 'gallery',
  sort_order integer not null default 0
);

alter table product_media enable row level security;

create policy "Public can read media of published products"
  on product_media for select
  using (exists (
    select 1 from products
    where products.id = product_media.product_id
      and products.status = 'published'
  ));

create index product_media_product_id_idx on product_media (product_id);

-- related_products (self-referential many-to-many) ------------------------

create table related_products (
  product_id uuid not null references products(id) on delete cascade,
  related_product_id uuid not null references products(id) on delete cascade,
  sort_order integer not null default 0,
  primary key (product_id, related_product_id),
  constraint related_products_no_self_reference check (product_id <> related_product_id)
);

alter table related_products enable row level security;

create policy "Public can read related products of published products"
  on related_products for select
  using (exists (
    select 1 from products p1
    join products p2 on p2.id = related_products.related_product_id
    where p1.id = related_products.product_id
      and p1.status = 'published'
      and p2.status = 'published'
  ));

-- faqs (shared table — also linked from services/collections in later phases) --

create table faqs (
  id uuid primary key default gen_random_uuid(),
  question text not null,
  answer_richtext text not null,
  status content_status not null default 'draft',
  sort_order integer not null default 0
);

alter table faqs enable row level security;

create policy "Public can read published faqs"
  on faqs for select
  using (status = 'published');

create table product_faqs (
  product_id uuid not null references products(id) on delete cascade,
  faq_id uuid not null references faqs(id) on delete cascade,
  sort_order integer not null default 0,
  primary key (product_id, faq_id)
);

alter table product_faqs enable row level security;

create policy "Public can read faq links of published products"
  on product_faqs for select
  using (exists (
    select 1 from products
    join faqs on faqs.id = product_faqs.faq_id
    where products.id = product_faqs.product_id
      and products.status = 'published'
      and faqs.status = 'published'
  ));

create index product_faqs_product_id_idx on product_faqs (product_id);

-- updated_at trigger --------------------------------------------------------

create or replace function set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger products_set_updated_at
  before update on products
  for each row
  execute function set_updated_at();
