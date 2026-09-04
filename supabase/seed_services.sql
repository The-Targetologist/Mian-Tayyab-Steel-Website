-- Development seed data — NOT confirmed Mian Tayyab Steel services.
-- Same caveats as supabase/seed.sql: generic industry terminology, fresh
-- wording, status 'draft' so nothing shows publicly. Requires
-- supabase/migrations/0004_services.sql and supabase/seed.sql applied first.

insert into services (name, slug, short_description, intro_richtext, status, sort_order)
values (
  'Steel Cutting',
  'steel-cutting',
  'Cutting steel coil and sheet to size for fabrication and construction projects.',
  'We cut coil and sheet steel to your required dimensions, supporting fabrication and construction projects that need material ready for the next step.',
  'draft',
  1
)
on conflict (slug) do nothing;

insert into service_capabilities (service_id, label, value, unit, sort_order)
select id, 'Materials supported', 'Hot rolled, cold rolled, mild steel', null, 1 from services where slug = 'steel-cutting'
union all
select id, 'Thickness range', '0.3 – 12', 'mm', 2 from services where slug = 'steel-cutting'
on conflict (service_id, label) do nothing;

insert into service_requirements (service_id, title, description, sort_order)
select id, 'Provide dimensions', 'Share the sizes and quantities you need cut.', 1 from services where slug = 'steel-cutting'
union all
select id, 'Confirm material grade', 'Let us know if you have a specific grade requirement.', 2 from services where slug = 'steel-cutting'
on conflict (service_id, title) do nothing;

insert into product_services (product_id, service_id, sort_order)
select p.id, s.id, 1 from products p, services s where p.slug = 'hot-rolled-coil' and s.slug = 'steel-cutting'
union all
select p.id, s.id, 2 from products p, services s where p.slug = 'cold-rolled-coil' and s.slug = 'steel-cutting'
on conflict (product_id, service_id) do nothing;
