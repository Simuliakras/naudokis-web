import { describe, expect, it } from "vitest";
import {
  PRICE_CEIL,
  PRICE_FLOOR,
  clampRange,
  clampValue,
  defaultRange,
  formatPriceValue,
  isDefaultRange,
  normalizeInputs,
  parsePriceParam,
  priceBandArgs,
  priceToCents,
  serializePriceParam,
} from "./price-range";

describe("clampValue", () => {
  it("clamps below the floor and above the ceiling", () => {
    expect(clampValue(-50)).toBe(PRICE_FLOOR);
    expect(clampValue(999)).toBe(PRICE_CEIL);
  });
  it("rounds decimals to the whole-euro step", () => {
    expect(clampValue(12.4)).toBe(12);
    expect(clampValue(12.6)).toBe(13);
  });
  it("passes bounds through untouched", () => {
    expect(clampValue(PRICE_FLOOR)).toBe(PRICE_FLOOR);
    expect(clampValue(PRICE_CEIL)).toBe(PRICE_CEIL);
  });
  // NaN is the one value clamp() cannot order, so it is special-cased to the floor;
  // ±∞ order fine and clamp to the nearer bound like any out-of-range number.
  it("sends NaN to the floor and ±∞ to the nearer bound", () => {
    expect(clampValue(NaN)).toBe(PRICE_FLOOR);
    expect(clampValue(Infinity)).toBe(PRICE_CEIL);
    expect(clampValue(-Infinity)).toBe(PRICE_FLOOR);
  });
});

describe("clampRange", () => {
  it("keeps an ordered range", () => {
    expect(clampRange(10, 60)).toEqual({ min: 10, max: 60 });
  });
  it("swaps a crossed range rather than dropping a value", () => {
    expect(clampRange(150, 50)).toEqual({ min: 50, max: 150 });
  });
  it("allows an equal min and max (a single price point)", () => {
    expect(clampRange(30, 30)).toEqual({ min: 30, max: 30 });
  });
  it("clamps out-of-range ends before ordering", () => {
    expect(clampRange(-20, 900)).toEqual({ min: PRICE_FLOOR, max: PRICE_CEIL });
  });
});

describe("normalizeInputs", () => {
  it("treats empty fields as the open bounds", () => {
    expect(normalizeInputs("", "")).toEqual(defaultRange());
    expect(normalizeInputs("10", "")).toEqual({ min: 10, max: PRICE_CEIL });
    expect(normalizeInputs("", "60")).toEqual({ min: PRICE_FLOOR, max: 60 });
  });
  it("strips currency and whitespace noise", () => {
    expect(normalizeInputs("€10", "60 ")).toEqual({ min: 10, max: 60 });
    expect(normalizeInputs("10 €", "€ 60")).toEqual({ min: 10, max: 60 });
  });
  it("accepts the Lithuanian decimal comma and floors decimals", () => {
    expect(normalizeInputs("10,9", "59,2")).toEqual({ min: 10, max: 59 });
    expect(normalizeInputs("10.9", "59.2")).toEqual({ min: 10, max: 59 });
  });
  it("swaps crossed input", () => {
    expect(normalizeInputs("150", "50")).toEqual({ min: 50, max: 150 });
  });
  it("clamps out-of-range input", () => {
    expect(normalizeInputs("10", "9999")).toEqual({ min: 10, max: PRICE_CEIL });
  });
  it("ignores a stray sign and reads the digits", () => {
    expect(normalizeInputs("-5", "60")).toEqual({ min: 5, max: 60 });
  });
  it("reads unparseable text as an open bound", () => {
    expect(normalizeInputs("abc", "def")).toEqual(defaultRange());
    expect(normalizeInputs("abc", "60")).toEqual({ min: PRICE_FLOOR, max: 60 });
  });
});

