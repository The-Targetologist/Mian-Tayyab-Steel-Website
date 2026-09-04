"use server";

import { z } from "zod";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { getCurrentAdminUser } from "@/lib/auth/admin";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { faqFormSchema, type FaqFormState } from "@/lib/validation/admin/faq";

const quickFaqSchema = z.object({
  question: z.string().trim().min(1, "Question is required").max(300),
  answerRichtext: z.string().trim().min(1, "Answer is required").max(2000),
});

export interface QuickFaqResult {
  status: "success" | "error";
  message?: string;
  faq?: { id: string; question: string };
}

// "Select existing or create contextual FAQs" (docs/10-admin-panel.md) —
// this is the "create" half, called directly from FaqPicker as soon as the
// admin submits the inline add-FAQ form, not bundled into the parent
// entity form. New FAQs default to 'draft' — they won't appear on the
// public site until published via the future dedicated FAQs management
// screen (Phase 10's later "FAQs" entity), consistent with every other
// content type's draft-by-default behavior in this project.
export async function createQuickFaq(
  question: string,
  answerRichtext: string,
): Promise<QuickFaqResult> {
  const admin = await getCurrentAdminUser();
  if (!admin) {
    return { status: "error", message: "Not authorized." };
  }

  const parsed = quickFaqSchema.safeParse({ question, answerRichtext });
  if (!parsed.success) {
    return { status: "error", message: "Question and answer are required." };
  }

  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase
    .from("faqs")
    .insert({
      question: parsed.data.question,
      answer_richtext: parsed.data.answerRichtext,
      status: "draft",
    })
    .select("id, question")
    .single();

  if (error || !data) {
    return { status: "error", message: "Something went wrong creating the FAQ." };
  }

  return { status: "success", faq: data };
}

function parseFaqFormData(formData: FormData) {
  return {
    question: formData.get("question")?.toString() ?? "",
    answerRichtext: formData.get("answerRichtext")?.toString() ?? "",
    status: formData.get("status")?.toString() ?? "draft",
    sortOrder: formData.get("sortOrder")?.toString() ?? "0",
    isGlobal: formData.get("isGlobal") === "on",
  };
}

async function syncGlobalFaq(faqId: string, isGlobal: boolean) {
  const supabase = createSupabaseAdminClient();
  await supabase.from("global_faqs").delete().eq("faq_id", faqId);
  if (isGlobal) {
    await supabase.from("global_faqs").insert({ faq_id: faqId });
  }
}

export async function createFaq(
  _prevState: FaqFormState,
  formData: FormData,
): Promise<FaqFormState> {
  const admin = await getCurrentAdminUser();
  if (!admin) {
    return { status: "error", message: "Not authorized." };
  }

  const parsed = faqFormSchema.safeParse(parseFaqFormData(formData));

  if (!parsed.success) {
    return {
      status: "error",
      message: "Please check the form for errors.",
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  const input = parsed.data;
  const supabase = createSupabaseAdminClient();

  const { data: faq, error } = await supabase
    .from("faqs")
    .insert({
      question: input.question,
      answer_richtext: input.answerRichtext,
      status: input.status,
      sort_order: input.sortOrder,
    })
    .select("id")
    .single();

  if (error || !faq) {
    if (error?.code === "23505") {
      return {
        status: "error",
        message: "That question already exists.",
        fieldErrors: { question: ["Question must be unique"] },
      };
    }
    return { status: "error", message: "Something went wrong creating the FAQ." };
  }

  await syncGlobalFaq(faq.id, input.isGlobal);
  revalidatePath("/faq");
  redirect("/admin/faqs");
}

export async function updateFaq(
  faqId: string,
  _prevState: FaqFormState,
  formData: FormData,
): Promise<FaqFormState> {
  const admin = await getCurrentAdminUser();
  if (!admin) {
    return { status: "error", message: "Not authorized." };
  }

  const parsed = faqFormSchema.safeParse(parseFaqFormData(formData));

  if (!parsed.success) {
    return {
      status: "error",
      message: "Please check the form for errors.",
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  const input = parsed.data;
  const supabase = createSupabaseAdminClient();

  const { error } = await supabase
    .from("faqs")
    .update({
      question: input.question,
      answer_richtext: input.answerRichtext,
      status: input.status,
      sort_order: input.sortOrder,
    })
    .eq("id", faqId);

  if (error) {
    if (error.code === "23505") {
      return {
        status: "error",
        message: "That question already exists.",
        fieldErrors: { question: ["Question must be unique"] },
      };
    }
    return { status: "error", message: "Something went wrong updating the FAQ." };
  }

  await syncGlobalFaq(faqId, input.isGlobal);
  // Cheap to always revalidate the global FAQ page; the product/service/
  // collection detail pages that may also link this FAQ aren't tracked here
  // (there's no bounded set of affected slugs to revalidate precisely) —
  // they pick up the change on their next natural revalidation.
  revalidatePath("/faq");
  redirect("/admin/faqs");
}

export async function deleteFaq(faqId: string): Promise<void> {
  const admin = await getCurrentAdminUser();
  if (!admin) return;

  const supabase = createSupabaseAdminClient();
  // product_faqs/service_faqs/collection_faqs/global_faqs all cascade on
  // delete (docs/09 §12's link tables reference faqs(id) on delete cascade).
  await supabase.from("faqs").delete().eq("id", faqId);

  revalidatePath("/faq");
  revalidatePath("/admin/faqs");
}
