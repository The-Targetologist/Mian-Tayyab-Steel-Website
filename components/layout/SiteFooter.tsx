import Link from "next/link";
import { Container } from "./Container";
import { Logo } from "./Logo";
import { getSiteSettings } from "@/lib/queries/settings";

interface FooterLink {
  label: string;
  href: string;
}

// Product/collection links are omitted until real catalogue data exists —
// see docs/PROJECT_STATE.md "Pending Brand Inputs". Navigation links below
// are information architecture, not business facts, so they're safe to fill
// in now (docs/04-information-architecture.md).
const exploreLinks: FooterLink[] = [
  { label: "Products", href: "/products" },
  { label: "Collections", href: "/collections" },
  { label: "Services", href: "/services" },
  { label: "Blog", href: "/blog" },
];

const companyLinks: FooterLink[] = [
  { label: "About", href: "/about" },
  { label: "Contact", href: "/contact" },
  { label: "FAQ", href: "/faq" },
];

const legalLinks: FooterLink[] = [
  { label: "Privacy Policy", href: "/privacy-policy" },
  { label: "Terms", href: "/terms" },
];

// Real settings (footer description, contact details, social links) now
// come from the admin-managed site_settings singleton (Phase 10) — falls
// back to the original placeholder tagline only when no real description has
// been set yet, same "render only if real data exists" pattern as every
// other pending-brand-input section in this project.
export async function SiteFooter() {
  const year = new Date().getFullYear();
  const settings = await getSiteSettings();
  const socialEntries = Object.entries(settings.socialUrls);

  return (
    <footer className="border-t border-neutral-900 bg-neutral-950 text-neutral-100">
      <Container size="xl">
        <div className="grid gap-12 py-16 lg:grid-cols-[2fr_1fr_1fr_1fr] lg:py-20">
          <div className="flex flex-col gap-4">
            <Logo variant="light" />
            <p className="max-w-sm text-body-sm text-neutral-300">
              {settings.footerDescription ||
                "Structural and industrial steel supplier for contractors, fabricators, and industrial projects across Pakistan."}
            </p>
            {(settings.primaryPhone || settings.primaryEmail) && (
              <div className="flex flex-col gap-1 text-body-sm text-neutral-300">
                {settings.primaryPhone && <p>{settings.primaryPhone}</p>}
                {settings.primaryEmail && <p>{settings.primaryEmail}</p>}
              </div>
            )}
            {socialEntries.length > 0 && (
              <div className="flex flex-wrap gap-4 text-body-sm">
                {socialEntries.map(([platform, url]) => (
                  <a
                    key={platform}
                    href={url}
                    target="_blank"
                    rel="noreferrer"
                    className="text-neutral-300 capitalize transition-colors duration-fast hover:text-white"
                  >
                    {platform}
                  </a>
                ))}
              </div>
            )}
          </div>

          <FooterColumn title="Explore" links={exploreLinks} />
          <FooterColumn title="Company" links={companyLinks} />
          <FooterColumn title="Legal" links={legalLinks} />
        </div>

        <div className="border-t border-neutral-800 py-6 text-body-sm text-neutral-400">
          <p>© {year} {settings.companyLegalName || "Mian Tayyab Steel"}. All rights reserved.</p>
        </div>
      </Container>
    </footer>
  );
}

function FooterColumn({ title, links }: { title: string; links: FooterLink[] }) {
  return (
    <div>
      <h3 className="text-body-sm font-semibold tracking-wide text-neutral-400 uppercase">
        {title}
      </h3>
      <ul className="mt-4 flex flex-col gap-3">
        {links.map((link) => (
          <li key={link.href}>
            <Link
              href={link.href}
              className="text-body-sm text-neutral-300 transition-colors duration-fast hover:text-white"
            >
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
