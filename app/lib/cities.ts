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

export function cityLocativeLt(city: string): string {
  return LT_CITY_LOCATIVES[city as City] ?? city;
}
