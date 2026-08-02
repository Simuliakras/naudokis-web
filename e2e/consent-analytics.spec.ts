import { test, expect, type Locator, type Page } from "@playwright/test";

// The analytics-consent surfaces: the site-wide banner (ConsentBanner), the footer
// privacy panel (PrivacyChoices) and the gtag Consent Mode wiring (Analytics.tsx).
//
// Runs on its OWN server — the "consent" project in playwright.config.ts, compiled
// with NEXT_PUBLIC_GA_ID. GA_ENABLED is a build-time constant, so on the default
// server every one of these surfaces renders null and a spec here would pass while
// asserting nothing. That is also why this file must not be moved into another
// project: it would silently go green.
//
// LT is the default locale and is served unprefixed, so the copy asserted below is
// the Lithuanian dictionary's.
//
// The banner's two answers do NOT share a skin any more — the accept is
// .nk-btn--primary by product decision. What is still asserted, and must stay
// asserted, is that neither answer is harder to give: same type, same target size,
// both on screen, neither preselected, and still exactly two buttons with no "X".

const BANNER = ".nk-cookiebar";
const banner = (page: Page) => page.locator(BANNER);

// The banner mounts via next/dynamic + an effect that reads the cookie, so it is not
// in the first paint. Wait for the decision, either way, rather than for a timeout.
async function bannerSettled(page: Page) {
  await page.waitForFunction(() => {
    const el = document.querySelector(".nk-cookiebar");
    return el !== null || document.cookie.includes("nk_ga_consent=");
  });
}

// The bar fades up over --nk-dur-med. Every geometry assertion below reads a bounding
// box, and a box sampled mid-entrance sits 12px low — the direction that turns
// "clears the reserve bar" into a false failure. Wait for the animation itself rather
// than a timeout; the click-driven tests need nothing, since Playwright already waits
// for box stability before it clicks.
const bannerStill = (page: Page) =>
  banner(page).evaluate(async (el) => {
    await Promise.all(el.getAnimations().map((animation) => animation.finished));
  });

// boundingBox() is nullable for anything off-layout, and every geometry assertion in
// this file is about an element that must be on screen. Throwing here names the
// missing element; the alternative — `?.x` fallbacks — turns "it never rendered" into
// a comparison against 0, which several of the assertions below would pass.
async function boxOf(locator: Locator) {
  const box = await locator.boundingBox();
  if (!box) {
    throw new Error(`expected an on-screen box for ${locator}`);
  }
  return box;
}

const overlaps = async (page: Page, a: string, b: string) => {
  const [boxA, boxB] = await Promise.all([boxOf(page.locator(a)), boxOf(page.locator(b))]);
  return !(boxA.y + boxA.height <= boxB.y || boxB.y + boxB.height <= boxA.y);
};

// Everything gtag was told, in push order. Consent Mode's contract is about that
// order (default before update), so read the queue rather than any internal.
const consentCommands = (page: Page) =>
  page.evaluate(() =>
    (Reflect.get(window, "dataLayer") as unknown[] | undefined ?? [])
      .map((entry) => Array.from(entry as ArrayLike<unknown>))
      .filter((args) => args[0] === "consent")
      .map((args) => ({ kind: args[1], flags: args[2] as Record<string, string> })),
  );

