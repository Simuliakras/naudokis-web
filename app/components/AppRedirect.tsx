"use client";
// Locked-mode "Bridge" — app-redirect modal (desktop dialog / mobile bottom-sheet).
// Mounted once via <Chrome/>; opened from anywhere via openRedirect({title, body}).
import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import { Icon, QR, AppBadges, CloseButton, NK_REDIRECT_EVENT, type RedirectPayload } from "./ui";
import { useI18n } from "./I18nProvider";
import { useFocusTrap } from "@/app/lib/use-focus-trap";
import { useDismissableLayer } from "@/app/lib/use-dismissable-layer";
import { useSheetDrag } from "@/app/lib/use-sheet-drag";
import { prefersReducedMotion } from "@/app/lib/motion";
import { APP_STORE_URL, PLAY_STORE_URL, SMART_INSTALL_URL } from "@/app/lib/contact";
import { trackEvent } from "@/app/lib/analytics";

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
  const grabRef = useRef<HTMLDivElement>(null); // sheet drag handle (mobile)
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
      setState({ open: true, closing: false, instant: seen, title: d.title || dict.bridge.defaultTitle, body: d.body || dict.bridge.defaultBody, listing: d.listing });
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
  // handled by useFocusTrap below. restoreFocus is off: the opener is refocused
  // in finalize() after the exit animation, so the hook must not restore early.
  useDismissableLayer(state.open, close, { initialFocus: closeRef, restoreFocus: false });

  useFocusTrap(panelRef, state.open);

  // The grabber pill advertises swipe-to-dismiss — honour it (mobile widths only).
  useSheetDrag({ panelRef, handleRef: grabRef, enabled: state.open, onDismiss: close });

  if (!state.open) return null;
  const emailHref = `mailto:?subject=${encodeURIComponent(dict.bridge.emailSelfSubject)}&body=${encodeURIComponent(SMART_INSTALL_URL)}`;
  return (
    <div className={state.closing ? "nk-redirect-scrim is-closing" : "nk-redirect-scrim"} onClick={close} role="dialog" aria-modal="true" aria-labelledby="nk-redirect-title" aria-describedby="nk-redirect-body">
      <div ref={panelRef} className={state.instant ? "nk-redirect-panel nk-redirect-panel--instant" : "nk-redirect-panel"} onClick={(e) => e.stopPropagation()}>
        {/* dismissible-sheet affordance + drag handle (mobile only, via CSS) */}
        <div ref={grabRef} className="nk-sheet-grabzone" aria-hidden="true"><span className="nk-sheet-grabber" /></div>
        <CloseButton ref={closeRef} onClick={close} label={dict.bridge.close} className="nk-redirect-close" />
        <Image src="/naudokis/naudokis-logo.png" alt="Naudokis.lt" width={287} height={64}
          style={{ height: 32, width: "auto", alignSelf: "flex-start" }} />
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <h2 id="nk-redirect-title" style={{ margin: 0, fontFamily: "var(--nk-font-display)", fontWeight: 700, fontSize: 28, lineHeight: "32px", color: "var(--nk-text)" }}>{state.title}</h2>
          <p id="nk-redirect-body" style={{ margin: 0, fontFamily: "var(--nk-font-body)", fontSize: 17, lineHeight: "26px", color: "var(--nk-text-2)" }}>{state.body}</p>
        </div>
        {/* Intent preservation: the item the user was acting on stays visible
            across the handoff (real listing data passed by the trigger). */}
        {state.listing && (
          <div style={{ display: "flex", alignItems: "center", gap: 12, padding: 10, borderRadius: "var(--nk-r-tile)", background: "var(--nk-surface)", border: "1px solid var(--nk-border)" }}>
            <span className="nk-imgph" style={{ width: 56, height: 44, borderRadius: 8, flex: "none", position: "relative", overflow: "hidden" }}>
              {state.listing.thumb && <Image src={state.listing.thumb} alt="" fill sizes="56px" style={{ objectFit: "cover" }} />}
              {!state.listing.thumb && <Icon name="Image" size={18} stroke={1.5} className="nk-imgicon" />}
            </span>
            <span style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", gap: 2 }}>
              <span style={{ fontFamily: "var(--nk-font-display)", fontWeight: 600, fontSize: 15, color: "var(--nk-text)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{state.listing.title}</span>
              {state.listing.priceLabel && <span className="nk-tnum" style={{ fontFamily: "var(--nk-font-body)", fontSize: 13.5, color: "var(--nk-text-2)" }}>{state.listing.priceLabel}</span>}
            </span>
          </div>
        )}
        {/* Desktop hero: the QR is the working handoff path there (/go only
            resolves to a store on a phone), so it gets the card + heading and the
            mailto fallback for visitors who can't scan. Hidden ≤560px. */}
        <div className="nk-redirect-qr">
          <QR size={128} />
          <span style={{ display: "flex", flexDirection: "column", gap: 8, minWidth: 0 }}>
            <span style={{ fontFamily: "var(--nk-font-display)", fontWeight: 700, fontSize: 17, lineHeight: "22px", color: "var(--nk-text)" }}>{dict.bridge.qrTitle}</span>
            <span style={{ fontFamily: "var(--nk-font-body)", fontSize: 14, lineHeight: "20px", color: "var(--nk-text-muted)" }}>{dict.bridge.qrHint}</span>
            <a href={emailHref} onClick={() => trackEvent("Send Link Email Click", { placement: "bridge_modal" })}
              style={{ fontFamily: "var(--nk-font-body)", fontSize: 13, color: "var(--nk-text-muted)", textDecoration: "underline", textUnderlineOffset: 3, width: "fit-content" }}>
              {dict.bridge.emailSelf}
            </a>
          </span>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {/* Mobile primary: one-tap smart link that sniffs the OS. Hidden >560px,
              where it would only 302 back to the homepage (a decoy CTA). */}
          <a className="nk-btn nk-btn--primary nk-redirect-smartlink" href="/go" target="_blank" rel="noopener noreferrer" style={{ width: "100%" }}
            onClick={() => trackEvent("Smart App Link Click", { placement: "bridge_modal" })}>
            <Icon name="Download" size={18} stroke={2.2} color="var(--nk-text)" /> {dict.bridge.installCta}
          </a>
          {/* Desktop secondary: clickable store badges. On mobile they collapse to a
              quiet text row — /go already routes to the right store, so a second and
              third full-weight install button would only dilute the tap. */}
          <div className="nk-redirect-stores">
            <AppBadges height={44} gap={12} placement="bridge_modal" />
          </div>
          <p className="nk-redirect-storestext" style={{ margin: 0, textAlign: "center", fontFamily: "var(--nk-font-body)", fontSize: 13.5, color: "var(--nk-text-muted)" }}>
            {dict.bridge.storesAlso}{" "}
            <a href={PLAY_STORE_URL} target="_blank" rel="noopener noreferrer" style={{ color: "var(--nk-text-2)", textDecoration: "underline", textUnderlineOffset: 3 }}
              onClick={() => trackEvent("App Store Click", { store: "google", placement: "bridge_modal_text" })}>Google Play</a>
            {" · "}
            <a href={APP_STORE_URL} target="_blank" rel="noopener noreferrer" style={{ color: "var(--nk-text-2)", textDecoration: "underline", textUnderlineOffset: 3 }}
              onClick={() => trackEvent("App Store Click", { store: "apple", placement: "bridge_modal_text" })}>App Store</a>
          </p>
          {/* Explicit decline path — softer than hunting for the corner ×. */}
          <button type="button" className="nk-btn nk-btn--ghost" style={{ justifyContent: "center", fontSize: 15 }}
            onClick={() => { trackEvent("Bridge Dismissed", { placement: "text_button" }); close(); }}>
            {dict.bridge.keepBrowsing}
          </button>
        </div>
      </div>
    </div>
  );
}
