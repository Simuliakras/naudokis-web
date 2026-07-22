// Guards the app-link contract.
//
// Two modes, because they answer different questions:
//   --static  structure only, no env needed → safe to run in CI on every PR.
//   (default) also checks release readiness (fingerprints, OneLink URL), which
//             depends on secrets and is therefore a deploy-time gate, not a PR gate.
//   [baseUrl] additionally fetches the live association files.
//
// The invariant that matters: every path claimed in the AASA must still resolve to
// a real page. It used to be backstopped by a static deep-link.html interstitial;
// now each is a real localized route, so a path claimed but not routed is a hard
// 404 — and it 404s ONLY for people without the app installed, which is nobody who
// tests it. Hence this check.
import { readFileSync, readdirSync, existsSync } from "node:fs";

const args = process.argv.slice(2);
const staticOnly = args.includes("--static");
const base = args.find((arg) => !arg.startsWith("--"));
const problems = [];
const envText = (() => {
  try { return readFileSync(".env.local", "utf8"); } catch { return ""; }
})();
const fileEnv = Object.fromEntries(envText.split(/\r?\n/).flatMap((line) => {
  const match = line.match(/^([A-Z0-9_]+)=(.*)$/);
  return match ? [[match[1], match[2].replace(/^['"]|['"]$/g, "")]] : [];
}));
const value = (key) => process.env[key] || fileEnv[key] || "";
const fingerprintPattern = /^(?:[0-9A-F]{2}:){31}[0-9A-F]{2}$/;
// Read from the i18n config rather than hardcoded: this is a .mjs script and cannot
// import the TS module, but a second copy of the locale list is exactly the kind of
// drift this script exists to catch.
const localeSource = readFileSync("app/lib/i18n/locales.ts", "utf8");
const locales = [...(localeSource.match(/export const locales = \[([^\]]+)\]/)?.[1] ?? "")
  .matchAll(/"([a-z-]+)"/g)].map((match) => match[1]);
if (locales.length === 0) {
  problems.push("could not read `locales` from app/lib/i18n/locales.ts");
}
const defaultLocale = localeSource.match(/export const defaultLocale: Locale = "([a-z-]+)"/)?.[1];
if (!defaultLocale) {
  problems.push("could not read `defaultLocale` from app/lib/i18n/locales.ts");
}
const configuredFingerprints = value("ANDROID_APP_LINK_SHA256_CERT_FINGERPRINTS")
  .split(/[,;\n]/).map((item) => item.trim().toUpperCase()).filter(Boolean);
const configuredPackage = value("ANDROID_APP_LINK_PACKAGE_NAME") || "com.naudokis.naudokis";

/* ---------------- AASA ---------------- */
// The AASA document is a lib module served by app/.well-known/apple-app-site-association/route.ts,
// not a public/ asset — a route handler is the only way to guarantee Apple's required
// application/json Content-Type on every host. This reads the same source the route serves.
const aasa = JSON.parse(readFileSync("app/lib/apple-app-site-association.json", "utf8"));
const appId = aasa?.applinks?.details?.[0]?.appID;
const paths = aasa?.applinks?.details?.[0]?.paths;
if (!/^[A-Z0-9]{10}\.[A-Za-z0-9.-]+$/.test(appId || "")) {
  problems.push("AASA appID must be <TeamID>.<bundleID>");
}
const expectedAppleAppId = value("APPLE_APP_ID");
if (expectedAppleAppId && appId !== expectedAppleAppId) {
  problems.push(`AASA appID ${appId} does not match APPLE_APP_ID ${expectedAppleAppId}`);
}
if (!Array.isArray(paths) || !paths.includes("/listing/*") || !paths.includes("/invite")) {
  problems.push("AASA is missing required listing/invite paths");
}

/* ---------------- Every AASA path resolves to a real, unshadowed route ---------------- */
// "/booking-request/*" → "booking-request". The first segment is all that decides
// which route file serves it, and whether the proxy matches it.
//
// A claim may carry an explicit locale prefix ("/en/skelbimai/*"): pages that are
// browsable in both locales are shared with the locale in the URL, so both forms
// have to be claimed. The prefix is not a route directory — app/[lang] has no "en"
// folder — so strip it before asking whether the segment routes.
//
// The segment itself is also spelled per locale ("/en/listings/*" is served by
// app/[lang]/skelbimai), so translate it back through the same table proxy.ts uses
// before looking for a route directory. Parsed out of the TS module rather than
// duplicated here — a second copy is exactly the drift this script exists to catch.
const segmentSource = readFileSync("app/lib/i18n/route-segments.ts", "utf8");
const internalSegments = new Map();
for (const locale of locales) {
  const block = segmentSource.match(new RegExp(`\\b${locale}:\\s*\\{([^}]*)\\}`))?.[1];
  if (!block) {
    problems.push(`could not read ROUTE_SEGMENTS.${locale} from app/lib/i18n/route-segments.ts`);
    continue;
  }
  for (const [, internal, publicSegment] of block.matchAll(/"?([a-z-]+)"?\s*:\s*"([a-z-]+)"/g)) {
    internalSegments.set(`${locale}:${publicSegment}`, internal);
  }
}

const LOCALE_PREFIX = new RegExp(`^/(${locales.join("|")})(?=/)`);
const claimedSegments = new Set(
  (Array.isArray(paths) ? paths : [])
    .map((path) => {
      const locale = path.match(LOCALE_PREFIX)?.[1] ?? defaultLocale;
      const publicSegment = path.replace(LOCALE_PREFIX, "").replace(/^\//, "").split("/")[0].replace(/\*$/, "");
      return internalSegments.get(`${locale}:${publicSegment}`) ?? publicSegment;
    })
    .filter(Boolean),
);

const routeRoot = "app/[lang]";
const routeDirs = new Set(
  readdirSync(routeRoot, { withFileTypes: true })
    .filter((entry) => entry.isDirectory() && !entry.name.startsWith("["))
    .map((entry) => entry.name),
);
// A claimed path may be a static page (app/[lang]/rewards/page.tsx) or a dynamic one
// (app/[lang]/chat/[id]/page.tsx) — either is fine, we only assert the segment routes.
const routable = (segment) => {
  if (!routeDirs.has(segment)) {
    return false;
  }
  const dir = `${routeRoot}/${segment}`;
  if (existsSync(`${dir}/page.tsx`)) {
    return true;
  }
  return readdirSync(dir, { withFileTypes: true }).some(
    (entry) => entry.isDirectory() && entry.name.startsWith("[") && existsSync(`${dir}/${entry.name}/page.tsx`),
  );
};

// The proxy must MATCH these paths (they need the locale rewrite). Anything listed
// in the matcher's negative lookahead is excluded from the proxy and would 404.
// Run the real matcher against a real path rather than parsing its exclusion list.
// The previous `\(\?!([^)]+)\)` parse stopped at the first ")" — which lands inside
// "(?:/|$)" — so the set was ["api(?:/", "$"] and this check could never fire.
// `readFileSync` returns the TS *source*, where a regex backslash is written "\\",
// so unescape before compiling.
const matcher = readFileSync("proxy.ts", "utf8").match(/matcher:\s*\["([^"]+)"\]/)?.[1] ?? "";
if (!matcher) {
  problems.push("could not read the proxy matcher from proxy.ts");
}
const matcherRe = matcher ? new RegExp(`^${matcher.replace(/\\\\/g, "\\")}$`) : undefined;
const proxyMatches = (segment) =>
  !matcherRe || (matcherRe.test(`/${segment}`) && matcherRe.test(`/${segment}/x`));

for (const segment of claimedSegments) {
  if (!routable(segment)) {
    problems.push(`AASA claims "/${segment}" but app/[lang]/${segment} has no page — it would 404 for anyone without the app`);
  }
  if (!proxyMatches(segment)) {
    problems.push(`proxy.ts matcher excludes "${segment}", so /${segment}/… never gets its locale rewrite and 404s`);
  }
}

// A next.config rewrite (this is how deep-link.html used to be served) would win over
// the page and silently resurrect the old behaviour.
if (/deep-link\.html/.test(readFileSync("next.config.ts", "utf8"))) {
  problems.push("next.config.ts still references deep-link.html — it would shadow the real handoff pages");
}

/* ---------------- Release readiness (needs secrets) ---------------- */
if (!staticOnly) {
  if (!expectedAppleAppId) {
    problems.push("APPLE_APP_ID must be configured as <TeamID>.<bundleID>");
  }
  if (configuredFingerprints.length < 1 || configuredFingerprints.some((item) => !fingerprintPattern.test(item))) {
    problems.push("ANDROID_APP_LINK_SHA256_CERT_FINGERPRINTS must contain at least one valid SHA-256 app-signing fingerprint");
  }
  const oneLink = value("NEXT_PUBLIC_ONELINK_URL");
  let oneLinkUrl;
  try {
    oneLinkUrl = new URL(oneLink);
    if (!oneLink || oneLinkUrl.protocol !== "https:") {
      problems.push("NEXT_PUBLIC_ONELINK_URL must be an absolute HTTPS URL");
      oneLinkUrl = undefined;
    }
  } catch {
    problems.push("NEXT_PUBLIC_ONELINK_URL is invalid");
  }
  // The OneLink host is a SECOND association surface, hosted by AppsFlyer from its
  // dashboard config — we cannot serve it, but the link we emit has to satisfy it.
  // It claimed "/LNBm/*" while we emitted the bare "/LNBm", so iOS matched nothing
  // and every consented install bounced to the App Store instead of opening the app
  // — silently, and only for people who already had it. Nothing checked this before.
  if (oneLinkUrl) {
    await verifyOneLinkAssociation(oneLinkUrl);
  }
}

// Apple's legacy `paths` matcher. Only the path is compared — query and fragment are
// ignored (App Search Programming Guide) — so "/LNBm/*" does NOT match "/LNBm": the
// pattern requires the literal separator before the wildcard.
function matchesApplePath(pattern, pathname) {
  const negated = pattern.startsWith("NOT ");
  const body = negated ? pattern.slice(4) : pattern;
  const regex = new RegExp(`^${body.replace(/[.+^${}()|[\]\\]/g, "\\$&").replace(/\*/g, ".*").replace(/\?/g, ".")}$`);
  return { matched: regex.test(pathname), negated };
}

async function verifyOneLinkAssociation(url) {
  const associationUrl = new URL("/.well-known/apple-app-site-association", url.origin);
  let claimed;
  try {
    const response = await fetch(associationUrl, { redirect: "manual" });
    if (response.status !== 200) {
      problems.push(`${associationUrl} returned ${response.status} — the OneLink host claims no iOS app, so links never open it`);
      return;
    }
    const json = await response.json();
    const detail = json?.applinks?.details?.find((entry) => entry?.appID === appId);
    if (!detail) {
      problems.push(`${associationUrl} does not claim ${appId} — configure Universal Links in the AppsFlyer OneLink template`);
      return;
    }
    claimed = detail.paths;
  } catch (error) {
    problems.push(`could not fetch ${associationUrl}: ${error.message}`);
    return;
  }
  if (!Array.isArray(claimed)) {
    return;
  }
  // Last matching entry wins, so a trailing "NOT " exclusion can still veto.
  const verdict = claimed
    .map((pattern) => matchesApplePath(pattern, url.pathname))
    .filter((result) => result.matched)
    .pop();
  if (!verdict || verdict.negated) {
    problems.push(
      `NEXT_PUBLIC_ONELINK_URL path "${url.pathname}" matches none of ${url.host}'s claimed paths ` +
      `${JSON.stringify(claimed)} — iOS will open Safari instead of the app. Add a path segment ` +
      `(e.g. "${url.pathname.replace(/\/$/, "")}/i") so it matches.`,
    );
  }
}

/* ---------------- Live association files ---------------- */
if (base) {
  let liveAasa;
  let liveAssetLinks;
  for (const path of ["/.well-known/apple-app-site-association", "/.well-known/assetlinks.json"]) {
    const response = await fetch(new URL(path, base), { redirect: "manual" });
    if (response.status !== 200) {
      problems.push(`${path} returned ${response.status}, expected 200`);
    }
    if (!response.headers.get("content-type")?.includes("application/json")) {
      problems.push(`${path} is not application/json`);
    }
    if (response.status === 200) {
      try {
        const json = await response.json();
        if (path.endsWith("assetlinks.json")) liveAssetLinks = json;
        else liveAasa = json;
      } catch {
        problems.push(`${path} did not contain valid JSON`);
      }
    }
  }
  const liveDetails = liveAasa?.applinks?.details;
  const liveMatch = Array.isArray(liveDetails) && liveDetails.some((detail) =>
    detail?.appID === appId && JSON.stringify(detail?.paths) === JSON.stringify(paths));
  if (!liveMatch) {
    problems.push("live AASA does not exactly match the repository appID and claimed paths");
  }
  const androidTarget = Array.isArray(liveAssetLinks)
    ? liveAssetLinks.find((statement) => statement?.target?.namespace === "android_app" && statement.target.package_name === configuredPackage)?.target
    : undefined;
  const liveFingerprints = androidTarget?.sha256_cert_fingerprints?.map((item) => String(item).toUpperCase()).sort();
  if (!androidTarget || JSON.stringify(liveFingerprints) !== JSON.stringify([...new Set(configuredFingerprints)].sort())) {
    problems.push("live assetlinks.json does not exactly match the configured package and app-signing fingerprints");
  }
}

if (problems.length) {
  console.error(problems.map((problem) => `✗ ${problem}`).join("\n"));
  process.exit(1);
}
console.log(`✓ App-link ${staticOnly ? "structure" : "configuration and association files"} passed validation`);
