"use client";

import { useEffect, useState } from "react";

// Reads the live column count of a CSS grid from its resolved tracks. A callback
// ref works for result grids that mount after loading; ResizeObserver keeps the
// value accurate through fluid/container-driven layout changes.
// Defaults to 4 (the common desktop column count for these auto-fill grids) rather
// than 1 — that's what SSR/no-JS output and the first pre-measurement paint use,
// and a too-low guess would under-render a visibly small band before the
// ResizeObserver correction lands.
export function useMeasuredColumns<T extends HTMLElement = HTMLDivElement>() {
  const [el, setEl] = useState<T | null>(null);
  const [cols, setCols] = useState(4);

  useEffect(() => {
    if (!el) {
      return;
    }
    const read = () => {
      const tracks = getComputedStyle(el).gridTemplateColumns;
      const n = tracks ? tracks.split(" ").filter((track) => track && track !== "0px").length : 1;
      setCols(Math.max(1, n));
    };
    read();
    const ro = new ResizeObserver(read);
    ro.observe(el);
    return () => ro.disconnect();
  }, [el]);

  return [setEl, cols] as const;
}
