"use server";

import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { quoteRequestSchema, type QuoteRequestFormState } from "@/lib/validation/quote-request";

const ATTACHMENT_BUCKET = "quote-attachments";
const ALLOWED_ATTACHMENT_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "application/pdf",
]);
const MAX_ATTACHMENT_SIZE_BYTES = 10 * 1024 * 1024; // 10MB — matches the bucket's own limit

// "Rate limiting where practical" (docs/11-technical-architecture.md) — keyed
// on email rather than IP: email is always present and validated, whereas
// trusting a proxy-supplied IP header varies by hosting platform. This
// doesn't stop a bot that rotates fake emails, but it does stop the more
// common case (repeated/accidental resubmission, or manual abuse from one
// real address) without needing new infrastructure (no Redis/KV configured
// in this project) or a schema change to track IPs.
const RATE_LIMIT_WINDOW_MINUTES = 60;
const RATE_LIMIT_MAX_SUBMISSIONS = 5;

async function isRateLimited(
  supabase: ReturnType<typeof createSupabaseAdminClient>,
  email: string,
): Promise<boolean> {
  const windowStart = new Date(Date.now() - RATE_LIMIT_WINDOW_MINUTES * 60 * 1000).toISOString();
  const { count, error } = await supabase
    .from("quote_requests")
    .select("id", { count: "exact", head: true })
    .eq("email", email)
    .gte("created_at", windowStart);

  // Fail open — a broken rate-limit check should never block a real
  // submission.
  if (error) return false;
  return (count ?? 0) >= RATE_LIMIT_MAX_SUBMISSIONS;
}

// Server Action backing the contact/quote form. Never trust client
// validation alone (docs/11-technical-architecture.md) — re-validates with
// the same schema server-side, and writes via the privileged admin client
// since quote_requests has no public insert policy (see
// supabase/migrations/0005_contact_and_faq.sql).
export async function submitQuoteRequest(
  _prevState: QuoteRequestFormState,
  formData: FormData,
): Promise<QuoteRequestFormState> {
  const raw = {
    name: formData.get("name")?.toString() ?? "",
    company: formData.get("company")?.toString() ?? "",
    email: formData.get("email")?.toString() ?? "",
    phone: formData.get("phone")?.toString() ?? "",
    city: formData.get("city")?.toString() ?? "",
    quantityText: formData.get("quantityText")?.toString() ?? "",
    specificationText: formData.get("specificationText")?.toString() ?? "",
    message: formData.get("message")?.toString() ?? "",
    sourcePage: formData.get("sourcePage")?.toString() ?? "",
    website: formData.get("website")?.toString() ?? "",
  };

  const parsed = quoteRequestSchema.safeParse(raw);

  if (!parsed.success) {
    return {
      status: "error",
      message: "Please check the form for errors.",
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  const input = parsed.data;
  const supabase = createSupabaseAdminClient();

  if (await isRateLimited(supabase, input.email)) {
    return {
      status: "error",
      message: "You've submitted several requests recently. Please wait a while before submitting again, or contact us directly.",
    };
  }

  let attachmentPath: string | null = null;
  const attachment = formData.get("attachment");
  if (attachment instanceof File && attachment.size > 0) {
    if (!ALLOWED_ATTACHMENT_TYPES.has(attachment.type)) {
      return {
        status: "error",
        message: "That attachment type isn't supported. Please attach an image or PDF.",
        fieldErrors: { attachment: ["Unsupported file type"] },
      };
    }
    if (attachment.size > MAX_ATTACHMENT_SIZE_BYTES) {
      return {
        status: "error",
        message: "That attachment is too large (10MB limit).",
        fieldErrors: { attachment: ["File is too large"] },
      };
    }

    const safeName = attachment.name.replace(/[^a-zA-Z0-9.-]/g, "-").toLowerCase();
    const path = `quote-requests/${Date.now()}-${safeName}`;
    const { error: uploadError } = await supabase.storage
      .from(ATTACHMENT_BUCKET)
      .upload(path, attachment, { contentType: attachment.type, upsert: false });

    if (uploadError) {
      return {
        status: "error",
        message: "Something went wrong uploading your attachment. Please try again without it, or contact us directly.",
      };
    }
    attachmentPath = path;
  }

  const { error } = await supabase.from("quote_requests").insert({
    name: input.name,
    company: input.company || null,
    email: input.email,
    phone: input.phone,
    city: input.city || null,
    quantity_text: input.quantityText || null,
    specification_text: input.specificationText || null,
    message: input.message || null,
    source_page: input.sourcePage || null,
    attachment_path: attachmentPath,
    status: "new",
  });

  if (error) {
    if (attachmentPath) {
      await supabase.storage.from(ATTACHMENT_BUCKET).remove([attachmentPath]);
    }
    return {
      status: "error",
      message: "Something went wrong submitting your request. Please try again or contact us directly.",
    };
  }

  return {
    status: "success",
    message: "Thanks — we've received your request and will get back to you soon.",
  };
}
