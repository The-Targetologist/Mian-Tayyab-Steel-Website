import { z } from "zod";

// Admin location editor schema, per docs/10-admin-panel.md's "Locations"
// section ("Manage offices/warehouses") and the Phase 7 `locations` schema.
// No slug (locations aren't individually routable — they only render as a
// list on /contact), no media/relations — the simplest entity in Phase 10.
export const locationFormSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(200),
  locationType: z.enum(["office", "warehouse", "yard", "facility"]),
  addressLine1: z.string().trim().min(1, "Address is required").max(300),
  addressLine2: z.string().trim().max(300).optional().or(z.literal("")),
  city: z.string().trim().min(1, "City is required").max(100),
  province: z.string().trim().max(100).optional().or(z.literal("")),
  postalCode: z.string().trim().max(20).optional().or(z.literal("")),
  country: z.string().trim().min(1, "Country is required").max(100).default("Pakistan"),
  phone: z.string().trim().max(50).optional().or(z.literal("")),
  email: z.string().trim().email("Enter a valid email").max(200).optional().or(z.literal("")),
  mapUrl: z.string().trim().max(500).optional().or(z.literal("")),
  mapEmbedUrl: z.string().trim().max(1000).optional().or(z.literal("")),
  isPrimary: z.boolean(),
  sortOrder: z.coerce.number().int().min(0).default(0),
  status: z.enum(["draft", "published", "archived"]),
});

export type LocationFormInput = z.infer<typeof locationFormSchema>;

export interface LocationFormState {
  status: "idle" | "error";
  message: string;
  fieldErrors?: Record<string, string[]>;
}

export const initialLocationFormState: LocationFormState = {
  status: "idle",
  message: "",
};
