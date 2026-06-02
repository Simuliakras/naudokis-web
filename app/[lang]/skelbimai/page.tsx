import type { Metadata } from "next";
import { Suspense } from "react";
import { getDictionary } from "@/app/lib/i18n/dictionaries";
import { pageMetadata, requireLocale } from "@/app/lib/seo";
import { FeedScreen } from "@/app/components/FeedScreen";

export async function generateMetadata({ params }: PageProps<"/[lang]/skelbimai">): Promise<Metadata> {
  const { lang } = await params;
  const locale = requireLocale(lang);
  const { feed: t, meta } = getDictionary(locale);
  return pageMetadata({
    locale, path: "/skelbimai", title: t.metaTitle, description: t.metaDescription,
    ogLocale: meta.ogLocale, ogImageAlt: meta.ogImageAlt,
  });
}

export default async function Page({ params }: PageProps<"/[lang]/skelbimai">) {
  const { lang } = await params;
  requireLocale(lang);
  // FeedScreen reads ?q/?cat/?city/?sort/?delivery via useSearchParams, which
  // requires a Suspense boundary on a prerendered route (Next.js 16).
  return (
    <Suspense>
      <FeedScreen />
    </Suspense>
  );
}
