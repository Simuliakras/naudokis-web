type PlausibleOptions = { props?: Record<string, string | number | boolean | null | undefined> };

declare global {
  interface Window {
    plausible?: (event: string, options?: PlausibleOptions) => void;
  }
}

export function trackEvent(event: string, props?: PlausibleOptions["props"]) {
  if (typeof window === "undefined" || typeof window.plausible !== "function") {
    return;
  }
  window.plausible(event, props ? { props } : undefined);
}
