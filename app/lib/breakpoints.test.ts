import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { BREAKPOINTS, IMAGE_SIZES, VIEWPORT_QUERIES } from "./breakpoints";

const expected = {
  xs: "22.5rem",
  sm: "35rem",
  md: "48rem",
  lg: "64rem",
  nav: "70rem",
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

  it("uses adjacent half-open semantic bands", () => {
    expect(VIEWPORT_QUERIES.compact).toBe("(width < 35rem)");
    expect(VIEWPORT_QUERIES.filterCompact).toBe("(width < 48rem)");
    expect(VIEWPORT_QUERIES.filterExpanded).toBe("(width >= 48rem)");
    expect(VIEWPORT_QUERIES.layerCompact).toBe("(width < 35rem), (height < 32.5rem)");
    expect(VIEWPORT_QUERIES.layerExpanded).toBe("(width >= 35rem) and (height >= 32.5rem)");
    expect(VIEWPORT_QUERIES.navExpanded).toBe("(width >= 70rem)");
  });

  it("keeps resource selection centralized and on range syntax", () => {
    for (const sizes of Object.values(IMAGE_SIZES)) {
      expect(sizes).not.toMatch(/(?:min|max)-width/);
    }
  });
});
