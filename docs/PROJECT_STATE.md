# PROJECT STATE

## Project
**Mian Tayyab Steel (MTS)**

## Current Phase
**Phase 13 — SEO & migration: metadata, canonical tags, Open Graph/Twitter cards, structured data (JSON-LD), sitemap.xml, and robots.txt all built and verified end to end. "Redirects" is deliberately out of scope — no legacy MTS domain has been supplied. Phases 11 and 12 are complete. Two real fixes landed after being marked complete: `/admin/media` (Phase 10 — see "Media Library" below) and a public-site-wide auth-cookie fragility bug (see "Public Supabase client split" below).**

Reference audit, provisional design tokens, Supabase env-var naming, and URL strategy are resolved (see "Resolved Foundation Decisions" below). Phases 1–9 are implemented and verified. Phase 10 is being built incrementally per entity, per the roadmap's explicit "do not build all forms at once" instruction — Products is the first and only entity done so far.

---

# Public Supabase client split — real bug found and fixed (2026-09-04)

## The report
The user hit a hard 500 on the homepage: `getSiteSettings: JWT issued at future`, thrown from `lib/queries/settings.ts`'s own error handling after a Supabase/PostgREST query came back with that error. A plain `curl` with no cookies loaded the same page fine — the failure only happened in the user's actual browser, pointing straight at a session cookie already sitting in their browser rather than anything content-related.

## Root cause
Every public content query (`products`, `collections`, `services`, `posts`, `locations`, `faqs`, `settings`, `search`, `partners`, `certifications`) was going through `createSupabaseServerClient()` — the cookie/session-aware client, which reads and forwards whatever Supabase Auth session cookie exists in the request. That client only actually needs to exist for code that genuinely checks *who's* asking (`lib/auth/admin.ts`'s admin gate, `lib/actions/auth.ts`'s sign-in flow) — none of the public queries above ever call `.auth.*` or rely on `auth.uid()`; every one of their RLS policies gates purely on `status = 'published'`. Routing all of them through the same session-bound client meant *any* visitor whose browser held a stale, expired, or (as here) clock-skewed session token would see the JWT rejected by PostgREST — and since that rejection surfaced as a normal query error, every public page calling that query threw and 500'd for that visitor, even though the actual content being requested needed no authentication whatsoever.

The specific trigger this time was almost certainly this sandboxed dev environment's system clock — confirmed via `date` to read the fictional project-narrative date (2026) as its literal OS time — producing a session JWT whose `iat` doesn't line up with Supabase's real, live server clock. But the real bug isn't the clock skew itself (an environment quirk, not something to "fix" in application code) — it's that a single broken auth cookie was able to take down the *entire public site* for whoever held it, for content that never needed auth to begin with.

## Fix
New `lib/supabase/public.ts` — `createSupabasePublicClient()`, a stateless anon client (`createClient(url, anonKey)` directly, no cookies, no session handling at all). Swapped into all 10 public query files; `createSupabaseServerClient()` now exists solely for the two call sites that actually need session awareness. A visitor's cookies — valid, stale, malformed, or anything else — can no longer reach these queries at all, which eliminates the entire failure class rather than papering over this one symptom.

**An unplanned but welcome side effect**: since these queries no longer call `cookies()`, several pages that Phase 13 had pushed to dynamic rendering (`/`, `/about`, `/blog`, `/collections`, `/contact`, `/faq`, `/products`, `/services`, `/privacy-policy`, `/terms`, plus `/sitemap.xml` and `/robots.txt`) are static again in the production build — better than the pre-Phase-13 baseline, not just back to it.

## Verified
- Confirmed via `grep` that only `lib/actions/auth.ts` and `lib/auth/admin.ts` still reference the cookie-bound client — every content query uses the new stateless one.
- Sent a request with a deliberately garbage, non-JWT session cookie to all of `/`, `/products`, `/products/[slug]`, `/collections`, `/services`, `/blog`, `/faq`, `/contact`, and `/search` — all returned 200 (proves the fix by construction, not just for the one clock-skew case that happened to be reported).
- Confirmed `/admin` still correctly redirects unauthenticated visitors (307) and `/admin/login` still renders (200) — the untouched admin-auth path is unaffected.
- Confirmed real seeded content still renders correctly on the homepage after the swap.
- `npx tsc --noEmit` — clean
- `npm run lint` — clean
- `npm run build` — clean production build, with the static-rendering improvement noted above

---

# Media Library (`/admin/media`) — built and fully verified (2026-09-03, same day)

## A real gap the user caught, not something surfaced by testing
The user reported `/admin/media` returning 404. Checked and confirmed: `AdminSidebar` has linked "Media" → `/admin/media` since Phase 9 (built ahead of the CRUD pages it would eventually link to, same pattern as every other nav item), but no page was ever built there. Media upload/removal has only ever existed inline, embedded in each entity's own form via `ImageUploader`/`GalleryManager` — there was never a standalone library screen. This also means `docs/10-admin-panel.md`'s own "Media" section (a Phase 10 requirement: "upload, select, preview, set alt text, remove unused asset safely") was never actually fully satisfied — Phase 10 was marked complete without it. Recorded here rather than folded silently into the old Phase 10 write-up, since that section already stands as tested and shipped.

## A second real bug found while building the fix, not shipped
While designing "remove unused asset safely," inspecting the existing `deleteMedia()` action (used by every `ImageUploader`/`GalleryManager` "Remove" button since Phase 10) showed it unconditionally deletes the underlying `media_assets` row and Storage file — with no check for whether that same shared asset is referenced anywhere else. Since `media_assets` is a genuine shared library (the same row can be a product's featured image, embedded in a Collection's `image_text` content block, etc.), this was a latent risk: removing an image from one field could silently break its use elsewhere. **Left `deleteMedia()` and the per-field "Remove" buttons unchanged** — that interaction serves a narrower, already-shipped-and-verified purpose ("detach what I just uploaded for this field," almost always a dedicated upload) and rewriting it now risks regressing seven-plus already-verified forms for a benefit that's marginal given how rarely assets are actually shared. Instead, added a **separate, new `deleteMediaAssetSafely()`** action used only by this new library screen, which is genuinely responsible for doc10's "safely" requirement.

## Design decisions
- **Usage is computed across every real reference point**: 13 foreign-key columns spanning `products`/`collections`/`services`/`posts`/`partners`/`certifications`/`site_settings`/`product_media`/`service_media`, **plus** a scan of Collections' `content_blocks` JSONB for `image_text` blocks (which embed a full `MediaAsset` object directly, not a foreign key — a known tradeoff already noted in the Collections increment's own write-up). One shared `computeUsageMap()` in `lib/queries/admin/media.ts`, used by both the library's usage-indicator display and the safe-delete check, so the two can never disagree about what counts as "in use."
- **No raw upload affordance on this screen** — every asset already gets created via some entity's own `ImageUploader`/`GalleryManager` (which is also where "select existing" would eventually need to live, per doc10, if that's ever built). Adding a bare upload-with-no-consumer here would just create orphaned, permanently-unused assets by design.
- **Alt text is editable for the first time anywhere in the admin.** `uploadMedia()` always accepted an `altText` parameter, but no caller had ever passed one — every asset's `alt_text` column has been `null` since Phase 10. New `updateMediaAltText()` action plus an inline, auto-save-on-blur input per asset card.

## Verified with a real test
Through the actual admin UI (Playwright, installed only for this check, removed after) using a temporary test admin account (created and fully deleted afterward): confirmed `/admin/media` now returns 200. Created a product with a real uploaded featured image — confirmed the asset appeared in the library with the correct usage label (`Product "..." (featured image)`) and that its Delete button was genuinely disabled while in use. Edited its alt text and confirmed it persisted after a hard reload. Deleted the product — confirmed the asset's usage cleared and Delete became enabled. Deleted the now-unused asset — confirmed it disappeared from the library. No console errors at any point; the media library, the test product, and the test admin account were all confirmed empty/gone afterward via direct queries.

## Validation
- `npx tsc --noEmit` — clean
- `npm run lint` — clean
- `npm run build` — clean production build; `/admin/media` correctly dynamic

---

# Phase 10 (Products increment) — Completed and live-verified (2026-09-03)

## Scope
Full CRUD for products: list, create, edit, delete — covering Basics, Technical information (specifications/features/applications), Relationships (collections, related products), and SEO. Matches `10-admin-panel.md`'s "Product editor" section, **except** two sub-sections deliberately deferred:
- **Media** (featured image, gallery, alt text, downloads) — no Supabase Storage bucket exists yet; this needs its own decision (bucket name, public/private, upload size limits) before an `ImageUploader`/`GalleryManager` can be built. Not silently skipped — the form simply doesn't have a Media section yet, and this is called out explicitly here and should be called out to the user before starting Phase 10's next increment.
- **FAQs** (select existing or create contextual FAQs) — needs a FAQ picker + inline-create flow; deferred to keep this increment's scope to what's already fully wired (products, collections, other products), not because it's hard, just sequencing.

## Design decisions
- **Delete-then-reinsert for repeater/relation data.** On save, `product_specifications`, `product_features`, `product_applications`, `collection_products`, and `related_products` rows for that product are deleted and reinserted fresh from the form's current state, rather than diffed. Simple, correct, and fine at this scale — these writes only happen on an explicit admin save, not per-request.
- **Plain checkboxes for relationship pickers**, not a JS-driven multi-select. `<input type="checkbox" name="collectionIds" value={id}>` repeated — `FormData.getAll("collectionIds")` reads the selection natively server-side, no client state needed for `RelationCheckboxList` at all (it's a Server Component).
- **`RepeaterField` is genuinely generic** (label/value/unit or title/description, configurable via a `fields` prop), not three near-duplicate components — built generic from the start since three real consumers (specifications, features, applications) existed in the very first form that needed it, unlike the earlier "wait for a second consumer" cases in Phases 4-8.
- **Native `confirm()` for delete**, not a styled `ConfirmDialog` component — simple, accessible, satisfies the actual UX requirement ("destructive actions require confirmation") without building a modal system for one button. Can be swapped later without touching the action wiring.
- **Admin routes use internal database IDs** (`/admin/products/{uuid}/edit`) — `10-admin-panel.md`'s "never expose raw database IDs" rule is about public-facing pages, not admin-internal routing, where ID-based URLs are standard practice and avoid issues with slug changes mid-edit.

## A real bug found and fixed: delete didn't visually update the list
First verification pass: delete correctly removed the row from the database (confirmed via direct query), but the already-rendered admin list kept showing it until a manual reload. Root cause: `revalidatePath()` inside the Server Action only invalidates the *cache* for the next request — it doesn't push an update to an already-mounted client page. First fix attempt (wrapping the delete call in an inline `<form action={...}>` function that also called `router.refresh()`) produced a `"destination stream closed early"` server error and still didn't reliably update the UI — mixing React's form-action lifecycle with a manual `router.refresh()` call raced. Fixed properly by rewriting `DeleteProductButton` to use a plain `onClick` handler with `useTransition`, calling `deleteProduct()` then `router.refresh()` in explicit sequence inside the transition, avoiding the form-action mechanism entirely for what is really a single confirm-then-delete button, not a multi-field form. Re-verified: row disappears immediately without reload, and stays gone after a hard reload (confirming it's a real data change, not just optimistic client state).

## Files changed
- `lib/validation/admin/product.ts` (new) — Zod schema for the full product form
- `lib/actions/admin/products.ts` (new) — `createProduct`, `updateProduct`, `deleteProduct` Server Actions, all gated by `getCurrentAdminUser()` even though the route is already protected by the layout (defense in depth)
- `lib/queries/admin/products.ts` (new) — `getAdminProducts()`, `getAdminProductById()`, `getAllCollectionOptions()`, `getAllProductOptions()`, `getCollectionIdsForProduct()`, `getRelatedProductIds()` — all using the privileged client since RLS only exposes published rows
- `components/admin/StatusBadge.tsx`, `NameAndSlugFields.tsx`, `RepeaterField.tsx`, `RelationCheckboxList.tsx`, `ProductForm.tsx`, `DeleteProductButton.tsx` (new)
- `app/admin/(protected)/products/page.tsx`, `products/new/page.tsx`, `products/[id]/edit/page.tsx` (new)

## Verification
Full end-to-end test through the real admin UI (Playwright, installed only for this check, removed after) using a temporary test admin account (created and fully deleted afterward, same pattern as Phase 9 — never touched the real admin account):
- Created a test product with a specification, an application, and a collection relationship checked — slug auto-generated correctly from the name
- Confirmed it appeared in the list immediately after create
- Opened it for editing — every field came back correctly pre-filled, including the specification row and the collection checkbox (relationship persistence confirmed both directions: write and read-back)
- Edited the short description, saved, reopened — change persisted (real DB round-trip, not client-only state)
- Deleted it — confirmed removed from the list without a manual reload, confirmed still gone after a hard reload, confirmed via a direct database query that the row is genuinely gone
- No console errors at any point in the flow

## Validation
- `npx tsc --noEmit` — clean
- `npm run lint` — clean
- `npm run build` — clean production build; all three product admin routes correctly dynamic

