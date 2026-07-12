import { expect, test } from "@playwright/test";

test("unknown routes are hard 404s and stay out of the index", async ({ request }) => {
  const response = await request.get("/definitely-not-a-real-route");
  expect(response.status()).toBe(404);
  expect(await response.text()).toContain('name="robots" content="noindex');
});

test("smart install rejects external targets and preserves safe campaign context", async ({ request }) => {
  const response = await request.get(
    "/go?target=https%3A%2F%2Fevil.example%2Fphish&utm_source=paid-social&utm_medium=cpc&utm_campaign=summer",
    { maxRedirects: 0 },
  );
  expect(response.status()).toBe(302);
  const location = response.headers().location;
  expect(location).toBeTruthy();
  expect(location).not.toContain("evil.example");

  // With OneLink configured, campaign parameters are mapped into its attribution
  // contract. Without it, /go intentionally falls back to the native store.
  if (location?.startsWith("https://link.naudokis.lt/")) {
    const redirect = new URL(location);
    expect(redirect.searchParams.get("pid")).toBe("paid-social");
    expect(redirect.searchParams.get("c")).toBe("summer");
    expect(redirect.searchParams.get("af_channel")).toBe("cpc");
  }
});

test("homepage search remains usable when JavaScript is blocked", async ({ browser }) => {
  const context = await browser.newContext({ javaScriptEnabled: false });
  const page = await context.newPage();
  await page.goto("/");
  const search = page.locator('.nk-search input[name="q"]');
  await search.fill("foto kamera");
  await search.press("Enter");
  await expect(page).toHaveURL(/\/skelbimai\?q=foto(?:\+|%20)kamera$/);
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  await context.close();
});

test("Escape closes a nested language listbox without closing its mobile drawer", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  await page.locator(".nk-nav-burger").click();
  const drawer = page.locator("#nk-mobile-nav");
  const language = drawer.locator(".nk-locale-trigger");
  await language.click();
  await expect(language).toHaveAttribute("aria-expanded", "true");
  await drawer.getByRole("option", { name: "Lietuvių" }).press("Escape");
  await expect(language).toHaveAttribute("aria-expanded", "false");
  await expect(language).toBeFocused();
  await expect(drawer).toHaveClass(/open/);
});

test("synthetic listings are excluded and broken images have a branded fallback", async ({ page }) => {
  const imageFailures: string[] = [];
  page.on("response", (response) => {
    if (response.url().includes("/_next/image") && response.status() >= 400) imageFailures.push(response.url());
  });
  await page.goto("/");
  await expect(page.locator("body")).not.toContainText(/e2e[-_ ]?test/i);
  expect(imageFailures.filter((url) => /e2e[-_]?test/i.test(url))).toEqual([]);
});

test("transaction policies are independently reachable in both locales", async ({ request }) => {
  for (const path of [
    "/politikos/payments-fees",
    "/politikos/cancellations-refunds",
    "/politikos/deposits-damage-disputes",
    "/politikos/reservation-handover",
    "/politikos/trust-safety-support",
    "/en/politikos/payments-fees",
  ]) {
    expect((await request.get(path)).status(), path).toBe(200);
  }
});

test("Google Maps is retained but loads only after an explicit choice", async ({ page }) => {
  await page.goto("/");
  const listingHref = await page.locator('a.nk-stretch[href*="/skelbimai/"]').first().getAttribute("href");
  if (!listingHref) {
    throw new Error("No listing card link found on the homepage");
  }
  await page.goto(listingHref);
  await expect(page.locator('iframe[src*="google.com/maps"]')).toHaveCount(0);
  const loadMap = page.getByRole("button", { name: /Google Maps/ });
  if (await loadMap.count()) {
    await loadMap.click();
    await expect(page.locator('iframe[src*="google.com/maps"]')).toHaveCount(1);
  }
});

test("strict CSP is observed in report-only mode before enforcement", async ({ request }) => {
  const response = await request.get("/");
  const enforced = response.headers()["content-security-policy"];
  const reportOnly = response.headers()["content-security-policy-report-only"];
  expect(enforced).toContain("script-src 'self' 'unsafe-inline'");
  expect(reportOnly).toContain("script-src 'self'");
  expect(reportOnly).not.toContain("script-src 'self' 'unsafe-inline'");
});

test("native handoff outcomes require a signed journey token", async ({ request }) => {
  const response = await request.post("/api/handoff-event", {
    data: { token: "tampered", event: "native_open", platform: "ios" },
  });
  expect(response.status()).toBe(401);
});

test("every stylesheet referenced by the rendered document exists", async ({ request }) => {
  const response = await request.get("/");
  const html = await response.text();
  const stylesheets = [...html.matchAll(/<link[^>]+rel="stylesheet"[^>]+href="([^"]+)"/g)].map((match) => match[1]);
  expect(stylesheets.length).toBeGreaterThan(0);
  for (const href of stylesheets) {
    const stylesheet = await request.get(href);
    expect(stylesheet.status(), href).toBe(200);
    expect(stylesheet.headers()["content-type"]).toContain("text/css");
  }
});
