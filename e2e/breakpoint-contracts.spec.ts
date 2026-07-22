import { expect, test } from "@playwright/test";
import { BREAKPOINTS, VIEWPORT_QUERIES } from "../app/lib/breakpoints";

const breakpointPixels = Object.values(BREAKPOINTS).map((value) => Number.parseFloat(value) * 16);
// Derived, never literal: hardcoded 559/560/561 would keep passing while silently
// probing the wrong edges if a token ever moved.
const px = (token: keyof typeof BREAKPOINTS) => Number.parseFloat(BREAKPOINTS[token]) * 16;
const SM = px("sm");
const MD = px("md");
const NAV = px("nav");
const around = (edge: number) => [edge - 1, edge, edge + 1];

test("viewport tiers have no gap or overlap", async ({ page }) => {
  await page.goto("/this-route-does-not-exist", { waitUntil: "domcontentloaded" });
  for (const value of Object.values(BREAKPOINTS)) {
    const pixels = Number.parseFloat(value) * 16;
    for (const width of [pixels - 1, pixels, pixels + 1]) {
      await page.setViewportSize({ width, height: 900 });
      const state = await page.evaluate((threshold) => ({
        below: matchMedia(`(width < ${threshold})`).matches,
        atOrAbove: matchMedia(`(width >= ${threshold})`).matches,
      }), value);
      expect(Number(state.below) + Number(state.atOrAbove), `${value} at ${width}px`).toBe(1);
    }
  }
});

test("all canonical boundaries reflow without horizontal overflow", async ({ page }) => {
  await page.goto("/this-route-does-not-exist", { waitUntil: "domcontentloaded" });
  for (const breakpoint of breakpointPixels) {
    for (const width of [breakpoint - 1, breakpoint, breakpoint + 1]) {
      await page.setViewportSize({ width, height: 900 });
      const overflow = await page.evaluate(() => {
        const root = document.scrollingElement ?? document.documentElement;
        return root.scrollWidth - root.clientWidth;
      });
      expect(overflow, `overflow at ${width}px`).toBeLessThanOrEqual(1);
    }
  }
});

test("home hero phone stays contained and clear of search", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  const widths = [...around(SM), ...around(MD), 772, 804, 911, 998, 1060, 1083, 1110, 1222, 1372];
  for (const path of ["/", "/en"]) {
    await page.goto(path, { waitUntil: "load" });
    await page.evaluate(() => document.fonts?.ready);

    for (const width of widths) {
      await page.setViewportSize({ width, height: 1237 });
      const geometry = await page.evaluate(() => {
        const rect = (selector: string) => {
          const element = document.querySelector(selector);
          if (!element) return null;
          const { left, top, right, bottom, width, height } = element.getBoundingClientRect();
          return { left, top, right, bottom, width, height };
        };
        const panel = rect(".nk-hero-panel");
        const intro = rect(".nk-hero-intro");
        const media = rect(".nk-hero-media");
        const phone = rect(".nk-hero-phone");
        const search = rect(".nk-search");
        return {
          panel,
          intro,
          media,
          phone,
          search,
          mediaDisplay: getComputedStyle(document.querySelector(".nk-hero-media")!).display,
        };
      });

      const viewport = `${path} at ${width}px`;
      expect(geometry.panel, `hero panel on ${viewport}`).not.toBeNull();
      expect(geometry.intro, `hero intro on ${viewport}`).not.toBeNull();
      expect(geometry.search, `hero search on ${viewport}`).not.toBeNull();
      if (width < SM) {
        expect(geometry.mediaDisplay, `hero media visibility on ${viewport}`).toBe("none");
        continue;
      }

      const panel = geometry.panel!;
      const intro = geometry.intro!;
      const media = geometry.media!;
      const phone = geometry.phone!;
      const search = geometry.search!;
      const tolerance = 1;

      expect(phone.left, `phone/card left edge on ${viewport}`).toBeGreaterThanOrEqual(panel.left - tolerance);
      expect(phone.top, `phone/card top edge on ${viewport}`).toBeGreaterThanOrEqual(panel.top - tolerance);
      expect(phone.right, `phone/card right edge on ${viewport}`).toBeLessThanOrEqual(panel.right + tolerance);
      expect(phone.bottom, `phone/card bottom edge on ${viewport}`).toBeLessThanOrEqual(panel.bottom + tolerance);
      expect(search.left, `search/intro left edge on ${viewport}`).toBeGreaterThanOrEqual(intro.left - tolerance);
      expect(search.right, `search/intro right edge on ${viewport}`).toBeLessThanOrEqual(intro.right + tolerance);

      const isTwoColumn = media.left >= intro.right - tolerance && Math.abs(media.top - intro.top) <= tolerance;
      if (isTwoColumn) {
        expect(phone.left - search.right, `phone/search clearance on ${viewport}`).toBeGreaterThanOrEqual(16);
      }

      const intersectionWidth = Math.min(phone.right, search.right) - Math.max(phone.left, search.left);
      const intersectionHeight = Math.min(phone.bottom, search.bottom) - Math.max(phone.top, search.top);
      expect(
        intersectionWidth <= tolerance || intersectionHeight <= tolerance,
        `phone overlaps search on ${viewport} (${intersectionWidth.toFixed(1)}×${intersectionHeight.toFixed(1)}px)`,
      ).toBe(true);
    }
  }
});

