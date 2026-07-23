"use client";
// Referral bridge (/invite) — reads the ?code, validates it (fail-open), shows the
// reward honestly and routes the visitor to the install.
//
// PRIVACY BOUNDARY: this page must render with no AppsFlyer SDK, pixel, script,
// identifier or URL. So it never builds a OneLink. The install CTA points at the
// first-party /go, which hands off to AppsFlyer only if the visitor has explicitly
// allowed it (useInstallCta asks first when no choice is stored). Refusing keeps
// the code — it is entered in the app after signup, which is how the reward is
// actually granted. The reward NEVER depends on allowing measurement.
//
// The QR stays first-party too: it encodes this same /invite?code= URL, so the
// phone that scans it makes its own consent choice rather than inheriting a
// desktop one it was never asked about.
import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
// Route-scoped stylesheet: Next emits it as its own chunk linked only on /invite,
// so the .invite-* rules stay out of every other route's render-blocking CSS.
import "./invite.css";
import { Nav } from "./sections";
import { Footer } from "./sections-home";
import { Chrome } from "./Chrome";
import { Icon, AppBadges, QR, Pattern } from "./ui";
import { PageHead } from "./headers";
import { useI18n } from "./I18nProvider";
import { localePath } from "@/app/lib/i18n/config";
import { formatPrice } from "@/app/lib/listings";
import { normalizeCode, useValidateCode } from "@/app/lib/referrals";
import { goHref } from "@/app/lib/attribution";
import { SITE_ORIGIN } from "@/app/lib/contact";
import { useInstallCta } from "@/app/lib/use-install-cta";

export function InviteScreen() {
  const { locale, dict } = useI18n();
  const t = dict.invite;
  const router = useRouter();
  const params = useSearchParams();
  const code = normalizeCode(params.get("code"));
  const { openInstall } = useInstallCta();
  const [copied, setCopied] = useState(false);
  const [copyFailed, setCopyFailed] = useState(false);

  const { data: result } = useValidateCode(code);

  // First-party install href. The code rides as `deep_link_value` — /go forwards it
  // to AppsFlyer only on the granted path and simply ignores it otherwise, so this
  // one href is correct whether the visitor allows measurement or refuses it.
  const installLink = useMemo(
    () => (code ? goHref(undefined, { deep_link_value: code, pid: "web_invite", c: "invite" }) : goHref()),
    [code],
  );
  // The QR is scanned by a DIFFERENT device, which has its own (absent) consent state
  // — send it to this page, not to /go, so it can be asked. Locale-aware: the phone
  // should land on the page in the language the desktop visitor is reading.
  const qrValue = code
    ? `${SITE_ORIGIN}${localePath(locale, "/invite")}?code=${encodeURIComponent(code)}`
    : `${SITE_ORIGIN}/go`;

  // Headline by validation state — never block install. While validating (or on a
  // network/429 `unknown`) we stay optimistic; only a confirmed-invalid or missing
  // code drops to the plain install headline.
  const reward =
    result && "valid" in result && result.valid && result.refereeRewardCents > 0
      ? formatPrice(result.refereeRewardCents, locale)
      : null;
  const invalid = result !== undefined && "valid" in result && !result.valid;
  const headline = reward
    ? t.titleValid(reward)
    : !code || invalid
      ? t.titleGeneric
      : t.titleUnknown;

  // "Copied" is a transient confirmation, not a state the button stays in — otherwise
  // a second copy gives no feedback at all.
  const copyTimer = useRef<number | undefined>(undefined);
  useEffect(() => () => window.clearTimeout(copyTimer.current), []);
  const copyCode = async () => {
    if (!code) {
      return;
    }
    try {
      setCopyFailed(false);
      await navigator.clipboard.writeText(code);
      setCopied(true);
      window.clearTimeout(copyTimer.current);
      copyTimer.current = window.setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopyFailed(true);
    }
  };

  return (
    <Chrome>
      <div className="nk-page invite-page">
        <Nav onSearch={() => router.push(localePath(locale, "/nuoma"))} />
        <main id="nk-main">
          <section className="nk-hero-band invite-hero">
            <Pattern name="hero-pattern" priority className="nk-hero-band__pattern nk-brand-pattern" />
            {/* At/above --breakpoint-nav: copy/actions left, QR/code right (see .invite-cols) — the
                centred phone column blown up to 1440 wasted the whole width */}
            <div className="nk-container nk-hero-band__inner invite-cols">
              <div className="invite-cols__main">
                <PageHead size="band" eyebrow={t.eyebrow} title={headline} subtitle={t.lead} />
                {reward && <p className="invite-reward">{t.rewardExplainer}</p>}
                {/* confirmed-invalid/expired: say so — silently dropping the code
                    the visitor clicked through with reads as a glitch */}
                {invalid && <p className="invite-reward">{t.invalidNote}</p>}

                {/* truthful value bullets — the funnel was headline → button → footer */}
                <ul className="invite-benefits">
                  {t.benefits.map((b) => (
                    <li key={b}>
                      <Icon name="BadgeCheck" size={18} stroke={2} color="var(--nk-green-text)" /> {b}
                    </li>
                  ))}
                </ul>

                <div className="invite-actions">
                  <button type="button" className="nk-btn nk-btn--primary" onClick={() => openInstall(installLink)}>
                    <Icon name="Download" size={18} stroke={2.2} />
                    {t.ctaInstall}
                  </button>
                  {/* Direct store links — untracked. The attributed path is the button
                      above, which asks for the choice first. */}
                  <AppBadges height={50} placement="invite" />
                </div>
              </div>

              <div className="invite-cols__aside">
                <div className="invite-qr">
                  <QR value={qrValue} size={172} />
                  <span className="invite-qr__hint">{t.qrHint}</span>
                </div>

                {/* Don't show the code chip when the code is confirmed invalid — a
                    code chip next to a headline that no longer acknowledges an invite
                    reads as a glitch. */}
                {code && !invalid && (
                  <div className="invite-code">
                    <span className="invite-code__label">{t.codeLabel}</span>
                    <code className="invite-code__value">{code}</code>
                    <button type="button" className="nk-btn nk-btn--outline nk-btn--sm" onClick={copyCode}
                      aria-live="polite">
                      <Icon name={copied ? "Check" : "Copy"} size={16} stroke={2.2} />
                      {copied ? t.codeCopied : t.codeCopy}
                    </button>
                    <span className="invite-code__hint">{t.codeHint}</span>
                    <span className="invite-code__hint" role="status">{copyFailed ? t.codeCopyFailed : ""}</span>
                  </div>
                )}
              </div>
            </div>
          </section>
        </main>
        <Footer locale={locale} />
      </div>
    </Chrome>
  );
}
