-- Phase 11 — Storage bucket for quote request attachments. Already applied
-- directly via the Supabase admin client (storage.createBucket) for this
-- project — this file exists so the setup is reproducible on another
-- environment via the SQL Editor, same as supabase/migrations/0008_media_bucket.sql.
--
-- Private bucket, unlike `media` — quote_requests.attachment_path
-- (docs/09-content-and-database-model.md §18) stores a raw storage path,
-- not a media_assets.id, precisely because these are customer-submitted
-- drawings/specs, not admin-managed public marketing assets. Files are
-- viewed by admins via short-lived signed URLs generated on demand
-- (lib/queries/admin/inquiries.ts), never a permanent public URL.
--
-- Same size/type limits as the `media` bucket — a reasonable default for
-- drawings/specs (images + PDF), not a documented requirement to invent
-- beyond.

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'quote-attachments',
  'quote-attachments',
  false,
  10485760, -- 10MB
  array['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'application/pdf']
)
on conflict (id) do nothing;
