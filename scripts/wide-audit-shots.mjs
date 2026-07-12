// Wide-viewport responsiveness audit sweep: captures every page group across a
// tiered width matrix (device sweep + CSS-boundary ±1px pairs + ultrawide), a
// height/orientation matrix, 25+ interaction states, and mock-backed stress
// scenarios — with per-shot layout metrics written to an append-only manifest.
//
// Usage: (server on :3000 — prefer `yarn build && yarn start` for live groups;
//         mock group expects `NEXT_PUBLIC_API_BASE_URL=http://localhost:4141 yarn dev`)
//   node scripts/wide-audit-shots.mjs --group p1 [--locale lt|en|both] [--routes a,b]
//        [--widths 320,390] [--base http://localhost:3000] [--api <url>] [--out dir]
//        [--dry-run] [--resume] [--concurrency 4] [--shard 1/2] [--scenario <mock-id>]
// Groups: p1 | tier2 | en | p2 | p3 | states | tier3 | textspacing | mock
// Output: screenshots/wide-audit/<route-slug>/<state>-<locale>-<w>x<h>[-dpr2]-<vp|fp>.png
//         + plan.json, manifest.ndjson, manifest.json, failures.json
import { chromium } from "playwright";
import fs from "node:fs";
import path from "node:path";
import { pickListingIds, resolveApiBase } from "./_backend.mjs";
import {
  TEXT_SPACING, pad, contextOptions, gotoWithRetry, clickIfReady,
  settle, fullPageShot, collectMetrics,
} from "./_shots-lib.mjs";

/* ---------------- CLI ---------------- */

const argv = process.argv.slice(2);
const argOf = (flag, fallback) => {
  const i = argv.indexOf(flag);
  return i !== -1 && argv[i + 1] ? argv[i + 1] : fallback;
};
const BASE = argOf("--base", process.env.BASE ?? "http://localhost:3000");
const API_BASE = resolveApiBase(process.argv);
const OUT = path.resolve(argOf("--out", "screenshots/wide-audit"));
const GROUPS = argOf("--group", "p1").split(",");
const LOCALE_ARG = argOf("--locale", null);
const ROUTE_FILTER = argOf("--routes", null)?.split(",") ?? null;
const WIDTH_FILTER = argOf("--widths", null)?.split(",").map(Number) ?? null;
const SCENARIO_FILTER = argOf("--scenario", null);
const CONCURRENCY = Number(argOf("--concurrency", "4"));
const SHARD = argOf("--shard", null); // "i/N"
const DRY_RUN = argv.includes("--dry-run");
const RESUME = argv.includes("--resume");
const MOCK_CONTROL = argOf("--mock-control", "http://127.0.0.1:4141");

/* ---------------- Width & height matrices ---------------- */

const TIER1_WIDTHS = [
  320, 344, 360, 375, 390, 412, 430, 480, 540, 560,
  600, 640, 673, 700, 744, 768, 820, 834, 900, 980,
  1024, 1112, 1180, 1194, 1280, 1366, 1440, 1536, 1728, 1920,
];
// ±1px pairs around every CSS breakpoint literal (globals.css + legal.css).
const TIER2_WIDTHS = [359, 361, 400, 401, 431, 561, 681, 701, 769, 901, 981, 1025, 1119, 1121, 1181, 1199, 1200, 1281, 1441];
const TIER2_LEGAL_ONLY = [420, 421]; // legal.css table-cell collapse boundary
const TIER3_WIDTHS = [393, 432, 810, 912, 1512, 1600, 1680, 2048, 2560, 3440, 3840];
const EN_WIDTHS = [320, 360, 390, 430, 560, 673, 768, 900, 1024, 1120, 1280, 1440, 1920];
const P3_WIDTHS = [320, 390, 560, 561, 768, 1024, 1280, 1920];
const P3_EN_WIDTHS = [390, 768, 1280];

// Realistic device height per width; boundary pairs inherit their neighbour's
// height so a ±1px pair differs ONLY in width.
const HEIGHTS = {
  320: 568, 344: 882, 359: 800, 360: 800, 361: 800, 375: 667, 390: 844, 393: 851,
  400: 844, 401: 844, 412: 915, 420: 915, 421: 915, 430: 932, 431: 932, 432: 932,
  480: 854, 540: 720, 559: 900, 560: 900, 561: 900, 600: 960, 640: 1136, 673: 841,
  680: 900, 681: 900, 700: 900, 701: 900, 744: 1133, 768: 1024, 769: 1024,
  810: 1080, 820: 1180, 834: 1194, 900: 1280, 901: 1280, 912: 1368, 980: 900,
  981: 900, 1024: 768, 1025: 768, 1112: 834, 1119: 800, 1120: 800, 1121: 800,
  1180: 820, 1181: 820, 1194: 834, 1199: 800, 1200: 800, 1280: 800, 1281: 800,
  1366: 768, 1440: 900, 1441: 900, 1512: 982, 1536: 826, 1600: 900, 1680: 1050,
  1728: 1000, 1920: 1080, 2048: 1152, 2560: 1440, 3440: 1440, 3840: 2160,
};
const heightFor = (w) => HEIGHTS[w] ?? (w <= 560 ? 844 : w <= 1024 ? 1024 : 900);
const dprFor = (w) => (w <= 900 ? 2 : 1);

