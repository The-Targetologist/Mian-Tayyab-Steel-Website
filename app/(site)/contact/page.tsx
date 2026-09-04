import type { Metadata } from "next";
import { Section } from "@/components/layout/Section";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import { QuoteForm } from "@/components/forms/QuoteForm";
import { LocationMap } from "@/components/ui/LocationMap";
import { buildPageMetadata } from "@/lib/seo/metadata";
import { getPublishedLocations } from "@/lib/queries/locations";

export const metadata: Metadata = buildPageMetadata({
  path: "/contact",
  title: "Contact | Mian Tayyab Steel",
  description: "Get in touch with Mian Tayyab Steel for quotes and inquiries.",
});

// Contact channels/locations render only once real data exists — no
// invented phone numbers, emails or addresses (docs/PROJECT_STATE.md
// "Pending Brand Inputs"). The form itself is fully real: validated
// server-side (lib/validation/quote-request.ts) and written to
// quote_requests via a Server Action (lib/actions/quote-request.ts).
export default async function ContactPage() {
  const locations = await getPublishedLocations();
  // The primary location anchors the office-info + map block; any others
  // (e.g. a second warehouse) list underneath without their own map, to
  // keep one clear focal point on the page rather than one map per location.
  const primaryLocation = locations.find((location) => location.isPrimary) ?? locations[0] ?? null;
  const otherLocations = locations.filter((location) => location.id !== primaryLocation?.id);

  return (
    <Section background="white">
      <div className="flex flex-col gap-10">
        <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Contact" }]} />

        <div className="max-w-2xl">
          <p className="text-sm font-medium tracking-wide text-brand-600 uppercase">Contact</p>
          <h1 className="mt-2 text-h1 font-bold text-neutral-950 lg:text-h1-lg">Get in touch</h1>
          <p className="mt-4 text-body-lg text-neutral-700">
            Tell us what you need and our team will get back to you.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-10 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:gap-16">
          <div className="flex flex-col gap-6">
            {primaryLocation && (
              <div className="rounded-md border border-neutral-100 p-5 text-body-sm">
                <p className="font-semibold text-neutral-950">{primaryLocation.name}</p>
                <p className="mt-1 text-neutral-600">
                  {primaryLocation.addressLine1}
                  {primaryLocation.addressLine2 ? `, ${primaryLocation.addressLine2}` : ""}, {primaryLocation.city}
                  {primaryLocation.province ? `, ${primaryLocation.province}` : ""}
                </p>
                {primaryLocation.phone && <p className="mt-1 text-neutral-600">{primaryLocation.phone}</p>}
                {primaryLocation.email && <p className="text-neutral-600">{primaryLocation.email}</p>}
              </div>
            )}

            {otherLocations.length > 0 && (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-1">
                {otherLocations.map((location) => (
                  <div key={location.id} className="rounded-md border border-neutral-100 p-5 text-body-sm">
                    <p className="font-semibold text-neutral-950">{location.name}</p>
                    <p className="mt-1 text-neutral-600">
                      {location.addressLine1}
                      {location.addressLine2 ? `, ${location.addressLine2}` : ""}, {location.city}
                    </p>
                    {location.phone && <p className="mt-1 text-neutral-600">{location.phone}</p>}
                    {location.email && <p className="text-neutral-600">{location.email}</p>}
                  </div>
                ))}
              </div>
            )}

            {primaryLocation && <LocationMap location={primaryLocation} />}
          </div>

          <QuoteForm />
        </div>
      </div>
    </Section>
  );
}
