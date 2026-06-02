// Category data layer — fetch top-level categories from the Naudokis backend.
import { useQuery } from "@tanstack/react-query";
import type { Locale } from "./i18n/config";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL ?? "https://api-dev.naudokis.lt";

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
  tint: string;
};

// Tint palette ported from the original hardcoded categories — cycled by position.
const TINTS = ["#3a3450", "#23404a", "#4a3a23", "#234a37", "#3f2c44", "#2c3550"];

async function fetchCategories(locale: Locale): Promise<Category[]> {
  const res = await fetch(`${API_BASE}/listings/categories`);
  if (!res.ok) {
    throw new Error(`Failed to load categories: ${res.status}`);
  }
  const body: CategoriesResponse = await res.json();
  return body.data.categories
    .filter((c) => c.level === 0 && c.visibility === "public")
    .sort((a, b) => a.display_order - b.display_order)
    .map((c, i) => ({ id: c.id, title: locale === "en" ? c.name_en : c.name_lt, tint: TINTS[i % TINTS.length] }));
}

export function useCategories(locale: Locale) {
  return useQuery({ queryKey: ["categories", locale], queryFn: () => fetchCategories(locale) });
}
