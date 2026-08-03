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
// `alwaysIndexable` separates permanent editorial/static pages from transactional
// landings. Every category/city landing is gated on live inventory, so asserting it
// is always indexable would make the suite fail whenever the catalogue is thin; the
// rule under test there is "indexable or noindex,follow, never noindex,nofollow".
const ROUTES = [
  { path: "/", canonical: "", alwaysIndexable: true },
  { path: "/en", canonical: "/en", alwaysIndexable: true },
  { path: "/skelbimai", canonical: "/skelbimai", alwaysIndexable: true },
  // The category directory, at the head of the landing tier it indexes. The old
  // /kategorijos (and /en/categories) only 308 here now — see MOVED_PATHS.
  { path: "/nuoma", canonical: "/nuoma", alwaysIndexable: true },
  // English routes are localized end to end — segments AND taxonomy slugs.
  { path: "/en/rent", canonical: "/en/rent", alwaysIndexable: true },
  { path: "/en/listings", canonical: "/en/listings", alwaysIndexable: true },
  { path: "/en/how-it-works", canonical: "/en/how-it-works", alwaysIndexable: true },
  { path: "/en/terms-of-service", canonical: "/en/terms-of-service", alwaysIndexable: true },
  { path: "/kaip-tai-veikia", canonical: "/kaip-tai-veikia", alwaysIndexable: true },
  { path: "/naudojimosi-salygos", canonical: "/naudojimosi-salygos", alwaysIndexable: true },
  // Slugs come from the taxonomy the routes are built from (app/lib/landing-routes.ts).
  { path: "/nuoma/transportas", canonical: "/nuoma/transportas", alwaysIndexable: false },
  { path: "/miestai/vilnius", canonical: "/miestai/vilnius", alwaysIndexable: false },
  { path: "/en/rent/transport", canonical: "/en/rent/transport", alwaysIndexable: false },
  { path: "/en/cities/vilnius", canonical: "/en/cities/vilnius", alwaysIndexable: false },
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

  // The brand entity is emitted by the root layout, not by individual pages,
  // precisely so it is on all of them: nodes across the site point at these two
  // @ids (isPartOf, publisher, provider) and a reference has to resolve inside
  // the document that makes it. Regressing this by moving the graph back onto a
  // single page leaves every other URL with no identity at all.
  test(`${route.path} carries the site entity graph`, async ({ request }) => {
    const types = jsonLdTypes(await htmlOf(await request.get(route.path)));
    expect(types).toContain("Organization");
    expect(types).toContain("WebSite");
    // And exactly once — the home page used to render its own copy of both.
    expect(types.filter((t) => t === "Organization")).toHaveLength(1);
    expect(types.filter((t) => t === "WebSite")).toHaveLength(1);
  });

  test(`${route.path} settles on exactly one H1`, async ({ page }) => {
    await page.goto(route.path);
    await expect(page.locator("h1")).toHaveCount(1);
    await expect(page.locator("h1")).not.toBeEmpty();
  });

  test(`${route.path} serves its content in the HTML shell`, async ({ request }) => {
    // The catalogue routes render Chrome, whose next/dynamic children throw during
    // SSR. Any Suspense boundary above them — an in-page <Suspense>, or a
    // route-level loading.tsx, which wraps its whole segment AND every child —
    // catches that throw and streams the entire screen into a `<div hidden id="S:…">`
    // that only React's inline $RC() script reveals. The head stays correct, so the
    // only visible symptom is in the served bytes: every landing and listing led
    // with the generic "Nuomojami daiktai" skeleton heading and buried its real one.
    //
    // Hence a byte-level assertion, unlike the DOM-level H1 count above. Re-adding a
    // boundary anywhere above these screens is what this catches.
    //
    // What makes a hidden region a bug is that it CARRIES the page. An empty
    // `<div hidden id="S:…"></div>` is just React's end-of-stream marker for a
    // boundary that resolved to nothing; it appears or not depending on how the
    // response happened to flush, so asserting on its mere presence is both wrong
    // and flaky (observed on production: two markers on one fetch of /skelbimai,
    // none on the next). Match only a region with markup inside it.
    const html = await htmlOf(await request.get(route.path));
    expect(html).not.toMatch(/<div hidden id="S:\d+">(?!<\/div>)/);
    // With the bug the served bytes carried two H1s — the skeleton's, and the real
    // one sealed in the hidden region. Exactly one, given nothing is hidden, is
    // therefore the real one, in the shell.
    expect(tags(html, /<h1[\s>]/g)).toHaveLength(1);
  });
}

