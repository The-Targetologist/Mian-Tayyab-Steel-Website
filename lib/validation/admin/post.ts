import { z } from "zod";

// Admin blog post editor schema, per docs/10-admin-panel.md's "Blog" editor
// spec (title/slug, excerpt, featured image, body editor, publish date,
// related commercial pages, SEO). "category/tag if enabled" is skipped —
// docs/09-content-and-database-model.md §14 deliberately didn't build
// taxonomies (Phase 8 decision, no real content strategy exists yet) — and
// "related commercial pages" (post↔product/service/collection) has no
// schema support for the same reason (Phase 8: aspirational IA language,
// not in doc09's actual schema). `relatedPostIds` (article-to-article) does
// exist in the Phase 8 schema (`related_posts`, mirrors `related_products`)
// even though doc10's bullet list doesn't separately call it out — included
// here since otherwise it would be unmanageable. "Publish date" is handled
// the same automatic way as every other entity's `published_at` (set when
// status transitions to published), not a manually-editable field — no
// entity in this project exposes that as manual input.
export const postFormSchema = z.object({
  title: z.string().trim().min(1, "Title is required").max(200),
  slug: z
    .string()
    .trim()
    .min(1, "Slug is required")
    .max(200)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Use lowercase letters, numbers and hyphens only"),
  excerpt: z.string().trim().max(500).optional().or(z.literal("")),
  body: z.string().trim().min(1, "Body is required").max(20000),
  authorName: z.string().trim().max(200).optional().or(z.literal("")),
  status: z.enum(["draft", "published", "archived"]),
  seoTitle: z.string().trim().max(200).optional().or(z.literal("")),
  seoDescription: z.string().trim().max(300).optional().or(z.literal("")),
  canonicalUrl: z.string().trim().max(500).optional().or(z.literal("")),
  relatedPostIds: z.array(z.string().uuid()).default([]),
  featuredImageId: z.string().uuid().optional().or(z.literal("")),
});

export type PostFormInput = z.infer<typeof postFormSchema>;

export interface PostFormState {
  status: "idle" | "error";
  message: string;
  fieldErrors?: Record<string, string[]>;
}

export const initialPostFormState: PostFormState = {
  status: "idle",
  message: "",
};
