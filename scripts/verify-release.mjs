#!/usr/bin/env node
// Pre-promotion gate. Audits a BUILT, RUNNING server (RELEASE_ORIGIN) — never the
// legacy www.naudokis.lt deployment. See "Release verification" in README.md.
import { readFile } from "node:fs/promises";

const PRODUCTION_API = "https://api.naudokis.lt";
const TIMEOUT_MS = 15_000;
const origin = new URL(process.env.RELEASE_ORIGIN ?? "http://127.0.0.1:3000");
const failures = [];

function check(condition, message) {
  if (!condition) failures.push(message);
}

// Single source of truth: the canonical origin the app itself builds URLs from.
// Hardcoding it here would let this gate keep passing after the app's own constant
// changed — the one failure a release gate must never have.
async function canonicalOrigin() {
  const source = await readFile(new URL("../app/lib/contact.ts", import.meta.url), "utf8");
  const match = source.match(/SITE_ORIGIN\s*=\s*"([^"]+)"/);
  if (!match) {
    throw new Error("could not read SITE_ORIGIN from app/lib/contact.ts");
  }
  return match[1];
}

// Every request is bounded: a hung origin must fail the gate, not hang CI.
async function get(path, init) {
  const response = await fetch(new URL(path, origin), {
    redirect: "manual",
    signal: AbortSignal.timeout(TIMEOUT_MS),
    ...init,
  });
  return { response, text: await response.text() };
}

// NEXT_PUBLIC_* values are inlined at BUILD time, so these only prove what the
// *script's* environment says. They catch an unconfigured release, not a
// mis-built one — the robots/sitemap assertions below are what actually inspect
// the served output. README.md spells out the same caveat.
const configuredApi = process.env.NEXT_PUBLIC_API_BASE_URL ?? PRODUCTION_API;
check(configuredApi === PRODUCTION_API, `NEXT_PUBLIC_API_BASE_URL must be ${PRODUCTION_API}, got ${configuredApi}`);
check(Boolean(process.env.NEXT_PUBLIC_PLAUSIBLE_DOMAIN), "NEXT_PUBLIC_PLAUSIBLE_DOMAIN is required for analytics and Web Vitals RUM");
check(Boolean(process.env.NEXT_PUBLIC_SENTRY_DSN), "NEXT_PUBLIC_SENTRY_DSN is required for release error monitoring");

try {
  const site = await canonicalOrigin();
  const [
    { response: home, text: html },
    { response: robots, text: robotsText },
    { response: sitemap, text: sitemapText },
    { response: pagesSitemap, text: pagesSitemapText },
  ] = await Promise.all([
    get("/"),
    get("/robots.txt"),
    get("/sitemap.xml"),
    get("/pages/sitemap.xml"),
  ]);

  check(home.status === 200, `/ returned ${home.status}`);
  check(!/name="robots" content="noindex/i.test(html), "homepage is marked noindex");
  check(
    new RegExp(`<link[^>]+rel="canonical"[^>]+href="${site.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}/?"`, "i").test(html),
    `homepage canonical is not ${site}/`,
  );
  check(home.headers.get("content-security-policy")?.includes("frame-ancestors 'none'"), "security CSP is missing");

  check(robots.status === 200, `/robots.txt returned ${robots.status}`);
  check(robotsText.includes(`Sitemap: ${site}/sitemap.xml`), "robots.txt is missing the canonical sitemap index");
  check(!robotsText.includes("api-dev"), "robots.txt contains a dev API reference");

  // /sitemap.xml is a sitemap INDEX (<sitemapindex>): it carries only <loc>s to
  // child sitemaps, so it must reference the pages child, or a crawler reading only
  // the index discovers nothing.
  check(sitemap.status === 200, `/sitemap.xml returned ${sitemap.status}`);
  check(sitemap.headers.get("content-type")?.includes("xml"), "sitemap.xml does not have an XML content type");
  check(sitemapText.includes("<sitemapindex"), "sitemap.xml is not a <sitemapindex>");
  check(sitemapText.includes(`${site}/pages/sitemap.xml`), "sitemap index does not reference the pages sitemap");

  // The actual page URLs live in the pages child, so the homepage-present and
  // no-dev-API-leak checks belong there rather than on the index.
  check(pagesSitemap.status === 200, `/pages/sitemap.xml returned ${pagesSitemap.status}`);
  check(pagesSitemapText.includes(`${site}/`), "pages sitemap is missing the canonical homepage");
  check(!pagesSitemapText.includes("api-dev"), "pages sitemap contains a dev API reference");

  // A production catalogue with public inventory must advertise at least one listing
  // sitemap. The shards are referenced from the sitemap index now (not robots.txt),
  // so assert against the index. This catches the exact release failure where a
  // build used api-dev and silently generated only the static sitemap.
  const catalogue = await fetch(`${PRODUCTION_API}/listings?limit=5`, {
    cache: "no-store",
    signal: AbortSignal.timeout(TIMEOUT_MS),
  });
  if (catalogue.ok) {
    const body = await catalogue.json();
    const hasActiveListings = Array.isArray(body?.data?.items) && body.data.items.some((item) => item?.id && item?.status === "active");
    if (hasActiveListings) {
      check(sitemapText.includes("/listings/sitemap/0.xml"), "sitemap index is missing listing sitemap 0 despite active production inventory");
    }
  }

  const vital = await fetch(new URL("/api/web-vitals", origin), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    signal: AbortSignal.timeout(TIMEOUT_MS),
    body: JSON.stringify({
      path: "/release-check",
      name: "LCP",
      value: 1,
      delta: 1,
      rating: "good",
      navigationType: "navigate",
    }),
  });
  check(vital.status === 204, `/api/web-vitals returned ${vital.status} for a valid metric`);
  check(vital.headers.get("cache-control")?.includes("no-store"), "/api/web-vitals is not marked no-store");
} catch (error) {
  failures.push(`could not audit ${origin.origin}: ${error instanceof Error ? error.message : String(error)}`);
}

if (failures.length) {
  console.error(`Release verification failed (${failures.length}):`);
  failures.forEach((failure) => console.error(`- ${failure}`));
  process.exit(1);
}

console.log(`Release verification passed for ${origin.origin}`);