// The app and the FAQ are claims only the home page is entitled to make, so unlike
// the entity graph above they must NOT have spread to every route.
test("home carries the entity graph that identifies the brand and the app", async ({ request }) => {
  const types = jsonLdTypes(await htmlOf(await request.get("/")));
  expect(types).toEqual(expect.arrayContaining(["Organization", "WebSite", "SoftwareApplication", "FAQPage"]));
  expect(jsonLdTypes(await htmlOf(await request.get("/skelbimai")))).not.toContain("SoftwareApplication");
});

test("category and city landings describe themselves as collections", async ({ request }) => {
  for (const path of ["/nuoma/transportas", "/miestai/vilnius", "/en/rent/transport"]) {
    const types = jsonLdTypes(await htmlOf(await request.get(path)));
    expect(types).toContain("BreadcrumbList");
    expect(types).toContain("CollectionPage");
  }
});

// There is deliberately no LocalBusiness node anywhere on this site — the address
// in the Organization node is a registered office, not premises anyone can visit
// (see organizationJsonLd in app/lib/seo.ts). What a city landing DOES state is
// the place it covers, which is a fact about the page, not about the company.
test("city landings name the place they cover without claiming a storefront", async ({ request }) => {
  const cityHtml = await htmlOf(await request.get("/miestai/vilnius"));
  expect(nodeOfType(cityHtml, "CollectionPage")?.spatialCoverage).toMatchObject({
    "@type": "City",
    name: "Vilnius",
  });

  // A landing with no city in it makes no such claim.
  const categoryHtml = await htmlOf(await request.get("/nuoma/transportas"));
  expect(nodeOfType(categoryHtml, "CollectionPage")?.spatialCoverage).toBeUndefined();

  for (const html of [cityHtml, categoryHtml]) {
    expect(jsonLdTypes(html)).not.toContain("LocalBusiness");
  }
});

// An ItemList node must not advertise listings the document does not contain.
// FeedScreen is a client component, but it server-renders, so its cards are in
// the served bytes — this asserts that and would catch a regression to a
// client-only feed, which is what would actually hollow the page out.
test("a landing's served HTML contains the listings its ItemList advertises", async ({ request }) => {
  // Both locales: this is the check that catches a canonical/href divergence, and
  // English is where the two spellings can drift apart.
  for (const path of ["/nuoma/transportas", "/en/rent/transport"]) {
  const html = await htmlOf(await request.get(path));
  const listNode = nodeOfType(html, "ItemList");

  // Live inventory: with nothing to list there is no ItemList node and nothing to
  // check. The assertion only binds when the backend actually returned items.
  test.skip(!listNode, "no listings on this landing right now");
  const items = (listNode?.itemListElement ?? []) as { url: string }[];
  for (const item of items) {
    expect(html).toContain(`href="${item.url.replace(ORIGIN, "")}"`);
  }
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

test("the sitemap is one flat urlset with both locales of the home page", async ({ request }) => {
  // One sitemap for the whole site: a <urlset>, never a <sitemapindex>, and no
  // separate listing sitemap. Home + the hreflang cluster are config-independent.
  const xml = await (await request.get("/sitemap.xml")).text();
  expect(xml).toContain("<urlset");
  expect(xml).not.toContain("<sitemapindex");
  expect(xml).toContain(`<loc>${ORIGIN}/</loc>`);
  expect(xml).toContain(`${ORIGIN}/en`);
  expect(xml).toContain('hreflang="x-default"');
  // The old split routes must be gone, not merely unreferenced.
  expect((await request.get("/pages/sitemap.xml")).status()).toBe(404);
  expect((await request.get("/listings/sitemap/0.xml")).status()).toBe(404);
});

test("an empty taxonomy landing is noindex,follow and absent from the sitemap", async ({ request }) => {
  const [directory, sitemap] = await Promise.all([
    htmlOf(await request.get("/nuoma")),
    (await request.get("/sitemap.xml")).text(),
  ]);
  const taxonomyPaths = [...directory.matchAll(/href="(\/nuoma\/[^"?#]+)"/g)]
    .map((match) => match[1])
    .filter((path, index, all) => all.indexOf(path) === index);
  const emptyPath = taxonomyPaths.find((path) => !sitemap.includes(`<loc>${ORIGIN}${path}</loc>`));

  // Once every taxonomy page has inventory there is no empty example to assert;
  // that is a healthy catalogue state, not a failed indexation policy.
  test.skip(!emptyPath, "all taxonomy landings currently have inventory");
  const html = await htmlOf(await request.get(emptyPath!));
  expect(html).toContain('name="robots" content="noindex, follow"');
  expect(sitemap).not.toContain(`<loc>${ORIGIN}${emptyPath}</loc>`);
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
