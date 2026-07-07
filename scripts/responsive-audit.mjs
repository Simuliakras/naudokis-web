#!/usr/bin/env node
import { chromium } from "@playwright/test";
import fs from "node:fs/promises";
import path from "node:path";

export const WIDTHS = [
  320, 344, 360, 375, 390, 393, 412, 430, 480, 540, 560, 600, 640, 700, 744, 768,
  820, 834, 900, 980, 1024, 1112, 1120, 1180, 1200, 1280, 1366, 1440, 1536, 1728,
  1920, 2560,
];

const BASE_URL = process.env.BASE_URL ?? "http://127.0.0.1:3001";
const OUT = process.env.RESPONSIVE_AUDIT_OUT
  ? path.resolve(process.env.RESPONSIVE_AUDIT_OUT)
  : path.resolve("screenshots", "responsive-audit");
const QUICK = process.argv.includes("--quick");

const QUICK_WIDTHS = [320, 390, 560, 768, 1024, 1366, 1920];
const widths = QUICK ? QUICK_WIDTHS : WIDTHS;

const ROUTES = [
  { id: "home", path: "/" },
  { id: "home-en", path: "/en" },
  { id: "feed", path: "/skelbimai" },
  { id: "feed-en", path: "/en/skelbimai" },
  { id: "feed-long-search", path: "/skelbimai?q=profesionali%20fotografijos%20iranga%20renginiams%20su%20pristatymu" },
  { id: "feed-zero", path: "/skelbimai?q=zzzzzzzzzzzzzzzzzz" },
  { id: "feed-filtered", path: "/skelbimai?sort=price_desc&delivery=1&price=10-30" },
  { id: "categories", path: "/kategorijos" },
  { id: "categories-en", path: "/en/kategorijos" },
  { id: "how-it-works", path: "/kaip-tai-veikia" },
  { id: "how-it-works-en", path: "/en/kaip-tai-veikia" },
  { id: "legal-center", path: "/teisine" },
  { id: "terms", path: "/naudojimosi-salygos" },
  { id: "privacy", path: "/privatumo-politika" },
  { id: "account-deletion", path: "/paskyros-trynimas" },
  { id: "invite", path: "/invite?code=RESPONSIVE2026LONGCODE" },
  { id: "invite-invalid", path: "/invite?code=invalid-code-that-wraps-at-phone-widths" },
  { id: "not-found", path: "/this-route-does-not-exist" },
];

const INTERACTIONS = [
  {
    id: "mobile-drawer",
    path: "/",
    widths: [320, 390, 430, 744],
    open: async (page) => {
      await clickIfReady(page, ".nk-nav-burger");
      await page.waitForTimeout(250);
    },
  },
  {
    id: "filter-sheet",
    path: "/skelbimai",
    widths: [320, 390, 430, 560],
    open: async (page) => {
      await clickIfReady(page, ".nk-filters-mobilebtn");
      await page.waitForTimeout(250);
    },
  },
  {
    id: "legal-toc",
    path: "/naudojimosi-salygos",
    widths: [320, 390, 768, 1024],
    open: async (page) => {
      await clickIfReady(page, ".nk-lg-fab-toc");
      await page.waitForTimeout(250);
    },
  },
  {
    id: "app-redirect",
    path: "/",
    widths: [320, 390, 768, 1366],
    open: async (page) => {
      await clickIfReady(page, ".nk-nav-cta");
      await page.waitForTimeout(350);
    },
  },
];

const REVEAL_KILL = `
  .nk-reveal, .nk-reveal-grid > *, .nk-hero-intro > *, .nk-hero-media {
    animation: none !important;
    opacity: 1 !important;
    transform: none !important;
  }
`;

async function clickIfReady(page, selector, timeout = 3000) {
  const locator = page.locator(selector).first();
  if ((await locator.count()) === 0) {
    return false;
  }
  try {
    await locator.waitFor({ state: "visible", timeout });
    await locator.click({ timeout });
    return true;
  } catch {
    return false;
  }
}

function heightsFor(width) {
  if (width <= 360) return [568, 667, 780];
  if (width <= 430) return [667, 844, 896, 932];
  if (width <= 560) return [568, 780, 932];
  if (width <= 700) return [667, 900];
  if (width <= 900) return [900, 1112, 1180];
  if (width <= 1200) return [768, 800, 900];
  if (width <= 1536) return [800, 900, 1080];
  return [1080, 1200, 1440];
}

function selectedHeightsFor(width) {
  const heights = heightsFor(width);
  if (!QUICK) return heights;
  return width <= 430 ? [heights[0], heights[heights.length - 1]] : [heights[0]];
}

