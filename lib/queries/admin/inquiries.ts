import "server-only";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import type { QuoteRequest, QuoteRequestStatus } from "@/types/content";

interface QuoteRequestRow {
  id: string;
  name: string;
  company: string | null;
  email: string;
  phone: string;
  city: string | null;
  product_id: string | null;
  service_id: string | null;
  quantity_text: string | null;
  specification_text: string | null;
  message: string | null;
  attachment_path: string | null;
  source_page: string | null;
  status: QuoteRequestStatus;
  created_at: string;
  product: { id: string; name: string } | null;
  service: { id: string; name: string } | null;
}

// Resolves product_id/service_id to names for display (doc10's "Quote
// requests table" columns list "product/service", not raw ids) — via the
// privileged client, so this resolves regardless of the linked product/
// service's own status.
const QUOTE_REQUEST_SELECT = `
  *,
  product:products(id, name),
  service:services(id, name)
`;

export interface AdminQuoteRequest extends QuoteRequest {
  productName: string | null;
  serviceName: string | null;
  // A short-lived signed URL, not the raw `attachmentPath` — the
  // quote-attachments bucket is private (customer-submitted files, not
  // public marketing assets), so admins view it via a temporary signed
  // URL generated on demand, never a permanent public link.
  attachmentUrl: string | null;
}

const ATTACHMENT_BUCKET = "quote-attachments";
const SIGNED_URL_EXPIRY_SECONDS = 60 * 60; // 1 hour — long enough to survive one admin session viewing the detail page, not a durable link

function mapQuoteRequest(row: QuoteRequestRow): Omit<AdminQuoteRequest, "attachmentUrl"> {
  return {
    id: row.id,
    name: row.name,
    company: row.company,
    email: row.email,
    phone: row.phone,
    city: row.city,
    productId: row.product_id,
    serviceId: row.service_id,
    quantityText: row.quantity_text,
    specificationText: row.specification_text,
    message: row.message,
    attachmentPath: row.attachment_path,
    sourcePage: row.source_page,
    status: row.status,
    createdAt: row.created_at,
    productName: row.product?.name ?? null,
    serviceName: row.service?.name ?? null,
  };
}

// The list screen doesn't show an attachment column (docs/10-admin-panel.md's
// "Quote requests table" columns are date/name-company/phone-email/product-
// service/status/source page — attachment is a "Detail" concern) — no need
// to generate a signed URL per row here.
export async function getAdminQuoteRequests(): Promise<AdminQuoteRequest[]> {
  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase
    .from("quote_requests")
    .select(QUOTE_REQUEST_SELECT)
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(`getAdminQuoteRequests: ${error.message}`);
  }

  return (data as unknown as QuoteRequestRow[]).map((row) => ({
    ...mapQuoteRequest(row),
    attachmentUrl: null,
  }));
}

// "New" == not yet triaged (docs/10-admin-panel.md's own dashboard stat
// already treats status='new' this way) — reused here as the sidebar
// unread-notification count and the list's "New" row tag, rather than
// adding a separate read/unread column for the same distinction.
export async function getNewInquiryCount(): Promise<number> {
  const supabase = createSupabaseAdminClient();
  const { count, error } = await supabase
    .from("quote_requests")
    .select("id", { count: "exact", head: true })
    .eq("status", "new");

  if (error) {
    throw new Error(`getNewInquiryCount: ${error.message}`);
  }

  return count ?? 0;
}

export async function getAdminQuoteRequestById(id: string): Promise<AdminQuoteRequest | null> {
  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase
    .from("quote_requests")
    .select(QUOTE_REQUEST_SELECT)
    .eq("id", id)
    .maybeSingle();

  if (error) {
    throw new Error(`getAdminQuoteRequestById: ${error.message}`);
  }

  if (!data) return null;

  const row = data as unknown as QuoteRequestRow;
  let attachmentUrl: string | null = null;

  if (row.attachment_path) {
    const { data: signed } = await supabase.storage
      .from(ATTACHMENT_BUCKET)
      .createSignedUrl(row.attachment_path, SIGNED_URL_EXPIRY_SECONDS);
    attachmentUrl = signed?.signedUrl ?? null;
  }

  return { ...mapQuoteRequest(row), attachmentUrl };
}
