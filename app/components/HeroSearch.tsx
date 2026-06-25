"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { LT_CITIES } from "@/app/lib/cities";
import { listingSearchHref } from "@/app/lib/search";
import {
  focusListboxSelection,
  Icon,
  listboxKeyNav,
  listboxTriggerKeyNav,
} from "./ui";
import { useI18n } from "./I18nProvider";

function HeroCityPicker({ value, onChange }: { value: string; onChange: (city: string) => void }) {
  const { dict } = useI18n();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLSpanElement>(null);
  const listRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const onDoc = (e: MouseEvent) => {
      if (ref.current && e.target instanceof Node && !ref.current.contains(e.target)) {
        setOpen(false);
      }
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
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
    <span ref={ref} className="nk-citypick nk-citypick--hero">
      <button
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
                  setOpen(false);
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
  const { dict } = useI18n();
  const router = useRouter();
  const [q, setQ] = useState("");
  const [city, setCity] = useState("");
  const go = (e: React.FormEvent) => {
    e.preventDefault();
    router.push(listingSearchHref({ q, city }));
  };
  return (
    <form
      id="nk-hero-search"
      className="nk-search"
      onSubmit={go}
      style={{
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
            onChange={(e) => setQ(e.target.value)}
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
    </form>
  );
}

