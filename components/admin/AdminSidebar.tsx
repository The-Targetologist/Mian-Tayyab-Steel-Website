import Link from "next/link";
import { getNewInquiryCount } from "@/lib/queries/admin/inquiries";

// Nav shape built ahead of the actual CRUD pages (Phase 10) — same pattern
// as the public site's nav in Phase 2. Sections per docs/10-admin-panel.md.
const navItems = [
  { label: "Dashboard", href: "/admin" },
  { label: "Products", href: "/admin/products" },
  { label: "Collections", href: "/admin/collections" },
  { label: "Services", href: "/admin/services" },
  { label: "Blog", href: "/admin/posts" },
  { label: "FAQs", href: "/admin/faqs" },
  { label: "Locations", href: "/admin/locations" },
  { label: "Partners & Certifications", href: "/admin/partners" },
  { label: "Inquiries", href: "/admin/inquiries" },
  { label: "Media", href: "/admin/media" },
  { label: "Site Settings", href: "/admin/settings" },
];

// Async so the "Inquiries" nav item can show an unread-count badge without
// a manual visit to that screen (the actual gap the user reported: new
// submissions landed in the database with no visible signal anywhere in
// the admin panel).
export async function AdminSidebar() {
  const newInquiryCount = await getNewInquiryCount();

  return (
    <nav aria-label="Admin" className="flex w-56 shrink-0 flex-col gap-1 border-r border-neutral-100 bg-white p-4">
      {navItems.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          className="flex items-center justify-between rounded-md px-3 py-2 text-body-sm font-medium text-neutral-700 hover:bg-neutral-50 hover:text-brand-600"
        >
          {item.label}
          {item.href === "/admin/inquiries" && newInquiryCount > 0 && (
            <span
              aria-label={`${newInquiryCount} new inquir${newInquiryCount === 1 ? "y" : "ies"}`}
              className="inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-brand-600 px-1.5 text-caption font-semibold text-white"
            >
              {newInquiryCount}
            </span>
          )}
        </Link>
      ))}
    </nav>
  );
}