// Extra (width,height) combos on height-sensitive routes: short-phone token
// boundary (≤560w & ≤700h), bento clamp (≥981w & ≤780h), landscape phones,
// docked-bars laptops, legal drawer compress (≤620h).
const HEIGHT_MATRIX = [
  { w: 390, h: 700, routes: ["home", "feed", "detail-full"] },
  { w: 390, h: 701, routes: ["home", "feed", "detail-full"] },
  { w: 430, h: 700, routes: ["home", "detail-full"] },
  { w: 1280, h: 780, routes: ["detail-full"] },
  { w: 1280, h: 781, routes: ["detail-full"] },
  { w: 1920, h: 780, routes: ["detail-full"] },
  { w: 844, h: 390, routes: ["home", "feed", "detail-full", "legal-terms", "hiw"] },
  { w: 932, h: 430, routes: ["home", "detail-full"] },
  { w: 915, h: 412, routes: ["feed", "detail-full"] },
  { w: 780, h: 360, routes: ["home", "detail-full"] },
  { w: 1280, h: 620, routes: ["home", "feed", "detail-full", "hiw"] },
  { w: 1366, h: 624, routes: ["detail-full", "hiw"] },
  { w: 1024, h: 600, routes: ["legal-terms"] },
  { w: 768, h: 600, routes: ["legal-terms"] },
];

/* ---------------- Routes ---------------- */

// Listing ids resolved from the live backend at runtime (placeholders in --dry-run).
const ids = DRY_RUN
  ? { withPhotosReviews: "DETAIL_ID", zeroReviews: "DETAIL_NOREVIEWS_ID" }
  : await pickListingIds(API_BASE);

const P1_ROUTES = [
  { slug: "home", path: "/" },
  { slug: "feed", path: "/skelbimai" },
  ids.withPhotosReviews && { slug: "detail-full", path: `/skelbimai/${ids.withPhotosReviews}` },
  { slug: "categories", path: "/kategorijos" },
  { slug: "hiw", path: "/kaip-tai-veikia" },
  { slug: "legal-terms", path: "/naudojimosi-salygos" },
  { slug: "hub-sveikata", path: "/nuoma/sveikata-medicinine-iranga" },
].filter(Boolean);

const P2_ROUTES = [
  { slug: "teisine", path: "/teisine" },
  { slug: "privacy", path: "/privatumo-politika" },
  { slug: "account-deletion", path: "/paskyros-trynimas" },
  { slug: "invite-code", path: "/invite?code=RESPONSIVE2026LONGCODE" },
  ids.zeroReviews && { slug: "detail-noreviews", path: `/skelbimai/${ids.zeroReviews}` },
  { slug: "subcat-longest", path: "/nuoma/namai-sodas/auksto-slegio-plovimo-iranga" },
  { slug: "subcat-city-deep", path: "/nuoma/namai-sodas/auksto-slegio-plovimo-iranga/marijampole" },
  { slug: "city-marijampole", path: "/miestai/marijampole" },
  { slug: "city-vilnius", path: "/miestai/vilnius" },
  { slug: "hiw-owner", path: "/kaip-tai-veikia?role=owner" },
  { slug: "feed-q-long", path: "/skelbimai?q=profesionali%20fotografijos%20ir%20apsvietimo%20iranga%20renginiams%20su%20pristatymu" },
  { slug: "feed-cat-city", path: "/skelbimai?cat=photo_video&city=Vilnius" },
  { slug: "feed-filtered", path: "/skelbimai?sort=price_desc&delivery=1&price=10-30" },
  { slug: "feed-page2", path: "/skelbimai?page=2" },
].filter(Boolean);

const P3_ROUTES = [
  { slug: "hub-kita", path: "/nuoma/kita" },
  { slug: "hub-transportas", path: "/nuoma/transportas" },
  { slug: "subcat-dronai", path: "/nuoma/foto-video/dronai" },
  { slug: "subcat-tents", path: "/nuoma/renginiai-sventes/palapines-paviljonai" },
  { slug: "cat-city-branch", path: "/nuoma/irankiai-statyba/vilnius" },
  { slug: "city-panevezys", path: "/miestai/panevezys" },
  { slug: "city-siauliai", path: "/miestai/siauliai" },
  { slug: "city-palanga", path: "/miestai/palanga" },
  { slug: "invite-bare", path: "/invite" },
  { slug: "invite-wrap", path: "/invite?code=invalid-code-that-wraps-at-phone-widths" },
  { slug: "cancel-deletion", path: "/cancel-deletion" },
  { slug: "soft-404", path: "/neegzistuoja-xyz-puslapis" },
  { slug: "listing-404", path: "/skelbimai/does-not-exist-xyz" },
  { slug: "feed-empty", path: "/skelbimai?q=zzzzzzzzzzzzzzzzzz" },
];

const TIER3_ROUTE_SLUGS = ["home", "feed", "detail-full", "categories", "hiw", "legal-terms", "hub-sveikata", "city-vilnius"];

const ALL_ROUTES = [...P1_ROUTES, ...P2_ROUTES, ...P3_ROUTES];
const routeBySlug = Object.fromEntries(ALL_ROUTES.map((r) => [r.slug, r]));

/* ---------------- Interaction-state recipes ---------------- */
// Each recipe: { id, routes, at: [width | {w,h}], locales?, dpr?, noRevealKill?,
//               run(page, h) } — h.shoot(sub, {fullPage}) captures + names files.

const esc = async (page) => { await page.keyboard.press("Escape").catch(() => {}); };

