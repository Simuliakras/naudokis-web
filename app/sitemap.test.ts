import { beforeEach, describe, expect, it, vi } from "vitest";
import type { Category } from "@/app/lib/categories";
import { LT_CITIES } from "@/app/lib/cities";

// The sitemap is the only machine-readable discovery path for the subcategory and
// subcategory × city landings — nothing on the site links to them. Its failure mode
// is a silent 200: a truncated sitemap looks exactly like a correct one.

const fetchAllCategories = vi.fn<() => Promise<Category[]>>();
const fetchListingsCount = vi.fn<(filters: { category?: string; city?: string }) => Promise<number>>();
const fetchAllListingSitemapEntries =
  vi.fn<() => Promise<{ id: string; title?: string; city?: string; images: string[] }[]>>();

vi.mock("@/app/lib/categories", () => ({
  fetchAllCategories: () => fetchAllCategories(),
}));
vi.mock("@/app/lib/listings", () => ({
  fetchListingsCount: (filters: { category?: string; city?: string }) => fetchListingsCount(filters),
}));
// The single sitemap folds in every listing. Mock the walk (it would otherwise hit
// the live catalogue); the real localizer runs, so the per-locale URL/hreflang shape
// of a listing entry is still exercised.
vi.mock("@/app/lib/listing-sitemap", async (importActual) => {
  const actual = await importActual<typeof import("@/app/lib/listing-sitemap")>();
  return {
    ...actual,
    fetchAllListingSitemapEntries: () => fetchAllListingSitemapEntries(),
  };
});

const { default: sitemap } = await import("./sitemap");

function category(id: string, parentId?: string): Category {
  return {
    id,
    parentId,
    title: id,
    level: parentId ? 1 : 0,
    icon: "Tag",
    seoTitle: id,
    seoBody: id,
    metaTitle: id,
    metaDescription: id,
  };
}

// tools_construction › power_tools is the stocked branch; `kids` is deliberately
// thin, so nothing under it should ever be probed with a city.
const TREE = [category("tools_construction"), category("power_tools", "tools_construction"), category("kids")];
const STOCKED = new Set(["tools_construction", "power_tools"]);

const ORIGIN = "https://www.naudokis.lt";

async function paths(): Promise<string[]> {
  return (await sitemap()).map((entry) => entry.url.replace(ORIGIN, ""));
}

// LT paths only (each entry is emitted once per locale).
async function ltPaths(): Promise<string[]> {
  return (await paths()).filter((path) => !path.startsWith("/en"));
}

async function enPaths(): Promise<string[]> {
  return (await paths()).filter((path) => path.startsWith("/en"));
}

beforeEach(() => {
  fetchAllCategories.mockReset();
  fetchListingsCount.mockReset();
  fetchAllListingSitemapEntries.mockReset();
  fetchAllCategories.mockResolvedValue(TREE);
  fetchListingsCount.mockImplementation(async ({ category: id }) =>
    id === undefined || STOCKED.has(id) ? 5 : 0,
  );
  fetchAllListingSitemapEntries.mockResolvedValue([]);
});

describe("sitemap landing enumeration", () => {
  it("emits the subcategory × city tier that nothing on the site links to", async () => {
    const paths = await ltPaths();
    expect(paths).toContain("/nuoma/irankiai-statyba/elektriniai-irankiai/vilnius");
    expect(paths).toContain("/nuoma/irankiai-statyba/elektriniai-irankiai");
    expect(paths).toContain("/nuoma/irankiai-statyba/kaunas");
    expect(paths).toContain("/miestai/vilnius");
  });

  it("omits landings that miss the minimum, at every tier", async () => {
    const paths = await ltPaths();
    expect(paths).not.toContain("/nuoma/vaikams");
    expect(paths.some((path) => path.startsWith("/nuoma/vaikams/"))).toBe(false);
  });

  it("never spends a city probe on a category that missed the threshold nationally", async () => {
    await ltPaths();
    const probes = fetchListingsCount.mock.calls.map(([filters]) => filters);
    // A city filter can only narrow a result set, so these would be provably empty.
    expect(probes.filter((p) => p.category === "kids" && p.city)).toEqual([]);
    // The stocked branch does get expanded across every city.
    expect(probes.filter((p) => p.category === "power_tools" && p.city)).toHaveLength(LT_CITIES.length);
  });

  it("pairs a subcategory landing with its LEAF id, not its parent's", async () => {
    await ltPaths();
    const probes = fetchListingsCount.mock.calls.map(([filters]) => filters);
    expect(probes).toContainEqual({ category: "power_tools", city: undefined });
  });
});

