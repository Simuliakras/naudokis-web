import { expect, test, type APIResponse } from "@playwright/test";

// Indexation contract for the public surfaces. These assert the head-level facts
// that have no visible symptom when they regress: a canonical pointing at the
// wrong locale, a lost hreflang cluster, a second H1, a landing that stops
// declaring itself indexable. Everything here reads the served HTML rather than
// the hydrated DOM, because that is what a crawler is given.

const ORIGIN = "https://www.naudokis.lt";

// One representative of every public page type. `canonical` is the path appended
// to the origin, so the home page is "" — Next resolves "/" against metadataBase
// to the bare origin.
//
// `alwaysIndexable` separates the two indexation regimes. Static pages must rank
// unconditionally. Landing pages are gated on live inventory
// (MIN_INDEXABLE_LISTINGS in app/lib/seo.ts), so asserting they are indexable
// would make this suite fail whenever the backend happens to be thin — the rule
// under test there is "indexable or noindex,follow, never noindex,nofollow".
const ROUTES = [
  { path: "/", canonical: "", alwaysIndexable: true },
  { path: "/en", canonical: "/en", alwaysIndexable: true },
  { path: "/skelbimai", canonical: "/skelbimai", alwaysIndexable: true },
  { path: "/kategorijos", canonical: "/kategorijos", alwaysIndexable: true },
  { path: "/en/kategorijos", canonical: "/en/kategorijos", alwaysIndexable: true },
  { path: "/kaip-tai-veikia", canonical: "/kaip-tai-veikia", alwaysIndexable: true },
  { path: "/naudojimosi-salygos", canonical: "/naudojimosi-salygos", alwaysIndexable: true },
  // Slugs come from the taxonomy the routes are built from (app/lib/landing-routes.ts).
  { path: "/nuoma/transportas", canonical: "/nuoma/transportas", alwaysIndexable: false },
  { path: "/miestai/vilnius", canonical: "/miestai/vilnius", alwaysIndexable: false },
];

const tags = (html: string, pattern: RegExp): string[] => html.match(pattern) ?? [];

const canonicalHrefs = (html: string) =>
  tags(html, /<link[^>]+rel="canonical"[^>]*>/g).map(
    (tag) => tag.match(/href="([^"]+)"/)?.[1] ?? "",
  );

// Case-insensitive on purpose: React serializes the JSX prop as `hrefLang`, and
// HTML attribute names are ASCII case-insensitive, so parsers read it correctly.
// Matching case-sensitively here would assert a spelling nothing depends on.
const alternateLangs = (html: string) =>
  tags(html, /<link[^>]+rel="alternate"[^>]*>/g)
    .map((tag) => tag.match(/hreflang="([^"]+)"/i)?.[1])
    .filter((value): value is string => Boolean(value));

// Every JSON-LD node in the document, with `@graph`-less top-level arrays flattened.
// Parsing is itself the assertion: malformed JSON-LD is silently ignored by
// consumers, so a syntax regression would otherwise never surface — hence a throw
// here rather than a filter.
function jsonLdNodes(html: string): Record<string, unknown>[] {
  const blocks = tags(html, /<script type="application\/ld\+json">([\s\S]*?)<\/script>/g).map((block) =>
    block.replace(/^<script type="application\/ld\+json">/, "").replace(/<\/script>$/, ""),
  );
  return blocks.flatMap((raw) => {
    const parsed: unknown = JSON.parse(raw);
    const nodes = Array.isArray(parsed) ? parsed : [parsed];
    return nodes.filter((node): node is Record<string, unknown> => typeof node === "object" && node !== null);
  });
}

const jsonLdTypes = (html: string) =>
  jsonLdNodes(html)
    .map((node) => node["@type"])
    .filter((type): type is string => typeof type === "string");

const nodeOfType = (html: string, type: string) =>
  jsonLdNodes(html).find((node) => node["@type"] === type);

async function htmlOf(response: APIResponse): Promise<string> {
  expect(response.status()).toBe(200);
  return response.text();
}

for (const route of ROUTES) {
  test(`${route.path} declares one canonical and a full hreflang cluster`, async ({ request }) => {
    const html = await htmlOf(await request.get(route.path));

    // Exactly one canonical, absolute, on the www origin the redirects funnel to.
    expect(canonicalHrefs(html)).toEqual([`${ORIGIN}${route.canonical}`]);

    // Both locales plus x-default. Missing x-default leaves Google to guess which
    // locale to serve an unmatched visitor.
    const langs = alternateLangs(html);
    expect(langs).toContain("lt");
    expect(langs).toContain("en");
    expect(langs).toContain("x-default");

    if (route.alwaysIndexable) {
      expect(html).not.toContain('name="robots" content="noindex');
    } else {
      // Withheld from the index only ever by the low-stock rule, which keeps
      // `follow` so the listings below still get crawled.
      expect(html).not.toContain("nofollow");
    }
  });

  test(`${route.path} settles on exactly one H1`, async ({ page }) => {
    // Asserted against the rendered DOM, not the served bytes. Streaming SSR
    // leaves the loading shell, the Suspense fallback and the resolved content
    // all in the byte stream at once, so counting <h1 in raw HTML measures the
    // streaming protocol rather than the document outline a renderer sees.
    await page.goto(route.path);
    await expect(page.locator("h1")).toHaveCount(1);
    await expect(page.locator("h1")).not.toBeEmpty();
  });
}

