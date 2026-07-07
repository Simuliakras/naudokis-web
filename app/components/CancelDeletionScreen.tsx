"use client";
// Account-deletion cancel bridge (/cancel-deletion) — the desktop / no-app path
// for a GDPR-critical action. Reads the signed ?token, and on an explicit confirm
// POSTs it to the public backend (no login — the token is the authorization). The
// action fires only on click (never on mount) so an email scanner / prefetch /
// React StrictMode double-mount can't trip the single-use token. Outcomes are
// reported honestly: success, invalid/expired, already-processed, or a retryable
// transient error (a hard delete is irreversible, so the error state never dead-ends).
import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { Nav } from "./sections";
import { Footer } from "./sections-home";
import { Chrome } from "./Chrome";
import { Icon } from "./ui";
import { EmptyState } from "./cards";
import { useI18n } from "./I18nProvider";
import { localeHome } from "@/app/lib/i18n/config";
import { SMART_INSTALL_URL, CONTACT_EMAIL } from "@/app/lib/contact";
import { cancelDeletionByToken } from "@/app/lib/account";

type State = "idle" | "submitting" | "success" | "invalid" | "already" | "error";

export function CancelDeletionScreen() {
  const { locale, dict } = useI18n();
  const t = dict.cancelDeletion;
  // The token is a long HMAC string — read it verbatim, never decode/trim/reformat.
  const token = useSearchParams().get("token") ?? "";

  // No token → nothing to act on: show the invalid state straight away.
  const [state, setState] = useState<State>(token ? "idle" : "invalid");
  const [correlationId, setCorrelationId] = useState<string>();

  const goHome = () => {
    window.location.href = localeHome(locale);
  };
  const openApp = () => {
    window.location.href = SMART_INSTALL_URL;
  };

  const submit = async () => {
    // Guard: never run while a POST is in flight (the button is disabled then too).
    if (state === "submitting") {
      return;
    }
    setState("submitting");
    const result = await cancelDeletionByToken(token);
    if (result.ok) {
      setState("success");
      return;
    }
    setCorrelationId(result.correlationId);
    setState(result.kind);
  };

  return (
    <Chrome>
      <div className="nk-page">
        <Nav onSearch={goHome} />
        <main id="nk-main" className="nk-container nk-statusmain">
          {(state === "idle" || state === "submitting") && (
            <div className="nk-empty">
              <span className="nk-empty__icon">
                <Icon name="ShieldCheck" size={40} stroke={1.8} color="var(--nk-text-muted)" />
              </span>
              <div style={{ display: "flex", flexDirection: "column", gap: "var(--nk-gap-sm)", maxWidth: 460 }}>
                <h1 style={{ margin: 0, fontFamily: "var(--nk-font-display)", fontWeight: 700, fontSize: 26, lineHeight: "30px", color: "var(--nk-text)" }}>{t.title}</h1>
                <p style={{ margin: 0, fontFamily: "var(--nk-font-body)", fontSize: 18, lineHeight: "28px", color: "var(--nk-text-2)" }}>{t.body}</p>
              </div>
              <button type="button" className="nk-btn nk-btn--primary" onClick={submit} disabled={state === "submitting"}>
                {state === "submitting" ? (
                  // Reuse the shared nk-spin keyframe (see globals.css) so the loader spins.
                  <span style={{ display: "inline-flex", animation: "nk-spin .8s linear infinite" }}>
                    <Icon name="LoaderCircle" size={18} stroke={2.2} />
                  </span>
                ) : (
                  <Icon name="ShieldCheck" size={18} stroke={2.2} />
                )}
                {t.confirm}
              </button>
            </div>
          )}

          {state === "success" && (
            <EmptyState
              icon="BadgeCheck"
              titleAs="h1"
              title={t.successTitle}
              subtitle={t.successBody}
              actionLabel={t.successCta}
              onAction={openApp}
              actionPrimary
              actionIcon="Download"
            />
          )}

          {state === "invalid" && (
            <EmptyState illustration="notFound" titleAs="h1" title={t.invalidTitle} subtitle={t.invalidBody} />
          )}

          {state === "already" && (
            <EmptyState illustration="notFound" titleAs="h1" title={t.alreadyTitle} subtitle={t.alreadyBody} />
          )}

          {state === "error" && (
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "var(--nk-gap-md)" }}>
              <EmptyState
                illustration="error"
                titleAs="h1"
                tone="danger"
                title={t.errorTitle}
                subtitle={t.errorBody}
                actionLabel={t.retry}
                onAction={submit}
                actionPrimary
              />
              {/* Support hook: correlationId (copyable) + contact, so a stuck user has
                  a traceable path for a GDPR-critical action. */}
              <p style={{ margin: 0, fontFamily: "var(--nk-font-body)", fontSize: 14, color: "var(--nk-text-muted)", textAlign: "center" }}>
                {correlationId && (
                  <>
                    {t.correlationLabel}: <code style={{ userSelect: "all", fontFamily: "var(--nk-font-body)" }}>{correlationId}</code>
                    {" · "}
                  </>
                )}
                <a href={`mailto:${CONTACT_EMAIL}`} style={{ color: "var(--nk-text-2)" }}>{CONTACT_EMAIL}</a>
              </p>
            </div>
          )}
        </main>
        <Footer locale={locale} />
      </div>
    </Chrome>
  );
}
