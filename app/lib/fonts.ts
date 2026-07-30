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
//
// `preload: false` because next/font emits one <link rel=preload> per subset and
// the browser fetches them all at High priority the moment the HTML head parses.
// Sora's two subsets are 22.6 KB of that window, and nothing they paint is in it:
// prices sit in offer cards, below the fold on every route that has them. Measured
// on the throttled-mobile profile, the render-blocking stylesheet was landing at
// ~2.0 s because ~90 KB of High-priority font bytes were drawing from the same
// 1.6 Mbps — FCP is gated on that stylesheet, so those bytes cost paint time
// directly. Dropping the hint leaves the @font-face in the stylesheet: Sora is
// still fetched, just discovered from CSS at normal priority when a price is
// actually laid out, and `swap` (next/font's default) paints the fallback until it
// lands. Archivo keeps its preloads — it sets the h1 and every nk- label, i.e. the
// text FCP is measured on.
export const priceFont = Sora({
  variable: "--font-sora",
  subsets: ["latin", "latin-ext"],
  weight: ["700"],
  preload: false,
});
