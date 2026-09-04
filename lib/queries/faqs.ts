import "server-only";
import { createSupabasePublicClient } from "@/lib/supabase/public";
import type { Faq } from "@/types/content";

interface FaqRow {
  id: string;
  question: string;
  answer_richtext: string;
  status: "draft" | "published" | "archived";
  sort_order: number;
}

interface GlobalFaqRow {
  sort_order: number;
  faq: FaqRow | null;
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

export async function getGlobalFaqs(): Promise<Faq[]> {
  const supabase = createSupabasePublicClient();
  const { data, error } = await supabase
    .from("global_faqs")
    .select("sort_order, faq:faqs(*)")
    .order("sort_order", { ascending: true });

  if (error) {
    throw new Error(`getGlobalFaqs: ${error.message}`);
  }

  return (data as unknown as GlobalFaqRow[])
    .filter((row): row is GlobalFaqRow & { faq: FaqRow } => row.faq !== null && row.faq.status === "published")
    .map((row) => mapFaq(row.faq));
}
