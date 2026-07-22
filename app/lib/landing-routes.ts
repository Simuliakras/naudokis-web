import { LT_CITIES, type City } from "@/app/lib/cities";
import { defaultLocale, locales, type Locale } from "@/app/lib/i18n/locales";

export type ListingLandingFilters = { category?: string; subcategory?: string; city?: string };

// Backend taxonomy ids are already English ("tools_construction", "wedding_dresses"),
// so the English slug is just the de-underscored id for every category and every
// subcategory in the taxonomy today — there is no hand-authored English table, and
// nothing to keep translated as the taxonomy grows.
//
// The per-locale maps below are therefore OVERRIDES on top of that mechanical form:
// Lithuanian overrides every id (the mechanical form would be English), English
// overrides only whatever the mechanical form gets wrong — currently nothing.
const mechanicalSlug = (id: string) => id.replace(/_/g, "-");
const mechanicalId = (slug: string) => slug.replace(/-/g, "_");

const CATEGORY_SLUGS: Record<Locale, Record<string, string>> = {
  lt: {
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
  },
  en: {},
};

const SUBCATEGORY_SLUGS: Record<Locale, Record<string, string>> = {
  lt: {
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
  },
  en: {},
};

// Common item-intent aliases that users naturally type, mapped to the closest
// backend level-1 category. They support human URLs without inventing categories,
// and they resolve as `alias` — i.e. they 308 to the canonical slug rather than
// serving a second copy of the page.
const SUBCATEGORY_ALIASES: Record<string, string> = {
  perforatoriai: "concrete_masonry_tools",
};

/* ---------------- Slug ↔ id, per locale ---------------- */

// How a requested slug relates to the canonical slug for its locale:
//   exact   — the canonical slug of a known id. Serve it.
//   derived — an id absent from every table (a category the backend added after this
//             file was last touched). Its mechanical slug IS canonical. Serve it:
//             forward-compatibility matters more than a curated slug.
//   alias   — a real id reached by a non-canonical spelling: the other locale's slug,
//             or a hand-curated intent alias. Redirect (308) to the canonical form,
//             so no URL ever serves a duplicate of another.
export type SlugMatch = "exact" | "derived" | "alias";
export type SlugResolution = { id: string; match: SlugMatch };

type SlugTables = Record<Locale, Record<string, string>>;

function knownIds(tables: SlugTables): Set<string> {
  return new Set(locales.flatMap((locale) => Object.keys(tables[locale])));
}

function slugForId(tables: SlugTables, id: string, locale: Locale): string {
  return tables[locale][id] ?? mechanicalSlug(id);
}

// slug → id, per locale, over the full known-id universe (so English gets an index
// even though its override table is empty).
function slugIndex(tables: SlugTables): Record<Locale, Record<string, string>> {
  const ids = [...knownIds(tables)];
  const forLocale = (locale: Locale) =>
    Object.fromEntries(ids.map((id) => [slugForId(tables, id, locale), id]));
  // Spelled out per locale rather than folded over `locales`, so adding a locale is
  // a compile error here instead of a silently empty index.
  return { lt: forLocale("lt"), en: forLocale("en") };
}

const CATEGORY_INDEX = slugIndex(CATEGORY_SLUGS);
const SUBCATEGORY_INDEX = slugIndex(SUBCATEGORY_SLUGS);
const CATEGORY_IDS = knownIds(CATEGORY_SLUGS);
const SUBCATEGORY_IDS = knownIds(SUBCATEGORY_SLUGS);

