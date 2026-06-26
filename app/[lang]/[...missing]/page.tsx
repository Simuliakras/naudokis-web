import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getDictionary } from "@/app/lib/i18n/dictionaries";
import { requireLocale } from "@/app/lib/seo";

type MissingPageProps = {
  params: Promise<{ lang: string; missing: string[] }>;
};

export async function generateMetadata({ params }: MissingPageProps): Promise<Metadata> {
  const { lang } = await params;
  const locale = requireLocale(lang);
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

export default async function MissingPage({ params }: MissingPageProps) {
  const { lang } = await params;
  requireLocale(lang);
  notFound();
}
