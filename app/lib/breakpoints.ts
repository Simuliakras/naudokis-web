// Responsive viewport contracts shared by CSS-adjacent browser APIs.
//
// CSS owns the matching `@theme static` declarations in app/globals.css because
// media queries cannot consume runtime custom properties. scripts/verify-breakpoints.mjs
// keeps the two representations aligned.
//
// BROWSER SUPPORT — the asymmetry here is load-bearing. Lightning CSS downlevels
// the range syntax in stylesheets, so the CSS side runs anywhere. The strings in
// VIEWPORT_QUERIES do NOT get downleveled: they go to window.matchMedia() and to
// <source media> verbatim. Range syntax needs Safari 16.4+ / Firefox 102+ /
// Chrome 104+, and matchMedia() on an unparseable query returns a list that
// silently never matches — no throw, no warning. Anything that must degrade
// safely on an older engine belongs in `LEGACY_VIEWPORT_QUERIES` below.

export const BREAKPOINTS = {
  xs: "22.5rem",
  sm: "35rem",
  md: "48rem",
  lg: "64rem",
  nav: "70rem",
  xl: "80rem",
} as const;

// Layer sheets swap to the compact skin on short viewports as well as narrow ones
// (landscape phones are wide but have no vertical room for a centred dialog).
// Exported so globals.css's height queries and verify-breakpoints can be checked
// against ONE value — this threshold used to be spelled three different ways.
export const SHORT_LAYER_HEIGHT = "32.5rem";

export const VIEWPORT_QUERIES = {
  compact: `(width < ${BREAKPOINTS.sm})`,
  filterCompact: `(width < ${BREAKPOINTS.md})`,
  filterExpanded: `(width >= ${BREAKPOINTS.md})`,
  layerCompact: `(width < ${BREAKPOINTS.sm}), (height < ${SHORT_LAYER_HEIGHT})`,
  layerExpanded: `(width >= ${BREAKPOINTS.sm}) and (height >= ${SHORT_LAYER_HEIGHT})`,
  navExpanded: `(width >= ${BREAKPOINTS.nav})`,
} as const;

// Legacy-syntax equivalents for the two <source media> attributes. HTML gains
// nothing from range syntax — no downleveling happens there — and these guard the
// hero/pattern 1x1-GIF trick, whose whole job is to stop old phones downloading a
// desktop image. A query the engine cannot parse would defeat exactly that.
export const LEGACY_VIEWPORT_QUERIES = {
  compact: `(max-width: ${Number.parseFloat(BREAKPOINTS.sm) * 16 - 0.02}px)`,
} as const;

export type ViewportQueryName = keyof typeof VIEWPORT_QUERIES;

export function matchesViewport(name: ViewportQueryName): boolean {
  return typeof window !== "undefined" && window.matchMedia(VIEWPORT_QUERIES[name]).matches;
}

export function observeViewport(name: ViewportQueryName, listener: (matches: boolean) => void): () => void {
  if (typeof window === "undefined") {
    return () => undefined;
  }
  const query = window.matchMedia(VIEWPORT_QUERIES[name]);
  const onChange = (event: MediaQueryListEvent) => listener(event.matches);
  query.addEventListener("change", onChange);
  return () => query.removeEventListener("change", onChange);
}

/* ---------------- Resource-selection hints ----------------
   Centralized even where they need more detail than the layout ladder. These are
   network estimates, not additional CSS breakpoints.

   A `sizes` threshold must track the breakpoint at which the SLOT changes, which
   is not always a viewport tier. Getting this wrong is silent: under-declare and
   the browser picks a smaller candidate than the slot, which reads as a softer
   photo, with nothing in the console to say so. When unsure, over-declare — a
   slightly larger fetch is the cheaper error. */

// The listing-detail grid drops to one column at `@container nk-detail (width <
// 55rem)`. `.nk-detail` is a direct child of `.nk-container`, whose
// `padding-inline: var(--nk-gutter)` is `clamp(20px, 6vw, 82px)` — so in the
// clamp's linear range the container measures viewport - 12vw = 0.88 × viewport,
// and 880px of container is reached at a 1000px viewport. `sizes` is resolved
// against the viewport, so that (not 55rem, and not --breakpoint-md) is the
// number these entries must switch on.
const DETAIL_ONE_COLUMN = "(width < 62.5rem)";

// Same derivation for the install band: `.nk-appcta-wrap` IS the .nk-container, so
// its `@container nk-app-cta (width < 60rem)` phone-hide fires at a ~1091px
// viewport (960 / 0.88). Below it the phone is display:none — and per the hero's
// note in sections-home.tsx, a display:none <img> is still fetched, so the small
// declaration there is not cosmetic: it stops phones pulling a desktop-sized
// render of an element they never see. (Eliminating the request outright would
// need the hero's 1x1-GIF <source> trick; this is the sizes-only half.)
const APP_CTA_PHONE_HIDDEN = "(width < 68rem)";

export const IMAGE_SIZES = {
  heroPhone: [
    `${VIEWPORT_QUERIES.compact} 1px`,
    `(width < ${BREAKPOINTS.nav}) min(45vw, 30rem)`,
    "min(43vw, 36rem)",
  ].join(", "),
  appCtaPhone: `${APP_CTA_PHONE_HIDDEN} 1px, 480px`,
  offerCard: [
    `${VIEWPORT_QUERIES.compact} calc(50vw - 28px)`,
    `(width < ${BREAKPOINTS.md}) calc(50vw - 40px)`,
    `(width < ${BREAKPOINTS.lg}) calc(33vw - 30px)`,
    `(width < ${BREAKPOINTS.xl}) calc(25vw - 30px)`,
    "min(20vw, 345px)",
  ].join(", "),
  detailHero: `${DETAIL_ONE_COLUMN} 100vw, min(calc(100vw - 164px), 1340px)`,
  detailPrimary: `${DETAIL_ONE_COLUMN} 100vw, min(60vw, 800px)`,
  detailThumb: `${DETAIL_ONE_COLUMN} 50vw, min(20vw, 268px)`,
  lightbox: `(width >= ${BREAKPOINTS.nav}) 1024px, 100vw`,
  // Deliberately identical to detailPrimary: the lightbox reuses the already-cached
  // bento rendition as an instant underlay, which only works if both resolve to the
  // same candidate. Keep them in lockstep.
  lightboxUnderlay: `${DETAIL_ONE_COLUMN} 100vw, min(60vw, 800px)`,
} as const;
