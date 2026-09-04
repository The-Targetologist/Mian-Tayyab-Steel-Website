import { z } from "zod";

// Admin site settings editor schema, per docs/09-content-and-database-model.md
// §20 and docs/10-admin-panel.md's "Site settings" section. `socialLinks` is
// authored as a {platform, url} repeater (reusing RepeaterField, same as
// specifications/capabilities) and reduced to the `social_urls` jsonb object
// in the Server Action — the one deliberately flexible field in an otherwise
// fully-typed settings row.
export const siteSettingsFormSchema = z.object({
  companyLegalName: z.string().trim().max(200).optional().or(z.literal("")),
  primaryPhone: z.string().trim().max(50).optional().or(z.literal("")),
  whatsapp: z.string().trim().max(50).optional().or(z.literal("")),
  primaryEmail: z.string().trim().email("Enter a valid email").max(200).optional().or(z.literal("")),
  socialLinks: z
    .array(
      z.object({
        platform: z.string().trim().min(1),
        url: z.string().trim().min(1),
      }),
    )
    .default([]),
  defaultSeoTitle: z.string().trim().max(200).optional().or(z.literal("")),
  defaultSeoDescription: z.string().trim().max(300).optional().or(z.literal("")),
  defaultOgImageId: z.string().uuid().optional().or(z.literal("")),
  footerDescription: z.string().trim().max(500).optional().or(z.literal("")),
  brochureMediaId: z.string().uuid().optional().or(z.literal("")),
});

export type SiteSettingsFormInput = z.infer<typeof siteSettingsFormSchema>;

export interface SiteSettingsFormState {
  status: "idle" | "success" | "error";
  message: string;
  fieldErrors?: Record<string, string[]>;
}

export const initialSiteSettingsFormState: SiteSettingsFormState = {
  status: "idle",
  message: "",
};
