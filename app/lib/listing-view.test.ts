import { describe, expect, it } from "vitest";
import {
  advertisedTiers,
  applicableDiscount,
  cancellationTier,
  discountTierViews,
  type Discount,
} from "./listing-view";

// 15 €/day with the canonical 3d/−10%, 7d/−20% ladder from the design handoff.
const TIERS: Discount[] = [
  { percent: 10, minDays: 3 },
  { percent: 20, minDays: 7 },
];

describe("applicableDiscount", () => {
  it("picks the biggest break the length qualifies for", () => {
    expect(applicableDiscount(TIERS, 2)).toBeUndefined();
    expect(applicableDiscount(TIERS, 3)?.percent).toBe(10);
    expect(applicableDiscount(TIERS, 6)?.percent).toBe(10);
    expect(applicableDiscount(TIERS, 7)?.percent).toBe(20);
  });

  it("breaks percent ties toward the deeper threshold, not wire order", () => {
    // The price is identical either way, but the Terms ladder highlights whichever
    // tier this returns — an 8-day rental must light the 7-day cell.
    const tied: Discount[] = [
      { percent: 10, minDays: 3 },
      { percent: 10, minDays: 7 },
    ];
    expect(applicableDiscount(tied, 8)?.minDays).toBe(7);
    expect(applicableDiscount([...tied].reverse(), 8)?.minDays).toBe(7);
    expect(applicableDiscount(tied, 5)?.minDays).toBe(3);
  });
});

// The one advertising rule behind BOTH the Terms ladder and the date picker's
// "cheaper from N days" teaser — the two surfaces must never disagree.
describe("advertisedTiers", () => {
  it("keeps only genuine longer-rental breaks, cheapest threshold first", () => {
    const tiers: Discount[] = [
      { percent: 20, minDays: 7 },
      { percent: 5, minDays: 1 }, // applies from day one — that's a price, not a break
      { percent: 0, minDays: 3 }, // inactive leftover
      { percent: 10, minDays: 3 },
    ];
    expect(advertisedTiers(tiers)).toEqual([
      { percent: 10, minDays: 3 },
      { percent: 20, minDays: 7 },
    ]);
    expect(advertisedTiers([{ percent: 5, minDays: 1 }])).toEqual([]);
  });

  it("never mutates the caller's wire-ordered array", () => {
    const tiers: Discount[] = [
      { percent: 20, minDays: 7 },
      { percent: 10, minDays: 3 },
    ];
    advertisedTiers(tiers);
    expect(tiers.map((t) => t.minDays)).toEqual([7, 3]);
  });
});

describe("discountTierViews", () => {
  it("advertises only genuine longer-rental breaks, cheapest threshold first", () => {
    const views = discountTierViews(
      [
        { percent: 20, minDays: 7 },
        { percent: 5, minDays: 1 }, // applies from day one — that's a price, not a break
        { percent: 0, minDays: 3 }, // inactive leftover
        { percent: 10, minDays: 3 },
      ],
      1500,
      "lt",
    );
    expect(views.map((v) => v.minDays)).toEqual([3, 7]);
    expect(views.map((v) => v.perDay)).toEqual(["13,50 €", "12 €"]);
  });
});

describe("cancellationTier", () => {
  it("passes known tiers through", () => {
    expect(cancellationTier("flexible")).toBe("flexible");
    expect(cancellationTier("moderate")).toBe("moderate");
    expect(cancellationTier("strict")).toBe("strict");
  });

  it("normalizes absent or unknown values to moderate (the ToU §9 default)", () => {
    expect(cancellationTier(undefined)).toBe("moderate");
    expect(cancellationTier(null)).toBe("moderate");
    expect(cancellationTier("")).toBe("moderate");
    expect(cancellationTier("firm")).toBe("moderate");
  });
});
