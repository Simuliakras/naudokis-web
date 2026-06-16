// Reads the user's reduced-motion preference. SSR-safe (returns false on the
// server / before mount), so callers gating a smooth scroll or exit animation
// fall back to the animated path only on the client where matchMedia exists.
export function prefersReducedMotion(): boolean {
  if (typeof window === "undefined") {
    return false;
  }
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}
