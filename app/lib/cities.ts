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

const LT_CITY_LOCATIVES: Record<City, string> = {
  Vilnius: "Vilniuje",
  Kaunas: "Kaune",
  Klaipėda: "Klaipėdoje",
  Šiauliai: "Šiauliuose",
  Panevėžys: "Panevėžyje",
  Alytus: "Alytuje",
  Marijampolė: "Marijampolėje",
  Palanga: "Palangoje",
};

// Standard Lithuanian locative endings for city names outside the override map
// (backend listings aren't limited to the 8 picker cities — SEO titles and
// visible H1s interpolate whatever city the wire carries). Longest-match first.
const LT_LOCATIVE_SUFFIXES: [string, string][] = [
  ["iai", "iuose"], // Šiauliai → Šiauliuose (before the shorter "ai" rule)
  ["ai", "uose"],   // Trakai → Trakuose
  ["ys", "yje"],    // Panevėžys → Panevėžyje
  ["ė", "ėje"],     // Marijampolė → Marijampolėje
  ["a", "oje"],     // Palanga → Palangoje
  ["us", "uje"],    // Alytus → Alytuje
  ["is", "yje"],    // Kupiškis → Kupiškyje
  ["as", "e"],      // Kaunas → Kaune
];

export function cityLocativeLt(city: string): string {
  const known = LT_CITY_LOCATIVES[city as City];
  if (known) {
    return known;
  }
  for (const [nom, loc] of LT_LOCATIVE_SUFFIXES) {
    if (city.length > nom.length && city.endsWith(nom)) {
      return city.slice(0, -nom.length) + loc;
    }
  }
  // No safe rule (e.g. an indeclinable or foreign name): keep the nominative
  // rather than fabricate a broken form — callers compose "… nuoma <city>".
  return city;
}
