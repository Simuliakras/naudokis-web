"use client";
// "Kaip tai veikia" (How it works) — standalone marketing page.
// Interactive sticky steps with a renter/owner role toggle and a synced phone
// mock-up, a trust strip, a mini-FAQ and the green app-download CTA. Ported from
// the design bundle's kaip-tai-veikia prototype to the nk- design system.
import { useCallback, useLayoutEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Nav, Faq } from "./sections";
import { Footer } from "./sections-home";
import { Chrome } from "./Chrome";
import { AppCtaBanner } from "./AppCtaBanner";
import { FeatureBand } from "./FeatureBand";
import { Icon, AppBadges, Breadcrumb, Pattern, openRedirect, type IconName } from "./ui";
import { PageHead } from "./headers";
import { useI18n } from "./I18nProvider";
import { localePath } from "@/app/lib/i18n/config";
import type { HtwScreen, HtwStep } from "@/app/lib/i18n/types";

type Role = "renter" | "owner";

// Shared shell of the role-matched mid-funnel CTA (owner <button> / renter <Link>).
const CTA_CLASS = "nk-btn nk-btn--ghost";
const CTA_STYLE: React.CSSProperties = { alignSelf: "flex-start", borderColor: "var(--nk-border)" };
const CTA_ICON = <Icon name="ArrowRight" size={16} stroke={2} color="var(--nk-text)" />;

export function HowItWorksScreen() {
  const { locale, dict } = useI18n();
  const t = dict.howItWorks;
  const router = useRouter();

  const [role, setRole] = useState<Role>("renter");
  const [active, setActive] = useState(0);

  // ?role=owner deep link (from the homepage earn card) — read on mount from
  // location so the page stays statically generated (useSearchParams would force
  // a Suspense/dynamic boundary for a one-shot read). Deliberately an effect, not
  // a lazy initializer: the prerendered HTML is always the renter role, so
  // reading location during render would be a hydration mismatch. A LAYOUT
  // effect so the swap commits before the hydrated frame paints — the only
  // renter flash left is the unavoidable static-HTML paint before hydration.
  useLayoutEffect(() => {
    if (new URLSearchParams(window.location.search).get("role") === "owner") {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- one-shot URL → state sync on mount
      setRole("owner");
    }
  }, []);

  const data = t[role];
  const steps = data.steps;
  const current = steps[active];

  const switchRole = (r: Role) => { setRole(r); setActive(0); };

  return (
    <Chrome>
      <div className="nk-page htw-page">
        <Nav onSearch={() => router.push(localePath(locale, "/kategorijos"))} />
        <main id="nk-main">

          {/* HERO — breadcrumb overlays the pattern-backed band (parity with the
              other top-nav destinations: feed, cats) */}
          <section className="nk-hero-band">
            <Pattern name="hero-pattern" priority className="nk-hero-band__pattern nk-brand-pattern" />
            <div className="nk-container nk-hero-band__crumbs">
              <Breadcrumb homeLabel={dict.common.breadcrumbHome} label={dict.common.breadcrumbLabel} items={[{ label: t.eyebrow }]} />
            </div>
            <div className="nk-container nk-hero-band__inner">
              <PageHead size="band" eyebrow={t.eyebrow} title={t.title} subtitle={t.lead}>
                {/* the first screen of an install-bridge explainer must offer an
                    action — the store badges are the zero-new-copy one */}
                <div className="htw-hero__actions">
                  <AppBadges height={44} placement="hiw_hero" />
                </div>
              </PageHead>
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
                {/* Mid-funnel exit, role-matched: renters browse the live feed;
                    owners list items — that lives in the app, so it opens the
                    list-flow bridge modal instead of a page. */}
                {role === "owner" ? (
                  <button type="button" className={CTA_CLASS} style={CTA_STYLE}
                    onClick={() => openRedirect({ title: dict.bridge.listTitle, body: dict.bridge.listBody })}>
                    {t.listCta} {CTA_ICON}
                  </button>
                ) : (
                  <Link className={CTA_CLASS} style={CTA_STYLE} href={localePath(locale, "/skelbimai")}>
                    {t.browseCta} {CTA_ICON}
                  </Link>
                )}
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
          <FeatureBand eyebrow={t.trustEyebrow} title={t.trustTitle} items={t.trust} />

          {/* CTA (green) */}
          <AppCtaBanner eyebrow={t.ctaEyebrow} title={data.ctaTitle} body={data.ctaBody} phoneAlt={t.ctaPhoneAlt} placement="hiw_cta" />

          {/* FAQ — shared home-page section; role-aware content (the owner tab
              gets owner questions: payouts, fees, damage). `key={role}` remounts
              on role switch so the open row resets to the first question. */}
          <Faq
            key={role}
            eyebrow={t.faqEyebrow}
            heading={t.faqTitle}
            subheading={t.faqSubheading}
            items={role === "owner" ? t.faqOwner : t.faq}
          />
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
                Hidden on desktop, where .htw-right shows the synced phone. Every
                step keeps its device MOUNTED inside a 0fr→1fr reveal (the
                .htw-step__reveal idiom): the old conditional mount teleported
                everything below by a full phone-mock height on each step switch. */}
            <span className="htw-step__devicewrap" aria-hidden="true">
              <span className="htw-step__deviceclip">
                <span className="htw-step__device">
                  <span className="htw-phone htw-phone--inline">
                    <span className="htw-phone__notch" />
                    <span className="htw-phone__screen"><PhoneScreen kind={s.screen} /></span>
                  </span>
                </span>
              </span>
            </span>
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
