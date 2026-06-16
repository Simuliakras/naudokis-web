import { test, expect, type Page } from "@playwright/test";
import fs from "node:fs";
import path from "node:path";

// Screenshot-driven responsive sweep. Captures every real bridge-site surface at
// the full breakpoint list and asserts no horizontal overflow at any width. Runs
// against the mock data layer (see playwright.config.ts). Output PNGs land in
// e2e/__screens__/ so they can be reviewed visually.
//
// Run a subset with: yarn test:e2e responsive --grep @home

const OUT = path.join(process.cwd(), "e2e", "__screens__");

const WIDTHS = [
  320, 340, 360, 375, 390, 400, 414, 430, 480, 540, 640, 720,
  768, 820, 900, 1024, 1120, 1200, 1280, 1366, 1440,
];

type Surface = { name: string; tag: string; path: string };

const SURFACES: Surface[] = [
  { name: "home", tag: "@home", path: "/" },
  { name: "feed", tag: "@feed", path: "/skelbimai" },
  { name: "feed-search", tag: "@feed", path: "/skelbimai?q=Sony" },
  { name: "listing", tag: "@listing", path: "/skelbimai/sony-a7-iii" },
  { name: "categories", tag: "@categories", path: "/kategorijos" },
  { name: "how", tag: "@how", path: "/kaip-tai-veikia" },
  { name: "terms", tag: "@legal", path: "/naudojimo-taisykles" },
  { name: "privacy", tag: "@legal", path: "/privatumo-politika" },
  { name: "notfound", tag: "@status", path: "/this-route-does-not-exist" },
  { name: "home-en", tag: "@home", path: "/en" },
  { name: "feed-en", tag: "@feed", path: "/en/skelbimai" },
  { name: "listing-en", tag: "@listing", path: "/en/skelbimai/sony-a7-iii" },
];

fs.mkdirSync(OUT, { recursive: true });

// Scroll-driven reveals (animation-timeline: view()) leave below-the-fold content
// at opacity:0 in a fullPage capture, and reduced-motion emulation doesn't reliably
// neutralize them at render time. Force every revealed element to its final state.
const REVEAL_KILL = `
  .nk-reveal, .nk-reveal-grid > *, .nk-hero-intro > *, .nk-hero-media {
    animation: none !important;
    opacity: 1 !important;
    transform: none !important;
  }
`;

async function settle(page: Page) {
  await page.addStyleTag({ content: REVEAL_KILL });
  await page.evaluate(() => document.fonts?.ready);
}

async function overflowAt(page: Page): Promise<number> {
  return page.evaluate(() => {
    const el = document.scrollingElement || document.documentElement;
    return el.scrollWidth - el.clientWidth;
  });
}

for (const s of SURFACES) {
  test(`sweep ${s.name} ${s.tag}`, async ({ page }) => {
    test.setTimeout(180_000);
    const overflows: { width: number; px: number }[] = [];
    // Navigate once, then resize — avoids re-fetching per width (Next dev HMR keeps
    // a websocket open, so "networkidle" never settles).
    await page.goto(s.path, { waitUntil: "domcontentloaded" });
    await page.waitForLoadState("load");
    await settle(page);
    await page.waitForTimeout(600);
    for (const width of WIDTHS) {
      await page.setViewportSize({ width, height: 900 });
      await page.waitForTimeout(200);
      const px = await overflowAt(page);
      if (px > 1) {
        overflows.push({ width, px });
      }
      await page.screenshot({
        path: path.join(OUT, `${s.name}-${String(width).padStart(4, "0")}.png`),
        fullPage: true,
      });
    }
    // Report all offending widths in one assertion so the whole surface is visible.
    expect(overflows, `${s.name} horizontal overflow at: ${JSON.stringify(overflows)}`).toEqual([]);
  });
}

// Interactive states at a representative phone width (390) and tablet (768).
test("states: app-redirect modal @state", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/skelbimai/sony-a7-iii", { waitUntil: "domcontentloaded" });
  await settle(page);
  await page.locator(".nk-mbar button.nk-btn--primary").click();
  await expect(page.locator('[role="dialog"]')).toBeVisible();
  await page.waitForTimeout(350);
  await page.screenshot({ path: path.join(OUT, "state-redirect-390.png"), fullPage: false });
});

test("states: nav mobile drawer @state", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/", { waitUntil: "domcontentloaded" });
  await settle(page);
  await page.locator(".nk-nav-burger").click();
  await page.waitForTimeout(300);
  await page.screenshot({ path: path.join(OUT, "state-navdrawer-390.png"), fullPage: false });
});

// The mock listings carry no photos, so gallery tiles render as placeholders with
// no lightbox trigger — this state needs the live backend (or a photo-bearing mock).
test.skip("states: lightbox @state", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/skelbimai/sony-a7-iii", { waitUntil: "domcontentloaded" });
  await settle(page);
  await page.locator(".nk-gtile--btn").first().click();
  await page.waitForTimeout(300);
  await page.screenshot({ path: path.join(OUT, "state-lightbox-390.png"), fullPage: false });
});

test("states: legal mobile TOC drawer @state", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/naudojimo-taisykles", { waitUntil: "domcontentloaded" });
  await settle(page);
  await page.locator(".nk-lg-fab-toc").click();
  await page.waitForTimeout(300);
  await page.screenshot({ path: path.join(OUT, "state-legaldrawer-390.png"), fullPage: false });
});
