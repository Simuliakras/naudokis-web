// Build-time generator for the install QR shown in the hero / CTA / how-it-works
// / bridge modal. Encodes the smart-install URL (/go sniffs the OS and routes to
// the App Store or Play). Emits a committed static SVG so there is NO runtime
// dependency on `qrcode` — re-run `yarn gen:qr` if the install URL ever changes.
//
//   yarn gen:qr
//
import QRCode from "qrcode";
import { writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const INSTALL_URL = "https://www.naudokis.lt/go";
const OUT = join(dirname(fileURLToPath(import.meta.url)), "..", "public", "naudokis", "install-qr.svg");

const svg = await QRCode.toString(INSTALL_URL, {
  type: "svg",
  errorCorrectionLevel: "M",
  margin: 4, // standard 4-module quiet zone — required for reliable scanning
  color: { dark: "#000000ff", light: "#ffffffff" },
});

await writeFile(OUT, svg, "utf8");
console.log(`Wrote ${OUT} (${svg.length} bytes) encoding ${INSTALL_URL}`);
