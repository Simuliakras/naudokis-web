"use client";
// Legal pages (Privatumo politika / Naudojimo taisyklės). Clean long-form text
// with a sticky table-of-contents. NO redirect UI / app banner per spec — these
// pages are intentionally NOT wrapped in <Chrome/>.
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Nav, Footer } from "./sections";
import { Icon } from "./ui";
import { useI18n } from "./I18nProvider";

export function LegalPage({ doc: docKey }: { doc: "privacy" | "terms" }) {
  const { dict } = useI18n();
  const t = dict.legal;
  const doc = t[docKey];
  const router = useRouter();
  const crossHref = docKey === "privacy" ? "/naudojimo-taisykles" : "/privatumo-politika";
  const crossLabel = docKey === "privacy" ? t.crossToTerms : t.crossToPrivacy;

  return (
    <div className="nk-page">
      {/* Search routes to browsing — no app-redirect on legal pages. */}
      <Nav onSearch={() => router.push("/skelbimai")} />
      <main className="nk-container" style={{ paddingBlock: "40px 120px" }}>
        <nav aria-label={dict.common.breadcrumbLabel} style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap", marginBottom: 28 }}>
          <Link href="/" className="nk-link" style={{ fontFamily: "var(--nk-font-body)", fontSize: 16, color: "var(--nk-text-muted)" }}>{dict.common.breadcrumbHome}</Link>
          <Icon name="ChevronRight" size={15} stroke={2.2} color="#5b6669" />
          <span style={{ fontFamily: "var(--nk-font-body)", fontSize: 16, color: "var(--nk-text-2)" }}>{doc.title}</span>
        </nav>

        <header style={{ display: "flex", flexDirection: "column", gap: 14, marginBottom: 8, maxWidth: 760 }}>
          <h1 style={{ margin: 0, fontFamily: "var(--nk-font-display)", fontWeight: 700, fontSize: "clamp(34px, 5vw, 52px)", lineHeight: 1.05, letterSpacing: "-0.01em", color: "var(--nk-text)" }}>{doc.title}</h1>
          <span style={{ fontFamily: "var(--nk-font-body)", fontSize: 16, color: "var(--nk-text-muted)" }}>{doc.updated}</span>
          <p style={{ margin: "8px 0 0", fontFamily: "var(--nk-font-body)", fontSize: 20, lineHeight: "32px", color: "var(--nk-text-2)" }}>{doc.intro}</p>
        </header>

        <div className="nk-legal-grid">
          <aside className="nk-legal-toc">
            <span style={{ fontFamily: "var(--nk-font-display)", fontWeight: 700, fontSize: 14, letterSpacing: ".08em", textTransform: "uppercase", color: "var(--nk-text-muted)", marginBottom: 8 }}>{t.tocHeading}</span>
            {doc.sections.map((s) => (
              <a key={s.id} href={`#${s.id}`} className="nk-toc-link" style={{ fontFamily: "var(--nk-font-body)", fontSize: 16, lineHeight: "26px", color: "var(--nk-text-2)", textDecoration: "none", padding: "4px 0" }}>{s.heading}</a>
            ))}
          </aside>

          <article style={{ maxWidth: 760, display: "flex", flexDirection: "column", gap: 44 }}>
            {doc.sections.map((s) => (
              <section key={s.id} id={s.id} style={{ display: "flex", flexDirection: "column", gap: 16, scrollMarginTop: 110 }}>
                <h2 style={{ margin: 0, fontFamily: "var(--nk-font-display)", fontWeight: 700, fontSize: 28, lineHeight: "34px", color: "var(--nk-text)" }}>{s.heading}</h2>
                {s.body.map((p, j) => (
                  <p key={j} style={{ margin: 0, fontFamily: "var(--nk-font-body)", fontSize: 18, lineHeight: "30px", color: "var(--nk-text-2)" }}>{p}</p>
                ))}
                {s.subsections?.map((sub, k) => (
                  <div key={k} style={{ display: "flex", flexDirection: "column", gap: 10, marginTop: 8 }}>
                    <h3 style={{ margin: 0, fontFamily: "var(--nk-font-display)", fontWeight: 700, fontSize: 21, lineHeight: "28px", color: "var(--nk-text)" }}>{sub.heading}</h3>
                    {sub.body.map((p, m) => (
                      <p key={m} style={{ margin: 0, fontFamily: "var(--nk-font-body)", fontSize: 18, lineHeight: "30px", color: "var(--nk-text-2)" }}>{p}</p>
                    ))}
                  </div>
                ))}
              </section>
            ))}
            <div style={{ marginTop: 12, paddingTop: 28, borderTop: "1px solid var(--nk-border-faint)", display: "flex", gap: 16, flexWrap: "wrap" }}>
              <Link href={crossHref} className="nk-btn nk-btn--ghost" style={{ borderColor: "var(--nk-border)", textDecoration: "none" }}>
                {crossLabel} <Icon name="ArrowRight" size={17} color="var(--nk-text)" stroke={2} />
              </Link>
            </div>
          </article>
        </div>
      </main>
      <Footer />
    </div>
  );
}
