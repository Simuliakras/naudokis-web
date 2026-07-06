"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { LT_CITIES } from "@/app/lib/cities";
import { trackEvent } from "@/app/lib/analytics";
import { listingLandingHref, listingSearchHref } from "@/app/lib/search";
import { useCategories } from "@/app/lib/categories";
import {
  closeListbox,
  focusListboxSelection,
  Icon,
  listboxKeyNav,
  listboxTriggerKeyNav,
  openRedirect,
  SearchSuggest,
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
      <button type="button" onClick={() => openRedirect({ title: dict.bridge.listTitle, body: dict.bridge.listBody })}
        style={{ display: "inline-flex", alignItems: "center", gap: 6, background: "transparent", padding: "10px 0", minHeight: "var(--nk-tap)", fontFamily: "var(--nk-font-display)", fontWeight: 700, fontSize: 15.5, color: "var(--nk-purple-bright)", cursor: "pointer" }}>
        {dict.hero.ownerCta}
        <Icon name="ArrowRight" size={16} stroke={2.2} color="currentColor" />
      </button>
    </div>
  );
}

/* Owner-band secondary action: opens the list-your-item bridge modal. A separate
   client leaf so the server-rendered OwnerBand section can compose it. */
export function OwnerAppCta() {
  const { dict } = useI18n();
  return (
    <button type="button" className="nk-btn nk-btn--outline"
      title={dict.bridge.opensAppHint}
      onClick={() => openRedirect({ title: dict.bridge.listTitle, body: dict.bridge.listBody })}>
      <Icon name="Smartphone" size={17} stroke={2} color="var(--nk-text)" /> {dict.hero.ownerCta}
    </button>
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
    // Escape restores focus to the trigger (focus lives inside the open panel).
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeListbox(setOpen, triggerRef, ref);
    };
    document.addEventListener("mousedown", onDoc);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDoc);
      document.removeEventListener("keydown", onKey);
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
        aria-label={`${dict.search.labelWhere}: ${value || dict.cityPicker.all}`}
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
          onKeyDown={listboxKeyNav}
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
  // Focus-opened guided suggestions (real categories + picker cities) — on a
  // launch-size inventory a blind free-text search usually returns nothing.
  const [suggestOpen, setSuggestOpen] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);
  const cats = useCategories(locale).data ?? [];
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
      ref={formRef}
      className="nk-search"
      onSubmit={go}
      onBlur={(e) => {
        if (!(e.relatedTarget instanceof Node) || !formRef.current?.contains(e.relatedTarget)) {
          setSuggestOpen(false);
        }
      }}
      onKeyDown={(e) => {
        if (e.key === "Escape") { setSuggestOpen(false); return; }
        if (e.key === "ArrowDown" && suggestOpen) {
          e.preventDefault();
          formRef.current?.querySelector<HTMLElement>('[role="option"]')?.focus();
        }
      }}
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
            value={q}
            onChange={(e) => { setQ(e.target.value); setSuggestOpen(false); }}
            onFocus={() => { if (!q) setSuggestOpen(true); }}
            placeholder={dict.search.placeholder}
            aria-label={dict.search.inputLabel}
            className="nk-search__input"
          />
        </span>
      </span>
      <span style={{ width: 1, height: 36, background: "var(--nk-light-line)" }} />
      <HeroCityPicker value={city} onChange={setCity} />
      <button type="submit" className="nk-btn nk-btn--primary" style={{ padding: "16px 36px" }}>
        {dict.search.submit}
      </button>
      {suggestOpen && cats.length > 0 && (
        <SearchSuggest
          categories={cats}
          cities={LT_CITIES}
          headings={{ categories: dict.search.suggestCategories, cities: dict.search.suggestCities }}
          label={dict.search.suggestionsLabel}
          onCategory={(id) => { setSuggestOpen(false); router.push(listingLandingHref({ category: id, locale })); }}
          onCity={(c) => { setSuggestOpen(false); router.push(listingLandingHref({ city: c, locale })); }}
        />
      )}
    </form>
  );
}
