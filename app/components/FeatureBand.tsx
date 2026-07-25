// Shared "trust features" band — a brand-patterned dark section with an eyebrow +
// heading and a row of glass cards (centered yellow-tint icon disk, title, body).
// Presentational (no directive, no hooks) so it renders in both the home server
// tree and the "Kaip tai veikia" client tree; each call site passes its own copy.
import type React from "react";
import { Icon, type IconName, Pattern } from "./visual";
import { SectionHead } from "./headers";

export function FeatureBand({ eyebrow, title, items, style }: {
  eyebrow: string;
  title: string;
  items: readonly { icon: IconName; title: string; body: string }[];
  style?: React.CSSProperties;
}) {
  return (
    <section style={{ position: "relative", background: "var(--nk-bg-deep)", overflow: "hidden", ...style }}>
      <Pattern name="section-pattern" className="nk-brand-pattern" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }} />
      <div className="nk-container nk-featureband-container" style={{ position: "relative", paddingBlock: "var(--nk-section-y)" }}>
        {/* the page's strongest trust content gets the sitewide eyebrow+H2 anatomy
            instead of floating unlabelled */}
        <SectionHead eyebrow={eyebrow} title={title} />
        <div className="nk-row">
          {items.map((f) => <FeatureCard key={f.title} {...f} className="nk-reveal" />)}
        </div>
      </div>
    </section>
  );
}

function FeatureCard({
  icon, title, body, className,
}: {
  icon: IconName;
  title: string;
  body: string;
  className?: string;
}) {
  return (
    // Skin and layout are entirely in globals.css (.nk-feature and friends). They
    // must not come back inline: the band restacks itself per tier, and an inline
    // declaration can only be overridden with `!important` on every rule that
    // touches it — which is what made the two tiers fight over source order, and
    // what silently disabled this card's own :hover background.
    <div className={className ? `nk-feature ${className}` : "nk-feature"}>
      <span className="nk-feature__icon">
        <Icon name={icon} size={44} color="var(--nk-yellow)" stroke={2} />
      </span>
      <div className="nk-feature__text">
        <h3 className="nk-h-card">{title}</h3>
        <p className="nk-body">{body}</p>
      </div>
    </div>
  );
}
