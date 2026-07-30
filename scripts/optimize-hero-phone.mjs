// Pre-encoder for the home hero's phone mockup.
//
//   yarn gen:hero-phone
//
// This asset is the largest real thing the desktop hero paints, and it was the
// single most expensive resource on the page: next/image served it as a 123 KB
// WebP, and on the throttled-mobile profile (1.6 Mbps) it was discovered by the
// preload scanner at 281 ms and did not finish until 3231 ms. Everything else in
// the hero had painted 2 s earlier.
//
// Pre-encoding to AVIF rather than adding "image/avif" to `images.formats` in
// next.config.ts is deliberate, and the reason is written there: AVIF's first-
// request encode is materially slower, which would land on listing pages whose
// LCP *is* a backend photo the optimizer has never seen. That trade-off does not
// apply to a static file in public/ — it is encoded once, here, by hand, and
// served straight off the CDN with no optimizer in the path at all. Same posture
// as scripts/optimize-patterns.mjs.
//
// TWO WIDTHS, because the slot only ever has two. .nk-hero-phone is
// `inline-size: 110%; max-inline-size: 36rem` inside a media column that is
// display:none below the `hero` breakpoint (1190px), so the box is at most 576
// CSS px and the only candidates worth shipping are 1x and 2x of it. See
// IMAGE_SIZES.heroPhone, which is the `sizes` both this srcset and the next/image
// fallback resolve against.
//
// quality 50 was chosen by comparing 1:1 crops of the phone's screen area — the
// only detail-critical region, since it contains UI text — against the WebP q75
// that ships today. At the size it actually paints (576 CSS px, i.e. the 1152
// rendition at 50%) they are indistinguishable, at 53% of the bytes.
//
// The .png master is the SOURCE and the fallback for engines without AVIF, which
// reach it through the next/image <img> at the end of the <picture>. Leave it
// alone — it is what this script re-encodes from.
//
// sharp is not a dependency of this repo — it is Next's own optionalDependency, so
// it is present in any normal install. Fine for a generator whose OUTPUT is
// committed: nothing at build or run time imports it.
import sharp from "sharp";
import { stat } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const DIR = join(dirname(fileURLToPath(import.meta.url)), "..", "public", "naudokis");
const SRC = join(DIR, "hero-phone.png");

// Keep in lockstep with the srcset in the Hero's <picture> (sections-home.tsx).
const WIDTHS = [576, 1152];
const AVIF = { quality: 50, effort: 9 };

const kb = (n) => `${(n / 1024).toFixed(1)} KB`;

console.log(`master ${kb((await stat(SRC)).size)}`);
for (const width of WIDTHS) {
  const out = join(DIR, `hero-phone-${width}.avif`);
  await sharp(SRC).resize({ width, withoutEnlargement: true }).avif(AVIF).toFile(out);
  console.log(`hero-phone-${width}.avif  ${kb((await stat(out)).size)}`);
}
