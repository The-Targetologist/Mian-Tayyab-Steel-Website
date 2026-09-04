import "server-only";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import type { Faq } from "@/types/content";

interface FaqRow {
  id: string;
  question: string;
  answer_richtext: string;
  status: "draft" | "published" | "archived";
  sort_order: number;
}

function mapFaq(row: FaqRow): Faq {
  return {
    id: row.id,
    question: row.question,
    answerRichtext: row.answer_richtext,
    status: row.status,
    sortOrder: row.sort_order,
  };
}

export interface FaqUsage {
  products: number;
  services: number;
  collections: number;
  isGlobal: boolean;
}

export interface AdminFaq extends Faq {
  usage: FaqUsage;
}

function countByFaqId(rows: { faq_id: string }[] | null): Map<string, number> {
  const counts = new Map<string, number>();
  for (const row of rows ?? []) {
    counts.set(row.faq_id, (counts.get(row.faq_id) ?? 0) + 1);
  }
  return counts;
}

// The admin FAQ library screen — docs/10-admin-panel.md "Global reusable FAQ
// library with usage indicators." Usage is computed from the four link
// tables (product_faqs/service_faqs/collection_faqs/global_faqs) rather than
// a single joined query, since PostgREST aggregate counts across four
// separate relations in one `select` would be far less readable than four
// small parallel queries at this data scale.
export async function getAdminFaqs(): Promise<AdminFaq[]> {
  const supabase = createSupabaseAdminClient();
  const [
    { data: faqs, error },
    { data: productLinks },
    { data: serviceLinks },
    { data: collectionLinks },
    { data: globalLinks },
  ] = await Promise.all([
    supabase.from("faqs").select("*").order("sort_order", { ascending: true }),
    supabase.from("product_faqs").select("faq_id"),
    supabase.from("service_faqs").select("faq_id"),
    supabase.from("collection_faqs").select("faq_id"),
    supabase.from("global_faqs").select("faq_id"),
  ]);

  if (error) {
    throw new Error(`getAdminFaqs: ${error.message}`);
  }

  const productCounts = countByFaqId(productLinks);
  const serviceCounts = countByFaqId(serviceLinks);
  const collectionCounts = countByFaqId(collectionLinks);
  const globalIds = new Set((globalLinks ?? []).map((row) => row.faq_id));

  return (faqs as FaqRow[]).map((row) => ({
    ...mapFaq(row),
    usage: {
      products: productCounts.get(row.id) ?? 0,
      services: serviceCounts.get(row.id) ?? 0,
      collections: collectionCounts.get(row.id) ?? 0,
      isGlobal: globalIds.has(row.id),
    },
  }));
}

export async function getAdminFaqById(id: string): Promise<Faq | null> {
  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase.from("faqs").select("*").eq("id", id).maybeSingle();

  if (error) {
    throw new Error(`getAdminFaqById: ${error.message}`);
  }

  return data ? mapFaq(data as FaqRow) : null;
}

export async function isFaqGlobal(id: string): Promise<boolean> {
  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase
    .from("global_faqs")
    .select("faq_id")
    .eq("faq_id", id)
    .maybeSingle();

  if (error) {
    throw new Error(`isFaqGlobal: ${error.message}`);
  }

  return data !== null;
}

export interface FaqOption {
  id: string;
  question: string;
}

// All FAQs regardless of status — the admin picker needs to see drafts too
// (e.g. one just quick-created and not yet published via the future FAQs
// management screen).
export async function getAllFaqOptions(): Promise<FaqOption[]> {
  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase
    .from("faqs")
    .select("id, question")
    .order("question", { ascending: true });

  if (error) {
    throw new Error(`getAllFaqOptions: ${error.message}`);
  }

  return data;
}

export async function getFaqIdsForProduct(productId: string): Promise<string[]> {
  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase
    .from("product_faqs")
    .select("faq_id")
    .eq("product_id", productId);

  if (error) {
    throw new Error(`getFaqIdsForProduct: ${error.message}`);
  }

  return data.map((row) => row.faq_id);
}

export async function getFaqIdsForService(serviceId: string): Promise<string[]> {
  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase
    .from("service_faqs")
    .select("faq_id")
    .eq("service_id", serviceId);

  if (error) {
    throw new Error(`getFaqIdsForService: ${error.message}`);
  }

  return data.map((row) => row.faq_id);
}
