-- Development seed data — NOT confirmed Mian Tayyab Steel catalogue.
--
-- These rows exist only so the /products UI can be built and reviewed
-- against realistic content shape (name/description length, spec counts,
-- etc.) before the real catalogue is supplied. Product names use generic,
-- industry-standard steel category terms (not proprietary to any company);
-- all descriptions are written fresh for this seed, not copied from any
-- reference site.
--
-- status is 'draft' so none of this can appear on the public site even if
-- this file is accidentally re-run against a live project — see
-- docs/PROJECT_STATE.md "Pending Brand Inputs" (product catalogue is still
-- unconfirmed) and docs/16-claude-project-rules.md rule 5 (never invent
-- product specifications and present them as real).
--
-- Replace/remove this file once the real MTS catalogue is confirmed.

insert into products (name, slug, short_name, short_description, intro_richtext, origin, status, sort_order, is_featured)
values
  (
    'Hot Rolled Coil',
    'hot-rolled-coil',
    'HRC',
    'Hot rolled steel coil for structural and general fabrication use.',
    'Hot rolled coil is produced by rolling steel at high temperature, giving it a workable finish suited to cutting, welding and forming.',
    null,
    'draft',
    1,
    true
  ),
  (
    'Cold Rolled Coil',
    'cold-rolled-coil',
    'CRC',
    'Cold rolled steel coil with a smoother finish and tighter tolerances than hot rolled stock.',
    'Cold rolled coil is further processed at room temperature after hot rolling, producing a smoother surface and more precise thickness — suited to applications where finish and tolerance matter.',
    null,
    'draft',
    2,
    true
  ),
  (
    'MS Angle',
    'ms-angle',
    'Angle',
    'Mild steel angle sections for structural framing and general fabrication.',
    'MS angle is an L-shaped structural section used for framing, brackets, supports and general fabrication work.',
    null,
    'draft',
    3,
    false
  )
on conflict (slug) do nothing;

insert into product_specifications (product_id, label, value, unit, sort_order)
select id, 'Thickness range', '1.2 – 12', 'mm', 1 from products where slug = 'hot-rolled-coil'
union all
select id, 'Width range', '900 – 1500', 'mm', 2 from products where slug = 'hot-rolled-coil'
union all
select id, 'Thickness range', '0.3 – 3', 'mm', 1 from products where slug = 'cold-rolled-coil'
union all
select id, 'Width range', '600 – 1250', 'mm', 2 from products where slug = 'cold-rolled-coil'
union all
select id, 'Size range', '25x25 – 100x100', 'mm', 1 from products where slug = 'ms-angle'
union all
select id, 'Thickness range', '3 – 10', 'mm', 2 from products where slug = 'ms-angle'
on conflict (product_id, label) do nothing;

insert into product_applications (product_id, title, description, sort_order)
select id, 'General fabrication', null, 1 from products where slug = 'hot-rolled-coil'
union all
select id, 'Structural components', null, 2 from products where slug = 'hot-rolled-coil'
union all
select id, 'Appliance and equipment panels', null, 1 from products where slug = 'cold-rolled-coil'
union all
select id, 'Precision fabrication', null, 2 from products where slug = 'cold-rolled-coil'
union all
select id, 'Structural framing', null, 1 from products where slug = 'ms-angle'
union all
select id, 'Brackets and supports', null, 2 from products where slug = 'ms-angle'
on conflict (product_id, title) do nothing;

insert into faqs (question, answer_richtext, status, sort_order)
values
  ('What thickness tolerances do you work to?', 'Tolerances vary by product and order size — share your specification and we will confirm what we can supply.', 'draft', 1),
  ('Can you supply cut-to-size orders?', 'Get in touch with your required sizes and quantities and our team will confirm availability.', 'draft', 2)
on conflict (question) do nothing;
