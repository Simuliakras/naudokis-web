// Locale-correct number, currency, percent and date formatting — the one place the
// site builds `Intl` formatters.
//
// Everything here used to be hand-rolled string surgery (`toFixed(2).replace(".", ",")`,
// `` `${n} €` ``), which got the decimal separator right and everything else wrong:
// no thousands grouping, an ordinary space before "€" that wraps mid-amount, and a
// US month-first date under an `en` that is not American. Intl owns all of it now.
import type { Locale } from "./locales";

// Route locales stay short and stable ("lt" / "en") because they are URL vocabulary
// and the <html lang>/hreflang value. FORMATTING locales carry the regional
// conventions the product actually uses, which is a separate decision: the English
// copy and Open Graph locale are British, so a bare "en" would silently fall back to
// US month-first dates ("July 18" for "18 July").
//
// This is deliberately NOT what `<html lang>` renders — see the note in [lang]/layout.tsx.
export const FORMAT_LOCALES = {
  lt: "lt-LT",
  en: "en-GB",
} as const satisfies Record<Locale, string>;

export function formatLocale(locale: Locale): (typeof FORMAT_LOCALES)[Locale] {
  return FORMAT_LOCALES[locale];
}

/* ---------------- Formatter cache ---------------- */

// Constructing an Intl formatter is the expensive part; formatting with one is cheap.
// These are shared per (locale, options) shape and built on first use rather than at
// module load, because this module is imported by both dictionaries — i.e. by every
// page — while any one page uses a handful of the shapes below. The calendar is the
// case that made this matter: it formats an aria-label per day cell, which was ~42
// `new Intl.DateTimeFormat` calls per render.
//
// Options objects here are always literals from this file, so a JSON key is stable.
const numberFormatters = new Map<string, Intl.NumberFormat>();
const dateFormatters = new Map<string, Intl.DateTimeFormat>();

function cached<T>(cache: Map<string, T>, locale: Locale, options: object, build: (tag: string) => T): T {
  const key = `${locale}|${JSON.stringify(options)}`;
  const hit = cache.get(key);
  if (hit) {
    return hit;
  }
  const made = build(FORMAT_LOCALES[locale]);
  cache.set(key, made);
  return made;
}

function numberFormat(locale: Locale, options: Intl.NumberFormatOptions): Intl.NumberFormat {
  return cached(numberFormatters, locale, options, (tag) => new Intl.NumberFormat(tag, options));
}

// Shared with dates.ts, which formats the same handful of shapes over and over.
export function dateFormat(locale: Locale, options: Intl.DateTimeFormatOptions): Intl.DateTimeFormat {
  return cached(dateFormatters, locale, options, (tag) => new Intl.DateTimeFormat(tag, options));
}

/* ---------------- Numbers ---------------- */

// Counts and plain quantities: "1 234,5" / "1,234.5".
export function formatNumber(value: number, locale: Locale): string {
  return numberFormat(locale, { maximumFractionDigits: 2 }).format(value);
}

// Ratings, which always show exactly one decimal: "4,0" / "4.0".
export function formatOneDecimal(value: number, locale: Locale): string {
  return numberFormat(locale, { minimumFractionDigits: 1, maximumFractionDigits: 1 }).format(value);
}

// The CLDR plural category, so the dictionaries pick a noun form from the language's
// real rule rather than an `n === 1` guess. Lithuanian uses all four (`many` is the
// fractional case, which governs the genitive singular — "1,1 atsiliepimo").
const pluralRules = new Map<Locale, Intl.PluralRules>();
export function pluralCategory(value: number, locale: Locale): Intl.LDMLPluralRule {
  let rules = pluralRules.get(locale);
  if (!rules) {
    rules = new Intl.PluralRules(FORMAT_LOCALES[locale]);
    pluralRules.set(locale, rules);
  }
  return rules.select(value);
}

/* ---------------- Currency ---------------- */

// Every price on the site is EUR. Intl places the symbol and the (non-breaking) space
// per locale — "15 €" in Lithuanian, "€15" in English — so no call site should ever
// concatenate a "€" itself.
//
// The fraction digits are the one product convention Intl does not know: a whole-euro
// price omits the decimals entirely, while an amount with cents always shows both.
function currencyFormat(cents: number, locale: Locale): Intl.NumberFormat {
  const digits = cents % 100 === 0 ? 0 : 2;
  return numberFormat(locale, {
    style: "currency",
    currency: "EUR",
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  });
}

export function formatCurrencyFromCents(cents: number, locale: Locale): string {
  return currencyFormat(cents, locale).format(cents / 100);
}

// The same, for the filter controls, which think in whole euros rather than cents.
export function formatCurrency(euros: number, locale: Locale): string {
  return formatCurrencyFromCents(Math.round(euros * 100), locale);
}

/* ---------------- Percentages ---------------- */

// Discounts arrive as percentage points (10 means ten per cent) and always read as a
// reduction, so the sign is fixed rather than derived from the value. Formatting the
// magnitude and prefixing a typographic minus keeps Intl in charge of everything
// locale-sensitive (decimal separator, the space before "%" in Lithuanian) without
// depending on which minus glyph it would have chosen.
export function formatDiscountPercent(percent: number, locale: Locale): string {
  const magnitude = numberFormat(locale, { style: "percent", maximumFractionDigits: 2 })
    .format(Math.abs(percent) / 100);
  return `−${magnitude}`;
}
