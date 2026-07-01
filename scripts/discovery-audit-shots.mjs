// Discovery-surface audit sweep: captures the Categories page and the Listings
// feed (default + search + category landing + no-results + filtered) at the 8
// audit widths, both a viewport crop and a full-page shot, plus an overflow log.
// Usage: (dev server on :3000; pages server-render live backend data)
//        node scripts/discovery-audit-shots.mjs   [--base http://localhost:3000] [--en]
// Output: screenshots/discovery-audit/<slug>-<vp|fp>-<locale>-<width>.png
import { chromium, devices } from "playwright";
import { mkdirSync } from "node:fs";

const argBase = process.argv.indexOf("--base");
const BASE = argBase !== -1 ? process.argv[argBase + 1] : (process.env.BASE ?? "http://localhost:3000");
const WITH_EN = process.argv.includes("--en");
const OUT = "screenshots/discovery-audit";

const WIDTHS = [320, 360, 390, 430, 768, 1024, 1280, 1440];
const LOCALES = WITH_EN ? [{ name: "lt", prefix: "" }, { name: "en", prefix: "/en" }] : [{ name: "lt", prefix: "" }];

// Each page: slug + path (query included).
const PAGES = [
  { slug: "cats", path: "/kategorijos" },
  { slug: "feed", path: "/skelbimai" },
  { slug: "feed-search", path: "/skelbimai?q=Sony" },
  { slug: "feed-cat", path: "/skelbimai?cat=sports_leisure" },
  { slug: "feed-empty", path: "/skelbimai?q=zzznonexistent" },
  { slug: "feed-filtered", path: "/skelbimai?cat=photo_video&city=Vilnius" },
];

// Force scroll-reveal sections visible and freeze animation so shots aren't
// captured mid-transition (below-the-fold reveals start at opacity:0).
const REVEAL_KILL = `.nk-reveal,.nk-reveal-grid>*,.nk-hero-intro>*,.nk-hero-media{opacity:1!important;transform:none!important}
  *,*::before,*::after{animation:none!important;transition:none!important}`;

// ≤680px uses a phone descriptor so hover:none / pointer:coarse / hasTouch rules
// (44px tap targets, mobile drawer, bottom sheet) render as on a real device.
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
    for (const p of PAGES) {
      const url = `${BASE}${loc.prefix}${p.path}`;
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
      await page.screenshot({ path: `${OUT}/${p.slug}-vp-${loc.name}-${wpad}.png`, fullPage: false });
      await page.screenshot({ path: `${OUT}/${p.slug}-fp-${loc.name}-${wpad}.png`, fullPage: true });

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
