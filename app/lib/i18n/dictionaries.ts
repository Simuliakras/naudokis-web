// Locale → dictionary lookup. Both dicts are small, so a static map is fine.
import type { Locale } from "./config";
import type { Dict } from "./types";
import { lt } from "./lt";
import { en } from "./en";

const dictionaries: Record<Locale, Dict> = { lt, en };

export function getDictionary(locale: Locale): Dict {
  return dictionaries[locale];
}
