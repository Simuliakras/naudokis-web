"use client";

import { useEffect, useState } from "react";
import { todayInMarket, type IsoDate } from "./dates";

// "Today" (in Europe/Vilnius) as a CLIENT fact — `undefined` until mounted.
//
// It cannot be a server fact. The listing page is ISR-cached (revalidate 300), so a
// server-computed "today" would be baked into the HTML: a page generated at 23:58
// Vilnius and served at 00:03 would disable today's date and offer a window starting
// yesterday. Returning `undefined` on the server (and on the first client render)
// keeps the two identical, so nothing mismatches on hydration — the same shape
// use-online-status.ts uses.
//
// The interval is a poll, deliberately, not a setTimeout aimed at midnight: a
// once-computed timeout drifts by an hour across a DST change, and the tab may sleep
// through it entirely. A minute's granularity on a date that changes once a day is
// free, and it self-corrects.
//
// `serverFallback` covers the one case where `undefined` is not good enough: a render
// that ALREADY committed to a date server-side — a `?dates=` prefetch clamped against
// todayInMarket() — and whose client half must reproduce it exactly or land in a
// different React Query key. Such a page is dynamic and noindex, so no "today" is baked
// into a cached render; pass nothing anywhere else and the ISR reasoning above holds.
// The fallback resolves HERE rather than at the call site so callers see an opaque hook
// return: `useMarketToday() ?? props.x` in a component body makes every value derived
// from it prop-reactive, which defeats the manual memoization around it.
export function useMarketToday(serverFallback?: IsoDate): IsoDate | undefined {
  const [today, setToday] = useState<IsoDate>();

  useEffect(() => {
    // Returning the previous string when the day hasn't turned keeps the identity
    // stable, so this never re-renders the calendar or re-keys the availability query.
    const sync = () => setToday((previous) => {
      const next = todayInMarket();
      return previous === next ? previous : next;
    });
    sync();
    const timer = window.setInterval(sync, 60_000);
    return () => window.clearInterval(timer);
  }, []);

  return today ?? serverFallback;
}
