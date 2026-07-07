"use client";
// Reusable listings feed — powers search (?q=) and category (?cat=) browsing.
// Search / filter / sort are functional on the web; only transactional actions
// (favorite/reserve/contact) are locked to the app.
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useFocusTrap } from "@/app/lib/use-focus-trap";
import { useDismissableLayer } from "@/app/lib/use-dismissable-layer";
import { useSheetDrag } from "@/app/lib/use-sheet-drag";
import { Nav } from "./sections";
import { Footer } from "./sections-home";
import { Chrome } from "./Chrome";
import { Icon, Breadcrumb, CloseButton, FilterSelect, InputClear, SearchSuggest, Toggle, openRedirect, rovingKeyNav, type SelectOption } from "./ui";
import { HeroOwnerCta } from "./HeroSearch";
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

// Honest client-side price bands over the loaded offers' real daily price (the
// backend has no price param yet — swap for it when one lands). Values double as
// the ?price= URL tokens; labels come from the dictionaries' priceBand().
const PRICE_BANDS: { value: string; min: number | null; max: number | null }[] = [
  { value: "0-10", min: null, max: 10 },
  { value: "10-30", min: 10, max: 30 },
  { value: "30-60", min: 30, max: 60 },
  { value: "60+", min: 60, max: null },
];

