"use client";
// Locked-mode "Bridge" — app-redirect modal (desktop dialog / mobile bottom-sheet).
// Mounted once via <Chrome/>; opened from anywhere via openRedirect({title, body}).
import { useCallback, useEffect, useRef, useState } from "react";
import { Icon, AppBadges, QR, NK_REDIRECT_EVENT, type RedirectPayload } from "./ui";
import { useI18n } from "./I18nProvider";

export function AppRedirect() {
  const { dict } = useI18n();
  const [state, setState] = useState<{ open: boolean } & RedirectPayload>({ open: false, title: "", body: "" });
  const panelRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const lastFocused = useRef<HTMLElement | null>(null); // restored when the dialog closes

  const close = useCallback(() => {
    setState((s) => ({ ...s, open: false }));
    lastFocused.current?.focus();
  }, []);

  useEffect(() => {
    const onOpen = (e: Event) => {
      const d = (e as CustomEvent<RedirectPayload>).detail ?? { title: "", body: "" };
      lastFocused.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;
      setState({ open: true, title: d.title || dict.bridge.defaultTitle, body: d.body || dict.bridge.defaultBody });
    };
    window.addEventListener(NK_REDIRECT_EVENT, onOpen);
    return () => window.removeEventListener(NK_REDIRECT_EVENT, onOpen);
  }, [dict]);

  // While open: lock body scroll (released on close AND unmount — the component
  // remounts per page, so navigating away mid-dialog must not leave the page
  // unscrollable), move focus into the dialog, close on Escape, trap Tab.
  useEffect(() => {
    if (!state.open) {
      return;
    }
    document.body.style.overflow = "hidden";
    closeRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        close();
        return;
      }
      if (e.key !== "Tab" || !panelRef.current) {
        return;
      }
      const focusable = panelRef.current.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled]), input, [tabindex]:not([tabindex="-1"])',
      );
      if (focusable.length === 0) {
        return;
      }
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [state.open, close]);

  if (!state.open) return null;
  return (
    <div className="nk-redirect-scrim" onClick={close} role="dialog" aria-modal="true" aria-labelledby="nk-redirect-title">
      <div ref={panelRef} className="nk-redirect-panel" onClick={(e) => e.stopPropagation()}>
        <button ref={closeRef} onClick={close} aria-label={dict.bridge.close} className="nk-redirect-close">
          <Icon name="X" size={20} color="var(--nk-text)" />
        </button>
        <span className="nk-redirect-mark">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/naudokis/logo-mark.svg" alt="" style={{ width: 34, height: 34 }} />
        </span>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <h2 id="nk-redirect-title" style={{ margin: 0, fontFamily: "var(--nk-font-display)", fontWeight: 700, fontSize: 28, lineHeight: "32px", color: "var(--nk-text)" }}>{state.title}</h2>
          <p style={{ margin: 0, fontFamily: "var(--nk-font-body)", fontSize: 17, lineHeight: "26px", color: "var(--nk-text-2)" }}>{state.body}</p>
        </div>
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}><AppBadges height={50} interactive={false} /></div>
        <div className="nk-redirect-qr">
          <QR size={96} />
          <span style={{ fontFamily: "var(--nk-font-body)", fontSize: 15, color: "var(--nk-text-muted)", maxWidth: 220 }}>{dict.bridge.qrHint}</span>
        </div>
      </div>
    </div>
  );
}
