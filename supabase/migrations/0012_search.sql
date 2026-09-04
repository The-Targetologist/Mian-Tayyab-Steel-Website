-- Phase 12 — Site search. See docs/11-technical-architecture.md "Search"
-- ("Postgres full-text / trigram search," "server-side combined query
-- across content types," explicitly "do not add Algolia/third-party search
-- until scale justifies it") and docs/02-reference-site-audit.md ("should
-- cover, at minimum: products, collections/applications, services, blog
-- posts, core pages").
--
-- Generated tsvector columns + GIN indexes on the four searchable content
-- tables (the "index" side), unioned by a single search_content() RPC (the
-- "server-side combined query" side) so the app makes one call across
-- content types rather than four separate round-trips merged client-side.
-- "Core pages" (About/FAQ/Contact) have no dynamic body content to index —
-- handled as a small static list in the application query layer instead.

alter table products add column search_vector tsvector
  generated always as (
    to_tsvector('english',
      coalesce(name, '') || ' ' ||
      coalesce(short_description, '') || ' ' ||
      coalesce(intro_richtext, '')
    )
  ) stored;
create index products_search_vector_idx on products using gin (search_vector);

alter table collections add column search_vector tsvector
  generated always as (
    to_tsvector('english',
      coalesce(name, '') || ' ' ||
      coalesce(short_description, '') || ' ' ||
      coalesce(intro_richtext, '')
    )
  ) stored;
create index collections_search_vector_idx on collections using gin (search_vector);

alter table services add column search_vector tsvector
  generated always as (
    to_tsvector('english',
      coalesce(name, '') || ' ' ||
      coalesce(short_description, '') || ' ' ||
      coalesce(intro_richtext, '') || ' ' ||
      coalesce(body_richtext, '')
    )
  ) stored;
create index services_search_vector_idx on services using gin (search_vector);

alter table posts add column search_vector tsvector
  generated always as (
    to_tsvector('english',
      coalesce(title, '') || ' ' ||
      coalesce(excerpt, '') || ' ' ||
      coalesce(body, '')
    )
  ) stored;
create index posts_search_vector_idx on posts using gin (search_vector);

-- SECURITY INVOKER (the default) — runs as the calling role, so RLS still
-- applies on top of the explicit status='published' filters below. The
-- filters are redundant with RLS but kept explicit so the function's own
-- logic is correct independent of RLS ever changing.
create or replace function search_content(search_query text)
returns table (
  content_type text,
  id uuid,
  slug text,
  title text,
  excerpt text,
  rank real
)
language sql
stable
as $$
  select 'product', id, slug, name, short_description,
    ts_rank(search_vector, websearch_to_tsquery('english', search_query)) as rank
  from products
  where status = 'published' and search_vector @@ websearch_to_tsquery('english', search_query)
  union all
  select 'collection', id, slug, name, short_description,
    ts_rank(search_vector, websearch_to_tsquery('english', search_query))
  from collections
  where status = 'published' and search_vector @@ websearch_to_tsquery('english', search_query)
  union all
  select 'service', id, slug, name, short_description,
    ts_rank(search_vector, websearch_to_tsquery('english', search_query))
  from services
  where status = 'published' and search_vector @@ websearch_to_tsquery('english', search_query)
  union all
  select 'post', id, slug, title, excerpt,
    ts_rank(search_vector, websearch_to_tsquery('english', search_query))
  from posts
  where status = 'published' and search_vector @@ websearch_to_tsquery('english', search_query)
  order by rank desc
  limit 50;
$$;

grant execute on function search_content(text) to anon, authenticated;
