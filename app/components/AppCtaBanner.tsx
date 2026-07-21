// Shared app-download CTA banner — the gradient card with a bleed phone, spark
// dots, store badges and an install QR. Presentational (no directive, no hooks)
// so it renders in both server trees (home, categories) and the client "Kaip tai
// veikia" tree; each call site passes its own localized copy as plain strings.
import Image from "next/image";
import { AppBadges, QR } from "./ui";

export function AppCtaBanner({ eyebrow, title, body, phoneAlt, placement }: { eyebrow?: string; title: string; body: string; phoneAlt: string; placement: string }) {
  return (
    <section className="nk-container nk-appcta-wrap">
      <div className="nk-appcta nk-reveal nk-grain nk-gborder">
        <Image className="nk-appcta__phone" src="/naudokis/download-phone.png" alt={phoneAlt} width={899} height={705} sizes="(max-width: 980px) 60vw, 480px" />
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
          <div className="nk-appcta__badges"><AppBadges height={50} placement={placement} /></div>
        </div>
        <div className="nk-appcta__qr">
          <QR size={148} />
        </div>
      </div>
    </section>
  );
}
