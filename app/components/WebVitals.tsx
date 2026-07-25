"use client";

import { useReportWebVitals } from "next/web-vitals";
import { isTokenizedPath } from "@/app/lib/app-links";
import { trackEvent } from "@/app/lib/analytics";

type ReportWebVitals = Parameters<typeof useReportWebVitals>[0];

// Keep this callback at module scope: useReportWebVitals treats a changed
// callback identity as a new reporter.
//
// Vitals travel as GA events (the standard GA4 web-vitals pattern). GA attaches
// `page_location` itself; token pages are excluded here for symmetry, though the
// GA script never loads on them anyway (see Analytics.tsx).
const reportWebVitals: ReportWebVitals = (metric) => {
  if (isTokenizedPath(window.location.pathname)) {
    return;
  }
  const isCls = metric.name === "CLS";
  trackEvent(metric.name, {
    // GA sums `value` per event name; deltas make that sum meaningful across a
    // page's lifetime. CLS is scaled ×1000 because GA rounds `value` to integers.
    value: Math.round(isCls ? metric.delta * 1000 : metric.delta),
    // metric_id lets GA aggregate the deltas belonging to one page load.
    metric_id: metric.id,
    metric_value: isCls ? Number(metric.value.toFixed(4)) : Math.round(metric.value),
    metric_delta: isCls ? Number(metric.delta.toFixed(4)) : Math.round(metric.delta),
    metric_rating: metric.rating,
    navigation_type: metric.navigationType,
  });
};

export function WebVitals() {
  useReportWebVitals(reportWebVitals);
  return null;
}
