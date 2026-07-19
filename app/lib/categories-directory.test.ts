import { describe, expect, it } from "vitest";
import {
  filterDirectory,
  foldSearchText,
  groupDirectory,
  resolvePopularSubs,
  type DirectoryNode,
} from "./categories-directory";

const node = (id: string, title: string, parentId?: string): DirectoryNode => ({
  id,
  title,
  parentId,
  level: parentId ? 1 : 0,
});

// Mirrors the wire order fetchAllCategories produces: parents first, then subs,
// each slice in display_order.
const TREE: DirectoryNode[] = [
  node("tools", "Įrankiai ir statyba"),
  node("transport", "Transportas"),
  node("other", "Kita"),
  node("drills", "Gręžtuvai ir suktuvai", "tools"),
  node("saws", "Pjūklai", "tools"),
  node("ladders", "Kopėčios", "tools"),
  node("mixers", "Betono maišyklės", "tools"),
  node("welders", "Suvirinimo aparatai", "tools"),
  node("trailers", "Priekabos", "transport"),
  node("campers", "Kemperiai", "transport"),
];

const SYNONYMS: Record<string, string> = { tools: "irankiai remontas" };
const synonymsFor = (id: string) => SYNONYMS[id];

describe("foldSearchText", () => {
  it("lowercases and strips Lithuanian diacritics", () => {
    expect(foldSearchText("Gręžtuvai")).toBe("greztuvai");
    expect(foldSearchText("ŠVENTĖS")).toBe("sventes");
  });
});

describe("groupDirectory", () => {
  it("groups level-1 subs under their level-0 parent, preserving array order", () => {
    const groups = groupDirectory(TREE);
    expect(groups.map((g) => g.parent.id)).toEqual(["tools", "transport", "other"]);
    expect(groups[0].subs.map((s) => s.id)).toEqual(["drills", "saws", "ladders", "mixers", "welders"]);
  });

  it("gives a sub-less parent an empty list and drops orphan subs", () => {
    const groups = groupDirectory([...TREE, node("ghost", "Vaiduoklis", "missing_parent")]);
    expect(groups.find((g) => g.parent.id === "other")?.subs).toEqual([]);
    expect(groups.flatMap((g) => g.subs.map((s) => s.id))).not.toContain("ghost");
  });
});

describe("filterDirectory", () => {
  const groups = groupDirectory(TREE);

  it("returns everything visible with the total sub count when the query is empty", () => {
    const { groups: shown, shownSubCount } = filterDirectory({ groups, query: "  ", synonymsFor });
    expect(shown).toHaveLength(3);
    expect(shown.every((g) => g.visibleSubIds === null)).toBe(true);
    expect(shownSubCount).toBe(7);
  });

  it("shows ALL subs of a parent whose title matches", () => {
    const { groups: shown, shownSubCount } = filterDirectory({ groups, query: "transport", synonymsFor });
    expect(shown.map((g) => g.parent.id)).toEqual(["transport"]);
    expect(shown[0].visibleSubIds).toBeNull();
    expect(shownSubCount).toBe(2);
  });

  it("matches curated synonyms as a parent hit", () => {
    const { groups: shown } = filterDirectory({ groups, query: "remontas", synonymsFor });
    expect(shown.map((g) => g.parent.id)).toEqual(["tools"]);
    expect(shown[0].visibleSubIds).toBeNull();
  });

  it("narrows to matching subs when only sub names hit, keeping the full list in place", () => {
    const { groups: shown, shownSubCount } = filterDirectory({ groups, query: "pjūklai", synonymsFor });
    expect(shown.map((g) => g.parent.id)).toEqual(["tools"]);
    expect(shown[0].subs).toHaveLength(5);
    expect([...(shown[0].visibleSubIds ?? [])]).toEqual(["saws"]);
    expect(shownSubCount).toBe(1);
  });

  it("matches diacritic names from unaccented input", () => {
    // ę folds to plain e — "grezt" is what a diacritic-less typer produces.
    const { groups: shown } = filterDirectory({ groups, query: "grezt", synonymsFor });
    expect([...(shown[0].visibleSubIds ?? [])]).toEqual(["drills"]);
  });

  it("includes a sub-less parent only on a title hit", () => {
    expect(filterDirectory({ groups, query: "kita", synonymsFor }).groups.map((g) => g.parent.id)).toEqual(["other"]);
    expect(filterDirectory({ groups, query: "priekabos", synonymsFor }).groups.map((g) => g.parent.id)).toEqual(["transport"]);
  });

  it("excludes groups with no hit and sums the count across mixed hit types", () => {
    // "ai" is a parent hit on Įrankiai (all 5 subs) AND a sub hit on Kemperiai (1 of 2).
    const { groups: shown, shownSubCount } = filterDirectory({ groups, query: "ai", synonymsFor });
    expect(shown.map((g) => g.parent.id)).toEqual(["tools", "transport"]);
    expect(shown[0].visibleSubIds).toBeNull();
    expect([...(shown[1].visibleSubIds ?? [])]).toEqual(["campers"]);
    expect(shownSubCount).toBe(6);
    expect(filterDirectory({ groups, query: "zzz", synonymsFor }).groups).toEqual([]);
  });
});

describe("resolvePopularSubs", () => {
  it("resolves sub+parent pairs in curated order and skips unresolvable ids", () => {
    const pairs = resolvePopularSubs({ all: TREE, ids: ["trailers", "nope", "drills"] });
    expect(pairs.map((p) => p.sub.id)).toEqual(["trailers", "drills"]);
    expect(pairs.map((p) => p.parent.id)).toEqual(["transport", "tools"]);
  });

  it("skips a sub whose parent is missing from the wire", () => {
    const all = [...TREE, node("stray", "Be tėvo", "gone")];
    expect(resolvePopularSubs({ all, ids: ["stray"] })).toEqual([]);
  });
});
