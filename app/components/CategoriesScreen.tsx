"use client";
// All-categories list screen — breadcrumb, live-filter search, tile grid, SEO.
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Nav } from "./sections";
import { Footer } from "./sections-home";
import { Chrome } from "./Chrome";
import { Icon, Breadcrumb, InputClear } from "./ui";
import { CategoryCard, CategoryCardSkeleton, EmptyState } from "./cards";
import { useCategories } from "@/app/lib/categories";
import { listingSearchHref } from "@/app/lib/search";
import { useOnlineStatus, useReloadOnReconnect } from "@/app/lib/use-online-status";
import { useI18n } from "./I18nProvider";

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
  const term = q.trim().toLowerCase();
  const all = data ?? [];
  const list = all.filter((c) => c.title.toLowerCase().includes(term));

  return (
    <Chrome>
      <div className="nk-page">
        <Nav onSearch={focusSearch} />
        <main id="nk-main" className="nk-container" style={{ paddingBlock: "var(--nk-page-top) 40px" }}>
          <Breadcrumb homeLabel={dict.common.breadcrumbHome} label={dict.common.breadcrumbLabel} items={[{ label: t.crumb }]} />
          <div style={{ display: "flex", flexDirection: "column", gap: "var(--nk-gap-sm)", marginBottom: 32 }}>
            <span className="nk-eyebrow">{t.eyebrow}</span>
            <h1 className="nk-h-page">{t.title}</h1>
            <p className="nk-body" style={{ margin: 0, maxWidth: 620 }}>{t.body}</p>
          </div>

          <form onSubmit={(e) => e.preventDefault()} style={{ display: "flex", flexDirection: "column", gap: "var(--nk-gap-sm)", marginBottom: 32 }}>
            <span className="nk-searchfield" style={{ width: "100%", maxWidth: 560 }}>
              <Icon name="Search" size={19} color="var(--nk-text-muted)" stroke={2} />
              <input id="nk-cats-search-input" value={q} onChange={(e) => setQ(e.target.value)} placeholder={t.searchPlaceholder}
                style={{ flex: 1, minWidth: 0, border: "none", outline: "none", background: "transparent", fontFamily: "var(--nk-font-body)", fontSize: 16, color: "var(--nk-text)" }} />
              {q && <InputClear onClick={() => setQ("")} label={dict.bridge.close} />}
            </span>
            {/* Always-mounted live region (toggle its text, not its existence) so the
                count change is reliably announced on every keystroke. */}
            <span aria-live="polite" className="nk-tnum" style={{ fontFamily: "var(--nk-font-body)", fontSize: 14.5, color: "var(--nk-text-muted)" }}>
              {!isLoading && !isError && all.length > 0 ? t.foundCount(list.length) : ""}
            </span>
          </form>

          {isLoading ? (
            <div className="nk-grid-cats" role="status" aria-live="polite">
              <span className="nk-sr-only">{dict.common.loading}</span>
              {Array.from({ length: 8 }).map((_, i) => <CategoryCardSkeleton key={i} />)}
            </div>
          ) : !online && (isError || all.length === 0) ? (
            <EmptyState illustration="offline" title={dict.offline.title} subtitle={dict.offline.body}
              actionLabel={dict.offline.retry} onAction={() => refetch()} />
          ) : isError ? (
            <EmptyState illustration="error" tone="danger" title={dict.categories.errorTitle} subtitle={dict.categories.errorSubtitle}
              actionLabel={dict.categories.errorAction} actionPrimary actionIcon="RefreshCcw" onAction={() => refetch()} />
          ) : list.length ? (
            <div className="nk-grid-cats">
              {list.map((c) => (
                <div key={c.id} className="nk-reveal" style={{ display: "grid" }}>
                  <CategoryCard id={c.id} icon={c.icon} title={c.title} href={listingSearchHref({ cat: c.id, locale })} />
                </div>
              ))}
            </div>
          ) : (
            <EmptyState illustration="search" title={t.emptyTitle} subtitle={t.emptySubtitle(q.trim())}
              actionLabel={t.searchItems(q.trim())} actionPrimary actionIcon="Search" onAction={searchItems}
              secondaryLabel={t.emptyAction} onSecondaryAction={() => setQ("")} />
          )}

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
