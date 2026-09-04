import { z } from "zod";

// Admin partner editor schema, per docs/09-content-and-database-model.md
// §16 and docs/10-admin-panel.md's "Partners & Certifications" section
// ("Manage logo, title, relationship/certificate data, links and ordering").
export const partnerFormSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(200),
  description: z.string().trim().max(1000).optional().or(z.literal("")),
  websiteUrl: z.string().trim().max(500).optional().or(z.literal("")),
  relationshipLabel: z.string().trim().max(200).optional().or(z.literal("")),
  status: z.enum(["draft", "published", "archived"]),
  sortOrder: z.coerce.number().int().min(0).default(0),
  logoMediaId: z.string().uuid().optional().or(z.literal("")),
});

export type PartnerFormInput = z.infer<typeof partnerFormSchema>;

export interface PartnerFormState {
  status: "idle" | "error";
  message: string;
  fieldErrors?: Record<string, string[]>;
}

export const initialPartnerFormState: PartnerFormState = {
  status: "idle",
  message: "",
};
