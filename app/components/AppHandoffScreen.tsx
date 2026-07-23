"use client";
// App-handoff landing — the browser fallback for the app-only paths the backend
// links to from transactional email (/booking-request/…, /chat/…, /my-profile, …).
//
// Anyone with the app installed never sees this: the OS claims the universal link
// and opens the app first. So this page is written for the person who does NOT have
// it — it names what they were trying to reach, offers the native deep link anyway,
// and points at the stores.
//
// Two rules it must not break:
//  1. It never loads the record behind the id. The web has no login, and a real id
//     must render identically to a made-up one, or the page becomes an oracle for
//     whether a booking / chat / document exists.
//  2. It never auto-forwards anywhere, and the store links are direct. Opening an
//     email must not disclose the click to AppsFlyer. The generic "get the app"
//     button is the one exception, and it asks first (useInstallCta → /go).
import { useRouter } from "next/navigation";
// Route-scoped stylesheet — see the header of app-handoff.css.
import "./app-handoff.css";
import { Nav } from "./sections";
import { Footer } from "./sections-home";
import { Chrome } from "./Chrome";
import { Icon, AppBadges, QR } from "./ui";
import { PageHead } from "./headers";
import { useI18n } from "./I18nProvider";
import { SMART_INSTALL_URL } from "@/app/lib/contact";
import { useInstallCta } from "@/app/lib/use-install-cta";
import { useStripSensitiveQuery } from "@/app/lib/use-strip-sensitive-query";
import { localePath } from "@/app/lib/i18n/config";
import type { HandoffKind } from "@/app/lib/i18n/types";

export function AppHandoffScreen({ kind, appPath, sensitiveQuery = false }: {
  kind: HandoffKind;
  // The public path, e.g. "/booking-request/<id>" — mirrored into the naudokis://
  // deep link so the app lands on the same screen.
  appPath: string;
  // Password-reset / email-verification links carry a single-use token in the query.
  // Keep it out of the address bar (history, screen-shares, the Referer of any later
  // click) while still handing it to the app.
  sensitiveQuery?: boolean;
}) {
  const { locale, dict } = useI18n();
  const t = dict.handoff;
  const copy = t.kinds[kind];
  const router = useRouter();
  const { openInstall } = useInstallCta();
  // Read on the client only: `searchParams` on the server would both leak the proxy's
  // internal locale marker into this page and put the token in server traces.
  const search = useStripSensitiveQuery(sensitiveQuery);

  // Fired on click, never on mount: an automatic scheme navigation shows an ugly
  // "cannot open page" dialog to exactly the audience this page is written for.
  const openApp = () => {
    window.location.href = `naudokis://${appPath.replace(/^\/+/, "")}${search.current}`;
  };

  return (
    <Chrome>
      <div className="nk-page">
        {/* There is nothing to search on this page — send them somewhere they can. */}
        <Nav onSearch={() => router.push(localePath(locale, "/kategorijos"))} />
        <main id="nk-main" className="nk-container nk-statusmain">
          <div className="nk-handoff">
            <PageHead title={copy.title} subtitle={copy.body} />

            <div className="nk-handoff__actions">
              <button type="button" className="nk-btn nk-btn--primary" onClick={openApp}>
                <Icon name="Smartphone" size={18} stroke={2.2} />
                {t.openApp}
              </button>
              <p className="nk-handoff__hint">{t.openHint}</p>
            </div>

            <div className="nk-handoff__install">
              <p className="nk-handoff__lead">{t.installLead}</p>
              {/* Direct store links — untracked. The attributed path is the button
                  below, which asks for the choice first. */}
              <AppBadges height={46} gap={14} placement="handoff" />
              <button type="button" className="nk-btn nk-btn--outline" onClick={() => openInstall(SMART_INSTALL_URL)}>
                <Icon name="Download" size={18} stroke={2.2} />
                {t.installCta}
              </button>
              {/* Desktop only (see .nk-handoff__qr): first-party /go, so the phone
                  that scans it makes its own attribution choice. */}
              <div className="nk-handoff__qr">
                <QR value={SMART_INSTALL_URL} size={140} />
                <span className="nk-handoff__qrhint">{t.qrHint}</span>
              </div>
            </div>
          </div>
        </main>
        <Footer locale={locale} />
      </div>
    </Chrome>
  );
}
