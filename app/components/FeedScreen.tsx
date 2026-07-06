"use client";
// Reusable listings feed — powers search (?q=) and category (?cat=) browsing.
// Search / filter / sort are functional on the web; only transactional actions
// (favorite/reserve/contact) are locked to the app.
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useFocusTrap } from "@/app/lib/use-focus-trap";
import { useDismissableLayer } from "@/app/lib/use-dismissable-layer";
import { Nav } from "./sections";
import { Footer } from "./sections-home";
import { Chrome } from "./Chrome";
import { Icon, Breadcrumb, FilterSelect, InputClear, Toggle, openRedirect, type SelectOption } from "./ui";
import { OfferCard, OfferCardSkeleton, InterruptionBanner, EmptyState } from "./cards";
import { useCategories, type Category } from "@/app/lib/categories";
import { useListingsInfinite, parseSortKey, photoFirst } from "@/app/lib/listings";
import { useDebouncedValue } from "@/app/lib/use-debounced-value";
import { useOnlineStatus, useReloadOnReconnect } from "@/app/lib/use-online-status";
import { trackEvent } from "@/app/lib/analytics";
import { categoryIconFor } from "@/app/lib/category-style";
import { listingLandingHref, rememberFeedUrl } from "@/app/lib/search";
import { listingBreadcrumbTrail } from "@/app/lib/breadcrumbs";
import { prefersReducedMotion } from "@/app/lib/motion";
import { LT_CITIES } from "@/app/lib/cities";
import { useI18n } from "./I18nProvider";
import { localePath, type Locale } from "@/app/lib/i18n/config";
import type { ListingFilters } from "@/app/lib/listings";

type FeedScreenProps = {
  initialFilters?: ListingFilters & { delivery?: boolean };
};

