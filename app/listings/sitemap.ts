import type { MetadataRoute } from "next";
import {
  fetchListingSitemapCount,
  fetchListingSitemapEntries,
  localizedListingSitemapEntries,
} from "@/app/lib/listing-sitemap";

export const revalidate = 3600;

export async function generateSitemaps() {
  const count = await fetchListingSitemapCount();
  return Array.from({ length: count }, (_, id) => ({ id }));
}

export default async function sitemap({ id }: { id: Promise<string> }): Promise<MetadataRoute.Sitemap> {
  const chunk = Number(await id);
  const entries = await fetchListingSitemapEntries(Number.isFinite(chunk) ? chunk : 0);
  return localizedListingSitemapEntries(entries);
}