export function FeedScreen({ initialFilters }: FeedScreenProps = {}) {
  const { locale, dict } = useI18n();
  const t = dict.feed;
  const sp = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();
  const online = useOnlineStatus();

  const staticLanding = Boolean(initialFilters);
  // Unknown ?city= values fall back to "all cities" (mirrors resolveListingLanding)
  // — rendering a raw param straight into LT headings produced broken locatives.
  const validCity = (c: string) => ((LT_CITIES as readonly string[]).includes(c) ? c : "");
  const params = initialFilters
    ? {
        q: initialFilters.q ?? "",
        cat: initialFilters.category ?? "",
        city: initialFilters.city ?? "",
        sort: initialFilters.sort ?? "recommended",
        delivery: initialFilters.delivery ?? false,
        price: "",
      }
    : {
        q: sp.get("q") ?? "",
        cat: sp.get("cat") ?? "",
        city: validCity(sp.get("city") ?? ""),
        sort: parseSortKey(sp.get("sort")),
        delivery: sp.get("delivery") === "1",
        price: PRICE_BANDS.some((b) => b.value === sp.get("price")) ? (sp.get("price") as string) : "",
      };

  const filterBarRef = useRef<HTMLDivElement>(null);
  const [gridRef, columns] = useColumnCount();
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [showTop, setShowTop] = useState(false);
  // Phone-width landing-intro clamp (long authored SEO intros pushed the results
  // ~13 lines down); the toggle lifts it, full text stays SSR'd for crawlers.
  const [introOpen, setIntroOpen] = useState(false);
  // Focus-opened search suggestions (guided category/city paths — see SearchSuggest).
  const [suggestOpen, setSuggestOpen] = useState(false);

  function setParams(patch: Record<string, string | boolean>, replace = false) {
    const next = new URLSearchParams();
    if (params.q) next.set("q", params.q);
    if (params.cat) next.set("cat", params.cat);
    if (params.city) next.set("city", params.city);
    if (params.sort && params.sort !== "recommended") next.set("sort", params.sort);
    if (params.delivery) next.set("delivery", "1");
    if (params.price) next.set("price", params.price);
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
    fetchNextPage, hasNextPage, isFetchingNextPage, isPlaceholderData,
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
  // "Su pristatymu" and the price band are client-side filters over the loaded
  // pages (the backend has neither param yet).
  const band = PRICE_BANDS.find((b) => b.value === params.price);
  const list = loaded.filter((o) =>
    (!params.delivery || o.hasDelivery) &&
    (!band ||
      ((band.min === null || o.priceCents >= band.min * 100) &&
        (band.max === null || o.priceCents <= band.max * 100))));
  const clientFiltered = params.delivery || !!band;
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
  // Delivery/price are client-side filters over loaded pages, so the backend
  // total overstates them: show "N+" of what's matched while more pages can load,
  // and the exact loaded-filtered count once the cursor is exhausted.
  const totalCount = data?.pages?.[0]?.totalCount;
  const countLabel = clientFiltered
    ? hasNextPage
      ? t.resultCountAtLeast(list.length)
      : t.resultCount(list.length)
    : t.resultCount(totalCount ?? list.length);
  // A count is a factual claim: while loading, errored, or while keepPreviousData
  // still shows the PREVIOUS query's cards under a new heading, the true count is
  // unknown — never assert one.
  const countKnown = !isError && !isLoading && !isPlaceholderData;

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
  // An active query ALWAYS wins the header: the grid is q-filtered, so a landing
  // H1/intro over it would describe a different result set than the one shown.
  // Breadcrumb, H1 and subtitle all derive from this one predicate.
  const isSearch = !!params.q;
  // Landing intros promise browsable inventory — once the query resolves to zero
  // items, fall back to the capability-framed generic subtitle instead of
  // asserting inventory above an empty state.
  const landingResolvedEmpty = !isLoading && data !== undefined && (data.pages?.[0]?.totalCount ?? 0) === 0;
  const heading = isSearch
    ? t.titleSearch
    : params.city
      ? t.landingHeading({ category: categorySeoLabel, city: params.city })
      : isCat ? (cat?.seoTitle ?? catTitle ?? t.titleAll) : t.titleAll;
  const subtitle = isSearch
    ? t.subtitleSearch(params.q)
    : landingResolvedEmpty && (isCat || params.city)
      ? t.subtitleAll
      : params.city
        ? t.landingDescription({ category: categorySeoLabel, city: params.city })
        : isCat ? (cat?.seoBody ?? t.subtitleAll) : t.subtitleAll;
  // A category / city / category+city landing gets a city/category-aware
  // supporting block; the plain feed + search keep the generic Lithuania-scoped
  // copy so the ~100 programmatic combos aren't near-duplicate thin content.
  const isLanding = (!!params.city || isCat) && !isSearch;
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

  const anyActive = !!params.q || isCat || !!params.city || params.delivery || !!params.price || params.sort !== "recommended";
  const reset = () => { setQInput(""); setParams({ q: "", cat: "", city: "", sort: "recommended", delivery: false, price: "" }); };
  // Count of secondary (sheet) filters — badges the mobile "Filters" button.
  const activeFilterCount = [params.cat, params.city, params.delivery, params.price, params.sort !== "recommended"].filter(Boolean).length;

  const sortOptions: SelectOption[] = [
    { value: "recommended", label: t.sortRecommended },
    { value: "price_asc", label: t.sortPriceAsc },
    { value: "price_desc", label: t.sortPriceDesc },
    { value: "rating_desc", label: t.sortRatingBest },
  ];
  const catOptions: SelectOption[] = [{ value: "", label: t.allCategories }, ...cats.map((c) => ({ value: c.id, label: c.title }))];
  const cityOptions: SelectOption[] = [{ value: "", label: dict.cityPicker.all }, ...LT_CITIES.map((c) => ({ value: c, label: c }))];
  const priceOptions: SelectOption[] = [
    { value: "", label: t.priceAny },
    ...PRICE_BANDS.map((b) => ({ value: b.value, label: t.priceBand(b.min, b.max) })),
  ];

  // Active-filter chips — each removes just its own dimension (the reset button
  // clears everything). The free-text query is NOT mirrored as a chip: the input's
  // own × plus the global clear already cover it, and three parallel clear
  // affordances for one action read as noise. Labels derive from the option lists.
  const sortLabel = sortOptions.find((o) => o.value === params.sort)?.label ?? params.sort;
  type ChipKey = "cat" | "city" | "delivery" | "price" | "sort";
  const activeChips: { key: ChipKey; label: string }[] = [];
  if (isCat) activeChips.push({ key: "cat", label: catTitle ?? params.cat });
  if (params.city) activeChips.push({ key: "city", label: params.city });
  if (params.delivery) activeChips.push({ key: "delivery", label: t.deliveryToggle });
  if (band) activeChips.push({ key: "price", label: t.priceBand(band.min, band.max) });
  if (params.sort !== "recommended") activeChips.push({ key: "sort", label: sortLabel });
  const clearChip = (key: ChipKey) => {
    if (key === "cat") { setParams({ cat: "" }); return; }
    if (key === "city") { setParams({ city: "" }); return; }
    if (key === "delivery") { setParams({ delivery: false }); return; }
    if (key === "price") { setParams({ price: "" }); return; }
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
    // grid-display wrapper so the card stretches to the row height; listitem role
    // pairs with the grids' role="list" so AT gets "list, N items" + position
    <div key={o.id} className="nk-reveal" role="listitem" style={{ display: "grid" }}>
      <OfferCard title={o.title} city={o.city} price={o.price} unit={dict.common.perDay}
        rating={o.rating} ratingCount={o.ratingCount} hasDelivery={o.hasDelivery}
        img={o.img} category={o.category} categoryIcon={categoryIconFor(cats, o.category)}
        href={localePath(locale, `/skelbimai/${o.id}`)} />
    </div>
  );

  // Zero-result empty, split by reason (L2 search / L4 empty category or city
  // landing / L3 filters). Landing states (no user-set toggles) never blame
  // "filters" the visitor didn't set, and every dead end keeps a browse path
  // plus the owner-acquisition CTA.
  const filtersActive = params.delivery || !!params.price || params.sort !== "recommended";
  const empty = t.empty;
  const listItem = () => openRedirect({ title: dict.bridge.listTitle, body: dict.bridge.listBody });
  const renderEmpty = () => {
    if (params.q) {
      return <EmptyState illustration="search" title={empty.searchTitle(params.q)} subtitle={empty.searchBody}
        actionLabel={empty.searchAction} onAction={reset}
        secondaryLabel={t.allCategories}
        onSecondaryAction={() => router.push(localePath(locale, "/kategorijos"))} />;
    }
    if (params.city && !filtersActive) {
      // Empty city (or category+city) landing — a Google visitor set no filters,
      // so describe the actual situation and offer real recovery paths.
      return <EmptyState illustration="listings" title={empty.cityTitle(params.city)} subtitle={empty.cityBody}
        actionLabel={empty.categoryActionSecondary} actionPrimary
        onAction={() => router.push(localePath(locale, "/kategorijos"))}
        secondaryLabel={empty.categoryActionPrimary}
        onSecondaryAction={listItem} />;
    }
    if (isCat && !filtersActive) {
      // Dead-end (empty category): keep the user browsing on the web as the
      // primary path; the owner CTA stays available as the secondary action.
      // The category's own glyph makes ~10 programmatic empties feel authored.
      return <EmptyState illustration="listings" illustrationIcon={categoryIconFor(cats, params.cat)}
        title={empty.categoryTitle} subtitle={empty.categoryBody}
        actionLabel={empty.categoryActionSecondary} actionPrimary
        onAction={() => router.push(localePath(locale, "/kategorijos"))}
        secondaryLabel={empty.categoryActionPrimary}
        onSecondaryAction={listItem} />;
    }
    return <EmptyState illustration="filter"
      title={params.city ? empty.filterTitleCity(params.city) : empty.filterTitle} subtitle={empty.filterBody(params.delivery)}
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
              reach it. Matches the .nk-prose measure used elsewhere. Section-scale
              H1 + gap-token margins keep the first price row near the desktop fold
              (the feed is a utility surface, not a marketing page). */}
          <div style={{ display: "flex", flexDirection: "column", gap: "var(--nk-gap-sm)", marginBottom: "var(--nk-gap-lg)", maxWidth: "65ch" }}>
            <span className="nk-eyebrow">{t.eyebrow}</span>
            <h1 className="nk-h-section" style={{ margin: 0 }}>{heading}</h1>
            {isSearch ? (
              // ≤560 the chip row already echoes the query — a generic line there
              // avoids four echoes of the same string in one screen.
              <p className="nk-feed-sub" style={{ margin: 0, fontFamily: "var(--nk-font-body)", fontSize: 19, lineHeight: "28px", color: "var(--nk-text-muted)" }}>
                <span className="nk-wide-only">{subtitle}</span>
                <span className="nk-narrow-only">{t.subtitleSearchGeneric}</span>
              </p>
            ) : (
              <>
                <p className={"nk-feed-sub" + (isLanding && subtitle.length > 200 && !introOpen ? " nk-intro-clamp" : "")}
                  style={{ margin: 0, fontFamily: "var(--nk-font-body)", fontSize: 19, lineHeight: "28px", color: "var(--nk-text-muted)" }}>
                  {subtitle}
                </p>
                {isLanding && subtitle.length > 200 && (
                  <button type="button" className="nk-narrow-only nk-intro-toggle" aria-expanded={introOpen}
                    onClick={() => setIntroOpen((v) => !v)}
                    style={{ alignSelf: "flex-start", padding: "8px 0", border: 0, background: "none", cursor: "pointer", fontFamily: "var(--nk-font-display)", fontWeight: 600, fontSize: 15, color: "var(--nk-purple-hover)" }}>
                    {introOpen ? t.introLess : t.introMore}
                  </button>
                )}
              </>
            )}
          </div>

          {/* sticky filter bar — pins only the controls (search + filters); the
              result-count meta is context, not a control, so it scrolls with the
              page instead of costing pinned height on every phone scroll */}
          <div ref={filterBarRef} className="nk-filterbar">
            <div style={{ display: "flex", flexDirection: "column", gap: "var(--nk-gap-sm)" }}>
              <div className="nk-filter-row" style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
                <span className="nk-searchfield"
                  onBlur={(e) => {
                    if (!(e.relatedTarget instanceof Node) || !e.currentTarget.contains(e.relatedTarget)) {
                      setSuggestOpen(false);
                    }
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Escape") { setSuggestOpen(false); return; }
                    if (e.key === "ArrowDown" && suggestOpen) {
                      e.preventDefault();
                      e.currentTarget.querySelector<HTMLElement>('[role="option"]')?.focus();
                    }
                  }}>
                  <Icon name="Search" size={19} color="var(--nk-text-muted)" stroke={2} />
                  <input id="nk-feed-search-input" type="search" value={qInput}
                    onChange={(e) => { setQInput(e.target.value); setSuggestOpen(false); }}
                    onFocus={() => { if (!qInput) setSuggestOpen(true); }}
                    placeholder={t.searchPlaceholder} aria-label={t.searchLabel}
                    style={{ flex: 1, minWidth: 0, border: "none", outline: "none", background: "transparent", fontFamily: "var(--nk-font-body)", fontSize: 16, color: "var(--nk-text)" }} />
                  {qInput && <InputClear onClick={() => setQInput("")} label={t.clear} />}
                  {/* Guided paths from real data — on a small inventory a blind
                      free-text search usually returns nothing; a category/city
                      route always lands on a real result set. */}
                  {suggestOpen && (
                    <SearchSuggest
                      categories={cats}
                      cities={LT_CITIES}
                      headings={{ categories: dict.search.suggestCategories, cities: dict.search.suggestCities }}
                      label={dict.search.suggestionsLabel}
                      onCategory={(id) => { setSuggestOpen(false); setParams({ cat: id }); }}
                      onCity={(city) => { setSuggestOpen(false); setParams({ city }); }}
                    />
                  )}
                </span>
                <span className="nk-filters-desktop">
                  <FilterSelect icon="ArrowUpDown" label={t.sortLabel} value={params.sort} defaultValue="recommended" options={sortOptions} onChange={(v) => setParams({ sort: v })} align="right" />
                </span>
                {/* mobile-only: collapses category/city/price/delivery/sort into a sheet */}
                <button type="button" className={"nk-pillctl nk-filters-mobilebtn" + (activeFilterCount ? " is-active" : "")} onClick={() => setFiltersOpen(true)}
                  aria-haspopup="dialog" aria-expanded={filtersOpen} style={{ alignItems: "center", gap: 8, padding: "11px 16px", borderRadius: 999, minHeight: "var(--nk-tap)", fontFamily: "var(--nk-font-display)", fontWeight: 600, fontSize: 15.5, cursor: "pointer", whiteSpace: "nowrap" }}>
                  <Icon name="SlidersHorizontal" size={17} stroke={2} color="currentColor" />
                  {t.filtersButton}
                  {activeFilterCount > 0 && <span className="nk-filters-badge">{activeFilterCount}</span>}
                </button>
              </div>
              <div className="nk-filter-row nk-filter-row--desktop" style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
                {/* Both left-cluster panels anchor to their triggers' left edges;
                    only the right-edge sort control needs align="right". */}
                <FilterSelect icon="LayoutGrid" label={t.categoryLabel} value={params.cat} defaultValue="" options={catOptions} onChange={(v) => setParams({ cat: v })} />
                <FilterSelect icon="MapPin" label={t.cityLabel} value={params.city} defaultValue="" options={cityOptions} onChange={(v) => setParams({ city: v })} />
                <FilterSelect icon="Tag" label={t.priceLabel} value={params.price} defaultValue="" options={priceOptions} onChange={(v) => setParams({ price: v })} />
                <Toggle icon="Truck" on={params.delivery} onChange={(on) => setParams({ delivery: on })}>{t.deliveryToggle}</Toggle>
              </div>
            </div>
          </div>

          {/* Mobile category rail — the browse dimension stays visible on the page
              itself instead of two taps deep in the filter sheet (≤560px only). */}
          <div className="nk-catrail">
            <button type="button" className={"nk-pillctl nk-catrail__chip" + (!params.cat ? " is-active" : "")}
              aria-pressed={!params.cat} onClick={() => setParams({ cat: "" })}>{t.allCategories}</button>
            {cats.map((c) => (
              <button key={c.id} type="button" className={"nk-pillctl nk-catrail__chip" + (params.cat === c.id ? " is-active" : "")}
                aria-pressed={params.cat === c.id}
                onClick={() => setParams({ cat: params.cat === c.id ? "" : c.id })}>{c.title}</button>
            ))}
          </div>

          <div className="nk-filter-meta" style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", gap: 8, margin: "-16px 0 24px" }}>
            {/* em-dash while the count is unknown (loading / error / stale
                placeholder pages behind a changed query) — a count is a claim */}
            <span className="nk-tnum" style={{ fontFamily: "var(--nk-font-body)", fontSize: 15.5, color: "var(--nk-text-2)", fontWeight: 600, whiteSpace: "nowrap" }}>{countKnown ? countLabel : "—"}</span>
            {anyActive && (
              <button onClick={reset} className="nk-clear" style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "8px 12px", borderRadius: 999, background: "transparent", fontFamily: "var(--nk-font-display)", fontWeight: 600, fontSize: 15, color: "var(--nk-text-muted)" }}>
                <Icon name="X" size={15} stroke={2.2} color="currentColor" /> {t.clear}
              </button>
            )}
          </div>
          {/* Persistent SR status: loading → result count (a live region must be
              mounted before its content changes to announce reliably). */}
          <span role="status" className="nk-sr-only">{isLoading ? dict.common.loading : countKnown ? countLabel : ""}</span>
          <h2 className="nk-sr-only">{t.titleAll}</h2>

          <FeedFilterSheet
            open={filtersOpen}
            onClose={() => setFiltersOpen(false)}
            closeLabel={dict.bridge.close}
            title={t.filtersTitle}
            // Outcome preview on the apply button ("Show 3 results") — filters
            // apply live, so the parent's count is current while the sheet is open;
            // null (countless label) while it's still loading.
            applyLabel={t.filtersApply(
              countKnown ? (clientFiltered ? list.length : (totalCount ?? list.length)) : null,
              clientFiltered && !!hasNextPage,
            )}
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
            cityOptions={cityOptions}
            onCity={(v) => setParams({ city: v })}
            priceLabel={t.priceLabel}
            priceValue={params.price}
            priceOptions={priceOptions}
            onPrice={(v) => setParams({ price: v })}
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

          {/* Never assert stale cached results silently: a persistent offline strip
              rides above the grid whenever cached cards keep rendering offline. */}
          {!online && list.length > 0 && (
            <div role="status" className="nk-offline-strip">{dict.offline.title}</div>
          )}

          {isLoading ? (
            <div className="nk-grid-feed" aria-hidden="true">
              {Array.from({ length: 8 }).map((_, i) => <OfferCardSkeleton key={i} />)}
            </div>
          ) : !online && (isError || loaded.length === 0) ? (
            <EmptyState illustration="offline" title={dict.offline.title} subtitle={dict.offline.body}
              actionLabel={dict.offline.retry} onAction={() => refetch()} />
          ) : isError && loaded.length === 0 ? (
            <EmptyState illustration="error" tone="danger" title={dict.offers.errorTitle} subtitle={dict.offers.errorSubtitle}
              actionLabel={dict.offers.errorAction} actionPrimary actionIcon="RefreshCcw" onAction={() => refetch()} />
          ) : list.length ? (
            // The interruption banner sits between two grids (not inside one) so no
            // column count ever orphans a card; with a short result set it follows
            // the grid so the feed never dead-ends straight into the SEO block.
            // While placeholder pages back a CHANGED query, the grid dims so the
            // previous results are never presented as the new query's answer.
            <div style={{ display: "flex", flexDirection: "column", gap: "var(--nk-grid-row-gap)", opacity: isPlaceholderData ? 0.55 : undefined, transition: "opacity .2s ease" }}>
              <div className="nk-grid-feed" role="list" ref={gridRef}>{head.map(card)}</div>
              <InterruptionBanner />
              {tail.length > 0 && <div className="nk-grid-feed" role="list">{tail.map(card)}</div>}
              {isFetchingNextPage && (
                <div className="nk-grid-feed" aria-hidden="true">
                  {Array.from({ length: 4 }).map((_, i) => <OfferCardSkeleton key={`more-${i}`} />)}
                </div>
              )}
              {/* A failed page-append must not wipe the results the user was
                  browsing — keep the grid and surface an inline retry instead. */}
              {isError && (
                <div style={{ display: "flex", justifyContent: "center" }}>
                  <button className="nk-btn nk-btn--ghost" onClick={() => refetch()}>
                    <Icon name="RefreshCcw" size={16} stroke={2} color="var(--nk-text)" /> {dict.offers.errorAction}
                  </button>
                </div>
              )}
            </div>
          ) : scanningMore ? (
            <div className="nk-grid-feed" aria-hidden="true">
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

          {/* Supply-side exit: the feed is where owner intent surfaces ("my item
              would sit well here") — reuses the hero's owner prompt + CTA. */}
          {list.length > 0 && (
            <div style={{ display: "flex", justifyContent: "center", marginTop: 28 }}>
              <HeroOwnerCta />
            </div>
          )}

          <section style={{ paddingTop: "calc(var(--nk-section-y) * 0.55)", paddingBottom: "var(--nk-section-y)" }}>
            <div style={{ maxWidth: 900, display: "flex", flexDirection: "column", gap: 16 }}>
              <h2 style={{ margin: 0, fontFamily: "var(--nk-font-display)", fontWeight: 700, fontSize: 24, lineHeight: "30px", color: "var(--nk-text-2)" }}>{seoHeading}</h2>
              {/* 65ch matches the header intro's reading measure (900px ≈ 110ch read as filler) */}
              <p style={{ margin: 0, maxWidth: "65ch", fontFamily: "var(--nk-font-body)", fontSize: 16, lineHeight: "26px", color: "var(--nk-text-muted)" }}>{seoBody}</p>
              <RelatedLandingLinks
                locale={locale}
                categories={cats}
                currentCategory={params.cat}
                currentCity={params.city}
                allLabel={t.allCategories}
                heading={t.relatedLinksLabel}
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
  heading,
}: {
  locale: Locale;
  categories: Pick<Category, "id" | "title">[];
  currentCategory: string;
  currentCity: string;
  allLabel: string;
  heading: string;
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
  // Micro-label + the nav-styled --link chip variant keep these crawlable links
  // visually distinct from the functional filter chips at the top of the page.
  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: 10, paddingTop: 4 }}>
      <span style={{ width: "100%", fontFamily: "var(--nk-font-display)", fontWeight: 700, fontSize: 12.5, letterSpacing: ".07em", textTransform: "uppercase", color: "var(--nk-text-muted)" }}>{heading}</span>
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
  label, value, options, onChange,
}: {
  label: string;
  value: string;
  options: SelectOption[];
  onChange: (v: string) => void;
}) {
  return (
    <div className="nk-filtersheet__group">
      <span className="nk-filtersheet__label">{label}</span>
      {/* APG radio-group contract: one Tab stop per group (roving tabindex) and
          arrows move focus AND selection — SRs announce "radio, 1 of N", which
          invites exactly that arrow navigation. */}
      <div className="nk-filtersheet__opts" role="radiogroup" aria-label={label}
        onKeyDown={(e) => {
          const next = rovingKeyNav(e, '[role="radio"]');
          if (next?.dataset.value !== undefined) {
            onChange(next.dataset.value);
          }
        }}>
        {options.map((o) => {
          const sel = o.value === value;
          return (
            <button key={o.value} type="button" role="radio" aria-checked={sel}
              tabIndex={sel ? 0 : -1} data-value={o.value}
              className={"nk-filtersheet__opt" + (sel ? " is-selected" : "")}
              onClick={() => onChange(o.value)}>
              <span>{o.label}</span>
              {/* fixed-width check slot: selection must never change a chip's
                  width, or every tap re-wraps the whole chip cloud */}
              <Icon name="BadgeCheck" size={18} color="var(--nk-accent-text)" stroke={2}
                style={{ opacity: sel ? 1 : 0, flex: "none" }} aria-hidden />
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
  cityLabel, cityValue, cityOptions, onCity,
  priceLabel, priceValue, priceOptions, onPrice,
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
  cityOptions: SelectOption[];
  onCity: (v: string) => void;
  priceLabel: string;
  priceValue: string;
  priceOptions: SelectOption[];
  onPrice: (v: string) => void;
  deliveryLabel: string;
  delivery: boolean;
  onDelivery: (on: boolean) => void;
}) {
  const panelRef = useRef<HTMLDivElement>(null);
  const grabRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const [shown, setShown] = useState(false);
  useFocusTrap(panelRef, open);
  // Scroll-lock + Escape + focus-restore + focus-on-open, plus auto-close once the
  // viewport grows past the mobile breakpoint (the trigger is mobile-only) so a
  // resized desktop is never stuck behind the sheet.
  useDismissableLayer(open, onClose, { initialFocus: closeRef, closeAt: "(min-width: 561px)" });
  // Same sheet anatomy as the app-redirect sheet: grabber pill + swipe-to-dismiss.
  useSheetDrag({ panelRef, handleRef: grabRef, enabled: open, onDismiss: onClose });
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
        <div ref={grabRef} className="nk-sheet-grabzone" aria-hidden="true"><span className="nk-sheet-grabber" /></div>
        <div className="nk-filtersheet__head">
          <h2 className="nk-filtersheet__title">{title}</h2>
          <CloseButton ref={closeRef} onClick={onClose} label={closeLabel} />
        </div>
        {/* Section order mirrors the desktop toolbar (category → city → price →
            delivery), leading with the decision-critical dimensions; sort — a
            presentation control, not a filter — goes last instead of eating the
            first screen. */}
        <FilterSheetGroup label={categoryLabel} value={categoryValue} options={categoryOptions} onChange={onCategory} />
        <FilterSheetGroup label={cityLabel} value={cityValue} options={cityOptions} onChange={onCity} />
        <FilterSheetGroup label={priceLabel} value={priceValue} options={priceOptions} onChange={onPrice} />
        <div className="nk-filtersheet__group">
          <Toggle icon="Truck" on={delivery} onChange={onDelivery}>{deliveryLabel}</Toggle>
        </div>
        <FilterSheetGroup label={sortLabel} value={sortValue} options={sortOptions} onChange={onSort} />
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
