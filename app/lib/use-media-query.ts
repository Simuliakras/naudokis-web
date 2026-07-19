// Reactive media-query state. The server snapshot is `false` (there is no
// viewport to ask), so callers must treat `false` as their conservative
// default; the first CLIENT render already returns the live answer — no
// effect-driven second render, no layout flash for components that only ever
// mount after user interaction (popovers, sheets).
import { useCallback, useSyncExternalStore } from "react";

export function useMediaQuery(query: string): boolean {
  const subscribe = useCallback(
    (onChange: () => void) => {
      const mql = window.matchMedia(query);
      mql.addEventListener("change", onChange);
      return () => mql.removeEventListener("change", onChange);
    },
    [query],
  );
  return useSyncExternalStore(subscribe, () => window.matchMedia(query).matches, () => false);
}