test.describe("analytics consent banner", () => {
  test("asks once, weighs both answers equally, and never returns after either", async ({ page }) => {
    await page.goto("/");
    await bannerSettled(page);
    await expect(banner(page)).toBeVisible();

    const accept = banner(page).getByRole("button", { name: "Leisti analitikos slapukus" });
    const decline = banner(page).getByRole("button", { name: "Tęsti be analitikos slapukų" });

    // The accept carries the primary skin by product decision (2026-08-01) — that
    // difference is intended and pinned here so it cannot spread by accident. What
    // stays equal is everything about REACHING either answer, which is what the rest
    // of this block asserts: same type, same target height, neither preselected.
    await expect(accept).toBeVisible();
    await expect(decline).toBeVisible();
    await expect(accept).toHaveClass(/nk-btn--primary/);
    await expect(decline).toHaveClass(/nk-btn--outline/);

    const [acceptType, declineType] = await Promise.all(
      [accept, decline].map((button) =>
        button.evaluate((el) => {
          const cs = getComputedStyle(el);
          return { fontWeight: cs.fontWeight, fontSize: cs.fontSize, fontFamily: cs.fontFamily };
        }),
      ),
    );
    expect(declineType).toEqual(acceptType);

    const [acceptBox, declineBox] = await Promise.all([boxOf(accept), boxOf(decline)]);
    expect(acceptBox.height).toBe(declineBox.height);
    // .nk-btn's min-height is var(--nk-tap); a skin change must never shrink a target.
    expect(acceptBox.height).toBeGreaterThanOrEqual(44);
    await expect(accept).not.toBeFocused();

    // There is no "X": a stored choice is the only thing that dismisses this, or it
    // would re-nag on every page.
    await expect(banner(page).getByRole("button")).toHaveCount(2);

    await decline.click();
    await expect(banner(page)).toHaveCount(0);
    expect(await page.evaluate(() => document.cookie)).toContain("nk_ga_consent=1.denied.");

    // Not just this page — the choice is what stops the asking.
    await page.goto("/kaip-tai-veikia");
    await bannerSettled(page);
    await expect(banner(page)).toHaveCount(0);
  });

  test("spans the viewport, and runs the actions inline only once there is room", async ({ page }) => {
    const geometry = async () => {
      await bannerSettled(page);
      await expect(banner(page)).toBeVisible();
      await bannerStill(page);
      const [bar, copy, actions, clientWidth] = await Promise.all([
        boxOf(banner(page)),
        boxOf(banner(page).locator(".nk-cookiebar__copy")),
        boxOf(banner(page).locator(".nk-consent-actions")),
        page.evaluate(() => document.documentElement.clientWidth),
      ]);
      return { bar, copy, actions, clientWidth };
    };

    // Full-bleed at every width — not a centred card. Measured against clientWidth
    // rather than the viewport size, since a classic scrollbar is outside the ICB the
    // fixed bar is sized by.
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto("/");
    const wide = await geometry();
    expect(wide.bar.x).toBe(0);
    expect(wide.bar.width).toBe(wide.clientWidth);
    // Above --breakpoint-nav the two sit side by side: same row, actions to the right.
    expect(wide.actions.x).toBeGreaterThan(wide.copy.x);
    expect(wide.actions.y).toBeLessThan(wide.copy.y + wide.copy.height);

    // Below it the row collapses and the actions span under the copy.
    await page.setViewportSize({ width: 1024, height: 900 });
    const narrow = await geometry();
    expect(narrow.bar.x).toBe(0);
    expect(narrow.bar.width).toBe(narrow.clientWidth);
    expect(narrow.actions.y).toBeGreaterThanOrEqual(narrow.copy.y + narrow.copy.height);
  });

  test("holds analytics_storage denied until accepted, then grants it", async ({ page }) => {
    await page.goto("/");
    await bannerSettled(page);

    const before = await consentCommands(page);
    expect(before[0]?.kind, "the first consent command must be the default").toBe("default");
    expect(before[0]?.flags.analytics_storage).toBe("denied");
    // Nothing ever grants these; the site has no advertising use case.
    expect(before[0]?.flags.ad_storage).toBe("denied");
    expect(before[0]?.flags.ad_user_data).toBe("denied");
    expect(before[0]?.flags.ad_personalization).toBe("denied");
    expect(before.some((c) => c.kind === "update" && c.flags.analytics_storage === "granted")).toBe(false);

    await banner(page).getByRole("button", { name: "Leisti analitikos slapukus" }).click();
    await expect(banner(page)).toHaveCount(0);

    const after = await consentCommands(page);
    expect(after.at(-1)).toEqual({ kind: "update", flags: { analytics_storage: "granted" } });
    // Still no ad flag was ever touched, in either direction.
    expect(after.some((c) => c.kind === "update" && "ad_storage" in c.flags)).toBe(false);
  });

  test("is not rendered on a token-bearing account-action page", async ({ page }) => {
    // Same exclusion as the GA script itself: the URL carries a single-use token
    // that authorizes a real account action (see app/lib/app-links.ts).
    await page.goto("/cancel-deletion?token=abc123");
    await expect(banner(page)).toHaveCount(0);
    await expect(page.locator("script[src*='googletagmanager']")).toHaveCount(0);
  });
});

