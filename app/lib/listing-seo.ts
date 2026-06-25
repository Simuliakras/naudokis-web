// Server-side metadata fetch for a single listing — the raw fields the <title>,
// description and Product JSON-LD need (the full view model lives in listings.ts).
// Kept out of the page component so generateMetadata/Page stay thin.
import type { Locale } from "@/app/lib/i18n/config";
import { API_BASE, USE_MOCK } from "@/app/lib/api";
import { LISTING_REVALIDATE } from "@/app/lib/listings";
import { MOCK_CATEGORIES, MOCK_DETAIL_EXTRA, MOCK_LISTINGS } from "@/app/lib/mock-data";

export type ListingMeta = {
  title: string;
  description: string;
  city: string;
  categoryNames: string[];
  image?: string;
  priceCents: number;
  ratingAverage: number | null;
  ratingCount: number;
  itemCondition?: string;
};

// Only the raw backend fields this fetch reads. Typed so res.json() doesn't leak
// `any` into the meta mapping.
type RawListing = {
  title?: string;
  description?: string;
  city?: string | null;
  category_names?: { lt?: string; en?: string }[];
  attributes_display?: {
    id?: string;
    name_lt?: string;
    name_en?: string;
    value_label_lt?: string;
    value_label_en?: string;
  }[];
  condition?: string;
  condition_label?: string;
  condition_label_lt?: string;
  condition_label_en?: string;
  images?: { url?: string }[];
  price_per_day_cents?: number;
  rating_average?: number | null;
  rating_count?: number;
};

// Map a free-text condition label (LT or EN) to a schema.org itemCondition URL.
// Only returns a value when the text confidently matches a known bucket — never
// fabricates a condition the data doesn't support.
function schemaConditionFromValue(value?: string): string | undefined {
  const v = value?.trim().toLowerCase();
  if (!v) {
    return undefined;
  }
  if (["new", "new condition", "naujas", "nauja", "nenaudotas", "nenaudota"].some((needle) => v.includes(needle))) {
    return "https://schema.org/NewCondition";
  }
  if (["refurbished", "reconditioned", "atnaujintas", "atnaujinta", "restauruotas", "restauruota"].some((needle) => v.includes(needle))) {
    return "https://schema.org/RefurbishedCondition";
  }
  if (["damaged", "for parts", "pažeistas", "pažeista", "sugedęs", "sugedusi"].some((needle) => v.includes(needle))) {
    return "https://schema.org/DamagedCondition";
  }
  if (["used", "excellent", "good", "fair", "poor", "naudotas", "naudota", "puiki", "gera", "patenkinama", "tvarkinga"].some((needle) => v.includes(needle))) {
    return "https://schema.org/UsedCondition";
  }
  return undefined;
}

// Resolve a condition label from the listing's direct condition fields, falling
// back to a "condition" entry in the pre-formatted attributes_display list.
function conditionValue(l: RawListing, locale: Locale): string | undefined {
  const direct = locale === "en"
    ? l.condition_label_en ?? l.condition_label ?? l.condition
    : l.condition_label_lt ?? l.condition_label ?? l.condition;
  if (direct) {
    return direct;
  }
  const attr = l.attributes_display?.find((a) => {
    const id = a.id?.toLowerCase();
    const name = `${a.name_lt ?? ""} ${a.name_en ?? ""}`.toLowerCase();
    return id === "condition" || name.includes("būkl") || name.includes("condition");
  });
  return locale === "en" ? attr?.value_label_en ?? attr?.value_label_lt : attr?.value_label_lt ?? attr?.value_label_en;
}

export async function fetchListingMeta(id: string, locale: Locale): Promise<ListingMeta | null> {
  if (USE_MOCK) {
    const l = MOCK_LISTINGS.find((x) => x.id === id) ?? MOCK_LISTINGS[0];
    const cat = MOCK_CATEGORIES.find((c) => c.id === l.category);
    const condition = MOCK_DETAIL_EXTRA.attributes.find((a) => a.id === "condition");
    return {
      title: locale === "en" ? l.title_en : l.title_lt,
      description: locale === "en" ? MOCK_DETAIL_EXTRA.description_en : MOCK_DETAIL_EXTRA.description_lt,
      city: l.city,
      categoryNames: cat ? [locale === "en" ? cat.name_en : cat.name_lt] : [],
      priceCents: l.price_per_day_cents,
      ratingAverage: l.rating_average,
      ratingCount: l.rating_count,
      itemCondition: schemaConditionFromValue(locale === "en" ? condition?.value_en : condition?.value_lt),
    };
  }
  try {
    // Same URL + options as fetchListing's server call so Next memoizes them
    // into a single request (the detail page also prefetches that query).
    const res = await fetch(`${API_BASE}/listings/${id}`, { next: { revalidate: LISTING_REVALIDATE } });
    if (!res.ok) return null;
    const body: { data?: RawListing } = await res.json();
    const l = body.data;
    if (!l?.title) return null;
    return {
      title: l.title,
      description: l.description ?? "",
      city: l.city ?? "",
      categoryNames: (l.category_names ?? [])
        .map((c) => (locale === "en" ? c.en : c.lt) ?? "")
        .filter(Boolean),
      image: l.images?.[0]?.url,
      priceCents: typeof l.price_per_day_cents === "number" ? l.price_per_day_cents : 0,
      ratingAverage: typeof l.rating_average === "number" ? l.rating_average : null,
      ratingCount: typeof l.rating_count === "number" ? l.rating_count : 0,
      itemCondition: schemaConditionFromValue(conditionValue(l, locale)),
    };
  } catch {
    return null;
  }
}
