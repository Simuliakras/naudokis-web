import type { Metadata } from "next";
import Link from "next/link";
import { getDictionary } from "@/app/lib/i18n/dictionaries";
import { pageMetadata, requireLocale, breadcrumbJsonLd } from "@/app/lib/seo";
import { legalDocs, legalHref, localizedBlurb } from "@/app/lib/legal/manifest";
import { Chrome } from "@/app/components/Chrome";
import { Nav } from "@/app/components/sections";
import { Footer } from "@/app/components/sections-home";
import { Breadcrumb, Icon } from "@/app/components/ui";
import { JsonLd } from "@/app/components/JsonLd";

// Lightweight legal hub — the Terms' wayfinding table promises a "map of all
// legal documents", so a navigable index of the published set must exist.
// Generated straight from the manifest; documents change rarely.
export const revalidate = 3600;

export async function generateMetadata({ params }: PageProps<"/[lang]/teisine">): Promise<Metadata> {
  const { lang } = await params;
  const locale = requireLocale(lang);
  const { legal, meta } = getDictionary(locale);
  return pageMetadata({
    locale, path: "/teisine",
    title: `${legal.hubTitle} | Naudokis.lt`,
    description: legal.hubLead,
    ogLocale: meta.ogLocale, ogImageAlt: meta.ogImageAlt,
  });
}

export default async function Page({ params }: PageProps<"/[lang]/teisine">) {
  const { lang } = await params;
  const locale = requireLocale(lang);
  const { legal: t, common } = getDictionary(locale);
  const docTitle = (id: string) =>
    id === "privacy-policy" ? t.docPrivacyTitle : id === "terms-of-use" ? t.docTermsTitle : t.docDeleteTitle;
  const breadcrumb = breadcrumbJsonLd(locale, [
    { name: common.breadcrumbHome, path: "" },
    { name: t.hubTitle, path: "/teisine" },
  ]);
  return (
    <>
      <JsonLd data={breadcrumb} />
      <Chrome>
        <div className="nk-page">
          <Nav />
          <main id="nk-main" className="nk-container" style={{ paddingBlock: "var(--nk-page-top) var(--nk-section-y-lg)", maxWidth: 1100 }}>
            <Breadcrumb homeLabel={common.breadcrumbHome} label={common.breadcrumbLabel} items={[{ label: t.hubTitle }]} />
            <div style={{ display: "flex", flexDirection: "column", gap: "var(--nk-gap-sm)", marginBottom: "var(--nk-section-head)" }}>
              <span className="nk-eyebrow">{t.brandSub}</span>
              <h1 className="nk-h-page" style={{ margin: 0 }}>{t.hubTitle}</h1>
              <p className="nk-body" style={{ margin: 0, maxWidth: 620 }}>{t.hubLead}</p>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "var(--nk-gap-md)" }}>
              {legalDocs().map((doc) => {
                const href = legalHref(doc.id, locale);
                if (!href) {
                  return null;
                }
                return (
                  <Link key={doc.id} href={href}
                    style={{ display: "flex", alignItems: "center", gap: "var(--nk-gap-lg)", padding: "clamp(20px,2.6vw,28px)", borderRadius: "var(--nk-r-card)", background: "var(--nk-surface)", border: "1px solid var(--nk-border)", textDecoration: "none", boxShadow: "var(--nk-edge-top)" }}>
                    <span style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", gap: 6 }}>
                      <span style={{ fontFamily: "var(--nk-font-display)", fontWeight: 700, fontSize: 20, color: "var(--nk-text)" }}>{docTitle(doc.id)}</span>
                      <span style={{ fontFamily: "var(--nk-font-body)", fontSize: 15.5, lineHeight: "24px", color: "var(--nk-text-muted)" }}>{localizedBlurb(doc, locale)}</span>
                    </span>
                    <Icon name="ArrowRight" size={20} stroke={2.2} color="var(--nk-text-muted)" style={{ flex: "none" }} />
                  </Link>
                );
              })}
            </div>
          </main>
          <Footer locale={locale} />
        </div>
      </Chrome>
    </>
  );
}