// The `match` verdict is derived from a single round-trip check rather than from
// case analysis over where the id was found. That makes the property the callers
// actually depend on — "a non-canonical URL never serves a 200" — true by
// construction: `match !== "alias"` iff the slug already equals its canonical form.
function resolveSlug({
  tables, index, ids, slug, locale, aliases,
}: {
  tables: SlugTables;
  index: Record<Locale, Record<string, string>>;
  ids: Set<string>;
  slug: string;
  locale: Locale;
  aliases?: Record<string, string>;
}): SlugResolution {
  const otherLocale = locales.find((l) => l !== locale && index[l][slug]);
  const id =
    index[locale][slug] ??
    (otherLocale ? index[otherLocale][slug] : undefined) ??
    aliases?.[slug] ??
    mechanicalId(slug);
  const canonical = slugForId(tables, id, locale);
  if (canonical !== slug) {
    return { id, match: "alias" };
  }
  return { id, match: ids.has(id) ? "exact" : "derived" };
}

// The curated-slug universe. Exported so the URL tests can assert the invariants the
// routing layer leans on exhaustively rather than over a hand-picked sample: every
// slug round-trips, and no Lithuanian slug collides with an English one (which is
// what makes `internalizeRoute` idempotent — see i18n/routes.ts).
export const CURATED_CATEGORY_IDS: readonly string[] = [...CATEGORY_IDS];
export const CURATED_SUBCATEGORY_IDS: readonly string[] = [...SUBCATEGORY_IDS];

export function categorySlugForId(categoryId: string, locale: Locale): string {
  return slugForId(CATEGORY_SLUGS, categoryId, locale);
}

export function resolveCategorySlug(slug: string, locale: Locale): SlugResolution {
  return resolveSlug({ tables: CATEGORY_SLUGS, index: CATEGORY_INDEX, ids: CATEGORY_IDS, slug, locale });
}

export function subcategorySlugForId(subcategoryId: string, locale: Locale): string {
  return slugForId(SUBCATEGORY_SLUGS, subcategoryId, locale);
}

export function resolveSubcategorySlug(slug: string, locale: Locale): SlugResolution {
  return resolveSlug({
    tables: SUBCATEGORY_SLUGS,
    index: SUBCATEGORY_INDEX,
    ids: SUBCATEGORY_IDS,
    slug,
    locale,
    aliases: SUBCATEGORY_ALIASES,
  });
}

/* ---------------- Cities ---------------- */
// City names are proper nouns (see lib/cities.ts) — the slug is the same in every
// locale, so these take no `locale` and never produce an `alias`.

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

const CITIES_BY_SLUG: Record<string, City> = Object.fromEntries(
  LT_CITIES.map((city) => [CITY_SLUGS[city], city]),
);
// Widened view so an arbitrary wire city name can be looked up without a cast
// (`Record<City, …>` is a mapped type, so it carries an implicit index signature).
const CITY_SLUG_BY_NAME: Record<string, string> = CITY_SLUGS;

export function citySlugFor(city: City | string): string {
  return CITY_SLUG_BY_NAME[city] ?? city.toLowerCase();
}

export function cityFromSlug(slug: string): City | undefined {
  return CITIES_BY_SLUG[slug];
}

/* ---------------- Path builders ---------------- */

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

// Builds the INTERNAL path — default-locale spelling throughout, which is what the
// rest of the codebase passes around (breadcrumb crumbs, canonical inputs, sitemap
// entries). `localePath` / `localizeRoute` translate it to the public per-locale URL
// at the boundary; see app/lib/i18n/routes.ts.
export function listingLandingPath(filters: ListingLandingFilters = {}): string {
  const category = filters.category ? categorySlugForId(filters.category, defaultLocale) : undefined;
  const subcategory = filters.subcategory ? subcategorySlugForId(filters.subcategory, defaultLocale) : undefined;
  const city = filters.city ? citySlugFor(filters.city) : undefined;
  if (category && subcategory && city) {
    return `/nuoma/${category}/${subcategory}/${city}`;
  }
  if (category && subcategory) {
    return `/nuoma/${category}/${subcategory}`;
  }
  if (category && city) {
    return `/nuoma/${category}/${city}`;
  }
  if (category) {
    return `/nuoma/${category}`;
  }
  if (city) {
    return `/miestai/${city}`;
  }
  return "/skelbimai";
}
