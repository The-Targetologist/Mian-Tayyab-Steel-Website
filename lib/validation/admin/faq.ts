import { z } from "zod";

// Admin FAQ editor schema, per docs/10-admin-panel.md's "FAQs" section
// ("Global reusable FAQ library with usage indicators"). `isGlobal` is the
// one FAQ↔entity link with no other admin surface — product/service/
// collection links stay managed from those entities' own FaqPicker
// (docs/09 §12's `product_faqs`/`service_faqs`/`collection_faqs`), avoiding
// two mechanisms for the same relationship.
export const faqFormSchema = z.object({
  question: z.string().trim().min(1, "Question is required").max(300),
  answerRichtext: z.string().trim().min(1, "Answer is required").max(2000),
  status: z.enum(["draft", "published", "archived"]),
  sortOrder: z.coerce.number().int().min(0).default(0),
  isGlobal: z.boolean(),
});

export type FaqFormInput = z.infer<typeof faqFormSchema>;

export interface FaqFormState {
  status: "idle" | "error";
  message: string;
  fieldErrors?: Record<string, string[]>;
}

export const initialFaqFormState: FaqFormState = {
  status: "idle",
  message: "",
};
