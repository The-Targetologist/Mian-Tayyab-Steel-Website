import { z } from "zod";

// Admin service editor schema — mirrors lib/validation/admin/product.ts,
// per docs/10-admin-panel.md's "Services" editor spec (name/slug/status,
// description/content, gallery, capabilities, service area, related
// products, FAQs, SEO). No "requirements" field in doc10's bullet list, but
// service_requirements already exists in the Phase 6 schema
// (ServiceRequirement / ProjectRequirementBlock) — included here so the
// admin can actually manage what the public service detail page renders.
export const serviceFormSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(200),
  slug: z
    .string()
    .trim()
    .min(1, "Slug is required")
    .max(200)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Use lowercase letters, numbers and hyphens only"),
  shortDescription: z.string().trim().max(500).optional().or(z.literal("")),
  introRichtext: z.string().trim().max(4000).optional().or(z.literal("")),
  bodyRichtext: z.string().trim().max(8000).optional().or(z.literal("")),
  serviceArea: z.string().trim().max(200).optional().or(z.literal("")),
  status: z.enum(["draft", "published", "archived"]),
  isFeatured: z.boolean(),
  sortOrder: z.coerce.number().int().min(0).default(0),
  seoTitle: z.string().trim().max(200).optional().or(z.literal("")),
  seoDescription: z.string().trim().max(300).optional().or(z.literal("")),
  canonicalUrl: z.string().trim().max(500).optional().or(z.literal("")),
  capabilities: z
    .array(
      z.object({
        label: z.string().trim().min(1),
        value: z.string().trim().min(1),
        unit: z.string().trim().optional().or(z.literal("")),
      }),
    )
    .default([]),
  requirements: z
    .array(
      z.object({
        title: z.string().trim().min(1),
        description: z.string().trim().optional().or(z.literal("")),
      }),
    )
    .default([]),
  relatedProductIds: z.array(z.string().uuid()).default([]),
  featuredImageId: z.string().uuid().optional().or(z.literal("")),
  galleryMediaIds: z.array(z.string().uuid()).default([]),
  faqIds: z.array(z.string().uuid()).default([]),
});

export type ServiceFormInput = z.infer<typeof serviceFormSchema>;

export interface ServiceFormState {
  status: "idle" | "error";
  message: string;
  fieldErrors?: Record<string, string[]>;
}

export const initialServiceFormState: ServiceFormState = {
  status: "idle",
  message: "",
};
