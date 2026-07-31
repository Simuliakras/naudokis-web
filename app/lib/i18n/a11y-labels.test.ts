import { describe, expect, it } from "vitest";
import { en } from "./en";
import { lt } from "./lt";
import type { Dict } from "./types";

// The section heads carry elliptical actions ("Visos", "Plačiau") that lean on the
// adjacent title for their noun, so each one gets an aria-label spelling the phrase
// out. An aria-label REPLACES the accessible name, which is what makes this a
// standing hazard: a label that drops the visible word still reads correctly to a
// screen reader and still passes review, while leaving a speech-input user saying
// "click Plačiau" at a control that no longer answers to it (WCAG 2.5.3, Level A).
//
// TypeScript sees two strings. Only this sees the relationship between them.
const PAIRS: ReadonlyArray<{ name: string; of: (d: Dict) => { visible: string; accessible: string } }> = [
  { name: "categories view-all", of: (d) => ({ visible: d.categories.all, accessible: d.categories.allLabel }) },
  { name: "offers view-all", of: (d) => ({ visible: d.offers.all, accessible: d.offers.allLabel }) },
  {
    name: "how-it-works cta",
    of: (d) => ({ visible: d.homeSteps.ctaLabel, accessible: d.homeSteps.ctaLabelA11y }),
  },
];

const CASES = PAIRS.flatMap(({ name, of }) =>
  [
    { locale: "lt", dict: lt },
    { locale: "en", dict: en },
  ].map(({ locale, dict }) => ({ id: `${locale} ${name}`, ...of(dict) })),
);

describe("section-head actions satisfy Label in Name", () => {
  it.each(CASES)("$id accessible name contains its visible label", ({ visible, accessible }) => {
    expect(visible.trim()).not.toBe("");
    expect(accessible.toLocaleLowerCase()).toContain(visible.trim().toLocaleLowerCase());
  });

  it.each(CASES)("$id says more than the label alone, or it would be redundant", ({ visible, accessible }) => {
    expect(accessible.length).toBeGreaterThan(visible.length);
  });
});