test("home carries the entity graph that identifies the brand and the app", async ({ request }) => {
  const types = jsonLdTypes(await htmlOf(await request.get("/")));
  expect(types).toEqual(expect.arrayContaining(["Organization", "WebSite", "SoftwareApplication", "FAQPage"]));
});

test("category and city landings describe themselves as collections", async ({ request }) => {
  for (const path of ["/nuoma/transportas", "/miestai/vilnius"]) {
    const types = jsonLdTypes(await htmlOf(await request.get(path)));
    expect(types).toContain("BreadcrumbList");
    expect(types).toContain("CollectionPage");
  }
});

// An ItemList node must not advertise listings the document does not contain.
// FeedScreen is a client component, but it server-renders, so its cards are in
// the served bytes — this asserts that and would catch a regression to a
// client-only feed, which is what would actually hollow the page out.
test("a landing's served HTML contains the listings its ItemList advertises", async ({ request }) => {
  const html = await htmlOf(await request.get("/nuoma/transportas"));
  const listNode = nodeOfType(html, "ItemList");

  // Live inventory: with nothing to list there is no ItemList node and nothing to
  // check. The assertion only binds when the backend actually returned items.
  test.skip(!listNode, "no listings on this landing right now");
  const items = (listNode?.itemListElement ?? []) as { url: string }[];
  for (const item of items) {
    expect(html).toContain(`href="${item.url.replace(ORIGIN, "")}"`);
  }
});

test("filtered and search states stay crawlable but out of the index", async ({ request }) => {
  // Free-text and filter permutations are near-duplicates of the landing they
  // filter; `follow` keeps their links flowing while `noindex` keeps them out.
  for (const path of ["/skelbimai?q=grąžtas", "/skelbimai?sort=price_asc", "/invite"]) {
    const html = await htmlOf(await request.get(path));
    expect(html).toContain('name="robots" content="noindex');
    expect(html).not.toContain('content="noindex, nofollow"');
  }
});

test("robots.txt advertises the sitemaps and withholds only non-documents", async ({ request }) => {
  const body = await (await request.get("/robots.txt")).text();
  expect(body).toContain(`Sitemap: ${ORIGIN}/sitemap.xml`);
  expect(body).toContain("Allow: /");
  expect(body).toContain("Disallow: /api/");
  expect(body).toContain("Disallow: /go");
  expect(body).toContain(`Host: ${ORIGIN}`);

  // Pages that rely on a meta-robots noindex must stay fetchable, or the
  // directive is never read.
  expect(body).not.toContain("Disallow: /skelbimai");
  expect(body).not.toContain("Disallow: /invite");
});

test("sitemap lists both locales of the home page with hreflang alternates", async ({ request }) => {
  const xml = await (await request.get("/sitemap.xml")).text();
  expect(xml).toContain("<urlset");
  expect(xml).toContain(`<loc>${ORIGIN}/</loc>`);
  expect(xml).toContain(`${ORIGIN}/en`);
  expect(xml).toContain('hreflang="x-default"');
});

test("legacy favicon and the web manifest both resolve", async ({ request }) => {
  // Modern browsers use the PNG icons, but crawlers and preview services still
  // ask for /favicon.ico by convention — it used to 404.
  const favicon = await request.get("/favicon.ico");
  expect(favicon.status()).toBe(200);
  expect((await favicon.body()).byteLength).toBeGreaterThan(0);

  const manifest = await request.get("/manifest.webmanifest");
  expect(manifest.status()).toBe(200);
  const parsed: unknown = JSON.parse(await manifest.text());
  expect(parsed).toMatchObject({ start_url: "/", display: "standalone" });
});

test("the operating entity is stated on the page, not only in structured data", async ({ page }) => {
  await page.goto("/");
  const organization = nodeOfType(await page.content(), "Organization");
  expect(organization).toBeTruthy();

  // Asserted against the FOOTER subtree, never the whole document: the JSON-LD
  // block is itself part of the HTML, so a `toContain` over the full page would
  // be satisfied by the structured data it is supposed to look past — it would
  // pass with the visible company line deleted. Scoping to <footer> (which holds
  // no ld+json) is what makes this a real cross-surface check: it fails if either
  // the footer stops rendering the entity or the two ever drift apart.
  const footer = page.locator("footer");
  await expect(footer).toContainText(String(organization?.legalName));
  await expect(footer).toContainText(String(organization?.identifier));
});
