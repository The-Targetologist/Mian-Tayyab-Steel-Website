import Image from "next/image";
import { Section } from "@/components/layout/Section";
import type { Partner } from "@/types/content";

// docs/02-reference-site-audit.md "Partner credentials" — the reference
// site's actual named distributors (International Steel Limited, Aisha
// Steel Mills) are OHT's real facts, not MTS's, so they're never reused
// here. Renders only when real (or, for now, clearly placeholder) partner
// data actually exists via the admin — same "no section for data that
// doesn't exist" rule as every other homepage section.
export function DistributorsSection({ partners }: { partners: Partner[] }) {
  if (partners.length === 0) return null;

  return (
    <Section background="off-white">
      <div className="flex flex-col gap-8">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-medium tracking-wide text-brand-600 uppercase">
            Authorized Distributors &amp; Franchisers
          </p>
          <h2 className="mt-2 text-h2 font-bold text-neutral-950 lg:text-h2-lg">
            Officially Authorized by Leading Steel Manufacturers
          </h2>
          <p className="mt-4 text-body-lg text-neutral-700">
            We are officially authorized distributors and franchisers of trusted steel
            manufacturers, giving our customers confidence in the material we supply.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:mx-auto lg:max-w-3xl">
          {partners.map((partner) => (
            <div
              key={partner.id}
              className="flex flex-col items-center gap-4 rounded-md border border-neutral-100 bg-white p-6 text-center"
            >
              <div className="relative h-16 w-32">
                {partner.logo ? (
                  <Image
                    src={partner.logo.publicUrl}
                    alt={partner.logo.altText ?? partner.name}
                    fill
                    sizes="128px"
                    className="object-contain"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center rounded-md bg-brand-50 text-caption font-medium text-brand-700">
                    {partner.name}
                  </div>
                )}
              </div>
              <div>
                <p className="font-semibold text-neutral-950">{partner.name}</p>
                {partner.relationshipLabel && (
                  <p className="text-caption font-medium tracking-wide text-brand-600 uppercase">
                    {partner.relationshipLabel}
                  </p>
                )}
              </div>
              {partner.description && (
                <p className="text-body-sm text-neutral-600">{partner.description}</p>
              )}
              {partner.websiteUrl && (
                <a
                  href={partner.websiteUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="text-body-sm font-medium text-brand-600 hover:underline"
                >
                  Official Website
                </a>
              )}
            </div>
          ))}
        </div>
      </div>
    </Section>
  );
}
