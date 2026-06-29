"use client";
// Referral bridge (/invite) — reads the ?code, validates it (fail-open), shows
// the reward honestly and routes the visitor to the right store. The code is
// carried across the install boundary by a per-code Branch attribution link
// (buildInstallLink); when Branch is disabled it degrades to the /go smart link
// and the static install QR. Browsing/transacting still happens in the app.
import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Nav } from "./sections";
import { Footer } from "./sections-home";
import { Chrome } from "./Chrome";
import { Icon, AppBadges, QR, Pattern } from "./ui";
import { useI18n } from "./I18nProvider";
import { localePath } from "@/app/lib/i18n/config";
import { formatPrice } from "@/app/lib/listings";
import { normalizeCode, useValidateCode } from "@/app/lib/referrals";
import { buildInstallLink, INSTALL_FALLBACK } from "@/app/lib/branch";

export function InviteScreen() {
  const { locale, dict } = useI18n();
  const t = dict.invite;
  const router = useRouter();
  const params = useSearchParams();
  const code = normalizeCode(params.get("code"));

  const { data: result } = useValidateCode(code);

  // Resolve the install link once per code: a Branch link carrying
  // { referral_code }, or the /go fallback when Branch is off / unavailable.
  const [installLink, setInstallLink] = useState<string>(INSTALL_FALLBACK);
  useEffect(() => {
    let active = true;
    buildInstallLink(code).then((link) => {
      if (active) {
        setInstallLink(link);
      }
    });
    return () => {
      active = false;
    };
  }, [code]);

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

  // Branch links are absolute (http…); the /go fallback is a relative path, for
  // which the committed static QR (which encodes the absolute /go URL) is correct.
  const attributionLink = installLink.startsWith("http") ? installLink : undefined;
  const onInstall = () => {
    window.location.href = installLink;
  };

  return (
    <Chrome>
      <div className="nk-page invite-page">
        <Nav onSearch={() => router.push(localePath(locale, "/kategorijos"))} />
        <main id="nk-main">
          <section className="nk-hero-band invite-hero">
            <Pattern name="hero-pattern" priority className="nk-hero-band__pattern nk-brand-pattern" />
            <div className="nk-container nk-hero-band__inner">
              <span className="nk-eyebrow">{t.eyebrow}</span>
              <h1>{headline}</h1>
              <p className="nk-hero-band__lead">{t.lead}</p>
              {reward && <p className="invite-reward">{t.rewardExplainer}</p>}

              <div className="invite-actions">
                <button type="button" className="nk-btn nk-btn--primary" onClick={onInstall}>
                  <Icon name="Download" size={18} stroke={2.2} />
                  {t.ctaInstall}
                </button>
                <AppBadges height={50} href={attributionLink} />
              </div>

              <div className="invite-qr">
                <QR value={attributionLink} size={172} />
                <span className="invite-qr__hint">{t.qrHint}</span>
              </div>

              {code && (
                <div className="invite-code">
                  <span className="invite-code__label">{t.codeLabel}</span>
                  <code className="invite-code__value">{code}</code>
                </div>
              )}
            </div>
          </section>
        </main>
        <Footer locale={locale} />
      </div>
    </Chrome>
  );
}
