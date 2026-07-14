import type { Metadata } from "next";
import { Suspense } from "react";
import { getDictionary } from "@/app/lib/i18n/dictionaries";
import { pageMetadata, requireLocale, breadcrumbJsonLd } from "@/app/lib/seo";
import { InviteScreen } from "@/app/components/InviteScreen";
import { JsonLd } from "@/app/components/JsonLd";
import { QueryProvider } from "@/app/providers";

// Referral bridge — static shell, revalidate daily. The ?code is read client-side.
export const revalidate = 86400;

export async function generateMetadata({ params }: PageProps<"/[lang]/invite">): Promise<Metadata> {
  const { lang } = await params;
  const locale = requireLocale(lang);
  const { invite: t, meta } = getDictionary(locale);
  // noindex,follow: a personalized referral bridge is a utility page, not content
  // — keep the bare /invite and its ?code variants out of the index (the canonical
  // already collapses ?code to /invite) while still passing link equity onward.
  return {
    ...pageMetadata({
      locale, path: "/invite", title: t.meta.title, description: t.meta.description,
      ogLocale: meta.ogLocale, ogImageAlt: meta.ogImageAlt,
    }),
    robots: { index: false, follow: true },
  };
}

export default async function Page({ params }: PageProps<"/[lang]/invite">) {
  const { lang } = await params;
  const locale = requireLocale(lang);
  const { common, invite: t } = getDictionary(locale);

  const breadcrumb = breadcrumbJsonLd(locale, [
    { name: common.breadcrumbHome, path: "" },
    { name: t.eyebrow, path: "/invite" },
  ]);

  return (
    <>
      <JsonLd data={breadcrumb} />
      {/* InviteScreen reads ?code via useSearchParams, which requires a Suspense
          boundary on a prerendered route (Next.js 16). */}
      <QueryProvider>
        <Suspense>
          <InviteScreen />
        </Suspense>
      </QueryProvider>
    </>
  );
}
