import type { Metadata } from "next";
import Link from "next/link";
import { getAdminDashboardStats } from "@/lib/queries/admin-dashboard";

export const metadata: Metadata = {
  title: "Dashboard | MTS Admin",
  robots: { index: false },
};

export default async function AdminDashboardPage() {
  const stats = await getAdminDashboardStats();

  const cards = [
    { label: "New quote requests", value: stats.newQuoteRequests, href: "/admin/inquiries" },
    { label: "Draft products", value: stats.draftProducts, href: "/admin/products" },
    { label: "Draft collections", value: stats.draftCollections, href: "/admin/collections" },
    { label: "Draft services", value: stats.draftServices, href: "/admin/services" },
    { label: "Draft blog posts", value: stats.draftPosts, href: "/admin/posts" },
  ];

  return (
    <div className="flex flex-col gap-8">
      <h1 className="text-h2 font-bold text-neutral-950">Dashboard</h1>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {cards.map((card) => (
          <Link
            key={card.label}
            href={card.href}
            className="rounded-md border border-neutral-100 bg-white p-6 transition-colors duration-fast hover:border-brand-600"
          >
            <p className="text-h1 font-bold text-neutral-950">{card.value}</p>
            <p className="mt-1 text-body-sm text-neutral-600">{card.label}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
