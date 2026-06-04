// Lithuanian cities — static reference data for the hero city picker and the
// listings "Miestas" filter. City names are proper nouns (not localized).
// The empty-string value means "all cities" (no `city` filter sent to the backend).
export const LT_CITIES = [
  "Vilnius",
  "Kaunas",
  "Klaipėda",
  "Šiauliai",
  "Panevėžys",
  "Alytus",
  "Marijampolė",
  "Palanga",
] as const;

export type City = (typeof LT_CITIES)[number];

// URL slug ↔ display name for the /miestai/[city] landing pages. Slugs are
// explicit (ASCII, diacritics resolved by hand) rather than transliterated, so
// e.g. "Šiauliai" → "siauliai" stays stable and reversible.
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

export function citySlug(city: City): string {
  return CITY_SLUGS[city];
}

// Resolve a URL slug back to its display name, or null for an unknown slug.
export function cityFromSlug(slug: string): City | null {
  const entry = LT_CITIES.find((c) => CITY_SLUGS[c] === slug);
  return entry ?? null;
}