test.describe("footer privacy panel", () => {
  const openPanel = async (page: Page) => {
    await page.getByRole("button", { name: "Privatumo nustatymai" }).click();
    const panel = page.getByRole("dialog");
    await expect(panel).toBeVisible();
    return panel;
  };

  test("each purpose is a switch that writes its own cookie immediately", async ({ page }) => {
    await page.goto("/");
    await bannerSettled(page);
    const panel = await openPanel(page);

    // role="switch", not a pressed toggle: these are settings. Three rows, but only
    // the two optional purposes are controls — "always on" is a statement of fact.
    const switches = panel.getByRole("switch");
    await expect(switches).toHaveCount(2);
    for (const state of await switches.all()) {
      await expect(state).toHaveAttribute("aria-checked", "false");
    }
    // A settings dialog must not preselect an answer — the reflex Space after it
    // opens would otherwise flip a consent state and write a cookie.
    await expect(switches.first()).not.toBeFocused();

    const analytics = switches.nth(1);
    await analytics.click();
    await expect(analytics).toHaveAttribute("aria-checked", "true");
    expect(await page.evaluate(() => document.cookie)).toContain("nk_ga_consent=1.granted.");

    // Instant, both ways — there is no Save button to forget.
    await analytics.click();
    await expect(analytics).toHaveAttribute("aria-checked", "false");
    expect(await page.evaluate(() => document.cookie)).toContain("nk_ga_consent=1.denied.");
  });

  test("withdrawing analytics deletes Google's own cookies", async ({ page }) => {
    await page.goto("/");
    await bannerSettled(page);
    await banner(page).getByRole("button", { name: "Leisti analitikos slapukus" }).click();

    // Stand in for what gtag writes once granted: the real script needs a live
    // Google endpoint, and what is under test is our deletion, not their writing.
    await page.evaluate(() => {
      document.cookie = "_ga=GA1.1.1234567890.1700000000; Path=/";
      document.cookie = "_ga_E2ETESTID0=GS1.1.1700000000; Path=/";
    });
    expect(await page.evaluate(() => document.cookie)).toContain("_ga=");

    const panel = await openPanel(page);
    await panel.getByRole("switch").nth(1).click();
    const cookies = await page.evaluate(() => document.cookie);
    expect(cookies).not.toContain("_ga=");
    expect(cookies).not.toContain("_ga_E2ETESTID0=");
  });

  test("neither state of a switch is styled as the recommended one", async ({ page }) => {
    await page.goto("/");
    await bannerSettled(page);
    const panel = await openPanel(page);
    const card = panel.locator(".nk-consent-card").nth(2);
    const state = card.locator(".nk-cswitch__state");

    const skin = (locator: typeof card) =>
      locator.evaluate((el) => {
        const cs = getComputedStyle(el);
        return { background: cs.backgroundColor, border: cs.border, boxShadow: cs.boxShadow };
      });
    const typography = () =>
      state.evaluate((el) => {
        const cs = getComputedStyle(el);
        return { fontSize: cs.fontSize, fontWeight: cs.fontWeight, color: cs.color };
      });

    const offCard = await skin(card);
    const offType = await typography();
    await card.getByRole("switch").click();
    await expect(card.getByRole("switch")).toHaveAttribute("aria-checked", "true");

    // The CARD never changes with the state, and the state word keeps identical
    // type — only the string and the track fill differ.
    expect(await skin(card)).toEqual(offCard);
    expect(await typography()).toEqual(offType);
  });
});

