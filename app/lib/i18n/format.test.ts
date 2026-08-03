import { describe, expect, it } from "vitest";
import { formatFullDate, formatShortDate } from "../dates";
import { en } from "./en";
import {
  formatCurrency,
  formatCurrencyFromCents,
  formatDiscountPercent,
  formatLocale,
  formatNumber,
  formatOneDecimal,
  pluralCategory,
} from "./format";
import { lt } from "./lt";

describe("regional formatting locales", () => {
  it("maps route locales to the product's regional conventions", () => {
    expect(formatLocale("lt")).toBe("lt-LT");
    expect(formatLocale("en")).toBe("en-GB");
  });

  it("formats grouped numbers for each locale", () => {
    expect(formatNumber(1234.5, "lt")).toBe("1\u00a0234,5");
    expect(formatNumber(1234.5, "en")).toBe("1,234.5");
  });

  it("preserves one decimal for ratings", () => {
    expect(formatOneDecimal(4, "lt")).toBe("4,0");
    expect(formatOneDecimal(4, "en")).toBe("4.0");
  });

  it("formats EUR amounts with grouping, currency spacing and meaningful cents", () => {
    expect(formatCurrencyFromCents(123_400, "lt")).toBe("1\u00a0234\u00a0€");
    expect(formatCurrencyFromCents(123_450, "lt")).toBe("1\u00a0234,50\u00a0€");
    expect(formatCurrencyFromCents(123_400, "en")).toBe("€1,234");
    expect(formatCurrencyFromCents(123_450, "en")).toBe("€1,234.50");
  });

  // The filter controls think in whole euros, and both dictionaries route their price
  // labels through this so no "€" literal survives in the copy. A range prints the
  // symbol once, on the bound the locale attaches it to.
  it("places the currency symbol per locale for whole-euro filter labels", () => {
    expect(formatCurrency(10, "lt")).toBe("10 €");
    expect(formatCurrency(10, "en")).toBe("€10");
    expect(lt.feed.priceBand(10, 30)).toBe("10–30 €");
    expect(en.feed.priceBand(10, 30)).toBe("€10–30");
    expect(lt.feed.priceBand(null, null)).toBe(lt.feed.priceAny);
    expect(en.feed.priceBand(null, null)).toBe(en.feed.priceAny);
  });

  it("formats discount percentages with locale punctuation", () => {
    expect(formatDiscountPercent(10.5, "lt")).toBe("−10,5\u00a0%");
    expect(formatDiscountPercent(10.5, "en")).toBe("−10.5%");
  });

  it("uses British day-first dates on the English route", () => {
    expect(formatShortDate("2026-07-18", "en")).toBe("18 July");
    expect(formatFullDate("2026-07-18", "en")).toBe("Saturday, 18 July 2026");
  });
});

describe("plural boundaries", () => {
  it("covers Lithuanian integer and fractional CLDR categories", () => {
    expect([
      0, 1, 2, 9, 10, 11, 19, 20, 21, 22, 101, 111,
    ].map((n) => pluralCategory(n, "lt"))).toEqual([
      "other", "one", "few", "few", "other", "other", "other", "other", "one", "few", "one", "other",
    ]);
    expect(pluralCategory(1.1, "lt")).toBe("many");
  });

  it("renders the English all-reviews label in singular and plural", () => {
    expect(en.detail.reviewsInApp(1)).toBe("All 1 review in the app");
    expect(en.detail.reviewsInApp(2)).toBe("All 2 reviews in the app");
    expect(en.common.reviewCount(1234)).toBe("1,234 reviews");
  });

  it("renders Lithuanian count forms and localized fractions", () => {
    expect(lt.common.reviewCount(1)).toBe("1 atsiliepimas");
    expect(lt.common.reviewCount(2)).toBe("2 atsiliepimai");
    expect(lt.common.reviewCount(11)).toBe("11 atsiliepimų");
    expect(lt.common.reviewCount(21)).toBe("21 atsiliepimas");
    expect(lt.common.reviewCount(1.1)).toBe("1,1 atsiliepimo");
    expect(lt.common.reviewCount(1234)).toBe("1\u00a0234 atsiliepimai");
  });
});
