"use client";
// All-categories list screen — breadcrumb, live-filter search, tile grid, SEO.
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Nav, Footer } from "./sections";
import { Chrome } from "./Chrome";
import { Icon, Breadcrumb } from "./ui";
import { CategoryTile, CategoryCardSkeleton, EmptyState } from "./cards";
import { useCategories } from "@/app/lib/categories";
import { listingSearchHref } from "@/app/lib/search";
import { mockCategoryCount } from "@/app/lib/mock";
import { useI18n } from "./I18nProvider";

export function CategoriesScreen() {
  const { locale, dict } = useI18n();
  const t = dict.categoriesPage;
  const router = useRouter();
  const [q, setQ] = useState("");
  const { data, isLoading, isError, refetch } = useCategories(locale);

  const focusSearch = () => document.getElementById("nk-cats-search-input")?.focus();
  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (q.trim()) router.push(listingSearchHref({ q }));
  };
  const term = q.trim().toLowerCase();
  const all = data ?? [];
  const list = all.filter((c) => c.title.toLowerCase().includes(term));

  return (
    <Chrome>
      <div className="nk-page">
        <Nav onSearch={focusSearch} />
        <main className="nk-container" style={{ paddingBlock: "28px 40px" }}>
          <Breadcrumb homeLabel={dict.common.breadcrumbHome} label={dict.common.breadcrumbLabel} items={[{ label: t.crumb }]} />
          <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 32 }}>
            <span className="nk-eyebrow">{t.eyebrow}</span>
            <h1 style={{ margin: 0, fontFamily: "var(--nk-font-display)", fontWeight: 700, fontSize: "clamp(34px, 5vw, 52px)", lineHeight: 1.05, letterSpacing: "-0.01em", color: "var(--nk-text)" }}>{t.title}</h1>
            <p className="nk-body" style={{ margin: 0, maxWidth: 620 }}>{t.body}</p>
          </div>

          <form onSubmit={submit} style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 36, flexWrap: "wrap" }}>
            <span className="nk-searchfield" style={{ flex: "1 1 320px", minWidth: 240, maxWidth: 560 }}>
              <Icon name="Search" size={19} color="var(--nk-text-muted)" stroke={2} />
              <input id="nk-cats-search-input" value={q} onChange={(e) => setQ(e.target.value)} placeholder={t.searchPlaceholder}
                style={{ flex: 1, minWidth: 0, border: "none", outline: "none", background: "transparent", fontFamily: "var(--nk-font-body)", fontSize: 16, color: "var(--nk-text)" }} />
              {q && <button type="button" onClick={() => setQ("")} aria-label={dict.bridge.close} style={{ display: "flex", padding: 2 }}><Icon name="X" size={17} color="var(--nk-text-muted)" /></button>}
            </span>
            <button type="submit" className="nk-btn nk-btn--primary" style={{ padding: "14px 30px" }}>{t.submit}</button>
          </form>

          {isLoading ? (
            <div className="nk-grid-cats">
              {Array.from({ length: 8 }).map((_, i) => <CategoryCardSkeleton key={i} />)}
            </div>
          ) : isError ? (
            <EmptyState icon="LayoutGrid" title={dict.categories.errorTitle} subtitle={dict.categories.errorSubtitle}
              actionLabel={dict.categories.errorAction} onAction={() => refetch()} />
          ) : list.length ? (
            <div className="nk-grid-cats">
              {list.map((c) => (
                <CategoryTile key={c.id} title={c.title} count={t.tileCount(mockCategoryCount(c.id))} href={listingSearchHref({ cat: c.id })} />
              ))}
            </div>
          ) : (
            <EmptyState icon="SearchX" title={t.emptyTitle} subtitle={t.emptySubtitle(q.trim())} actionLabel={t.emptyAction} onAction={() => setQ("")} />
          )}

          <section style={{ paddingBlock: "80px 40px" }}>
            <div style={{ maxWidth: 900, display: "flex", flexDirection: "column", gap: 16 }}>
              <h2 style={{ margin: 0, fontFamily: "var(--nk-font-display)", fontWeight: 700, fontSize: 24, lineHeight: "30px", color: "var(--nk-text-2)" }}>{t.seoHeading}</h2>
              <p style={{ margin: 0, fontFamily: "var(--nk-font-body)", fontSize: 16, lineHeight: "26px", color: "var(--nk-text-muted)" }}>{t.seoBody}</p>
            </div>
          </section>
        </main>
        <Footer />
      </div>
    </Chrome>
  );
}
