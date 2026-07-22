import { expect, test } from "@playwright/test";

test("unknown routes are hard 404s and stay out of the index", async ({ request }) => {
  const response = await request.get("/definitely-not-a-real-route");
  expect(response.status()).toBe(404);
  expect(await response.text()).toContain('name="robots" content="noindex');
});

// The consent cookie /go reads (see app/lib/consent.ts): "<version>.<choice>.<unix>".
// Ages are relative to now, so an "expired" cookie stays expired as the clock moves.
const POLICY_VERSION = 1;
const DAY = 24 * 60 * 60;

function consentHeader({ version = POLICY_VERSION, choice = "granted", ageDays = 0 } = {}) {
  const madeAt = Math.floor(Date.now() / 1000) - ageDays * DAY;
  return { Cookie: `nk_attr_consent=${version}.${choice}.${madeAt}` };
}
const grantedNow = () => consentHeader();

test("smart install rejects external targets and never attributes without consent", async ({ request }) => {
  const response = await request.get(
    "/go?target=https%3A%2F%2Fevil.example%2Fphish&utm_source=paid-social&utm_medium=cpc&utm_campaign=summer",
    { maxRedirects: 0 },
  );
  expect(response.status()).toBe(302);
  const location = response.headers().location;
  expect(location).toBeTruthy();
  expect(location).not.toContain("evil.example");
  // No stored choice → the click must not reach the attribution processor at all.
  expect(location).not.toContain("link.naudokis.lt");
  expect(response.headers()["cache-control"]).toContain("no-store");
});

// Fail closed: anything that isn't a current, explicit opt-in goes straight to the
// store. A silent "granted" here would hand AppsFlyer a click nobody agreed to.
const REFUSED_CONSENT = {
  "a refusal": consentHeader({ choice: "denied" }),
  "a stale policy version": consentHeader({ version: POLICY_VERSION - 1 }),
  "a malformed value": { Cookie: "nk_attr_consent=garbage" },
  "an expired choice": consentHeader({ ageDays: 365 }),
};

for (const [name, headers] of Object.entries(REFUSED_CONSENT)) {
  test(`smart install does not attribute with ${name}`, async ({ request }) => {
    const response = await request.get("/go?utm_source=paid-social", { maxRedirects: 0, headers });
    expect(response.status()).toBe(302);
    expect(response.headers().location).not.toContain("link.naudokis.lt");
  });
}

test("smart install maps campaign context onto OneLink once consent is granted", async ({ request }) => {
  const response = await request.get(
    "/go?target=https%3A%2F%2Fevil.example%2Fphish&utm_source=paid-social&utm_medium=cpc&utm_campaign=summer",
    { maxRedirects: 0, headers: grantedNow() },
  );
  expect(response.status()).toBe(302);
  const location = response.headers().location ?? "";
  expect(location).not.toContain("evil.example");

  // OneLink is only configured in environments that set NEXT_PUBLIC_ONELINK_URL;
  // where it isn't, /go correctly falls back to the native store even when granted.
  test.skip(!location.startsWith("https://link.naudokis.lt/"), "OneLink not configured");
  const redirect = new URL(location);
  expect(redirect.searchParams.get("pid")).toBe("paid-social");
  expect(redirect.searchParams.get("c")).toBe("summer");
  expect(redirect.searchParams.get("af_channel")).toBe("cpc");
});

// Transactional ids must never reach AppsFlyer, even from a visitor who opted in:
// only the public listing path is a permitted deferred deep-link target.
test("smart install refuses to forward transactional targets to AppsFlyer", async ({ request }) => {
  const bookingId = "3f0b8b5e-1c2d-4e3f-8a9b-0c1d2e3f4a5b";
  const response = await request.get(`/go?target=%2Fbooking-request%2F${bookingId}`, {
    maxRedirects: 0,
    headers: grantedNow(),
  });
  expect(response.status()).toBe(302);
  expect(response.headers().location).not.toContain(bookingId);
});

// The 404 boundary renders the full site chrome, footer included — so every client
// leaf in it (the footer now carries the privacy-choices dialog) must survive there.
// A throw in any of them turns a clean 404 into a global-error page.
test("an unknown locale segment 404s cleanly rather than crashing the boundary", async ({ page }) => {
  const response = await page.goto("/xx/whatever");
  expect(response?.status()).toBe(404);
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  await expect(page.getByText("Application error")).toHaveCount(0);
});

/* ---------------- Install-attribution consent ---------------- */

// The prompt is mounted via next/dynamic, so a click can land before it exists.
// askConsent() fails closed in that window; wait it out rather than test the race.
const consentReady = (page: import("@playwright/test").Page) =>
  page.waitForFunction(() => Reflect.get(window, "__nkConsentReady") === true);
