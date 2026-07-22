import { test, expect, type Page } from "@playwright/test";
import fs from "node:fs";
import path from "node:path";
import { BREAKPOINTS } from "../app/lib/breakpoints";

// Screenshot-driven responsive sweep. Captures every real bridge-site surface at
// the full breakpoint list and asserts no horizontal overflow at any width. Pages
// server-render live backend data (see playwright.config.ts), so the runner needs
// network access to the API. Output PNGs land in e2e/__screens__/ for review.
//
// Run a subset with: yarn test:e2e responsive --grep @home

const OUT = path.join(process.cwd(), "e2e", "__screens__");

const boundaryWidths = Object.values(BREAKPOINTS)
  .map((value) => Number.parseFloat(value) * 16)
  .flatMap((width) => [width - 1, width, width + 1]);
const WIDTHS = [...new Set([
  320, 344, 375, 390, 393, 412, 430, 480, 540, 600, 640, 700, 744,
  820, 834, 900, 980, 1112, 1180, 1200, 1366, 1440, 1536, 1728, 1920, 2560,
  ...boundaryWidths,
])].sort((a, b) => a - b);

type Surface = { name: string; tag: string; path: string };

const SURFACES: Surface[] = [
  { name: "home", tag: "@home", path: "/" },
  { name: "feed", tag: "@feed", path: "/skelbimai" },
  { name: "categories", tag: "@categories", path: "/kategorijos" },
  { name: "how", tag: "@how", path: "/kaip-tai-veikia" },
  { name: "terms", tag: "@legal", path: "/naudojimosi-salygos" },
  { name: "privacy", tag: "@legal", path: "/privatumo-politika" },
  { name: "notfound", tag: "@status", path: "/this-route-does-not-exist" },
  { name: "home-en", tag: "@home", path: "/en" },
  { name: "feed-en", tag: "@feed", path: "/en/skelbimai" },
];

fs.mkdirSync(OUT, { recursive: true });

// Scroll-driven reveals (animation-timeline: view()) leave below-the-fold content
// at opacity:0 in a fullPage capture, and reduced-motion emulation doesn't reliably
// neutralize them at render time. Force every revealed element to its final state.
const REVEAL_KILL = `
  .nk-reveal, .nk-reveal-grid, .nk-reveal-grid > *, .nk-hero-intro > *, .nk-hero-media {
    animation: none !important;
    opacity: 1 !important;
    transform: none !important;
  }
`;

async function settle(page: Page) {
  await page.addStyleTag({ content: REVEAL_KILL });
  await page.evaluate(() => document.fonts?.ready);
}

// The @state tests DRIVE the page rather than just photograph it, and settle() does not
// imply hydration — until the client bundle attaches, a click is a no-op and the panel
// simply never opens. Under parallel workers on a cold dev server that loses the race
// often enough to matter (CI's retries would only paper over it). Same gate the
// price-range / date-filter specs open with.
async function hydrated(page: Page) {
  await page.waitForFunction(() => (window as Window & { __nkNavReady?: boolean }).__nkNavReady === true);
}

async function overflowAt(page: Page): Promise<number> {
  return page.evaluate(() => {
    const el = document.scrollingElement || document.documentElement;
    return el.scrollWidth - el.clientWidth;
  });
}

async function clippedKnownControls(page: Page) {
  return page.evaluate(() => {
    const visible = (el: Element) => {
      const r = el.getBoundingClientRect();
      const cs = getComputedStyle(el);
      return r.width > 0 && r.height > 0 && cs.display !== "none" && cs.visibility !== "hidden";
    };
    return [...document.querySelectorAll(".nk-pillctl__label,.nk-toggle__lead")]
      .filter(visible)
      .filter((el) => el.scrollWidth > el.clientWidth + 1 || el.scrollHeight > el.clientHeight + 1)
      .map((el) => ({ text: el.textContent?.trim(), className: el.className, rect: el.getBoundingClientRect().toJSON?.() }));
  });
}

test("proxy: default-locale rewrites do not loop @proxy", async ({ request }) => {
  await expect((await request.get("/", { maxRedirects: 5 })).status()).toBe(200);
  await expect((await request.get("/skelbimai", { maxRedirects: 5 })).status()).toBe(200);
  await expect((await request.get("/en", { maxRedirects: 5 })).status()).toBe(200);
  const defaultPrefixed = await request.get("/lt/skelbimai", { maxRedirects: 0 });
  expect(defaultPrefixed.status()).toBe(308);
  expect(defaultPrefixed.headers().location).toBe("/skelbimai");
});

