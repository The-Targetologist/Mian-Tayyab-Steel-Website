-- Development seed data — NOT confirmed Mian Tayyab Steel collections.
-- Same caveats as supabase/seed.sql: generic industry terminology, fresh
-- wording (not copied from any reference site), status 'draft' so nothing
-- shows publicly. Requires supabase/migrations/0003_collections.sql applied
-- first, and supabase/seed.sql applied first (links to its seeded products).
--
-- Every insert below is idempotent (on conflict do nothing) — the
-- collection_products/collection_faqs tables use composite primary keys, so
-- this doesn't need the same follow-up fix as the original seed.sql did.

insert into collections (name, slug, kicker, h1, short_description, intro_richtext, content_blocks, status, sort_order)
values (
  'Construction Steel',
  'construction-steel',
  'Application',
  'Construction Steel',
  'Steel products suited to construction, fabrication and structural framing.',
  'Construction steel covers the range of hot rolled, cold rolled and structural sections used across residential, commercial and infrastructure projects.',
  '[
    {
      "type": "feature_list",
      "title": "Why steel for construction",
      "items": [
        { "title": "Speed", "description": "Prefabricated and cut-to-size sections speed up on-site work." },
        { "title": "Strength", "description": "High strength-to-weight ratio suited to structural loads." },
        { "title": "Flexibility", "description": "Can be cut, welded and formed to project-specific requirements." }
      ]
    },
    {
      "type": "selection_guide",
      "title": "How to choose",
      "steps": [
        { "title": "Define the load requirement", "description": "Structural vs. non-structural use changes which section is appropriate." },
        { "title": "Confirm finish requirements", "description": "Hot rolled vs. cold rolled vs. galvanized depends on exposure and finish needs." },
        { "title": "Share drawings or specifications", "description": "Send us your requirement and we will confirm suitable products." }
      ]
    }
  ]'::jsonb,
  'draft',
  1
)
on conflict (slug) do nothing;

insert into collection_products (collection_id, product_id, sort_order)
select c.id, p.id, 1 from collections c, products p where c.slug = 'construction-steel' and p.slug = 'hot-rolled-coil'
union all
select c.id, p.id, 2 from collections c, products p where c.slug = 'construction-steel' and p.slug = 'cold-rolled-coil'
union all
select c.id, p.id, 3 from collections c, products p where c.slug = 'construction-steel' and p.slug = 'ms-angle'
on conflict (collection_id, product_id) do nothing;
