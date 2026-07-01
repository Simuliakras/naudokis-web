// Home-screen audit sweep: captures the Home page at the 8 audit widths, both a
// viewport crop (above-the-fold — sticky nav, hero framing, mobile safe area) and
// a full-page shot (whole scroll), plus a horizontal-overflow log.
// Usage: (dev server on :3000 with NEXT_PUBLIC_USE_MOCK=1)
//        node scripts/home-audit-shots.mjs   [--base http://localhost:3000] [--en]
// Output: screenshots/home-audit/home-<vp|fp>-<locale>-<width>.png
import { chromium, devices } from "playwright";
import { mkdirSync } from "node:fs";

const argBase = process.argv.indexOf("--base");
const BASE = argBase !== -1 ? process.argv[argBase + 1] : (process.env.BASE ?? "http://localhost:3000");
const WITH_EN = process.argv.includes("--en");
const OUT = "screenshots/home-audit";

const WIDTHS = [320, 360, 390, 430, 768, 1024, 1280, 1440];
const LOCALES = WITH_EN ? [{ name: "lt", prefix: "" }, { name: "en", prefix: "/en" }] : [{ name: "lt", prefix: "" }];

// Force scroll-reveal sections visible and freeze animation so shots aren't
// captured mid-transition (below-the-fold reveals start at opacity:0).
const REVEAL_KILL = `.nk-reveal,.nk-reveal-grid>*,.nk-hero-intro>*,.nk-hero-media{opacity:1!important;transform:none!important}
  *,*::before,*::after{animation:none!important;transition:none!important}`;

// ≤680px uses a phone descriptor so hover:none / pointer:coarse / hasTouch rules
// (44px tap targets, mobile drawer) render as on a real device.
const PHONE = devices["Pixel 7"];

mkdirSync(OUT, { recursive: true });
const browser = await chromium.launch();
const overflows = [];
let count = 0;

for (const w of WIDTHS) {
  const ctx = await browser.newContext({
    ...(w <= 680 ? PHONE : {}),
    viewport: { width: w, height: 900 },
    deviceScaleFactor: 2,
    reducedMotion: "reduce",
  });
  const page = await ctx.newPage();

  for (const loc of LOCALES) {
    const url = `${BASE}${loc.prefix}/`;
    await page.goto(url, { waitUntil: "networkidle", timeout: 60_000 });
    await page.addStyleTag({ content: REVEAL_KILL });
    await page.evaluate(() => document.fonts?.ready);
    // Walk the page to trigger any lazy content, then return to top.
    await page.evaluate(async () => {
      for (let y = 0; y < document.body.scrollHeight; y += 700) {
        window.scrollTo(0, y);
        await new Promise((r) => setTimeout(r, 30));
      }
      window.scrollTo(0, 0);
    });
    await page.waitForTimeout(250);

    const wpad = String(w).padStart(4, "0");
    // Above-the-fold viewport crop.
    await page.screenshot({ path: `${OUT}/home-vp-${loc.name}-${wpad}.png`, fullPage: false });
    // Full scroll.
    await page.screenshot({ path: `${OUT}/home-fp-${loc.name}-${wpad}.png`, fullPage: true });

    const ov = await page.evaluate(() => {
      const el = document.scrollingElement || document.documentElement;
      return el.scrollWidth - el.clientWidth;
    });
    if (ov > 1) {
      overflows.push({ w, loc: loc.name, ov });
    }
    console.log(`${ov > 1 ? "⚠ +" + ov + "px " : "✓ "}home ${loc.name} @${w}`);
    count += 2;
  }
  await ctx.close();
}

await browser.close();
console.log(`\nDone: ${count} shots in ${OUT}/`);
if (overflows.length) {
  console.log(`\n⚠ HORIZONTAL OVERFLOW:`);
  for (const o of overflows) {
    console.log(`   +${o.ov}px  home ${o.loc} @${o.w}`);
  }
  process.exitCode = 1;
} else {
  console.log("✓ No horizontal overflow at any width.");
}
