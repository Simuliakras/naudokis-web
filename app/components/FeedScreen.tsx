"use client";
// Reusable listings feed — powers search (?q=) and category (?cat=) browsing.
// Search / filter / sort are functional on the web; only transactional actions
// (favorite/reserve/contact) are locked to the app.
import { useEffect, useRef, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Nav } from "./sections";
import { Footer } from "./sections-home";
import { Chrome } from "./Chrome";
import { Icon, Breadcrumb, FilterSelect, InputClear, Toggle, openRedirect, type SelectOption } from "./ui";
import { OfferCard, OfferCardSkeleton, InterruptionBanner, EmptyState } from "./cards";
import { useCategories } from "@/app/lib/categories";
import { useListingsInfinite, parseSortKey } from "@/app/lib/listings";
import { useDebouncedValue } from "@/app/lib/use-debounced-value";
import { useOnlineStatus, useReloadOnReconnect } from "@/app/lib/use-online-status";
import { categoryIconFor } from "@/app/lib/category-style";
import { rememberFeedUrl } from "@/app/lib/search";
import { prefersReducedMotion } from "@/app/lib/motion";
import { LT_CITIES } from "@/app/lib/cities";
import { useI18n } from "./I18nProvider";
import { localePath } from "@/app/lib/i18n/config";

