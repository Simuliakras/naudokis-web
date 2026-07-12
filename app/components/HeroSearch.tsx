"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { LT_CITIES } from "@/app/lib/cities";
import { trackEvent } from "@/app/lib/analytics";
import { listingSearchHref } from "@/app/lib/search";
import {
  closeListbox,
  focusListboxSelection,
  Icon,
  listboxPanelKeyNav,
  listboxTriggerKeyNav,
  openRedirect,
} from "./ui";
import { useI18n } from "./I18nProvider";

/* Two-sided value prop: a muted owner prompt + a "list & earn" link under the
   hero search. Client leaf (openRedirect is a client action) so it can live
   inside the server-rendered Hero, like SearchBar. Reuses the already-authored
   hero.ownerPrompt/ownerCta keys and the list-flow bridge modal. */
export function HeroOwnerCta() {
  const { dict } = useI18n();
  // --nk-purple-bright (not -hover): the CTA sits on the translucent hero glass
  // over the purple-glow photo, where -hover's 4.8:1-on-flat-bg drops below AA.
  // min-height keeps a real coarse-pointer target on the sole owner entry point.
  return (
    <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: "var(--nk-gap-2xs) var(--nk-gap-sm)" }}>
      <span style={{ fontFamily: "var(--nk-font-body)", fontSize: 15.5, color: "var(--nk-text-muted)" }}>{dict.hero.ownerPrompt}</span>
      <Link href="/go" prefetch={false} className="nk-cats-all" onClick={(event) => {
        event.preventDefault();
        trackEvent("Owner Listing Intent", { placement: "hero" });
        openRedirect({ title: dict.bridge.listTitle, body: dict.bridge.listBody });
      }}
        style={{ background: "transparent", padding: "10px 0", minHeight: "var(--nk-tap)", fontWeight: 700, fontSize: 15.5, color: "var(--nk-purple-bright)", cursor: "pointer", gap: 6 }}>
        {dict.hero.ownerCta}
        <Icon name="ArrowRight" size={16} stroke={2.2} color="currentColor" />
      </Link>
    </div>
  );
}

function HeroCityPicker({ value, onChange }: { value: string; onChange: (city: string) => void }) {
  const { dict } = useI18n();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLSpanElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const listRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const onDoc = (e: MouseEvent) => {
      if (ref.current && e.target instanceof Node && !ref.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", onDoc);
    return () => {
      document.removeEventListener("mousedown", onDoc);
    };
  }, []);

  useEffect(() => {
    if (open) {
      focusListboxSelection(listRef.current);
    }
  }, [open]);

  const options = useMemo<[string, string][]>(
    () => [["", dict.cityPicker.all], ...LT_CITIES.map((c) => [c, c] as [string, string])],
    [dict.cityPicker.all],
  );

  return (
    <span
      ref={ref}
      className="nk-citypick nk-citypick--hero"
      onBlur={(e) => {
        if (open && e.relatedTarget instanceof Node && ref.current && !ref.current.contains(e.relatedTarget)) {
          setOpen(false);
        }
      }}
    >
      <button
        ref={triggerRef}
        type="button"
        className="nk-citypick__trigger"
        onClick={() => setOpen((v) => !v)}
        onKeyDown={listboxTriggerKeyNav(open, setOpen)}
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        <Icon name="MapPin" size={20} stroke={2} color="var(--nk-bg)" />
        <span className="nk-search__col" style={{ flex: 1 }}>
          <span className="nk-search__label">{dict.search.labelWhere}</span>
          <span className={"nk-citypick__val" + (value ? " is-set" : "")}>
            {value || dict.cityPicker.all}
          </span>
        </span>
        <Icon
          name="ChevronDown"
          size={16}
          stroke={2.2}
          color="var(--nk-light-meta)"
          style={{ transform: open ? "rotate(180deg)" : "none", transition: "transform .2s ease" }}
        />
      </button>
      {open && (
        <span
          ref={listRef}
          role="listbox"
          aria-label={dict.cityPicker.heading}
          onKeyDown={(e) => listboxPanelKeyNav(e, setOpen, triggerRef, ref)}
          className="nk-citypick__panel"
        >
          <span className="nk-citypick__heading">{dict.cityPicker.heading}</span>
          {options.map(([val, label]) => {
            const active = value === val;
            return (
              <button
                key={label}
                type="button"
                role="option"
                aria-selected={active}
                onClick={() => {
                  onChange(val);
                  closeListbox(setOpen, triggerRef, ref);
                }}
                className={"nk-citypick__opt" + (active ? " is-active" : "")}
              >
                <span className="nk-citypick__opt-l">
                  <Icon name="MapPin" size={17} stroke={2} color={active ? "var(--nk-purple-deep)" : "var(--nk-light-icon)"} />{" "}
                  {label}
                </span>
                {active && <Icon name="BadgeCheck" size={18} stroke={2} color="var(--nk-purple-deep)" />}
              </button>
            );
          })}
        </span>
      )}
    </span>
  );
}

export function SearchBar() {
  const { locale, dict } = useI18n();
  const router = useRouter();
  const [q, setQ] = useState("");
  const [city, setCity] = useState("");
  const go = (e: React.FormEvent) => {
    e.preventDefault();
    trackEvent("Hero Search Submit", {
      locale,
      hasQuery: Boolean(q.trim()),
      ...(city ? { city } : {}),
    });
    router.push(listingSearchHref({ q, city, locale }));
  };
  return (
    <form
      className="nk-search"
      action={listingSearchHref({ locale })}
      method="get"
      onSubmit={go}
      style={{
        position: "relative",
        display: "flex",
        alignItems: "center",
        gap: 8,
        background: "var(--nk-light-field)",
        border: "1px solid var(--nk-light-line)",
        borderRadius: 34,
        boxShadow: "var(--nk-shadow-2)",
        padding: "8px 8px 8px 24px",
        maxWidth: 662,
      }}
    >
      <span style={{ display: "flex", alignItems: "center", gap: 12, flex: 1 }}>
        <Icon name="Search" size={20} color="var(--nk-bg)" stroke={2} />
        <span className="nk-search__col" style={{ flex: 1 }}>
          <span className="nk-search__label">{dict.search.labelWhat}</span>
          <input
            name="q"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder={dict.search.placeholder}
            aria-label={dict.search.inputLabel}
            className="nk-search__input"
          />
        </span>
      </span>
      <span style={{ width: 1, height: 36, background: "var(--nk-light-line)" }} />
      <HeroCityPicker value={city} onChange={setCity} />
      {city && <input type="hidden" name="city" value={city} />}
      <button type="submit" className="nk-btn nk-btn--primary" style={{ padding: "16px 36px" }}>
        {dict.search.submit}
      </button>
    </form>
  );
}
