import { z } from "zod";

// Admin certification editor schema, per docs/09-content-and-database-model.md
// §17 and docs/10-admin-panel.md's "Partners & Certifications" section.
export const certificationFormSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(200),
  issuer: z.string().trim().max(200).optional().or(z.literal("")),
  description: z.string().trim().max(1000).optional().or(z.literal("")),
  certificateUrl: z.string().trim().max(500).optional().or(z.literal("")),
  status: z.enum(["draft", "published", "archived"]),
  sortOrder: z.coerce.number().int().min(0).default(0),
  mediaId: z.string().uuid().optional().or(z.literal("")),
});

export type CertificationFormInput = z.infer<typeof certificationFormSchema>;

export interface CertificationFormState {
  status: "idle" | "error";
  message: string;
  fieldErrors?: Record<string, string[]>;
}

export const initialCertificationFormState: CertificationFormState = {
  status: "idle",
  message: "",
};