export function FeedScreen() {
  const { locale, dict } = useI18n();
  const t = dict.feed;
  const sp = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();
  const online = useOnlineStatus();

  const params = {
    q: sp.get("q") ?? "",
    cat: sp.get("cat") ?? "",
    city: sp.get("city") ?? "",
    sort: parseSortKey(sp.get("sort")),
    delivery: sp.get("delivery") === "1",
  };

  const filterBarRef = useRef<HTMLDivElement>(null);

  function setParams(patch: Record<string, string | boolean>, replace = false) {
    const next = new URLSearchParams(Array.from(sp.entries()));
    for (const [k, v] of Object.entries(patch)) {
      const isDefault = v === "" || v === false || v === "recommended";
      if (isDefault) next.delete(k);
      else next.set(k, v === true ? "1" : String(v));
    }
    const qs = next.toString();
    const url = qs ? `${pathname}?${qs}` : pathname;
    if (replace) {
      // replace = debounced typing into the search input — don't scroll under
      // the user's cursor on every keystroke.
      window.history.replaceState(null, "", url);
      return;
    }
    window.history.pushState(null, "", url);
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

  const loaded = data?.pages.flatMap((p) => p.offers) ?? [];
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

  // A category landing renders the taxonomy's authored heading + intro
  // (seoTitle/seoBody); the short name stays the breadcrumb/chip label.
  const cat = cats.find((c) => c.id === params.cat);
  const catTitle = cat?.title;
  const isCat = !!params.cat;
  const isSearch = !!params.q && !isCat;
  const heading = isCat ? (cat?.seoTitle ?? catTitle ?? t.titleAll) : isSearch ? t.titleSearch : t.titleAll;
  const subtitle = isCat ? (cat?.seoBody ?? t.subtitleAll) : isSearch ? t.subtitleSearch(params.q) : t.subtitleAll;
  const crumbs = isCat
    ? [{ label: t.crumbCategories, href: localePath(locale, "/kategorijos") }, { label: catTitle ?? params.cat }]
    : isSearch
      ? [{ label: t.crumbCategories, href: localePath(locale, "/kategorijos") }, { label: t.titleSearch }]
      : [{ label: t.crumbCategories }];

  const anyActive = !!params.q || isCat || !!params.city || params.delivery || params.sort !== "recommended";
  const reset = () => { setQInput(""); setParams({ q: "", cat: "", city: "", sort: "recommended", delivery: false }); };

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
  // sit on a clean row boundary in every grid width. 6 = LCM(3,2): a full set of
  // rows in the 3-col, 2-col and 1-col layouts, so no card is ever left orphaned.
  const head = list.slice(0, 6);
  const tail = list.slice(6);
  const card = (o: (typeof list)[number]) => (
    // grid-display wrapper so the card stretches to the row height
    <div key={o.id} className="nk-reveal" style={{ display: "grid" }}>
      <OfferCard title={o.title} city={o.city} price={o.price} unit={dict.common.perDay}
        rating={o.rating} count={o.ratingCount > 0 ? dict.common.reviewCount(o.ratingCount) : undefined}
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
                <FilterSelect icon="ArrowUpDown" label={t.sortLabel} value={params.sort} defaultValue="recommended" options={sortOptions} onChange={(v) => setParams({ sort: v })} align="right" />
              </div>
              <div className="nk-filter-row" style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
                <FilterSelect icon="LayoutGrid" label={t.categoryLabel} value={params.cat} defaultValue="" options={catOptions} onChange={(v) => setParams({ cat: v })} />
                <FilterSelect icon="MapPin" label={t.cityLabel} value={params.city} defaultValue="" options={cityOptions} heading={dict.cityPicker.heading} onChange={(v) => setParams({ city: v })} />
                <Toggle icon="Car" on={params.delivery} onChange={(on) => setParams({ delivery: on })}>{t.deliveryToggle}</Toggle>
                <span className="nk-filter-spacer" style={{ flex: 1 }} />
                <div className="nk-filter-meta" style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span aria-live="polite" className="nk-tnum" style={{ fontFamily: "var(--nk-font-body)", fontSize: 15.5, color: "var(--nk-text-2)", fontWeight: 600, whiteSpace: "nowrap" }}>{t.resultCount(list.length)}</span>
                  {anyActive && (
                    <button onClick={reset} className="nk-clear" style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "8px 12px", borderRadius: 999, background: "transparent", fontFamily: "var(--nk-font-display)", fontWeight: 600, fontSize: 15, color: "var(--nk-text-muted)" }}>
                      <Icon name="X" size={15} stroke={2.2} color="currentColor" /> {t.clear}
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>

          {activeChips.length > 0 && (
            <div style={{ display: "flex", flexWrap: "wrap", gap: "var(--nk-gap-xs)", marginBottom: 28 }}>
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
              {Array.from({ length: 6 }).map((_, i) => <OfferCardSkeleton key={i} />)}
            </div>
          ) : !online && (isError || loaded.length === 0) ? (
            <EmptyState illustration="offline" title={dict.offline.title} subtitle={dict.offline.body}
              actionLabel={dict.offline.retry} onAction={() => refetch()} />
          ) : isError ? (
            <EmptyState illustration="error" tone="danger" title={dict.offers.errorTitle} subtitle={dict.offers.errorSubtitle}
              actionLabel={dict.offers.errorAction} actionPrimary actionIcon="RefreshCcw" onAction={() => refetch()} />
          ) : list.length ? (
            <div className="nk-grid-feed">
              {head.map(card)}
              {tail.length > 0 && <InterruptionBanner />}
              {tail.map(card)}
            </div>
          ) : scanningMore ? (
            <div className="nk-grid-feed">
              {Array.from({ length: 6 }).map((_, i) => <OfferCardSkeleton key={i} />)}
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

          <div style={{ marginTop: 64, display: "flex", flexDirection: "column", gap: 18 }}>
            <h2 style={{ margin: 0, fontFamily: "var(--nk-font-display)", fontWeight: 700, fontSize: 22, color: "var(--nk-text)" }}>{t.relatedHeading}</h2>
            <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
              {t.relatedTags.map((tag) => (
                <button key={tag} onClick={() => { setQInput(tag); setParams({ q: tag, cat: "" }); }} className="nk-tagchip"
                  style={{ display: "inline-flex", alignItems: "center", gap: 8, borderRadius: 999, padding: "10px 18px", fontFamily: "var(--nk-font-display)", fontWeight: 600, fontSize: 16, color: "var(--nk-text)", background: "var(--nk-surface)", border: "1px solid var(--nk-border)" }}>
                  {tag}
                </button>
              ))}
            </div>
          </div>

          <section style={{ paddingTop: "calc(var(--nk-section-y) * 0.55)", paddingBottom: "var(--nk-section-y)" }}>
            <div style={{ maxWidth: 900, display: "flex", flexDirection: "column", gap: 16 }}>
              <h2 style={{ margin: 0, fontFamily: "var(--nk-font-display)", fontWeight: 700, fontSize: 24, lineHeight: "30px", color: "var(--nk-text-2)" }}>{t.seoHeading}</h2>
              <p style={{ margin: 0, fontFamily: "var(--nk-font-body)", fontSize: 16, lineHeight: "26px", color: "var(--nk-text-muted)" }}>{t.seoBody}</p>
            </div>
          </section>
        </main>
        <Footer locale={locale} />
      </div>
    </Chrome>
  );
}
