"use client";
// Locked-mode "Bridge" — app-redirect modal (desktop dialog / mobile bottom-sheet).
// Mounted once via <Chrome/>; opened from anywhere via openRedirect({title, body}).
import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import { Icon, AppBadges, QR, NK_REDIRECT_EVENT, type RedirectPayload } from "./ui";
import { useI18n } from "./I18nProvider";
import { useFocusTrap } from "@/app/lib/use-focus-trap";
import { prefersReducedMotion } from "@/app/lib/motion";

// One buffer-frame past the .2s `nk-*-out` exit keyframes in globals.css, so the
// dialog unmounts only after the animation has finished painting.
const EXIT_MS = 220;

// Frequency cap: the first locked tap in a session gets the full spring entrance;
// repeat opens skip it so the dialog feels like a calm reference, not a fresh
// interruption each time. The store links / QR are always shown — only the
// animation is softened, so conversion is never suppressed.
const SEEN_KEY = "nk_bridge_seen";

declare global {
  interface Window {
    __nkBridgeReady?: boolean;
    __nkPendingRedirect?: RedirectPayload | null;
  }
}

export function AppRedirect() {
  const { dict } = useI18n();
  const [state, setState] = useState<{ open: boolean; closing: boolean; instant: boolean } & RedirectPayload>({ open: false, closing: false, instant: false, title: "", body: "" });
  const panelRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const lastFocused = useRef<HTMLElement | null>(null); // restored when the dialog closes
  const exitTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Finalize teardown: unmount the dialog and restore focus to the opener.
  const finalize = useCallback(() => {
    setState((s) => ({ ...s, open: false, closing: false }));
    lastFocused.current?.focus();
  }, []);

  // Play the exit animation, then finalize. Reduced-motion users skip straight
  // to teardown so nothing lingers on screen.
  const close = useCallback(() => {
    if (prefersReducedMotion()) {
      finalize();
      return;
    }
    setState((s) => ({ ...s, closing: true }));
    if (exitTimer.current) clearTimeout(exitTimer.current);
    exitTimer.current = setTimeout(finalize, EXIT_MS);
  }, [finalize]);

  useEffect(() => () => { if (exitTimer.current) clearTimeout(exitTimer.current); }, []);

  useEffect(() => {
    const openPayload = (payload: RedirectPayload) => {
      const d = payload ?? { title: "", body: "" };
      lastFocused.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;
      if (exitTimer.current) clearTimeout(exitTimer.current);
      let seen = false;
      try {
        seen = sessionStorage.getItem(SEEN_KEY) === "1";
        sessionStorage.setItem(SEEN_KEY, "1");
      } catch {
        // sessionStorage can throw in private modes — fall back to the full entrance.
      }
      window.__nkPendingRedirect = null;
      setState({ open: true, closing: false, instant: seen, title: d.title || dict.bridge.defaultTitle, body: d.body || dict.bridge.defaultBody });
    };
    const onOpen = (e: Event) => {
      openPayload((e as CustomEvent<RedirectPayload>).detail ?? { title: "", body: "" });
    };
    window.addEventListener(NK_REDIRECT_EVENT, onOpen);
    // Flip the bootstrap handoff only after the real listener is live; otherwise
    // an early tap can miss both the pre-hydration fallback and the hydrated path.
    window.__nkBridgeReady = true;
    if (window.__nkPendingRedirect) {
      openPayload(window.__nkPendingRedirect);
    }
    return () => {
      window.removeEventListener(NK_REDIRECT_EVENT, onOpen);
      window.__nkBridgeReady = false;
    };
  }, [dict]);

  // While open: lock body scroll (released on close AND unmount — the component
  // remounts per page, so navigating away mid-dialog must not leave the page
  // unscrollable), move focus into the dialog, close on Escape. Tab-trapping is
  // handled by useFocusTrap below.
  useEffect(() => {
    if (!state.open) {
      return;
    }
    document.body.style.overflow = "hidden";
    closeRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        close();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [state.open, close]);

  useFocusTrap(panelRef, state.open);

  if (!state.open) return null;
  return (
    <div className={state.closing ? "nk-redirect-scrim is-closing" : "nk-redirect-scrim"} onClick={close} role="dialog" aria-modal="true" aria-labelledby="nk-redirect-title" aria-describedby="nk-redirect-body">
      <div ref={panelRef} className={state.instant ? "nk-redirect-panel nk-redirect-panel--instant" : "nk-redirect-panel"} onClick={(e) => e.stopPropagation()}>
        <button ref={closeRef} onClick={close} aria-label={dict.bridge.close} className="nk-redirect-close">
          <Icon name="X" size={20} color="var(--nk-text)" />
        </button>
        <Image src="/naudokis/naudokis-logo.png" alt="Naudokis.lt" width={287} height={64}
          style={{ height: 32, width: "auto", alignSelf: "flex-start" }} />
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <h2 id="nk-redirect-title" style={{ margin: 0, fontFamily: "var(--nk-font-display)", fontWeight: 700, fontSize: 28, lineHeight: "32px", color: "var(--nk-text)" }}>{state.title}</h2>
          <p id="nk-redirect-body" style={{ margin: 0, fontFamily: "var(--nk-font-body)", fontSize: 17, lineHeight: "26px", color: "var(--nk-text-2)" }}>{state.body}</p>
        </div>
        <div className="nk-redirect-qr">
          <QR size={96} />
          <span style={{ fontFamily: "var(--nk-font-body)", fontSize: 15, color: "var(--nk-text-muted)", maxWidth: 220 }}>{dict.bridge.qrHint}</span>
        </div>
        {/* Working install paths: a one-tap smart link (sniffs the OS — the
            primary mobile CTA, since the QR is hidden ≤560px) above the two
            store badges, which now link straight to their listings. */}
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <a className="nk-btn nk-btn--primary" href="/go" target="_blank" rel="noopener noreferrer" style={{ width: "100%" }}>
            <Icon name="Download" size={18} stroke={2.2} color="var(--nk-text)" /> {dict.bridge.installCta}
          </a>
          <AppBadges height={50} />
        </div>
      </div>
    </div>
  );
}
