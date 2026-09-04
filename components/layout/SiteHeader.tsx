import { Logo } from "./Logo";
import { DesktopNav } from "./DesktopNav";
import { MobileNav } from "./MobileNav";
import { SiteSearch } from "./SiteSearch";
import { Container } from "./Container";
import { Button } from "@/components/ui/Button";
import { PhoneIcon } from "@/components/ui/icons";
import { quoteCta } from "./navigation";
import { getSiteSettings } from "@/lib/queries/settings";

// Placeholder until a real business phone number is confirmed in Site
// Settings (docs/PROJECT_STATE.md "Pending Brand Inputs") — surfaced via
// the button's own `title` tooltip rather than cluttering the compact
// header, same "clearly marked, not fabricated fact" disclosure as the
// About page's placeholder company profile PDF.
const PLACEHOLDER_PHONE = "+92 300 0000000";

// Async — fetches real settings so "Call Us" links to the actual business
// number the moment one is entered via /admin/settings, matching SiteFooter's
// existing pattern for the same data.
export async function SiteHeader() {
  const settings = await getSiteSettings();
  const phone = settings.primaryPhone || PLACEHOLDER_PHONE;
  const isPlaceholderPhone = !settings.primaryPhone;
  const telHref = `tel:${phone.replace(/\s+/g, "")}`;

  return (
    <header className="sticky top-0 z-40 border-b border-neutral-100 bg-white">
      <Container size="xl">
        <div className="flex h-16 items-center justify-between gap-4 lg:h-20">
          <Logo />
          <DesktopNav />
          <div className="flex items-center gap-2">
            <SiteSearch />
            <Button
              href={telHref}
              variant="secondary"
              className="hidden items-center gap-2 lg:inline-flex"
              title={isPlaceholderPhone ? "Placeholder number — update in Site Settings" : undefined}
            >
              <PhoneIcon width={16} height={16} />
              Call Us
            </Button>
            <Button href={quoteCta.href} variant="primary" className="hidden lg:inline-flex">
              {quoteCta.label}
            </Button>
            <MobileNav phone={phone} isPlaceholderPhone={isPlaceholderPhone} />
          </div>
        </div>
      </Container>
    </header>
  );
}
