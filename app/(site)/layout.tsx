import { SiteHeader } from "@/components/layout/SiteHeader";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { FloatingWhatsAppButton } from "@/components/layout/FloatingWhatsAppButton";
import { ScrollToTopButton } from "@/components/layout/ScrollToTopButton";
import { getSiteSettings } from "@/lib/queries/settings";

// Placeholder until a real WhatsApp number is confirmed in Site Settings —
// same disclosure pattern as SiteHeader's placeholder phone number.
const PLACEHOLDER_WHATSAPP = "+92 300 0000000";

// Marketing site chrome — split out from the root layout so /admin can have
// its own separate shell (docs/11-technical-architecture.md's repository
// shape: app/(site)/ for public pages, app/admin/ standalone).
export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  const settings = await getSiteSettings();
  const whatsappNumber = settings.whatsapp || PLACEHOLDER_WHATSAPP;

  return (
    <>
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:rounded-md focus:bg-brand-600 focus:px-4 focus:py-2 focus:text-white"
      >
        Skip to content
      </a>
      <SiteHeader />
      <main id="main-content" className="flex flex-1 flex-col">
        {children}
      </main>
      <SiteFooter />
      <FloatingWhatsAppButton whatsappNumber={whatsappNumber} isPlaceholder={!settings.whatsapp} />
      <ScrollToTopButton />
    </>
  );
}
