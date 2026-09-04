import type { Location } from "@/types/content";

interface LocationMapProps {
  location: Location;
}

// Falls back to a query-based Google Maps embed built from the location's
// own address fields when no explicit `mapEmbedUrl` has been set via the
// admin — no API key required, and it works immediately for any location
// the moment it has an address, rather than requiring an admin to first go
// generate and paste an embed URL. `mapEmbedUrl` (already editable in
// Locations admin) still takes precedence once set, e.g. to pin an exact
// building rather than relying on address geocoding.
function buildFallbackEmbedUrl(location: Location): string {
  const parts = [
    location.addressLine1,
    location.addressLine2,
    location.city,
    location.province,
    location.country,
  ].filter(Boolean);
  const query = encodeURIComponent(parts.join(", "));
  return `https://www.google.com/maps?q=${query}&output=embed`;
}

export function LocationMap({ location }: LocationMapProps) {
  const src = location.mapEmbedUrl || buildFallbackEmbedUrl(location);

  return (
    <div className="overflow-hidden rounded-md border border-neutral-100">
      <iframe
        src={src}
        title={`Map showing ${location.name}`}
        width="100%"
        height="320"
        style={{ border: 0, display: "block" }}
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
      />
    </div>
  );
}
