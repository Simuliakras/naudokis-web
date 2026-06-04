"use client";
// City landing screen — listings scoped to one city (/miestai/[city]).
// Mirrors the feed layout but with the city fixed: breadcrumb, heading, a grid
// of OfferCards, links to other cities, and an SEO block. Browse-only on web;
// transactional actions stay locked to the app via the cards/Chrome.
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Nav, Footer } from "./sections";
import { Chrome } from "./Chrome";
import { Breadcrumb } from "./ui";
import { OfferCard, OfferCardSkeleton, EmptyState } from "./cards";
import { useListings } from "@/app/lib/listings";
import { LT_CITIES, citySlug, type City } from "@/app/lib/cities";
import { useI18n } from "./I18nProvider";

export function CityScreen({ city }: { city: City }) {
  const { locale, dict } = useI18n();
  const t = dict.cityPage;
  const router = useRouter();
  const { data, isLoading, isError, refetch } = useListings(locale, { city });
  const list = data ?? [];

  const card = (o: (typeof list)[number]) => (
    <OfferCard key={o.id} title={o.title} city={o.city} price={o.price} unit={dict.common.perDay}
      rating={o.rating} count={o.ratingCount > 0 ? dict.common.reviewCount(o.ratingCount) : undefined}
      img={o.img} href={`/skelbimai/${o.id}`} />
  );

  return (
    <Chrome>
      <div className="nk-page">
        <Nav onSearch={() => router.push("/skelbimai")} />
        <main className="nk-container" style={{ paddingBlock: "28px 40px" }}>
          <Breadcrumb homeLabel={dict.common.breadcrumbHome} label={dict.common.breadcrumbLabel}
            items={[{ label: t.crumb, href: "/skelbimai" }, { label: city }]} />
          <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 32 }}>
            <span className="nk-eyebrow">{t.eyebrow(city)}</span>
            <h1 style={{ margin: 0, fontFamily: "var(--nk-font-display)", fontWeight: 700, fontSize: "clamp(34px, 5vw, 52px)", lineHeight: 1.05, letterSpacing: "-0.01em", color: "var(--nk-text)" }}>{t.title(city)}</h1>
            <p className="nk-body" style={{ margin: 0, maxWidth: 620 }}>{t.body(city)}</p>
            <span style={{ fontFamily: "var(--nk-font-body)", fontSize: 15.5, color: "var(--nk-text-2)", fontWeight: 600 }}>{t.resultCount(list.length)}</span>
          </div>

          {isLoading ? (
            <div className="nk-grid-feed">
              {Array.from({ length: 6 }).map((_, i) => <OfferCardSkeleton key={i} />)}
            </div>
          ) : isError ? (
            <EmptyState icon="SearchX" title={dict.offers.errorTitle} subtitle={dict.offers.errorSubtitle} actionLabel={dict.offers.errorAction} onAction={() => refetch()} />
          ) : list.length ? (
            <div className="nk-grid-feed">{list.map(card)}</div>
          ) : (
            <EmptyState icon="MapPin" title={t.emptyTitle(city)} subtitle={t.emptyBody(city)} actionLabel={t.browseAll} onAction={() => router.push("/skelbimai")} />
          )}

          <div style={{ marginTop: 64, display: "flex", flexDirection: "column", gap: 18 }}>
            <h2 style={{ margin: 0, fontFamily: "var(--nk-font-display)", fontWeight: 700, fontSize: 22, color: "var(--nk-text)" }}>{t.otherCitiesHeading}</h2>
            <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
              {LT_CITIES.filter((c) => c !== city).map((c) => (
                <Link key={c} href={`/miestai/${citySlug(c)}`} className="nk-tagchip"
                  style={{ display: "inline-flex", alignItems: "center", gap: 8, borderRadius: 999, padding: "10px 18px", fontFamily: "var(--nk-font-display)", fontWeight: 600, fontSize: 16, color: "var(--nk-text)", background: "var(--nk-surface)", border: "1px solid var(--nk-border)" }}>
                  {c}
                </Link>
              ))}
            </div>
          </div>

          <section style={{ paddingBlock: "80px 0" }}>
            <div style={{ maxWidth: 900, display: "flex", flexDirection: "column", gap: 16 }}>
              <h2 style={{ margin: 0, fontFamily: "var(--nk-font-display)", fontWeight: 700, fontSize: 24, lineHeight: "30px", color: "var(--nk-text-2)" }}>{t.seoHeading(city)}</h2>
              <p style={{ margin: 0, fontFamily: "var(--nk-font-body)", fontSize: 16, lineHeight: "26px", color: "var(--nk-text-muted)" }}>{t.seoBody(city)}</p>
            </div>
          </section>
        </main>
        <Footer />
      </div>
    </Chrome>
  );
}
