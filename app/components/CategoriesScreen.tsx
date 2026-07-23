"use client";
// All-categories directory screen — breadcrumb, live-filter search, popular
// pills, per-category cards with inline subcategory lists, SEO note.
import { useId, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
// Route-scoped stylesheet — see the header of categories-directory.css.
import "./categories-directory.css";
import Link from "next/link";
import { Nav } from "./sections";
import { CtaBanner, Footer } from "./sections-home";
import { Chrome } from "./Chrome";
import { Icon, Breadcrumb, InputClear } from "./ui";
import { ChipLinkRow, PageHead, SeoNote } from "./headers";
import { CATEGORY_SKELETON_COUNT, EmptyState } from "./cards";
import { useAllCategories, type Category } from "@/app/lib/categories";
import {
  POPULAR_SUB_IDS,
  filterDirectory,
  groupDirectory,
  resolvePopularSubs,
} from "@/app/lib/categories-directory";
import { listingLandingHref, listingSearchHref } from "@/app/lib/search";
import { useOnlineStatus, useReloadOnReconnect } from "@/app/lib/use-online-status";
import { useI18n } from "./I18nProvider";

export function CategoriesScreen() {
  const { locale, dict } = useI18n();
  const t = dict.categoriesPage;
  const router = useRouter();
  const online = useOnlineStatus();
  const [q, setQ] = useState("");
  const { data, isLoading, isError, refetch } = useAllCategories(locale);

  useReloadOnReconnect({ online, isError, refetch });

  const focusSearch = () => document.getElementById("nk-cats-search-input")?.focus();
  // The field is a pure directory filter — Enter must not navigate. Cross-search
  // to the items feed is an explicit affordance from the no-results empty state.
  const searchItems = () => { if (q.trim()) { router.push(listingSearchHref({ q, locale })); } };

  const all = useMemo(() => data ?? [], [data]);
  const groups = useMemo(() => groupDirectory(all), [all]);
  // Matches parent titles, curated synonyms and sub names (folded); a parent hit
  // shows the whole card, a sub-only hit narrows the list to the matches.
  const { groups: shown, shownSubCount } = useMemo(
    () => filterDirectory({ groups, query: q, synonymsFor: t.synonyms }),
    [groups, q, t],
  );
  const popular = useMemo(() => resolvePopularSubs({ all, ids: POPULAR_SUB_IDS }), [all]);
  const searching = q.trim().length > 0;

  return (
    <Chrome>
      <div className="nk-page">
        <Nav onSearch={focusSearch} />
        {/* max-width caps the content column on ultrawide so 4-up cards stay a
            scannable ~310px rather than stretching to letterboxes near 1920 */}
        <main id="nk-main" className="nk-container" style={{ paddingBlock: "var(--nk-page-top) 40px", maxWidth: 1520 }}>
          <Breadcrumb homeLabel={dict.common.breadcrumbHome} label={dict.common.breadcrumbLabel} items={[{ label: t.crumb }]} />
          <PageHead
            eyebrow={t.eyebrow}
            title={t.title}
            subtitle={t.body}
            subtitleMaxWidth="100ch"
            marginBottom="var(--nk-s-10)"
            // Matches the feed's head and SeoNote's body below, so the opening
            // and closing prose on this page share one column.
            maxWidth="100ch"
          />

          {/* Quick-access rail into the highest-traffic subcategory landings. It
              sits above the field, so it stays mounted while a term is active —
              unmounting it here would yank the search input upward mid-typing.
              100ch keeps the pills wrapping within the same reading column as
              the PageHead above and the SeoNote below. */}
          {popular.length > 0 && (
            <div style={{ display: "flex", flexDirection: "column", gap: "var(--nk-gap-sm)", marginBottom: "var(--nk-s-8)", maxWidth: "100ch" }}>
              <span className="nk-eyebrow" style={{ fontSize: 13 }}>{t.popularHeading}</span>
              <ChipLinkRow
                variant="pill"
                links={popular.map(({ sub, parent }) => ({
                  label: sub.title,
                  icon: parent.icon,
                  href: listingLandingHref({ category: parent.id, subcategory: sub.id, locale }),
                }))}
              />
            </div>
          )}

          <form onSubmit={(e) => e.preventDefault()} role="search" style={{ display: "flex", flexDirection: "column", gap: "var(--nk-gap-sm)", marginBottom: "var(--nk-s-20)" }}>
            {/* 100ch — the same reading column the PageHead, the popular rail and
                the closing SeoNote sit in, so the page has one left-to-right edge. */}
            <span className="nk-searchfield" style={{ width: "100%", maxWidth: "100ch" }}>
              <Icon name="Search" size={19} color="var(--nk-text-muted)" stroke={2} />
              <input id="nk-cats-search-input" type="search" value={q} onChange={(e) => setQ(e.target.value)} placeholder={t.searchPlaceholder}
                aria-label={t.searchLabel}
                style={{ flex: 1, minWidth: 0, border: "none", outline: "none", background: "transparent", fontFamily: "var(--nk-font-body)", fontSize: 16, color: "var(--nk-text)" }} />
              {/* named like the feed's identical clear-× ("Clear", not "Close") */}
              {q && <InputClear onClick={() => setQ("")} label={dict.feed.clear} />}
            </span>
            {/* Announced only — the visible count was dropped, but a filter-as-you-
                type screen still has to tell a screen-reader user how many results
                a keystroke produced, so this mirrors the feed's sr-only status.
                Always-mounted live region (toggle its text, not its existence) so
                it fires on every keystroke; it also carries the loading
                announcement (a region born WITH content never fires). */}
            <span aria-live="polite" role="status" className="nk-sr-only">
              {isLoading ? dict.common.loading : !isError && all.length > 0 ? t.countLabel(shown.length, shownSubCount) : ""}
            </span>
          </form>

          {/* sr-only section heading so the outline is h1 → h2 → h3(cards) instead
              of skipping a level straight to the card <h3>s */}
          <h2 className="nk-sr-only">{t.gridHeading}</h2>
          {isLoading ? (
            <div className="nk-dirgrid" aria-hidden="true">
              {Array.from({ length: CATEGORY_SKELETON_COUNT }).map((_, i) => (
                <div key={i} className="nk-dircard-skel-wrap"><div className="nk-skel nk-dircard-skel" /></div>
              ))}
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
          ) : shown.length ? (
            <div className="nk-dirgrid nk-reveal-grid">
              {shown.map((g) => (
                <DirectoryCard key={g.parent.id} parent={g.parent} subs={g.subs} visibleSubIds={g.visibleSubIds} searching={searching} />
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

/* One parent category card: header (accent chip, title link, sub count, arrow
   to the full feed) + the inline subcategory list. EVERY sub renders in the DOM
   (crawlable, handoff §10); the collapsed state hides rows with CSS only — top 4
   on desktop, header-only ≤640px — and an active search term hides non-matching
   rows via [hidden] instead (the term also drops the collapse entirely). */
function DirectoryCard({
  parent, subs, visibleSubIds, searching,
}: {
  parent: Category;
  subs: Category[]; // full taxonomy-order list — never pre-sliced
  visibleSubIds: ReadonlySet<string> | null; // null = all visible
  searching: boolean; // term active: force-expanded, expander unmounted
}) {
  const { locale, dict } = useI18n();
  const t = dict.categoriesPage;
  const [expanded, setExpanded] = useState(false);
  const listId = useId();
  const landing = listingLandingHref({ category: parent.id, locale });
  const collapsed = !searching && !expanded;
  // Three mutually exclusive list states (collapsed is false whenever searching,
  // so the two markers can never co-occur). `is-filtering` exists purely for the
  // entry animation: it lets @starting-style treat a row revealed by the search
  // the same as any other, without arming the top-4 rows at first paint.
  const listState = collapsed ? " is-collapsed" : searching ? " is-filtering" : "";

  return (
    <section className="nk-dircard" data-cat={parent.id} aria-label={parent.title}>
      <div className="nk-catv2__bg" />
      <div className="nk-dircard__head">
        {/* bare Icon: the chip's CSS sizes the svg (24px, 20px in compact tiles) */}
        <span className="nk-catv2__chip"><Icon name={parent.icon} /></span>
        <div className="nk-dircard__titleblock">
          <h3 className="nk-dircard__title"><Link href={landing}>{parent.title}</Link></h3>
          {subs.length > 0 && <span className="nk-dircard__count nk-tnum">{t.subCount(subs.length)}</span>}
        </div>
        <Link href={landing} className="nk-dircard__go" aria-label={t.allListingsLabel(parent.title)}>
          <Icon name="ArrowRight" size={15} stroke={2} />
        </Link>
      </div>
      {subs.length > 0 && (
        <ul id={listId} className={`nk-dircard__subs${listState}`}>
          {subs.map((sub) => (
            <li key={sub.id} hidden={visibleSubIds ? !visibleSubIds.has(sub.id) : false}>
              <Link className="nk-dircard__sub" href={listingLandingHref({ category: parent.id, subcategory: sub.id, locale })}>
                <span className="nk-dircard__subname">{sub.title}</span>
                {/* stays tertiary on row hover (only the label brightens) */}
                <Icon name="ChevronRight" size={14} stroke={2} color="var(--nk-text-tertiary)" />
              </Link>
            </li>
          ))}
        </ul>
      )}
      {/* the __more--sm variant exists only for the ≤640px header-only collapse;
          CSS swaps which "Dar N" span shows (N−4 above 640px, all N below) */}
      {!searching && subs.length > 0 && (
        <button type="button" aria-expanded={expanded} aria-controls={listId}
          className={subs.length > 4 ? "nk-dircard__more" : "nk-dircard__more nk-dircard__more--sm"}
          onClick={() => setExpanded((v) => !v)}>
          {expanded ? t.showLess : (
            <>
              {subs.length > 4 && <span className="nk-dircard__more-rest">{t.moreCount(subs.length - 4)}</span>}
              <span className="nk-dircard__more-all">{t.moreCount(subs.length)}</span>
            </>
          )}
          {/* one glyph, rotated by CSS off aria-expanded, so the turn animates */}
          <Icon name="ChevronDown" size={14} stroke={2.2} />
        </button>
      )}
    </section>
  );
}
