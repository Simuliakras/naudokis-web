import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { BREAKPOINTS, IMAGE_SIZES, VIEWPORT_QUERIES } from "./breakpoints";

const expected = {
  xs: "22.5rem",
  sm: "35rem",
  md: "48rem",
  lg: "64rem",
  nav: "70rem",
  hero: "74.375rem",
  xl: "80rem",
} as const;

describe("responsive architecture contract", () => {
  it("keeps the TypeScript registry identical to the Tailwind theme", () => {
    expect(BREAKPOINTS).toEqual(expected);
    const css = readFileSync(new URL("../globals.css", import.meta.url), "utf8");
    for (const [name, value] of Object.entries(expected)) {
      expect(css).toContain(`--breakpoint-${name}: ${value};`);
    }
  });

  it("builds the semantic bands from the registry", () => {
    expect(VIEWPORT_QUERIES.compact).toBe("(width < 35rem)");
    expect(VIEWPORT_QUERIES.filterCompact).toBe("(width < 48rem)");
    expect(VIEWPORT_QUERIES.filterExpanded).toBe("(width >= 48rem)");
    expect(VIEWPORT_QUERIES.layerCompact).toBe("(width < 35rem), (height < 32.5rem)");
    expect(VIEWPORT_QUERIES.layerExpanded).toBe("(width >= 35rem) and (height >= 32.5rem)");
    expect(VIEWPORT_QUERIES.navExpanded).toBe("(width >= 70rem)");
  });

  // The name of the test above used to promise "adjacent half-open bands" while only
  // comparing strings — which cannot detect a gap or an overlap. Compute it instead:
  // a complementary pair must classify every probe width exactly once. A `<=`/`>=`
  // typo (double-matching at the boundary) or `<`/`>` (matching neither) fails here.
  it("tiles the width axis with no gap and no overlap", () => {
    const parse = (query: string) => {
      const match = query.match(/\(width (<|>=) ([\d.]+)rem\)/);
      if (!match) {
        throw new Error(`not a simple width band: ${query}`);
      }
      return { operator: match[1], px: Number.parseFloat(match[2]) * 16 };
    };
    const matches = (band: { operator: string; px: number }, width: number) =>
      band.operator === "<" ? width < band.px : width >= band.px;

    const pairs: [string, string][] = [
      [VIEWPORT_QUERIES.filterCompact, VIEWPORT_QUERIES.filterExpanded],
    ];
    for (const [below, atOrAbove] of pairs) {
      const low = parse(below);
      const high = parse(atOrAbove);
      expect(low.px, "a complementary pair must share one edge").toBe(high.px);
      for (const width of [low.px - 1, low.px, low.px + 1, 320, 1920]) {
        const hits = [matches(low, width), matches(high, width)].filter(Boolean).length;
        expect(hits, `exactly one band must match at ${width}px`).toBe(1);
      }
    }
  });

  it("pairs every `width <` tier with the same edge used elsewhere", () => {
    // Each tier used by a band must be a real registry value, not a near-miss like
    // 34rem that would read as intentional but silently shift a breakpoint.
    const registry = new Set(Object.values(BREAKPOINTS));
    for (const [name, query] of Object.entries(VIEWPORT_QUERIES)) {
      for (const edge of query.matchAll(/width [<>]=? ([\d.]+rem)/g)) {
        expect(registry, `${name} uses an off-registry width ${edge[1]}`).toContain(edge[1]);
      }
    }
  });

  it("keeps resource selection centralized and on range syntax", () => {
    for (const sizes of Object.values(IMAGE_SIZES)) {
      expect(sizes).not.toMatch(/(?:min|max)-width/);
    }
  });
});