test("navigation drawer closes at nav and restores visible focus", async ({ page }) => {
  await page.setViewportSize({ width: NAV - 1, height: 900 });
  await page.goto("/", { waitUntil: "domcontentloaded" });
  await page.waitForFunction(() => (window as Window & { __nkNavReady?: boolean }).__nkNavReady === true);
  // The install CTA stays in the bar at every width — it is the site's single
  // conversion action and must never retreat behind the burger. Below nav it only
  // sheds its label, so the SHORT one is showing here and the full one is not.
  await expect(page.locator(".nk-nav-cta")).toBeVisible();
  await expect(page.locator(".nk-nav-cta__short")).toBeVisible();
  await expect(page.locator(".nk-nav-cta__full")).toBeHidden();
  await page.locator(".nk-nav-burger").click();
  await expect(page.locator(".nk-nav-drawer")).toHaveClass(/open/);
  await page.setViewportSize({ width: NAV, height: 900 });
  await expect(page.locator(".nk-nav-drawer")).not.toHaveClass(/open/);
  await expect(page.locator(".nk-nav-cta__full")).toBeVisible();
  await expect(page.locator(".nk-nav-cta__short")).toBeHidden();
  await expect(page.locator(".nk-nav-burger")).toBeHidden();
  await expect(page.locator("#nk-main")).toBeFocused();
});

// Phones drop the label entirely: icon-only square, but still present and named.
test("install CTA survives the compact collapse as an icon-only control", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/", { waitUntil: "domcontentloaded" });
  await page.waitForFunction(() => (window as Window & { __nkNavReady?: boolean }).__nkNavReady === true);
  const cta = page.locator(".nk-nav-cta");
  await expect(cta).toBeVisible();
  await expect(page.locator(".nk-nav-cta__full")).toBeHidden();
  await expect(page.locator(".nk-nav-cta__short")).toBeHidden();
  // Label gone from the screen, never from the accessibility tree.
  await expect(cta).toHaveAttribute("aria-label", /.+/);
  const box = await cta.boundingBox();
  expect(box!.width).toBeGreaterThanOrEqual(44);
  expect(box!.height).toBeGreaterThanOrEqual(44);
});

test("filter sheet closes at md and restores visible focus", async ({ page }) => {
  test.setTimeout(60_000);
  await page.setViewportSize({ width: MD - 1, height: 900 });
  await page.goto("/skelbimai", { waitUntil: "domcontentloaded" });
  await page.waitForFunction(() => (window as Window & { __nkNavReady?: boolean }).__nkNavReady === true);
  await page.locator(".nk-filters-mobilebtn").click();
  await expect(page.locator(".nk-filtersheet-scrim")).toBeVisible();
  await page.setViewportSize({ width: MD, height: 900 });
  await expect(page.locator(".nk-filtersheet-scrim")).toHaveCount(0);
  await expect(page.locator("#nk-main")).toBeFocused();
});

test("install handoff uses the compact layer on short landscape viewports", async ({ page }) => {
  test.setTimeout(60_000);
  await page.setViewportSize({ width: 900, height: 500 });
  await page.goto("/", { waitUntil: "domcontentloaded" });
  await page.waitForFunction(() => (
    (window as Window & { __nkNavReady?: boolean }).__nkNavReady === true
    && window.__nkBridgeReady === true
  ));
  await expect(page.locator(".nk-nav-cta")).toBeHidden();
  await page.locator(".nk-nav-burger").click();
  await page.locator(".nk-nav-drawer-cta").click();
  await expect(page.locator(".nk-sheet-grabzone")).toBeVisible();
  await expect(page.locator(".nk-redirect-qr")).toBeHidden();
  await page.setViewportSize({ width: 900, height: 700 });
  await expect(page.locator(".nk-sheet-grabzone")).toBeHidden();
  await expect(page.locator(".nk-redirect-qr")).toBeVisible();
});

test("semantic compact and expanded queries stay complementary", async ({ page }) => {
  await page.goto("/this-route-does-not-exist", { waitUntil: "domcontentloaded" });
  for (const width of [...around(SM), ...around(MD)]) {
    await page.setViewportSize({ width, height: 900 });
    const state = await page.evaluate((queries) => ({
      compact: matchMedia(queries.compact).matches,
      filterCompact: matchMedia(queries.filterCompact).matches,
      filterExpanded: matchMedia(queries.filterExpanded).matches,
    }), VIEWPORT_QUERIES);
    expect(Number(state.filterCompact) + Number(state.filterExpanded)).toBe(1);
    expect(state.compact).toBe(width < SM);
  }
});
