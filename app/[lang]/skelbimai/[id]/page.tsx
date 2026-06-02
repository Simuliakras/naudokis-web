import type { Metadata } from "next";
import { getDictionary } from "@/app/lib/i18n/dictionaries";
import { pageMetadata, requireLocale } from "@/app/lib/seo";
import { ListingDetail } from "@/app/components/ListingDetail";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL ?? "https://api-dev.naudokis.lt";

// Minimal server-side fetch for per-listing metadata (title/description/image).
async function fetchListingMeta(id: string): Promise<{ title: string; description: string; image?: string } | null> {
  try {
    const res = await fetch(`${API_BASE}/listings/${id}`, { next: { revalidate: 300 } });
    if (!res.ok) return null;
    const body = await res.json();
    const l = body?.data;
    if (!l?.title) return null;
    return { title: l.title, description: (l.description ?? "").slice(0, 200), image: l.images?.[0]?.url };
  } catch {
    return null;
  }
}

export async function generateMetadata({ params }: PageProps<"/[lang]/skelbimai/[id]">): Promise<Metadata> {
  const { lang, id } = await params;
  const locale = requireLocale(lang);
  const { detail, meta } = getDictionary(locale);
  const data = await fetchListingMeta(id);
  const title = data ? `${data.title}${detail.metaTitleSuffix}` : detail.metaFallbackTitle;
  const description = data?.description || detail.metaFallbackDescription;
  return pageMetadata({
    locale, path: `/skelbimai/${id}`, title, description,
    ogLocale: meta.ogLocale, ogImageAlt: data?.title ?? meta.ogImageAlt, image: data?.image,
  });
}

export default async function Page({ params }: PageProps<"/[lang]/skelbimai/[id]">) {
  const { lang, id } = await params;
  requireLocale(lang);
  return <ListingDetail id={id} />;
}
