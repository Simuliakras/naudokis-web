import type { City } from "@/app/lib/cities";

export type ListingLandingFilters = { category?: string; city?: string };

const CATEGORY_SLUGS: Record<string, string> = {
  tools_construction: "irankiai-statyba",
  home_garden: "namai-sodas",
  transport: "transportas",
  photo_video: "foto-video",
  audio_music_events: "garsas-muzika-renginiai",
  electronics_tech: "elektronika-technologijos",
  sports_leisure: "sportas-laisvalaikis",
  events_parties: "renginiai-sventes",
  clothing_accessories: "drabuziai-aksesuarai",
  kids: "vaikams",
  health_medical: "sveikata-medicinine-iranga",
  other: "kita",
};

const CATEGORY_IDS_BY_SLUG = Object.fromEntries(
  Object.entries(CATEGORY_SLUGS).map(([id, slug]) => [slug, id]),
) as Record<string, string>;

const CITY_SLUGS: Record<City, string> = {
  Vilnius: "vilnius",
  Kaunas: "kaunas",
  Klaipėda: "klaipeda",
  Šiauliai: "siauliai",
  Panevėžys: "panevezys",
  Alytus: "alytus",
  Marijampolė: "marijampole",
  Palanga: "palanga",
};

const CITIES_BY_SLUG = Object.fromEntries(
  Object.entries(CITY_SLUGS).map(([city, slug]) => [slug, city]),
) as Record<string, City>;

export function categorySlugForId(categoryId: string): string {
  return CATEGORY_SLUGS[categoryId] ?? categoryId.replace(/_/g, "-");
}

export function categoryIdFromSlug(slug: string): string | undefined {
  return CATEGORY_IDS_BY_SLUG[slug] ?? slug.replace(/-/g, "_");
}

export function citySlugFor(city: City | string): string {
  return CITY_SLUGS[city as City] ?? city.toLowerCase();
}

export function cityFromSlug(slug: string): City | undefined {
  return CITIES_BY_SLUG[slug];
}

export function listingFilterPath(filters: ListingLandingFilters = {}): string {
  const params = new URLSearchParams();
  if (filters.category) {
    params.set("cat", filters.category);
  }
  if (filters.city) {
    params.set("city", filters.city);
  }
  const query = params.toString();
  return query ? `/skelbimai?${query}` : "/skelbimai";
}

export function listingLandingPath(filters: ListingLandingFilters = {}): string {
  if (filters.category && filters.city) {
    return `/nuoma/${categorySlugForId(filters.category)}/${citySlugFor(filters.city)}`;
  }
  if (filters.category) {
    return `/nuoma/${categorySlugForId(filters.category)}`;
  }
  if (filters.city) {
    return `/miestai/${citySlugFor(filters.city)}`;
  }
  return "/skelbimai";
}
