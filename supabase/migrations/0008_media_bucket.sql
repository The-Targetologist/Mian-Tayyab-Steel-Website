-- Phase 10 — Storage bucket for media_assets. Already applied directly via
-- the Supabase admin client (storage.createBucket) for this project — this
-- file exists so the setup is reproducible on another environment (staging/
-- production) via the SQL Editor, consistent with every other migration
-- here, and so the decision is recorded in version control, not just chat
-- history.
--
-- One public bucket, not split per entity — media_assets already separates
-- `bucket` and `path` columns (docs/09-content-and-database-model.md §5),
-- so a single bucket organized by path prefix (products/, collections/,
-- services/, blog/) fits that schema better than one bucket per entity.
--
-- Public read (not signed URLs) — this is a public marketing site; every
-- product/collection/service image needs a stable public URL.
-- next.config.ts's images.remotePatterns already targets
-- /storage/v1/object/public/**, which only makes sense for a public bucket.
--
-- No custom storage.objects RLS policies — uploads go through the
-- privileged admin client (lib/supabase/admin.ts), which bypasses storage
-- RLS the same way it bypasses table RLS for every other admin write in
-- this project; public reads go through the public bucket's public URL,
-- which bypasses RLS by design. Consistent with the existing security
-- model rather than introducing a second one.

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'media',
  'media',
  true,
  10485760, -- 10MB
  array['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'application/pdf']
)
on conflict (id) do nothing;
