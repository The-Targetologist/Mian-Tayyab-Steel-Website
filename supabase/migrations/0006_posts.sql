-- Phase 8 — Blog/insights schema. See docs/09-content-and-database-model.md
-- §13-14.
--
-- Taxonomies (post_categories/post_tags) are deliberately not built —
-- doc09 §14 "Only implement taxonomies that content strategy will actually
-- use," and no real content strategy exists yet. Structured post↔product/
-- service/collection relations from docs/04-information-architecture.md's
-- "may relate to" language are also skipped for the same reason (aspirational
-- IA, not in doc09's actual schema) — editorial links within body content
-- cover this until real content strategy calls for structured relations.
--
-- RLS follows the same pattern as every other content table.

create table posts (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text not null unique,
  excerpt text,
  body text not null,
  featured_image_id uuid references media_assets(id) on delete set null,
  status content_status not null default 'draft',
  author_name text,
  seo_title text,
  seo_description text,
  canonical_url text,
  og_image_id uuid references media_assets(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  published_at timestamptz
);

alter table posts enable row level security;

create policy "Public can read published posts"
  on posts for select
  using (status = 'published');

create index posts_status_idx on posts (status);
create index posts_published_at_idx on posts (published_at desc);

create trigger posts_set_updated_at
  before update on posts
  for each row
  execute function set_updated_at();

-- related_posts (self-referential many-to-many, mirrors related_products) --

create table related_posts (
  post_id uuid not null references posts(id) on delete cascade,
  related_post_id uuid not null references posts(id) on delete cascade,
  sort_order integer not null default 0,
  primary key (post_id, related_post_id),
  constraint related_posts_no_self_reference check (post_id <> related_post_id)
);

alter table related_posts enable row level security;

create policy "Public can read related posts of published posts"
  on related_posts for select
  using (exists (
    select 1 from posts p1
    join posts p2 on p2.id = related_posts.related_post_id
    where p1.id = related_posts.post_id
      and p1.status = 'published'
      and p2.status = 'published'
  ));
