// Get a single-use account-action token out of the visible URL as soon as the page
// holds it (password reset, email verification, deletion cancel).
//
// The token authorizes a real account action. Plausible is not loaded on these pages
// and Sentry redacts the param (see lib/app-links.ts, lib/sentry-scrub.ts), but the
// address bar is the leak everyone can see: browser history, a shared screen, the
// Referer of any later outbound click.
//
// Returns the query as it was on arrival, so the caller can still hand it to the app.
import { useEffect, useRef } from "react";

export function useStripSensitiveQuery(enabled = true): React.RefObject<string> {
  // A ref, not state: the value is only ever read inside an event handler, so
  // capturing it must not cost a render.
  const search = useRef("");

  useEffect(() => {
    search.current = location.search;
    if (enabled && location.search) {
      history.replaceState(null, "", location.pathname);
    }
  }, [enabled]);

  return search;
}
