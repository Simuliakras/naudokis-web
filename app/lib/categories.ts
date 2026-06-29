// Category data layer — fetch top-level categories from the Naudokis backend.
import { useQuery } from "@tanstack/react-query";
import type { IconName } from "@/app/components/ui";
import type { Locale } from "./i18n/config";
import { getDictionary } from "./i18n/dictionaries";
import { API_BASE, USE_MOCK } from "./api";
import { MOCK_CATEGORIES } from "./mock-data";
import { categoryGlyph } from "./category-style";

/* ---------------- Backend shapes ---------------- */
// Each node also carries authored bilingual SEO copy: seo_* render in the page
// body (heading + intro), meta_* in <head> (title + description). All optional on
// the read path so an un-seeded node still parses (we fall back to the name).
// `GET /listings/categories` is pre-filtered to public nodes server-side, so
// `visibility` is no longer on the wire — don't filter on it.
type ApiCategory = {
  id: string;
  name_lt: string;
  name_en: string;
  icon_name: string;
  level: number;
  display_order: number;
  parent_id?: string;
  seo_title_lt?: string;
  seo_title_en?: string;
  seo_description_lt?: string;
  seo_description_en?: string;
  meta_title_lt?: string;
  meta_title_en?: string;
  meta_description_lt?: string;
  meta_description_en?: string;
};

type CategoriesResponse = {
  success: boolean;
  // `version`/`updated_at` bump when the taxonomy or its SEO copy changes — kept
  // here for future version-keyed revalidation (rendering doesn't need them).
  data: { categories: ApiCategory[]; version?: number; updated_at?: string };
};

/* ---------------- View model ---------------- */
export type Category = {
  id: string;
  title: string;
  icon: IconName; // resolved from the wire's icon_name (Tag fallback)
  // Authored SEO copy, locale-resolved with a name-based fallback so consumers
  // never branch on undefined. seo* render in the page body, meta* in <head>.
  seoTitle: string;
  seoBody: string;
  metaTitle: string;
  metaDescription: string;
};

// Single source of truth for the query key — used by useCategories() and by
// server components prefetching into the same cache slot, so they can't diverge.
export function categoriesKey(locale: Locale) {
  return ["categories", locale] as const;
}

// Resolve a backend node into the locale-correct view model. Every SEO field
// falls back to a name-derived value so a brand-new, un-authored category renders
// real copy instead of `undefined`.
function toCategory(c: ApiCategory, locale: Locale): Category {
  const en = locale === "en";
  const title = en ? c.name_en : c.name_lt;
  const copy = getDictionary(locale).categories;
  const fallbackBody = copy.seoFallbackBody(title);
  return {
    id: c.id,
    title,
    icon: categoryGlyph(c.icon_name),
    seoTitle: (en ? c.seo_title_en : c.seo_title_lt) || title,
    seoBody: (en ? c.seo_description_en : c.seo_description_lt) || fallbackBody,
    metaTitle: (en ? c.meta_title_en : c.meta_title_lt) || copy.metaTitleFallback(title),
    metaDescription: (en ? c.meta_description_en : c.meta_description_lt) || fallbackBody,
  };
}

export function fallbackCategories(locale: Locale): Category[] {
  return MOCK_CATEGORIES.map((c) =>
    toCategory(
      { id: c.id, name_lt: c.name_lt, name_en: c.name_en, icon_name: c.icon_name, level: 0, display_order: 0 },
      locale,
    ),
  );
}

export function mergeWithFallbackCategories(locale: Locale, categories: Category[]): Category[] {
  const seen = new Set(categories.map((category) => category.id));
  return [
    ...categories,
    ...fallbackCategories(locale).filter((category) => !seen.has(category.id)),
  ];
}

// Exported so server components can prefetch the same data useCategories reads.
export async function fetchCategories(locale: Locale): Promise<Category[]> {
  if (USE_MOCK) {
    return fallbackCategories(locale);
  }
  // Categories change rarely — server-side fetches stay fresh for an hour
  // (matches the categories page's route revalidate). Browsers ignore `next`.
  const res = await fetch(`${API_BASE}/listings/categories`, { next: { revalidate: 3600 } });
  if (!res.ok) {
    throw new Error(`Failed to load categories: ${res.status}`);
  }
  const body: CategoriesResponse = await res.json();
  return body.data.categories
    .filter((c) => c.level === 0)
    .sort((a, b) => a.display_order - b.display_order)
    .map((c) => toCategory(c, locale));
}

export function useCategories(locale: Locale) {
  return useQuery({ queryKey: categoriesKey(locale), queryFn: () => fetchCategories(locale) });
}
