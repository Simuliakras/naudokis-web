import { readFileSync } from "node:fs";

const envText = (() => {
  try { return readFileSync(".env.local", "utf8"); } catch { return ""; }
})();
const env = Object.fromEntries(envText.split(/\r?\n/).flatMap((line) => {
  const match = line.match(/^([A-Z0-9_]+)=(.*)$/);
  return match ? [[match[1], match[2].replace(/^['"]|['"]$/g, "")]] : [];
}));
const value = (key) => process.env[key] || env[key] || "";
const fingerprintPattern = /^(?:[0-9A-F]{2}:){31}[0-9A-F]{2}$/;
const fingerprints = value("ANDROID_APP_LINK_SHA256_CERT_FINGERPRINTS")
  .split(/[,;\n]/).map((item) => item.trim().toUpperCase()).filter(Boolean);
const problems = [];
if (fingerprints.length < 2 || fingerprints.some((item) => !fingerprintPattern.test(item))) {
  problems.push("ANDROID_APP_LINK_SHA256_CERT_FINGERPRINTS must contain two valid SHA-256 fingerprints");
}
const oneLink = value("NEXT_PUBLIC_ONELINK_URL");
try {
  if (!oneLink || new URL(oneLink).protocol !== "https:") problems.push("NEXT_PUBLIC_ONELINK_URL must be an absolute HTTPS URL");
} catch { problems.push("NEXT_PUBLIC_ONELINK_URL is invalid"); }
const aasa = JSON.parse(readFileSync("public/.well-known/apple-app-site-association", "utf8"));
const appId = aasa?.applinks?.details?.[0]?.appID;
const paths = aasa?.applinks?.details?.[0]?.paths;
if (!/^[A-Z0-9]{10}\.[A-Za-z0-9.-]+$/.test(appId || "")) problems.push("AASA appID must be <TeamID>.<bundleID>");
if (!Array.isArray(paths) || !paths.includes("/listing/*") || !paths.includes("/invite")) problems.push("AASA is missing required listing/invite paths");

const base = process.argv[2];
if (base) {
  for (const path of ["/.well-known/apple-app-site-association", "/.well-known/assetlinks.json"]) {
    const response = await fetch(new URL(path, base), { redirect: "manual" });
    if (response.status !== 200) problems.push(`${path} returned ${response.status}, expected 200`);
    if (!response.headers.get("content-type")?.includes("application/json")) problems.push(`${path} is not application/json`);
  }
}
if (problems.length) {
  console.error(problems.map((problem) => `✗ ${problem}`).join("\n"));
  process.exit(1);
}
console.log("✓ App-link configuration and association files passed validation");
