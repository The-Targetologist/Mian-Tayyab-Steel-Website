// Per Next.js's own JSON-LD guide: a native <script> tag (not next/script,
// which is for executable JS), with `<` escaped to its unicode equivalent
// since JSON.stringify alone doesn't sanitize against XSS injection here.
export function JsonLd({ data }: { data: object }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, "\\u003c") }}
    />
  );
}
