"use client";
// Route-level loading UI for the catalogue surfaces (feed, landings, listing detail,
// categories hub).
//
// A client component on purpose: loading.tsx receives no route params, but it renders
// inside the layout's I18nProvider, so useI18nOptional() resolves the real locale
// during SSR. That is what lets the copy come from the dictionary like everywhere
// else, instead of shipping both languages and picking one with a :lang() CSS switch.
//
// It reuses the same head and card skeletons the real screens use, so the transition
// loading → page keeps the H1, the grid and the card heights exactly where they were.
// Each variant must mirror ITS screen's <main> geometry (padding, max-width) — they
// differ, and a mismatch shows up as a layout shift the moment the data lands.
//
// It also renders the real Nav and Footer. The screens own their own chrome (it is not
// in the layout), so a bare <main> here would unmount the 77px-tall header for the whole
// loading window and drop every page's content back down when it lands — a guaranteed
// layout shift on exactly the navigation this component exists to smooth over.
import { Nav } from "./sections";
import { CtaBanner, Footer } from "./sections-home";
import { Chrome } from "./Chrome";
import { useI18nOptional } from "./I18nProvider";
import { PageHead } from "./headers";
import { Breadcrumb } from "./ui";
import { CATEGORY_SKELETON_COUNT, CategoryCardSkeleton, OfferCardSkeleton } from "./cards";
import { ListingSkeleton, feedCrumbItems } from "./ListingDetail";
import type { Locale } from "@/app/lib/i18n/config";
import type { Dict } from "@/app/lib/i18n/types";

// Roughly a first viewport of the feed grid — enough to fill the fold at any column
// count without paying to render a full page of cards nobody will see.
const FEED_SKELETON_CARDS = 8;

type Variant = "feed" | "detail" | "categories";

// Each screen's <main> box, copied from the screen itself. These are NOT
// interchangeable and the differences are not cosmetic:
//
//   feed        FeedScreen.tsx        paddingBlock 40px, full container width
//   detail      ListingScreen.tsx     paddingBlock 120px, body inside .nk-detail
//   categories  CategoriesScreen.tsx  paddingBlock 40px, capped at 1520 on ultrawide
//
// Getting one wrong is the exact failure this component exists to prevent: .nk-container
// runs to 1920px, so a detail skeleton rendered without .nk-detail (max-width 1340,
// centred) is up to ~580px wider than the page that replaces it — a horizontal jump on
// every wide-screen listing open.
const MAIN_STYLE: Record<Variant, React.CSSProperties> = {
  feed: { paddingBlock: "var(--nk-page-top) 40px" },
  detail: { paddingBlock: "var(--nk-page-top) 120px" },
  categories: { paddingBlock: "var(--nk-page-top) 40px", maxWidth: 1520 },
};

export function CatalogueLoading({ variant = "feed" }: { variant?: Variant }) {
  const { locale, dict } = useI18nOptional();

  return (
    <Chrome>
      <div className="nk-page">
        <Nav />
        <main id="nk-main" className="nk-container" aria-busy="true" style={MAIN_STYLE[variant]}>
          <span className="nk-sr-only" role="status">{dict.common.loading}</span>
          {variant === "detail" && <DetailBody dict={dict} locale={locale} />}
          {variant === "categories" && <CategoriesBody dict={dict} />}
          {variant === "feed" && <FeedBody dict={dict} locale={locale} />}
        </main>
        {/* CategoriesScreen closes on the CTA band; the feed and the detail page do not.
            It is below the fold behind a full grid of skeletons, so it costs no visible
            shift — but leaving it out would still jump the page's scroll height. */}
        {variant === "categories" && <CtaBanner locale={locale} />}
        <Footer locale={locale} />
      </div>
    </Chrome>
  );
}

// Everything above the grid is known before the fetch — the crumb, the eyebrow, the H1,
// the subtitle — so render it for real rather than shimmering it. The crumb bar is the
// one that matters most: it is ~56px tall, and omitting it drops the whole page.
//
// feedCrumbItems() is byte-identical to what FeedScreen renders on the bare /skelbimai.
// The landing routes (/nuoma, /miestai) share this loading UI and grow the trail to two
// or three crumbs, which changes the labels but not the bar's height — and height is the
// whole point of reserving it.
function FeedBody({ dict, locale }: { dict: Dict; locale: Locale }) {
  const t = dict.feed;
  return (
    <>
      <Breadcrumb homeLabel={dict.common.breadcrumbHome} label={dict.common.breadcrumbLabel}
        items={feedCrumbItems({ feedLabel: t.titleAll, locale })} />
      <PageHead eyebrow={t.eyebrow} title={t.titleAll} subtitle={t.subtitleAll} maxWidth="80ch" />
      <span className="nk-skel" style={{ display: "block", height: 58, borderRadius: 14, marginBottom: "var(--nk-gap-lg)" }} />
      <div className="nk-grid-feed" aria-hidden="true">
        {Array.from({ length: FEED_SKELETON_CARDS }, (_, index) => <OfferCardSkeleton key={index} />)}
      </div>
    </>
  );
}

// Mirrors ListingScreen's own isLoading branch exactly — the same .nk-detail column, the
// same feed-root crumb (the category leaf and the title are not known until the listing
// is), the same skeleton.
function DetailBody({ dict, locale }: { dict: Dict; locale: Locale }) {
  return (
    <div className="nk-detail">
      <Breadcrumb homeLabel={dict.common.breadcrumbHome} label={dict.common.breadcrumbLabel}
        items={feedCrumbItems({ feedLabel: dict.feed.titleAll, locale })} />
      <ListingSkeleton />
    </div>
  );
}

function CategoriesBody({ dict }: { dict: Dict }) {
  const t = dict.categoriesPage;
  return (
    <>
      <Breadcrumb homeLabel={dict.common.breadcrumbHome} label={dict.common.breadcrumbLabel} items={[{ label: t.crumb }]} />
      <PageHead eyebrow={t.eyebrow} title={t.title} subtitle={t.body} subtitleMaxWidth={620} marginBottom="var(--nk-s-10)" />

      {/* Stands in for the filter <form>: same column layout, same control height and
          pill radius, same muted count line — so the real field drops straight in. The
          count line is a plain span, not a live region: the <main> above already owns
          the role="status" announcement and two would double-speak it. */}
      <div style={{ display: "flex", flexDirection: "column", gap: "var(--nk-gap-sm)", marginBottom: "var(--nk-s-10)" }}>
        <span className="nk-skel" aria-hidden="true"
          style={{ display: "block", width: "100%", maxWidth: 560, height: "var(--nk-control-h)", borderRadius: "var(--nk-r-pill)" }} />
        <span aria-hidden="true"
          style={{ fontFamily: "var(--nk-font-body)", fontSize: 14.5, color: "var(--nk-text-muted)" }}>
          {dict.common.loading}
        </span>
      </div>

      <h2 className="nk-sr-only">{t.crumb}</h2>
      <div className="nk-grid-cats" aria-hidden="true">
        {Array.from({ length: CATEGORY_SKELETON_COUNT }, (_, index) => <CategoryCardSkeleton key={index} />)}
      </div>
    </>
  );
}
