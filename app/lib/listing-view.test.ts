import { describe, expect, it } from "vitest";
import {
  applicableDiscount,
  cancellationNotice,
  cancellationTier,
  discountTierViews,
  rentalEstimate,
  type Discount,
} from "./listing-view";

// The booking panel's Airbnb-style breakdown leans on these exact identities:
// rent row = fullSubtotal, rentalSubtotal = full − savings, and "Iš viso" =
// total = rentalSubtotal + deposit (the app's fees never appear). 15 €/day with
// the canonical 3d/−10%, 7d/−20% ladder from the design handoff.
const TIERS: Discount[] = [
  { percent: 10, minDays: 3 },
  { percent: 20, minDays: 7 },
];

const estimate = (days: number, depositCents = 5000) =>
  rentalEstimate(
    { days, pricePerDayCents: 1500, depositCents, tiers: TIERS },
    "lt",
  );

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
    // the effective per-day rate rounds exactly like the estimate does
    expect(views.map((v) => v.perDay)).toEqual(["13,50 €", "12 €"]);
  });
});

describe("rentalEstimate", () => {
  it("computes the discounted breakdown for a 5-day rental", () => {
    const est = estimate(5);
    expect(est.fullSubtotal).toBe("75 €");
    expect(est.discount?.percent).toBe(10);
    expect(est.savings).toBe("7,50 €");
    expect(est.rentalSubtotal).toBe("67,50 €");
  });

  it("rounds the discounted SUBTOTAL; savings are its exact remainder", () => {
    // The rounding lives on rentalSubtotal, not on the savings — at a .5-cent
    // product the two formulations differ by a cent, and the rows must reconcile.
    for (const days of [1, 2, 3, 5, 7, 30]) {
      const est = estimate(days);
      const savedCents = est.fullSubtotalCents - est.rentalSubtotalCents;
      if (!est.discount) {
        expect(savedCents).toBe(0);
        expect(est.savings).toBeUndefined();
        continue;
      }
      expect(est.rentalSubtotalCents).toBe(
        Math.round(est.fullSubtotalCents * (1 - est.discount.percent / 100)),
      );
      expect(savedCents).toBeGreaterThan(0);
      expect(est.savings).toBeDefined();
    }
    // The .5-cent case in the flesh: 10,05 € × 5 d = 5 025 ¢, −10% → 4 522,5 ¢
    // rounds to 4 523 ¢, leaving 502 ¢ saved (NOT round(502,5) = 503).
    const half = rentalEstimate(
      { days: 5, pricePerDayCents: 1005, depositCents: 0, tiers: TIERS },
      "lt",
    );
    expect(half.rentalSubtotalCents).toBe(4523);
    expect(half.fullSubtotalCents - half.rentalSubtotalCents).toBe(502);
  });

  it("below the first tier there is no discount and total = full", () => {
    const est = estimate(2);
    expect(est.discount).toBeUndefined();
    expect(est.savings).toBeUndefined();
    expect(est.rentalSubtotal).toBe(est.fullSubtotal);
    expect(est.rentalSubtotal).toBe("30 €");
  });

  it("applies the deeper tier from 7 days", () => {
    const est = estimate(7);
    expect(est.discount?.percent).toBe(20);
    expect(est.fullSubtotal).toBe("105 €");
    expect(est.rentalSubtotal).toBe("84 €");
  });

  it("folds the deposit into the total but never the subtotals", () => {
    const withDeposit = estimate(5, 5000);
    const without = estimate(5, 0);
    expect(withDeposit.deposit).toBe("50 €");
    expect(without.deposit).toBeNull();
    expect(withDeposit.fullSubtotalCents).toBe(without.fullSubtotalCents);
    expect(withDeposit.rentalSubtotalCents).toBe(without.rentalSubtotalCents);
    expect(withDeposit.totalCents).toBe(withDeposit.rentalSubtotalCents + 5000);
    expect(withDeposit.total).toBe("117,50 €");
    expect(without.totalCents).toBe(without.rentalSubtotalCents);
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

// Thresholds mirror ToU §9: flexible 24 h (clock-based, so never a computed
// date), moderate full ≥5 d / 50 % at 1–4 d, strict 50 % ≥14 d. Fixed start
// date; `today` walks toward it across each boundary.
describe("cancellationNotice", () => {
  const START = "2026-08-20";
  const notice = (tier: "flexible" | "moderate" | "strict", today: string) =>
    cancellationNotice({ tier, start: START, today });

  it("flexible restates the 24 h rule while the start is still ahead", () => {
    expect(notice("flexible", "2026-07-01")).toEqual({ kind: "hours" });
    expect(notice("flexible", "2026-08-19")).toEqual({ kind: "hours" });
  });

  it("flexible: a same-day start is past the 24 h mark — nothing refunds", () => {
    expect(notice("flexible", START)).toEqual({ kind: "none" });
  });

  it("moderate: full refund up to start−5, then the 50 % window, then nothing", () => {
    expect(notice("moderate", "2026-08-15")).toEqual({
      kind: "freeUntil",
      deadline: "2026-08-15",
    });
    expect(notice("moderate", "2026-08-16")).toEqual({
      kind: "halfUntil",
      deadline: "2026-08-19",
    });
    expect(notice("moderate", "2026-08-19")).toEqual({
      kind: "halfUntil",
      deadline: "2026-08-19",
    });
    expect(notice("moderate", START)).toEqual({ kind: "none" });
  });

  it("strict: only the 50 % window, closing at start−14", () => {
    expect(notice("strict", "2026-08-06")).toEqual({
      kind: "halfUntil",
      deadline: "2026-08-06",
    });
    expect(notice("strict", "2026-08-07")).toEqual({ kind: "none" });
  });
});
