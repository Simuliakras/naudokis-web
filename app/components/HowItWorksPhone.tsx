"use client";
// Phone mini-screens for the "Kaip tai veikia" page — one per step, synced to
// the active step by HowItWorksScreen.
//
// Each screen reproduces the real naudokis.lt-app screen that step represents
// (app dark theme, app anatomy: status bar → ModalHeader → clipped body →
// sticky footer), so a visitor sees the app they are about to install rather
// than a wireframe. Copy comes from the app's own translations via
// dict.howItWorks.screen; the palette lives in the .htw-appscreen block in
// globals.css and is the APP's, deliberately scoped away from site surfaces.
//
// The whole screen is authored at the 312px desktop width and scaled as a unit
// (see .htw-appscreen), so sizes here are plain px at that reference width and
// need no per-breakpoint tuning. Everything is decorative — the device is
// aria-hidden by its host — so the fake controls are spans, not buttons.
import { Icon, type IconName } from "./ui";
import { useI18n } from "./I18nProvider";
import type { HtwScreen } from "@/app/lib/i18n/types";

// Device chrome, not translatable copy — the app's own mock clock.
const STATUS_TIME = "9:41";

/* ---------------- screen shell ---------------- */
function Screen({
  title, back, trail, bodyStyle, children, footer,
}: {
  title: string;
  back?: boolean; // back arrow instead of the close ×
  trail?: React.ReactNode;
  bodyStyle?: React.CSSProperties;
  children: React.ReactNode;
  footer?: React.ReactNode;
}) {
  return (
    <div className="htw-appscreen">
      <div className="htw-appscreen__in">
        <div className="htw-as-status">
          <span>{STATUS_TIME}</span>
          <span className="htw-as-batt" />
        </div>
        <div className="htw-as-head">
          <span className="htw-as-headbtn">
            <Icon name={back ? "ArrowLeft" : "X"} size={16} color="var(--nk-app-text)" />
          </span>
          <span className="htw-as-headtitle">{title}</span>
          {trail ?? <span />}
        </div>
        <div className="htw-as-body" style={bodyStyle}>{children}</div>
        {footer}
      </div>
    </div>
  );
}

const HELP = <span className="htw-as-headbtn">?</span>;
const MORE = (
  <span className="htw-as-headbtn">
    <Icon name="MoreHorizontal" size={16} color="var(--nk-app-text-2)" />
  </span>
);

/* ---------------- atoms ---------------- */
function Label({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return <span className="htw-as-label" style={style}>{children}</span>;
}

function Hair() {
  return <div className="htw-as-hair" />;
}

// One line of the payment / earnings breakdown.
function Fee({ label, value, muted }: { label: string; value: string; muted?: boolean }) {
  return (
    <div className="htw-as-fee">
      <span>{label}</span>
      <span style={muted ? { color: "var(--nk-app-muted)" } : undefined}>{value}</span>
    </div>
  );
}

// Photo placeholder — the app's image-slot gradient. `style` carries the box.
function Media({
  icon, size, style, children,
}: {
  icon: IconName;
  size: number;
  style: React.CSSProperties;
  children?: React.ReactNode;
}) {
  return (
    <span className="htw-as-media" style={style}>
      <Icon name={icon} size={size} color="var(--nk-app-icon)" stroke={1.8} />
      {children}
    </span>
  );
}

function Radio({
  dot, title, hint, on,
}: {
  dot: string;
  title: string;
  hint?: string;
  on?: boolean;
}) {
  return (
    <div className={"htw-as-radio" + (on ? " is-on" : "")}>
      <span className="htw-as-radio__dot" style={{ background: dot }} />
      <div style={{ flex: 1 }}>
        <div className="htw-as-radio__t">{title}</div>
        {hint ? <div className="htw-as-radio__h">{hint}</div> : null}
      </div>
      <span className="htw-as-radio__mark" />
    </div>
  );
}

function Stars({ size, filled = 5, gap, padding }: { size: number; filled?: number; gap: number; padding?: string }) {
  return (
    <div className="htw-as-stars" style={{ gap, padding }}>
      {Array.from({ length: 5 }).map((_, i) => (
        <Icon key={i} name="Star" size={size}
          {...(i < filled
            ? { fill: "var(--nk-app-accent)" }
            : { color: "var(--nk-app-field-ink)" })} />
      ))}
    </div>
  );
}

function Foot({ children }: { children: React.ReactNode }) {
  return <div className="htw-as-foot">{children}</div>;
}

function Btn({
  tone, children, style,
}: {
  tone?: "ghost" | "accent";
  children: React.ReactNode;
  style?: React.CSSProperties;
}) {
  const cls = "htw-as-btn" + (tone ? " htw-as-btn--" + tone : "");
  return <span className={cls} style={style}>{children}</span>;
}

/* ---------------- shared sub-blocks ---------------- */
// Item summary card (reserve + payout) — thumb, then two or three meta lines.
function ItemCard({
  thumb, thumbIcon, children,
}: {
  thumb: number;
  thumbIcon: number;
  children: React.ReactNode;
}) {
  return (
    <div style={{ display: "flex", gap: 10, background: "var(--nk-app-card)", borderRadius: 16, padding: 9 }}>
      <Media icon="Wrench" size={thumbIcon}
        style={{ width: thumb, height: thumb, borderRadius: 11 }} />
      <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", justifyContent: "center", gap: 3 }}>
        {children}
      </div>
    </div>
  );
}

// Photos section header + count pill (both handoff screens).
function PhotosHead({ label, count }: { label: string; count: string }) {
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
      <span style={{ display: "flex", alignItems: "center", gap: 7, fontFamily: "var(--nk-font-display)", fontWeight: 600, fontSize: 12.5, color: "var(--nk-app-text)" }}>
        <Icon name="Image" size={15} color="var(--nk-app-text)" />{label}
      </span>
      <span className="htw-as-count">{count}</span>
    </div>
  );
}

