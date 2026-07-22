import { describe, expect, it } from "vitest";
import { listingBreadcrumbTrail } from "./breadcrumbs";

// The trail feeds both the BreadcrumbList JSON-LD and the visible <Breadcrumb>.
// Its failure mode is silent: a trail that stops short still renders and still
// validates as structured data, it just describes the wrong page to a crawler.

const base = { homeLabel: "Pagrindinis", feedLabel: "Skelbimai" };
const tools = { categoryTitle: "Įrankiai ir statyba", category: "tools_construction" };
const power = { subcategoryTitle: "Elektriniai įrankiai", subcategory: "power_tools" };

describe("listingBreadcrumbTrail", () => {
  it("roots every trail at home › feed", () => {
    expect(listingBreadcrumbTrail(base)).toEqual([
      { name: "Pagrindinis", path: "" },
      { name: "Skelbimai", path: "/skelbimai" },
    ]);
  });

  it("names the subcategory itself on a city-less subcategory landing", () => {
    const trail = listingBreadcrumbTrail({ ...base, ...tools, ...power });
    expect(trail.at(-1)).toEqual({
      name: "Elektriniai įrankiai",
      path: "/nuoma/irankiai-statyba/elektriniai-irankiai",
    });
  });

  it("keeps one crumb per URL segment when a city is present", () => {
    const trail = listingBreadcrumbTrail({ ...base, ...tools, ...power, city: "Vilnius" });
    expect(trail.map((c) => c.path)).toEqual([
      "",
      "/skelbimai",
      "/nuoma/irankiai-statyba",
      "/nuoma/irankiai-statyba/elektriniai-irankiai",
      "/nuoma/irankiai-statyba/elektriniai-irankiai/vilnius",
    ]);
  });

  it("skips the subcategory level on a category + city landing", () => {
    const trail = listingBreadcrumbTrail({ ...base, ...tools, city: "Kaunas" });
    expect(trail.map((c) => c.path)).toEqual([
      "",
      "/skelbimai",
      "/nuoma/irankiai-statyba",
      "/nuoma/irankiai-statyba/kaunas",
    ]);
  });

  it("points a city-only landing at /miestai", () => {
    const trail = listingBreadcrumbTrail({ ...base, city: "Klaipėda" });
    expect(trail.at(-1)).toEqual({ name: "Klaipėda", path: "/miestai/klaipeda" });
  });
});