for (const s of SURFACES) {
  test(`sweep ${s.name} ${s.tag}`, async ({ page }) => {
    test.setTimeout(300_000);
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
      const clipped = await clippedKnownControls(page);
      expect(clipped, `${s.name} clipped known controls at ${width}: ${JSON.stringify(clipped)}`).toEqual([]);
      await page.screenshot({
        path: path.join(OUT, `${s.name}-${String(width).padStart(4, "0")}.png`),
        fullPage: true,
      });
    }
    // Report all offending widths in one assertion so the whole surface is visible.
    expect(overflows, `${s.name} horizontal overflow at: ${JSON.stringify(overflows)}`).toEqual([]);
  });
}

// Interactive states at a representative phone width (390).
test("states: nav mobile drawer @state", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/", { waitUntil: "domcontentloaded" });
  await settle(page);
  await hydrated(page);
  await page.locator(".nk-nav-burger").click();
  await expect(page.locator(".nk-nav-burger")).toHaveAttribute("aria-expanded", "true");
  await expect(page.locator(".nk-nav-drawer")).toHaveClass(/open/);
  await page.waitForTimeout(300);
  await page.screenshot({ path: path.join(OUT, "state-navdrawer-390.png"), fullPage: false });
});

test("states: legal mobile TOC drawer @state", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/naudojimosi-salygos", { waitUntil: "domcontentloaded" });
  await settle(page);
  await hydrated(page);
  await expect(page.locator(".nk-appbanner")).toHaveCount(0);
  await page.locator(".nk-lg-fab-toc").click();
  await page.waitForTimeout(300);
  await page.screenshot({ path: path.join(OUT, "state-legaldrawer-390.png"), fullPage: false });
});

test("states: filter sheet controls are readable @state", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/skelbimai", { waitUntil: "domcontentloaded" });
  await settle(page);
  await hydrated(page);
  await page.locator(".nk-filters-mobilebtn").click();
  await page.waitForTimeout(300);
  await expect.poll(() => clippedKnownControls(page)).toEqual([]);
  // The price-range panel renders inline in the sheet — capture it in view.
  await expect(page.locator(".nk-filtersheet .nk-price-panel")).toBeVisible();
  await page.screenshot({ path: path.join(OUT, "state-filtersheet-390.png"), fullPage: false });
});

test("states: price-range popover (desktop) @state", async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.goto("/skelbimai", { waitUntil: "domcontentloaded" });
  await settle(page);
  await hydrated(page);
  await page.locator(".nk-price-field > button").click();
  await expect(page.locator(".nk-price-pop")).toBeVisible();
  await expect(page.getByRole("slider")).toHaveCount(2);
  // The popover must not push the page into horizontal overflow at any anchor edge.
  expect(await overflowAt(page)).toBeLessThanOrEqual(1);
  await page.screenshot({ path: path.join(OUT, "state-pricerange-1280.png"), fullPage: false });
});

test("states: price-range slider survives the 320px floor @state", async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 844 });
  await page.goto("/skelbimai", { waitUntil: "domcontentloaded" });
  await settle(page);
  await hydrated(page);
  await page.locator(".nk-filters-mobilebtn").click();
  await expect(page.locator(".nk-filtersheet .nk-price-panel")).toBeVisible();
  await page.waitForTimeout(300);
  // Both thumbs are still there and still grabbable — the rail is the thing the 320px
  // floor squeezes, so asserting only "no overflow" would pass on a collapsed slider.
  const thumbs = page.locator(".nk-filtersheet").getByRole("slider");
  await expect(thumbs).toHaveCount(2);
  const track = await page.locator(".nk-filtersheet .nk-price-track").boundingBox();
  expect(track?.width ?? 0).toBeGreaterThan(120);
  // The thumbs sit at the rail's ends at rest; neither may hang outside the sheet.
  const sheet = await page.locator(".nk-filtersheet").boundingBox();
  for (const box of await thumbs.all()) {
    const thumb = await box.boundingBox();
    expect(thumb?.x ?? 0).toBeGreaterThanOrEqual(sheet?.x ?? 0);
    expect((thumb?.x ?? 0) + (thumb?.width ?? 0)).toBeLessThanOrEqual((sheet?.x ?? 0) + (sheet?.width ?? 0));
  }
  await expect.poll(() => overflowAt(page)).toBeLessThanOrEqual(1);
  await page.screenshot({ path: path.join(OUT, "state-pricerange-320.png"), fullPage: false });
});