function slug(input) {
  return input.replace(/[^a-z0-9-]+/gi, "-").replace(/^-|-$/g, "").toLowerCase();
}

async function settle(page) {
  await page.addStyleTag({ content: REVEAL_KILL });
  await page.evaluate(() => document.fonts?.ready);
  await page.waitForTimeout(800);
}

async function gotoWithRetry(page, url, attempts = 3) {
  let lastError;
  for (let i = 0; i < attempts; i += 1) {
    try {
      await page.goto(url, { waitUntil: "domcontentloaded" });
      return;
    } catch (error) {
      lastError = error;
      await page.waitForTimeout(350 * (i + 1));
    }
  }
  throw lastError;
}

async function discoverListingPath(page) {
  await gotoWithRetry(page, new URL("/skelbimai", BASE_URL).toString());
  await settle(page);
  const href = await page.locator('a[href*="/skelbimai/"]').first().getAttribute("href").catch(() => null);
  return href ? new URL(href, BASE_URL).pathname : null;
}

async function metrics(page) {
  return page.evaluate(() => {
    const root = document.scrollingElement || document.documentElement;
    const viewport = { width: window.innerWidth, height: window.innerHeight };
    // Attribute a finding to the nearest semantic landmark, labelled tag#id /
    // tag.firstClass (no bespoke data-* hooks in the prod markup).
    const labelFor = (el) => {
      const tag = el.tagName.toLowerCase();
      if (el.id) return `${tag}#${el.id}`;
      const cls = String(el.className || "").trim().split(/\s+/)[0];
      return cls ? `${tag}.${cls}` : tag;
    };
    const sectionFor = (el) => {
      const landmark = el.closest("main, section, header, footer, nav, aside");
      return landmark ? labelFor(landmark) : "unknown";
    };
    const rectOf = (el) => {
      const r = el.getBoundingClientRect();
      return { x: Math.round(r.x), y: Math.round(r.y), w: Math.round(r.width), h: Math.round(r.height) };
    };
    const visible = (el) => {
      const r = el.getBoundingClientRect();
      const cs = getComputedStyle(el);
      return r.width > 0 && r.height > 0 && cs.visibility !== "hidden" && cs.display !== "none";
    };
    const clipped = [...document.querySelectorAll("button, a, label, .nk-pillctl__label, .nk-toggle__lead, h1, h2, h3, p, span")]
      .filter((el) => visible(el) && !el.closest("[aria-hidden='true']"))
      .filter((el) => {
        const cs = getComputedStyle(el);
        const intentional = cs.textOverflow === "ellipsis" || cs.webkitLineClamp !== "none" || el.classList.contains("nk-sr-only");
        return !intentional && (el.scrollWidth > el.clientWidth + 1 || el.scrollHeight > el.clientHeight + 1);
      })
      .slice(0, 30)
      .map((el) => ({ section: sectionFor(el), selector: el.tagName.toLowerCase() + (el.className ? "." + String(el.className).trim().split(/\s+/).join(".") : ""), text: (el.textContent || "").trim().slice(0, 90), rect: rectOf(el) }));
    const smallTargets = [...document.querySelectorAll("button, a, input, select, textarea, [role='button'], [tabindex]:not([tabindex='-1'])")]
      .filter((el) => visible(el) && !el.closest("[aria-hidden='true']"))
      .filter((el) => {
        const r = el.getBoundingClientRect();
        const primary = el.classList.contains("nk-btn") || el.classList.contains("nk-nav-cta") || el.classList.contains("nk-filters-mobilebtn");
        const min = primary ? 44 : 24;
        return r.width < min || r.height < min;
      })
      .slice(0, 30)
      .map((el) => ({ section: sectionFor(el), selector: el.tagName.toLowerCase() + (el.className ? "." + String(el.className).trim().split(/\s+/).join(".") : ""), rect: rectOf(el) }));
    const sticky = [...document.querySelectorAll("*")]
      .filter((el) => {
        const pos = getComputedStyle(el).position;
        const rect = el.getBoundingClientRect();
        const intersectsViewport = rect.bottom > 0 && rect.top < viewport.height;
        const pinned = pos === "fixed" || rect.top <= 120 || viewport.height - rect.bottom <= 80;
        return (pos === "fixed" || pos === "sticky") && pinned && visible(el) && intersectsViewport && getComputedStyle(el).opacity !== "0";
      })
      .map((el) => {
        const r = el.getBoundingClientRect();
        const visibleHeight = Math.max(0, Math.min(r.bottom, viewport.height) - Math.max(r.top, 0));
        return { section: sectionFor(el), selector: el.tagName.toLowerCase() + (el.className ? "." + String(el.className).trim().split(/\s+/).join(".") : ""), rect: rectOf(el), visibleHeight: Math.round(visibleHeight) };
      })
      .filter((item) => (item.rect.w > viewport.width * 0.5 && item.visibleHeight > viewport.height * 0.25) || item.rect.w > viewport.width + 2);
    const visibleContentCount = [...document.body.querySelectorAll("main, header, footer, nav, h1, h2, h3, p, a, button, img, svg")]
      .filter((el) => visible(el) && !el.closest("[aria-hidden='true']"))
      .length;
    const textLength = (document.body.innerText || "").trim().length;
    return {
      viewport,
      blank: textLength < 20 && visibleContentCount < 3,
      textLength,
      visibleContentCount,
      scrollOverflow: Math.max(0, root.scrollWidth - root.clientWidth),
      clipped,
      smallTargets,
      stickyRisks: sticky.slice(0, 20),
      sections: [...document.querySelectorAll("main, section, header, footer, nav")].filter(visible).map((el) => ({ id: labelFor(el), rect: rectOf(el) })),
    };
  });
}

