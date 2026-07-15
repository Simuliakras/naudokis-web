// Shared "trust features" band — a brand-patterned dark section with an eyebrow +
// heading and a row of glass cards (centered yellow-tint icon disk, title, body).
// Presentational (no directive, no hooks) so it renders in both the home server
// tree and the "Kaip tai veikia" client tree; each call site passes its own copy.
import { Icon, type IconName, Pattern } from "./visual";
import { SectionHead } from "./headers";

export function FeatureBand({ eyebrow, title, items }: {
  eyebrow: string;
  title: string;
  items: readonly { icon: IconName; title: string; body: string }[];
}) {
  return (
    <section style={{ position: "relative", background: "var(--nk-bg-deep)", overflow: "hidden" }}>
      <Pattern name="section-pattern" className="nk-brand-pattern" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }} />
      <div className="nk-container" style={{ position: "relative", paddingBlock: "var(--nk-section-y)" }}>
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
    <div className={className ? `nk-feature ${className}` : "nk-feature"} style={{
      flex: 1, borderRadius: "var(--nk-r-card)", background: "var(--nk-glass-strong)", backdropFilter: "var(--nk-blur)", WebkitBackdropFilter: "var(--nk-blur)", border: "1px solid var(--nk-border-strong)", boxShadow: "var(--nk-edge-top), var(--nk-shadow-1)",
      padding: "var(--nk-block-pad)", display: "flex", flexDirection: "column", alignItems: "center", gap: "var(--nk-stack-lg)", textAlign: "center",
    }}>
      <span style={{ width: "var(--nk-size-icon-lg)", height: "var(--nk-size-icon-lg)", borderRadius: "50%", background: "var(--nk-yellow-tint)", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <Icon name={icon} size={44} color="var(--nk-yellow)" stroke={2} />
      </span>
      <div style={{ display: "flex", flexDirection: "column", gap: "var(--nk-gap-xs)" }}>
        {/* reserve ~2 lines so a card whose title wraps to 3 lines doesn't push its
            body below the neighbours' — flex-start keeps 1-line titles on the SAME
            first baseline as 2-line neighbours (centred slots jogged up-down-up) */}
        <h3 className="nk-h-card" style={{ margin: 0, minHeight: "2.3em", display: "flex", alignItems: "flex-start", justifyContent: "center" }}>{title}</h3>
        <p className="nk-body" style={{ margin: 0 }}>{body}</p>
      </div>
    </div>
  );
}
