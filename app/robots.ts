import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/seo/metadata";

// docs/12-seo-and-url-strategy.md "Robots": allow public content, block
// admin/private routes. /search is allowed to crawl (it's not disallowed
// here) but individually noindexed via its own page metadata instead —
// disallowing it here would also block a crawler from ever discovering that
// noindex directive on result pages that happen to get linked externally.
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/admin", "/admin/"],
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