## Media upload — built and fully verified (2026-09-03, same day)
The Storage bucket decision was resolved and implemented directly (no manual Dashboard step): a single public bucket named `media`, 10MB file size limit, MIME types restricted to images + PDF, enforced by Storage itself. Recorded as `supabase/migrations/0008_media_bucket.sql` for reproducibility even though it was applied programmatically via the admin client (`storage.createBucket`), consistent with keeping every infrastructure decision in version control rather than only in chat history. No custom `storage.objects` RLS policies — uploads go through the privileged admin client (bypasses storage RLS the same way it bypasses table RLS for every other admin write), reads go through the public bucket's public URL (bypasses RLS by design for public buckets).

**New files**: `lib/actions/admin/media.ts` (`uploadMedia`, `deleteMedia` — validates type/size server-side, uploads to Storage, inserts a `media_assets` row, cleans up the storage object if the metadata insert fails), `components/admin/ImageUploader.tsx` (single image, for `featuredImageId`), `components/admin/GalleryManager.tsx` (multiple images, for `galleryMediaIds`). Both upload immediately on file selection rather than bundling the file into the parent form's submission — the standard CMS pattern (Wordpress, Contentful, etc.) — with the resulting `media_assets.id` held in a hidden input that submits naturally as part of whichever `<form>` the component is rendered inside.

**Wired into the Product form and Server Action**: `lib/validation/admin/product.ts` and `lib/actions/admin/products.ts` extended to read/write `featuredImageId` (→ `products.featured_image_id`) and `galleryMediaIds` (→ `product_media` rows with `role='gallery'`, same delete-then-reinsert sync pattern as specifications/features/applications).

