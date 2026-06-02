"use client";
// Locked-mode "Bridge" — app-redirect modal (desktop dialog / mobile bottom-sheet).
// Mounted once via <Chrome/>; opened from anywhere via openRedirect({title, body}).
import { useEffect, useState } from "react";
import { Icon, AppBadges, QR, NK_REDIRECT_EVENT, type RedirectPayload } from "./ui";
import { useI18n } from "./I18nProvider";

export function AppRedirect() {
  const { dict } = useI18n();
  const [state, setState] = useState<{ open: boolean } & RedirectPayload>({ open: false, title: "", body: "" });

  useEffect(() => {
    const onOpen = (e: Event) => {
      const d = (e as CustomEvent<RedirectPayload>).detail ?? { title: "", body: "" };
      setState({ open: true, title: d.title || dict.bridge.defaultTitle, body: d.body || dict.bridge.defaultBody });
      document.body.style.overflow = "hidden";
    };
    window.addEventListener(NK_REDIRECT_EVENT, onOpen);
    return () => window.removeEventListener(NK_REDIRECT_EVENT, onOpen);
  }, [dict]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") close(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  function close() {
    setState((s) => ({ ...s, open: false }));
    document.body.style.overflow = "";
  }

  if (!state.open) return null;
  return (
    <div className="nk-redirect-scrim" onClick={close} role="dialog" aria-modal="true" aria-label={state.title}>
      <div className="nk-redirect-panel" onClick={(e) => e.stopPropagation()}>
        <button onClick={close} aria-label={dict.bridge.close} className="nk-redirect-close">
          <Icon name="X" size={20} color="var(--nk-text)" />
        </button>
        <span className="nk-redirect-mark">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/naudokis/logo-mark.svg" alt="" style={{ width: 34, height: 34 }} />
        </span>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <h2 style={{ margin: 0, fontFamily: "var(--nk-font-display)", fontWeight: 700, fontSize: 28, lineHeight: "32px", color: "var(--nk-text)" }}>{state.title}</h2>
          <p style={{ margin: 0, fontFamily: "var(--nk-font-body)", fontSize: 17, lineHeight: "26px", color: "var(--nk-text-2)" }}>{state.body}</p>
        </div>
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}><AppBadges height={50} /></div>
        <div className="nk-redirect-qr">
          <QR size={96} />
          <span style={{ fontFamily: "var(--nk-font-body)", fontSize: 15, color: "var(--nk-text-muted)", maxWidth: 220 }}>{dict.bridge.qrHint}</span>
        </div>
      </div>
    </div>
  );
}
