// Re-encoder for the three decorative brand patterns in public/naudokis/.
//
//   yarn gen:patterns
//
// The .avif/.webp renditions shipped at near-photographic quality, which they have
// no use for: <Pattern/> paints all three behind .nk-brand-pattern at 6–9% opacity
// (see globals.css), so a compression artifact is attenuated by more than 10× before
// it reaches a pixel. hero-pattern is the one that matters — it renders `priority`
// (eager, fetchPriority=high) on the desktop home hero, directly in the LCP path.
//
// The .png masters are the SOURCE and are left alone. They are also the last
// <source> in Pattern's <picture>, i.e. effectively never served — do not "optimize"
// them, they are what this script re-encodes from.
//
// AVIF gets the aggressive setting because it is the first <source>: every current
// browser takes it and never sees the WebP. WebP is the fallback rendition and
// barely responds to `quality` on these images (their alpha channel carries most of
// the detail), so it gets a modest pass rather than a pointless one.
//
// sharp is not a dependency of this repo — it is Next's own optionalDependency, so
// it is present in any normal install. That is fine for a one-off generator whose
// OUTPUT is committed: nothing at build or run time imports it. Same posture as
// scripts/generate-favicon.mjs, which avoids an image library for the same reason.
import sharp from "sharp";
import { stat } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const DIR = join(dirname(fileURLToPath(import.meta.url)), "..", "public", "naudokis");
const PATTERNS = ["hero-pattern", "section-pattern", "footer-pattern"];

// effort 9 / 6 are the encoders' slow-but-smallest settings. This runs by hand,
// perhaps twice a year, so there is no reason to trade bytes for encode time.
const AVIF = { quality: 30, effort: 9 };
const WEBP = { quality: 45, effort: 6 };

const kb = (n) => `${(n / 1024).toFixed(1)} KB`;
const sizeOf = async (path) => (await stat(path)).size;

let before = 0;
let after = 0;

for (const name of PATTERNS) {
  const src = join(DIR, `${name}.png`);
  for (const [ext, encode] of [
    ["avif", (img) => img.avif(AVIF)],
    ["webp", (img) => img.webp(WEBP)],
  ]) {
    const out = join(DIR, `${name}.${ext}`);
    const was = await sizeOf(out);
    // Straight .png → .avif/.webp: the read and write paths differ, so there is no
    // same-file conflict, and the explicit .avif()/.webp() call is what sets the
    // format rather than the output extension.
    await encode(sharp(src)).toFile(out);
    const now = await sizeOf(out);
    before += was;
    after += now;
    console.log(`${name}.${ext}  ${kb(was)} → ${kb(now)}  (${Math.round((1 - now / was) * 100)}%)`);
  }
}

console.log(`\ntotal ${kb(before)} → ${kb(after)} (${Math.round((1 - after / before) * 100)}% smaller)`);