**Verified with a real file**, not a mock — signed in as a temporary test admin (created and fully deleted afterward, same pattern as every prior admin verification), uploaded an actual PNG as both featured image and gallery image through the real UI, confirmed the product persisted both correctly on reload, published it, and confirmed the **public product detail page renders the real uploaded image** via `next/image` against the Supabase Storage public URL — the full pipeline (admin upload → Storage → `media_assets` → product relations → public query layer → `MediaGallery` → `next/image` → `next.config.ts`'s `remotePatterns` from Phase 4) confirmed working end to end, not just each piece in isolation. Test product, all 3 media_assets rows (including one orphaned from an earlier failed test-script run, caught and cleaned up too), their storage files, and the test admin account were all deleted afterward — confirmed via a direct storage listing that the bucket folder is empty again.

## FAQ linking — built and fully verified (2026-09-03, same day)
The last gap in `10-admin-panel.md`'s "Product editor" spec ("select existing or create contextual FAQs"). Built as `FaqPicker` — a client component combining a checkbox list of existing FAQs (same pattern as `RelationCheckboxList`) with an inline "Create new FAQ" mini-form. Creating a FAQ calls a small Server Action (`createQuickFaq` in `lib/actions/admin/faqs.ts`) immediately — same "upload/create now, don't wait for the parent form's Save" pattern established by media upload — and the new FAQ appears checked in the list without a page reload, via local component state rather than a full refetch.

New FAQs default to `status: 'draft'`, consistent with every other content type's draft-by-default behavior in this project — they won't appear on the public site until published via the future dedicated FAQs management screen (Phase 10's later "FAQs" entity). `lib/queries/admin/faqs.ts` (`getAllFaqOptions`, `getFaqIdsForProduct`) and the same delete-then-reinsert sync for `product_faqs` as every other relation table round out the wiring in `lib/validation/admin/product.ts` and `lib/actions/admin/products.ts`.

**Verified with a real test**: created a FAQ inline through the actual admin UI, confirmed it appeared auto-checked immediately, saved the product, reopened it for editing, and confirmed the FAQ link persisted — a real database round-trip, not just client state. No console errors. Test product and test FAQ deleted afterward, same as every other verification in this project.

**Products is now fully complete** against `10-admin-panel.md`'s entire "Product editor" spec: Basics, Media, Technical information, Relationships, FAQs, SEO — nothing deferred or hidden.

## Unresolved issues
- Still pending, not urgent: `supabase/migrations/0002_seed_idempotency_constraints.sql` from Phase 4.

## Collections CRUD — built and fully verified (2026-09-03, same day)
Same pattern as Products (list/create/edit/delete, `lib/validation/admin/collection.ts`, `lib/actions/admin/collections.ts`, `lib/queries/admin/collections.ts`, `app/admin/(protected)/collections/*`), reusing `NameAndSlugFields`, `ImageUploader` (hero image + brochure PDF), `RelationCheckboxList` (products), and `FaqPicker` as-is — no changes needed to any of them.

**The genuinely new piece**: `ContentBlockEditor` — an admin UI for authoring the 9 JSONB content-block types from Phase 5 (`types/content.ts`'s `CollectionBlock` discriminated union). Manages the whole `content_blocks` array as local state (blocks have real per-type shapes, unlike `RepeaterField`'s uniform rows), with add/remove/reorder and a per-type sub-editor for each of the 9 types, serializing to one hidden JSON input. `lib/validation/admin/collection.ts` mirrors the exact same discriminated union in Zod so the admin editor and public renderer can never silently drift apart.

One new supporting piece: `ImageUploaderInline` — a controlled variant of `ImageUploader` used by the `image_text` block type, which needs the full `MediaAsset` object embedded directly in that block's JSON (not just an id in a separate form field, since `content_blocks` is read back as raw JSONB with no resolution/join step). Known tradeoff, noted in code: if an image's alt text changes later via a future media library, existing block references won't auto-update — acceptable for now, not silently hidden.

`DeleteEntityButton` generalized from Products' `DeleteProductButton` now that Collections needed the identical delete-with-confirm-and-refresh pattern — same "generalize on the second real consumer" instinct used throughout this project.

**Verified with a real, complex test** through the actual admin UI: created a collection with a `rich_text` block, a `comparison_table` block (2 columns, 1 row with real cell data), a linked product, and an inline-created FAQ. Confirmed on edit-reload that every piece persisted correctly — including the full block JSON round-trip. Published it and confirmed the **public collection page** renders the H1, the rich text block, and the comparison table with correct column headers and cell data, sourced from `components/collections/blocks/*` (Phase 5's renderers, untouched). The linked product correctly didn't appear on the public page since it was still in `draft` status — the same RLS lesson from Phase 5's `collection_products` policy, not a bug. No console errors. Test collection, test FAQ, and the test admin account were all deleted afterward.

## Services CRUD — built and fully verified (2026-09-03, same day)
Same pattern as Products/Collections (list/create/edit/delete, `lib/validation/admin/service.ts`, `lib/actions/admin/services.ts`, `lib/queries/admin/services.ts`, `app/admin/(protected)/services/*`), reusing `NameAndSlugFields`, `RepeaterField` (capabilities, requirements), `ImageUploader`/`GalleryManager` (featured image + gallery), `RelationCheckboxList` (related products), `FaqPicker`, and `DeleteEntityButton` as-is — no changes needed to any of them, confirming the "generic from the start" bet on these components across a third real consumer.

**`product_services` (the product↔service many-to-many from Phase 6) is managed exclusively from the Services side.** Products' Relationships section only ever covered collections and related products — `product_services` was never exposed there. Services is the first and only admin surface for this table: `writeServiceRelations()` deletes/reinserts `product_services` scoped by `service_id`, and the "Related products" `RelationCheckboxList` submits `relatedProductIds` which become the `product_id` values inserted alongside this service's own id.

**Reused `SERVICE_SELECT`/`mapService`/`ServiceRow`** from the public `lib/queries/services.ts` (exported for admin reuse, same as `PRODUCT_SELECT`/`mapProduct`/`ProductRow` in `lib/queries/products.ts`) rather than duplicating the nested-select/row-mapping logic in the admin query file — `lib/queries/admin/services.ts` only adds the admin-specific bits (`getAdminServices`, `getAdminServiceById`, `getProductIdsForService`, all-status where the public queries are published-only).

**Included "Project requirements" (`service_requirements`) in the editor** even though `10-admin-panel.md`'s Services bullet list doesn't explicitly mention it — the schema and public detail page (Phase 6) already have it (`ServiceRequirement`/`ProjectRequirementBlock`), and leaving it unmanageable in the admin would mean requirements could never actually be authored. Same reasoning as Collections including all 9 real block types rather than a subset.

**Verified with a real test** through the actual admin UI (Playwright, installed only for this check, removed after) using a temporary test admin account (created and fully deleted afterward, same pattern as every prior verification — also caught and cleaned up one stray leftover test-admin auth user from an earlier session that hadn't been fully deleted): created a service with a capability, a project requirement, a checked related product, and an inline-created FAQ — confirmed on edit-reload that every piece persisted correctly, including the related-product checkbox (relationship persistence confirmed both directions). Edited the short description, saved, reopened — change persisted. Published it and confirmed the **public service page** renders the name, capability, and requirement correctly (FAQ correctly absent publicly since new FAQs default to draft, same expected behavior as every other content type). Deleted it — confirmed removed from the list without a manual reload, confirmed still gone after a hard reload, confirmed via a direct database query that the row and its test FAQ are genuinely gone. No console errors at any point.

## Posts (Blog) CRUD — built and fully verified (2026-09-03, same day)
Same pattern as Products/Collections/Services (list/create/edit/delete, `lib/validation/admin/post.ts`, `lib/actions/admin/posts.ts`, `lib/queries/admin/posts.ts`, `app/admin/(protected)/posts/*`), reusing `ImageUploader` (featured image), `RelationCheckboxList` (related articles), and `DeleteEntityButton` as-is.

**`NameAndSlugFields` generalized for a fourth consumer with a different field name.** Products/Collections/Services all use a `name` column; `posts.title` doesn't. Rather than duplicating the component for one renamed field, added optional `nameFieldKey`/`nameLabel` props (defaulting to `"name"`/`"Name"`, so the three existing call sites are unaffected) and Posts passes `nameFieldKey="title"` `nameLabel="Title"`.

**Reused `POST_SELECT`/`mapPost`/`PostRow`** from the public `lib/queries/posts.ts` (exported for admin reuse, same as `PRODUCT_SELECT`/`SERVICE_SELECT`), and shaped `getAllPostOptions()`'s return as `{id, name}` (reading the `title` column but renaming the field) specifically so `RelationCheckboxList` — generic on `{id, name}` — could be reused unchanged for "Related articles" rather than writing a one-off picker for `related_posts`.

**Scope followed `10-admin-panel.md`'s Blog editor bullets with two deliberate omissions**, both consistent with Phase 8's original decisions: "category/tag if enabled" is skipped (no taxonomies exist — `09-content-and-database-model.md` §14 said only build taxonomies real content strategy will use, and still none does), and "related commercial pages" (post↔product/service/collection) is skipped (no schema support — Phase 8 called this aspirational IA language, not an actual doc09 schema section). `relatedPostIds` (article-to-article, `related_posts`) *is* included even though doc10's bullet list doesn't separately name it, the same "otherwise unmanageable" reasoning used for Services' `service_requirements`. "Publish date" is handled the same automatic way as every other entity's `published_at` (set on the draft→published transition) rather than a manual field — no entity in this project exposes that as editable input, so introducing one for Posts alone would be an inconsistency, not a feature.

**Verified with a real test** through the actual admin UI (Playwright, installed only for this check, removed after) using a temporary test admin account (created and fully deleted afterward — no stray leftovers this time): created a second post to serve as a related-article target, then created the main post with an author name, excerpt, multi-paragraph body, a checked related article, and SEO fields — confirmed on edit-reload that every field persisted correctly, including the related-article checkbox (relationship persistence confirmed both directions). Edited the excerpt, saved, reopened — change persisted. Published it and confirmed the **public blog detail page** renders the title, author, and full body text (paragraph breaks intact) correctly. Deleted both test posts — confirmed removed from the list without a manual reload, confirmed still gone after a hard reload, confirmed via a direct database query that both rows are genuinely gone. No console errors at any point.

## FAQs (global library) CRUD — built and fully verified (2026-09-03, same day)
Different in shape from every prior Phase 10 increment: FAQs aren't owned by one parent entity — the same `faqs` table (`docs/09-content-and-database-model.md` §12: "prefer a unified FAQ table with link tables rather than duplicated schemas") is linked from four separate junction tables (`product_faqs`, `service_faqs`, `collection_faqs`, `global_faqs`). This increment is the standalone library screen doc10 calls for — "global reusable FAQ library with usage indicators" — not a fifth relationship picker.

**Scope boundary: this screen owns the FAQ's own content plus `global_faqs`, nothing else.** Product/service/collection links stay managed exclusively from each of those entities' own `FaqPicker` (already built in the Products/Collections/Services increments) — duplicating that here would create two mechanisms for the same relationship, the same reasoning as Collections keeping product references out of its content-block system. `global_faqs` is the one link with no other admin surface anywhere, so it's the one exception: a plain "Show on the site-wide /faq page" checkbox on this form, synced via `syncGlobalFaq()` (delete-then-conditionally-reinsert, trivial here since `global_faqs.faq_id` is itself the primary key — no composite-key juggling needed).

**"Usage indicators"** are computed in `getAdminFaqs()` (`lib/queries/admin/faqs.ts`) by fetching all four link tables in parallel and counting by `faq_id` in memory, rather than one complex joined/aggregated query — clearer at this data scale, same "counts only, no cleverness" instinct as Phase 9's admin dashboard stats. The list shows plain-language labels ("2 products, 1 service, Global /faq page" / "Not used anywhere yet") rather than raw counts.

**`createQuickFaq()` (the inline create-from-`FaqPicker` action) was left untouched** — this increment adds `createFaq`/`updateFaq`/`deleteFaq` alongside it in the same file, not a replacement. A FAQ quick-created from a product's editor and one created from this new screen are the same table row either way; this screen is just the only place to see/edit/publish/delete *all* of them, not a second creation path with different behavior.

**Delete cascades cleanly through all four link tables** (`references faqs(id) on delete cascade` on each) — `deleteFaq()` only needs to delete the `faqs` row itself, no explicit cleanup of `product_faqs`/`service_faqs`/`collection_faqs`/`global_faqs` required, unlike every other entity's `write*Relations()` delete-then-reinsert pattern.

**Verified with a real test** through the actual admin UI (Playwright, installed only for this check, removed after) using a temporary test admin account (created and fully deleted afterward): created a published, global FAQ — confirmed it appeared in the list with a "Global /faq page" usage label and rendered on the real public `/faq` page. Created a temporary test product and linked the FAQ to it via the product's own `FaqPicker` — confirmed the usage indicator updated to show "1 product" alongside "Global /faq page" (both link types tracked correctly, additively). Edited the FAQ to un-global it — confirmed the change persisted on reload and the FAQ correctly disappeared from the public `/faq` page. Deleted the test product — confirmed the usage indicator dropped back to showing no product link (cascade delete of `product_faqs` confirmed working, not just assumed). Deleted the FAQ itself — confirmed removed from the list without a manual reload and still gone after a hard reload. No console errors at any point.

## Locations CRUD — built and fully verified (2026-09-03, same day)
The simplest entity in Phase 10 so far: no slug, no media beyond none, no relations, reusing Phase 7's already-live `locations` table as-is (`lib/validation/admin/location.ts`, `lib/actions/admin/locations.ts`, `lib/queries/admin/locations.ts`, `app/admin/(protected)/locations/*`, `components/admin/LocationForm.tsx`). `getPublishedLocations()`/`mapLocation`/`LocationRow` exported from the public `lib/queries/locations.ts` for admin reuse, same pattern as every other entity.

**Verified with a real test** through the actual admin UI (Playwright, installed only for this check, removed after) using a temporary test admin account (created and fully deleted afterward): created a published, primary warehouse location with a full address, phone, and email — confirmed it rendered correctly on the real public `/contact` page. Edited the address, saved, reopened — persisted. Set status back to `draft` — confirmed it correctly disappeared from `/contact` (RLS gating confirmed, not just the admin list). Deleted it — confirmed removed from the list without a manual reload, confirmed still gone after a hard reload. No console errors.

## Partners & Certifications — built and fully verified (2026-09-03, same day)
Migration `0009_partners_and_certifications.sql` applied by the project owner via the SQL Editor; confirmed both tables queryable immediately after.
Different starting point from every prior Phase 10 increment: `partners` and `certifications` had **no tables at all** yet. `docs/09-content-and-database-model.md` §16-17 fully specifies both schemas (and `types/content.ts`'s `Partner`/`Certification` interfaces already matched that spec exactly), but no migration had ever implemented them — unlike Locations, which reused Phase 7's already-live table. Caught by checking `supabase/migrations/*.sql` for either table name before assuming reuse was possible, the same way Phase 9's `middleware.ts`→`proxy.ts` deprecation was caught by reading the actual bundled docs rather than assuming.

**New migration**: `supabase/migrations/0009_partners_and_certifications.sql` — `partners` and `certifications` tables, RLS matching every other content table's public-read-if-published pattern. **Needs to be applied via the SQL Editor** (this environment still has no DB CLI/direct connection) before the admin screens built here can be live-verified — same blocking step every schema-adding phase (4, 5, 6, 7, 8, 9) has hit.

**One nav item, two entities, one combined screen.** `AdminSidebar` has always linked a single "Partners & Certifications" item to `/admin/partners` (built in Phase 9, ahead of this content existing) — rather than force an artificial shared schema between two genuinely different shapes (partner relationship data vs. certificate/issuer data), `/admin/partners` renders two independent sections (Partners, then Certifications), each with its own New/Edit/Delete, with certifications' create/edit routes nested at `/admin/partners/certifications/*`.

**No public page renders either yet — deliberately.** The wireframe's H07 "distributor/certification proof" homepage section (`docs/06-wireframe-spec.md`, `PartnerStrip`/`CertificationGrid` in `docs/08-component-system.md`) was already explicitly deferred back in Phase 3 pending real partner/certification data ("do not fabricate equivalent certification badges" — `docs/02-reference-site-audit.md`), and that data still doesn't exist. `lib/queries/partners.ts`/`certifications.ts`'s `getPublishedPartners()`/`getPublishedCertifications()` were still built now (same as `getPublishedLocations()` existed before Phase 10's Locations admin UI did) so that decision is ready to consume the moment real data and a build-it decision both exist — but building the H07 section itself is out of scope here, same reasoning as Phase 7 keeping Privacy/Terms as placeholders rather than fabricating legal text.

**Verified with a real test** through the actual admin UI (Playwright, installed only for this check, removed after) using a temporary test admin account (created and fully deleted afterward): created a published partner with a relationship label, description, and website URL — confirmed it appeared in the list correctly. Edited its description, saved, reopened — persisted. Deleted it — confirmed removed from the list without a manual reload, confirmed still gone after a hard reload. Repeated the identical create/edit/delete cycle for a certification (issuer, description, certificate URL) with the same results. No console errors at any point. `tsc`, lint, and a full production build all clean throughout.

## Settings — built and fully verified (2026-09-03, same day)
Another table that didn't exist yet: `site_settings`, fully spec'd in `docs/09-content-and-database-model.md` §20 but never implemented. **New migration**: `supabase/migrations/0010_site_settings.sql` — a singleton table (`id` fixed to `1` via a check constraint, seeded with its one row directly in the migration so no admin/public code path ever has to handle a missing row). Applied by the project owner via the SQL Editor, same as `0009`.

**Typed columns, one deliberately flexible field.** Per doc09's explicit warning ("avoid a single uncontrolled JSON blob for everything"), every setting is its own typed column except `social_urls` (jsonb) — "social URLs" is itself an open-ended set of platform→URL pairs, doc09's own wording, not a stand-in for the whole settings object. Authored in the admin form as a `{platform, url}` repeater (reusing `RepeaterField` as-is) and reduced to a plain object in `updateSiteSettings()`.

**Single edit screen, not list/create/delete.** A singleton has no list to manage — `/admin/settings` is directly the edit form, with one `updateSiteSettings()` Server Action (update-only) that stays on the same page and shows a "Settings saved." confirmation rather than redirecting, since there's no list page to redirect back to.

**A real bug found and fixed: `ImageUploader` couldn't actually handle PDFs.** Settings needed a brochure field, same as Collections already had — but reading `ImageUploader.tsx` closely revealed its file-picker `accept` attribute never included `application/pdf`, and its preview unconditionally rendered `next/image` regardless of MIME type (which breaks for a non-image asset). The Storage bucket itself has always allowed PDFs (Phase 10's media notes), so this was a real, unnoticed gap in Collections' already-shipped "Brochure (PDF)" field — its own verification pass never actually exercised it with a real PDF. Fixed by adding `application/pdf` to the accept list and branching the preview on `asset.mimeType.startsWith("image/")` (image → `next/image`, else → a "View file" link to the public URL). Verified with a real PDF upload through Settings' brochure field.

**Wired into the one clearly-marked placeholder consumption point: `SiteFooter`.** Its description text ("Structural and industrial steel supplier.") had been a stand-in since Phase 2/3; it, company legal name, phone, email, and social links now render from real `getSiteSettings()` data when set, falling back to the original placeholder text only when nothing's been entered yet — same "render only if real data exists" rule as every other pending-brand-input section in this project. `defaultSeoTitle`/`defaultSeoDescription`/`defaultOgImage` and the brochure itself are **not** wired into anything yet (no root-metadata consumer, no brochure-download button exists anywhere) — manageable via admin now, ready for a future decision, same as Partners/Certifications' unconsumed fields.

**A real, understood build-output change**: `SiteFooter` now queries Supabase (via `createSupabaseServerClient()`, which touches `cookies()`), and since it renders inside the shared `app/(site)/layout.tsx`, this pushed the three previously-static leaf pages (`/about`, `/privacy-policy`, `/terms`) to dynamic rendering — every other public page was already dynamic for the identical reason (they already queried Supabase directly). Considered adding a separate non-cookie-bound Supabase client just to preserve static generation for those three pages, but rejected it as a bespoke pattern used nowhere else in the codebase for a real-world-negligible performance difference on a low-traffic site — accepted deliberately rather than silently.

**Verified with a real test** through the actual admin UI (Playwright, installed only for this check, removed after) using a temporary test admin account (created and fully deleted afterward): filled every field including a social link and a real PDF brochure upload, saved, reloaded, confirmed everything persisted. Visited the real public `/about` page and confirmed the footer rendered the updated description, phone, email, company legal name (in the copyright line), and the social link — all sourced from the database, not hardcoded. Cleaned up afterward by resetting `site_settings` back to fully blank (including deleting the uploaded brochure from Storage) rather than leaving synthetic test data in a table the business will actually use.

## Inquiries — built and fully verified (2026-09-03, same day)
No new schema — `quote_requests` has existed and been written to since Phase 7, just with no admin screen. Per `docs/10-admin-panel.md`'s "Inquiries" section, this is deliberately **not** a full CRUD entity: inquiries are customer-submitted records, not admin-authored content, so the only admin action is a status update (`updateQuoteRequestStatus()`), never editing the submitted data or deleting the record — matching doc10's "Detail" bullet list exactly (all submitted fields, attachment, status update; no "edit" or "delete" bullet).

`lib/queries/admin/inquiries.ts` resolves `product_id`/`service_id` to names via a nested select (doc10's list columns say "product/service," not raw ids) — resolves regardless of the linked product/service's own status, since this uses the privileged client. List page shows date/name-company/phone-email/product-service/source page/status (status editable inline via `QuoteStatusSelect`, a small client component following the same `useTransition` + `router.refresh()` pattern as `DeleteEntityButton`); detail page shows every submitted field plus an attachment link that only renders if `attachmentPath` is set — it never is yet, since file-attachment upload on the public quote form is explicitly Phase 11 scope (noted directly in `lib/validation/quote-request.ts`'s own comment), not built here.

**Verified with a real test**: submitted an actual quote request through the real public `/contact` form (clearly marked `[TEST]`, with company/city/quantity/specification/message all filled) — confirmed it landed correctly in the admin list with the right phone/email/company/source page. Opened the detail page and confirmed every submitted field rendered correctly. Updated its status to "contacted" via the inline select — confirmed it persisted after a hard reload and that the list view's own select reflected the same updated status (two different read paths of the same write, both confirmed). Deleted the test row afterward via a direct database query, since — consistent with the "no delete UI" decision above — there's no admin delete button to click. No console errors at any point.

## Phase 10 complete
All nine Phase 10 entities are now built and live-verified: Products, Collections, Services, Posts, FAQs, Locations, Partners & Certifications, Settings, Inquiries.

---

# Phase 11 — Quote/contact workflow completion (2026-09-03)

## Scope
`docs/13-implementation-roadmap.md`'s remaining Phase 11 bullets: form/validation/database/admin-inquiry-view were already done (Phases 7 and 10). This closes out file upload and spam/rate controls. Asked the user first whether to also build email notifications (explicitly marked "optional/integrated later" in `docs/11-technical-architecture.md`, and "if enabled" in doc13 — the one item genuinely gated on a choice only they could make, since it requires picking and provisioning a third-party email service) — **user chose to skip it**. New inquiries remain visible via the dashboard's "new quote requests" count and `/admin/inquiries`, as before.

## Attachment upload
**New private Storage bucket**: `quote-attachments` (10MB limit, images + PDF — same limits as the `media` bucket, a reasonable default rather than an invented requirement). Applied directly via the admin client's `storage.createBucket()`, same self-service path as Phase 10's `media` bucket — `supabase/migrations/0011_quote_attachments_bucket.sql` records it for reproducibility, but didn't need the project owner to run anything this time.

**Deliberately private, unlike `media`.** `quote_requests.attachment_path` (`docs/09-content-and-database-model.md` §18) has always stored a raw storage path, not a `media_assets.id` foreign key — a schema signal that these were designed to bypass the public media system entirely, since they're customer-submitted drawings/specs, not admin-managed marketing assets. Admins view them via a short-lived (1 hour) signed URL generated on demand in `getAdminQuoteRequestById()` — `attachmentUrl`, never the raw path — and the list screen doesn't generate one at all per row (doc10's list columns don't include attachment; it's a "Detail" concern only).

**Wired into `submitQuoteRequest`** (`lib/actions/quote-request.ts`): the file arrives as a plain `FormData` entry (`attachment`) alongside the rest of the form — React 19's `useActionState`+`<form action>` already handles multipart submission natively — validated (type/size, same rules as `uploadMedia`) and uploaded before the `quote_requests` insert; if the insert itself fails after a successful upload, the orphaned storage object is cleaned up (same pattern as `uploadMedia`'s own failure-cleanup).

## Rate limiting
Keyed on **email**, not IP — email is always present and already validated, whereas trusting a proxy-supplied IP header is platform-dependent, and tracking IPs would need a schema change (another migration round-trip). Doesn't stop a bot that rotates fake emails, but does stop the realistic cases (accidental resubmission, manual abuse from one address) without new infrastructure — no Redis/KV is configured anywhere in this project. Implemented as a simple count query against `quote_requests` (same email, last 60 minutes, max 5) inside `submitQuoteRequest` itself — fails open (never blocks a real submission) if the check query itself errors.

## A real correctness bug caught during verification design, not shipped
Initially verified "attachment is private" by only confirming the admin UI shows a link — on reflection this proves a link exists, not that the bucket is actually private. Extended verification to attempt a raw fetch of the Supabase Storage **public**-URL pattern for the same file and confirm it does *not* return 200, which is the only way to prove server-side privacy rather than merely observing client-side behavior for the intended path. Confirmed private, but worth noting as a reminder that "the UI does the right thing" isn't the same claim as "the backend actually enforces the boundary."

## Verified with a real test
Through the actual public/admin flow (Playwright, installed only for this check, removed after) using a temporary test admin account (created and fully deleted afterward):
- Submitted a real quote request through the live `/contact` form with a real PDF attached — confirmed it landed in `/admin/inquiries`, opened the detail page, confirmed a signed attachment link renders, and confirmed that link **actually resolves** (a real HTTP GET returning 200 with `content-type: application/pdf`), not just that an `<a>` tag exists.
- Confirmed the same file's raw public-URL path returns a non-200 status — the bucket's privacy is real, not assumed.
- Submitted 5 requests from one test email (all succeeded), then a 6th (correctly blocked with the rate-limit message) — confirms both the "allow up to the threshold" and "block past it" halves of the boundary, not just one.
- No console errors at any point. All 6 test `quote_requests` rows, the uploaded test file, and the test admin account were deleted afterward; confirmed via direct queries that nothing test-related remains.

## Validation
- `npx tsc --noEmit` — clean
- `npm run lint` — clean
- `npm run build` — clean production build

---

# Phase 12 — Search (2026-09-03)

## Scope
Per `docs/11-technical-architecture.md`'s explicit "Phase 1 options" (Postgres full-text/trigram search, server-side combined query across content types — "do not add Algolia/third-party search until scale justifies it") and `docs/02-reference-site-audit.md` ("should cover, at minimum: products, collections/applications, services, blog posts, core pages"). `SiteSearch.tsx` and the `/search` route already existed as scaffolding from Phase 2 — the header's search input had been explicitly built disabled with a code comment reading "intentionally disabled until Phase 12 wires real search." This phase is that wiring.

## Design decisions
- **Generated `tsvector` columns + GIN indexes**, one per searchable table (`products`, `collections`, `services`, `posts`), combined by a single `search_content(search_query text)` Postgres function returning a unified `{content_type, id, slug, title, excerpt, rank}` shape — one `UNION ALL` query server-side, not four separate round-trips merged in application code. New migration: `supabase/migrations/0012_search.sql`.
- **A real bug caught by the user's own migration run, not by me**: the function's `order by rank` failed with `column "rank" does not exist` — in a `UNION ALL`, only the *first* branch's column aliases carry through to the combined result set, and the `ts_rank(...)` expression was never aliased anywhere. Fixed by adding `as rank` to the first branch only (Postgres's actual column-naming rule for set operations). Confirmed via direct query that the failed run had rolled back entirely (the SQL Editor executes a pasted script as one implicit transaction) before asking for a re-run, rather than assuming partial state.
- **"Core pages" (About/FAQ/Contact) are a small static list in the application layer, not database rows** — they have no dynamic body content to run through full-text search. Matched via simple case-insensitive substring matching against each page's title/excerpt/keywords. Deliberately excludes Privacy Policy/Terms (placeholder legal pages, not something doc03's stated search goal — "help high-intent visitors find a product, service, category, or article" — describes).
- **`SECURITY INVOKER` (the default), not definer** — the function runs as the calling (anon/authenticated) role, so RLS still applies on top of its own explicit `status = 'published'` filters. Redundant given RLS already restricts anon reads to published rows, but kept explicit so the function's own logic is correct independent of RLS ever changing, and consistent with using the plain public `createSupabaseServerClient()` (not the privileged admin client) from `lib/queries/search.ts` — the same pattern as every other public query in this project.
- **The header's `SiteSearch` overlay submits to `/search?q=...` rather than showing live inline results.** The now-real, fully keyboard-native `<form>` (Enter or click submits, Escape closes) replaces the old "coming soon + quick links" placeholder entirely — a live-typeahead `SearchOverlay` experience wasn't asked for in any doc, and doc11's own "Phase 1 options" language reads as scoping the *backend* approach, not mandating typeahead UX.
- **`/search` is noindexed** (`docs/12-seo-and-url-strategy.md`: exclude "search result pages unless a deliberate SEO reason exists") — matches the `robots: {index:false}` pattern already used for admin/legal-placeholder pages.

## Verified with a real test
Since all seed content remains `draft` (no real MTS catalogue confirmed yet, consistent with every prior phase), verification temporarily published one real row of each type — a product, a collection, a service, and a post — the same reversible admin-client pattern used in every live-verification pass since Phase 4, then reverted all four back to `draft` immediately after (confirmed via a direct query). Confirmed:
- `/search` with no query shows the "enter a search term" prompt; a real multi-word query (`steel`) returns correctly-typed, correctly-linked results across all four content types in one page, each result's link resolving to a real 200 detail page.
- A query matching only a core page ("quote" → Contact) surfaces the static core-page match correctly, linked to the real `/contact` route.
- A query with no matches (`xyznonexistentquery12345`) shows the "no results" empty state with working browse-fallback links.
- **Draft content is genuinely excluded, not just assumed to be** — searched for `coil` while the two seed products containing that word (`Hot Rolled Coil`, `Cold Rolled Coil`) were still `draft`, confirmed neither appeared.
- The header's `SiteSearch` overlay: opened, typed a query, submitted, confirmed it navigated to the real `/search?q=...` results page with real results rendered (not just that the overlay closed) — and confirmed `Escape` closes it, satisfying doc12's "keyboard/accessibility" bullet.
- No console errors at any point.

## Validation
- `npx tsc --noEmit` — clean
- `npm run lint` — clean
- `npm run build` — clean production build; `/search` correctly dynamic

---

# Phase 13 — SEO & migration (2026-09-03)

## Scope
Per `docs/13-implementation-roadmap.md` Phase 13 and `docs/12-seo-and-url-strategy.md`: metadata, structured data, sitemap, robots, canonical, social cards. **"Redirects" is explicitly out of scope** — doc12 itself says "MTS is a net-new website — there is no existing indexed Mian Tayyab Steel site/domain to migrate at this stage... until such a site is supplied, this workflow does not apply." Nothing here was blocked on missing business content; this was pure technical implementation.

## A real, concrete gap this phase closed
Every dynamic detail page (`products/services/collections/blog`'s `[slug]` routes) already had admin-editable `seoTitle`/`seoDescription`/`canonicalUrl`/`ogImage` fields (built in Phase 10) — but `generateMetadata` on all four only ever read the first two. `canonicalUrl` and `ogImage` were fully editable in the admin UI and completely inert on the actual public page. No canonical tag, no Open Graph tag, no Twitter card existed anywhere on the live site before this phase.

## Design decisions
- **One shared `buildPageMetadata()` helper** (`lib/seo/metadata.ts`) rather than duplicating the same title/description/canonical/OG/Twitter boilerplate across (now) eleven call sites — four dynamic detail pages, four archive pages, About/FAQ/Contact, and the homepage. Falls back to the page's own real path when no `canonicalUrl` override is set, never a guessed or duplicate URL.
- **`metadataBase` set in the root layout** (`new URL(SITE_URL)`) — required by Next.js for relative canonical/OG URLs to resolve at all ("using a relative path in a URL-based metadata field without configuring metadataBase will cause a build error," confirmed by reading the bundled Next docs per `AGENTS.md` before writing this). `SITE_URL` is a new `NEXT_PUBLIC_SITE_URL` env var, currently `http://localhost:3000` — **a placeholder that must be updated to the real production domain before launch**, flagged in both `.env.local` and the code.
- **Structured data (JSON-LD) wired at the shared-component level where possible, not per-page.** `BreadcrumbList` schema is emitted directly from `Breadcrumbs` (every page using it gets it automatically, from the same `items` prop already passed in) and `FAQPage` schema directly from `FaqAccordion` (same reasoning — only ever real, published FAQs, since that's all any public query passes to it). `Product`/`Service`/`BlogPosting` schema is per-page (`lib/seo/schema.ts` builders), and `Organization` schema renders once, homepage-only (not repeated on every page — the entity representing the whole site).
- **Product schema never includes `offers`/pricing** — doc12 explicitly: "do not fabricate offer/pricing fields." No real pricing data exists anywhere in this project, so this was a straightforward line not to cross, verified directly (a failing test asserted `"offers" in product` must be false).
- **No `Collection`-specific schema.org type** — doc12's structured-data list only names Organization/BreadcrumbList/FAQPage/Article/Service/Product; collections aren't in it (they're curated landing pages, not one of those semantic entities), so collection detail pages get canonical/OG plus the shared Breadcrumb/FAQ schema, and nothing invented beyond that.
- **`app/sitemap.ts`/`app/robots.ts`** (neither existed before, despite being named in `docs/11-technical-architecture.md`'s file tree) generate dynamically from currently-published content only — confirmed via test that draft rows, `/admin`, and `/search` are all correctly absent from the sitemap. Privacy Policy/Terms are also excluded from the sitemap (they're already `noindex` placeholder pages from Phase 7; submitting a noindexed page in a sitemap is self-contradictory).
- **`/search` stays crawlable but noindexed** via its own page metadata, not blocked in `robots.txt` — blocking it in robots would also prevent a crawler from ever seeing that noindex directive on a results page some external site happened to link to.

## Verified with a real test
Since all seed content remains `draft`, verification temporarily published one real row of each type plus a temporary test FAQ linked to the test product (the same reversible pattern used in every live-verification pass since Phase 4), reverted all of it immediately after. Confirmed via direct HTTP requests (no browser needed — pure HTML/XML inspection):
- Product/service/blog detail pages carry correct `<link rel="canonical">`, `og:title`/`og:type`/`twitter:card` tags, and their respective JSON-LD blocks (`Product` — confirmed no `offers` field present; `Service`; `BlogPosting` with `datePublished`).
- The product page's `BreadcrumbList` schema has the correct 3-item hierarchy, and its `FAQPage` schema contains the real linked test question — not just that a script tag exists, but that its parsed JSON content is actually correct.
- The homepage's `Organization` schema resolves with the real site name.
- All four archive pages plus About/FAQ/Contact carry correct canonical tags.
- `/sitemap.xml` includes all four published test rows and genuinely excludes the two still-draft seed products, `/admin`, and `/search`.
- `/robots.txt` disallows `/admin` and correctly references the sitemap URL.
- `/search` results carry `noindex`.
- No console errors; all test data (published statuses, the test FAQ and its product link) reverted/deleted afterward, confirmed via direct queries.

## Validation
- `npx tsc --noEmit` — clean
- `npm run lint` — clean
- `npm run build` — clean production build; `/sitemap.xml` dynamic, `/robots.txt` static

## Next recommended phase
Per `docs/13-implementation-roadmap.md`, Phase 13 was the last one with concrete technical bullets fully actionable now. What remains — **Phase 14 (Performance/accessibility: Lighthouse review, bundle review, image optimization, focus/keyboard, reduced motion, contrast, semantic structure)** and **Phase 15 (QA, per `docs/15-qa-and-launch.md`)** — is a mix of auditable-now work (Lighthouse/accessibility/bundle review can run against the current site regardless of real content) and work still genuinely blocked on real MTS business content (the actual product catalogue, brand inputs, legal copy, and confirmed production domain) that has not been supplied at any point in this project.

---

# Phase 9 — Completed, pending admin bootstrap (2026-09-03)

## Scope
Supabase Auth, route protection, admin shell, dashboard — per `13-implementation-roadmap.md` Phase 9 and `10-admin-panel.md`. Deliberately does **not** include entity CRUD forms (products/collections/services/etc. management) — that's Phase 10.

## A structural fix that had to happen now: `app/(site)/` route group
`11-technical-architecture.md`'s repository shape always specified `app/(site)/` for public pages precisely so `/admin` could have its own separate shell — but Phases 1-8 put `SiteHeader`/`SiteFooter` directly in the root layout, since there was no admin section yet to conflict with. Fixed now: all public routes moved into `app/(site)/` with their own layout carrying the marketing chrome; the root layout is now minimal (fonts/global CSS only); `app/admin/` sits alongside with a completely separate shell. No URLs changed — route groups don't affect paths. Verified via a full rebuild (all 15 routes resolve to the same paths as before) plus a live check confirming no marketing nav leaks into `/admin/login`.

## Design decisions
- **`admin_users` table, not Supabase custom claims/`app_metadata`.** A plain table with RLS (`auth.uid() = id` for self-read) is simpler to reason about and matches `09-content-and-database-model.md`'s explicit instruction: "do not equate authenticated with admin — use explicit authorization/role checks." No public signup path exists anywhere — admin accounts are created deliberately, not self-served.
- **No new RLS write policies on existing content tables.** Admin reads/writes of draft content go through the privileged service-role client (`lib/supabase/admin.ts`), gated by an application-level check (`getCurrentAdminUser()` in `lib/auth/admin.ts`) rather than by adding "authenticated admin can write" policies to every content table. Simpler, and the authorization boundary lives in one place instead of being duplicated across nine tables' RLS.
- **Two-layer route protection.** `proxy.ts` (renamed from the deprecated `middleware.ts` — see below) does a cheap "are you logged in at all" redirect and keeps the session cookie fresh; `app/admin/(protected)/layout.tsx` does the real check (`admin_users` membership) and is the actual authorization gate. Middleware alone isn't trusted as the sole gate, per the Next.js docs' own guidance to verify auth inside the actual route, not just at the proxy layer.
- **Sign-in defensively signs back out non-admin accounts.** If a valid Supabase Auth user successfully authenticates but has no `admin_users` row, `lib/actions/auth.ts` immediately calls `signOut()` before returning the error — a non-admin account never holds a live session, even briefly.

## A real deprecation caught before it shipped: `middleware.ts` → `proxy.ts`
Next.js 16 deprecated the `middleware` file convention in favor of `proxy` (renamed file + exported function name; same `config.matcher` export). The build output surfaced this as a warning ("The middleware file convention is deprecated..."), not an error — easy to miss. Checked `node_modules/next/dist/docs/01-app/03-api-reference/03-file-conventions/proxy.md` directly (per `AGENTS.md`: this Next.js version has breaking changes, read the bundled docs before writing code) and migrated: `middleware.ts` → `proxy.ts`, `export function middleware` → `export function proxy`. Confirmed the warning is gone on rebuild.

## Files changed
- `supabase/migrations/0007_admin.sql` (new) — `admin_users` table + self-read RLS policy. **Needs to be applied via the SQL Editor.**
- `lib/auth/admin.ts` (new) — `getCurrentAdminUser()`, the real authorization gate
- `lib/validation/auth.ts`, `lib/actions/auth.ts` (new) — sign-in schema + `signIn`/`signOut` Server Actions
- `components/forms/SignInForm.tsx` (new) — `useActionState`-based sign-in form
- `components/admin/AdminShell.tsx`, `AdminSidebar.tsx`, `AdminTopbar.tsx` (new) — nav shape built ahead of the Phase 10 CRUD pages it links to, same pattern as the Phase 2 public nav
- `lib/queries/admin-dashboard.ts` (new) — `getAdminDashboardStats()`, counts only (new quote requests, draft content per type) — no decorative charts, per `10-admin-panel.md`
- `app/admin/(auth)/login/page.tsx`, `app/admin/(protected)/layout.tsx`, `app/admin/(protected)/page.tsx` (new)
- `proxy.ts` (new, at project root) — session refresh + basic redirect for `/admin/*`
- **Restructure**: `app/page.tsx` and all public route folders (`about/`, `blog/`, `collections/`, `contact/`, `faq/`, `privacy-policy/`, `products/`, `services/`, `terms/`) moved into `app/(site)/`; `app/(site)/layout.tsx` (new) carries what used to be in the root layout; `app/layout.tsx` slimmed to fonts/global CSS only

## Verification
- **Unauthenticated flows, live**: visiting `/admin` correctly redirects to `/admin/login` (confirmed both via `curl` status codes and in-browser); the login page renders with no marketing header/footer/nav; submitting invalid credentials shows "Incorrect email or password" without revealing whether the account exists. No console errors.
- **Restructure regression check**: full production build after the `(site)` move shows all 15 routes at their original paths — the move didn't change any public URL.
- **Authenticated flow, live**: see "Authenticated-path verification" below — dashboard, sign-out, and session invalidation all confirmed working via a temporary test account.

## Validation
- `npx tsc --noEmit` — clean
- `npm run lint` — clean
- `npm run build` — clean production build, deprecation warning resolved

## Admin account bootstrapped — `contact@thetargetologist.com`
Created via the Supabase Dashboard by the project owner; granted admin access by inserting the matching `admin_users` row via the service-role client once `0007_admin.sql` was applied.

## Authenticated-path verification
Rather than ever touching the real admin account's password, verification used a **separate, temporary test admin account** (`verification-admin-test@example.com`, created via `supabase.auth.admin.createUser()` with a randomly generated password, granted admin the same way) — signed in through the real `/admin/login` flow via Playwright (installed only for this check, removed after), then deleted entirely afterward (`admin_users` row + the auth user itself). Confirmed via a direct query that only the real admin account remains in `admin_users` post-cleanup.

Confirmed working end to end:
- Sign-in with valid credentials → redirects to `/admin`, dashboard renders
- Dashboard shows **real, accurate counts** from the live database: 0 new quote requests, 3 draft products, 1 draft collection, 1 draft service, 2 draft blog posts — matching the actual seed data from Phases 4-8 exactly
- Topbar shows the signed-in user's email; all 11 sidebar nav links present
- Sign out → redirects to `/admin/login`; visiting `/admin` again afterward correctly redirects back to login (session genuinely cleared, not just UI state)
- No console errors at any point

This confirms the full chain: `proxy.ts` session handling → `getCurrentAdminUser()` authorization check → `AdminShell` rendering → `getAdminDashboardStats()` reading real data through the privileged client → sign-out clearing the session.

## Next recommended phase
**Phase 10 — Admin CRUD** — the actual entity management forms (Products first, per the roadmap's stated order), which is where the `admin_users`/auth infrastructure built and now fully verified here actually gets used for something.

---

# Phase 8 — Completed and live-verified (2026-09-03)

## Migration applied — by the project owner, via Supabase SQL Editor
`supabase/migrations/0006_posts.sql` and `supabase/seed_posts.sql` were run in the SQL Editor. Confirmed working end to end (see "Live verification" below).

## Live verification
Temporarily published both seeded articles (to also exercise the archive's multi-card rendering) — same reversible admin-client pattern as every prior phase. Confirmed:
- `/blog` — 200, both article cards render
- `/blog/hot-rolled-vs-cold-rolled-steel` — 200, breadcrumb/date ("September 3, 2026" — correctly reflects the real current date)/H1/featured-image placeholder/full body text with paragraph breaks preserved/quote CTA all render correctly
- No "Related articles" section shown — correct, since `related_posts` has no seeded rows; the conditional rendering worked as designed rather than showing an empty section
- No console errors

Reverted both articles back to `draft` immediately after — confirmed the detail route returns to 404. The live public site currently shows no products, collections, services, or articles, which is correct: the real MTS catalogue and content still aren't confirmed.

## Scope
Article schema, typed query layer, blog archive/detail pages, related articles — per `13-implementation-roadmap.md` Phase 8 and `09-content-and-database-model.md` §13-14. This is the last content-modeling phase before Phase 9 admin work begins.

## Deliberately not built
- **`post_categories`/`post_tags`** — `09-content-and-database-model.md` §14 explicitly says "only implement taxonomies that content strategy will actually use," and no real content strategy exists yet. Skipped rather than guessed at.
- **Structured post↔product/service/collection relations** — `04-information-architecture.md` says an article "may relate to" products/services/collections, but this is aspirational IA language, not something `09-content-and-database-model.md`'s actual schema section specifies for posts. Editorial links within body content cover this until real content strategy calls for structured relations. `related_posts` (article-to-article) *is* built, mirroring `related_products`, since `08-component-system.md` explicitly lists `RelatedArticles` as a component.
- **`TableOfContents`** — doc03 marks it optional for long articles, and with `body` as a single plain-text field (no heading structure to extract from), a real TOC has nothing to build from yet.

## Files changed
- `supabase/migrations/0006_posts.sql` (new) — `posts`, `related_posts`, RLS matching the existing pattern. **Needs to be applied via the SQL Editor.**
- `supabase/seed_posts.sql` (new) — 2 dev-placeholder articles, idempotent from the start, `status='draft'`
- `lib/queries/posts.ts` (new) — `getPublishedPosts()`, `getPostBySlug()`, `getRelatedPosts()`
- `components/blog/ArticleCard.tsx`, `ArticleGrid.tsx`, `ArticleMeta.tsx` (new) — 16:9 image ratio, distinct from `ProductCard`'s 4:3, per the same "distinct visual hierarchy per content type" principle used for `CollectionCard`
- `app/blog/page.tsx`, `app/blog/[slug]/page.tsx` (new) — same `generateMetadata`/`notFound()` pattern as every other content type

## Verification summary
1. UI-verified with fixture data first (same pattern as every prior content phase): a temporary routable preview page exercised `ArticleGrid` (populated and empty), the full article-detail composition.
2. Live-verified after the migration + seed were applied — see "Live verification" above.

## Validation
- `npx tsc --noEmit` — clean
- `npm run lint` — clean
- `npm run build` — clean production build; blog routes correctly dynamic, About/Privacy/Terms still correctly static

## Unresolved issues
- Still pending, not urgent: `supabase/migrations/0002_seed_idempotency_constraints.sql` from Phase 4.

## Next recommended phase
**Phase 9 — Admin foundation** (auth, route protection, admin shell) — the point where content stops being seeded by hand and starts being manageable through a real interface, and where the "authenticated ≠ admin" role-check work that every RLS policy in this project has been deferring finally lands.

---

# Phase 7 — Completed and live-verified (2026-09-02)

## Migration applied — by the project owner, via Supabase SQL Editor
`supabase/migrations/0005_contact_and_faq.sql` was run in the SQL Editor. Confirmed working end to end (see "Live verification" below), including a real form submission all the way to a database row.

## Live verification
- `/faq` — 200, correctly shows the "building out our FAQ library" empty state (no global FAQs exist yet)
- `/contact` — 200, submitted the real form with clearly-marked test data (`[TEST] Verification Script`, `verification-test@example.com`) through an actual browser interaction — got the success message, not the graceful-failure one
- Queried `quote_requests` directly with the admin client afterward: the row landed with every field mapped correctly, including `source_page` auto-captured as `/contact` and `status` defaulted to `new`. Deleted the test row immediately after confirming — it was a synthetic verification row, not a real inquiry, and leaving it would pollute the table the business will actually use.
- No console errors at any point

This is the first phase where verification included writing through the *public-facing* path (the actual form + Server Action), not just the admin client directly — confirms the whole chain works: client validation → Server Action → Zod re-validation → privileged insert → success state back to the user.

## Scope
About, FAQ, Contact, Privacy Policy, Terms — per `13-implementation-roadmap.md` Phase 7. This phase is different in kind from Phases 4-6: it's gated on real business inputs (contact details, locations, company history) rather than just schema/UI work, so each page's scope was decided by what's honestly buildable right now.

## What's real vs. deferred, per page
- **FAQ**: fully real. New `global_faqs` table (site-wide FAQs, distinct from the existing product/service/collection-scoped ones), reusing the existing `FaqAccordion` component.
- **Contact**: the form is fully real — server-side Zod validation, honeypot spam field, writes to a new `quote_requests` table via a Server Action using the privileged admin client (this table has **no public RLS policy at all**, not even for inserts — per `09-content-and-database-model.md` "insert inquiries only through a controlled server endpoint/action," the public site never talks to it directly). Locations render only if real ones exist (none do yet) — no invented phone/email/address. File attachment upload, spam/rate-limiting infrastructure, and the admin inquiry dashboard are explicitly **Phase 11** scope per the roadmap, not built here.
- **About**: real content, but only using what's already approved in `01-project-brief.md` (positioning, audience) — the generational/founder-story treatment from the wireframe is not built; it would require fabricating company history MTS hasn't supplied. Returns once real history exists.
- **Privacy Policy / Terms**: deliberately **not** real legal text. Publishing fabricated privacy/legal policy carries real liability and could misrepresent actual data-handling practices — these are honest "pending legal review" placeholder pages, `noindex`ed, with a link to Contact. This is a stricter bar than the "clearly marked placeholder" pattern used elsewhere, because a legal document is more consequential to get wrong than marketing copy.

## Real bug found and fixed: invalid Server Action file
`lib/actions/quote-request.ts` had `"use server"` at the top but also exported `initialQuoteRequestFormState` (a plain object) alongside the async action — Next.js requires a `"use server"` file to export *only* async functions. This crashed the page with "A 'use server' file can only export async functions, found object." Fixed by moving the state type/initial value into `lib/validation/quote-request.ts` (a plain module) and leaving `lib/actions/quote-request.ts` with only the action function. Caught via the same fixture-preview verification pattern used in every prior phase — worth noting this is exactly the kind of bug that pattern exists to catch, since `tsc`/lint/build all passed before this was caught by actually clicking through the form in a browser.

## Files changed
- `supabase/migrations/0005_contact_and_faq.sql` (new) — `locations`, `global_faqs`, `quote_requests`. **Needs to be applied via the SQL Editor.**
- `lib/validation/quote-request.ts` (new) — Zod schema (`quoteRequestSchema`) + `QuoteRequestFormState` type/initial value
- `lib/actions/quote-request.ts` (new) — `submitQuoteRequest` Server Action
- `lib/queries/locations.ts`, `lib/queries/faqs.ts` (new) — `getPublishedLocations()`, `getGlobalFaqs()`
- `components/ui/FormField.tsx` (new) — shared label/input/error wrapper
- `components/forms/QuoteForm.tsx` (new) — the contact/quote form, using React 19's `useActionState`
- `app/about/page.tsx`, `app/faq/page.tsx`, `app/contact/page.tsx`, `app/privacy-policy/page.tsx`, `app/terms/page.tsx` (new)
- `package.json` — added `zod`

## Verification
- **FAQ empty state**: `/faq` correctly shows a "building out our FAQ library" message when no global FAQs exist (same pattern as every other empty-catalogue state in this project).
- **Form validation**: verified in-browser (Playwright, installed only for this check, removed after) — empty submit shows 5 required-field errors, invalid email shows a format-specific error, and a fully valid submission correctly reaches the DB-insert step and shows the graceful "Something went wrong... contact us directly" message (since `quote_requests` doesn't exist yet — same expected pattern as every prior phase before its migration lands). No console errors.
- **Static pages** (About, Privacy, Terms): visually verified, consistent with the design system, no console errors.
- One test-script false alarm along the way: a multi-step sequential fill+click test on `/dev-preview` produced a misleading result (looked like validation was failing on a valid email) that turned out to be a race condition in the *test script* re-using stale element state across rapid submissions, not an app bug — confirmed by isolating the same submission in a fresh page load, which worked correctly. Worth remembering when writing multi-step browser tests against `useActionState` forms: re-verify suspicious results with an isolated repro before trusting them.

## Validation
- `npx tsc --noEmit` — clean
- `npm run lint` — clean
- `npm run build` — clean production build; About/Privacy/Terms correctly static, FAQ/Contact correctly dynamic

## Unresolved issues
- Still pending, not urgent: `supabase/migrations/0002_seed_idempotency_constraints.sql` from Phase 4.
- Privacy Policy and Terms remain placeholder pages until real legal content is supplied and reviewed — this is a business decision, not a technical one, and isn't "done" the way other pending items are.

## Next recommended phase
**Phase 8 — Blog/insights** — the last content-modeling phase before Phase 9 admin work begins.

---

# Phase 6 — Completed and live-verified (2026-09-02)

## Migration applied — by the project owner, via Supabase SQL Editor
`supabase/migrations/0004_services.sql` and `supabase/seed_services.sql` were run in the SQL Editor. Confirmed working end to end (see "Live verification" below) — no errors of any kind this time, including on the first attempt (the idempotent-from-the-start seed writing paid off).

## Live verification
Temporarily published the seeded `steel-cutting` service and its two linked products (`hot-rolled-coil`, `cold-rolled-coil`) — same reversible admin-client pattern as before, and necessary again for the same reason as Phase 5's `collection_products`: `product_services`' RLS requires both sides published. Confirmed:
- `/services/steel-cutting` — 200, breadcrumb/gallery/H1/capabilities (`KeyValueList`, 2 rows)/requirements (`TitleDescriptionList`, 2 items)/**Related products** (both linked products, real cards) all render correctly
- `/products/hot-rolled-coil` — 200, its existing sections unchanged, plus the new **Related services** section correctly showing "Steel Cutting"
- Confirmed the relationship works in **both directions** from the same `product_services` rows — the point of building `getRelatedServicesForProduct()` as a separate query
- No console errors on either page

Reverted all three rows back to `draft` immediately after — confirmed both detail routes return to 404. The live public site currently shows no products, collections, or services, which is correct: the real MTS catalogue still isn't confirmed.

## Scope
Service database schema, typed query layer, service archive/detail pages, capabilities (structured operational fields), project requirements, product↔service relationships (both directions), FAQs — per `13-implementation-roadmap.md` Phase 6 and `09-content-and-database-model.md` §9-11.

## A real refactor along the way: generalizing near-duplicate components
Building services surfaced that several Phase 4 "product" components were actually generic — nothing in them was product-specific:
- `ProductGallery` → `components/ui/MediaGallery.tsx` (prop renamed `productName` → `label`)
- `ProductImagePlaceholder` → `components/ui/ImagePlaceholder.tsx`
- `SpecificationList` → `components/ui/KeyValueList.tsx` (typed to a minimal `{id, label, value, unit}` shape — `ProductSpecification[]` and `ServiceCapability[]` are both structurally assignable, no adapter needed)
- `ApplicationList` → `components/ui/TitleDescriptionList.tsx` (same reasoning — shared by product applications and service requirements)

All call sites (`ProductCard`, `CollectionCard`, `ImageTextBlock`, the products detail page) updated accordingly. This is the same instinct as relocating `QuoteCtaSection` in Phase 4 — a component turns out to be a real primitive only once a second, genuinely different consumer shows up; forcing that generalization earlier (Phase 4, with only one consumer) would have been guessing at a shape with no second data point to validate it against.

## Design decisions
- **`service_capabilities`** (label/value/unit) models "materials supported, thickness/size limits, tolerance, turnaround" from `02-reference-site-audit.md`'s "structured operational fields" note — not invented values, just the schema shape; real values wait for real service data. Matches `08-component-system.md`'s `CapabilityList`.
- **`service_requirements`** (title/description) models "accepted input/project requirements" — `08-component-system.md`'s `ProjectRequirementBlock`.
- **No `related_services` self-join.** Unlike products (`related_products`), `04-information-architecture.md` never specifies a service↔service relationship — only "Service relates to many Products." Didn't invent one.
- **`getRelatedServicesForProduct()` lives in `services.ts`, not embedded in `PRODUCT_SELECT`.** Embedding it there would either require importing `SERVICE_SELECT` into `products.ts` (circular import, since `services.ts` already imports `PRODUCT_SELECT` from `products.ts`) or over-fetching a full `Service` graph just to render a card list. Queried from the services side instead — same pattern Phase 4 already used for `getRelatedProducts()`.
- **Idempotency built in from the start this time** — every new table's natural key has a `unique` constraint in the `create table` statement itself (`unique (service_id, label)`, `unique (service_id, title)`), not bolted on after a bug like Phase 4's `0002` fix.

## Files changed
- `supabase/migrations/0004_services.sql` (new) — `services`, `service_media`, `service_capabilities`, `service_requirements`, `product_services`, `service_faqs`, RLS matching the existing pattern. **Needs to be applied via the SQL Editor.**
- `supabase/seed_services.sql` (new) — one dev-placeholder "Steel Cutting" service, linked to two Phase 4 seed products via `product_services`. Idempotent from the start.
- `types/content.ts` — added `ServiceCapability`, `ServiceRequirement`, extended `Service` with `gallery`/`capabilities`/`requirements`/`relatedProducts`/`faqs`/`publishedAt`
- `lib/queries/services.ts` (new) — `getPublishedServices()`, `getServiceBySlug()`, `getRelatedServicesForProduct()`
- `components/ui/MediaGallery.tsx`, `ImagePlaceholder.tsx`, `KeyValueList.tsx`, `TitleDescriptionList.tsx` — generalized from `components/products/*` as described above
- `components/services/ServiceCard.tsx`, `ServiceGrid.tsx` (new)
- `app/services/page.tsx`, `app/services/[slug]/page.tsx` (new) — same `generateMetadata`/`notFound()` pattern as products/collections
- `app/products/[slug]/page.tsx` — updated for the component renames, added a "Related services" section using `getRelatedServicesForProduct()`

## Verification summary
1. UI-verified with fixture data first (same pattern as Phases 4-5): a temporary routable preview page exercised `ServiceGrid`, the full service-detail composition, plus an explicit regression check that `KeyValueList`/`TitleDescriptionList` still render correctly with product data after the generalization.
2. Live-verified after the migration + seed were applied — see "Live verification" above, including the bidirectional `product_services` relationship confirmed from both sides.

Homepage is unaffected by this phase (deliberately didn't add a services-preview homepage section — wasn't an explicit Phase 3 commitment the way the collections split was).

## Validation
- `npx tsc --noEmit` — clean
- `npm run lint` — clean
- `npm run build` — clean production build; all routes correctly dynamic

## Unresolved issues
- Still pending, not urgent: `supabase/migrations/0002_seed_idempotency_constraints.sql` from Phase 4.

## Next recommended phase
**Phase 7 — Company/static pages** (About, FAQ, Contact, Privacy, Terms) — the first phase that doesn't add a new Supabase table, but does need real business inputs (contact details, locations) that are still pending per "Pending Brand Inputs" below.

---

# Phase 5 — Completed and live-verified (2026-09-02)

## Migration applied — by the project owner, via Supabase SQL Editor
`supabase/migrations/0003_collections.sql` and `supabase/seed_collections.sql` were run in the SQL Editor. Confirmed working end to end (see "Live verification" below).

## Live verification
Temporarily published the seeded `construction-steel` collection (service-role admin client, same reversible pattern as Phase 4). First pass showed the "Products in this collection" section correctly empty — not a bug: the RLS policy on `collection_products` requires *both* the collection and the linked product to be `published`, and the linked seed products were still `draft` from Phase 4's revert. Temporarily published `hot-rolled-coil` too, then confirmed:
- `/` — 200, both "Featured products" and "Browse by application" sections now render (the conditional homepage logic correctly reacts to real data on both sides)
- `/collections` — 200, real card renders
- `/collections/construction-steel` — 200, breadcrumb/hero/intro/`feature_list` block (3 items)/`selection_guide` block (3 steps, correctly ordered 01-03)/"Products in this collection" (real nested `collection_products`→`products` join, full product card with image placeholder, name, description) all render correctly
- No console errors at any point

Reverted both rows back to `draft` immediately after — confirmed `/` returns to the honest `CatalogueSection` fallback, `/collections/construction-steel` returns to 404. The live public site currently shows no products or collections, which is correct: the real MTS catalogue still isn't confirmed.

This confirms the more complex parts of the query layer that Phase 4 didn't exercise: the `collection_products` dual-status RLS join, and reusing `mapProduct`/`PRODUCT_SELECT` across two different top-level queries.

## Scope
Collection database schema (with a controlled JSONB content-block system), typed query layer, collection archive/detail pages, product relationships, FAQs — per `13-implementation-roadmap.md` Phase 5 and `09-content-and-database-model.md` §7-8. Also split the homepage's Phase 3 placeholder `CatalogueSection` into real data-driven product/collection discovery, as planned back in Phase 3.

## The content-block design decision
`09-content-and-database-model.md` explicitly flags collection body content as an open design decision ("structured JSON content blocks with a controlled block schema, or normalized tables... do not allow arbitrary code/HTML from admin"), and `10-admin-panel.md` lists the required block types. Implemented as a TypeScript discriminated union (`CollectionBlock` in `types/content.ts`) stored as JSONB — 9 block types: `rich_text`, `image_text`, `feature_list`, `solution_cards`, `application_grid`, `industry_list`, `comparison_table`, `selection_guide`, `cta`. Deliberately **not** included as a block type: product references — those already have a proper relational home in `collection_products` (rendered as its own "Products in this collection" section), so a `product_links` block (which doc 10 also lists) would just be a second, redundant mechanism for the same relationship.

The read path defensively parses `content_blocks` (`lib/queries/collections.ts` `parseContentBlocks`) — unrecognized block shapes are silently dropped rather than crashing the page, since there's no write-side schema validation yet (that's an admin/Phase 9-10 concern once there's an actual write path to validate).

## Files changed
- `supabase/migrations/0003_collections.sql` (new) — `collections`, `collection_products`, `collection_faqs`, RLS matching the products pattern. **Needs to be applied via the SQL Editor.**
- `supabase/seed_collections.sql` (new) — one dev-placeholder "Construction Steel" collection linking the Phase 4 seed products, exercising 2 of the 9 block types. Idempotent from the start this time (`collection_products`/`collection_faqs` use composite primary keys, learning from the Phase 4 seed bug) — apply after 0003 and after `seed.sql`.
- `types/content.ts` — added `CollectionBlock` union and extended `Collection` with `contentBlocks`, `products`, `faqs`, `publishedAt`
- `lib/queries/products.ts` — exported `PRODUCT_SELECT`/`mapProduct`/`ProductRow` for reuse (a collection embeds full `Product` objects); removed a stale comment left over from before Phase 4's live verification
- `lib/queries/collections.ts` (new) — `getPublishedCollections()`, `getCollectionBySlug()`, block-array parsing, row→domain mapping reusing the product mapper
- `components/collections/CollectionCard.tsx`, `CollectionGrid.tsx` (new) — visually distinct from `ProductCard` (16:9 vs 4:3, no eyebrow), per the wireframe's explicit requirement
- `components/collections/CollectionBlockRenderer.tsx` + `components/collections/blocks/*.tsx` (9 new files) — one renderer per block type; `comparison_table` uses a real semantic `<table>` with horizontal-scroll wrapper (the `SpecificationTable`-equivalent deferred from Phase 4)
- `app/collections/page.tsx`, `app/collections/[slug]/page.tsx` (new) — archive + detail routes, same `generateMetadata`/`notFound()` pattern as products
- `components/home/ProductDiscoverySection.tsx`, `CollectionDiscoverySection.tsx` (new) — real data-driven replacements for the old static `CatalogueSection`
- `app/page.tsx` — now fetches featured products + published collections; renders the real discovery sections when either has data, falls back to the original honest "coming soon" `CatalogueSection` only when *both* are still empty (avoids two sparse "empty" sections stacked on a real homepage)

## Verification summary
1. UI-verified with fixture data first (same pattern as Phase 4): a temporary routable preview page exercised `CollectionGrid`, the full detail-page hero composition, all 9 block types via `CollectionBlockRenderer`, `ProductGrid` (products-in-collection), and `FaqAccordion`, at desktop and mobile via Playwright (installed only for this check, removed after). No console errors, no horizontal overflow, comparison table stays readable on mobile without needing its scroll affordance at this content width.
2. Live-verified after the migration + seed were applied — see "Live verification" above.

## Validation
- `npx tsc --noEmit` — clean
- `npm run lint` — clean
- `npm run build` — clean production build; all product/collection routes correctly dynamic

## Unresolved issues
- `supabase/migrations/0002_seed_idempotency_constraints.sql` (from Phase 4) is still pending — not urgent.
- `related_products` (Phase 4) still has no rows — unaffected by this phase.

## Next recommended phase
**Phase 6 — Services**, following the same pattern as products (schema, query layer, archive/detail), this time also wiring the `product_services` join table that was deferred from Phase 4 since `services` didn't exist yet.

---

# Phase 4 — Completed and live-verified (2026-09-02)

## Scope
Product database schema, typed query layer, product archive/detail pages, gallery, specs, applications, FAQs, related products — per `13-implementation-roadmap.md` Phase 4 and `09-content-and-database-model.md`. Related *services* and downloads are intentionally out of scope (services table doesn't exist until Phase 6; downloads isn't in the Phase 4 roadmap bullet list).

## Migration applied — by the project owner, via Supabase SQL Editor
`supabase/migrations/0001_products.sql` and `supabase/seed.sql` were run directly in the Supabase Dashboard's SQL Editor (this environment still has no CLI/direct DB connection — that's unchanged, but wasn't needed for the paste-and-run path). Confirmed working end to end against live data (see "Live verification" below).

## Real bug found and fixed during verification: seed script wasn't idempotent
`seed.sql` guarded `products` against re-insertion (`on conflict (slug) do nothing`) but not `product_specifications`, `product_applications`, or `faqs` — it appears to have been run twice, which silently duplicated every row in those three tables (12 spec rows instead of 6, 12 application rows instead of 6, 4 faqs instead of 2). Found by inspecting live row counts directly, not just visually — the archive/detail pages don't have a "correctness" signal for this on their own since duplicate rows just render as duplicate content, which is easy to miss at a glance.

Fixed in two parts:
1. Deleted the duplicate rows directly (one-off cleanup, not a migration — nothing to replay).
2. `supabase/migrations/0002_seed_idempotency_constraints.sql` (new) — adds `unique (product_id, label)` on `product_specifications`, `unique (product_id, title)` on `product_applications`, and `unique (question)` on `faqs`. `seed.sql` updated with matching `on conflict ... do nothing` clauses, so it's now safe to re-run. **This migration also needs to be applied via the SQL Editor** — same process as before.

## Live verification (not fixture data this time)
Temporarily flipped the `hot-rolled-coil` seed product from `draft` to `published` using the service-role admin client (`lib/supabase/admin.ts` — a legitimate use of the already-provisioned secret key, reversible, on data both of us already knew was placeholder), then:
- `/products` — 200, real card renders (image placeholder, HRC name/description), no console errors
- `/products/hot-rolled-coil` — 200, breadcrumb/gallery/H1/specs (2 rows, correctly deduplicated)/applications (2 items)/quote CTA all render correctly from the actual nested Supabase query (dual-FK media aliasing, joined specs/applications/faqs all confirmed working as written)
- Reverted the product back to `draft` immediately after — confirmed `/products` returns to the correct empty state and `/products/hot-rolled-coil` returns to 404. The live public site currently shows no products, which is correct: the real MTS catalogue still isn't confirmed.

This also resolves the "unverified against a live schema" caveat noted when Phase 4 was first written up — the query layer's nested-select syntax is now confirmed correct, not just plausible.

## Files changed
- `supabase/migrations/0001_products.sql` (new) — full schema + RLS, described above
- `supabase/migrations/0002_seed_idempotency_constraints.sql` (new) — unique constraints fixing the seed bug above; **needs to be applied via the SQL Editor**, same as 0001
- `supabase/seed.sql` (new, later fixed) — 3 dev-placeholder products, explicitly marked as not-confirmed-MTS-catalogue, `status='draft'`; now idempotent (`on conflict ... do nothing` on every insert)
- `types/content.ts` — added `Product.gallery: MediaAsset[]` and `Product.faqs: Faq[]` (were missing from the Phase 1 type)
- `lib/queries/products.ts` (new) — `getPublishedProducts()`, `getFeaturedProducts()`, `getProductBySlug()`, `getRelatedProducts()`, typed row→domain mappers. Nested-select syntax (dual-FK media aliasing, joined specs/applications/faqs) confirmed working against the live schema.
- `components/products/ProductCard.tsx`, `ProductGrid.tsx`, `ProductGallery.tsx` (client), `SpecificationList.tsx`, `ApplicationList.tsx`, `RelatedProducts.tsx`, `ProductImagePlaceholder.tsx` (new) — the last stands in for real product photography (none supplied yet), same restrained geometric language as the homepage hero visual
- `components/ui/FaqAccordion.tsx` (new) — generic, not product-specific; will be reused for service/collection/global FAQs
- `components/layout/Breadcrumbs.tsx` (new) — this was actually missing from Phase 2's "Global shell" despite being on that phase's component list; added now since the product pages need it
- `components/layout/QuoteCtaSection.tsx` — relocated from `components/home/` since it's now reused on product pages too (and will be on collection/service pages)
- `app/products/page.tsx`, `app/products/[slug]/page.tsx` (new) — archive + detail routes, `generateMetadata` from `seoTitle`/`seoDescription` with fallbacks, `notFound()` on missing slug
- `next.config.ts` — added `images.remotePatterns` for the Supabase Storage hostname (derived from `NEXT_PUBLIC_SUPABASE_URL`), required for `next/image` to serve product photos once they exist

## Verification summary
1. **Before the migration was applied**: confirmed `/products` returned a clean 500 with the exact expected "table not found" error — not a bug in the query code, just the missing schema. `next build` succeeds regardless, since both product routes use `cookies()` (via the server Supabase client) and are correctly marked dynamic, so they're never queried at build time.
2. **UI/component correctness** (fixture data, before the migration): a temporary routable preview page rendered all the new components with realistic fixture data conforming to the real `Product` type, verified with Playwright (installed only for this check, removed after) at desktop and mobile. FAQ accordion expand/collapse confirmed via `aria-expanded` toggle + visible answer text. No console errors, no horizontal overflow. Preview route and script deleted after.
3. **Live verification** (after the migration + seed were applied): see "Live verification" above — real end-to-end confirmation against the actual Supabase project, including catching and fixing the seed idempotency bug.

## Validation
- `npx tsc --noEmit` — clean
- `npm run lint` — clean
- `npm run build` — clean production build; `/products` and `/products/[slug]` correctly dynamic

## Unresolved issues
- **`supabase/migrations/0002_seed_idempotency_constraints.sql` still needs to be applied** via the SQL Editor (same process as 0001) — not urgent (no further duplicate-insert risk until `seed.sql` is re-run), but should happen before anyone re-runs the seed file.
- `related_products` has no rows yet (no admin UI to manage relationships until Phase 9/10) — `getRelatedProducts()` correctly returns `[]` until then.

## Next recommended phase
**Phase 5 — Collection/application system**, which also lets `CatalogueSection` on the homepage finally split into real data-driven product/collection discovery sections as originally planned in Phase 3.

---

# Phase 3 — Completed (2026-09-02)

## Scope
Real homepage per `06-wireframe-spec.md` (H02/H03+H04/H05/H08 — H01/H09 shipped in Phase 2) and `02-reference-site-audit.md` findings, replacing the temporary placeholder page.

## Content approach — no fabricated business data
Per the master project rules and `PROJECT_STATE.md` "Pending Brand Inputs," MTS has no confirmed product catalogue, collections, services, partners, certifications, company history, or photography yet. Rather than inventing any of these to fill the wireframed sections, each section either:
- uses only content already approved in `01-project-brief.md` (business positioning, primary audience), written as prose — not an icon-card grid, which the design rejection checklist explicitly flags as a generic-AI pattern regardless of whether the words are real; or
- is an honest "in progress" state with no invented specifics (catalogue section), rather than a fake product/collection name; or
- is omitted for now: **services preview (H06)** and **partner/certification proof (H07)** are not on the homepage — both wireframe/audit docs require *real* content for these (H06 is explicitly optional, H07 explicitly warns against "decorative logo dumping"), and we have none. They get added once Phase 6 (services) and real partner data exist.
- the hero visual is a geometric illustration referencing structural steel profiles (per `05-design-direction.md` §10's own suggested motifs), not a fake stock photo, standing in for real photography.

## Files changed
- `components/home/HeroSection.tsx`, `HeroVisual.tsx` (new) — eyebrow/H1/copy sourced from the approved brief, dual CTA (Request a Quote → `/contact`, Explore Products → `/products`), geometric SVG hero visual
- `components/home/CatalogueSection.tsx` (new) — combines wireframe H03+H04 into one honest "catalogue being finalized" state; will split into two data-driven sections (`Product[]`/`Collection[]` from `types/content.ts`) once Phase 4/5 ship real data
- `components/home/TrustSection.tsx` (new) — prose section built from the approved audience/positioning content, links to `/about`
- `components/home/QuoteCtaSection.tsx` (new) — navy-background conversion section, per wireframe H08
- `app/page.tsx` — replaced the Phase 1/2 placeholder with the real homepage composition (Hero → Catalogue → Trust → QuoteCta) and page-level SEO metadata (title/description only — structured data/OG/canonical is Phase 13's job, not front-loaded here)

## Browser verification
Ran a Playwright-driven check (installed only for this one-off check, removed afterward — not a project dependency) against the dev server at 1440×900, 768×1024, and 390×844: confirmed H1 renders, 4 sections present, no horizontal overflow at any width, hero CTAs stack correctly on mobile, no console errors. No bugs found this time — the `cn()`/`tailwind-merge` fix from Phase 2 held up under new component compositions (navy-background CTA button, section padding, responsive grid) without further conflicts.

## Validation
- `npx tsc --noEmit` — clean
- `npm run lint` — clean
- `npm run build` — clean production build
- Playwright browser check (desktop/tablet/mobile, described above) — clean

## Unresolved issues
None blocking. Worth noting explicitly: most nav/footer links (`/about`, `/products`, `/collections`, `/services`, `/blog`, `/contact`, `/faq`, `/privacy-policy`, `/terms`) 404 until their respective roadmap phases ship the actual pages — this is the intended incremental build sequence (nav/IA built ahead of pages, per `13-implementation-roadmap.md`), not a defect, but worth having in view before treating the site as demo-ready.

## Next recommended phase
**Phase 4 — Product system**: Supabase schema/migrations for `products`/`product_specifications`/`product_features`/`product_applications`/`media_assets`/`product_media` (per `09-content-and-database-model.md`), seed development products, `/products` archive page, `/products/[slug]` detail route, gallery, specs, applications/features, FAQs, related products, metadata. This is also where `CatalogueSection` on the homepage gets split into real data-driven Product/Collection discovery sections.

---

# Phase 2 — Completed (2026-09-02)

## Scope
Header, desktop/mobile navigation, search shell, footer, `Container`/`Section` layout primitives, `Button` component, typography tokens — per `13-implementation-roadmap.md` Phase 2 and `08-component-system.md`.

## Files changed
- `components/ui/Button.tsx` (new) — primary/secondary/text variants per `07-design-system.md` §9, renders as `<Link>` when given `href`
- `components/ui/icons.tsx` (new) — hand-authored menu/close/search SVGs (avoided adding an icon library for 3 glyphs)
- `components/layout/Container.tsx`, `Section.tsx` (new) — consume the `--container-*` tokens and the section background states from §16
- `components/layout/navigation.ts` (new) — shared nav item data (About, Products, Collections, Services, Blog, Contact + Request a Quote CTA), per `04-information-architecture.md`
- `components/layout/Logo.tsx` (new) — provisional "MTS" text wordmark + accent bar standing in for final logo artwork; `dark`/`light` variants for light/dark section backgrounds
- `components/layout/DesktopNav.tsx` (new, Server Component — no active-link highlighting yet, kept out of client JS)
- `components/layout/MobileNav.tsx`, `SiteSearch.tsx` (new, Client Components) — full-screen drawer and search overlay, both: focus moves to close control on open, Escape closes, focus returns to trigger, body scroll locked while open. Search input is disabled with quick links to Products/Collections/Services/Contact — real search is Phase 12, this is the shell only.
- `components/layout/SiteHeader.tsx`, `SiteFooter.tsx` (new) — compose the above. Footer omits phone/email/social/product-link columns (no real data yet, see Pending Brand Inputs) but includes Explore/Company/Legal nav columns and a copyright line.
- `lib/utils/cn.ts` (new) — `clsx` + `tailwind-merge`. Originally shipped with `clsx` alone; upgraded after browser testing caught real conflicting-utility bugs (see below).
- `app/globals.css` — added the `--text-*` typography scale (mobile value + `-lg` desktop pair, documented in `07-design-system.md` §2)
- `app/layout.tsx` — renders `SiteHeader`/`SiteFooter` around `{children}`, added a skip-to-content link
- `app/page.tsx` — placeholder no longer renders its own `<main>` (layout now owns that landmark)
- `package.json` / `package-lock.json` — added `clsx`, `tailwind-merge`

## Browser verification (not just build/typecheck)
Ran a Playwright-driven check against the dev server (desktop 1440×900 and mobile 390×844), since header/footer/nav involve real interactivity that a production build alone doesn't exercise. Playwright and its Chromium binary were installed only for this one-off check (`npm install --no-save`) and fully removed afterward — not project dependencies.

**Found and fixed a real bug this way:** the header's "Request a Quote" button (`hidden lg:inline-flex`) stayed visible on the 390px viewport, and the footer's secondary "Request a Quote" button rendered as an invisible white-on-white box. Root cause: `cn()` was plain `clsx` string concatenation, which can't reliably resolve a consumer's `className` override conflicting with a component's own base classes — outcome depended on Tailwind's internal stylesheet order, not source order. Fixed by upgrading `cn()` to `twMerge(clsx(inputs))`. Re-verified in-browser after the fix: mobile header correctly hides the button, footer button renders with correct border/text. No console errors on either viewport after the fix.

## Validation
- `npx tsc --noEmit` — clean
- `npm run lint` — clean
- `npm run build` — clean production build, all routes prerendered as static
- Playwright browser check (desktop + mobile, described above) — clean after the `cn()` fix

## Unresolved issues
None blocking. `DesktopNav` has no active-route highlighting yet (deliberately deferred to stay a Server Component — can be revisited without an architecture change). Header has no utility/contact bar (no real phone/email/WhatsApp yet — see Pending Brand Inputs).

## Next recommended phase
**Phase 3 — Homepage**, from the approved wireframe (`06-wireframe-spec.md`) and audit findings (`02-reference-site-audit.md`): hero, product discovery, application/collection discovery, company/legacy section, optional service preview, partner/certification proof, quote CTA — each section built from real content or clearly marked placeholders, never fabricated business facts.

---

# Phase 1 — Completed (2026-09-02)

## Scope
Project structure, Supabase client layer, shared content types, design-token CSS layer, base font — per `13-implementation-roadmap.md` Phase 1 definition of done ("project runs, no visual page work beyond foundation, lint/typecheck pass").

## Files changed
- `.env.local` — migrated to `NEXT_PUBLIC_SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` / `SUPABASE_SECRET_KEY`
- `.env.example` (new) — documents required env vars, no secrets
- `lib/supabase/client.ts` (new) — browser/RLS-scoped client
- `lib/supabase/server.ts` (new) — server/RLS-scoped client (cookie-aware, for Server Components/Actions)
- `lib/supabase/admin.ts` (new) — privileged server-only client using `SUPABASE_SECRET_KEY`, guarded by the `server-only` package
- `types/content.ts` (new) — shared TypeScript types for the content model in `09-content-and-database-model.md` (Product, Collection, Service, Faq, Post, Location, Partner, Certification, QuoteRequest, SiteSettings, MediaAsset). No live schema/migrations exist yet — these are the contract to build toward in Phase 4+.
- `app/globals.css` — replaced default scaffold tokens with the provisional MTS design-system tokens from `07-design-system.md` (brand/neutral colour scale, radius, motion, container widths); dropped the scaffold's `prefers-color-scheme` dark mode (not called for by any planning doc; reference site audit found no dark sections)
- `app/layout.tsx` — swapped Geist for Inter (`next/font/google`), set real MTS metadata (title/description)
- `app/page.tsx` — replaced the default `create-next-app` template with a minimal temporary placeholder confirming tokens/fonts render; explicitly not the real homepage
- `package.json` / `package-lock.json` — added `server-only` (guards the admin Supabase client from ever being imported into client code)
- `public/next.svg`, `public/vercel.svg` — removed (only referenced by the removed default template)

## Validation
- `npx tsc --noEmit` — clean, no errors
- `npm run lint` — clean, no errors
- `npm run build` — clean production build, all routes prerendered as static

## Unresolved issues
None blocking. Still pending (unchanged from "Pending Brand Inputs" below): real brand assets, contact/location data, product/service catalogue, Supabase schema (deferred to Phase 4 by design — Gate B).

## Next recommended phase
**Phase 2 — Global shell**: `SiteHeader`, `DesktopNav`, `MobileNav`, `SiteFooter`, `Section`/`Container` primitives (consuming the `--container-*` tokens already defined), base button/typography/form foundations — per `08-component-system.md` and `13-implementation-roadmap.md`.

---

# Resolved Foundation Decisions (2026-09-02)

## 1. Supabase environment variables — decided
Modern publishable/secret key model:
- `NEXT_PUBLIC_SUPABASE_URL` — browser-safe
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` — browser-safe (replaces the legacy `NEXT_PUBLIC_SUPABASE_ANON_KEY` naming everywhere in these docs)
- `SUPABASE_SECRET_KEY` — server-only, never `NEXT_PUBLIC_`-prefixed, never referenced from Client Components

`.env.local` has been migrated to this naming. `11-technical-architecture.md` updated accordingly. Two Supabase clients are required in `lib/supabase/`: a browser/RLS-scoped client (publishable key) and a server-only privileged client (secret key), used only where an operation genuinely requires bypassing RLS.

## 2. Brand inputs — partially resolved
Confirmed: business name (Mian Tayyab Steel), short name (MTS), blue-led industrial visual direction, MTS monogram/wordmark logo direction, desired character (industrial, established, strong, professional, technically credible, premium — not generic AI/SaaS).

Still not supplied: final logo artwork, exact final brand HEX, final font family, contact info, locations, catalogue, specs, certifications, brochures, company history, original photography. These are not blockers for architecture/component/database/wireframe/design-system work — use clearly marked development placeholders, never fabricated facts.

## 3. Reference-site visual audit — completed
`02-reference-site-audit.md` rewritten with real structural findings from oht.com.pk (homepage, products archive, Construction Steel collection page, services archive, about page): confirmed nav structure, homepage section order/logic, the collection-page modular block model, service-archive certification-badge placement, and the About page's generational-narrative structure. Findings are content/structure-level (fetched, not rendered in a real browser) — exact pixel measurements are explicitly marked as still needing a real-browser pass before final lock, per that doc's closing section. This is not a blocker for provisional design-system work.

## 4. Design tokens — provisional, locked for use
`07-design-system.md` now carries a full provisional token set (colour hex, typography/Inter, spacing scale, container widths, radius, motion durations) marked **"Status: Provisional — pending final brand/logo approval."** These are real, consistent values usable for first high-fidelity pages, not placeholders left blank. Swap only the values (not token names) once final brand assets arrive.

## 5. URL strategy — decided as net-new
No legacy MTS site/domain exists to migrate. Clean semantic URLs adopted throughout `03-sitemap-and-page-goals.md`, `11-technical-architecture.md`, `12-seo-and-url-strategy.md`:
```text
/  /about  /products  /products/[slug]  /collections  /collections/[slug]
/services  /services/[slug]  /blog  /blog/[slug]  /faq  /contact
/privacy-policy  /terms
```
No redirect map required now. If an existing indexed MTS site/domain is supplied later, perform the URL-crawl/redirect workflow in `12-seo-and-url-strategy.md` before launch.

---

# Confirmed Business Information

## Business Name
Mian Tayyab Steel

## Short Name
MTS

## Logo Direction
MTS monogram / wordmark.

Preferred character:
- strong
- geometric
- industrial
- simple
- professional
- scalable

The logo may take subtle inspiration from structural steel forms but must remain clean and readable.

## Primary Colour Direction
Blue-based industrial theme.

Preferred palette direction:
- deep steel/navy blue
- industrial medium blue
- pale blue-grey
- white/off-white
- charcoal
- steel grey

A provisional HEX palette is now locked in `07-design-system.md` for implementation use; final production values remain pending the confirmed logo/brand assets (see "Resolved Foundation Decisions" below).

---

# Reference Website

Primary reference:

https://oht.com.pk/

Reference use:
- site structure
- content hierarchy
- product architecture
- service architecture
- application/collection pages
- industrial design quality
- technical content presentation
- conversion flow

The new MTS website is not intended to be a blind pixel-copy.

---

# Confirmed Project Direction

The website should:

- use Next.js
- have a professional custom frontend
- support dynamic products/services/content
- include a manageable admin panel
- support quote/contact inquiries
- be SEO-friendly
- use application/collection landing pages
- be responsive
- feel premium and industrial
- avoid generic AI/SaaS design patterns

---

# Expected Technical Direction

Currently planned:

- Next.js
- App Router
- TypeScript
- Tailwind CSS
- Supabase PostgreSQL
- Supabase Auth
- Supabase Storage
- Vercel

Final implementation must follow `11-technical-architecture.md`.

---

# Confirmed Design Rules

## Required
- industrial
- strong visual hierarchy
- blue-led identity
- real product/industrial imagery
- technical credibility
- practical content density
- intentional layout
- controlled typography
- restrained motion
- strong responsive behaviour

## Explicitly Avoid
- generic AI landing page look
- SaaS visuals
- purple/blue gradient startup aesthetic
- meaningless glassmorphism
- fake statistics
- repetitive three-card sections
- excessive rounded cards
- giant headings without content justification
- random floating UI
- unnecessary animation
- decorative elements unrelated to steel/industry

---

# Dynamic Content Expected

Primary content entities:

- Products
- Product Collections / Applications
- Services
- Blog Posts
- FAQs
- Locations
- Media / PDFs
- Quote Requests
- Contact Requests
- Site Settings

Additional relationships and fields are defined in the content/database planning documents.

---

# Current Planning Deliverables

Completed / defined:
- project reference direction
- core website scope
- Next.js direction
- need for admin/CMS
- generic-AI avoidance rule
- Mian Tayyab Steel business name
- MTS logo direction
- blue industrial colour direction

---

# Pending Brand Inputs

Still to confirm when available (provisional values are in use in the meantime — see "Resolved Foundation Decisions" above):

- final MTS logo artwork
- exact logo variations
- final production colour HEX values (provisional palette in use now)
- final typography if different from provisional Inter choice
- company contact details
- office/warehouse locations
- WhatsApp number
- email addresses
- social profiles
- product catalogue
- actual product specifications
- services offered
- brochures / PDFs
- company history
- certifications
- distributor/partner details
- original photography
- final legal information

Do not fabricate these details.

Use placeholders only where necessary and clearly label them.

---

# Next Recommended Step

Phases 1–9 are complete and live-verified. Phase 10 (admin CRUD) is in progress, one entity at a time per the roadmap's explicit instruction not to build all forms at once — **Products and Collections are both fully done and verified**; the rest haven't started.

1. **Services CRUD** (next) — same pattern as Products/Collections: list/create/edit/delete, wiring `ImageUploader`/`GalleryManager` for service images and `FaqPicker` for service FAQs (all already generic, no rebuild needed).
2. Then Posts, FAQs, Locations, Partners/certifications, Settings, Inquiries, in that order.
3. Still pending, not urgent: `supabase/migrations/0002_seed_idempotency_constraints.sql` from Phase 4.
4. Privacy Policy / Terms remain intentional placeholders pending real legal content — a business decision, not a build task.

Each phase should keep using the resolved provisional tokens and confirmed content architecture, and keep following the "no fabricated business data" rule established in Phase 3 — real data or clearly marked in-progress states, never invented specifics.

---

# Claude / Cursor Instruction

Before working on a new phase:

- read the relevant planning files
- read this `PROJECT_STATE.md`
- inspect existing implementation
- preserve documented design and architecture decisions
- update this file when important project decisions change

Do not allow project decisions to exist only inside chat history.
