// Listing-detail + How-it-works audit sweep: captures both pages at the 8 audit
// widths (viewport crop + full page + overflow log), plus interactive/edge states
// (deleted-listing 404, app-redirect modal via the mobile reserve bar, and the
// How-it-works owner role / step-4 combination).
// Usage: (server on :3000 with NEXT_PUBLIC_USE_MOCK=1 — prefer `yarn build && yarn start`
//         so the Next dev-indicator badge is absent)
//        node scripts/listing-howitworks-audit-shots.mjs   [--base http://localhost:3000] [--en]
// Output: screenshots/listing-howitworks-audit/<slug>-<vp|fp>-<locale>-<width>.png
//         screenshots/listing-howitworks-audit/state-*.png
import { chromium, devices } from "playwright";
import { mkdirSync } from "node:fs";

const argBase = process.argv.indexOf("--base");
const BASE = argBase !== -1 ? process.argv[argBase + 1] : (process.env.BASE ?? "http://localhost:3000");
const WITH_EN = process.argv.includes("--en");
const OUT = "screenshots/listing-howitworks-audit";

const WIDTHS = [320, 360, 390, 430, 768, 1024, 1280, 1440];
const LOCALES = WITH_EN ? [{ name: "lt", prefix: "" }, { name: "en", prefix: "/en" }] : [{ name: "lt", prefix: "" }];

// Mock ids come from app/lib/mock-data.ts. sony-a7-iii has 6 photos + reviews;
// makita-suktuvas has 3 photos + zero reviews (empty-reviews state + "New" badge).
const PAGES = [
  { slug: "listing", path: "/skelbimai/sony-a7-iii" },
  { slug: "listing-noreviews", path: "/skelbimai/makita-suktuvas" },
  { slug: "how", path: "/kaip-tai-veikia" },
];

// Force scroll-reveal sections visible, freeze animation (no mid-transition shots),
// and hide the Next dev-indicator badge so dev runs match prod shots.
const REVEAL_KILL = `.nk-reveal,.nk-reveal-grid>*,.nk-hero-intro>*,.nk-hero-media{opacity:1!important;transform:none!important}
  *,*::before,*::after{animation:none!important;transition:none!important}
  nextjs-portal,[data-next-badge-root],[data-nextjs-toast],#__next-build-watcher{display:none!important}`;

// ≤680px uses a phone descriptor so hover:none / pointer:coarse / hasTouch rules
// (44px tap targets, mobile drawer, .nk-mbar sticky bar) render as on a real device.
const PHONE = devices["Pixel 7"];
const pad = (w) => String(w).padStart(4, "0");

async function settle(page) {
  await page.addStyleTag({ content: REVEAL_KILL });
  await page.evaluate(() => document.fonts?.ready);
  await page.evaluate(async () => {
    for (let y = 0; y < document.body.scrollHeight; y += 700) {
      window.scrollTo(0, y);
      await new Promise((r) => setTimeout(r, 30));
    }
    window.scrollTo(0, 0);
  });
  await page.waitForTimeout(250);
}

mkdirSync(OUT, { recursive: true });
const browser = await chromium.launch();
const overflows = [];
let count = 0;

// ---- Standard responsive sweep ----
for (const w of WIDTHS) {
  const ctx = await browser.newContext({
    ...(w <= 680 ? PHONE : {}),
    viewport: { width: w, height: 900 },
    deviceScaleFactor: 2,
    reducedMotion: "reduce",
  });
  const page = await ctx.newPage();
  for (const loc of LOCALES) {
    for (const p of PAGES) {
      await page.goto(`${BASE}${loc.prefix}${p.path}`, { waitUntil: "networkidle", timeout: 60_000 });
      await settle(page);
      await page.screenshot({ path: `${OUT}/${p.slug}-vp-${loc.name}-${pad(w)}.png`, fullPage: false });
      await page.screenshot({ path: `${OUT}/${p.slug}-fp-${loc.name}-${pad(w)}.png`, fullPage: true });
      const ov = await page.evaluate(() => {
        const el = document.scrollingElement || document.documentElement;
        return el.scrollWidth - el.clientWidth;
      });
      if (ov > 1) {
        overflows.push({ w, loc: loc.name, slug: p.slug, ov });
      }
      console.log(`${ov > 1 ? "⚠ +" + ov + "px " : "✓ "}${p.slug} ${loc.name} @${w}`);
      count += 2;
    }
  }
  await ctx.close();
}

// ---- Edge / interactive states ----
async function newCtx(w, h = 900) {
  return browser.newContext({
    ...(w <= 680 ? PHONE : {}),
    viewport: { width: w, height: h },
    deviceScaleFactor: 2,
    reducedMotion: "reduce",
  });
}

// Deleted listing → real 404 (StatusScreen). Check a phone + desktop width per locale.
for (const loc of LOCALES) {
  for (const w of [390, 1280]) {
    const ctx = await newCtx(w);
    const page = await ctx.newPage();
    await page.goto(`${BASE}${loc.prefix}/skelbimai/does-not-exist-xyz`, { waitUntil: "networkidle", timeout: 60_000 });
    await settle(page);
    await page.screenshot({ path: `${OUT}/state-404-${loc.name}-${pad(w)}.png`, fullPage: true });
    console.log(`✓ state-404 ${loc.name} @${w}`);
    count += 1;
    await ctx.close();
  }
}

// App-redirect modal opened from the mobile reserve bar (390 phone).
{
  const ctx = await newCtx(390);
  const page = await ctx.newPage();
  await page.goto(`${BASE}/skelbimai/sony-a7-iii`, { waitUntil: "networkidle", timeout: 60_000 });
  await page.addStyleTag({ content: REVEAL_KILL });
  await page.waitForFunction(() => window.__nkBridgeReady === true, { timeout: 10_000 }).catch(() => {});
  await page.locator(".nk-mbar button.nk-btn--primary").click().catch(() => {});
  await page.waitForSelector('[role="dialog"]', { timeout: 5_000 }).catch(() => {});
  await page.waitForTimeout(500);
  await page.screenshot({ path: `${OUT}/state-redirect-0390.png`, fullPage: false });
  console.log("✓ state-redirect @390");
  count += 1;
  await ctx.close();
}

// How-it-works: owner role + step 4 (the main sweep captures renter/step 1).
for (const w of [390, 768, 1280]) {
  const ctx = await newCtx(w, 1100);
  const page = await ctx.newPage();
  await page.goto(`${BASE}/kaip-tai-veikia`, { waitUntil: "networkidle", timeout: 60_000 });
  await page.addStyleTag({ content: REVEAL_KILL });
  await page.locator(".htw-toggle__btn").nth(1).click().catch(() => {});
  await page.locator(".htw-step").nth(3).click().catch(() => {});
  await page.waitForTimeout(500);
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.screenshot({ path: `${OUT}/state-how-owner-s4-${pad(w)}.png`, fullPage: true });
  console.log(`✓ state-how-owner-s4 @${w}`);
  count += 1;
  await ctx.close();
}

await browser.close();
console.log(`\nDone: ${count} shots in ${OUT}/`);
if (overflows.length) {
  console.log(`\n⚠ HORIZONTAL OVERFLOW:`);
  for (const o of overflows) {
    console.log(`   +${o.ov}px  ${o.slug} ${o.loc} @${o.w}`);
  }
  process.exitCode = 1;
} else {
  console.log("✓ No horizontal overflow at any width.");
}