const SUB_HEAD: React.CSSProperties = {
  fontFamily: "var(--nk-font-display)", fontWeight: 600, fontSize: 12.5,
  color: "var(--nk-app-text)", marginTop: 2,
};

const CAT_ICONS: readonly IconName[] = ["Wrench", "Car", "Laptop", "Dumbbell", "PartyPopper"];

/* ---------------- the 8 screens ---------------- */
export function PhoneScreen({ kind }: { kind: HtwScreen }) {
  const { dict } = useI18n();
  const s = dict.howItWorks.screen;

  const screens: Record<HtwScreen, React.ReactNode> = {
    /* RENTER 1 — Paieška (app/search.tsx) */
    search: (
      <Screen title={s.search.title} bodyStyle={{ gap: 12 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 9, background: "var(--nk-app-field)", borderRadius: 14, padding: "8px 8px 8px 13px" }}>
          <Icon name="Search" size={16} color="var(--nk-app-field-ink)" />
          <span style={{ flex: 1, fontSize: 12.5, color: "var(--nk-app-field-ink)" }}>{s.search.placeholder}</span>
          <span style={{ width: 30, height: 30, borderRadius: 10, background: "var(--nk-app-primary)", display: "grid", placeItems: "center" }}>
            <Icon name="Search" size={15} color="var(--nk-app-text)" />
          </span>
        </div>
        <Label style={{ marginTop: 2 }}>{s.search.catsLabel}</Label>
        <div style={{ display: "flex", flexDirection: "column" }}>
          {s.search.cats.map((c, i) => (
            <div key={c} style={{ display: "flex", alignItems: "center", gap: 11, padding: "9px 0", borderBottom: i < 4 ? "1px solid rgba(255,255,255,.07)" : undefined }}>
              <span style={{ width: 34, height: 34, borderRadius: 10, background: "var(--nk-app-soft)", display: "grid", placeItems: "center" }}>
                <Icon name={CAT_ICONS[i]} size={17} color="var(--nk-app-text-2)" />
              </span>
              <span style={{ flex: 1, fontSize: 12.5, color: "var(--nk-app-text-3)" }}>{c}</span>
              <Icon name="ChevronRight" size={15} color="var(--nk-app-field-ink)" />
            </div>
          ))}
        </div>
      </Screen>
    ),

    /* RENTER 2 — Nuomos užklausa (listing/reservation/[id].tsx) */
    reserve: (
      <Screen title={s.reserve.title} trail={HELP}
        footer={
          <Foot>
            <Btn style={{ fontSize: 12.5 }}>
              <Icon name="ShieldCheck" size={16} color="var(--nk-app-text)" />{s.reserve.cta}
            </Btn>
          </Foot>
        }>
        <ItemCard thumb={54} thumbIcon={22}>
          <span style={{ fontSize: 9, letterSpacing: ".05em", textTransform: "uppercase", color: "var(--nk-app-muted-2)", fontFamily: "var(--nk-font-display)", fontWeight: 600 }}>{s.itemCat}</span>
          <span style={{ fontSize: 12.5, color: "var(--nk-app-text)", fontFamily: "var(--nk-font-display)", fontWeight: 600, lineHeight: 1.2 }}>{s.item}</span>
          <span style={{ fontSize: 11.5, color: "var(--nk-app-link)", fontWeight: 600 }}>{s.itemPrice}</span>
        </ItemCard>

        <Label>{s.reserve.rentalLabel}</Label>
        <div className="htw-as-card">
          <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
            <Icon name="Calendar" size={16} color="var(--nk-app-link)" />
            <span style={{ flex: 1, fontSize: 12, color: "var(--nk-app-text)" }}>{s.dates}</span>
            <span style={{ fontSize: 11, color: "var(--nk-app-muted)" }}>{s.days}</span>
          </div>
          <Hair />
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <span style={{ fontSize: 12, color: "var(--nk-app-text-2)" }}>{s.reserve.cancelLabel}</span>
            <span style={{ fontSize: 11, color: "var(--nk-app-muted)" }}>{s.reserve.cancelValue}</span>
          </div>
        </div>

        <Label>{s.reserve.handoffLabel}</Label>
        <div style={{ display: "flex", gap: 4, background: "var(--nk-app-soft)", borderRadius: 13, padding: 4 }}>
          <span style={{ ...SEG, background: "var(--nk-app-primary)", color: "var(--nk-app-text)" }}>
            <Icon name="MapPin" size={14} color="var(--nk-app-text)" />{s.reserve.pickup}
          </span>
          <span style={{ ...SEG, color: "var(--nk-app-muted-3)" }}>
            <Icon name="Truck" size={14} color="var(--nk-app-muted-3)" />{s.reserve.delivery}
          </span>
        </div>

        <Label>{s.reserve.feesLabel}</Label>
        <div className="htw-as-card" style={{ gap: 8 }}>
          <Fee label={s.reserve.rentRow} value={s.rentValue} />
          <Fee label={s.reserve.delivery} value={s.reserve.deliveryValue} />
          <Fee label={s.reserve.depositLabel} value={s.reserve.depositValue} />
          <Hair />
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, fontFamily: "var(--nk-font-display)", fontWeight: 700, color: "var(--nk-app-text)" }}>
            <span>{s.reserve.totalLabel}</span>
            <span>{s.reserve.totalValue}</span>
          </div>
        </div>
      </Screen>
    ),

    /* RENTER 3 — Daikto perdavimas (booking-request/handoff/[bookingId].tsx) */
    pickup: (
      <Screen title={s.pickup.title} back
        footer={<Foot><Btn>{s.confirm}</Btn></Foot>}>
        <div className="htw-as-note">
          <Icon name="ShieldCheck" size={18} color="var(--nk-app-link)" />
          <span style={{ flex: 1 }}>{s.pickup.intro}</span>
        </div>
        <PhotosHead label={s.photosLabel} count={s.pickup.photoCount} />
        <div style={{ display: "flex", gap: 8 }}>
          <span style={PHOTO_BTN}>
            <Icon name="Camera" size={15} color="var(--nk-app-text)" />{s.pickup.camera}
          </span>
          <span style={PHOTO_BTN}>
            <Icon name="Image" size={15} color="var(--nk-app-text)" />{s.pickup.gallery}
          </span>
        </div>
        <span style={SUB_HEAD}>{s.conditionLabel}</span>
        <Radio on dot="var(--nk-app-success)" title={s.conditionGood} hint={s.pickup.goodHint} />
        <Radio dot="var(--nk-app-accent)" title={s.conditionWorn} />
        <Radio dot="var(--nk-app-error)" title={s.conditionDamaged} />
      </Screen>
    ),

    /* RENTER 4 — Atsiliepimas (review/[bookingId].tsx) */
    review: (
      <Screen title={s.review.title}
        bodyStyle={{ padding: "16px 20px 0", alignItems: "center", gap: 13 }}
        footer={<Foot><Btn>{s.review.cta}</Btn></Foot>}>
        <Media icon="Wrench" size={30} style={{ width: 74, height: 74, borderRadius: 16 }} />
        <div style={{ textAlign: "center", display: "flex", flexDirection: "column", gap: 4 }}>
          <span style={{ fontFamily: "var(--nk-font-display)", fontWeight: 600, fontSize: 14, color: "var(--nk-app-text)" }}>{s.item}</span>
          <span style={{ fontSize: 11.5, color: "var(--nk-app-muted)" }}>{s.review.prompt}</span>
        </div>
        <Stars size={27} gap={9} padding="4px 0" />
        <div style={{ alignSelf: "stretch", height: 96, borderRadius: 14, background: "var(--nk-app-soft)", border: "1px solid var(--nk-app-line)", padding: 11 }}>
          <span style={{ fontSize: 11, color: "var(--nk-app-field-ink)" }}>{s.review.placeholder}</span>
        </div>
      </Screen>
    ),

    /* OWNER 1 — Naujas skelbimas (app/add → PhotosStepPanel) */
    list: (
      <Screen title={s.list.title}
        footer={
          <Foot>
            <Btn>{s.list.cta}<Icon name="ArrowRight" size={16} color="var(--nk-app-text)" /></Btn>
          </Foot>
        }>
        <span style={{ fontFamily: "var(--nk-font-display)", fontWeight: 700, fontSize: 16, color: "var(--nk-app-text)", lineHeight: 1.2 }}>{s.list.heading}</span>
        <span style={{ fontSize: 11, color: "var(--nk-app-muted)", lineHeight: 1.35 }}>{s.list.body}</span>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 2 }}>
          <Label>{s.photosLabel}</Label>
          <span style={{ fontSize: 10, color: "var(--nk-app-muted)" }}>{s.list.photoCount}</span>
        </div>
        <Media icon="Image" size={30} style={{ height: 118, borderRadius: 14 }}>
          <span style={{ position: "absolute", top: 8, left: 8, background: "rgba(0,0,0,.6)", color: "var(--nk-app-text)", fontSize: 9, fontFamily: "var(--nk-font-display)", fontWeight: 600, padding: "3px 7px", borderRadius: 999 }}>{s.list.cover}</span>
        </Media>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8 }}>
          <Media icon="Image" size={20} style={{ aspectRatio: "1", borderRadius: 11 }} />
          <Media icon="Image" size={20} style={{ aspectRatio: "1", borderRadius: 11 }} />
          <span className="htw-as-dash" style={{ aspectRatio: "1" }}>
            <span style={{ fontSize: 20, fontWeight: 300, lineHeight: 1 }}>+</span>
            <span>{s.addPhoto}</span>
          </span>
        </div>
      </Screen>
    ),

    /* OWNER 2 — Užklausos peržiūra (OwnerBookingRequestDetailScreen) */
    accept: (
      <Screen title={s.accept.title} back trail={MORE}
        footer={
          <Foot>
            <Btn tone="ghost">{s.accept.reject}</Btn>
            <Btn style={{ flex: 1.5, fontSize: 13 }}>{s.accept.accept}</Btn>
          </Foot>
        }>
        <Label>{s.accept.renterLabel}</Label>
        <div style={{ display: "flex", alignItems: "center", gap: 11, background: "var(--nk-app-card)", borderRadius: 16, padding: 11 }}>
          <span style={{ width: 44, height: 44, borderRadius: "50%", background: "var(--nk-app-primary)", display: "grid", placeItems: "center", flex: "none", fontFamily: "var(--nk-font-display)", fontWeight: 700, fontSize: 16, color: "var(--nk-app-text)" }}>{s.renterInitial}</span>
          <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", gap: 3 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
              <span style={{ fontSize: 13, color: "var(--nk-app-text)", fontFamily: "var(--nk-font-display)", fontWeight: 600 }}>{s.renter}</span>
              <Icon name="BadgeCheck" size={14} color="var(--nk-app-success-bright)" />
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
              <Icon name="Star" size={12} fill="var(--nk-app-accent)" />
              <span style={{ fontSize: 11, color: "var(--nk-app-text-2)" }}>{s.accept.rating}</span>
              <span style={{ fontSize: 11, color: "var(--nk-app-muted)" }}>{s.accept.rentals}</span>
            </div>
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 9, background: "var(--nk-app-card)", borderRadius: 16, padding: "10px 11px" }}>
          <Icon name="Calendar" size={15} color="var(--nk-app-link)" />
          <span style={{ flex: 1, fontSize: 12, color: "var(--nk-app-text)" }}>{s.dates}</span>
          <span style={{ fontSize: 11, color: "var(--nk-app-muted)" }}>{s.days}</span>
        </div>
        <Label>{s.accept.earningsLabel}</Label>
        <div className="htw-as-card" style={{ padding: 12 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
            <span style={{ fontSize: 11, color: "var(--nk-app-muted)" }}>{s.payoutLabel}</span>
            <span style={{ fontFamily: "var(--nk-font-display)", fontWeight: 700, fontSize: 19, color: "var(--nk-app-text)" }}>{s.payoutValue}</span>
          </div>
          <Hair />
          <Fee label={s.rentLabel} value={s.rentValue} />
          <Fee label={s.feeLabel} value={s.feeValue} muted />
        </div>
      </Screen>
    ),

    /* OWNER 3 — Daikto grąžinimas (same HandoffConditionForm, phase="return") */
    handover: (
      <Screen title={s.handover.title} back
        footer={<Foot><Btn>{s.confirm}</Btn></Foot>}>
        <div className="htw-as-note">
          <Icon name="ShieldCheck" size={18} color="var(--nk-app-link)" />
          <span style={{ flex: 1 }}>{s.handover.intro}</span>
        </div>
        <PhotosHead label={s.photosLabel} count={s.handover.photoCount} />
        <div style={{ display: "flex", gap: 8 }}>
          {[0, 1].map((i) => (
            <Media key={i} icon="Image" size={20} style={{ width: 62, height: 62, borderRadius: 11 }}>
              <span style={{ position: "absolute", bottom: 4, right: 4, width: 18, height: 18, borderRadius: "50%", background: "var(--nk-app-success)", display: "grid", placeItems: "center" }}>
                <Icon name="BadgeCheck" size={12} color="var(--nk-app-text)" />
              </span>
            </Media>
          ))}
          <span className="htw-as-dash" style={{ width: 62, height: 62, gap: 2 }}>
            <Icon name="Camera" size={16} color="var(--nk-app-muted-3)" />
            <span>{s.addPhoto}</span>
          </span>
        </div>
        <span style={SUB_HEAD}>{s.conditionLabel}</span>
        <Radio on dot="var(--nk-app-success)" title={s.conditionGood} hint={s.handover.goodHint} />
        <Radio dot="var(--nk-app-accent)" title={s.conditionWorn} />
      </Screen>
    ),

    /* OWNER 4 — Nuomos užbaigimas (booking-completion/[bookingId].tsx) */
    payout: (
      <Screen title={s.payout.title}
        bodyStyle={{ padding: "8px 16px 0", gap: 12 }}
        footer={<Foot><Btn tone="accent">{s.confirm}</Btn></Foot>}>
        <ItemCard thumb={48} thumbIcon={20}>
          <span style={{ fontSize: 12.5, color: "var(--nk-app-text)", fontFamily: "var(--nk-font-display)", fontWeight: 600 }}>{s.item}</span>
          <span style={{ fontSize: 10, color: "var(--nk-app-muted)" }}>{s.payout.meta}</span>
        </ItemCard>
        <div style={{ background: "var(--nk-app-success-tint)", border: "1px solid var(--nk-app-success-line)", borderRadius: 16, padding: 12, display: "flex", flexDirection: "column", gap: 9 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ width: 30, height: 30, borderRadius: 9, background: "rgba(16,185,129,.18)", display: "grid", placeItems: "center" }}>
              <Icon name="Coins" size={16} color="var(--nk-app-success-bright)" />
            </span>
            <span style={{ fontSize: 11, color: "var(--nk-app-success-ink)" }}>{s.payoutLabel}</span>
          </div>
          <span style={{ fontFamily: "var(--nk-font-display)", fontWeight: 700, fontSize: 22, color: "var(--nk-app-success-bright)" }}>{s.payout.amount}</span>
          <div className="htw-as-hair" style={{ background: "var(--nk-app-line)" }} />
          <Fee label={s.rentLabel} value={s.rentValue} />
          <Fee label={s.feeLabel} value={s.feeValue} muted />
        </div>
        <Label>{s.payout.rateLabel}</Label>
        <Stars size={24} filled={4} gap={8} padding="2px 0" />
      </Screen>
    ),
  };

  return screens[kind];
}

/* segmented pick-up / delivery control (reserve) */
const SEG: React.CSSProperties = {
  flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
  height: 34, borderRadius: 10, fontSize: 11.5,
  fontFamily: "var(--nk-font-display)", fontWeight: 600,
};

/* camera / gallery pair (renter handoff) */
const PHOTO_BTN: React.CSSProperties = {
  flex: 1, height: 38, borderRadius: 11, background: "var(--nk-app-soft)",
  border: "1px solid var(--nk-app-line)", display: "flex", alignItems: "center",
  justifyContent: "center", gap: 6, fontSize: 11, color: "var(--nk-app-text)",
  fontFamily: "var(--nk-font-display)", fontWeight: 600,
};
