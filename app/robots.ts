import type { MetadataRoute } from "next";
import { SITE_URL } from "@/app/lib/seo";

export default function robots(): MetadataRoute.Robots {
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
    // One sitemap for the whole site (pages, landings and listings live in the same
    // flat /sitemap.xml — no index, no separate listing sitemap), so robots.txt
    // advertises the single URL and carries no backend dependency.
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
