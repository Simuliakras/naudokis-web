"use client";

// Price-range filter — a dual-thumb slider wired to two EUR number inputs.
//
// The feed's other filters are single-value pills (FilterSelect); price is a range, so
// it gets the range treatment: a trigger pill that opens a desktop popover, and the SAME
// panel rendered inline inside the mobile filter sheet (no nested layer there).
//
// The pill, the popover layer and the dismissal contract are NOT here — they are
// RangePillControl (ui.tsx), shared with the feed's date filter so the two twins cannot
// drift. What this file owns is the panel: the slider/input mechanics below, draft-vs-
// committed state, and a mounted live region.
//
// Two rules shape every interaction here:
//   • Commit on interaction END, never mid-gesture — a drag writes the URL (and
//     refetches) once, on pointer-up; keyboard nudges coalesce; a typed field applies
//     on blur/Enter. Dragging a thumb across the feed must not fire a request per pixel.
//   • Never correct the user mid-type — while a field is being edited the thumbs hold
//     still; clamping/ordering happens only on commit, so "1" on the way to "150" is
//     left alone.
import { useEffect, useRef, useState, type PointerEvent as ReactPointerEvent } from "react";
import { useI18n } from "./I18nProvider";
import { RangePillControl } from "./ui";
import {
  PRICE_CEIL,
  PRICE_FLOOR,
  PRICE_PAGE_STEP,
  PRICE_STEP,
  clampValue,
  defaultRange,
  formatPriceValue,
  isDefaultRange,
  normalizeInputs,
  priceBandArgs,
  serializePriceParam,
  type PriceRange,
} from "@/app/lib/price-range";

const SPAN = PRICE_CEIL - PRICE_FLOOR;
const pct = (euros: number) => ((euros - PRICE_FLOOR) / SPAN) * 100;

type Thumb = "min" | "max";

