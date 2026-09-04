-- Phase 10 — Site Settings admin screen. See
-- docs/09-content-and-database-model.md §20 and docs/10-admin-panel.md
-- "Site settings" (contact details, WhatsApp, social links, footer, default
-- brochure/profile, default SEO/social image).
--
-- Singleton table: exactly one row, id fixed to 1. Typed columns per doc09's
-- explicit warning ("avoid a single uncontrolled JSON blob for everything")
-- — `social_urls` is the one deliberately flexible jsonb field, since "social
-- URLs" is itself an open-ended set of platform->URL pairs, not the whole
-- settings object.

create table site_settings (
  id integer primary key default 1,
  company_legal_name text,
  primary_phone text,
  whatsapp text,
  primary_email text,
  social_urls jsonb not null default '{}'::jsonb,
  default_seo_title text,
  default_seo_description text,
  default_og_image_id uuid references media_assets(id) on delete set null,
  footer_description text,
  brochure_media_id uuid references media_assets(id) on delete set null,
  updated_at timestamptz not null default now(),
  constraint site_settings_singleton check (id = 1)
);

alter table site_settings enable row level security;

-- Unlike content_status-gated tables, settings have no draft/published
-- distinction — they're live site-wide config, so any row (there is only
-- ever one) is public.
create policy "Public can read site settings"
  on site_settings for select
  using (true);

create trigger site_settings_set_updated_at
  before update on site_settings
  for each row
  execute function set_updated_at();

insert into site_settings (id) values (1);