const bridgeReady = (page: import("@playwright/test").Page) =>
  page.waitForFunction(() => Reflect.get(window, "__nkBridgeReady") === true);

test("an install CTA asks for the choice, and dismissing aborts without storing one", async ({ page }) => {
  await page.goto("/invite?code=ABCD2345");
  await consentReady(page);
  await page.getByRole("button", { name: "Atsisiųsti programėlę" }).first().click();

  const prompt = page.getByRole("dialog");
  await expect(prompt).toBeVisible();
  // Neither choice may be preselected or dominant — refusing must be as easy as allowing.
  const allow = prompt.getByRole("button", { name: "Leisti „AppsFlyer“ matavimą" });
  const decline = prompt.getByRole("button", { name: "Tęsti be „AppsFlyer“ matavimo" });
  await expect(allow).toBeVisible();
  await expect(decline).toBeVisible();
  await expect(allow).not.toBeFocused();

  await page.keyboard.press("Escape");
  await expect(prompt).toBeHidden();
  // A dismissal is not a refusal: nothing is stored, and the install does not proceed.
  await expect(page).toHaveURL(/\/invite\?code=ABCD2345$/);
  expect(await page.evaluate(() => document.cookie)).not.toContain("nk_attr_consent");
});

// Withdrawing in the footer panel stores an explicit refusal, so the very next
// install click must go straight through instead of asking all over again.
test("a stored refusal is not asked again on the next install click", async ({ page }) => {
  await page.goto("/invite?code=ABCD2345");
  await consentReady(page);
  await page.evaluate(
    (cookie) => { document.cookie = cookie; },
    `nk_attr_consent=1.denied.${Math.floor(Date.now() / 1000)}; Path=/`,
  );

  await page.getByRole("button", { name: "Atsisiųsti programėlę" }).first().click();
  // If the prompt had opened, we would still be sitting on /invite.
  await page.waitForURL((url) => !url.pathname.startsWith("/invite"));
  await expect(page.getByRole("dialog")).toHaveCount(0);
});

// The prompt opens ON TOP of the bridge modal, so both layers are live at once.
// Escape must reach only the top one, the page must stay scroll-locked underneath,
// and Tab must not wander into the modal behind the prompt.
test("the consent prompt stacks over the bridge modal without dismissing it", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 }); // the smart link is mobile-only
  await page.goto("/");
  await consentReady(page);
  await bridgeReady(page);
  // The documented bridge contract (see ui.tsx openRedirect / NK_REDIRECT_EVENT).
  await page.evaluate(() =>
    window.dispatchEvent(new CustomEvent("nk:redirect", { detail: { title: "Test", body: "Test" } })),
  );

  const modal = page.locator(".nk-redirect-panel");
  await expect(modal).toBeVisible();
  await page.locator(".nk-redirect-smartlink").click();

  const prompt = page.locator(".nk-dialog-panel");
  await expect(prompt).toBeVisible();
  await expect(modal).toBeVisible();

  await page.keyboard.press("Escape");
  // Only the top layer closes. The modal underneath survives, and the ref-counted
  // scroll lock is still held by it.
  await expect(prompt).toBeHidden();
  await expect(modal).toBeVisible();
  await expect(page.locator("body")).toHaveCSS("overflow", "hidden");
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

test("retired legal hub and transaction policy routes return not found", async ({ request }) => {
  for (const path of [
    "/teisine",
    "/en/teisine",
    "/politikos/payments-fees",
    "/politikos/cancellations-refunds",
    "/politikos/deposits-damage-disputes",
    "/politikos/reservation-handover",
    "/politikos/trust-safety-support",
    "/en/politikos/payments-fees",
  ]) {
    expect((await request.get(path)).status(), path).toBe(404);
  }
});

