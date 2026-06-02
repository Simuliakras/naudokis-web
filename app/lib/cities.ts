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
