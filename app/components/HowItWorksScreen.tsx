"use client";
// "Kaip tai veikia" (How it works) — standalone marketing page.
// Interactive sticky steps with a renter/owner role toggle and a synced phone
// mock-up, a trust strip, a mini-FAQ and the green app-download CTA. Ported from
// the design bundle's kaip-tai-veikia prototype to the nk- design system.
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Nav } from "./sections";
import { Footer } from "./sections-home";
import { Chrome } from "./Chrome";
import { FaqRow } from "./cards";
import { Icon, AppBadges, Breadcrumb, QR, Pattern, type IconName } from "./ui";
import { useI18n } from "./I18nProvider";
import { localePath } from "@/app/lib/i18n/config";
import type { HtwScreen, HtwStep } from "@/app/lib/i18n/types";

type Role = "renter" | "owner";

export function HowItWorksScreen() {
  const { locale, dict } = useI18n();
  const t = dict.howItWorks;
  const router = useRouter();

  const [role, setRole] = useState<Role>("renter");
  const [active, setActive] = useState(0);
  const [openFaq, setOpenFaq] = useState(0);

  // ?role=owner deep link (homepage owner band, earn card) — read on mount from
  // location so the page stays statically generated (useSearchParams would force
  // a Suspense/dynamic boundary for a one-shot read). Deliberately an effect, not
  // a lazy initializer: the prerendered HTML is always the renter role, so
  // reading location during render would be a hydration mismatch.
  useEffect(() => {
    if (new URLSearchParams(window.location.search).get("role") === "owner") {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- one-shot URL → state sync on mount
      setRole("owner");
    }
  }, []);

  const data = t[role];
  const steps = data.steps;
  const current = steps[active];

  const switchRole = (r: Role) => { setRole(r); setActive(0); setOpenFaq(0); };

  return (
    <Chrome>
      <div className="nk-page htw-page">
        <Nav onSearch={() => router.push(localePath(locale, "/kategorijos"))} />
        <main id="nk-main">

          {/* Breadcrumb parity with the other top-nav destinations (feed, cats) */}
          <div className="nk-container" style={{ paddingTop: 20 }}>
            <Breadcrumb homeLabel={dict.common.breadcrumbHome} label={dict.common.breadcrumbLabel} items={[{ label: t.eyebrow }]} />
          </div>

          {/* HERO */}
          <section className="nk-hero-band">
            <Pattern name="hero-pattern" priority className="nk-hero-band__pattern nk-brand-pattern" />
            <div className="nk-container nk-hero-band__inner">
              <span className="htw-hero__eyebrow nk-eyebrow">{t.eyebrow}</span>
              <h1>{t.title}</h1>
              <p className="nk-hero-band__lead">{t.lead}</p>
              {/* the first screen of an install-bridge explainer must offer an
                  action — the store badges are the zero-new-copy one */}
              <div className="htw-hero__actions">
                <AppBadges height={44} placement="hiw_hero" />
              </div>
            </div>
          </section>

          {/* STEPS (synced phone) */}
          <section className="nk-container htw-steps">
            {/* Always-mounted SR announcement of the step change ("2 / 4 · …") —
                the visible preview is display:none ≤1120px, and a live region
                inside it never fires there. */}
            <span className="nk-sr-only" id="htw-preview" aria-live="polite">{`${active + 1} / ${steps.length} · ${current.title}`}</span>
            <div className="htw-grid">
              <div className="htw-left">
                <div className="htw-toggle-row">
                  <div className="htw-toggle" role="group" aria-label={t.eyebrow}>
                    {(["renter", "owner"] as Role[]).map((r) => (
                      <button key={r} type="button" aria-pressed={role === r} aria-controls="htw-steplist"
                        className={"htw-toggle__btn" + (role === r ? " is-active" : "")}
                        onClick={() => switchRole(r)}>
                        {t[r].label}
                      </button>
                    ))}
                    <span className="htw-toggle__thumb" style={{ transform: role === "owner" ? "translateX(100%)" : "none" }} />
                  </div>
                </div>
                <p className="nk-hero-band__lead" style={{ textAlign: "left", maxWidth: 560, fontSize: 19, lineHeight: "30px" }}>{data.lead}</p>
                <StepList steps={steps} active={active} onSelect={setActive} role={role} />
                {/* Mid-funnel exit into the live product — the explainer's natural
                    next step is browsing, not only the store. */}
                <Link className="nk-btn nk-btn--ghost" style={{ alignSelf: "flex-start", borderColor: "var(--nk-border)" }}
                  href={localePath(locale, role === "owner" ? "/kategorijos" : "/skelbimai")}>
                  {t.browseCta} <Icon name="ArrowRight" size={16} stroke={2} color="var(--nk-text)" />
                </Link>
              </div>
              <div className="htw-right">
                <div className="htw-phonewrap">
                  <div className="htw-phonewrap__glow" style={{ background: `radial-gradient(circle at 50% 40%, ${TONE_GLOW[current.tone]}, transparent 65%)` }} />
                  <div className="htw-phone" aria-hidden="true">
                    <div className="htw-phone__notch" />
                    <div className="htw-phone__screen">
                      <PhoneScreen key={role + active} kind={current.screen} />
                    </div>
                  </div>
                  <div style={{ display: "flex", justifyContent: "center", marginTop: 26 }}>
                    <span className="htw-stepcount" aria-hidden="true"><b>{active + 1}</b>&nbsp;/&nbsp;{steps.length}&nbsp;·&nbsp;{current.title}</span>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* TRUST STRIP */}
          <section className="htw-trust">
            <Pattern name="section-pattern" className="htw-trust__pattern nk-brand-pattern" />
            <div className="nk-container htw-trust__inner">
              <div className="htw-trust__head nk-reveal">
                <span className="nk-eyebrow">{t.trustEyebrow}</span>
                <h2>{t.trustTitle}</h2>
              </div>
              <div className="htw-trust__grid nk-reveal">
                {t.trust.map((c) => (
                  <div key={c.title} className="htw-trust__card">
                    <span className="htw-trust__ico"><Icon name={c.icon} size={30} color="var(--nk-yellow)" stroke={1.8} /></span>
                    <div>
                      <h3>{c.title}</h3>
                      <p>{c.body}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* CTA (green) */}
          <section className="nk-container htw-cta-wrap">
            <div className="htw-cta nk-reveal nk-grain">
              <Image className="htw-cta__phone" src="/naudokis/download-phone.png" alt={t.ctaPhoneAlt} width={899} height={705} sizes="(max-width: 980px) 60vw, 480px" />
              <div className="htw-cta__spark" aria-hidden="true">
                <span style={{ left: "46%", top: "18%" }} /><span style={{ left: "58%", top: "30%" }} /><span style={{ left: "40%", top: "40%" }} />
              </div>
              {/* copy leads, actions follow (badges live INSIDE the copy column so
                  desktop reads headline → body → install, never action-first) */}
              <div className="htw-cta__copy">
                <h2>{data.ctaTitle}</h2>
                <p>{data.ctaBody}</p>
                <div className="htw-cta__badges"><AppBadges height={50} placement="hiw_cta" /></div>
                <Link href={localePath(locale, "/skelbimai")}
                  style={{ display: "inline-flex", alignItems: "center", gap: 7, width: "fit-content", fontFamily: "var(--nk-font-display)", fontWeight: 600, fontSize: 15.5, color: "var(--nk-text-2)", textDecoration: "underline", textUnderlineOffset: 3 }}>
                  {t.browseCta} <Icon name="ArrowRight" size={15} stroke={2} color="currentColor" />
                </Link>
              </div>
              <div className="htw-cta__qr">
                <QR size={180} />
                <span className="htw-cta__qrhint">{t.ctaQrHint}</span>
              </div>
            </div>
          </section>

          {/* MINI-FAQ */}
          <section className="nk-container htw-faq" id="duk">
            <div className="htw-faq__head nk-reveal">
              <span className="nk-eyebrow">{t.faqEyebrow}</span>
              <h2>{t.faqTitle}</h2>
            </div>
            <div className="htw-faq__list nk-reveal">
              {/* role-aware: the owner tab gets owner questions (payouts, fees,
                  damage) instead of the renter-slanted set */}
              {(role === "owner" ? t.faqOwner : t.faq).map((f, i) => (
                <FaqRow key={role + i} q={f.q} a={f.a} open={openFaq === i} onToggle={() => setOpenFaq(openFaq === i ? -1 : i)} />
              ))}
            </div>
          </section>
        </main>

        <Footer locale={locale} />
      </div>
    </Chrome>
  );
}

const TONE_GLOW: Record<HtwStep["tone"], string> = {
  yellow: "var(--nk-yellow-glow)",
  green: "var(--nk-green-glow)",
  purple: "var(--nk-purple-glow)",
};

/* ---- step list with the vertical progress spine ---- */
function StepList({
  steps, active, onSelect, role,
}: {
  steps: readonly HtwStep[];
  active: number;
  onSelect: (i: number) => void;
  role: Role;
}) {
  const listRef = useRef<HTMLDivElement>(null);
  const fillRef = useRef<HTMLSpanElement>(null);

  // Position the spine ends + fill at the first/active/last number centres,
  // mirroring the prototype (recomputed after the body-height transition).
  const measure = useCallback(() => {
    const list = listRef.current;
    const fill = fillRef.current;
    if (!list || !fill) {
      return;
    }
    const nums = list.querySelectorAll<HTMLElement>(".htw-step__num");
    if (!nums.length) {
      return;
    }
    const lr = list.getBoundingClientRect();
    const centerY = (el: HTMLElement) => {
      const r = el.getBoundingClientRect();
      return r.top - lr.top + r.height / 2;
    };
    const top = centerY(nums[0]);
    const bottom = lr.height - centerY(nums[nums.length - 1]);
    list.style.setProperty("--spine-top", top + "px");
    list.style.setProperty("--spine-bottom", bottom + "px");
    fill.style.height = Math.max(0, centerY(nums[active]) - centerY(nums[0])) + "px";
  }, [active]);

  // Re-measure whenever the list reflows — a ResizeObserver tracks size changes
  // directly (active body expand/collapse, viewport resize, font load), and
  // transitionend catches the precise end of the grid-rows reveal animation.
  useLayoutEffect(() => {
    measure();
    const list = listRef.current;
    if (!list || typeof ResizeObserver === "undefined") {
      return;
    }
    const ro = new ResizeObserver(measure);
    ro.observe(list);
    list.addEventListener("transitionend", measure);
    return () => {
      ro.disconnect();
      list.removeEventListener("transitionend", measure);
    };
  }, [measure, role]);

  // Valid-HTML structure: a <button> only permits phrasing content, so the row is
  // a div whose real <button> lives INSIDE the <h3> (FaqRow pattern — keeps the
  // 4-step heading outline in the accessibility tree) and stretches over the whole
  // row via the .htw-step__btn::after overlay, preserving the full-row click.
  return (
    <div className="htw-list" ref={listRef} id="htw-steplist">
      <span className="htw-list__fill" ref={fillRef} />
      {steps.map((s, i) => (
        <div key={s.title}
          className={"htw-step" + (i === active ? " is-active" : i < active ? " is-done" : "")}>
          <span className="htw-step__num" aria-hidden="true">
            <span>{i + 1}</span>
            <Icon name={s.icon} size={30} color="var(--nk-text)" stroke={2} />
          </span>
          <span className="htw-step__body">
            <span className="htw-step__top">
              <h3>
                <button type="button" className="htw-step__btn"
                  aria-current={i === active ? "step" : undefined}
                  aria-expanded={i === active}
                  aria-controls={`htw-step-reveal-${i}`}
                  onClick={() => onSelect(i)}>
                  {s.title}
                </button>
              </h3>
              <span className="htw-tag" style={{ color: TONE_FG[s.tone], background: TONE_BG[s.tone] }}>{s.tag}</span>
            </span>
            {/* grid-rows reveal (auto height → no clip on long LT copy) */}
            <span className="htw-step__reveal" id={`htw-step-reveal-${i}`}>
              <span className="htw-step__revealclip">
                <p className="htw-step__text">{s.body}</p>
              </span>
            </span>
            {/* Tablet/phone: the synced sticky phone is hidden, so the active step
                carries its own app screen inline — step and screen can't decouple.
                Hidden on desktop, where .htw-right shows the synced phone. */}
            {i === active && (
              <span className="htw-step__device" aria-hidden="true">
                <span className="htw-phone htw-phone--inline">
                  <span className="htw-phone__notch" />
                  <span className="htw-phone__screen"><PhoneScreen kind={s.screen} /></span>
                </span>
              </span>
            )}
          </span>
        </div>
      ))}
    </div>
  );
}

// Tag pills are 14px body text on TINTED washes — the flat-bg link tones
// (--nk-green / --nk-purple-hover) drop below 4.5:1 there, so the pills use the
// on-tint text tokens instead.
const TONE_FG: Record<HtwStep["tone"], string> = {
  yellow: "var(--nk-yellow)", green: "var(--nk-green-text)", purple: "var(--nk-purple-tag-text)",
};
const TONE_BG: Record<HtwStep["tone"], string> = {
  yellow: "var(--nk-yellow-tint)",
  green: "var(--nk-green-tint)",
  purple: "var(--nk-purple-tag)",
};

/* ---- phone mini-screens (one per step `screen`) ----
   Tiles carry illustrative CATEGORY glyphs (wrench/car/laptop/dumbbell), never
   the Camera placeholder — that's the live site's missing-photo language, which
   made the mocks read as failed image loads. Screens stay abstract (bars, no
   fabricated ratings/counts/names) but dense enough to read as a real app. */
function Bar({ w, c }: { w: string; c?: string }) {
  return <span className="htw-ps-bar" style={{ width: w, background: c }} />;
}
function Ph({ h, icon = "Wrench" }: { h: number; icon?: IconName }) {
  return (
    <div className="htw-ps-ph" style={{ height: h }}>
      <Icon name={icon} size={28} color="var(--nk-ps-icon)" stroke={1.6} style={{ opacity: 0.55 }} />
    </div>
  );
}
function Head() {
  return (
    <div className="htw-ps-top">
      <div className="htw-ps-dot" />
      <div className="htw-ps-lines"><Bar w="70%" /><Bar w="45%" /></div>
    </div>
  );
}

function PhoneScreen({ kind }: { kind: HtwScreen }) {
  const { dict } = useI18n();
  const s = dict.howItWorks.screen;
  const screens: Record<HtwScreen, React.ReactNode> = {
    search: (
      <>
        <div className="htw-ps-search"><Icon name="Search" size={16} color="var(--nk-bg)" stroke={2} /><span>{s.searchPlaceholder}</span></div>
        <div className="htw-ps-grid"><Ph h={70} icon="Wrench" /><Ph h={70} icon="Car" /><Ph h={70} icon="Laptop" /><Ph h={70} icon="Dumbbell" /></div>
        <Bar w="60%" />
      </>
    ),
    reserve: (
      <>
        <Ph h={110} icon="Car" />
        <Head />
        <div className="htw-ps-row"><Bar w="60%" /><span className="htw-ps-pill htw-ps-pill--green">{s.frozenPill}</span></div>
        <div className="htw-ps-cta">{s.reserveCta}</div>
      </>
    ),
    pickup: (
      <>
        <div className="htw-ps-map"><Icon name="MapPin" size={26} color="var(--nk-yellow)" fill="var(--nk-yellow)" /></div>
        <Head />
        <div className="htw-ps-row"><Bar w="45%" /><Bar w="25%" /></div>
        <div className="htw-ps-cta htw-ps-cta--ghost">{s.pickupCta}</div>
      </>
    ),
    review: (
      <>
        <Ph h={80} icon="Car" />
        <div className="htw-ps-stars">{Array.from({ length: 5 }).map((_, i) => <Icon key={i} name="Star" size={22} color="var(--nk-yellow)" fill="var(--nk-yellow)" />)}</div>
        <Bar w="80%" /><Bar w="55%" />
        <div className="htw-ps-cta">{s.reviewCta}</div>
      </>
    ),
    list: (
      <>
        <div className="htw-ps-up"><Icon name="Camera" size={26} color="var(--nk-purple-hover)" stroke={1.8} /><span>{s.listUpload}</span></div>
        <div className="htw-ps-row"><Bar w="50%" /><span className="htw-ps-pill htw-ps-pill--purple">{s.listPrice}</span></div>
        <Bar w="70%" />
        <div className="htw-ps-cta">{s.listCta}</div>
      </>
    ),
    accept: (
      <>
        <Ph h={90} icon="Laptop" />
        <div className="htw-ps-req"><div className="htw-ps-avatar" /><div className="htw-ps-lines"><Bar w="65%" /><Bar w="40%" /></div></div>
        <div className="htw-ps-cta">{s.acceptCta}</div>
      </>
    ),
    handover: (
      <>
        <div className="htw-ps-map"><Icon name="Handshake" size={28} color="var(--nk-green)" stroke={2} /></div>
        <Head />
        <div className="htw-ps-row"><Bar w="45%" /><Bar w="25%" /></div>
        <div className="htw-ps-cta htw-ps-cta--ghost">{s.handoverCta}</div>
      </>
    ),
    payout: (
      <>
        <div className="htw-ps-amt"><span>{s.payoutAmount}</span><i>{s.payoutLabel}</i></div>
        <div className="htw-ps-req"><div className="htw-ps-avatar" /><div className="htw-ps-lines"><Bar w="55%" /><Bar w="35%" /></div></div>
        <div className="htw-ps-row"><Bar w="45%" /><span className="htw-ps-pill htw-ps-pill--green">{s.completedPill}</span></div>
      </>
    ),
  };
  return <div className="htw-ps-screen">{screens[kind]}</div>;
}
