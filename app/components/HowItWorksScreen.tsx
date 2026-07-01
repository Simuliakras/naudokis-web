"use client";
// "Kaip tai veikia" (How it works) — standalone marketing page.
// Interactive sticky steps with a renter/owner role toggle and a synced phone
// mock-up, a trust strip, a mini-FAQ and the green app-download CTA. Ported from
// the design bundle's kaip-tai-veikia prototype to the nk- design system.
import { useCallback, useLayoutEffect, useRef, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Nav } from "./sections";
import { Footer } from "./sections-home";
import { Chrome } from "./Chrome";
import { FaqRow } from "./cards";
import { Icon, AppBadges, QR, Pattern } from "./ui";
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

  const data = t[role];
  const steps = data.steps;
  const current = steps[active];

  const switchRole = (r: Role) => { setRole(r); setActive(0); };

  return (
    <Chrome>
      <div className="nk-page htw-page">
        <Nav onSearch={() => router.push(localePath(locale, "/kategorijos"))} />
        <main id="nk-main">

          {/* HERO */}
          <section className="nk-hero-band">
            <Pattern name="hero-pattern" priority className="nk-hero-band__pattern nk-brand-pattern" />
            <div className="nk-container nk-hero-band__inner">
              <span className="htw-hero__eyebrow nk-eyebrow">{t.eyebrow}</span>
              <h1>{t.title}</h1>
              <p className="nk-hero-band__lead">{t.lead}</p>
            </div>
          </section>

          {/* STEPS (synced phone) */}
          <section className="nk-container htw-steps">
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
              </div>
              {/* live region: the decorative device is aria-hidden, so changing a
                  step announces only the step counter line ("2 / 4 · Reserve") —
                  the synced-phone payoff becomes audible, not just visual */}
              <div className="htw-right" id="htw-preview" aria-live="polite">
                <div className="htw-phonewrap">
                  <div className="htw-phonewrap__glow" style={{ background: `radial-gradient(circle at 50% 40%, ${TONE_GLOW[current.tone]}, transparent 65%)` }} />
                  <div className="htw-phone" aria-hidden="true">
                    <div className="htw-phone__notch" />
                    <div className="htw-phone__screen">
                      <PhoneScreen key={role + active} kind={current.screen} />
                    </div>
                  </div>
                  <div style={{ display: "flex", justifyContent: "center", marginTop: 26 }}>
                    <span className="htw-stepcount"><b>{active + 1}</b>&nbsp;/&nbsp;{steps.length}&nbsp;·&nbsp;{current.title}</span>
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
              <div className="htw-cta__badges"><AppBadges height={50} /></div>
              <div className="htw-cta__copy">
                <h2>{data.ctaTitle}</h2>
                <p>{data.ctaBody}</p>
              </div>
              <div className="htw-cta__qr"><QR size={180} /></div>
            </div>
          </section>

          {/* MINI-FAQ */}
          <section className="nk-container htw-faq" id="duk">
            <div className="htw-faq__head nk-reveal">
              <span className="nk-eyebrow">{t.faqEyebrow}</span>
              <h2>{t.faqTitle}</h2>
            </div>
            <div className="htw-faq__list nk-reveal">
              {t.faq.map((f, i) => (
                <FaqRow key={i} q={f.q} a={f.a} open={openFaq === i} onToggle={() => setOpenFaq(openFaq === i ? -1 : i)} />
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

  return (
    <div className="htw-list" ref={listRef} id="htw-steplist">
      <span className="htw-list__fill" ref={fillRef} />
      {steps.map((s, i) => (
        <button key={s.title} type="button"
          aria-current={i === active ? "step" : undefined}
          aria-expanded={i === active}
          aria-controls="htw-preview"
          className={"htw-step" + (i === active ? " is-active" : i < active ? " is-done" : "")}
          onClick={() => onSelect(i)}>
          <span className="htw-step__num">
            <span>{i + 1}</span>
            <Icon name={s.icon} size={30} color="var(--nk-text)" stroke={2} />
          </span>
          <span className="htw-step__body">
            <span className="htw-step__top">
              <h3>{s.title}</h3>
              <span className="htw-tag" style={{ color: TONE_FG[s.tone], background: TONE_BG[s.tone] }}>{s.tag}</span>
            </span>
            {/* grid-rows reveal (auto height → no clip on long LT copy) */}
            <span className="htw-step__reveal">
              <span className="htw-step__revealclip">
                <p className="htw-step__text">{s.body}</p>
              </span>
            </span>
            {/* Mobile (≤1280): the synced sticky phone is hidden, so the active step
                carries its own app screen inline — step and screen can't decouple.
                Hidden on desktop (>1280), where .htw-right shows the synced phone. */}
            {i === active && (
              <span className="htw-step__device" aria-hidden="true">
                <span className="htw-phone htw-phone--inline">
                  <span className="htw-phone__notch" />
                  <span className="htw-phone__screen"><PhoneScreen kind={s.screen} /></span>
                </span>
              </span>
            )}
          </span>
        </button>
      ))}
    </div>
  );
}

const TONE_FG: Record<HtwStep["tone"], string> = {
  yellow: "var(--nk-yellow)", green: "var(--nk-green)", purple: "var(--nk-purple-hover)",
};
const TONE_BG: Record<HtwStep["tone"], string> = {
  yellow: "var(--nk-yellow-tint)",
  green: "var(--nk-green-tint)",
  purple: "var(--nk-purple-tag)",
};

/* ---- phone mini-screens (one per step `screen`) ---- */
function Bar({ w, c }: { w: string; c?: string }) {
  return <span className="htw-ps-bar" style={{ width: w, background: c }} />;
}
function Ph({ h }: { h: number }) {
  return (
    <div className="htw-ps-ph" style={{ height: h }}>
      <Icon name="Camera" size={30} color="var(--nk-ps-icon)" stroke={1.5} style={{ opacity: 0.4 }} />
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
        <div className="htw-ps-grid"><Ph h={70} /><Ph h={70} /><Ph h={70} /><Ph h={70} /></div>
      </>
    ),
    reserve: (
      <>
        <Ph h={120} />
        <div className="htw-ps-row"><Bar w="60%" /><span className="htw-ps-pill htw-ps-pill--green">{s.frozenPill}</span></div>
        <div className="htw-ps-cta">{s.reserveCta}</div>
      </>
    ),
    pickup: (
      <>
        <div className="htw-ps-map"><Icon name="MapPin" size={26} color="var(--nk-yellow)" fill="var(--nk-yellow)" /></div>
        <Head />
        <div className="htw-ps-cta htw-ps-cta--ghost">{s.pickupCta}</div>
      </>
    ),
    review: (
      <>
        <div className="htw-ps-stars">{Array.from({ length: 5 }).map((_, i) => <Icon key={i} name="Star" size={22} color="var(--nk-yellow)" fill="var(--nk-yellow)" />)}</div>
        <Bar w="80%" /><Bar w="55%" />
        <div className="htw-ps-cta">{s.reviewCta}</div>
      </>
    ),
    list: (
      <>
        <div className="htw-ps-up"><Icon name="Camera" size={26} color="var(--nk-purple-hover)" stroke={1.8} /><span>{s.listUpload}</span></div>
        <div className="htw-ps-row"><Bar w="50%" /><span className="htw-ps-pill htw-ps-pill--purple">{s.listPrice}</span></div>
        <div className="htw-ps-cta">{s.listCta}</div>
      </>
    ),
    accept: (
      <>
        <Ph h={90} />
        <div className="htw-ps-req"><div className="htw-ps-avatar" /><div className="htw-ps-lines"><Bar w="65%" /><Bar w="40%" /></div></div>
        <div className="htw-ps-cta">{s.acceptCta}</div>
      </>
    ),
    handover: (
      <>
        <div className="htw-ps-map"><Icon name="Handshake" size={28} color="var(--nk-green)" stroke={2} /></div>
        <Head />
        <div className="htw-ps-cta htw-ps-cta--ghost">{s.handoverCta}</div>
      </>
    ),
    payout: (
      <>
        <div className="htw-ps-amt"><span>{s.payoutAmount}</span><i>{s.payoutLabel}</i></div>
        <Bar w="70%" />
        <div className="htw-ps-row"><Bar w="45%" /><span className="htw-ps-pill htw-ps-pill--green">{s.completedPill}</span></div>
      </>
    ),
  };
  return <div className="htw-ps-screen">{screens[kind]}</div>;
}