const STATES = [
  {
    id: "nav-drawer", routes: ["home"],
    at: [320, 390, 430, 560, 673, 744, 834, 1024, 1119, 1120, { w: 844, h: 390 }],
    run: async (page, h) => {
      await clickIfReady(page, ".nk-nav-burger");
      await page.waitForSelector(".nk-nav-drawer.open", { timeout: 4000 }).catch(() => {});
      await page.waitForTimeout(300);
      await h.shoot("", { fullPage: false });
    },
  },
  {
    id: "locale-float", routes: ["home"], at: [1280, 1920],
    run: async (page, h) => {
      await clickIfReady(page, ".nk-locale-trigger");
      await page.waitForTimeout(300);
      await h.shoot("", { fullPage: false });
    },
  },
  {
    id: "locale-drawer", routes: ["home"], at: [390, 744],
    run: async (page, h) => {
      await clickIfReady(page, ".nk-nav-burger");
      await page.waitForTimeout(300);
      await clickIfReady(page, ".nk-nav-drawer .nk-locale-trigger");
      await page.waitForTimeout(300);
      await h.shoot("", { fullPage: false });
    },
  },
  {
    // Nav CTA label stages flip at exactly these widths; letter-level findings
    // need DPR2 even on the >900 side.
    id: "nav-cta-stage", routes: ["home", "feed", "invite-code"], locales: ["lt", "en"],
    at: [559, 560, 561, 1119, 1120, 1121], dpr: 2,
    run: async (page, h) => { await h.shoot("", { fullPage: false }); },
  },
  {
    id: "city-picker", routes: ["home"], at: [320, 390, 560, 1025, 1280],
    run: async (page, h) => {
      await clickIfReady(page, ".nk-citypick__trigger");
      await page.waitForSelector(".nk-citypick__panel", { timeout: 4000 }).catch(() => {});
      await page.waitForTimeout(250);
      await h.shoot("", { fullPage: false });
    },
  },
  {
    id: "search-focus", routes: ["home"], at: [320, 390, 560],
    run: async (page, h) => {
      await page.locator(".nk-search__input, input[type='search']").first().focus().catch(() => {});
      await page.waitForTimeout(200);
      await h.shoot("", { fullPage: false });
    },
  },
  {
    id: "filter-popover", routes: ["feed"], at: [561, 768, 1024, 1280, { w: 1280, h: 620 }],
    run: async (page, h) => {
      const pills = page.locator(".nk-pillctl");
      const n = Math.min(await pills.count(), 5);
      for (let i = 0; i < n; i += 1) {
        await pills.nth(i).click({ timeout: 3000 }).catch(() => {});
        await page.waitForTimeout(300);
        await h.shoot(`p${i}`, { fullPage: false });
        await esc(page);
        await page.waitForTimeout(150);
      }
    },
  },
  {
    id: "filter-sheet", routes: ["feed"], at: [320, 344, 390, 430, 560, { w: 390, h: 667 }],
    run: async (page, h) => {
      await clickIfReady(page, ".nk-filters-mobilebtn");
      await page.waitForSelector(".nk-filtersheet", { timeout: 4000 }).catch(() => {});
      await page.waitForTimeout(300);
      await h.shoot("open", { fullPage: false });
      await page.evaluate(() => {
        const sheet = document.querySelector(".nk-filtersheet");
        const scrollable = sheet && [sheet, ...sheet.querySelectorAll("*")].find((el) => el.scrollHeight > el.clientHeight + 4);
        if (scrollable) scrollable.scrollTop = scrollable.scrollHeight;
      });
      await page.waitForTimeout(200);
      await h.shoot("foot", { fullPage: false });
    },
  },
  {
    id: "catrail-end", routes: ["feed-cat-city"], at: [320, 390, 560],
    run: async (page, h) => {
      await page.evaluate(() => {
        for (const q of [".nk-catrail", ".nk-fchips"]) {
          const el = document.querySelector(q);
          if (el) el.scrollLeft = 99999;
        }
      });
      await page.waitForTimeout(200);
      await h.shoot("", { fullPage: false });
    },
  },
  {
    id: "intro-clamp", routes: ["hub-sveikata"], at: [320, 390, 560],
    run: async (page, h) => {
      await h.shoot("clamped", { fullPage: true });
      const opened = await clickIfReady(page, ".nk-intro-toggle");
      if (opened) {
        await page.waitForTimeout(200);
        await h.shoot("open", { fullPage: true });
      }
    },
  },
  {
    id: "back-to-top", routes: ["feed", "legal-terms"], at: [390, 768, 1280],
    run: async (page, h) => {
      await page.evaluate(() => window.scrollTo(0, 1400));
      await page.waitForTimeout(400);
      await h.shoot("", { fullPage: false });
    },
  },
  {
    id: "offline-strip", routes: ["feed"], at: [390, 1280],
    run: async (page, h) => {
      await h.ctx.setOffline(true);
      await page.waitForSelector(".nk-offline-strip", { timeout: 4000 }).catch(() => {});
      await page.waitForTimeout(300);
      await h.shoot("", { fullPage: false });
      await h.ctx.setOffline(false);
    },
  },
  {
    id: "app-redirect", routes: ["home"], at: [320, 390, 560, 561, 768, 1280, 1920, { w: 390, h: 700 }],
    run: async (page, h) => {
      await page.waitForFunction(() => window.__nkBridgeReady === true, { timeout: 10_000 }).catch(() => {});
      await clickIfReady(page, ".nk-nav-cta");
      await page.waitForSelector('[role="dialog"]', { timeout: 5000 }).catch(() => {});
      await page.waitForTimeout(400);
      await h.shoot("", { fullPage: false });
    },
  },
  {
    id: "app-redirect-mbar", routes: ["detail-full"], at: [390],
    run: async (page, h) => {
      await page.waitForFunction(() => window.__nkBridgeReady === true, { timeout: 10_000 }).catch(() => {});
      await clickIfReady(page, ".nk-mbar button.nk-btn--primary");
      await page.waitForSelector('[role="dialog"]', { timeout: 5000 }).catch(() => {});
      await page.waitForTimeout(400);
      await h.shoot("", { fullPage: false });
    },
  },
  {
    id: "lightbox", routes: ["detail-full"],
    at: [{ w: 390, h: 844 }, { w: 844, h: 390 }, { w: 932, h: 430 }, { w: 1280, h: 800 }],
    run: async (page, h) => {
      const opened = await clickIfReady(page, ".nk-gtile--btn");
      if (!opened) return;
      await page.waitForSelector(".nk-lightbox__panel", { timeout: 4000 }).catch(() => {});
      await page.waitForTimeout(400);
      await h.shoot("s1", { fullPage: false });
      await page.locator(".nk-lightbox__nav").last().click({ timeout: 2000 }).catch(() => {});
      await page.waitForTimeout(350);
      await h.shoot("s2", { fullPage: false });
      await page.evaluate(() => {
        const t = document.querySelector(".nk-lightbox__thumbs");
        if (t) t.scrollLeft = 99999;
      });
      await page.waitForTimeout(200);
      await h.shoot("s3", { fullPage: false });
      await esc(page);
    },
  },
  {
    id: "reserve-mbar", routes: ["detail-full"],
    at: [390, 980, 981, { w: 844, h: 390 }, { w: 1280, h: 620 }],
    run: async (page, h) => {
      await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight * 0.4));
      await page.waitForTimeout(400);
      await h.shoot("mid", { fullPage: false });
      await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
      await page.waitForTimeout(500);
      await h.shoot("foot", { fullPage: false });
    },
  },
  {
    id: "desc-expanded", routes: ["detail-full"], at: [320, 390, 560],
    run: async (page, h) => {
      const opened = await clickIfReady(page, '#aprasymas button[aria-expanded="false"]');
      if (opened) {
        await page.waitForTimeout(200);
      }
      await h.shoot("", { fullPage: true });
    },
  },
  {
    id: "similar-rail", routes: ["detail-full"], at: [560, 1280, 1281, 1440, 1441],
    run: async (page, h) => {
      const rail = page.locator(".nk-grid-4--rail").first();
      if ((await rail.count()) === 0) return;
      await rail.scrollIntoViewIfNeeded().catch(() => {});
      await page.waitForTimeout(250);
      await h.shoot("start", { fullPage: false });
      if (h.job.width <= 560) {
        await page.evaluate(() => {
          const el = document.querySelector(".nk-grid-4--rail");
          if (el) el.scrollLeft = 99999;
        });
        await page.waitForTimeout(250);
        await h.shoot("end", { fullPage: false });
      }
    },
  },
  {
    id: "faq-open", routes: ["home", "hiw"], at: [320, 768, 1280],
    run: async (page, h) => {
      await clickIfReady(page, '.nk-faq button[aria-expanded="false"], button[aria-controls]');
      await page.waitForTimeout(250);
      await h.shoot("", { fullPage: true });
    },
  },
  {
    id: "hiw-owner-s4", routes: ["hiw"], at: [320, 390, 768, 1120, 1121, 1280, 1920],
    run: async (page, h) => {
      await page.locator(".htw-toggle__btn").nth(1).click({ timeout: 3000 }).catch(() => {});
      await page.locator(".htw-step").nth(3).click({ timeout: 3000 }).catch(() => {});
      await page.waitForTimeout(450);
      await page.evaluate(() => window.scrollTo(0, 0));
      await h.shoot("", { fullPage: true });
    },
  },
  {
    id: "hiw-sticky-mid", routes: ["hiw"],
    at: [{ w: 1121, h: 800 }, { w: 1280, h: 620 }, { w: 1920, h: 1080 }],
    run: async (page, h) => {
      await page.evaluate(() => {
        const steps = document.querySelector(".htw-steps");
        window.scrollTo(0, (steps ? steps.getBoundingClientRect().top + window.scrollY : 400) + 600);
      });
      await page.waitForTimeout(300);
      await h.shoot("", { fullPage: false });
    },
  },
  {
    id: "legal-toc-drawer", routes: ["legal-terms"],
    at: [320, 390, 744, 1024, 1180, { w: 844, h: 390 }],
    run: async (page, h) => {
      await clickIfReady(page, ".nk-lg-fab-toc");
      await page.waitForSelector(".nk-lg-drawer.is-open", { timeout: 4000 }).catch(() => {});
      await page.waitForTimeout(300);
      await h.shoot("", { fullPage: false });
    },
  },
  {
    id: "legal-progress", routes: ["legal-terms"], at: [390, 768, 1280],
    run: async (page, h) => {
      await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight * 0.5));
      await page.waitForTimeout(300);
      await h.shoot("", { fullPage: false });
    },
  },
  {
    // Client-fetch skeleton: SSR HTML arrives hydrated, so delay the client API
    // call and trigger a new search to expose the isLoading grid.
    id: "skeleton-feed", routes: ["feed"], at: [320, 390, 768, 1280],
    run: async (page, h) => {
      await page.route((url) => url.origin !== new URL(h.base).origin && url.pathname.startsWith("/listings"), async (route) => {
        await new Promise((r) => setTimeout(r, 8000));
        await route.continue().catch(() => {});
      });
      await page.locator("#nk-feed-search-input").fill("dronas", { timeout: 3000 }).catch(() => {});
      await page.waitForTimeout(700);
      await h.shoot("", { fullPage: false });
      await page.unrouteAll({ behavior: "ignoreErrors" });
    },
  },
  {
    // Route-level loading.tsx: delay the client-side RSC navigation fetch.
    id: "loading-detail", routes: ["home"], at: [320, 390, 768, 1280],
    run: async (page, h) => {
      await page.route((url) => url.origin === new URL(h.base).origin && /\/skelbimai\/.+/.test(url.pathname), async (route) => {
        await new Promise((r) => setTimeout(r, 5000));
        await route.continue().catch(() => {});
      });
      const clicked = await clickIfReady(page, 'a[href*="/skelbimai/"]');
      if (clicked) {
        await page.waitForTimeout(500);
        await h.shoot("", { fullPage: false });
      }
      await page.unrouteAll({ behavior: "ignoreErrors" });
    },
  },
  {
    id: "loading-feed", routes: ["home"], at: [390, 1280],
    run: async (page, h) => {
      await page.route((url) => url.origin === new URL(h.base).origin && /\/skelbimai(\?|$)/.test(url.pathname + url.search), async (route) => {
        await new Promise((r) => setTimeout(r, 5000));
        await route.continue().catch(() => {});
      });
      const clicked = await clickIfReady(page, 'a[href$="/skelbimai"], a[href="/skelbimai"]');
      if (clicked) {
        await page.waitForTimeout(500);
        await h.shoot("", { fullPage: false });
      }
      await page.unrouteAll({ behavior: "ignoreErrors" });
    },
  },
  {
    // No REVEAL_KILL: verify animation-timeline reveals never strand content
    // hidden after a normal scroll pass.
    id: "reveal-integrity", routes: ["home", "hiw"], at: [390, 768, 1280], noRevealKill: true,
    run: async (page, h) => { await h.shoot("", { fullPage: true }); },
  },
];

