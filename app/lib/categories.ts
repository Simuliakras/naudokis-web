// Category data layer — fetch top-level categories from the Naudokis backend.
import { useQuery } from "@tanstack/react-query";
import type { IconName } from "@/app/components/ui";
import type { Locale } from "./i18n/config";
import { API_BASE, USE_MOCK } from "./api";
import { MOCK_CATEGORIES } from "./mock-data";
import { categoryGlyph } from "./category-style";

/* ---------------- Backend shapes ---------------- */
type ApiCategory = {
  id: string;
  name_lt: string;
  name_en: string;
  icon_name: string;
  icon_library: string;
  level: number;
  display_order: number;
  supply_type: string;
  visibility: string;
  attributes: unknown[];
};

type CategoriesResponse = {
  success: boolean;
  data: { categories: ApiCategory[] };
};

/* ---------------- View model ---------------- */
export type Category = {
  id: string;
  title: string;
  icon: IconName; // resolved from the wire's icon_name (Tag fallback)
};

// Single source of truth for the query key — used by useCategories() and by
// server components prefetching into the same cache slot, so they can't diverge.
export function categoriesKey(locale: Locale) {
  return ["categories", locale] as const;
}

export function fallbackCategories(locale: Locale): Category[] {
  return MOCK_CATEGORIES.map((c) => ({
    id: c.id,
    title: locale === "en" ? c.name_en : c.name_lt,
    icon: categoryGlyph(c.icon_name),
  }));
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
    .filter((c) => c.level === 0 && c.visibility === "public")
    .sort((a, b) => a.display_order - b.display_order)
    .map((c) => ({ id: c.id, title: locale === "en" ? c.name_en : c.name_lt, icon: categoryGlyph(c.icon_name) }));
}

export function useCategories(locale: Locale) {
  return useQuery({ queryKey: categoriesKey(locale), queryFn: () => fetchCategories(locale) });
}
