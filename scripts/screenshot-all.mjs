// One-off: full-page screenshots of every route at three viewports.
// Usage: node scripts/screenshot-all.mjs  (expects `yarn dev` on :3000 with NEXT_PUBLIC_USE_MOCK=1)
import { chromium } from "playwright";
import { mkdirSync, existsSync } from "node:fs";

// Resumable: pass --resume to skip shots that already exist on disk.
const RESUME = process.argv.includes("--resume");

const BASE = "http://localhost:3000";
const OUT = "screenshots";

const VIEWPORTS = [
  { name: "desktop", width: 1440, height: 900 },
  { name: "tablet", width: 768, height: 1024 },
  { name: "mobile", width: 390, height: 844 },
];

const PAGES = [
  { slug: "home", path: "" },
  { slug: "skelbimai", path: "/skelbimai" },
  { slug: "skelbimas-detail", path: "/skelbimai/dodge-ram-2016" },
  { slug: "kategorijos", path: "/kategorijos" },
  { slug: "kaip-tai-veikia", path: "/kaip-tai-veikia" },
  { slug: "teisine", path: "/teisine" },
  { slug: "teisine-terms", path: "/teisine/terms-of-use" },
  { slug: "naudojimo-taisykles", path: "/naudojimo-taisykles" },
  { slug: "privatumo-politika", path: "/privatumo-politika" },
];

const LOCALES = [
  { name: "lt", prefix: "" },
  { name: "en", prefix: "/en" },
];

const browser = await chromium.launch();
let count = 0;

for (const vp of VIEWPORTS) {
  const dir = `${OUT}/${vp.name}`;
  mkdirSync(dir, { recursive: true });
  const context = await browser.newContext({
    viewport: { width: vp.width, height: vp.height },
    deviceScaleFactor: 2,
    reducedMotion: "reduce",
  });
  const page = await context.newPage();

  for (const loc of LOCALES) {
    for (const p of PAGES) {
      const file = `${dir}/${loc.name}-${p.slug}.png`;
      if (RESUME && existsSync(file)) {
        count++;
        continue;
      }
      const url = `${BASE}${loc.prefix}${p.path}`;
      await page.goto(url, { waitUntil: "networkidle", timeout: 60_000 });
      // Force scroll-reveal sections visible and freeze animations.
      await page.addStyleTag({
        content: `.nk-reveal{opacity:1!important;transform:none!important}
          *,*::before,*::after{animation:none!important;transition:none!important}`,
      });
      // Trigger any lazy images by walking the page, then return to top.
      await page.evaluate(async () => {
        for (let y = 0; y < document.body.scrollHeight; y += 600) {
          window.scrollTo(0, y);
          await new Promise((r) => setTimeout(r, 40));
        }
        window.scrollTo(0, 0);
      });
      await page.waitForTimeout(400);
      await page.screenshot({ path: file, fullPage: true });
      count++;
      console.log(`✓ ${file}`);
    }
  }
  await context.close();
}

await browser.close();
console.log(`Done: ${count} screenshots in ${OUT}/`);
