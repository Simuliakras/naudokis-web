import { Archivo, Sora } from "next/font/google";

// One shared next/font instance for every route, including the standalone global
// 404. Separate calls generate separate font assets and make normal pages preload
// fonts used only by the error route.
//
// No `weight` here. Archivo is a VARIABLE font, and Google already served one woff2
// per subset covering the whole axis — enumerating 400/500/600/700 fetched exactly
// the same three files, it just emitted 12 @font-face blocks (weight × subset) with
// identical `src`. Dropping `weight` collapses those to 3 in a stylesheet that is
// render-blocking on every route. Verified: the emitted `src:` filenames are byte
// -for-byte the ones the enumerated form produced.
export const brandFont = Archivo({
  variable: "--font-archivo",
  subsets: ["latin", "latin-ext"],
});

// Sora is reserved for headline price displays (see --nk-font-price), which are
// always 700 — see .nk-breaks__price in globals.css.
//
// Keep this weight pinned. Sora is variable too, but unlike Archivo the pinned
// request gets a single-instance file: dropping `weight` here made Google serve the
// full 100–800 variable font and the payload went 22.6 KB → 49.2 KB across the two
// subsets, to save ~1 KB of stylesheet. Net loss — do not "simplify" it to match
// brandFont above.
export const priceFont = Sora({
  variable: "--font-sora",
  subsets: ["latin", "latin-ext"],
  weight: ["700"],
});
