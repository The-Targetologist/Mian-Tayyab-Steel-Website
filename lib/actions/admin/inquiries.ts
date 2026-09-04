"use server";

import { revalidatePath } from "next/cache";
import { getCurrentAdminUser } from "@/lib/auth/admin";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import type { QuoteRequestStatus } from "@/types/content";

const VALID_STATUSES: QuoteRequestStatus[] = [
  "new",
  "contacted",
  "qualified",
  "quoted",
  "closed",
  "spam",
];

export interface UpdateQuoteStatusResult {
  status: "success" | "error";
  message?: string;
}

// Inquiries are customer-submitted records, not admin-authored content —
// per docs/10-admin-panel.md's "Inquiries > Detail" section, the only admin
// action here is a status update, not editing the submitted data itself or
// deleting the record.
export async function updateQuoteRequestStatus(
  quoteRequestId: string,
  status: string,
): Promise<UpdateQuoteStatusResult> {
  const admin = await getCurrentAdminUser();
  if (!admin) {
    return { status: "error", message: "Not authorized." };
  }

  if (!VALID_STATUSES.includes(status as QuoteRequestStatus)) {
    return { status: "error", message: "Invalid status." };
  }

  const supabase = createSupabaseAdminClient();
  const { error } = await supabase
    .from("quote_requests")
    .update({ status })
    .eq("id", quoteRequestId);

  if (error) {
    return { status: "error", message: "Something went wrong updating the status." };
  }

  revalidatePath("/admin/inquiries");
  revalidatePath(`/admin/inquiries/${quoteRequestId}`);
  return { status: "success" };
}