// WCAG 1.4.12 text-spacing survival — its own group so the injection never
// contaminates the base corpus.
const TEXTSPACING_ROUTES = ["legal-terms", "hiw", "detail-full", "home"];
const TEXTSPACING_WIDTHS = [320, 768, 1280];

/* ---------------- Mock scenarios (server on :4141, `yarn dev` site) ---------------- */
// Each scenario: mode set via GET {MOCK_CONTROL}/__mode?set=<id> before capture;
// URLs carry a cb= cache-buster so Next's fetch cache can't serve a stale mode.

const MOCK_SCENARIOS = [
  { id: "bento-0", route: { slug: "mock-bento-0", path: "/skelbimai/mock-bento-0" }, widths: [390, 768, 1280] },
  { id: "bento-1", route: { slug: "mock-bento-1", path: "/skelbimai/mock-bento-1" }, widths: [390, 768, 1280] },
  { id: "bento-2", route: { slug: "mock-bento-2", path: "/skelbimai/mock-bento-2" }, widths: [390, 768, 1280] },
  { id: "bento-3", route: { slug: "mock-bento-3", path: "/skelbimai/mock-bento-3" }, widths: [390, 768, 1280] },
  { id: "bento-4", route: { slug: "mock-bento-4", path: "/skelbimai/mock-bento-4" }, widths: [390, 768, 1280] },
  { id: "bento-5", route: { slug: "mock-bento-5", path: "/skelbimai/mock-bento-5" }, widths: [390, 768, 1280] },
  { id: "stress-title-detail", route: { slug: "mock-stress-title", path: "/skelbimai/mock-stress-title" }, widths: [320, 344, 390, 430, 560, 768, 1024, 1280] },
  { id: "stress-title-feed", mode: "stress", route: { slug: "mock-stress-feed", path: "/skelbimai?q=stress" }, widths: [320, 344, 390, 430, 560, 768, 1024, 1280] },
  { id: "stress-numbers", route: { slug: "mock-stress-numbers", path: "/skelbimai/mock-stress-numbers" }, widths: [320, 390, 560, 980, 981, 1280] },
  { id: "empty-city", mode: "empty", route: { slug: "mock-empty-city", path: "/skelbimai?city=Palanga&cb=empty1" }, widths: [320, 390, 560, 768, 1280] },
  { id: "empty-filter", mode: "empty", route: { slug: "mock-empty-filter", path: "/skelbimai?cat=kids&delivery=1&cb=empty2" }, widths: [320, 390, 560, 768, 1280] },
  { id: "error-feed", mode: "error", route: { slug: "mock-error-feed", path: "/skelbimai?cb=err1" }, widths: [390, 1280] },
  { id: "error-home", mode: "error", route: { slug: "mock-error-home", path: "/" }, widths: [390, 1280] },
  { id: "pag-first", mode: "paginate", route: { slug: "mock-pag-first", path: "/skelbimai?cb=pag1" }, widths: [320, 390, 768, 1280] },
  { id: "pag-mid", mode: "paginate", route: { slug: "mock-pag-mid", path: "/skelbimai?page=4&cb=pag2" }, widths: [320, 390, 768, 1280] },
  { id: "pag-last", mode: "paginate", route: { slug: "mock-pag-last", path: "/skelbimai?page=8&cb=pag3" }, widths: [320, 390, 768, 1280] },
  { id: "pag-overflow", mode: "paginate", route: { slug: "mock-pag-overflow", path: "/skelbimai?page=999&cb=pag4" }, widths: [320, 390, 768, 1280] },
  { id: "cancel-success", cancel: true, route: { slug: "mock-cancel-success", path: "/cancel-deletion?token=mock-success" }, widths: [320, 390, 768, 1280] },
  { id: "cancel-submitting", cancel: true, quickShot: true, route: { slug: "mock-cancel-submitting", path: "/cancel-deletion?token=mock-slow" }, widths: [320, 390, 768, 1280] },
  { id: "cancel-invalid", cancel: true, route: { slug: "mock-cancel-invalid", path: "/cancel-deletion?token=mock-invalid" }, widths: [320, 390, 768, 1280] },
  { id: "cancel-already", cancel: true, route: { slug: "mock-cancel-already", path: "/cancel-deletion?token=mock-already" }, widths: [320, 390, 768, 1280] },
  { id: "cancel-error", cancel: true, route: { slug: "mock-cancel-error", path: "/cancel-deletion?token=mock-error" }, widths: [320, 390, 768, 1280] },
  { id: "long-owner", route: { slug: "mock-long-owner", path: "/skelbimai/mock-long-owner" }, widths: [320, 390, 560] },
];

