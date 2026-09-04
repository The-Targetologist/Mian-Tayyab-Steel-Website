import type { Metadata } from "next";
import Link from "next/link";
import { getAdminDashboardStats } from "@/lib/queries/admin-dashboard";

export const metadata: Metadata = {
  title: "Dashboard | MTS Admin",
  robots: { index: false },
};

interface DashboardCardProps {
  href: string;
  title: string;
  value: number;
  valueLabel?: string;
  secondaryLine?: string;
}

// One shared layout for every card — title first (the category), then the
// number as the clear primary focus with real breathing room, then any
// secondary breakdown on its own line below. Previously the number and
// "published" sat on the same line as a run-on phrase, with the category
// label buried in the line under that — this fixes the hierarchy so each
// piece reads as a distinct part of the stat, not one sentence.
function DashboardCard({ href, title, value, valueLabel, secondaryLine }: DashboardCardProps) {
  return (
    <Link
      href={href}
      className="flex flex-col rounded-md border border-neutral-100 bg-white p-6 transition-colors duration-fast hover:border-brand-600"
    >
      <p className="text-body-sm font-semibold text-neutral-700">{title}</p>
      <p className="mt-4 text-h1 font-bold text-neutral-950 lg:text-h1-lg">{value}</p>
      {valueLabel && <p className="mt-1 text-body-sm text-neutral-500">{valueLabel}</p>}
      {secondaryLine && <p className="mt-2 text-caption text-neutral-400">{secondaryLine}</p>}
    </Link>
  );
}

export default async function AdminDashboardPage() {
  const stats = await getAdminDashboardStats();

  const contentCards = [
    { title: "Products", published: stats.publishedProducts, draft: stats.draftProducts, href: "/admin/products" },
    { title: "Collections", published: stats.publishedCollections, draft: stats.draftCollections, href: "/admin/collections" },
    { title: "Services", published: stats.publishedServices, draft: stats.draftServices, href: "/admin/services" },
    { title: "Blog posts", published: stats.publishedPosts, draft: stats.draftPosts, href: "/admin/posts" },
  ];

  return (
    <div className="flex flex-col gap-8">
      <h1 className="text-h2 font-bold text-neutral-950">Dashboard</h1>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <DashboardCard href="/admin/inquiries" title="New Quote Requests" value={stats.newQuoteRequests} />

        {contentCards.map((card) => (
          <DashboardCard
            key={card.title}
            href={card.href}
            title={card.title}
            value={card.published}
            valueLabel="published"
            secondaryLine={`${card.draft} draft${card.draft === 1 ? "" : "s"}`}
          />
        ))}
      </div>
    </div>
  );
}
