// Legal-pages audit sweep: full-page screenshots of Terms / Privacy / Delete
// Account at 8 widths in both locales (48 shots), plus a horizontal-overflow log.
// Usage: yarn build && yarn start   (serves :3000, no Next dev-indicator badge)
//        node scripts/legal-audit-shots.mjs   [--base http://localhost:3000]
// Output: screenshots/legal-audit/<slug>-<locale>-<width>.png
import { chromium, devices } from "playwright";
import { mkdirSync } from "node:fs";

const argBase = process.argv.indexOf("--base");
const BASE = argBase !== -1 ? process.argv[argBase + 1] : (process.env.BASE ?? "http://localhost:3000");
const OUT = "screenshots/legal-audit";

const WIDTHS = [320, 360, 390, 430, 768, 1024, 1280, 1440];
const PAGES = [
  { slug: "terms", path: "/naudojimosi-salygos" },
  { slug: "privacy", path: "/privatumo-politika" },
  { slug: "delete", path: "/paskyros-trynimas" },
];
const LOCALES = [
  { name: "lt", prefix: "" },
  { name: "en", prefix: "/en" },
];

// Force scroll-reveal sections visible and freeze all animation so full-page
// shots aren't captured mid-transition (below-the-fold reveals start at opacity:0).
const REVEAL_KILL = `.nk-reveal,.nk-reveal-grid>*{opacity:1!important;transform:none!important}
  *,*::before,*::after{animation:none!important;transition:none!important}`;

// ≤680px uses a phone descriptor so hover:none / pointer:coarse / hasTouch rules
// (persistent section anchor, 44px tap targets) render as on a real device.
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

      const file = `${OUT}/${p.slug}-${loc.name}-${String(w).padStart(4, "0")}.png`;
      await page.screenshot({ path: file, fullPage: true });

      const ov = await page.evaluate(() => {
        const el = document.scrollingElement || document.documentElement;
        return el.scrollWidth - el.clientWidth;
      });
      if (ov > 1) {
        overflows.push({ file, ov });
      }
      console.log(`${ov > 1 ? "⚠ +" + ov + "px " : "✓ "}${file}`);
      count++;
    }
  }
  await ctx.close();
}

await browser.close();
console.log(`\nDone: ${count} shots in ${OUT}/`);
if (overflows.length) {
  console.log(`\n⚠ HORIZONTAL OVERFLOW on ${overflows.length} shot(s):`);
  for (const o of overflows) {
    console.log(`   +${o.ov}px  ${o.file}`);
  }
  process.exitCode = 1;
} else {
  console.log("✓ No horizontal overflow at any width/locale.");
}
