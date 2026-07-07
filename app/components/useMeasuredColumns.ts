"use client";

import { useEffect, useState } from "react";

// Reads the live column count of a CSS grid from its resolved tracks. A callback
// ref works for result grids that mount after loading; ResizeObserver keeps the
// value accurate through fluid/container-driven layout changes.
export function useMeasuredColumns<T extends HTMLElement = HTMLDivElement>() {
  const [el, setEl] = useState<T | null>(null);
  const [cols, setCols] = useState(1);

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