/* ---------------- Plan expansion ---------------- */

const jobs = [];
const seenIds = new Set();

function addJob(job) {
  const dprSuffix = job.dpr === 2 ? "-dpr2" : "";
  job.id = `${job.routeSlug}/${job.state}-${job.locale}-${pad(job.width)}x${pad(job.height)}${dprSuffix}`;
  if (seenIds.has(job.id)) {
    return;
  }
  seenIds.add(job.id);
  jobs.push(job);
}

function baseJob({ group, tier, route, locale, w, h, dpr, shots = "both" }) {
  addJob({
    group, tier, routeSlug: route.slug, path: route.path, state: "base",
    locale, width: w, height: h ?? heightFor(w), dpr: dpr ?? dprFor(w), shots,
  });
}

// p1 — LT TIER-1 backbone over primary routes.
for (const route of P1_ROUTES) {
  for (const w of TIER1_WIDTHS) {
    baseJob({ group: "p1", tier: 1, route, locale: "lt", w });
  }
}
// tier2 — boundary pairs, primary routes (legal-only cluster scoped).
for (const route of P1_ROUTES) {
  const widths = route.slug === "legal-terms" ? [...TIER2_WIDTHS, ...TIER2_LEGAL_ONLY] : TIER2_WIDTHS;
  for (const w of widths) {
    baseJob({ group: "tier2", tier: 2, route, locale: "lt", w });
  }
}
for (const w of [1119, 1121]) {
  baseJob({ group: "tier2", tier: 2, route: routeBySlug["invite-code"], locale: "lt", w });
}
// en — EN halved sweep over primary routes (P2/P3 EN lives in their groups).
for (const route of P1_ROUTES) {
  for (const w of EN_WIDTHS) {
    baseJob({ group: "en", tier: 1, route, locale: "en", w });
  }
}
// p2 — secondary routes: LT TIER-1 + EN halved.
for (const route of P2_ROUTES) {
  for (const w of TIER1_WIDTHS) {
    baseJob({ group: "p2", tier: 1, route, locale: "lt", w });
  }
  for (const w of EN_WIDTHS) {
    baseJob({ group: "p2", tier: 1, route, locale: "en", w });
  }
}
// p3 — tertiary routes: sampled widths.
for (const route of P3_ROUTES) {
  for (const w of P3_WIDTHS) {
    baseJob({ group: "p3", tier: 1, route, locale: "lt", w });
  }
  for (const w of P3_EN_WIDTHS) {
    baseJob({ group: "p3", tier: 1, route, locale: "en", w });
  }
}
// states — interaction recipes + the height/orientation matrix.
for (const hm of HEIGHT_MATRIX) {
  for (const slug of hm.routes) {
    const route = routeBySlug[slug];
    if (route) {
      baseJob({ group: "states", tier: 1, route, locale: "lt", w: hm.w, h: hm.h });
    }
  }
}
for (const recipe of STATES) {
  for (const slug of recipe.routes) {
    const route = routeBySlug[slug];
    if (!route) continue;
    for (const at of recipe.at) {
      const w = typeof at === "number" ? at : at.w;
      const h = typeof at === "number" ? heightFor(at) : at.h;
      for (const locale of recipe.locales ?? ["lt"]) {
        addJob({
          group: "states", tier: 1, routeSlug: route.slug, path: route.path,
          state: recipe.id, locale, width: w, height: h,
          dpr: recipe.dpr ?? dprFor(w), shots: "custom", recipe,
        });
      }
    }
  }
}
// tier3 — ultrawide/parity spot-checks.
for (const slug of TIER3_ROUTE_SLUGS) {
  const route = routeBySlug[slug];
  if (!route) continue;
  for (const w of TIER3_WIDTHS) {
    baseJob({ group: "tier3", tier: 3, route, locale: "lt", w });
  }
}
// textspacing — WCAG 1.4.12 injection pass.
for (const slug of TEXTSPACING_ROUTES) {
  const route = routeBySlug[slug];
  if (!route) continue;
  for (const w of TEXTSPACING_WIDTHS) {
    addJob({
      group: "textspacing", tier: 1, routeSlug: route.slug, path: route.path,
      state: "textspacing", locale: "lt", width: w, height: heightFor(w),
      dpr: dprFor(w), shots: "fp", textSpacing: true,
    });
  }
}
// mock — controlled backend states (dev server + node mock on :4141).
// Cancel-deletion is click-triggered: confirm, then shoot (immediately for the
// slow-token "submitting" spinner, else after the state settles).
const cancelRecipe = (quickShot) => ({
  run: async (page, h) => {
    await clickIfReady(page, "main .nk-btn--primary");
    await page.waitForTimeout(quickShot ? 500 : 1500);
    await h.shoot("", { fullPage: false });
    await h.shoot("", { fullPage: true });
  },
});
for (const sc of MOCK_SCENARIOS) {
  for (const w of sc.widths) {
    addJob({
      group: "mock", tier: 1, routeSlug: sc.route.slug, path: sc.route.path,
      state: "base", locale: "lt", width: w, height: heightFor(w), dpr: dprFor(w),
      shots: sc.cancel ? "custom" : "both",
      recipe: sc.cancel ? cancelRecipe(Boolean(sc.quickShot)) : undefined,
      mock: { scenario: sc.id, mode: sc.mode ?? sc.id },
    });
  }
}