describe("sitemap failure handling", () => {
  it("throws rather than publishing a sitemap stripped of every category landing", async () => {
    fetchAllCategories.mockRejectedValue(new Error("backend down"));
    await expect(sitemap()).rejects.toThrow();
  });

  it("throws when every count probe fails, instead of reporting an empty marketplace", async () => {
    fetchListingsCount.mockRejectedValue(new Error("backend down"));
    await expect(sitemap()).rejects.toThrow();
  });

  it("tolerates a single failed probe by dropping only that URL", async () => {
    fetchListingsCount.mockImplementation(async ({ category: id, city }) => {
      if (id === "power_tools" && !city) {
        throw new Error("blip");
      }
      return id === undefined || STOCKED.has(id) ? 5 : 0;
    });
    const paths = await ltPaths();
    expect(paths).not.toContain("/nuoma/irankiai-statyba/elektriniai-irankiai");
    expect(paths).toContain("/nuoma/irankiai-statyba");
  });
});

// The English half of the sitemap used to be filtered out of every assertion here,
// so a completely un-localized /en block would have passed. It is the half most
// likely to be wrong: it is the only one whose URLs are a translation rather than a
// copy of the internal path.
describe("English entries are localized, not prefixed", () => {
  it("translates route segments and taxonomy slugs", async () => {
    const en = await enPaths();
    expect(en).toContain("/en/listings");
    expect(en).toContain("/en/categories");
    expect(en).toContain("/en/how-it-works");
    expect(en).toContain("/en/terms-of-service");
    expect(en).toContain("/en/rent/tools-construction/power-tools/vilnius");
    expect(en).toContain("/en/cities/vilnius");
  });

  it("never emits a Lithuanian segment under /en", async () => {
    const lithuanian = ["/en/skelbimai", "/en/kategorijos", "/en/nuoma", "/en/miestai",
      "/en/kaip-tai-veikia", "/en/naudojimosi-salygos", "/en/privatumo-politika", "/en/paskyros-trynimas"];
    for (const path of await enPaths()) {
      for (const prefix of lithuanian) {
        expect(path.startsWith(prefix), `${path} is not localized`).toBe(false);
      }
    }
  });

  it("emits one entry per locale, and the hreflang cluster matches the URLs", async () => {
    const entries = await sitemap();
    const lt = await ltPaths();
    const en = await enPaths();
    expect(en.length).toBe(lt.length);
    for (const entry of entries) {
      const languages = entry.alternates?.languages ?? {};
      // Every entry advertises the same cluster, and its own URL is in it.
      expect(Object.values(languages)).toContain(entry.url);
      expect(languages.en?.startsWith(`${ORIGIN}/en`)).toBe(true);
      expect(languages.lt?.startsWith(`${ORIGIN}/en`)).toBe(false);
      expect(languages["x-default"]).toBe(languages.lt);
    }
  });
});

// One flat sitemap: listings live in the same file as pages and landings, not a
// separate listing sitemap. A listing detail URL is uniquely /skelbimai/<slug>
// (the feed is the slug-less /skelbimai), so its presence per locale is the check.
describe("the single sitemap folds in listings", () => {
  it("includes each public listing, once per locale", async () => {
    fetchAllListingSitemapEntries.mockResolvedValue([{ id: "abc123", title: "Grąžtas", city: "Vilnius", images: [] }]);
    const lt = await ltPaths();
    const en = await enPaths();
    expect(lt.some((path) => path.startsWith("/skelbimai/"))).toBe(true);
    expect(en.some((path) => path.startsWith("/en/listings/"))).toBe(true);
  });
});
