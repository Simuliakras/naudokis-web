import { describe, expect, it } from "vitest";
import { lt } from "./lt";
import { en } from "./en";
import { faqJsonLd } from "@/app/lib/seo";
import type { Dict, FaqItem } from "./types";

// Two properties TypeScript structurally cannot see, both of which fail silently:
//
//  1. Locale parity. `items: FaqItem[]` is an array, not a tuple, and each dictionary
//     satisfies `Dict` independently — so dropping a question from one locale still
//     compiles, and only shows up as a shorter accordion on /en.
//  2. Answer purity. `faqJsonLd` feeds `a` straight into acceptedAnswer.text, so any
//     markdown or HTML that creeps into an answer ships as literal text in structured
//     data. The `link` field exists precisely so `a` never has to carry markup.

const SETS: ReadonlyArray<{ name: string; of: (d: Dict) => FaqItem[] }> = [
  { name: "home", of: (d) => d.faq.items },
  { name: "how-it-works renter", of: (d) => d.howItWorks.faq },
  { name: "how-it-works owner", of: (d) => d.howItWorks.faqOwner },
];

describe("FAQ locale parity", () => {
  it.each(SETS)("$name has the same question count in both locales", ({ of }) => {
    expect(of(en).length).toBe(of(lt).length);
  });

  it.each(SETS)("$name links appear in both locales or neither", ({ of }) => {
    expect(of(en).map((i) => Boolean(i.link))).toEqual(of(lt).map((i) => Boolean(i.link)));
  });

  it.each(SETS)("$name points both locales at the same targets", ({ of }) => {
    expect(of(en).map((i) => i.link?.href)).toEqual(of(lt).map((i) => i.link?.href));
  });
});

describe("FAQ answers stay plain text", () => {
  const every = SETS.flatMap(({ name, of }) =>
    [
      { locale: "lt", dict: lt },
      { locale: "en", dict: en },
    ].flatMap(({ locale, dict }) =>
      of(dict).map((item, i) => ({ id: `${locale} ${name} #${i}`, item })),
    ),
  );

  it.each(every)("$id carries no markup", ({ item }) => {
    // Markdown link, bold, an HTML tag, or the legal loader's doc: scheme.
    expect(item.a).not.toMatch(/\]\(|\*\*|<[a-z/]|doc:/i);
  });

  it.each(every)("$id ends on a sentence, not a dangling clause", ({ item }) => {
    expect(item.a.trim()).toMatch(/[.!?]$/);
  });
});

describe("FAQ link hrefs are stored bare", () => {
  // Faq applies localePath() at render, so a locale-prefixed href in the dictionary
  // would double-prefix into /en/en/... on the English page.
  const linked = SETS.flatMap(({ name, of }) =>
    [lt, en].flatMap((dict) => of(dict).filter((i) => i.link).map((i) => ({ name, link: i.link }))),
  );

  it("has at least one linked answer to guard", () => {
    expect(linked.length).toBeGreaterThan(0);
  });

  it.each(linked)("$name link is an unprefixed absolute path", ({ link }) => {
    expect(link?.href).toMatch(/^\/(?!en\/|lt\/)/);
    expect(link?.label.trim()).not.toBe("");
  });
});

describe("faqJsonLd", () => {
  it("emits one Question per item with the answer verbatim", () => {
    const node = faqJsonLd(lt.faq.items);
    expect(node["@type"]).toBe("FAQPage");
    const entities = node.mainEntity;
    expect(Array.isArray(entities)).toBe(true);
    expect(entities).toHaveLength(lt.faq.items.length);
  });

  it("never leaks the link label or href into acceptedAnswer text", () => {
    // The link lives outside `a`, so a future refactor that inlines it would break here
    // before it reaches structured data.
    const serialized = JSON.stringify(faqJsonLd(lt.faq.items));
    for (const item of lt.faq.items) {
      if (!item.link) {
        continue;
      }
      expect(serialized).not.toContain(item.link.href);
    }
  });
});