async function capture(page, entry, width, height, suffix = "") {
  await page.setViewportSize({ width, height });
  await gotoWithRetry(page, new URL(entry.path, BASE_URL).toString());
  await settle(page);
  await page.evaluate(() => window.scrollTo(0, 0));
  if (entry.open) {
    await entry.open(page);
  }
  const id = `${slug(entry.id)}-${width}x${height}${suffix}`;
  const dir = path.join(OUT, slug(entry.id));
  await fs.mkdir(dir, { recursive: true });
  const firstViewport = path.join(dir, `${id}-viewport.png`);
  const fullPage = path.join(dir, `${id}-full.png`);
  await page.screenshot({ path: firstViewport, fullPage: false });
  await page.screenshot({ path: fullPage, fullPage: true });
  const m = await metrics(page);
  return { id, route: entry.path, width, height, firstViewport, fullPage, metrics: m };
}

async function main() {
  await fs.mkdir(OUT, { recursive: true });
  const browser = await chromium.launch();
  const page = await browser.newPage({ reducedMotion: "reduce" });
  const manifest = {
    baseUrl: BASE_URL,
    mode: QUICK ? "quick" : "full",
    generatedAt: new Date().toISOString(),
    widths,
    captures: [],
  };
  const listingPath = await discoverListingPath(page);
  const routes = listingPath ? [...ROUTES, { id: "listing-detail", path: listingPath }] : ROUTES;
  if (!listingPath) {
    console.warn("No listing detail URL found; listing-detail capture skipped.");
  }
  const selectedRoutes = QUICK ? routes.filter((r) => ["home", "feed", "categories", "listing-detail", "how-it-works", "terms", "invite", "not-found"].includes(r.id)) : routes;

  for (const route of selectedRoutes) {
    for (const width of widths) {
      for (const height of selectedHeightsFor(width)) {
        manifest.captures.push(await capture(page, route, width, height));
      }
    }
  }

  for (const interaction of INTERACTIONS) {
    const selected = QUICK ? interaction.widths.filter((w) => QUICK_WIDTHS.includes(w)) : interaction.widths;
    for (const width of selected) {
      const height = heightsFor(width)[0];
      manifest.captures.push(await capture(page, interaction, width, height, "-state"));
    }
  }

  await fs.writeFile(path.join(OUT, "manifest.json"), JSON.stringify(manifest, null, 2));
  await browser.close();

  const failures = manifest.captures
    .filter((c) => c.metrics.blank || c.metrics.scrollOverflow > 1 || c.metrics.clipped.length || c.metrics.smallTargets.length || c.metrics.stickyRisks.length)
    .map((c) => ({ id: c.id, blank: c.metrics.blank, overflow: c.metrics.scrollOverflow, clipped: c.metrics.clipped.length, smallTargets: c.metrics.smallTargets.length, stickyRisks: c.metrics.stickyRisks.length }));
  await fs.writeFile(path.join(OUT, "failures.json"), JSON.stringify(failures, null, 2));
  console.log(`Responsive audit wrote ${manifest.captures.length} captures to ${OUT}`);
  console.log(`Metric findings: ${failures.length}`);
  if (failures.length) {
    console.log(JSON.stringify(failures.slice(0, 20), null, 2));
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
