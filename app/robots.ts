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
    rules: { userAgent: "*", allow: "/" },
    sitemap: [`${SITE_URL}/sitemap.xml`, ...listingSitemaps],
    host: SITE_URL,
  };
}
