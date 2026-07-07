"use client";
// All-categories list screen — breadcrumb, live-filter search, tile grid, SEO.
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Nav } from "./sections";
import { CtaBanner, Footer } from "./sections-home";
import { Chrome } from "./Chrome";
import { Icon, Breadcrumb, InputClear } from "./ui";
import { PageHead, SeoNote } from "./headers";
import { CategoryCard, CategoryCardSkeleton, EmptyState } from "./cards";
import { useCategories } from "@/app/lib/categories";
import { listingLandingHref, listingSearchHref } from "@/app/lib/search";
import { useOnlineStatus, useReloadOnReconnect } from "@/app/lib/use-online-status";
import { useI18n } from "./I18nProvider";

// The live backend always returns 12 top-level categories — the skeleton must
// reserve the same row count (4/3/2/2-up grids) or every cold load shifts layout.
const CATEGORY_SKELETON_COUNT = 12;

// Lithuanians commonly type without diacritics ("irankiai", "sventes") — fold
// both sides of the match so the filter never zero-results a list the user can
// literally see below the input.
const fold = (s: string) => s.toLowerCase().normalize("NFD").replace(/\p{Diacritic}/gu, "");

export function CategoriesScreen() {
  const { locale, dict } = useI18n();
  const t = dict.categoriesPage;
  const router = useRouter();
  const online = useOnlineStatus();
  const [q, setQ] = useState("");
  const { data, isLoading, isError, refetch } = useCategories(locale);

  useReloadOnReconnect({ online, isError, refetch });

  const focusSearch = () => document.getElementById("nk-cats-search-input")?.focus();
  // The field is a pure category filter — Enter must not navigate. Cross-search
  // to the items feed is an explicit affordance from the no-results empty state.
  const searchItems = () => { if (q.trim()) { router.push(listingSearchHref({ q, locale })); } };
  const term = fold(q.trim());
  const all = data ?? [];
  // Titles + authored intros: the intros carry the synonyms users actually type
  // ("dronus", "fotoaparatus"), so they count as matches too.
  const list = all.filter((c) => fold(c.title).includes(term) || fold(c.seoBody).includes(term));

  return (
    <Chrome>
      <div className="nk-page">
        <Nav onSearch={focusSearch} />
        {/* max-width caps the content column on ultrawide so 4-up tiles stay a
            scannable ~300px rather than stretching to letterboxes near 1920 */}
        <main id="nk-main" className="nk-container" style={{ paddingBlock: "var(--nk-page-top) 40px", maxWidth: 1520 }}>
          <Breadcrumb homeLabel={dict.common.breadcrumbHome} label={dict.common.breadcrumbLabel} items={[{ label: t.crumb }]} />
          <PageHead
            eyebrow={t.eyebrow}
            title={t.title}
            subtitle={t.body}
            subtitleMaxWidth={620}
            marginBottom="var(--nk-s-8)"
          />

          <form onSubmit={(e) => e.preventDefault()} role="search" style={{ display: "flex", flexDirection: "column", gap: "var(--nk-gap-sm)", marginBottom: "var(--nk-s-8)" }}>
            <span className="nk-searchfield" style={{ width: "100%", maxWidth: 560 }}>
              <Icon name="Search" size={19} color="var(--nk-text-muted)" stroke={2} />
              <input id="nk-cats-search-input" type="search" value={q} onChange={(e) => setQ(e.target.value)} placeholder={t.searchPlaceholder}
                aria-label={t.searchLabel}
                style={{ flex: 1, minWidth: 0, border: "none", outline: "none", background: "transparent", fontFamily: "var(--nk-font-body)", fontSize: 16, color: "var(--nk-text)" }} />
              {/* named like the feed's identical clear-× ("Clear", not "Close") */}
              {q && <InputClear onClick={() => setQ("")} label={dict.feed.clear} />}
            </span>
            {/* Always-mounted live region (toggle its text, not its existence) so the
                count change is reliably announced on every keystroke; it also carries
                the loading announcement (a region born WITH content never fires). */}
            <span aria-live="polite" role="status" className="nk-tnum" style={{ fontFamily: "var(--nk-font-body)", fontSize: 14.5, color: "var(--nk-text-muted)" }}>
              {isLoading ? dict.common.loading : !isError && all.length > 0 ? t.foundCount(list.length) : ""}
            </span>
          </form>

          {/* sr-only section heading so the outline is h1 → h2 → h3(tiles) instead
              of skipping a level straight to the tile <h3>s */}
          <h2 className="nk-sr-only">{t.crumb}</h2>
          {isLoading ? (
            <div className="nk-grid-cats" aria-hidden="true">
              {Array.from({ length: CATEGORY_SKELETON_COUNT }).map((_, i) => <CategoryCardSkeleton key={i} />)}
            </div>
          ) : !online && (isError || all.length === 0) ? (
            <EmptyState illustration="offline" title={dict.offline.title} subtitle={dict.offline.body}
              actionLabel={dict.offline.retry} onAction={() => refetch()} />
          ) : isError ? (
            <EmptyState illustration="error" tone="danger" title={dict.categories.errorTitle} subtitle={dict.categories.errorSubtitle}
              actionLabel={dict.categories.errorAction} actionPrimary actionIcon="RefreshCcw" onAction={() => refetch()} />
          ) : all.length === 0 ? (
            // Legitimately-empty wire response with no query typed: a data-
            // availability state (with retry), NOT the search-empty state — that
            // one would interpolate empty quotes and offer a no-op search CTA.
            <EmptyState illustration="error" title={dict.categories.errorTitle} subtitle={dict.categories.errorSubtitle}
              actionLabel={dict.categories.errorAction} actionPrimary actionIcon="RefreshCcw" onAction={() => refetch()} />
          ) : list.length ? (
            <div className="nk-grid-cats nk-reveal-grid">
              {list.map((c) => (
                <CategoryCard key={c.id} id={c.id} icon={c.icon} title={c.title} description={c.seoBody} href={listingLandingHref({ category: c.id, locale })} />
              ))}
            </div>
          ) : (
            <EmptyState illustration="search" title={t.emptyTitle} subtitle={t.emptySubtitle(q.trim())}
              actionLabel={t.searchItems(q.trim())} actionPrimary actionIcon="Search" onAction={searchItems}
              secondaryLabel={t.emptyAction} onSecondaryAction={() => setQ("")} />
          )}

          <SeoNote heading={t.seoHeading} body={t.seoBody} />
        </main>
        {/* The categories hub is a core discovery surface on an install-bridge
            site — close it with the shared conversion banner, not bare SEO copy. */}
        <CtaBanner locale={locale} />
        <Footer locale={locale} />
      </div>
    </Chrome>
  );
}
