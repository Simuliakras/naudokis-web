import { fetchListingSitemapCount } from "@/app/lib/listing-sitemap";
import { SITE_URL } from "@/app/lib/seo";

// The sitemap INDEX (<sitemapindex>) — the single canonical entry point, and the
// only sitemap advertised in robots.txt. A crawler reads this one URL and discovers
// every child from it.
//
// Why a route handler and not the metadata sitemap convention: Next's `sitemap.ts`
// convention only ever emits a <urlset>, never a <sitemapindex> (see the local docs
// under node_modules/next/dist/docs). The index carries plain <loc>s with no hreflang,
// so hand-writing it costs nothing; the children that DO need hreflang stay on the
// convention (app/pages/sitemap.ts) so Next serialises their alternates.
//
// Children:
//   /pages/sitemap.xml           static pages + category/city landings
//   /listings/sitemap/{id}.xml   listing inventory, sharded (count is dynamic)
//
// Revalidated hourly so a growing catalogue's new listing shards appear. The shard
// count is fail-safe: fetchListingSitemapCount() returns 0 (not throw) on a backend
// blip, so a bad cycle advertises the pages child alone rather than a broken index.
export const revalidate = 3600;

export async function GET(): Promise<Response> {
  const shardCount = await fetchListingSitemapCount();
  const children = [
    `${SITE_URL}/pages/sitemap.xml`,
    ...Array.from({ length: shardCount }, (_, id) => `${SITE_URL}/listings/sitemap/${id}.xml`),
  ];
  const body = `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${children.map((loc) => `<sitemap><loc>${loc}</loc></sitemap>`).join("\n")}
</sitemapindex>
`;
  return new Response(body, {
    headers: { "Content-Type": "application/xml" },
  });
}
