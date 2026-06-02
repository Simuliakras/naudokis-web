"use client";
// Sticky mobile app banner — install (opens the app-redirect modal) / dismiss-24h.
import { useEffect, useState } from "react";
import { Icon, openRedirect } from "./ui";
import { useI18n } from "./I18nProvider";

const DISMISS_KEY = "nk_appbanner_dismissed_at";
const DAY_MS = 24 * 3600 * 1000;

export function StickyAppBanner() {
  const { dict } = useI18n();
  const [hidden, setHidden] = useState(true);

  useEffect(() => {
    // Read the dismissal timestamp on mount only (client-only; localStorage is
    // unavailable during SSR, and starting hidden avoids a hydration mismatch).
    const until = Number(localStorage.getItem(DISMISS_KEY) ?? "0");
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setHidden(Date.now() < until);
  }, []);

  function dismiss() {
    localStorage.setItem(DISMISS_KEY, String(Date.now() + DAY_MS));
    setHidden(true);
  }

  if (hidden) return null;
  return (
    <div className="nk-appbanner">
      <button onClick={dismiss} aria-label={dict.appBanner.dismiss} className="nk-appbanner__x">
        <Icon name="X" size={16} color="var(--nk-text-muted)" />
      </button>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/naudokis/logo-mark.svg" alt="" style={{ width: 38, height: 38, borderRadius: 10, flex: "none" }} />
      <span style={{ flex: 1, display: "flex", flexDirection: "column", lineHeight: 1.2, minWidth: 0 }}>
        <b style={{ fontFamily: "var(--nk-font-display)", fontWeight: 700, fontSize: 16, color: "var(--nk-text)" }}>{dict.appBanner.title}</b>
        <span style={{ fontFamily: "var(--nk-font-body)", fontSize: 13, color: "var(--nk-text-muted)" }}>{dict.appBanner.body}</span>
      </span>
      <button className="nk-btn nk-btn--primary" style={{ padding: "10px 20px", fontSize: 15, flex: "none" }}
        onClick={() => openRedirect({ title: dict.bridge.defaultTitle, body: dict.bridge.defaultBody })}>
        {dict.appBanner.install}
      </button>
    </div>
  );
}