export function FeedScreen({ initialFilters }: FeedScreenProps = {}) {
  const { locale, dict } = useI18n();
  const t = dict.feed;
  const sp = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();
  const online = useOnlineStatus();

  const staticLanding = Boolean(initialFilters);
  const params = initialFilters
    ? {
        q: initialFilters.q ?? "",
        cat: initialFilters.category ?? "",
        city: initialFilters.city ?? "",
        sort: initialFilters.sort ?? "recommended",
        delivery: initialFilters.delivery ?? false,
      }
    : {
        q: sp.get("q") ?? "",
        cat: sp.get("cat") ?? "",
        city: sp.get("city") ?? "",
        sort: parseSortKey(sp.get("sort")),
        delivery: sp.get("delivery") === "1",
      };

  const filterBarRef = useRef<HTMLDivElement>(null);
  const [gridRef, columns] = useColumnCount();
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [showTop, setShowTop] = useState(false);

  function setParams(patch: Record<string, string | boolean>, replace = false) {
    const next = new URLSearchParams();
    if (params.q) next.set("q", params.q);
    if (params.cat) next.set("cat", params.cat);
    if (params.city) next.set("city", params.city);
    if (params.sort && params.sort !== "recommended") next.set("sort", params.sort);
    if (params.delivery) next.set("delivery", "1");
    for (const [k, v] of Object.entries(patch)) {
      const isDefault = v === "" || v === false || v === "recommended";
      if (isDefault) next.delete(k);
      else next.set(k, v === true ? "1" : String(v));
    }
    trackEvent("Listing Filter Change", {
      locale,
      patch: Object.keys(patch).join(","),
      hasQuery: Boolean("q" in patch ? String(patch.q ?? "").trim() : params.q),
      category: "cat" in patch ? String(patch.cat || "") : params.cat,
      city: "city" in patch ? String(patch.city || "") : params.city,
      delivery: "delivery" in patch ? Boolean(patch.delivery) : params.delivery,
      sort: "sort" in patch ? String(patch.sort || "recommended") : params.sort,
    });
    const qs = next.toString();
    const basePath = staticLanding ? localePath(locale, "/skelbimai") : pathname;
    const url = qs ? `${basePath}?${qs}` : basePath;
    if (replace) {
      // replace = debounced typing into the search input — don't scroll under
      // the user's cursor on every keystroke.
      if (staticLanding) router.replace(url, { scroll: false });
      else window.history.replaceState(null, "", url);
      return;
    }
    if (staticLanding) router.push(url);
    else window.history.pushState(null, "", url);
    // Explicit filter change: if the user has scrolled past the (sticky)
    // filter bar, bring the new result set into view — otherwise they're left
    // staring at stale cards below the fold. scroll-margin-top on
    // .nk-filterbar clears the nav.
    const bar = filterBarRef.current;
    if (bar && bar.getBoundingClientRect().top <= 100) {
      bar.scrollIntoView({ behavior: prefersReducedMotion() ? "auto" : "smooth", block: "start" });
    }
  }

  // Search input: local state, debounced into the URL (replace, no history spam).
  const [qInput, setQInput] = useState(params.q);
  // Re-sync the input when the URL's q changes externally (back/forward, related
  // tag click) — the React-endorsed "adjust state during render" pattern.
  const [urlQ, setUrlQ] = useState(params.q);
  if (params.q !== urlQ) {
    setUrlQ(params.q);
    setQInput(params.q);
  }
  const debounced = useDebouncedValue(qInput, 350);
  useEffect(() => {
    if (debounced !== params.q) setParams({ q: debounced }, true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debounced]);

  // Remember the feed URL (incl. filters) so detail → search returns here intact.
  useEffect(() => {
    rememberFeedUrl(window.location.pathname + window.location.search);
  }, [sp]);

  const cats = useCategories(locale).data ?? [];
  const {
    data, isLoading, isError, refetch,
    fetchNextPage, hasNextPage, isFetchingNextPage,
  } = useListingsInfinite(locale, {
    q: params.q, city: params.city, category: params.cat, sort: params.sort,
  });

  useReloadOnReconnect({ online, isError, refetch });

  // Photo safeguard: on the default "recommended" sort, order photo-bearing
  // listings first so a first-time visitor isn't met with a wall of category-icon
  // placeholders. Ranked per page (not across the accumulated list) so an
  // infinite-scroll append never reshuffles cards already on screen; other sorts
  // keep the backend's explicit ordering.
  const loaded = data?.pages.flatMap((p) =>
    params.sort === "recommended" ? photoFirst(p.offers) : p.offers) ?? [];
  // The "Su pristatymu" toggle is a client-side filter over the loaded pages
  // (the backend has no delivery param).
  const list = params.delivery ? loaded.filter((o) => o.hasDelivery) : loaded;
  // The IntersectionObserver anchor tracks the raw loaded set, not the filtered
  // view: when the delivery filter empties the current pages but more remain, we
  // keep pulling pages until a match surfaces or the cursor is exhausted, rather
  // than showing a false "no results" dead-end.
  const canLoadMore = loaded.length > 0 && !!hasNextPage;
  // Delivery filter has hidden everything loaded so far, but more pages exist —
  // show "scanning" skeletons instead of the empty state while the next page loads.
  const scanningMore = list.length === 0 && canLoadMore;

  // Result count: the backend total (pages[0].totalCount) is the honest number —
  // list.length only reflects the pages loaded so far (12/page infinite scroll).
  // The delivery toggle is a client-side filter over loaded pages, so the backend
  // total overstates it: show "N+" of what's matched while more pages can load,
  // and the exact loaded-filtered count once the cursor is exhausted.
  const totalCount = data?.pages?.[0]?.totalCount;
  const countLabel = params.delivery
    ? hasNextPage
      ? t.resultCountAtLeast(list.length)
      : t.resultCount(list.length)
    : t.resultCount(totalCount ?? list.length);

  // Auto-load the next page when the sentinel scrolls into view; the visible
  // "load more" button is the keyboard / reduced-motion fallback.
  const sentinelRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = sentinelRef.current;
    if (!el || !hasNextPage) {
      return;
    }
    const io = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting && !isFetchingNextPage) {
        fetchNextPage();
      }
    }, { rootMargin: "600px 0px" });
    io.observe(el);
    return () => io.disconnect();
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  // Floating "back to top" appears once the user has scrolled a couple of rows.
  useEffect(() => {
    const onScroll = () => setShowTop(window.scrollY > 900);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // A category landing renders the taxonomy's authored heading + intro
  // (seoTitle/seoBody); the short name stays the breadcrumb/chip label.
  const cat = cats.find((c) => c.id === params.cat);
  const catTitle = cat?.title;
  const categorySeoLabel = cat ? t.categorySeoLabel(cat.id, cat.title) : undefined;
  const isCat = !!params.cat;
  const isSearch = !!params.q && !isCat;
  const heading = params.city
    ? t.landingHeading({ category: categorySeoLabel, city: params.city })
    : isCat ? (cat?.seoTitle ?? catTitle ?? t.titleAll) : isSearch ? t.titleSearch : t.titleAll;
  const subtitle = params.city
    ? t.landingDescription({ category: categorySeoLabel, city: params.city })
    : isCat ? (cat?.seoBody ?? t.subtitleAll) : isSearch ? t.subtitleSearch(params.q) : t.subtitleAll;
  // A category / city / category+city landing gets a city/category-aware
  // supporting block; the plain feed + search keep the generic Lithuania-scoped
  // copy so the ~100 programmatic combos aren't near-duplicate thin content.
  const isLanding = !!params.city || isCat;
  const seoHeading = isLanding ? t.landingSeoHeading({ category: categorySeoLabel, city: params.city }) : t.seoHeading;
  const seoBody = isLanding ? t.landingSeoBody({ category: categorySeoLabel, city: params.city }) : t.seoBody;
  // Home › Skelbimai › [category] › [city], mirroring the BreadcrumbList JSON-LD
  // the feed + landing pages emit. A free-text search is the one non-landing state,
  // so it hangs its own leaf off the feed root instead of using the trail.
  const crumbs = isSearch
    ? [
        { label: t.titleAll, href: localePath(locale, "/skelbimai") },
        { label: t.titleSearch },
      ]
    : listingBreadcrumbTrail({
        homeLabel: dict.common.breadcrumbHome,
        feedLabel: t.titleAll,
        categoryTitle: params.cat ? (catTitle ?? params.cat) : undefined,
        category: params.cat || undefined,
        city: params.city || undefined,
      })
        .slice(1)
        .map((c) => ({ label: c.name, href: localePath(locale, c.path) }));

  const anyActive = !!params.q || isCat || !!params.city || params.delivery || params.sort !== "recommended";
  const reset = () => { setQInput(""); setParams({ q: "", cat: "", city: "", sort: "recommended", delivery: false }); };
  // Count of secondary (sheet) filters — badges the mobile "Filters" button.
  const activeFilterCount = [params.cat, params.city, params.delivery, params.sort !== "recommended"].filter(Boolean).length;

  const sortOptions: SelectOption[] = [
    { value: "recommended", label: t.sortRecommended },
    { value: "price_asc", label: t.sortPriceAsc },
    { value: "price_desc", label: t.sortPriceDesc },
    { value: "rating_desc", label: t.sortRatingBest },
  ];
  const catOptions: SelectOption[] = [{ value: "", label: t.allCategories }, ...cats.map((c) => ({ value: c.id, label: c.title }))];
  const cityOptions: SelectOption[] = [{ value: "", label: dict.cityPicker.all }, ...LT_CITIES.map((c) => ({ value: c, label: c }))];

  // Active-filter chips — each removes just its own dimension (the reset button
  // clears everything). Labels are derived from the existing option lists; the
  // clear handler runs in the chip's onClick (an event handler, not render).
  const sortLabel = sortOptions.find((o) => o.value === params.sort)?.label ?? params.sort;
  type ChipKey = "q" | "cat" | "city" | "delivery" | "sort";
  const activeChips: { key: ChipKey; label: string }[] = [];
  if (params.q) activeChips.push({ key: "q", label: `“${params.q}”` });
  if (isCat) activeChips.push({ key: "cat", label: catTitle ?? params.cat });
  if (params.city) activeChips.push({ key: "city", label: params.city });
  if (params.delivery) activeChips.push({ key: "delivery", label: t.deliveryToggle });
  if (params.sort !== "recommended") activeChips.push({ key: "sort", label: sortLabel });
  const clearChip = (key: ChipKey) => {
    if (key === "q") { setQInput(""); setParams({ q: "" }); return; }
    if (key === "cat") { setParams({ cat: "" }); return; }
    if (key === "city") { setParams({ city: "" }); return; }
    if (key === "delivery") { setParams({ delivery: false }); return; }
    setParams({ sort: "recommended" });
  };

  // The full-width interruption banner breaks the card row it lands on, so it must
  // sit on a real row boundary at every column count. Split at the whole number of
  // rows closest to 6 cards for the live column count (measured from the grid), so
  // e.g. 3-up→6 and 4-up→8 — never a ragged partial row before the banner. Until
  // the first measurement lands (SSR + the loading pass) the split defaults to 6,
  // so the banner may shift one row once the real count is read.
  const splitAt = Math.max(columns, Math.round(6 / columns) * columns);
  const head = list.slice(0, splitAt);
  const tail = list.slice(splitAt);
  const card = (o: (typeof list)[number]) => (
    // grid-display wrapper so the card stretches to the row height
    <div key={o.id} className="nk-reveal" style={{ display: "grid" }}>
      <OfferCard title={o.title} city={o.city} price={o.price} unit={dict.common.perDay}
        rating={o.rating} ratingCount={o.ratingCount} hasDelivery={o.hasDelivery}
        img={o.img} category={o.category} categoryIcon={categoryIconFor(cats, o.category)}
        href={localePath(locale, `/skelbimai/${o.id}`)} />
    </div>
  );

  // Zero-result empty, split by reason (L2 search / L4 empty category / L3 filters).
  const filtersActive = !!params.city || params.delivery || params.sort !== "recommended";
  const empty = t.empty;
  const renderEmpty = () => {
    if (params.q) {
      return <EmptyState illustration="search" title={empty.searchTitle(params.q)} subtitle={empty.searchBody}
        actionLabel={empty.searchAction} onAction={reset} />;
    }
    if (isCat && !filtersActive) {
      // Dead-end (empty category): keep the user browsing on the web as the
      // primary path; the app CTA stays available as the secondary action.
      return <EmptyState illustration="listings" title={empty.categoryTitle} subtitle={empty.categoryBody}
        actionLabel={empty.categoryActionSecondary} actionPrimary
        onAction={() => router.push(localePath(locale, "/kategorijos"))}
        secondaryLabel={empty.categoryActionPrimary}
        onSecondaryAction={() => openRedirect({ title: dict.bridge.defaultTitle, body: dict.bridge.defaultBody })} />;
    }
    return <EmptyState illustration="filter"
      title={params.city ? empty.filterTitleCity(params.city) : empty.filterTitle} subtitle={empty.filterBody}
      actionLabel={empty.filterAction} onAction={reset} />;
  };

  return (
    <Chrome>
      <div className="nk-page">
        <Nav onSearch={() => document.getElementById("nk-feed-search-input")?.focus()} />
        <main id="nk-main" className="nk-container" style={{ paddingBlock: "var(--nk-page-top) 40px" }}>
          <Breadcrumb homeLabel={dict.common.breadcrumbHome} label={dict.common.breadcrumbLabel} items={crumbs} />
          {/* 65ch caps the line length so a long authored category intro (seoBody,
              up to ~600 chars) stays readable; short browse/search subtitles never
              reach it. Matches the .nk-prose measure used elsewhere. */}
          <div style={{ display: "flex", flexDirection: "column", gap: "var(--nk-gap-sm)", marginBottom: 32, maxWidth: "65ch" }}>
            <h1 className="nk-h-page">{heading}</h1>
            <p style={{ margin: 0, fontFamily: "var(--nk-font-body)", fontSize: 19, lineHeight: "28px", color: "var(--nk-text-muted)" }}>{subtitle}</p>
          </div>

          {/* sticky filter bar */}
          <div ref={filterBarRef} className="nk-filterbar">
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <div className="nk-filter-row" style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
                <span className="nk-searchfield" style={{ flex: "1 1 320px", minWidth: 240, padding: "13px 20px" }}>
                  <Icon name="Search" size={19} color="var(--nk-text-muted)" stroke={2} />
                  <input id="nk-feed-search-input" value={qInput} onChange={(e) => setQInput(e.target.value)} placeholder={t.searchPlaceholder}
                    style={{ flex: 1, minWidth: 0, border: "none", outline: "none", background: "transparent", fontFamily: "var(--nk-font-body)", fontSize: 16, color: "var(--nk-text)" }} />
                  {qInput && <InputClear onClick={() => setQInput("")} label={t.clear} />}
                </span>
                <span className="nk-filters-desktop">
                  <FilterSelect icon="ArrowUpDown" label={t.sortLabel} value={params.sort} defaultValue="recommended" options={sortOptions} onChange={(v) => setParams({ sort: v })} align="right" />
                </span>
                {/* mobile-only: collapses sort/category/city/delivery into a sheet */}
                <button type="button" className={"nk-pillctl nk-filters-mobilebtn" + (activeFilterCount ? " is-active" : "")} onClick={() => setFiltersOpen(true)}
                  aria-haspopup="dialog" aria-expanded={filtersOpen} style={{ alignItems: "center", gap: 8, padding: "11px 16px", borderRadius: 999, minHeight: "var(--nk-tap)", fontFamily: "var(--nk-font-display)", fontWeight: 600, fontSize: 15.5, cursor: "pointer", whiteSpace: "nowrap" }}>
                  <Icon name="SlidersHorizontal" size={17} stroke={2} color="currentColor" />
                  {t.filtersButton}
                  {activeFilterCount > 0 && <span className="nk-filters-badge">{activeFilterCount}</span>}
                </button>
              </div>
              <div className="nk-filter-row" style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
                <span className="nk-filters-desktop">
                  <FilterSelect icon="LayoutGrid" label={t.categoryLabel} value={params.cat} defaultValue="" options={catOptions} onChange={(v) => setParams({ cat: v })} />
                  <FilterSelect icon="MapPin" label={t.cityLabel} value={params.city} defaultValue="" options={cityOptions} heading={dict.cityPicker.heading} onChange={(v) => setParams({ city: v })} align="right" />
                  <Toggle icon="Car" on={params.delivery} onChange={(on) => setParams({ delivery: on })}>{t.deliveryToggle}</Toggle>
                </span>
                <span className="nk-filter-spacer" style={{ flex: 1 }} />
                <div className="nk-filter-meta" style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span aria-live="polite" className="nk-tnum" style={{ fontFamily: "var(--nk-font-body)", fontSize: 15.5, color: "var(--nk-text-2)", fontWeight: 600, whiteSpace: "nowrap" }}>{countLabel}</span>
                  {anyActive && (
                    <button onClick={reset} className="nk-clear" style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "8px 12px", borderRadius: 999, background: "transparent", fontFamily: "var(--nk-font-display)", fontWeight: 600, fontSize: 15, color: "var(--nk-text-muted)" }}>
                      <Icon name="X" size={15} stroke={2.2} color="currentColor" /> {t.clear}
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>

          <FeedFilterSheet
            open={filtersOpen}
            onClose={() => setFiltersOpen(false)}
            closeLabel={dict.bridge.close}
            title={t.filtersTitle}
            applyLabel={t.filtersApply}
            clearLabel={t.clear}
            anyActive={anyActive}
            onReset={reset}
            sortLabel={t.sortLabel}
            sortValue={params.sort}
            sortOptions={sortOptions}
            onSort={(v) => setParams({ sort: v })}
            categoryLabel={t.categoryLabel}
            categoryValue={params.cat}
            categoryOptions={catOptions}
            onCategory={(v) => setParams({ cat: v })}
            cityLabel={t.cityLabel}
            cityValue={params.city}
            cityHeading={dict.cityPicker.heading}
            cityOptions={cityOptions}
            onCity={(v) => setParams({ city: v })}
            deliveryLabel={t.deliveryToggle}
            delivery={params.delivery}
            onDelivery={(on) => setParams({ delivery: on })}
          />

          {activeChips.length > 0 && (
            // Mobile-only: ≥561px the filled sort/category/city dropdown pills
            // already show each active value, so the removable chip row is
            // duplicative (see .nk-fchips in globals.css).
            <div className="nk-fchips" style={{ flexWrap: "wrap", gap: "var(--nk-gap-xs)", marginBottom: 28 }}>
              {activeChips.map((chip) => (
                <button key={chip.key} type="button" className="nk-fchip" onClick={() => clearChip(chip.key)}
                  aria-label={`${t.clear}: ${chip.label}`}>
                  <span>{chip.label}</span>
                  <Icon name="X" size={15} stroke={2.2} color="currentColor" />
                </button>
              ))}
            </div>
          )}

          {isLoading ? (
            <div className="nk-grid-feed" role="status" aria-live="polite">
              <span className="nk-sr-only">{dict.common.loading}</span>
              {Array.from({ length: 8 }).map((_, i) => <OfferCardSkeleton key={i} />)}
            </div>
          ) : !online && (isError || loaded.length === 0) ? (
            <EmptyState illustration="offline" title={dict.offline.title} subtitle={dict.offline.body}
              actionLabel={dict.offline.retry} onAction={() => refetch()} />
          ) : isError ? (
            <EmptyState illustration="error" tone="danger" title={dict.offers.errorTitle} subtitle={dict.offers.errorSubtitle}
              actionLabel={dict.offers.errorAction} actionPrimary actionIcon="RefreshCcw" onAction={() => refetch()} />
          ) : list.length ? (
            // The interruption banner sits between two grids (not inside one) so no
            // column count ever orphans a card, whatever width the grid steps to.
            <div style={{ display: "flex", flexDirection: "column", gap: "var(--nk-grid-row-gap)" }}>
              <div className="nk-grid-feed" ref={gridRef}>{head.map(card)}</div>
              {tail.length > 0 && <InterruptionBanner />}
              {tail.length > 0 && <div className="nk-grid-feed">{tail.map(card)}</div>}
              {isFetchingNextPage && (
                <div className="nk-grid-feed" aria-hidden="true">
                  {Array.from({ length: 4 }).map((_, i) => <OfferCardSkeleton key={`more-${i}`} />)}
                </div>
              )}
            </div>
          ) : scanningMore ? (
            <div className="nk-grid-feed">
              {Array.from({ length: 8 }).map((_, i) => <OfferCardSkeleton key={i} />)}
            </div>
          ) : (
            renderEmpty()
          )}

          {/* The anchor tracks the raw loaded set so auto-load survives an empty
              filtered view; the visible button only shows alongside real results. */}
          {canLoadMore && (
            <div ref={sentinelRef} style={{ display: "flex", justifyContent: "center", marginTop: 36 }}>
              {list.length > 0 && (
                <button className="nk-btn nk-btn--ghost" onClick={() => fetchNextPage()} disabled={isFetchingNextPage}
                  aria-busy={isFetchingNextPage}>
                  {isFetchingNextPage ? t.loadingMore : t.loadMore}
                </button>
              )}
            </div>
          )}

          <section style={{ paddingTop: "calc(var(--nk-section-y) * 0.55)", paddingBottom: "var(--nk-section-y)" }}>
            <div style={{ maxWidth: 900, display: "flex", flexDirection: "column", gap: 16 }}>
              <h2 style={{ margin: 0, fontFamily: "var(--nk-font-display)", fontWeight: 700, fontSize: 24, lineHeight: "30px", color: "var(--nk-text-2)" }}>{seoHeading}</h2>
              <p style={{ margin: 0, fontFamily: "var(--nk-font-body)", fontSize: 16, lineHeight: "26px", color: "var(--nk-text-muted)" }}>{seoBody}</p>
              <RelatedLandingLinks
                locale={locale}
                categories={cats}
                currentCategory={params.cat}
                currentCity={params.city}
                allLabel={t.allCategories}
              />
            </div>
          </section>
        </main>
        {showTop && (
          <button type="button" className="nk-round nk-round--solid nk-backtotop" aria-label={t.backToTop}
            onClick={() => window.scrollTo({ top: 0, behavior: prefersReducedMotion() ? "auto" : "smooth" })}>
            <Icon name="ArrowUp" size={22} stroke={2.2} color="var(--nk-text)" />
          </button>
        )}
        <Footer locale={locale} />
      </div>
    </Chrome>
  );
}

// Reads the live column count of a CSS grid (from its resolved
// grid-template-columns tracks) so the interruption banner can split on a real
// row boundary at every breakpoint instead of a fixed 6. Callback-ref (not a
// ref object) because the grid only mounts once results render — an effect
// keyed on a plain ref would run before it exists and never re-fire.
function useColumnCount() {
  const [el, setEl] = useState<HTMLDivElement | null>(null);
  const [cols, setCols] = useState(1);
  useEffect(() => {
    if (!el) {
      return;
    }
    const read = () => {
      const tracks = getComputedStyle(el).gridTemplateColumns;
      const n = tracks ? tracks.split(" ").filter((t) => t && t !== "0px").length : 1;
      setCols(Math.max(1, n));
    };
    read();
    const ro = new ResizeObserver(read);
    ro.observe(el);
    return () => ro.disconnect();
  }, [el]);
  return [setEl, cols] as const;
}

function RelatedLandingLinks({
  locale,
  categories,
  currentCategory,
  currentCity,
  allLabel,
}: {
  locale: Locale;
  categories: Pick<Category, "id" | "title">[];
  currentCategory: string;
  currentCity: string;
  allLabel: string;
}) {
  const topCategories = categories.slice(0, 6);
  const links = currentCity
    ? topCategories
        .filter((category) => category.id !== currentCategory)
        .map((category) => ({
          label: `${category.title} · ${currentCity}`,
          href: listingLandingHref({ locale, category: category.id, city: currentCity }),
        }))
    : currentCategory
      ? LT_CITIES.slice(0, 6).map((city) => ({
          label: city,
          href: listingLandingHref({ locale, category: currentCategory, city }),
        }))
      : LT_CITIES.slice(0, 6).map((city) => ({
          label: city,
          href: listingLandingHref({ locale, city }),
        }));
  if (links.length === 0) {
    return null;
  }
  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: 10, paddingTop: 4 }}>
      <Link href={localePath(locale, "/kategorijos")} className="nk-fchip nk-fchip--link">
        <span>{allLabel}</span>
      </Link>
      {links.map((link) => (
        <Link key={link.href} href={link.href} className="nk-fchip nk-fchip--link">
          <span>{link.label}</span>
        </Link>
      ))}
    </div>
  );
}

