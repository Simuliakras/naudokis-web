"use client";
// Reusable listings feed — powers search (?q=) and category (?cat=) browsing.
// Search / filter / sort are functional on the web; only transactional actions
// (favorite/reserve/contact) are locked to the app.
import { useEffect, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Nav } from "./sections";
import { Footer } from "./sections-home";
import { Chrome } from "./Chrome";
import { Icon, Breadcrumb, FilterSelect, Toggle, openRedirect, type SelectOption } from "./ui";
import { OfferCard, OfferCardSkeleton, InterruptionBanner, EmptyState } from "./cards";
import { useCategories } from "@/app/lib/categories";
import { useListings, parseSortKey } from "@/app/lib/listings";
import { useDebouncedValue } from "@/app/lib/use-debounced-value";
import { useOnlineStatus, useReloadOnReconnect } from "@/app/lib/use-online-status";
import { LT_CITIES } from "@/app/lib/cities";
import { useI18n } from "./I18nProvider";

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

  function setParams(patch: Record<string, string | boolean>, replace = false) {
    const next = new URLSearchParams(Array.from(sp.entries()));
    for (const [k, v] of Object.entries(patch)) {
      const isDefault = v === "" || v === false || v === "recommended";
      if (isDefault) next.delete(k);
      else next.set(k, v === true ? "1" : String(v));
    }
    const qs = next.toString();
    const url = qs ? `${pathname}?${qs}` : pathname;
    if (replace) window.history.replaceState(null, "", url);
    else window.history.pushState(null, "", url);
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

  const cats = useCategories(locale).data ?? [];
  const { data, isLoading, isError, refetch } = useListings(locale, {
    q: params.q, city: params.city, category: params.cat, sort: params.sort,
  });

  useReloadOnReconnect({ online, isError, refetch });

  let list = data ?? [];
  if (params.delivery) list = list.filter((o) => o.hasDelivery);

  const catTitle = cats.find((c) => c.id === params.cat)?.title;
  const isCat = !!params.cat;
  const isSearch = !!params.q && !isCat;
  const heading = isCat ? (catTitle ?? t.titleAll) : isSearch ? t.titleSearch : t.titleAll;
  const subtitle = isSearch ? t.subtitleSearch(params.q) : t.subtitleAll;
  const crumbs = isCat
    ? [{ label: t.crumbCategories, href: "/kategorijos" }, { label: catTitle ?? params.cat }]
    : isSearch
      ? [{ label: t.crumbCategories, href: "/kategorijos" }, { label: t.titleSearch }]
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

  const head = list.slice(0, 4);
  const tail = list.slice(4);
  const card = (o: (typeof list)[number]) => (
    <OfferCard key={o.id} title={o.title} city={o.city} price={o.price} unit={dict.common.perDay}
      rating={o.rating} count={o.ratingCount > 0 ? dict.common.reviewCount(o.ratingCount) : undefined}
      img={o.img} href={`/skelbimai/${o.id}`} />
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
      return <EmptyState illustration="listings" title={empty.categoryTitle} subtitle={empty.categoryBody}
        actionLabel={empty.categoryActionPrimary} actionPrimary
        onAction={() => openRedirect({ title: dict.bridge.defaultTitle, body: dict.bridge.defaultBody })}
        secondaryLabel={empty.categoryActionSecondary} onSecondaryAction={() => router.push("/kategorijos")} />;
    }
    return <EmptyState illustration="filter" title={empty.filterTitle} subtitle={empty.filterBody}
      actionLabel={empty.filterAction} onAction={reset} />;
  };

  return (
    <Chrome>
      <div className="nk-page">
        <Nav onSearch={() => document.getElementById("nk-feed-search-input")?.focus()} />
        <main className="nk-container" style={{ paddingBlock: "32px 40px" }}>
          <Breadcrumb homeLabel={dict.common.breadcrumbHome} label={dict.common.breadcrumbLabel} items={crumbs} />
          <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 32 }}>
            <h1 style={{ margin: 0, fontFamily: "var(--nk-font-display)", fontWeight: 700, fontSize: "clamp(34px, 5vw, 52px)", lineHeight: 1.05, letterSpacing: "-0.01em", color: "var(--nk-text)" }}>{heading}</h1>
            <span style={{ fontFamily: "var(--nk-font-body)", fontSize: 19, color: "var(--nk-text-muted)" }}>{subtitle}</span>
          </div>

          {/* sticky filter bar */}
          <div className="nk-filterbar">
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
                <span className="nk-searchfield" style={{ flex: "1 1 320px", minWidth: 240, padding: "13px 20px" }}>
                  <Icon name="Search" size={19} color="var(--nk-text-muted)" stroke={2} />
                  <input id="nk-feed-search-input" value={qInput} onChange={(e) => setQInput(e.target.value)} placeholder={t.searchPlaceholder}
                    style={{ flex: 1, minWidth: 0, border: "none", outline: "none", background: "transparent", fontFamily: "var(--nk-font-body)", fontSize: 16, color: "var(--nk-text)" }} />
                  {qInput && <button onClick={() => setQInput("")} aria-label={t.clear} style={{ display: "flex", padding: 2 }}><Icon name="X" size={17} color="var(--nk-text-muted)" /></button>}
                </span>
                <FilterSelect icon="ArrowUpDown" label={t.sortLabel} value={params.sort} defaultValue="recommended" options={sortOptions} onChange={(v) => setParams({ sort: v })} align="right" />
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
                <FilterSelect icon="LayoutGrid" label={t.categoryLabel} value={params.cat} defaultValue="" options={catOptions} onChange={(v) => setParams({ cat: v })} />
                <FilterSelect icon="MapPin" label={t.cityLabel} value={params.city} defaultValue="" options={cityOptions} heading={dict.cityPicker.heading} onChange={(v) => setParams({ city: v })} />
                <Toggle icon="Car" on={params.delivery} onChange={(on) => setParams({ delivery: on })}>{t.deliveryToggle}</Toggle>
                <span style={{ flex: 1 }} />
                <span style={{ fontFamily: "var(--nk-font-body)", fontSize: 15.5, color: "var(--nk-text-2)", fontWeight: 600, whiteSpace: "nowrap" }}>{t.resultCount(list.length)}</span>
                {anyActive && (
                  <button onClick={reset} className="nk-clear" style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "8px 12px", borderRadius: 999, background: "transparent", fontFamily: "var(--nk-font-display)", fontWeight: 600, fontSize: 15, color: "var(--nk-text-muted)" }}>
                    <Icon name="X" size={15} stroke={2.2} color="currentColor" /> {t.clear}
                  </button>
                )}
              </div>
            </div>
          </div>

          {isLoading ? (
            <div className="nk-grid-feed">
              {Array.from({ length: 6 }).map((_, i) => <OfferCardSkeleton key={i} />)}
            </div>
          ) : !online && (isError || (data ?? []).length === 0) ? (
            <EmptyState illustration="offline" title={dict.offline.title} subtitle={dict.offline.body}
              actionLabel={dict.offline.retry} onAction={() => refetch()} />
          ) : isError ? (
            <EmptyState illustration="error" title={dict.offers.errorTitle} subtitle={dict.offers.errorSubtitle}
              actionLabel={dict.offers.errorAction} actionPrimary actionIcon="RefreshCcw" onAction={() => refetch()} />
          ) : list.length ? (
            <div className="nk-grid-feed">
              {head.map(card)}
              {tail.length > 0 && <InterruptionBanner />}
              {tail.map(card)}
            </div>
          ) : (
            renderEmpty()
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
