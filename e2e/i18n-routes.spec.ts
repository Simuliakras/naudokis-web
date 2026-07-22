import { test, expect } from "@playwright/test";

// Localized public URLs, end to end. The unit tests in app/lib/i18n cover the pure
// translation; this file asserts what actually comes back over HTTP — status codes,
// single-hop redirects, and that nothing loops.
//
// `maxRedirects` is deliberately small everywhere: a routing loop should fail fast
// and loudly rather than hang the suite.

const LOCALIZED = [
  ["/skelbimai", "/en/listings"],
  ["/kategorijos", "/en/categories"],
  ["/kaip-tai-veikia", "/en/how-it-works"],
  ["/naudojimosi-salygos", "/en/terms-of-service"],
  ["/privatumo-politika", "/en/privacy-policy"],
  ["/paskyros-trynimas", "/en/account-deletion"],
  ["/nuoma/transportas", "/en/rent/transport"],
  ["/miestai/vilnius", "/en/cities/vilnius"],
];

test("every localized route resolves without a redirect @proxy", async ({ request }) => {
  test.slow();
  for (const [lt, en] of LOCALIZED) {
    for (const path of [lt, en]) {
      const response = await request.get(path, { maxRedirects: 0 });
      expect(response.status(), `${path} should be served directly`).toBe(200);
    }
  }
});

test("no route loops, including every legacy spelling @proxy", async ({ request }) => {
  test.slow();
  const paths = [
    "/", "/en", "/lt", "/lt/skelbimai",
    ...LOCALIZED.flat(),
    // legacy English URLs: Lithuanian segments and/or Lithuanian taxonomy slugs
    "/en/skelbimai", "/en/kategorijos", "/en/kaip-tai-veikia",
    "/en/nuoma/transportas", "/en/miestai/vilnius",
    "/en/rent/transportas",
    "/en/naudojimosi-salygos", "/en/privatumo-politika", "/en/paskyros-trynimas",
    // wrong-locale slug under the default locale
    "/nuoma/transport",
  ];
  for (const path of paths) {
    const response = await request.get(path, { maxRedirects: 3 });
    expect(response.status(), `${path} did not settle`).toBeLessThan(400);
  }
});

test("legacy English segments move permanently, in one hop @proxy", async ({ request }) => {
  const cases = [
    ["/en/skelbimai", "/en/listings"],
    ["/en/kategorijos", "/en/categories"],
    ["/en/kaip-tai-veikia", "/en/how-it-works"],
    ["/en/miestai/vilnius", "/en/cities/vilnius"],
  ];
  for (const [from, to] of cases) {
    const response = await request.get(from, { maxRedirects: 0 });
    expect(response.status(), from).toBe(308);
    expect(response.headers().location, from).toBe(to);
  }
});

test("a wrong-locale taxonomy slug canonicalizes to its own locale's spelling @proxy", async ({ request }) => {
  // The proxy resolves the route; the page canonicalizes the slug. Both directions.
  const en = await request.get("/en/rent/transportas", { maxRedirects: 0 });
  expect(en.status()).toBe(308);
  expect(en.headers().location).toBe("/en/rent/transport");

  const lt = await request.get("/nuoma/transport", { maxRedirects: 0 });
  expect(lt.status()).toBe(308);
  expect(lt.headers().location).toBe("/nuoma/transportas");
});

// The old site served "/en/terms-of-service" and this repo briefly 308'd it to the
// Lithuanian slug. A 308 is cached by clients forever, so making the Lithuanian form
// redirect back would loop inside the browser's own cache — unreachable from the
// server. These stay 200 and are de-duplicated by their canonical instead.
test("legacy English legal URLs stay 200 and point their canonical at the localized URL @proxy", async ({ request }) => {
  test.slow();
  const cases = [
    ["/en/naudojimosi-salygos", "/en/terms-of-service"],
    ["/en/privatumo-politika", "/en/privacy-policy"],
    ["/en/paskyros-trynimas", "/en/account-deletion"],
  ];
  for (const [legacy, canonical] of cases) {
    const response = await request.get(legacy, { maxRedirects: 0 });
    expect(response.status(), legacy).toBe(200);
    const html = await response.text();
    expect(html, legacy).toContain(`rel="canonical" href="https://www.naudokis.lt${canonical}"`);
  }
});

test("app-handoff URLs are untouched in both locales @proxy", async ({ request }) => {
  // Baked into transactional emails and the AASA claims — they must keep working
  // byte-for-byte, and must never gain a locale prefix or a translated segment.
  for (const path of ["/invite", "/my-profile", "/rewards", "/reset-password", "/verify-email"]) {
    const response = await request.get(path, { maxRedirects: 0 });
    expect(response.status(), path).toBe(200);
  }
});

test("the locale switcher offers the fully localized counterpart @proxy", async ({ page }) => {
  await page.goto("/nuoma/transportas");
  // The options are rendered only once the menu opens (see LocaleSwitcher), so the
  // hreflang tags above are the crawlable signal and this is the human one.
  await page.getByRole("button", { name: /kalba|language/i }).first().click();
  const href = await page.getByRole("option").filter({ hasText: /english/i }).first().getAttribute("href");
  expect(href).toBe("/en/rent/transport");
});

// Each locale must advertise its OWN localized URL. A cluster that points English at
// a Lithuanian path is worse than no cluster: it contradicts the page's canonical
// and Google drops the pair.
test("hreflang clusters use each locale's own localized URL @proxy", async ({ request }) => {
  for (const path of ["/nuoma/transportas", "/en/rent/transport"]) {
    const html = await (await request.get(path)).text();
    // React serializes the JSX prop as `hrefLang`, so match case-insensitively.
    const alternates = html.match(/<link[^>]+rel="alternate"[^>]*>/gi) ?? [];
    const hrefFor = (lang: string) =>
      alternates
        .find((tag) => new RegExp(`hreflang="${lang}"`, "i").test(tag))
        ?.match(/href="([^"]+)"/)?.[1];
    expect(hrefFor("lt"), path).toBe("https://www.naudokis.lt/nuoma/transportas");
    expect(hrefFor("en"), path).toBe("https://www.naudokis.lt/en/rent/transport");
    expect(hrefFor("x-default"), path).toBe("https://www.naudokis.lt/nuoma/transportas");
  }
});