/* ---------------- Mobile filter sheet ----------------
   Collapses sort/category/city/delivery off the sticky bar into a bottom sheet
   (the bar keeps just search + a "Filters" button), reclaiming ~200px of
   above-the-fold space on phones. Filters apply live; the primary button just
   closes. Options render inline (not nested popovers) — the 2026 mobile pattern
   and clip-safe inside the sheet's own scroll container. */
function FilterSheetGroup({
  label, value, options, onChange, heading,
}: {
  label: string;
  value: string;
  options: SelectOption[];
  onChange: (v: string) => void;
  heading?: string;
}) {
  return (
    <div className="nk-filtersheet__group">
      <span className="nk-filtersheet__label">{heading ?? label}</span>
      <div className="nk-filtersheet__opts" role="radiogroup" aria-label={label}>
        {options.map((o) => {
          const sel = o.value === value;
          return (
            <button key={o.value} type="button" role="radio" aria-checked={sel}
              className={"nk-filtersheet__opt" + (sel ? " is-selected" : "")}
              onClick={() => onChange(o.value)}>
              <span>{o.label}</span>
              {sel && <Icon name="BadgeCheck" size={18} color="var(--nk-accent-text)" stroke={2} />}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function FeedFilterSheet({
  open, onClose, closeLabel, title, applyLabel, clearLabel, anyActive, onReset,
  sortLabel, sortValue, sortOptions, onSort,
  categoryLabel, categoryValue, categoryOptions, onCategory,
  cityLabel, cityValue, cityHeading, cityOptions, onCity,
  deliveryLabel, delivery, onDelivery,
}: {
  open: boolean;
  onClose: () => void;
  closeLabel: string;
  title: string;
  applyLabel: string;
  clearLabel: string;
  anyActive: boolean;
  onReset: () => void;
  sortLabel: string;
  sortValue: string;
  sortOptions: SelectOption[];
  onSort: (v: string) => void;
  categoryLabel: string;
  categoryValue: string;
  categoryOptions: SelectOption[];
  onCategory: (v: string) => void;
  cityLabel: string;
  cityValue: string;
  cityHeading: string;
  cityOptions: SelectOption[];
  onCity: (v: string) => void;
  deliveryLabel: string;
  delivery: boolean;
  onDelivery: (on: boolean) => void;
}) {
  const panelRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const [shown, setShown] = useState(false);
  useFocusTrap(panelRef, open);
  // Scroll-lock + Escape + focus-restore + focus-on-open, plus auto-close once the
  // viewport grows past the mobile breakpoint (the trigger is mobile-only) so a
  // resized desktop is never stuck behind the sheet.
  useDismissableLayer(open, onClose, { initialFocus: closeRef, closeAt: "(min-width: 561px)" });
  // Drive the slide-in: keyed on `open` alone so an in-sheet filter tap (which
  // re-renders the parent) never restarts the entrance animation.
  useEffect(() => {
    if (!open) {
      return;
    }
    const raf = requestAnimationFrame(() => setShown(true));
    return () => {
      cancelAnimationFrame(raf);
      setShown(false);
    };
  }, [open]);
  if (!open) {
    return null;
  }
  return (
    <div className={"nk-modal-scrim nk-filtersheet-scrim" + (shown ? " open" : "")} onClick={onClose}
      role="dialog" aria-modal="true" aria-label={title}>
      <div ref={panelRef} className="nk-sheet nk-filtersheet" onClick={(e) => e.stopPropagation()}>
        <div className="nk-filtersheet__head">
          <h2 className="nk-filtersheet__title">{title}</h2>
          <button ref={closeRef} type="button" className="nk-round nk-round--outline" onClick={onClose} aria-label={closeLabel}>
            <Icon name="X" size={20} stroke={2} color="var(--nk-text)" />
          </button>
        </div>
        <FilterSheetGroup label={sortLabel} value={sortValue} options={sortOptions} onChange={onSort} />
        <FilterSheetGroup label={categoryLabel} value={categoryValue} options={categoryOptions} onChange={onCategory} />
        <FilterSheetGroup label={cityLabel} value={cityValue} options={cityOptions} onChange={onCity} heading={cityHeading} />
        <div className="nk-filtersheet__group">
          <Toggle icon="Car" on={delivery} onChange={onDelivery}>{deliveryLabel}</Toggle>
        </div>
        <div className="nk-filtersheet__foot">
          {anyActive && (
            <button type="button" className="nk-btn nk-btn--ghost" onClick={onReset}>{clearLabel}</button>
          )}
          <button type="button" className="nk-btn nk-btn--primary" style={{ flex: 1 }} onClick={onClose}>{applyLabel}</button>
        </div>
      </div>
    </div>
  );
}