/* ---------------- Core panel (shared by popover + sheet) ---------------- */
export function PriceRangePanel({
  value,
  onChange,
  variant,
  onDone,
  autoFocus = false,
}: {
  value: PriceRange | null; // committed range from the URL; null = no filter (fully open)
  onChange: (range: PriceRange) => void; // commit — the parent serializes it to the URL
  variant: "popover" | "inline";
  onDone?: () => void; // popover only: close the layer + restore focus to the trigger
  autoFocus?: boolean; // popover: move focus onto the min thumb when it opens
}) {
  const { locale, dict } = useI18n();
  const t = dict.feed;
  const trackRef = useRef<HTMLDivElement>(null);
  const minThumbRef = useRef<HTMLButtonElement>(null);
  const maxThumbRef = useRef<HTMLButtonElement>(null);
  const activeThumb = useRef<Thumb | null>(null);
  const commitTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  // The debounced commit, kept callable so unmount can run it early (see below).
  const flushCommit = useRef<(() => void) | null>(null);

  const committed = value ?? defaultRange();
  const committedToken = serializePriceParam(committed);

  // draftRef is the synchronous source of truth for gesture math (state lags a render
  // behind under key-repeat); draft state drives the paint.
  const [draft, setDraft] = useState<PriceRange>(committed);
  const draftRef = useRef<PriceRange>(committed);
  const [minText, setMinText] = useState(() => String(committed.min));
  const [maxText, setMaxText] = useState(() => String(committed.max));
  const [sync, setSync] = useState(committedToken);
  const [announce, setAnnounce] = useState("");

  // Re-sync to an EXTERNAL change (back/forward, reset, a sibling filter). Our own
  // commits echo back with a matching token, so those don't reset the draft mid-edit.
  // Adjust-state-during-render, the pattern FeedScreen's search input uses.
  if (committedToken !== sync) {
    setSync(committedToken);
    setDraft(committed);
    setMinText(String(committed.min));
    setMaxText(String(committed.max));
  }

  // The gesture ref mirrors the committed value; kept in step here (an effect, never
  // during render) so a nav/reset that lands mid-session doesn't leave it stale. During
  // a drag the token is unchanged, so this doesn't fire — applyThumb owns the ref then.
  useEffect(() => {
    draftRef.current = value ?? defaultRange();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [committedToken]);

  // Popover open: start the keyboard user on the min thumb. Mount-only — `autoFocus` is
  // fixed for a given mount, and the panel remounts on every open.
  useEffect(() => {
    if (autoFocus) {
      minThumbRef.current?.focus();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Closing inside the debounce window must not swallow the nudge. Escape CLOSES the
  // panel; it is not a cancel — wait 321ms and the same Escape keeps the change, so
  // dropping it here would make the outcome depend on reaction time. Flush, never clear.
  useEffect(() => () => flushCommit.current?.(), []);

  const clearPending = () => {
    if (commitTimer.current) {
      clearTimeout(commitTimer.current);
      commitTimer.current = null;
    }
    flushCommit.current = null;
  };
  const commit = (range: PriceRange) => {
    clearPending();
    // Skip a no-op: setParams pushes history, so re-committing the same range would
    // spam the back stack and refetch for nothing.
    if (serializePriceParam(range) === committedToken) {
      return;
    }
    setAnnounce(isDefaultRange(range) ? t.priceAny : t.priceBand(...priceBandArgs(range)));
    onChange(range);
  };
  const commitDebounced = (range: PriceRange) => {
    if (commitTimer.current) {
      clearTimeout(commitTimer.current);
    }
    // The "end" of a keyboard drag is the pause after the last key. Holding the pending
    // commit as a thunk is what lets unmount flush it instead of losing it.
    flushCommit.current = () => commit(range);
    commitTimer.current = setTimeout(() => commit(range), 320);
  };

  // Move one thumb, clamped against the other so the two can meet but never cross.
  const applyThumb = (thumb: Thumb, euros: number): PriceRange => {
    const v = clampValue(euros);
    const prev = draftRef.current;
    const next: PriceRange = thumb === "min"
      ? { min: Math.min(v, prev.max), max: prev.max }
      : { min: prev.min, max: Math.max(v, prev.min) };
    draftRef.current = next;
    setDraft(next);
    setMinText(String(next.min));
    setMaxText(String(next.max));
    return next;
  };

  const valueFromClientX = (clientX: number): number => {
    const el = trackRef.current;
    if (!el) {
      return draftRef.current.min;
    }
    const rect = el.getBoundingClientRect();
    const ratio = rect.width > 0 ? (clientX - rect.left) / rect.width : 0;
    return PRICE_FLOOR + ratio * SPAN;
  };

  const endDrag = (e: ReactPointerEvent<HTMLElement>) => {
    if (!activeThumb.current) {
      return;
    }
    const el = e.currentTarget;
    if (el.hasPointerCapture(e.pointerId)) {
      el.releasePointerCapture(e.pointerId);
    }
    activeThumb.current = null;
    commit(draftRef.current); // interaction end → write the URL once
  };

  const onThumbPointerDown = (thumb: Thumb) => (e: ReactPointerEvent<HTMLButtonElement>) => {
    if (e.button !== 0) {
      return;
    }
    e.stopPropagation(); // don't let the track's nearest-thumb picker also fire
    activeThumb.current = thumb;
    e.currentTarget.setPointerCapture(e.pointerId);
  };
  const onThumbPointerMove = (thumb: Thumb) => (e: ReactPointerEvent<HTMLButtonElement>) => {
    if (activeThumb.current !== thumb) {
      return;
    }
    applyThumb(thumb, valueFromClientX(e.clientX));
  };

  // A press on the rail itself grabs the nearer thumb and drags it from there.
  const onTrackPointerDown = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (e.button !== 0) {
      return;
    }
    const euros = clampValue(valueFromClientX(e.clientX));
    const prev = draftRef.current;
    const thumb: Thumb = euros - prev.min <= prev.max - euros ? "min" : "max";
    activeThumb.current = thumb;
    e.currentTarget.setPointerCapture(e.pointerId);
    applyThumb(thumb, euros);
    (thumb === "min" ? minThumbRef : maxThumbRef).current?.focus();
  };
  const onTrackPointerMove = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (!activeThumb.current) {
      return;
    }
    applyThumb(activeThumb.current, valueFromClientX(e.clientX));
  };

  const onThumbKeyDown = (thumb: Thumb) => (e: React.KeyboardEvent) => {
    const cur = thumb === "min" ? draftRef.current.min : draftRef.current.max;
    let target: number;
    switch (e.key) {
      case "ArrowLeft":
      case "ArrowDown": target = cur - PRICE_STEP; break;
      case "ArrowRight":
      case "ArrowUp": target = cur + PRICE_STEP; break;
      case "PageDown": target = cur - PRICE_PAGE_STEP; break;
      case "PageUp": target = cur + PRICE_PAGE_STEP; break;
      // Home/End go to this thumb's OWN reachable bound (the other thumb, or the rail end).
      case "Home": target = thumb === "min" ? PRICE_FLOOR : draftRef.current.min; break;
      case "End": target = thumb === "min" ? draftRef.current.max : PRICE_CEIL; break;
      default: return;
    }
    e.preventDefault();
    const next = applyThumb(thumb, target);
    commitDebounced(next);
  };

  // Both fields → clamped, ordered range. Reads BOTH texts so editing either (or both,
  // then tabbing out) resolves correctly; crossed values swap rather than drop.
  const commitInputs = () => {
    const range = normalizeInputs(minText, maxText);
    draftRef.current = range;
    setDraft(range);
    setMinText(String(range.min));
    setMaxText(String(range.max));
    commit(range);
  };

  const clearAll = () => {
    const range = defaultRange();
    draftRef.current = range;
    setDraft(range);
    setMinText(String(range.min));
    setMaxText(String(range.max));
    commit(range);
    minThumbRef.current?.focus();
  };

  const euroFirst = locale !== "lt"; // EN "€10" vs LT "10 €"
  const isSet = !isDefaultRange(draft);

  const thumb = (which: Thumb) => {
    const isMin = which === "min";
    const val = isMin ? draft.min : draft.max;
    const open = !isMin && draft.max >= PRICE_CEIL;
    return (
      <button
        ref={isMin ? minThumbRef : maxThumbRef}
        type="button"
        role="slider"
        className="nk-price-thumb"
        aria-orientation="horizontal"
        aria-label={isMin ? t.priceMinAria : t.priceMaxAria}
        aria-valuemin={isMin ? PRICE_FLOOR : draft.min}
        aria-valuemax={isMin ? draft.max : PRICE_CEIL}
        aria-valuenow={val}
        aria-valuetext={formatPriceValue(val, locale, open)}
        style={{ left: `${pct(val)}%` }}
        onPointerDown={onThumbPointerDown(which)}
        onPointerMove={onThumbPointerMove(which)}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
        onKeyDown={onThumbKeyDown(which)}
      />
    );
  };

  const field = (which: Thumb) => {
    const isMin = which === "min";
    const affix = <span className="nk-price-input__affix" aria-hidden="true">€</span>;
    return (
      <span className="nk-price-input">
        {euroFirst && affix}
        <input
          type="text"
          inputMode="numeric"
          value={isMin ? minText : maxText}
          aria-label={isMin ? t.priceMinAria : t.priceMaxAria}
          onChange={(e) => (isMin ? setMinText : setMaxText)(e.target.value)}
          onBlur={commitInputs}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              commitInputs();
            }
          }}
        />
        {!euroFirst && affix}
      </span>
    );
  };

  return (
    // The popover's role="dialog" already names this panel, so the group is INLINE-only:
    // in the filter sheet there is no dialog and the sheet's visual label is associated
    // with nothing, but naming it in both places would announce the name twice.
    <div className={"nk-price-panel" + (variant === "inline" ? " is-inline" : "")}
      role={variant === "inline" ? "group" : undefined}
      aria-label={variant === "inline" ? t.priceRangeAria : undefined}>
      {/* live read-out of the current range — visible feedback while dragging/typing */}
      <div className="nk-price-panel__head" aria-hidden="true">
        <span className="nk-price-panel__val">{formatPriceValue(draft.min, locale)}</span>
        <span className="nk-price-panel__dash">–</span>
        <span className="nk-price-panel__val">{formatPriceValue(draft.max, locale, draft.max >= PRICE_CEIL)}</span>
      </div>

      <div className="nk-price-slider">
        <div ref={trackRef} className="nk-price-track"
          onPointerDown={onTrackPointerDown}
          onPointerMove={onTrackPointerMove}
          onPointerUp={endDrag}
          onPointerCancel={endDrag}>
          <span className="nk-price-fill"
            style={{ left: `${pct(draft.min)}%`, right: `${100 - pct(draft.max)}%` }} />
          {thumb("min")}
          {thumb("max")}
        </div>
      </div>

      <div className="nk-price-inputs">
        {field("min")}
        <span className="nk-price-sep" aria-hidden="true">–</span>
        {field("max")}
      </div>

      {variant === "popover" && (
        <div className="nk-price-foot">
          {isSet && (
            <button type="button" className="nk-btn nk-btn--ghost" onClick={clearAll}>{t.clear}</button>
          )}
          <button type="button" className="nk-btn nk-btn--primary" onClick={() => { commit(draftRef.current); onDone?.(); }}>
            {t.priceDone}
          </button>
        </div>
      )}

      {/* Mounted empty, filled on commit — a live region populated on mount is not announced. */}
      <span role="status" aria-live="polite" className="nk-sr-only">{announce}</span>
    </div>
  );
}

/* ---------------- Desktop trigger + popover ---------------- */
// The pill, the popover layer and the dismissal contract are RangePillControl's (shared
// with the feed's date filter); all that is price-specific is the label and the panel.
export function PriceRangeControl({
  value,
  onChange,
}: {
  value: PriceRange | null;
  onChange: (range: PriceRange) => void;
}) {
  const { dict } = useI18n();
  const t = dict.feed;

  const range = value ?? defaultRange();
  // `null` IS the whole "off" state here: parsePriceParam normalizes a fully-open token
  // back to null, so a non-null value always narrows something.
  const active = value !== null;
  const [minArg, maxArg] = priceBandArgs(range);
  const label = active ? t.priceBand(minArg, maxArg) : t.priceAny;

  return (
    <RangePillControl
      icon="Tag"
      label={label}
      active={active}
      triggerAriaLabel={active ? `${t.priceLabel}: ${label}` : t.priceLabel}
      panelAriaLabel={t.priceRangeAria}
      fieldClassName="nk-price-field"
      popClassName="nk-price-pop"
      renderPanel={(onDone) => (
        <PriceRangePanel value={value} onChange={onChange} variant="popover" onDone={onDone} autoFocus />
      )}
    />
  );
}
