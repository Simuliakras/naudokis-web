import type { MetadataRoute } from "next";
import { fetchListingSitemapCount } from "@/app/lib/listing-sitemap";
import { SITE_URL } from "@/app/lib/seo";

export default async function robots(): Promise<MetadataRoute.Robots> {
  const listingSitemapCount = await fetchListingSitemapCount();
  const listingSitemaps = Array.from(
    { length: listingSitemapCount },
    (_, id) => `${SITE_URL}/listings/sitemap/${id}.xml`,
  );
  return {
    // Everything stays crawlable EXCEPT endpoints that are not documents. The
    // many pages that rely on `meta robots: noindex` (search-param feed states,
    // low-stock landings, handoff/token pages, /invite) must NOT be disallowed:
    // a blocked URL is never fetched, so the very directive keeping it out of
    // the index would go unread.
    //   /api/  — POST-only report/measurement endpoints, no crawlable content.
    //   /go    — the no-store 302 install redirect, linked from the install CTA
    //            in the nav on every page. It resolves to an app store, not to a
    //            page of ours, so crawling it is pure budget waste. It stays
    //            SoftwareApplication.installUrl, which is a declaration rather
    //            than a crawl target.
    rules: { userAgent: "*", allow: "/", disallow: ["/api/", "/go"] },
    sitemap: [`${SITE_URL}/sitemap.xml`, ...listingSitemaps],
    host: SITE_URL,
  };
}
