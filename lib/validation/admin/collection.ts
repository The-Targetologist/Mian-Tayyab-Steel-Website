import { z } from "zod";

// Mirrors types/content.ts's CollectionBlock discriminated union exactly —
// the admin editor and the public renderer must agree on this shape.
// Image fields store the resolved MediaAsset inline (not just an id) since
// content_blocks is raw JSONB read back as-is (docs/09 "structured JSON
// content blocks with a controlled block schema") — no join/resolution step
// on read, so whatever's persisted here is exactly what the public site
// renders. A known tradeoff: if an image's alt text changes later via a
// future media library, existing block references won't auto-update.
const mediaAssetSchema = z.object({
  id: z.string(),
  bucket: z.string(),
  path: z.string(),
  publicUrl: z.string(),
  altText: z.string().nullable(),
  caption: z.string().nullable(),
  width: z.number().nullable(),
  height: z.number().nullable(),
  mimeType: z.string(),
  sizeBytes: z.number(),
});

const collectionBlockSchema = z.discriminatedUnion("type", [
  z.object({ type: z.literal("rich_text"), title: z.string().optional(), body: z.string() }),
  z.object({
    type: z.literal("image_text"),
    title: z.string(),
    body: z.string(),
    image: mediaAssetSchema.nullable(),
    imagePosition: z.enum(["left", "right"]),
  }),
  z.object({
    type: z.literal("feature_list"),
    title: z.string().optional(),
    items: z.array(z.object({ title: z.string(), description: z.string().optional() })),
  }),
  z.object({
    type: z.literal("solution_cards"),
    title: z.string().optional(),
    items: z.array(z.object({ title: z.string(), description: z.string().optional() })),
  }),
  z.object({
    type: z.literal("application_grid"),
    title: z.string().optional(),
    items: z.array(z.object({ title: z.string(), description: z.string().optional() })),
  }),
  z.object({
    type: z.literal("industry_list"),
    title: z.string().optional(),
    items: z.array(z.string()),
  }),
  z.object({
    type: z.literal("comparison_table"),
    title: z.string().optional(),
    columns: z.array(z.string()),
    rows: z.array(z.array(z.string())),
  }),
  z.object({
    type: z.literal("selection_guide"),
    title: z.string().optional(),
    steps: z.array(z.object({ title: z.string(), description: z.string().optional() })),
  }),
  z.object({
    type: z.literal("cta"),
    title: z.string(),
    body: z.string().optional(),
    buttonLabel: z.string(),
    buttonHref: z.string(),
  }),
]);

export const collectionFormSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(200),
  slug: z
    .string()
    .trim()
    .min(1, "Slug is required")
    .max(200)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Use lowercase letters, numbers and hyphens only"),
  kicker: z.string().trim().max(100).optional().or(z.literal("")),
  h1: z.string().trim().min(1, "H1 is required").max(200),
  shortDescription: z.string().trim().max(500).optional().or(z.literal("")),
  introRichtext: z.string().trim().max(4000).optional().or(z.literal("")),
  status: z.enum(["draft", "published", "archived"]),
  sortOrder: z.coerce.number().int().min(0).default(0),
  seoTitle: z.string().trim().max(200).optional().or(z.literal("")),
  seoDescription: z.string().trim().max(300).optional().or(z.literal("")),
  canonicalUrl: z.string().trim().max(500).optional().or(z.literal("")),
  heroImageId: z.string().uuid().optional().or(z.literal("")),
  brochureMediaId: z.string().uuid().optional().or(z.literal("")),
  contentBlocks: z.array(collectionBlockSchema).default([]),
  productIds: z.array(z.string().uuid()).default([]),
  faqIds: z.array(z.string().uuid()).default([]),
});

export type CollectionFormInput = z.infer<typeof collectionFormSchema>;

export interface CollectionFormState {
  status: "idle" | "error";
  message: string;
  fieldErrors?: Record<string, string[]>;
}

export const initialCollectionFormState: CollectionFormState = {
  status: "idle",
  message: "",
};
