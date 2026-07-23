"use client";
// Reusable listings feed — powers search (?q=) and category (?cat=) browsing.
// Search / filter / sort are functional on the web; only transactional actions
// (favorite/reserve/contact) are locked to the app.
import { useEffect, useMemo, useRef, useState } from "react";
// Route-scoped stylesheet — see the header of catalogue.css.
import "./catalogue.css";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useFocusTrap } from "@/app/lib/use-focus-trap";
import { useDismissableLayer } from "@/app/lib/use-dismissable-layer";
import { useSheetDrag } from "@/app/lib/use-sheet-drag";
import { Nav } from "./sections";
import { Footer } from "./sections-home";
import { Chrome } from "./Chrome";
import { Icon, Breadcrumb, CloseButton, FilterSelect, InputClear, Toggle, openRedirect, rovingKeyNav, type SelectOption } from "./ui";
import { ChipLinkRow, PageHead, SeoNote } from "./headers";
import { HeroOwnerCta } from "./HeroSearch";
import { OfferCard, OfferCardSkeleton, EmptyState } from "./cards";
import { dedupeById, useCategories, type Category } from "@/app/lib/categories";
import { useListingsInfinite, parseSortKey, parsePageParam, marketplaceErrorKind } from "@/app/lib/listings";
import { parsePriceParam, priceToCents, serializePriceParam, priceBandArgs, type PriceRange } from "@/app/lib/price-range";
import { depositToParams, parseDepositParam, serializeDepositParam } from "@/app/lib/deposit-filter";
import { PriceRangeControl, PriceRangePanel } from "./PriceRange";
import { clampRangeToToday, dateBandArgs, datesToApiParams, parseDatesParam, serializeDatesParam, type DateFilterRange } from "@/app/lib/date-filter";
import { DateRangeFilterControl, DateRangeFilterPanel } from "./DateRangeFilter";
import { useMarketToday } from "@/app/lib/use-market-today";
import { useDebouncedValue } from "@/app/lib/use-debounced-value";
import { useOnlineStatus, useReloadOnReconnect } from "@/app/lib/use-online-status";
import { trackEvent } from "@/app/lib/analytics";
import { categoryIconFor, categoryNameFor } from "@/app/lib/category-style";
import { listingLandingHref, rememberFeedUrl } from "@/app/lib/search";
import { listingDetailPath } from "@/app/lib/listing-url";
import { listingBreadcrumbTrail } from "@/app/lib/breadcrumbs";
import { prefersReducedMotion } from "@/app/lib/motion";
import { LT_CITIES } from "@/app/lib/cities";
import { useI18n } from "./I18nProvider";
import { localePath, type Locale } from "@/app/lib/i18n/config";
import { useMeasuredColumns } from "./useMeasuredColumns";
import type { IsoDate } from "@/app/lib/dates";
import type { ListingFilters } from "@/app/lib/listings";

type FeedScreenProps = {
  initialFilters?: ListingFilters & { delivery?: boolean; price?: string; dates?: string; deposit?: string };
  // The market "today" the SERVER already clamped `?dates=` against, handed down so the
  // first client render can reproduce that window before useMarketToday() resolves. Only
  // a route that (a) prefetches a date-filtered query and (b) renders this screen without
  // `initialFilters` needs it — see the `today` binding below.
  serverToday?: IsoDate;
  extraCategory?: Category;
  extraCategories?: Category[];
};

// A raw `?price=` value → its canonical token ("" when it filters nothing), so the URL
// the feed writes and the pager links it builds never carry a non-canonical variant.
function priceParamToken(raw: string | null): string {
  const range = parsePriceParam(raw);
  return range ? serializePriceParam(range) : "";
}

// A raw `?dates=` value → its canonical token ("" when unusable), same role as
// priceParamToken. Structural only (no "today") so it matches the server-prefetch token.
function datesParamToken(raw: string | null): string {
  return serializeDatesParam(parseDatesParam(raw));
}

// A raw `?deposit=` value → its canonical token, same role as priceParamToken.
function depositParamToken(raw: string | null): string {
  return serializeDepositParam(parseDepositParam(raw));
}

