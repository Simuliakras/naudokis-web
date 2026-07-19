// Build-time generator for the legacy /favicon.ico. Modern browsers take the PNG
// icons declared in the root layout's `icons` metadata, but plenty of crawlers,
// feed readers, link-preview services and bookmark importers still request
// /favicon.ico by convention — and without a file there, that request 404s.
//
// Emits a committed multi-size ICO so there is NO runtime image dependency:
// re-run `yarn gen:favicon` if the brand mark ever changes.
//
//   yarn gen:favicon
//
// The ICO container stores each size as an embedded PNG (allowed since Vista and
// understood by every current consumer), so the only work is resizing with
// macOS `sips` and writing the directory structure by hand. That keeps the
// generator dependency-free — this repo deliberately ships a tiny dependency
// surface, and an image library would be a build-only dependency for one file.
import { execFileSync } from "node:child_process";
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const SOURCE = join(ROOT, "public", "naudokis", "icon.png");
const OUT = join(ROOT, "public", "favicon.ico");

// 16/32 cover browser tabs and bookmarks; 48 is what Windows and several
// crawlers pick up. Larger sizes belong to the PNG icons, not here.
const SIZES = [16, 32, 48];

const work = mkdtempSync(join(tmpdir(), "nk-favicon-"));
try {
  const images = SIZES.map((size) => {
    const file = join(work, `icon-${size}.png`);
    execFileSync("sips", ["-z", String(size), String(size), SOURCE, "--out", file], { stdio: "pipe" });
    return { size, data: readFileSync(file) };
  });

  // ICONDIR: reserved(2) + type(2, 1 = icon) + count(2)
  const header = Buffer.alloc(6);
  header.writeUInt16LE(0, 0);
  header.writeUInt16LE(1, 2);
  header.writeUInt16LE(images.length, 4);

  // Each ICONDIRENTRY is 16 bytes and the image payloads follow the directory.
  let offset = header.length + images.length * 16;
  const entries = images.map(({ size, data }) => {
    const entry = Buffer.alloc(16);
    // A 256px edge would be written as 0; these sizes are all < 256.
    entry.writeUInt8(size, 0); // width
    entry.writeUInt8(size, 1); // height
    entry.writeUInt8(0, 2); // palette entries (0 = truecolour)
    entry.writeUInt8(0, 3); // reserved
    entry.writeUInt16LE(1, 4); // colour planes
    entry.writeUInt16LE(32, 6); // bits per pixel
    entry.writeUInt32LE(data.length, 8);
    entry.writeUInt32LE(offset, 12);
    offset += data.length;
    return entry;
  });

  writeFileSync(OUT, Buffer.concat([header, ...entries, ...images.map((i) => i.data)]));
  console.log(`favicon.ico written (${SIZES.join("/")}px) → ${OUT}`);
} finally {
  rmSync(work, { recursive: true, force: true });
}
