import type { Metadata } from "next";
import { getDictionary } from "@/app/lib/i18n/dictionaries";
import { pageMetadata, requireLocale, breadcrumbJsonLd } from "@/app/lib/seo";
import { HowItWorksScreen } from "@/app/components/HowItWorksScreen";
import { JsonLd } from "@/app/components/JsonLd";

// Static marketing page — generate per locale, revalidate daily.
export const revalidate = 86400;

export async function generateMetadata({ params }: PageProps<"/[lang]/kaip-tai-veikia">): Promise<Metadata> {
  const { lang } = await params;
  const locale = requireLocale(lang);
  const { howItWorks: t, meta } = getDictionary(locale);
  return pageMetadata({
    locale, path: "/kaip-tai-veikia", title: t.meta.title, description: t.meta.description,
    ogLocale: meta.ogLocale, ogImageAlt: meta.ogImageAlt,
  });
}

export default async function Page({ params }: PageProps<"/[lang]/kaip-tai-veikia">) {
  const { lang } = await params;
  const locale = requireLocale(lang);
  const { common, howItWorks: t } = getDictionary(locale);

  const breadcrumb = breadcrumbJsonLd(locale, [
    { name: common.breadcrumbHome, path: "" },
    { name: t.eyebrow, path: "/kaip-tai-veikia" },
  ]);

  return (
    <>
      <JsonLd data={breadcrumb} />
      <HowItWorksScreen />
    </>
  );
}