test.describe("the banner shares the bottom edge without covering it", () => {
  test("clears the back-to-top button on a phone", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/kaip-tai-veikia");
    await bannerSettled(page);
    await expect(banner(page)).toBeVisible();
    await bannerStill(page);

    await page.evaluate(() => window.scrollTo({ top: 2000, behavior: "instant" }));
    await expect(page.locator(".nk-backtotop")).toHaveClass(/is-on/);
    expect(await overlaps(page, BANNER, ".nk-backtotop")).toBe(false);
  });

  // The desktop half of the same contract. The clearance used to be gated behind
  // --breakpoint-cookiebar (852px), because a centred 45rem bar could not reach the
  // corner above it. A full-bleed bar reaches that corner at EVERY width, so the gate
  // was removed — and this is what proves it stayed removed.
  test("clears the back-to-top button on a desktop viewport too", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto("/kaip-tai-veikia");
    await bannerSettled(page);
    await expect(banner(page)).toBeVisible();
    await bannerStill(page);

    await page.evaluate(() => window.scrollTo({ top: 2000, behavior: "instant" }));
    await expect(page.locator(".nk-backtotop")).toHaveClass(/is-on/);
    expect(await overlaps(page, BANNER, ".nk-backtotop")).toBe(false);
  });

  // --nk-cookiebar-h's :root default is what every clearance uses on the frame before
  // the ResizeObserver publishes a real height, so it has to be >= the tallest the bar
  // ever gets. Nothing but a comment used to say so, and a 2026-08-02 copy change
  // silently pushed the bar 21px past it. Measured on the two widths that produce the
  // worst case: five lines of Lithuanian above two stacked actions.
  for (const [width, height] of [
    [390, 844],
    [360, 640],
  ]) {
    test(`the :root height default still covers the bar at ${width}×${height}`, async ({ page }) => {
      await page.setViewportSize({ width, height });
      await page.goto("/");
      await bannerSettled(page);
      await expect(banner(page)).toBeVisible();
      await bannerStill(page);

      const { measured, fallback } = await page.evaluate(() => {
        const root = document.documentElement;
        // The observer writes the live height as an inline property, which shadows the
        // :root default. Lift it to read what the first frame would have used.
        const published = root.style.getPropertyValue("--nk-cookiebar-h");
        root.style.removeProperty("--nk-cookiebar-h");
        const declared = getComputedStyle(root).getPropertyValue("--nk-cookiebar-h").trim();
        root.style.setProperty("--nk-cookiebar-h", published);
        return {
          measured: document.querySelector(".nk-cookiebar")?.getBoundingClientRect().height ?? 0,
          fallback: Number.parseFloat(declared),
        };
      });

      // A desktop browser cannot see the home-indicator inset the bar absorbs on a
      // real handset, so the default has to clear the measurement by that much. Same
      // 34px the derivation in :root spells out.
      expect(measured).toBeGreaterThan(0);
      expect(fallback, "re-derive --nk-cookiebar-h in globals.css :root").toBeGreaterThanOrEqual(measured + 34);
    });
  }

  // The regression this whole mechanism exists for: at z-index 70 over the z-60
  // reserve bar, the banner hid the Reserve CTA and its price outright — the site's
  // primary control, for every first-time mobile visitor.
  test("stacks on the listing reserve bar instead of over it", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/");
    const href = await page.locator('a.nk-stretch[href*="/skelbimai/"]').first().getAttribute("href");
    test.skip(!href, "no listing card on the homepage — the catalogue is empty");
    await page.goto(href ?? "/");
    await bannerSettled(page);

    const bar = page.locator(".nk-mbar");
    await expect(bar).toBeVisible();
    await expect(banner(page)).toBeVisible();
    await bannerStill(page);
    expect(await overlaps(page, BANNER, ".nk-mbar")).toBe(false);

    // Visible is not enough — the CTA has to be reachable, which is what an
    // overlaying fixed layer takes away. It is an <a href="/go?…"> with a click
    // handler, not a <button>: the bridge must still work without JS.
    const reserve = bar.getByRole("link").first();
    await expect(reserve).toBeVisible();
    const box = await boxOf(reserve);
    const onTop = await page.evaluate(
      ({ x, y }) => {
        const el = document.elementFromPoint(x, y);
        return el ? el.closest(".nk-mbar") !== null : false;
      },
      { x: box.x + box.width / 2, y: box.y + box.height / 2 },
    );
    expect(onTop, "the reserve CTA is the top-most element at its own centre").toBe(true);
  });
});