export function FeedScreen({ initialFilters, serverToday, extraCategory, extraCategories = [] }: FeedScreenProps = {}) {
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
        sort: initialFilters.sort ?? "newest",
        page: parsePageParam(initialFilters.page),
        delivery: initialFilters.delivery ?? false,
        price: initialFilters.price ?? "",
        dates: initialFilters.dates ?? "",
        deposit: initialFilters.deposit ?? "",
      }
    : {
        q: sp.get("q") ?? "",
        cat: sp.get("cat") ?? "",
        city: validCity(sp.get("city") ?? ""),
        sort: parseSortKey(sp.get("sort")),
        page: parsePageParam(sp.get("page")),
        delivery: sp.get("delivery") === "1",
        price: priceParamToken(sp.get("price")),
        dates: datesParamToken(sp.get("dates")),
        deposit: depositParamToken(sp.get("deposit")),
      };

  const filterBarRef = useRef<HTMLDivElement>(null);
  const [gridRef, columns] = useMeasuredColumns<HTMLDivElement>();
  const [filtersOpen, setFiltersOpen] = useState(false);
  // Phone-width landing-intro clamp (long authored SEO intros pushed the results
  // ~13 lines down); the toggle lifts it, full text stays SSR'd for crawlers.
  const [introOpen, setIntroOpen] = useState(false);

  function setParams(patch: Record<string, string | boolean>, replace = false) {
    const next = new URLSearchParams();
    if (params.q) next.set("q", params.q);
    if (params.cat) next.set("cat", params.cat);
    if (params.city) next.set("city", params.city);
    if (params.sort && params.sort !== "newest") next.set("sort", params.sort);
    if (params.page > 1) next.set("page", String(params.page));
    if (params.delivery) next.set("delivery", "1");
    if (params.price) next.set("price", params.price);
    if (params.dates) next.set("dates", params.dates);
    if (params.deposit) next.set("deposit", params.deposit);
    const resetPage = Object.keys(patch).some((key) => key !== "page");
    for (const [k, v] of Object.entries(patch)) {
      const isDefault = v === "" || v === false || v === "newest";
      if (isDefault) next.delete(k);
      else next.set(k, v === true ? "1" : String(v));
    }
    if (resetPage) {
      next.delete("page");
    }
    const qs = next.toString();
    const basePath = staticLanding ? localePath(locale, "/skelbimai") : pathname;
    const url = qs ? `${basePath}?${qs}` : basePath;
    // A patch that changes nothing is not a filter change. Committing a range is a
    // discrete act, so re-picking the window/price already in the URL is ordinary (click
    // the start date twice, or Clear with nothing set) — and without this it would push a
    // duplicate history entry the Back button then has to eat through, fire a phantom
    // "Listing Filter Change", and scroll-jump the feed. Guarding here rather than in each
    // panel is what keeps the two controls honest: neither can forget it.
    if (url === window.location.pathname + window.location.search) {
      return;
    }
    trackEvent("Listing Filter Change", {
      locale,
      patch: Object.keys(patch).join(","),
      hasQuery: Boolean("q" in patch ? String(patch.q ?? "").trim() : params.q),
      category: "cat" in patch ? String(patch.cat || "") : params.cat,
      city: "city" in patch ? String(patch.city || "") : params.city,
      delivery: "delivery" in patch ? Boolean(patch.delivery) : params.delivery,
      sort: "sort" in patch ? String(patch.sort || "newest") : params.sort,
      hasDates: Boolean("dates" in patch ? String(patch.dates ?? "") : params.dates),
      deposit: "deposit" in patch ? String(patch.deposit || "") : params.deposit,
    });
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

  const topCats = useCategories(locale).data;
  // Merged lookup set (card eyebrows/icons, breadcrumbs, related subcategories).
  // The category <select> stays top-level only — see catOptions below.
  const cats = useMemo(
    () => dedupeById([...(topCats ?? []), ...extraCategories, ...(extraCategory ? [extraCategory] : [])]),
    [topCats, extraCategories, extraCategory],
  );
  const priceRange = parsePriceParam(params.price);
  // Token → the three-state deposit filter. Only "none" is producible from the UI
  // (the toggle); a deep-linked "?deposit=<euros>" ceiling still reaches the wire
  // — see app/lib/deposit-filter.ts. Either active state shows on the toggle (the
  // chips row is mobile-only, so the toggle is the ceiling's ONLY desktop surface;
  // an invisible-but-live filter would leave thinned results with no visible cause).
  const depositFilter = parseDepositParam(params.deposit);
  const depositActive = depositFilter.kind !== "any";
  const depositLabel = depositFilter.kind === "max" ? t.depositUpTo(depositFilter.euros) : t.depositToggle;
  // "Today" cannot be a server fact (use-market-today.ts explains why), so this is
  // undefined on the server AND on the first client render unless a caller hands down the
  // date IT already clamped against. That first render has to agree with the server,
  // because the clamped window is part of the React Query key: with `serverToday` it
  // reproduces the server's window exactly and HITS the dehydrated prefetch, and the live
  // value takes over on mount. Routes that pass `initialFilters` need no serverToday —
  // their `dates` token arrives already clamped, and re-clamping it is idempotent.
  const today = useMarketToday(serverToday);
  // ONE range drives the calendar, the pill/chip AND the wire — they must not disagree.
  // The clamp is what keeps a stale `?dates=` honest: the backend answers a window whose
  // start is already past with an EMPTY page, so sending an unclamped one would strand the
  // user on a blank feed while the pill claimed "Any dates" and offered nothing to clear.
  // Clamping first means a fully-past window simply drops the filter, and a straddling one
  // ("this weekend", opened next week) filters the days that remain.
  const parsedDates = parseDatesParam(params.dates);
  const dateRange = today ? clampRangeToToday(parsedDates, today) : parsedDates;
  const {
    data, isLoading, isError, error, refetch,
    fetchNextPage, hasNextPage, isFetchingNextPage, isPlaceholderData,
  } = useListingsInfinite(locale, {
    q: params.q,
    city: params.city,
    category: params.cat,
    sort: params.sort,
    page: params.page,
    // Open ends are omitted (not sent as 0 / 20000): the backend applies the bounds
    // inclusively, so an absent side is what keeps the filter open there.
    ...(priceRange ? priceToCents(priceRange) : {}),
    // The clamped window — never the raw URL one — so the wire and the pill agree.
    ...datesToApiParams(dateRange),
    // "none" → deposit_required=false; a ceiling → deposit_max_cents alone (it
    // admits no-deposit listings, so it is never paired with deposit_required).
    ...depositToParams(depositFilter),
    deliveryMethods: params.delivery ? ["user_delivery"] : undefined,
  });

  useReloadOnReconnect({ online, isError, refetch });
  const errorKind = marketplaceErrorKind(error);
  const errorTitle = errorKind === "timeout" ? dict.offline.timeoutTitle : dict.offline.serverTitle;
  const errorBody = errorKind === "timeout" ? dict.offline.timeoutBody : dict.offline.serverBody;

  // Every visible offer already satisfies the API-side filter and sort contract.
  // The API exposes cursor continuation rather than a full-result total, so the
  // count is deliberately expressed as a lower bound until the cursor is exhausted.
  const list = data?.pages.flatMap((page) => page.offers) ?? [];
  const loaded = list;
  // DynamoDB may evaluate a page whose records are all rejected by its backend
  // FilterExpression while still returning a continuation cursor. Keep walking
  // those cursors instead of presenting a false empty state.
  const canLoadMore = !!hasNextPage;
  const scanningMore = list.length === 0 && canLoadMore;
  const countLabel = hasNextPage ? t.resultCountAtLeast(list.length) : t.resultCount(list.length);
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

  // Keep the selected chip visible in the mobile category rail — landing on a
  // filtered URL used to render the rail scrolled to the start, so the active
  // selection (often far down the taxonomy) was invisible.
  const catrailRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    // scroll the RAIL only (scrollIntoView could also scroll the page vertically)
    const rail = catrailRef.current;
    const active = rail?.querySelector<HTMLElement>(".is-active");
    if (rail && active) {
      rail.scrollLeft = Math.max(0, active.offsetLeft - (rail.clientWidth - active.offsetWidth) / 2);
    }
  }, [params.cat, cats.length]);

  // A category landing renders the taxonomy's authored heading + intro
  // (seoTitle/seoBody); the short name stays the breadcrumb/chip label.
  const cat = cats.find((c) => c.id === params.cat);
  const parentCat = cat?.parentId ? cats.find((c) => c.id === cat.parentId) : undefined;
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
  const landingResolvedEmpty = !isLoading && data !== undefined && list.length === 0 && !hasNextPage;
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
        categoryTitle: params.cat ? (parentCat?.title ?? catTitle ?? params.cat) : undefined,
        category: parentCat?.id ?? (params.cat || undefined),
        subcategoryTitle: parentCat ? (catTitle ?? params.cat) : undefined,
        subcategory: parentCat ? params.cat : undefined,
        city: params.city || undefined,
      })
        .slice(1)
        .map((c) => ({ label: c.name, href: localePath(locale, c.path) }));

  // Every "is a filter visibly active?" flag reads the CLAMPED dateRange, never the raw
  // params.dates token — the pill and chip already do, and a fully-past `?dates=` (a
  // shared link opened next week) clamps away to nothing. Reading the token here instead
  // would badge and offer to "clear" a filter the page never shows.
  const dateActive = !!dateRange;
  const anyActive = !!params.q || isCat || !!params.city || params.delivery || !!params.price || dateActive || depositActive || params.sort !== "newest";
  const reset = () => { setQInput(""); setParams({ q: "", cat: "", city: "", sort: "newest", page: "", delivery: false, price: "", dates: "", deposit: "" }); };
  // Count of secondary (sheet) filters — badges the mobile "Filters" button.
  const activeFilterCount = [params.cat, params.city, params.delivery, params.price, dateActive, depositActive, params.sort !== "newest"].filter(Boolean).length;

  const sortOptions: SelectOption[] = [
    { value: "newest", label: t.sortNewest },
    { value: "price_asc", label: t.sortPriceAsc },
    { value: "price_desc", label: t.sortPriceDesc },
    { value: "rating_desc", label: t.sortRatingBest },
  ];
  // Top-level categories only — the merged `cats` set would flatten ~40 sub-
  // categories into the select. The active subcategory (landing pages) is
  // appended so the control can still label its current value.
  const catOptions: SelectOption[] = [
    { value: "", label: t.allCategories },
    ...dedupeById([...(topCats ?? []), ...(cat ? [cat] : [])]).map((c) => ({ value: c.id, label: c.title })),
  ];
  const cityOptions: SelectOption[] = [{ value: "", label: dict.cityPicker.all }, ...LT_CITIES.map((c) => ({ value: c, label: c }))];

  // Active-filter chips — each removes just its own dimension (the reset button
  // clears everything). The free-text query is NOT mirrored as a chip: the input's
  // own × plus the global clear already cover it, and three parallel clear
  // affordances for one action read as noise. Labels derive from the option lists.
  const sortLabel = sortOptions.find((o) => o.value === params.sort)?.label ?? params.sort;
  type ChipKey = "cat" | "city" | "delivery" | "price" | "dates" | "deposit" | "sort";
  const activeChips: { key: ChipKey; label: string }[] = [];
  if (isCat) activeChips.push({ key: "cat", label: catTitle ?? params.cat });
  if (params.city) activeChips.push({ key: "city", label: params.city });
  if (params.delivery) activeChips.push({ key: "delivery", label: t.deliveryToggle });
  if (priceRange) activeChips.push({ key: "price", label: t.priceBand(...priceBandArgs(priceRange)) });
  if (dateRange) activeChips.push({ key: "dates", label: t.dateBand(...dateBandArgs(dateRange, locale)) });
  if (depositActive) activeChips.push({ key: "deposit", label: depositLabel });
  if (params.sort !== "newest") activeChips.push({ key: "sort", label: sortLabel });
  const clearChip = (key: ChipKey) => {
    if (key === "cat") { setParams({ cat: "" }); return; }
    if (key === "city") { setParams({ city: "" }); return; }
    if (key === "delivery") { setParams({ delivery: false }); return; }
    if (key === "price") { setParams({ price: "" }); return; }
    if (key === "dates") { setParams({ dates: "" }); return; }
    if (key === "deposit") { setParams({ deposit: "" }); return; }
    setParams({ sort: "newest" });
  };

  const card = (o: (typeof list)[number], index: number) => (
    // grid-display wrapper so the card stretches to the row height; listitem role
    // pairs with the grid's role="list" so AT gets "list, N items" + position
    <div key={o.id} className="nk-reveal" role="listitem" style={{ display: "grid" }}>
      <OfferCard id={o.id} title={o.title} city={o.city} subdivision={o.subdivision} price={o.price} unit={dict.common.perDay}
        rating={o.rating} ratingCount={o.ratingCount} hasDelivery={o.hasDelivery}
        photoCount={o.photoCount} deposit={o.deposit} owner={o.owner}
        img={o.img} category={o.category} categoryName={categoryNameFor(cats, o.category)} categoryIcon={categoryIconFor(cats, o.category)}
        // Only the first rendered row is above the fold; everything the infinite
        // feed appends below it lazy-loads. `columns` is measured off the grid,
        // so before the first measurement lands this eagerly loads one card.
        imageLoading={index < Math.max(1, columns) ? "eager" : "lazy"}
        href={localePath(locale, listingDetailPath({ id: o.id, title: o.title, city: o.city }))} />
    </div>
  );

  // Zero-result empty, split by reason (L2 search / L4 empty category or city
  // landing / L3 filters). Landing states (no user-set toggles) never blame
  // "filters" the visitor didn't set, and every dead end keeps a browse path
  // plus the owner-acquisition CTA.
  const filtersActive = params.delivery || !!params.price || dateActive || depositActive || params.sort !== "newest";
  const empty = t.empty;
  const listItem = () => openRedirect({ title: dict.bridge.listTitle, body: dict.bridge.listBody });
  const pageHref = (page: number) => {
    const next = new URLSearchParams();
    if (params.q) next.set("q", params.q);
    if (!staticLanding && params.cat) next.set("cat", params.cat);
    if (!staticLanding && params.city) next.set("city", params.city);
    if (params.sort && params.sort !== "newest") next.set("sort", params.sort);
    if (params.delivery) next.set("delivery", "1");
    if (params.price) next.set("price", params.price);
    if (params.dates) next.set("dates", params.dates);
    if (params.deposit) next.set("deposit", params.deposit);
    if (page > 1) next.set("page", String(page));
    const qs = next.toString();
    return qs ? `${pathname}?${qs}` : pathname;
  };
  const renderEmpty = () => {
    // Beyond the last page (stale link, shrunken inventory): say exactly that.
    // Falling through used to show three contradictions at once — a filter-blame
    // message with no filters set, the page-1 count, and a "Page 2 of 1" pager.
    if (params.page > 1) {
      return <EmptyState illustration="listings" title={t.pageEmptyTitle} subtitle={t.pageEmptyBody}
        actionLabel={t.pageEmptyAction} actionPrimary
        onAction={() => router.push(pageHref(1))} />;
    }
    if (params.q) {
      // echo at most ~40 chars of the query back — the headline must never carry
      // an unbounded string
      const qEcho = params.q.length > 42 ? `${params.q.slice(0, 42).trimEnd()}…` : params.q;
      return <EmptyState illustration="search" title={empty.searchTitle(qEcho)} subtitle={empty.searchBody}
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
      return <EmptyState illustration="listings"
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

  const showPager = !isLoading && !isError && !params.q && (params.page > 1 || !!hasNextPage);

  return (
    <Chrome>
      <div className="nk-page">
        <Nav onSearch={() => document.getElementById("nk-feed-search-input")?.focus()} />
        <main id="nk-main" className="nk-container" style={{ paddingBlock: "var(--nk-page-top) 40px" }}>
          <Breadcrumb homeLabel={dict.common.breadcrumbHome} label={dict.common.breadcrumbLabel} items={crumbs} />
          {/* 100ch caps the line length so a long authored category intro (seoBody,
              up to ~600 chars) stays readable; short browse/search subtitles never
              reach it. Wider than the 65ch .nk-prose measure used elsewhere — the
              feed head has the room and wraps fewer lines. The subtitle branches
              (search echo vs clamped landing intro) ride in PageHead's children
              slot below the shared eyebrow + H1. Kept in sync with the matching
              maxWidth in CatalogueLoading.tsx / skelbimai/page.tsx so the head
              does not shift as the screen takes over, and with SeoNote's body
              measure so the head and the closing block share one column. */}
          <PageHead eyebrow={t.eyebrow} title={heading} maxWidth="100ch">
            {isSearch ? (
              // ≤560 the chip row already echoes the query — a generic line there
              // avoids four echoes of the same string in one screen.
              <p className="nk-subtitle">
                <span className="nk-wide-only">{subtitle}</span>
                <span className="nk-narrow-only">{t.subtitleSearchGeneric}</span>
              </p>
            ) : (
              <>
                <p className={"nk-subtitle" + (isLanding && subtitle.length > 200 && !introOpen ? " nk-intro-clamp" : "")}>
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
          </PageHead>

          {/* sticky filter bar — pins only the controls (search + filters); the
              result-count meta is context, not a control, so it scrolls with the
              page instead of costing pinned height on every phone scroll */}
          <div ref={filterBarRef} className="nk-filterbar">
            <div style={{ display: "flex", flexDirection: "column", gap: "var(--nk-gap-sm)" }}>
              <div className="nk-filter-row" style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
                <span className="nk-searchfield">
                  <Icon name="Search" size={19} color="var(--nk-text-muted)" stroke={2} />
                  <input id="nk-feed-search-input" type="search" value={qInput}
                    onChange={(e) => setQInput(e.target.value)}
                    placeholder={t.searchPlaceholder} aria-label={t.searchLabel}
                    style={{ flex: 1, minWidth: 0, border: "none", outline: "none", background: "transparent", fontFamily: "var(--nk-font-body)", fontSize: 16, color: "var(--nk-text)" }} />
                  {qInput && <InputClear onClick={() => setQInput("")} label={t.clear} />}
                </span>
                <span className="nk-filters-desktop">
                  <FilterSelect icon="ArrowUpDown" label={t.sortLabel} value={params.sort} defaultValue="newest" options={sortOptions} onChange={(v) => setParams({ sort: v })} align="right" />
                </span>
                {/* mobile-only: collapses category/city/price/delivery/sort into a sheet */}
                <button type="button" className={"nk-pillctl nk-filters-mobilebtn" + (activeFilterCount ? " is-active" : "")} onClick={() => setFiltersOpen(true)}
                  aria-haspopup="dialog" aria-expanded={filtersOpen} style={{ alignItems: "center", gap: 8, padding: "11px 16px", borderRadius: "var(--nk-r-pill)", minHeight: "var(--nk-control-h)", fontFamily: "var(--nk-font-display)", fontWeight: 600, fontSize: 15.5, cursor: "pointer", whiteSpace: "nowrap" }}>
                  <Icon name="SlidersHorizontal" size={17} stroke={2} color="currentColor" />
                  {t.filtersButton}
                  {activeFilterCount > 0 && <span className="nk-filters-badge">{activeFilterCount}</span>}
                </button>
              </div>
              <div className="nk-filter-row nk-filter-row--desktop" style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
                {/* Both left-cluster panels anchor to their triggers' left edges;
                    only the right-edge sort control needs align="right". */}
                <FilterSelect icon="LayoutGrid" label={t.categoryLabel} value={params.cat} defaultValue="" options={catOptions} onChange={(v) => setParams({ cat: v })} />
                <DateRangeFilterControl value={dateRange} onChange={(r) => setParams({ dates: serializeDatesParam(r) })} />
                <FilterSelect icon="MapPin" label={t.cityLabel} value={params.city} defaultValue="" options={cityOptions} onChange={(v) => setParams({ city: v })} />
                <PriceRangeControl value={priceRange} onChange={(r) => setParams({ price: serializePriceParam(r) })} />
                <Toggle icon="Truck" on={params.delivery} onChange={(on) => setParams({ delivery: on })}>{t.deliveryToggle}</Toggle>
                {/* ON for "none" AND for a deep-linked ceiling (labelled with it) —
                    like the price/date pills, the trigger wears the active state.
                    Clicking an active toggle clears either state; from rest it sets
                    "none", the only UI-producible filter. Coins, never a shield:
                    the Terms disclaim insurance (see the card deposit pill). */}
                <Toggle icon="Coins" on={depositActive} onChange={(on) => setParams({ deposit: on ? "none" : "" })}>{depositLabel}</Toggle>
              </div>
            </div>
          </div>

          {/* Mobile category rail — the browse dimension stays visible on the page
              itself instead of two taps deep in the filter sheet (below --breakpoint-sm only). */}
          <div className="nk-catrail" ref={catrailRef}>
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
            {/* Horizontal-only padding keeps the label on the count's baseline;
                minHeight puts the hit area back (WCAG 2.5.8) without adding the
                vertical padding that would break that alignment. */}
            {anyActive && (
              <button type="button" onClick={reset} className="nk-clear" style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 6, padding: "0 12px", minHeight: "var(--nk-tap)", borderRadius: 999, background: "transparent", fontFamily: "var(--nk-font-display)", fontWeight: 600, fontSize: 15, color: "var(--nk-text-muted)" }}>
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
              countKnown ? list.length : null,
              !!hasNextPage,
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
            priceRange={priceRange}
            onPrice={(r) => setParams({ price: serializePriceParam(r) })}
            dateLabel={t.dateLabel}
            dateRange={dateRange}
            onDate={(r) => setParams({ dates: serializeDatesParam(r) })}
            deliveryLabel={t.deliveryToggle}
            delivery={params.delivery}
            onDelivery={(on) => setParams({ delivery: on })}
            depositLabel={depositLabel}
            depositOn={depositActive}
            onDeposit={(on) => setParams({ deposit: on ? "none" : "" })}
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
            <EmptyState illustration="error" tone="danger" title={errorTitle} subtitle={errorBody}
              actionLabel={dict.offers.errorAction} actionPrimary actionIcon="RefreshCcw" onAction={() => refetch()} />
          ) : list.length ? (
            // While placeholder pages back a CHANGED query, the grid dims so the
            // previous results are never presented as the new query's answer.
            <div style={{ display: "flex", flexDirection: "column", gap: "var(--nk-grid-row-gap)", opacity: isPlaceholderData ? 0.55 : undefined, transition: "opacity .2s ease" }}>
              <div className="nk-grid-feed" role="list" ref={gridRef}>{list.map(card)}</div>
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

          {showPager && (
            <nav aria-label={t.paginationLabel} className="nk-seopager">
              {params.page > 1 && (
                <Link href={pageHref(params.page - 1)} className="nk-fchip nk-fchip--link">
                  <Icon name="ArrowLeft" size={15} stroke={2.2} color="currentColor" />
                  <span>{t.previousPage}</span>
                </Link>
              )}
              <span className="nk-seopager__status">
                {t.pageStatusShort(params.page)}
              </span>
              {hasNextPage && (
                <Link href={pageHref(params.page + 1)} className="nk-fchip nk-fchip--link">
                  <span>{t.nextPage}</span>
                  <Icon name="ArrowRight" size={15} stroke={2.2} color="currentColor" />
                </Link>
              )}
            </nav>
          )}

          {/* Supply-side exit: the feed is where owner intent surfaces ("my item
              would sit well here") — reuses the hero's owner prompt + CTA. */}
          {list.length > 0 && (
            <div style={{ display: "flex", justifyContent: "center", marginTop: 28 }}>
              <HeroOwnerCta />
            </div>
          )}

          <SeoNote heading={seoHeading} body={seoBody} top="section">
            <RelatedLandingLinks
              locale={locale}
              categories={cats}
              currentCategory={params.cat}
              currentCity={params.city}
              allLabel={t.allCategories}
              heading={t.relatedLinksLabel}
            />
          </SeoNote>
        </main>
        <Footer locale={locale} />
      </div>
    </Chrome>
  );
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
  categories: Pick<Category, "id" | "title" | "parentId">[];
  currentCategory: string;
  currentCity: string;
  allLabel: string;
  heading: string;
}) {
  const topCategories = categories.slice(0, 6);
  const current = categories.find((category) => category.id === currentCategory);
  const subcategories = current && !current.parentId
    ? categories.filter((category) => category.parentId === current.id).slice(0, 8)
    : [];
  const links = currentCity
    ? topCategories
        .filter((category) => category.id !== currentCategory)
        .map((category) => ({
          label: `${category.title} · ${currentCity}`,
          href: listingLandingHref({ locale, category: category.id, city: currentCity }),
        }))
    : currentCategory && subcategories.length > 0
      ? subcategories.map((subcategory) => ({
          label: subcategory.title,
          href: listingLandingHref({ locale, category: currentCategory, subcategory: subcategory.id }),
        }))
      : currentCategory
        ? LT_CITIES.slice(0, 6).map((city) => ({
            label: city,
            href: listingLandingHref({
              locale,
              category: current?.parentId ?? currentCategory,
              subcategory: current?.parentId ? currentCategory : undefined,
              city,
            }),
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
    <ChipLinkRow
      label={heading}
      links={[{ label: allLabel, href: localePath(locale, "/kategorijos") }, ...links]}
      style={{ paddingTop: "var(--nk-gap-md)" }}
    />
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
  priceLabel, priceRange, onPrice,
  dateLabel, dateRange, onDate,
  deliveryLabel, delivery, onDelivery,
  depositLabel, depositOn, onDeposit,
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
  priceRange: PriceRange | null;
  onPrice: (r: PriceRange) => void;
  dateLabel: string;
  dateRange: DateFilterRange | null;
  onDate: (r: DateFilterRange | null) => void;
  deliveryLabel: string;
  delivery: boolean;
  onDelivery: (on: boolean) => void;
  depositLabel: string;
  depositOn: boolean;
  onDeposit: (on: boolean) => void;
}) {
  const panelRef = useRef<HTMLDivElement>(null);
  const grabRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const [shown, setShown] = useState(false);
  useFocusTrap(panelRef, open);
  // Scroll-lock + Escape + focus-restore + focus-on-open, plus auto-close once the
  // viewport grows past the mobile breakpoint (the trigger is mobile-only) so a
  // resized desktop is never stuck behind the sheet.
  useDismissableLayer(open, onClose, { initialFocus: closeRef, closeAt: "filterExpanded" });
  // Same sheet anatomy as the app-redirect sheet: grabber pill + swipe-to-dismiss.
  useSheetDrag({ panelRef, handleRef: grabRef, enabled: open, onDismiss: onClose, activeAt: "filterCompact" });
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
        {/* Section order mirrors the desktop toolbar (category → date → city →
            price → delivery), leading with the decision-critical dimensions; sort —
            a presentation control, not a filter — goes last instead of eating the
            first screen. */}
        <FilterSheetGroup label={categoryLabel} value={categoryValue} options={categoryOptions} onChange={onCategory} />
        {/* Dates are a range, not a radiogroup — render the dual-thumb panel inline
            (no nested layer inside the sheet's own scroll container). */}
        <div className="nk-filtersheet__group">
          <span className="nk-filtersheet__label">{dateLabel}</span>
          <DateRangeFilterPanel value={dateRange} onChange={onDate} variant="inline" />
        </div>
        <FilterSheetGroup label={cityLabel} value={cityValue} options={cityOptions} onChange={onCity} />
        {/* Price is a range too — same inline treatment as dates. */}
        <div className="nk-filtersheet__group">
          <span className="nk-filtersheet__label">{priceLabel}</span>
          <PriceRangePanel value={priceRange} onChange={onPrice} variant="inline" />
        </div>
        <div className="nk-filtersheet__group">
          <Toggle icon="Truck" on={delivery} onChange={onDelivery}>{deliveryLabel}</Toggle>
        </div>
        <div className="nk-filtersheet__group">
          <Toggle icon="Coins" on={depositOn} onChange={onDeposit}>{depositLabel}</Toggle>
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
