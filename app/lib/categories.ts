// Category data layer — fetch top-level categories from the Naudokis backend.
import { useQuery } from "@tanstack/react-query";
import type { Locale } from "./i18n/config";
import { API_BASE } from "./api";

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
};

async function fetchCategories(locale: Locale): Promise<Category[]> {
  const res = await fetch(`${API_BASE}/listings/categories`);
  if (!res.ok) {
    throw new Error(`Failed to load categories: ${res.status}`);
  }
  const body: CategoriesResponse = await res.json();
  return body.data.categories
    .filter((c) => c.level === 0 && c.visibility === "public")
    .sort((a, b) => a.display_order - b.display_order)
    .map((c) => ({ id: c.id, title: locale === "en" ? c.name_en : c.name_lt }));
}

export function useCategories(locale: Locale) {
  return useQuery({ queryKey: ["categories", locale], queryFn: () => fetchCategories(locale) });
}
