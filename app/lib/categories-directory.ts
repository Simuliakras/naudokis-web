// Kategorijos directory logic — pure grouping/filter/curation helpers for the
// all-categories page (2026-07 "Kategorijos v2" handoff). Generic over a minimal
// structural node so the unit tests don't have to fabricate SEO fields.

export type DirectoryNode = { id: string; title: string; parentId?: string; level: number };

export type DirectoryGroup<T extends DirectoryNode> = { parent: T; subs: T[] };

export type FilteredGroup<T extends DirectoryNode> = {
  parent: T;
  // ALWAYS the full sub list — SSR must emit every sub link (handoff §10);
  // visibility is expressed separately so the DOM never loses rows.
  subs: T[];
  // null = every sub visible (no term, or the parent itself matched).
  visibleSubIds: ReadonlySet<string> | null;
};

export type DirectoryFilterResult<T extends DirectoryNode> = {
  groups: FilteredGroup<T>[];
  // M in the "N kategorijos · M pogrupiai" status line.
  shownSubCount: number;
};

// Lithuanians commonly type without diacritics ("irankiai", "sventes") — fold
// both sides of every match so the filter never zero-results a list the user
// can literally see below the input.
export const foldSearchText = (s: string) =>
  s.toLowerCase().normalize("NFD").replace(/\p{Diacritic}/gu, "");

// Parents = level-0 nodes, subs matched by parentId. Array order IS the backend
// display_order (fetchAllCategories sorts level, then display_order) — never
// re-sort here, the collapsed "top 4" depends on it. Orphan subs and any
// deeper-than-level-1 nodes are dropped silently.
export function groupDirectory<T extends DirectoryNode>(all: T[]): DirectoryGroup<T>[] {
  return all
    .filter((c) => c.level === 0)
    .map((parent) => ({ parent, subs: all.filter((c) => c.parentId === parent.id) }));
}

// One term, matched per keystroke against parent title + curated synonyms + sub
// names. A parent hit shows the whole card; otherwise only the matching subs.
export function filterDirectory<T extends DirectoryNode>({
  groups,
  query,
  synonymsFor,
}: {
  groups: DirectoryGroup<T>[];
  query: string;
  synonymsFor: (id: string) => string | undefined;
}): DirectoryFilterResult<T> {
  const term = foldSearchText(query.trim());
  const result: FilteredGroup<T>[] = [];
  let shownSubCount = 0;
  for (const { parent, subs } of groups) {
    if (!term) {
      result.push({ parent, subs, visibleSubIds: null });
      shownSubCount += subs.length;
      continue;
    }
    const parentHit =
      foldSearchText(parent.title).includes(term) ||
      foldSearchText(synonymsFor(parent.id) ?? "").includes(term);
    if (parentHit) {
      result.push({ parent, subs, visibleSubIds: null });
      shownSubCount += subs.length;
      continue;
    }
    const matched = subs.filter((sub) => foldSearchText(sub.title).includes(term));
    if (matched.length > 0) {
      result.push({ parent, subs, visibleSubIds: new Set(matched.map((sub) => sub.id)) });
      shownSubCount += matched.length;
    }
  }
  return { groups: result, shownSubCount };
}

// "Populiaru dabar" curation — 8 subcategory ids from the handoff prototype,
// mapped to the real taxonomy. DRAFT selection pending marketing sign-off;
// derive from listing counts / search volume later if desired.
export const POPULAR_SUB_IDS: readonly string[] = [
  "power_tools",
  "trailers",
  "cameras",
  "sup_boards",
  "tents_pavilions",
  "lawn_mowers",
  "projectors",
  "dresses",
];

// Resolve curated ids against the live taxonomy; ids the wire doesn't carry are
// skipped so backend drift degrades the row instead of breaking it (same
// philosophy as the home shelf's HOME_SHELF_IDS fallback).
export function resolvePopularSubs<T extends DirectoryNode>({
  all,
  ids,
}: {
  all: T[];
  ids: readonly string[];
}): { sub: T; parent: T }[] {
  return ids.flatMap((id) => {
    const sub = all.find((c) => c.id === id);
    const parent = sub?.parentId ? all.find((c) => c.id === sub.parentId) : undefined;
    return sub && parent ? [{ sub, parent }] : [];
  });
}
