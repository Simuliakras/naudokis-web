"use client";

import { useReportWebVitals } from "next/web-vitals";
import { isTokenizedPath } from "@/app/lib/app-links";

type ReportWebVitals = Parameters<typeof useReportWebVitals>[0];

// Keep this callback at module scope: useReportWebVitals treats a changed
// callback identity as a new reporter. Only the pathname is reported; search
// parameters can contain personal data and are never part of the payload.
const reportWebVitals: ReportWebVitals = (metric) => {
  const path = window.location.pathname;
  if (isTokenizedPath(path)) return;

  const payload = JSON.stringify({
    path,
    name: metric.name,
    value: metric.value,
    delta: metric.delta,
    rating: metric.rating,
    navigationType: metric.navigationType,
  });

  if (navigator.sendBeacon?.("/api/web-vitals", new Blob([payload], { type: "application/json" }))) {
    return;
  }
  void fetch("/api/web-vitals", {
    method: "POST",
    body: payload,
    headers: { "Content-Type": "application/json" },
    keepalive: true,
    credentials: "same-origin",
  }).catch(() => undefined);
};

export function WebVitals() {
  useReportWebVitals(reportWebVitals);
  return null;
}
