import type { Metadata } from "next";
import { Suspense } from "react";
import { getDictionary } from "@/app/lib/i18n/dictionaries";
import { pageMetadata, requireLocale } from "@/app/lib/seo";
import { CancelDeletionScreen } from "@/app/components/CancelDeletionScreen";

// Account-deletion cancel bridge — static shell, revalidate daily. The signed
// ?token is read client-side; the page is the af_web_dp fallback for the deletion
// email's OneLink (and its own app-not-installed page).
export const revalidate = 86400;

export async function generateMetadata({ params }: PageProps<"/[lang]/cancel-deletion">): Promise<Metadata> {
  const { lang } = await params;
  const locale = requireLocale(lang);
  const { cancelDeletion: t, meta } = getDictionary(locale);
  // noindex,nofollow: a tokenized, one-time action URL must never be indexed or
  // crawled — the token is single-use and the page carries no shareable content.
  return {
    ...pageMetadata({
      locale, path: "/cancel-deletion", title: t.meta.title, description: t.meta.description,
      ogLocale: meta.ogLocale, ogImageAlt: meta.ogImageAlt,
    }),
    robots: { index: false, follow: false },
  };
}

export default async function Page({ params }: PageProps<"/[lang]/cancel-deletion">) {
  const { lang } = await params;
  requireLocale(lang);

  return (
    // CancelDeletionScreen reads ?token via useSearchParams, which requires a
    // Suspense boundary on a prerendered route (Next.js 16).
    <Suspense>
      <CancelDeletionScreen />
    </Suspense>
  );
}
