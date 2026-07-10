import type { City } from "@/app/lib/cities";

export type ListingLandingFilters = { category?: string; subcategory?: string; city?: string };

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

const SUBCATEGORY_SLUGS: Record<string, string> = {
  power_tools: "elektriniai-irankiai",
  battery_tools: "akumuliatoriniai-irankiai",
  hand_tools: "rankiniai-irankiai",
  measuring_tools: "matavimo-prietaisai",
  ladders_scaffolding: "kopecios-pastoliai",
  concrete_masonry_tools: "betono-muro-iranga",
  construction_equipment: "statybine-technika",
  carpet_washers: "plaunami-siurbliai",
  window_cleaning_robots: "langu-valymo-robotai",
  pressure_washers: "auksto-slegio-plovimo-iranga",
  lawn_mowers: "zoliapjoves",
  aerators_scarifiers: "aeratoriai-skarifikatoriai",
  cars: "automobiliai",
  vans: "mikroautobusai",
  campers: "kemperiai",
  trailers: "priekabos",
  roof_boxes: "stogo-bagazines",
  cameras: "fotoaparatai",
  lenses: "objektyvai",
  drones: "dronai",
  stabilizers_gimbals: "stabilizatoriai-gimbalai",
  speakers: "koloneles",
  sound_systems: "garso-sistemos",
  microphones: "mikrofonai",
  projectors: "projektoriai",
  game_consoles: "zaidimu-konsoles",
  bicycles: "dviraciai",
  electric_scooters: "elektriniai-paspirtukai",
  sup_boards: "irklentes-sup",
  camping: "kempingo-iranga",
  tents_pavilions: "palapines-paviljonai",
  tables_chairs: "stalai-kedes",
  decorations: "dekoracijos",
  dresses: "sukneles",
  wedding_dresses: "vestuvines-sukneles",
  suits: "kostiumai",
  strollers: "vezimeliai",
  car_seats: "automobilines-kedutes",
  toys: "zaislai",
};

const SUBCATEGORY_IDS_BY_SLUG = Object.fromEntries(
  Object.entries(SUBCATEGORY_SLUGS).flatMap(([id, slug]) => {
    const fallback = id.replace(/_/g, "-");
    return slug === fallback ? [[slug, id]] : [[slug, id], [fallback, id]];
  }),
) as Record<string, string>;

// Common item-intent aliases that users naturally type, mapped to the closest
// backend level-1 category. They support human URLs without inventing categories.
const SUBCATEGORY_ALIASES: Record<string, string> = {
  perforatoriai: "concrete_masonry_tools",
};

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

export function subcategorySlugForId(subcategoryId: string): string {
  return SUBCATEGORY_SLUGS[subcategoryId] ?? subcategoryId.replace(/_/g, "-");
}

export function subcategoryIdFromSlug(slug: string): string | undefined {
  return SUBCATEGORY_IDS_BY_SLUG[slug] ?? SUBCATEGORY_ALIASES[slug] ?? slug.replace(/-/g, "_");
}

export function citySlugFor(city: City | string): string {
  return CITY_SLUGS[city as City] ?? city.toLowerCase();
}

export function cityFromSlug(slug: string): City | undefined {
  return CITIES_BY_SLUG[slug];
}

export function listingFilterPath(filters: ListingLandingFilters = {}): string {
  const params = new URLSearchParams();
  // The feed filters on a single category id; a subcategory is the more specific
  // filter, so it wins over its parent when both are present.
  const cat = filters.subcategory ?? filters.category;
  if (cat) {
    params.set("cat", cat);
  }
  if (filters.city) {
    params.set("city", filters.city);
  }
  const query = params.toString();
  return query ? `/skelbimai?${query}` : "/skelbimai";
}

export function listingLandingPath(filters: ListingLandingFilters = {}): string {
  if (filters.category && filters.subcategory && filters.city) {
    return `/nuoma/${categorySlugForId(filters.category)}/${subcategorySlugForId(filters.subcategory)}/${citySlugFor(filters.city)}`;
  }
  if (filters.category && filters.subcategory) {
    return `/nuoma/${categorySlugForId(filters.category)}/${subcategorySlugForId(filters.subcategory)}`;
  }
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