describe("parsePriceParam", () => {
  it("returns null for an absent, empty or fully-open token", () => {
    expect(parsePriceParam(null)).toBeNull();
    expect(parsePriceParam(undefined)).toBeNull();
    expect(parsePriceParam("")).toBeNull();
    expect(parsePriceParam("-")).toBeNull();
    expect(parsePriceParam("0-200")).toBeNull();
  });
  it("parses both-bounded, open-max and open-min tokens", () => {
    expect(parsePriceParam("10-60")).toEqual({ min: 10, max: 60 });
    expect(parsePriceParam("10-")).toEqual({ min: 10, max: PRICE_CEIL });
    expect(parsePriceParam("-60")).toEqual({ min: PRICE_FLOOR, max: 60 });
  });
  it("rejects malformed tokens (no dash, extra dashes, non-numeric, negatives)", () => {
    expect(parsePriceParam("10")).toBeNull();
    expect(parsePriceParam("10-20-30")).toBeNull();
    expect(parsePriceParam("abc-60")).toBeNull();
    expect(parsePriceParam("-5-10")).toBeNull();
  });
  it("clamps out-of-range numeric tokens", () => {
    expect(parsePriceParam("300-500")).toEqual({ min: PRICE_CEIL, max: PRICE_CEIL });
  });
});

describe("serializePriceParam", () => {
  it("drops a fully-open range to an empty token", () => {
    expect(serializePriceParam(defaultRange())).toBe("");
  });
  it("omits an end that sits on its bound", () => {
    expect(serializePriceParam({ min: 10, max: 60 })).toBe("10-60");
    expect(serializePriceParam({ min: 10, max: PRICE_CEIL })).toBe("10-");
    expect(serializePriceParam({ min: PRICE_FLOOR, max: 60 })).toBe("-60");
  });
  it("round-trips through parsePriceParam", () => {
    for (const range of [
      { min: 10, max: 60 },
      { min: 10, max: PRICE_CEIL },
      { min: PRICE_FLOOR, max: 60 },
      { min: 35, max: 35 },
    ]) {
      expect(parsePriceParam(serializePriceParam(range))).toEqual(range);
    }
  });
});

describe("priceToCents", () => {
  it("sends inclusive cents for a bounded range", () => {
    expect(priceToCents({ min: 10, max: 60 })).toEqual({ priceMinCents: 1000, priceMaxCents: 6000 });
  });
  it("omits the open end so the backend filter stays open there", () => {
    expect(priceToCents({ min: 10, max: PRICE_CEIL })).toEqual({ priceMinCents: 1000 });
    expect(priceToCents({ min: PRICE_FLOOR, max: 60 })).toEqual({ priceMaxCents: 6000 });
    expect(priceToCents(defaultRange())).toEqual({});
  });
});

describe("priceBandArgs", () => {
  it("collapses an edge bound to null for the band label", () => {
    expect(priceBandArgs({ min: 10, max: 60 })).toEqual([10, 60]);
    expect(priceBandArgs({ min: PRICE_FLOOR, max: 60 })).toEqual([null, 60]);
    expect(priceBandArgs({ min: 10, max: PRICE_CEIL })).toEqual([10, null]);
    expect(priceBandArgs(defaultRange())).toEqual([null, null]);
  });
});

describe("isDefaultRange", () => {
  it("is true only when nothing is filtered", () => {
    expect(isDefaultRange(defaultRange())).toBe(true);
    expect(isDefaultRange({ min: 10, max: PRICE_CEIL })).toBe(false);
    expect(isDefaultRange({ min: PRICE_FLOOR, max: 60 })).toBe(false);
  });
});

describe("formatPriceValue", () => {
  it("keeps each locale's currency shape", () => {
    expect(formatPriceValue(10, "en")).toBe("€10");
    expect(formatPriceValue(10, "lt")).toBe("10 €");
  });
  it("marks the open ceiling with a trailing plus", () => {
    expect(formatPriceValue(PRICE_CEIL, "en", true)).toBe("€200+");
    expect(formatPriceValue(PRICE_CEIL, "lt", true)).toBe("200 €+");
  });
});
