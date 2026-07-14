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
const configuredFingerprints = value("ANDROID_APP_LINK_SHA256_CERT_FINGERPRINTS")
  .split(/[,;\n]/).map((item) => item.trim().toUpperCase()).filter(Boolean);
const configuredPackage = value("ANDROID_APP_LINK_PACKAGE_NAME") || "com.naudokis.naudokis";

/* ---------------- AASA ---------------- */
const aasa = JSON.parse(readFileSync("public/.well-known/apple-app-site-association", "utf8"));
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
const claimedSegments = new Set(
  (Array.isArray(paths) ? paths : [])
    .map((path) => path.replace(/^\//, "").split("/")[0].replace(/\*$/, ""))
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
const matcher = readFileSync("proxy.ts", "utf8").match(/matcher:\s*\["([^"]+)"\]/)?.[1] ?? "";
const proxyExcluded = new Set(matcher.match(/\(\?!([^)]+)\)/)?.[1]?.split("|") ?? []);

for (const segment of claimedSegments) {
  if (!routable(segment)) {
    problems.push(`AASA claims "/${segment}" but app/[lang]/${segment} has no page — it would 404 for anyone without the app`);
  }
  if (proxyExcluded.has(segment)) {
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
  try {
    if (!oneLink || new URL(oneLink).protocol !== "https:") {
      problems.push("NEXT_PUBLIC_ONELINK_URL must be an absolute HTTPS URL");
    }
  } catch {
    problems.push("NEXT_PUBLIC_ONELINK_URL is invalid");
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
