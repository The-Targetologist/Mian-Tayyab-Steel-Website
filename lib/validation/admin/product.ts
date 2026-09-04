import { z } from "zod";

// Admin product editor schema.
export const productFormSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(200),
  slug: z
    .string()
    .trim()
    .min(1, "Slug is required")
    .max(200)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Use lowercase letters, numbers and hyphens only"),
  shortName: z.string().trim().max(50).optional().or(z.literal("")),
  shortDescription: z.string().trim().max(500).optional().or(z.literal("")),
  introRichtext: z.string().trim().max(4000).optional().or(z.literal("")),
  origin: z.string().trim().max(200).optional().or(z.literal("")),
  status: z.enum(["draft", "published", "archived"]),
  isFeatured: z.boolean(),
  sortOrder: z.coerce.number().int().min(0).default(0),
  seoTitle: z.string().trim().max(200).optional().or(z.literal("")),
  seoDescription: z.string().trim().max(300).optional().or(z.literal("")),
  canonicalUrl: z.string().trim().max(500).optional().or(z.literal("")),
  specifications: z
    .array(
      z.object({
        label: z.string().trim().min(1),
        value: z.string().trim().min(1),
        unit: z.string().trim().optional().or(z.literal("")),
      }),
    )
    .default([]),
  features: z
    .array(
      z.object({
        title: z.string().trim().optional().or(z.literal("")),
        description: z.string().trim().min(1),
      }),
    )
    .default([]),
  applications: z
    .array(
      z.object({
        title: z.string().trim().min(1),
        description: z.string().trim().optional().or(z.literal("")),
      }),
    )
    .default([]),
  collectionIds: z.array(z.string().uuid()).default([]),
  relatedProductIds: z.array(z.string().uuid()).default([]),
  featuredImageId: z.string().uuid().optional().or(z.literal("")),
  galleryMediaIds: z.array(z.string().uuid()).default([]),
  faqIds: z.array(z.string().uuid()).default([]),
});

export type ProductFormInput = z.infer<typeof productFormSchema>;

export interface ProductFormState {
  status: "idle" | "error";
  message: string;
  fieldErrors?: Record<string, string[]>;
}

export const initialProductFormState: ProductFormState = {
  status: "idle",
  message: "",
};
