// Shared app-download CTA banner — the gradient card with a bleed phone, spark
// dots, store badges and an install QR. Presentational (no directive, no hooks)
// so it renders in both server trees (home, categories) and the client "Kaip tai
// veikia" tree; each call site passes its own localized copy as plain strings.
import Image from "next/image";
import { IMAGE_SIZES } from "@/app/lib/breakpoints";
import { AppBadges, QR } from "./ui";

export function AppCtaBanner({ eyebrow, title, body, phoneAlt, placement }: { eyebrow?: string; title: string; body: string; phoneAlt: string; placement: string }) {
  return (
    <section className="nk-container nk-appcta-wrap">
      <div className="nk-appcta nk-reveal nk-grain nk-gborder">
        <Image className="nk-appcta__phone" src="/naudokis/download-phone.png" alt={phoneAlt} width={899} height={705} sizes={IMAGE_SIZES.appCtaPhone} />
        <div className="nk-appcta__spark" aria-hidden="true">
          <span style={{ left: "45%", top: "16%" }} /><span style={{ left: "60%", top: "26%" }} /><span style={{ left: "40%", top: "40%" }} /><span style={{ left: "53%", top: "52%" }} /><span style={{ left: "44%", top: "68%" }} /><span style={{ left: "84%", top: "7%" }} />
        </div>
        {/* copy leads, actions follow (badges live INSIDE the copy column so
            desktop reads headline → body → install, never action-first) */}
        <div className="nk-appcta__copy">
          {/* eyebrow hugs the headline (the sitewide .nk-headhug anatomy),
              tighter than the copy column's own rhythm */}
          <div className="nk-headhug">
            {eyebrow && <span className="nk-eyebrow">{eyebrow}</span>}
            <h2>{title}</h2>
          </div>
          <p>{body}</p>
          {/* badges + QR are one install row: two routes to the same action, so they
              read as siblings. On wide desktop CSS lifts the QR out of this row into
              the band's bottom-right corner (see .nk-appcta__qr in globals.css). */}
          <div className="nk-appcta__actions">
            <AppBadges height={50} placement={placement} />
            <div className="nk-appcta__qr"><QR size={132} /></div>
          </div>
        </div>
      </div>
    </section>
  );
}