/* ---------------- Selection ---------------- */

let selected = jobs.filter((j) => GROUPS.includes(j.group));
if (LOCALE_ARG && LOCALE_ARG !== "both") {
  selected = selected.filter((j) => j.locale === LOCALE_ARG);
}
if (ROUTE_FILTER) {
  selected = selected.filter((j) => ROUTE_FILTER.includes(j.routeSlug));
}
if (WIDTH_FILTER) {
  selected = selected.filter((j) => WIDTH_FILTER.includes(j.width));
}
if (SCENARIO_FILTER) {
  selected = selected.filter((j) => j.mock?.scenario === SCENARIO_FILTER);
}
if (SHARD) {
  const [i, n] = SHARD.split("/").map(Number);
  const slugsInOrder = [...new Set(selected.map((j) => j.routeSlug))];
  selected = selected.filter((j) => slugsInOrder.indexOf(j.routeSlug) % n === i - 1);
}
// Sort by route, then context key, so workers reuse contexts and route folders
// complete atomically for streaming handoff to audit agents.
selected.sort((a, b) =>
  a.routeSlug.localeCompare(b.routeSlug) || a.locale.localeCompare(b.locale) ||
  a.width - b.width || a.height - b.height || a.state.localeCompare(b.state));

fs.mkdirSync(OUT, { recursive: true });
const planCounts = {};
for (const j of jobs) {
  planCounts[j.group] = (planCounts[j.group] ?? 0) + 1;
}
fs.writeFileSync(path.join(OUT, "plan.json"), JSON.stringify({
  base: BASE, api: API_BASE, groups: planCounts, totalJobs: jobs.length,
  jobs: jobs.map((job) => Object.fromEntries(Object.entries(job).filter(([k]) => k !== "recipe"))),
}, null, 2));

