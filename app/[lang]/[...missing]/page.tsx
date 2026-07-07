import type { Metadata } from "next";
import { getDictionary } from "@/app/lib/i18n/dictionaries";
import { defaultLocale, isLocale } from "@/app/lib/i18n/config";
import NotFound from "../not-found";

type MissingPageProps = {
  params: Promise<{ lang: string; missing: string[] }>;
};

export async function generateMetadata({ params }: MissingPageProps): Promise<Metadata> {
  const { lang } = await params;
  const locale = isLocale(lang) ? lang : defaultLocale;
  const { errors } = getDictionary(locale);

  return {
    title: errors.notFoundTitle,
    description: errors.notFoundBody,
    robots: {
      index: false,
      follow: false,
    },
  };
}

export default function MissingPage() {
  // Soft-404 by design (200 + robots:noindex from generateMetadata). We CANNOT call
  // notFound() here: default-locale paths reach this catch-all via a proxy.ts rewrite
  // to the /lt segment, and notFound() on a middleware-rewritten path loops under
  // experimental `globalNotFound` (rewrite → 404 → redirect → rewrite). So we render
  // the same localized not-found UI as app/[lang]/not-found.tsx — shared, not duplicated.
  return <NotFound />;
}
