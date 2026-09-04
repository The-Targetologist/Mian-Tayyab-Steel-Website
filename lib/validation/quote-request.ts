import { z } from "zod";

// docs/07-design-system.md §14 Form System — quote form fields.
// File attachment upload is Phase 11 scope (docs/13-implementation-roadmap.md
// "Phase 11 — Quote/contact workflow"), not built here.
export const quoteRequestSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(200),
  company: z.string().trim().max(200).optional().or(z.literal("")),
  email: z.string().trim().email("Enter a valid email address").max(320),
  phone: z.string().trim().min(1, "Phone number is required").max(50),
  city: z.string().trim().max(200).optional().or(z.literal("")),
  quantityText: z.string().trim().max(500).optional().or(z.literal("")),
  specificationText: z.string().trim().max(2000).optional().or(z.literal("")),
  message: z.string().trim().max(4000).optional().or(z.literal("")),
  sourcePage: z.string().trim().max(500).optional().or(z.literal("")),
  // Honeypot — real users never fill this in; bots that fill every field do.
  website: z.string().max(0, "Spam detected").optional().or(z.literal("")),
});

export type QuoteRequestInput = z.infer<typeof quoteRequestSchema>;

export interface QuoteRequestFormState {
  status: "idle" | "success" | "error";
  message: string;
  fieldErrors?: Record<string, string[]>;
}

export const initialQuoteRequestFormState: QuoteRequestFormState = {
  status: "idle",
  message: "",
};