console.log(`Plan: ${jobs.length} jobs total — ${Object.entries(planCounts).map(([g, c]) => `${g}:${c}`).join("  ")}`);
console.log(`Selected (${GROUPS.join(",")}${SHARD ? ` shard ${SHARD}` : ""}): ${selected.length} jobs`);
if (DRY_RUN) {
  process.exit(0);
}

/* ---------------- Execution ---------------- */

const NDJSON = path.join(OUT, "manifest.ndjson");
const done = new Set();
if (RESUME && fs.existsSync(NDJSON)) {
  for (const line of fs.readFileSync(NDJSON, "utf8").split("\n")) {
    if (!line.trim()) continue;
    try {
      const entry = JSON.parse(line);
      if (entry.id && !entry.error) done.add(entry.id);
    } catch { /* tolerate torn tail line */ }
  }
  const before = selected.length;
  selected = selected.filter((j) => !done.has(j.id));
  console.log(`Resume: skipping ${before - selected.length} completed jobs`);
}

const remainingPerRoute = {};
for (const j of selected) {
  remainingPerRoute[j.routeSlug] = (remainingPerRoute[j.routeSlug] ?? 0) + 1;
}

const append = (entry) => fs.appendFileSync(NDJSON, JSON.stringify(entry) + "\n");
const browser = await chromium.launch();
let cursor = 0;
let ok = 0, failed = 0, overflowCount = 0;
const startAt = Date.now();

async function setMockMode(mode) {
  try {
    await fetch(`${MOCK_CONTROL}/__mode?set=${mode}`);
  } catch (err) {
    console.warn(`⚠ mock control unreachable (${MOCK_CONTROL}): ${err.message}`);
  }
}

