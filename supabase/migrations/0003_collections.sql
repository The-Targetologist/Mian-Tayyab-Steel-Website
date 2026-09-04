-- Phase 5 — Collection/application system schema. See
-- docs/09-content-and-database-model.md §7-8.
--
-- content_blocks is a JSONB array of a controlled block-type union (see
-- types/content.ts CollectionBlock) — not arbitrary HTML. Product
-- relationships flow through collection_products, not a block type.
--
-- RLS follows the same pattern as products (0001): public SELECT scoped to
-- published content only; writes are service-role only until Phase 9/10.

create table collections (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  kicker text,
  h1 text not null,
  short_description text,
  hero_image_id uuid references media_assets(id) on delete set null,
  intro_richtext text,
  content_blocks jsonb not null default '[]'::jsonb,
  brochure_media_id uuid references media_assets(id) on delete set null,
  status content_status not null default 'draft',
  sort_order integer not null default 0,
  seo_title text,
  seo_description text,
  canonical_url text,
  og_image_id uuid references media_assets(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  published_at timestamptz
);

alter table collections enable row level security;

create policy "Public can read published collections"
  on collections for select
  using (status = 'published');

create index collections_status_idx on collections (status);
create index collections_sort_order_idx on collections (sort_order);

create trigger collections_set_updated_at
  before update on collections
  for each row
  execute function set_updated_at();

-- collection_products ------------------------------------------------------

create table collection_products (
  collection_id uuid not null references collections(id) on delete cascade,
  product_id uuid not null references products(id) on delete cascade,
  sort_order integer not null default 0,
  primary key (collection_id, product_id)
);

alter table collection_products enable row level security;

create policy "Public can read collection products of published collections"
  on collection_products for select
  using (exists (
    select 1 from collections
    join products on products.id = collection_products.product_id
    where collections.id = collection_products.collection_id
      and collections.status = 'published'
      and products.status = 'published'
  ));

create index collection_products_collection_id_idx on collection_products (collection_id);

-- collection_faqs -----------------------------------------------------------

create table collection_faqs (
  collection_id uuid not null references collections(id) on delete cascade,
  faq_id uuid not null references faqs(id) on delete cascade,
  sort_order integer not null default 0,
  primary key (collection_id, faq_id)
);

alter table collection_faqs enable row level security;

create policy "Public can read faq links of published collections"
  on collection_faqs for select
  using (exists (
    select 1 from collections
    join faqs on faqs.id = collection_faqs.faq_id
    where collections.id = collection_faqs.collection_id
      and collections.status = 'published'
      and faqs.status = 'published'
  ));

create index collection_faqs_collection_id_idx on collection_faqs (collection_id);