// The counterpart to the 404 sweep above. Without this, deleting a surviving legal
// route would go unnoticed: the responsive sweep renders these paths but never
// asserts a status, and the localized 404 screen carries the same nav/footer chrome,
// so it would happily pass as a page.
//
// Requested in parallel, and marked slow: against the dev webServer each of these
// routes compiles on first hit, and six cold compiles of the (large) legal
// documents do not fit in the default 30s budget on a loaded machine.
test("the published legal documents are reachable in both locales", async ({ request }) => {
  test.slow();
  // The English legal URLs are localized ("/en/terms-of-service"). The Lithuanian
  // spellings under /en MUST keep returning 200 rather than redirecting: the old
  // site 308'd "/en/terms-of-service" to them, and a 308 is cached by clients
  // indefinitely, so redirecting back would loop inside the browser's own cache
  // where no server change can reach it. This can never become a redirect
  // assertion — see NO_REDIRECT_SEGMENTS in app/lib/i18n/route-resolution.ts.
  const paths = [
    "/naudojimosi-salygos",
    "/privatumo-politika",
    "/paskyros-trynimas",
    "/en/terms-of-service",
    "/en/privacy-policy",
    "/en/account-deletion",
    "/en/naudojimosi-salygos",
    "/en/privatumo-politika",
    "/en/paskyros-trynimas",
  ];
  const responses = await Promise.all(paths.map((path) => request.get(path)));
  responses.forEach((response, i) => {
    expect(response.status(), paths[i]).toBe(200);
  });
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

test("Web Vitals ingestion accepts bounded metrics and rejects sensitive paths", async ({ request }) => {
  const metric = {
    path: "/skelbimai",
    name: "LCP",
    value: 1234.56,
    delta: 1234.56,
    rating: "good",
    navigationType: "navigate",
  };
  const accepted = await request.post("/api/web-vitals", { data: metric });
  expect(accepted.status()).toBe(204);
  expect(accepted.headers()["cache-control"]).toContain("no-store");

  const queryLeak = await request.post("/api/web-vitals", { data: { ...metric, path: "/skelbimai?email=a@example.com" } });
  expect(queryLeak.status()).toBe(400);
  const tokenPath = await request.post("/api/web-vitals", { data: { ...metric, path: "/reset-password" } });
  expect(tokenPath.status()).toBe(400);
});

test("mobile homepage does not download the hidden desktop hero phone", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  const heroRequests: string[] = [];
  page.on("request", (request) => {
    if (decodeURIComponent(request.url()).includes("/naudokis/hero-phone.png")) heroRequests.push(request.url());
  });
  await page.goto("/");
  await page.waitForLoadState("networkidle");
  expect(heroRequests).toEqual([]);
});

// The privacy boundary: the referral bridge must render with no AppsFlyer SDK,
// pixel, script, identifier or URL — in the DOM or on the wire — until the visitor
// has made a choice. Asserted against the hydrated page, not just the server HTML,
// because the code (and any link built from it) is resolved client-side.
test("the referral bridge carries no AppsFlyer URL before a choice is made", async ({ page }) => {
  const thirdParty: string[] = [];
  page.on("request", (request) => {
    if (/link\.naudokis\.lt|onelink\.me|appsflyer/i.test(request.url())) {
      thirdParty.push(request.url());
    }
  });

  await page.goto("/invite?code=ABCD2345");
  // Referral validation is live and may confirm this fixture as invalid, in
  // which case the product deliberately hides the unusable code. Wait for the
  // invite document itself; the privacy invariant below is independent of the
  // validation outcome.
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();

  const html = await page.content();
  expect(html).not.toContain("link.naudokis.lt");
  expect(html).not.toContain("onelink.me");
  expect(html).not.toContain("appsflyer");
  expect(thirdParty).toEqual([]);
});

// Emailed app links land on a first-party page, not an interstitial that bounces
// the click onward to an attribution processor.
test("app-handoff landings render first-party and never forward to AppsFlyer", async ({ request }) => {
  const response = await request.get("/booking-request/3f0b8b5e-1c2d-4e3f-8a9b-0c1d2e3f4a5b", { maxRedirects: 0 });
  expect(response.status()).toBe(200);
  const html = await response.text();
  expect(html).toContain('name="robots" content="noindex');
  expect(html).not.toContain("link.naudokis.lt");
  expect(html).toContain('lang="lt"');
});

test("app-handoff landings honour Accept-Language without changing the URL", async ({ request }) => {
  const response = await request.get("/booking-request/3f0b8b5e-1c2d-4e3f-8a9b-0c1d2e3f4a5b", {
    maxRedirects: 0,
    headers: { "Accept-Language": "en-GB,en;q=0.9" },
  });
  expect(response.status()).toBe(200);
  expect(await response.text()).toContain('lang="en"');
});

// A real id and a made-up one must be indistinguishable, or the page becomes an
// oracle for whether someone else's booking exists.
test("app-handoff landings leak nothing about whether the id exists", async ({ request }) => {
  const [real, bogus] = await Promise.all([
    request.get("/chat/3f0b8b5e-1c2d-4e3f-8a9b-0c1d2e3f4a5b"),
    request.get("/chat/00000000-0000-4000-8000-000000000000"),
  ]);
  expect(real.status()).toBe(bogus.status());
  const strip = (html: string) => html
    .replace(/[0-9a-f-]{36}/gi, "<id>")
    // Next 16.2.10 emits a per-response RSC request id in development. It is
    // transport noise, not route data, and must not make this privacy assertion
    // compare two otherwise identical handoff documents as different.
    .replace(/self\.__next_r="[^"]+"/g, 'self.__next_r="<request>"');
  expect(strip(await real.text())).toBe(strip(await bogus.text()));
});

test("the retired deep-link interstitial is gone", async ({ request }) => {
  expect((await request.get("/deep-link.html")).status()).toBe(404);
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