async function runJob(ctx, job) {
  const dir = path.join(OUT, job.routeSlug);
  fs.mkdirSync(dir, { recursive: true });
  const files = [];
  let textureClamped = false;
  const jobStart = Date.now();
  const page = await ctx.newPage();
  try {
    if (job.mock) {
      await setMockMode(job.mock.mode);
    }
    const prefix = job.locale === "en" ? "/en" : "";
    const pathPart = job.path === "/" && job.locale === "en" ? "" : job.path;
    await gotoWithRetry(page, `${BASE}${prefix}${pathPart}`);
    await settle(page, {
      revealKill: !job.recipe?.noRevealKill,
      extraCss: job.textSpacing ? TEXT_SPACING : undefined,
    });

    const name = (sub, kind) =>
      path.join(dir, `${job.state}${sub ? `-${sub}` : ""}-${job.locale}-${pad(job.width)}x${pad(job.height)}${job.dpr === 2 ? "-dpr2" : ""}-${kind}.png`);
    const shoot = async (sub, { fullPage }) => {
      if (fullPage) {
        const res = await fullPageShot(page, name(sub, "fp"));
        files.push(...res.files);
        textureClamped = textureClamped || res.textureClamped;
        return;
      }
      const p = name(sub, "vp");
      await page.screenshot({ path: p, fullPage: false });
      files.push(p);
    };

    if (job.shots === "custom") {
      await job.recipe.run(page, { shoot, ctx, base: BASE, job });
    } else {
      if (job.shots === "both" || job.shots === "vp") {
        await shoot("", { fullPage: false });
      }
      if (job.shots === "both" || job.shots === "fp") {
        await shoot("", { fullPage: true });
      }
    }

    const metrics = await collectMetrics(page);
    if (metrics.scrollOverflow > 1) {
      overflowCount += 1;
    }
    append({
      id: job.id, group: job.group, tier: job.tier, route: job.routeSlug,
      url: `${job.locale === "en" ? "/en" : ""}${job.path}`, state: job.state,
      locale: job.locale, width: job.width, height: job.height, dpr: job.dpr,
      device: Math.min(job.width, job.height) <= 680 ? "phone" : "desktop",
      files: files.map((f) => path.relative(OUT, f)), textureClamped,
      apiMode: job.mock ? "mock" : "live", mockScenario: job.mock?.scenario ?? null,
      zoomEquivalent: job.width === 640 ? "1280@200%" : undefined,
      durationMs: Date.now() - jobStart, metrics,
    });
    ok += 1;
  } catch (err) {
    append({ id: job.id, group: job.group, route: job.routeSlug, error: String(err).slice(0, 300) });
    failed += 1;
    console.warn(`✗ ${job.id}: ${String(err).slice(0, 120)}`);
  } finally {
    await page.close().catch(() => {});
    remainingPerRoute[job.routeSlug] -= 1;
    if (remainingPerRoute[job.routeSlug] === 0) {
      append({ routeComplete: job.routeSlug, group: job.group });
      console.log(`▣ route complete: ${job.routeSlug}`);
    }
  }
}

async function worker() {
  let ctx = null;
  let ctxKey = null;
  while (cursor < selected.length) {
    const job = selected[cursor];
    cursor += 1;
    const key = `${job.width}x${job.height}@${job.dpr}${job.mock ? "-csp" : ""}`;
    if (key !== ctxKey) {
      if (ctx) {
        await ctx.close().catch(() => {});
      }
      ctx = await browser.newContext(contextOptions({
        width: job.width, height: job.height, dpr: job.dpr, bypassCSP: Boolean(job.mock),
      }));
      ctxKey = key;
    }
    await runJob(ctx, job);
    const doneCount = ok + failed;
    if (doneCount % 25 === 0) {
      const rate = doneCount / ((Date.now() - startAt) / 1000);
      console.log(`… ${doneCount}/${selected.length} (${rate.toFixed(1)}/s, ${failed} failed, ${overflowCount} overflows)`);
    }
  }
  if (ctx) {
    await ctx.close().catch(() => {});
  }
}

await Promise.all(Array.from({ length: Math.min(CONCURRENCY, selected.length) }, () => worker()));
await browser.close();

/* ---------------- Compile manifest + failures ---------------- */

const captures = [];
for (const line of fs.readFileSync(NDJSON, "utf8").split("\n")) {
  if (!line.trim()) continue;
  try {
    const entry = JSON.parse(line);
    if (entry.id) captures.push(entry);
  } catch { /* tolerate torn tail line */ }
}
fs.writeFileSync(path.join(OUT, "manifest.json"), JSON.stringify({ base: BASE, api: API_BASE, captures }, null, 2));
const failures = captures
  .filter((c) => c.error || c.metrics?.blank || (c.metrics?.scrollOverflow ?? 0) > 1 || c.metrics?.clipped?.length || c.metrics?.smallTargets?.length || c.metrics?.tightTargetPairs?.length || c.metrics?.overlapPairs?.length)
  .map((c) => ({
    id: c.id, error: c.error ?? null, blank: c.metrics?.blank ?? null,
    overflow: c.metrics?.scrollOverflow ?? null, offenders: c.metrics?.overflowOffenders?.slice(0, 3) ?? [],
    clipped: c.metrics?.clipped?.length ?? 0, smallTargets: c.metrics?.smallTargets?.length ?? 0,
    tightPairs: c.metrics?.tightTargetPairs?.length ?? 0, overlaps: c.metrics?.overlapPairs?.length ?? 0,
  }));
fs.writeFileSync(path.join(OUT, "failures.json"), JSON.stringify(failures, null, 2));

console.log(`\nDone: ${ok} ok, ${failed} failed in ${Math.round((Date.now() - startAt) / 1000)}s → ${OUT}`);
console.log(`Metric leads: ${failures.length} (failures.json)`);
if (overflowCount > 0 || failed > 0) {
  process.exitCode = 1;
}
