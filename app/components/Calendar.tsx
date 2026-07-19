"use client";

// The shared month-grid engine behind BOTH date controls on the site: the rental
// booking picker (DateRangePicker.tsx, per-listing availability) and the feed's
// date-range filter (DateRangeFilter.tsx, no listing, no availability). The subtle,
// bug-costly parts live here once — keyboard navigation BY DATE, roving-tabindex focus
// restoration, the single hover+keyboard range preview, one-day ranges, straddle
// prevention — so the two callers can never drift apart.
//
// It reads NO dictionary: every string arrives through the injected `copy` object, so a
// caller supplies its own namespace (dict.detail vs dict.feed). The availability layer
// is OPTIONAL: pass an `availability`/`notice` and the grid marks booked days, refuses
// to straddle them, and shows the caller's unknown-availability banner; omit them (the
// feed) and it degrades to a pure date-window picker — no booked cells, no legend, no
// straddle logic — by construction.
import { useCallback, useEffect, useId, useMemo, useRef, useState } from "react";
import { useI18n } from "./I18nProvider";
import { Icon } from "./ui";
import { type Availability } from "@/app/lib/availability";
import { useMediaQuery } from "@/app/lib/use-media-query";
import {
  addDays, addMonths, clampDate, dayOfMonth, formatFullDate, formatMonthHeading, formatShortDate,
  monthWeeks, rentalDays, startOfMonth, startOfWeek, endOfWeek, weekdayNames, type IsoDate,
} from "@/app/lib/dates";

export type DateRange = { start: IsoDate; end: IsoDate };

// The duo spread's collapse threshold — must mirror the 759px max-width rule in
// globals.css that hides .nk-cal-duo__month--b.
const DUO_MEDIA = "(min-width: 760px)";

// Why a day cannot be picked. Ordered by how much it tells the user: `booked` is tested
// before the length rules, so a taken day inside the minimum window announces the useful
// fact rather than "too short". The feed only ever produces `past`/`tooLong`.
export type CalendarBlockedReason = "past" | "booked" | "tooShort" | "tooLong" | "spansBooked";

// Every string the grid renders. A caller builds this from its own dictionary namespace
// (both callers are client components, so passing functions here crosses no
// server→client boundary). The three optional fields are only ever shown by a caller
// that opts into them — `booked`/`loading` need an `availability`, `apply` needs a
// sheet (showApply) — so a pure date-window caller (the feed) simply omits them.
export type CalendarCopy = {
  prevMonth: string;
  nextMonth: string;
  today: string; // aria suffix on today's cell
  selectStart: string;
  selectEnd: string;
  limits: (min: number, max: number) => string; // hint under the grid once a start is picked
  days: (n: number) => string;
  startSelected: (date: string) => string; // live-region
  rangeSelected: (parts: { start: string; end: string; days: string }) => string;
  blocked: (reason: CalendarBlockedReason, n: number) => string;
  clear: string;
  booked?: string; // legend + disabled-cell suffix (availability callers only)
  apply?: string; // the sheet's Apply button (showApply callers only)
  loading?: string; // live-region while availability is fetching
  // The duo layout's live header + actions bar. Only a `variant="duo"` caller (the
  // booking picker) supplies these; the single layout never renders them.
  popTitle?: string; // header state line while nothing is picked
  popSubIdle?: string; // idle readout: rental limits + cheapest-tier teaser
  popSubStart?: (start: string) => string; // start picked, no end hovered yet
  popSubRange?: (parts: { start: string; end: string; percent: number | null }) => string;
  clearAll?: string; // the actions bar's text-link clear
  done?: string; // the actions bar's explicit close
};

export type CalendarPanelProps = {
  value: DateRange | null;
  onChange: (range: DateRange | null) => void;
  today: IsoDate;
  minDays: number;
  maxDays: number; // 0 = no ceiling on the wire
  copy: CalendarCopy;
  // Availability is OPTIONAL. Absent → no booked cells, no legend, no straddle, no
  // notice, no loading state: a pure date-window picker.
  availability?: Availability;
  isLoading?: boolean;
  // The caller's unknown-availability banner (booking only). Rendered above the grid;
  // its copy + retry stay in the caller's namespace, so this file carries none.
  notice?: React.ReactNode;
  onClose: () => void;
  commitCloses: boolean;
  // Whether to render the panel's own Apply button. Defaults to `!commitCloses` (a
  // committing popover needs none; a sheet does). The feed's inline variant passes
  // false — the filter sheet owns the Apply/close button.
  showApply?: boolean;
  // Move focus onto the roving day cell on mount, so a keyboard user who opened a
  // popover via ArrowDown lands in the grid (mirrors the price slider's autofocus).
  autoFocus?: boolean;
  // "single" (default) is the feed filter's one-month layout: nav-in-head, hint row,
  // full-width foot buttons. "duo" is the booking card's two-month spread: a live
  // pophead, one arrow pair over both months, and the legend+clear+done actions bar.
  // Below 760px CSS collapses the duo to month A alone — the markup never changes.
  variant?: "single" | "duo";
  // Booking only: the discount a rental of N days earns (null = none), feeding the
  // pophead's live readout. A callback, not a tier list — the engine stays ignorant
  // of listing pricing shapes.
  discountPercent?: (days: number) => number | null;
};

/* ---------------- The calendar ---------------- */
export function CalendarPanel({
  value, onChange, availability, isLoading = false, today, minDays, maxDays,
  copy, notice, onClose, commitCloses, showApply, autoFocus = false,
  variant = "single", discountPercent,
}: CalendarPanelProps) {
  const { locale } = useI18n();
  const duo = variant === "duo";
  // The roving-focus root: the single layout's <table>, or the duo wrapper holding
  // both month tables — whichever is mounted claims the one ref.
  const gridRef = useRef<HTMLElement | null>(null);
  const setGridRef = useCallback((element: HTMLElement | null) => {
    gridRef.current = element;
  }, []);
  const captionId = useId();
  const showApplyBtn = showApply ?? !commitCloses;

  // The draft is what the grid is painting; `value` is what the panel has committed.
  const [draft, setDraft] = useState<{ start: IsoDate | null; end: IsoDate | null }>(
    () => ({ start: value?.start ?? null, end: value?.end ?? null }),
  );
  const [hover, setHover] = useState<IsoDate | null>(null);
  const [focusDate, setFocusDate] = useState<IsoDate>(value?.start ?? today);
  const [monthAnchor, setMonthAnchor] = useState<IsoDate>(startOfMonth(value?.start ?? today));
  const [message, setMessage] = useState("");

  // Re-sync the draft to an EXTERNAL change of the committed value (URL back/forward, a
  // global reset, a chip clear). This matters for the feed's inline variant, which stays
  // mounted across those; the popover variant remounts on open, so for it this is inert
  // (the token already matches). Our own commits echo back a matching token, so a
  // mid-pick draft is never clobbered. Adjust-state-during-render, as PriceRangePanel.
  const committedToken = value ? `${value.start}..${value.end}` : "";
  const [sync, setSync] = useState(committedToken);
  if (committedToken !== sync) {
    setSync(committedToken);
    setDraft({ start: value?.start ?? null, end: value?.end ?? null });
  }

  // Derived, never stored: storing a phase means it can disagree with the draft.
  const phase: "start" | "end" = draft.start && !draft.end ? "end" : "start";

  const horizonEnd = availability?.status === "known" ? availability.windowEnd : addDays(today, 180);
  const unavailable = useMemo(
    () => new Set(availability?.status === "known" ? availability.unavailableDates : []),
    [availability],
  );

  // The first taken day strictly after the chosen start. This single value is the whole
  // no-straddle answer: once a start is picked, every day at or after it is disabled, so
  // a range spanning a booked Saturday cannot be constructed at all — it is not rejected
  // after the fact, it is unreachable. Always null when there is no availability.
  const firstBlocked = useMemo(() => {
    if (!draft.start || phase !== "end") {
      return null;
    }
    const limit = maxDays > 0 ? maxDays : 366;
    for (let index = 1; index <= limit; index++) {
      const iso = addDays(draft.start, index);
      if (iso > horizonEnd) {
        break;
      }
      if (unavailable.has(iso)) {
        return iso;
      }
    }
    return null;
  }, [draft.start, phase, maxDays, horizonEnd, unavailable]);

  const blockedReason = (iso: IsoDate): CalendarBlockedReason | null => {
    if (iso < today) {
      return "past";
    }
    if (unavailable.has(iso)) {
      return "booked";
    }
    // Picking (or re-picking) a start — only past/booked can block it.
    //
    // `<=`, not `<`: the chosen start must not judge itself. Measured as a range it is
    // one day long, so on a listing with minDays > 1 it would report "too short" and
    // render greyed-out — the selected day looking disabled. Clicking it is either a
    // restart or (where the listing allows a single day) the whole rental; selectDay
    // decides which, and neither is an error.
    if (phase === "start" || !draft.start || iso <= draft.start) {
      return null;
    }
    const days = rentalDays(draft.start, iso);
    if (days < minDays) {
      return "tooShort";
    }
    if (maxDays > 0 && days > maxDays) {
      return "tooLong";
    }
    if (firstBlocked !== null && iso >= firstBlocked) {
      return "spansBooked";
    }
    return null;
  };

  const blockedAmount = (reason: CalendarBlockedReason) => (reason === "tooLong" ? maxDays : minDays);

  const selectDay = (iso: IsoDate) => {
    const reason = blockedReason(iso);
    if (reason) {
      // No state change — just tell the user why. Disabled cells stay focusable (they
      // must, in a grid), so a keyboard user can land on one and press Enter.
      setMessage(copy.blocked(reason, blockedAmount(reason)));
      return;
    }
    const { start } = draft;
    // Can this click END the range?
    //
    // The `iso === start && minDays <= 1` arm is not an edge case — it is the commonest
    // booking there is. `minimum_rental_days` is 1 on most listings, and without this a
    // one-day rental could not be expressed at all: re-clicking the start was treated as
    // a restart, so the range could only ever be two days or more. Where the listing
    // really does demand a longer rental, the same click restarts, which is the sane
    // reading of "I picked the wrong day".
    const endsHere = phase === "end" && start !== null
      && (iso > start || (iso === start && minDays <= 1));
    if (!endsHere || start === null) {
      // A click before the current start (or on it, when a single day is not allowed)
      // is a restart, not an error.
      setDraft({ start: iso, end: null });
      setMessage(copy.startSelected(formatFullDate(iso, locale)));
      return;
    }
    const range = { start, end: iso };
    setDraft(range);
    onChange(range);
    setMessage(copy.rangeSelected({
      start: formatFullDate(range.start, locale),
      end: formatFullDate(range.end, locale),
      days: copy.days(rentalDays(range.start, range.end)),
    }));
    if (commitCloses) {
      onClose();
    }
  };

  const clear = () => {
    setDraft({ start: null, end: null });
    setHover(null);
    onChange(null);
    setMessage("");
    // Clear disables ITSELF once there is nothing left to clear, and a disabled element
    // hands focus back to <body> — stranding a keyboard user outside the panel, where
    // Escape no longer reaches either the popover or the trigger. Move into the grid
    // first: state flushes after this handler, so by the time `disabled` flips the button
    // is no longer the active element. The price twin does the same with its min thumb.
    focusRovingCell();
  };

  // How many month grids are actually VISIBLE right now. The duo spread collapses to
  // month A alone below 760px by CSS — the markup never changes — so keyboard paging
  // and the next-arrow cap must ask the viewport, not the variant. Reactive, not an
  // event-time read: the arrow's disabled state renders from it, and a resize while
  // open must re-enable paging into months a hidden month B was covering.
  const twoUp = useMediaQuery(DUO_MEDIA);
  const monthsShown = duo && twoUp ? 2 : 1;

  // Navigation is by DATE, not by DOM position — which is why rovingKeyNav can't be
  // reused. Arrowing off the edge of a month must land on a real day in the NEXT month,
  // an element that does not exist yet; so the handler moves a date, React re-renders
  // (possibly paging the month), and the focus effect below re-attaches.
  const go = (target: IsoDate) => {
    const next = clampDate(target, today, horizonEnd);
    setFocusDate(next);
    const month = startOfMonth(next);
    const lastVisible = addMonths(monthAnchor, monthsShown - 1);
    if (month < monthAnchor) {
      setMonthAnchor(month);
      return;
    }
    if (month > lastVisible) {
      // The smallest forward shift that brings the date into view: arrowing off
      // month B's end slides the duo spread by one month, never two.
      setMonthAnchor(addMonths(month, 1 - monthsShown));
    }
  };

  const onGridKeyDown = (event: React.KeyboardEvent) => {
    const step = (days: number) => go(addDays(focusDate, days));
    switch (event.key) {
      case "ArrowLeft": step(-1); break;
      case "ArrowRight": step(1); break;
      case "ArrowUp": step(-7); break;
      case "ArrowDown": step(7); break;
      case "Home": go(startOfWeek(focusDate)); break;
      case "End": go(endOfWeek(focusDate)); break;
      case "PageUp": go(addMonths(focusDate, event.shiftKey ? -12 : -1)); break;
      case "PageDown": go(addMonths(focusDate, event.shiftKey ? 12 : 1)); break;
      case "Enter":
      case " ": selectDay(focusDate); break;
      default: return; // Tab and Escape belong to the layer, not the grid
    }
    event.preventDefault();
  };

  // The grid's single tab stop: whichever day currently carries tabIndex={0}.
  const focusRovingCell = useCallback(() => {
    gridRef.current?.querySelector<HTMLElement>('[tabindex="0"]')?.focus();
  }, []);

  // Re-attach focus to the roving cell after a date move — but only when focus is
  // already ON A DAY CELL, so opening the panel or clicking elsewhere never yanks it.
  // The role check matters in the duo, whose nav buttons live inside the grid wrapper:
  // mere containment would steal focus from a just-clicked arrow.
  useEffect(() => {
    const grid = gridRef.current;
    const active = document.activeElement;
    if (!grid || !(active instanceof HTMLElement) || !grid.contains(active)
      || active.getAttribute("role") !== "gridcell") {
      return;
    }
    focusRovingCell();
  }, [focusDate, monthAnchor, focusRovingCell]);

  // Popover open (autoFocus): drop focus onto the roving cell so a keyboard user who
  // opened via ArrowDown is already in the grid. Mount-only, hence the empty deps.
  useEffect(() => {
    if (autoFocus) {
      focusRovingCell();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Hover and keyboard focus feed the SAME preview variable — which is the one change
  // that makes keyboard parity real rather than nominal: the range grows under the arrow
  // keys exactly as it does under the pointer. Touch never sets hover, so no preview
  // paints there, which is correct.
  const previewEnd = phase === "end" ? (hover ?? focusDate) : null;
  const showPreview =
    previewEnd !== null && draft.start !== null
    && previewEnd > draft.start && blockedReason(previewEnd) === null;

  // Which wash the grid is painting, if any. The two are mutually exclusive by
  // construction: `is-inrange` needs both ends, and a preview only exists while the end
  // is still missing.
  const trail = draft.start && draft.end ? "has-range" : showPreview ? "has-preview" : "";

  const weeks = useMemo(() => monthWeeks(monthAnchor), [monthAnchor]);
  // Month B of the duo spread is always anchor+1 — one arrow pair steps the anchor by
  // exactly one month, so "next" turns month B into month A.
  const monthB = addMonths(monthAnchor, 1);
  const weeksB = useMemo(() => (duo ? monthWeeks(monthB) : null), [duo, monthB]);
  const weekdays = useMemo(() => weekdayNames(locale), [locale]);
  const atFirstMonth = monthAnchor <= startOfMonth(today);
  // "Next" caps on the last VISIBLE month — month B on the wide duo, the anchor
  // itself when the spread is collapsed (or single) — so the spread never pages
  // entirely past the booking horizon AND the horizon month itself stays reachable.
  // Capping on a hidden month B stranded the final weeks of the window on phones.
  const atLastMonth = addMonths(monthAnchor, monthsShown - 1) >= startOfMonth(horizonEnd);

  const cellClass = (iso: IsoDate, reason: CalendarBlockedReason | null) => {
    const { start, end } = draft;
    const classes = ["nk-cal__day"];
    if (iso === today) {
      classes.push("is-today");
    }
    if (iso === start) {
      classes.push("is-start");
    }
    if (iso === end) {
      classes.push("is-end");
    }
    if (start && end && iso > start && iso < end) {
      classes.push("is-inrange");
    }
    if (showPreview && previewEnd && start && iso > start && iso <= previewEnd) {
      classes.push(iso === previewEnd ? "is-preview-end" : "is-preview");
    }
    if (reason) {
      classes.push(reason === "booked" ? "is-booked" : "is-disabled");
    }
    return classes.join(" ");
  };

  const cellLabel = (iso: IsoDate, reason: CalendarBlockedReason | null) => {
    const parts = [formatFullDate(iso, locale)];
    if (iso === today) {
      parts.push(copy.today);
    }
    if (reason) {
      parts.push(copy.blocked(reason, blockedAmount(reason)));
    }
    return parts.join(", ");
  };

  // The duo pophead: a bold state line plus a readout that tracks the committed range
  // or, failing that, the live hover/keyboard preview. Committed wins — once both ends
  // are down the preview is gone by construction (phase is back to "start").
  const previewRange = showPreview && draft.start && previewEnd
    ? { start: draft.start, end: previewEnd }
    : null;
  const headRange = draft.start && draft.end ? { start: draft.start, end: draft.end } : previewRange;
  let headTitle = copy.popTitle ?? "";
  let headSub = copy.popSubIdle ?? "";
  if (headRange) {
    const days = rentalDays(headRange.start, headRange.end);
    headTitle = copy.days(days);
    headSub = copy.popSubRange?.({
      start: formatShortDate(headRange.start, locale),
      end: formatShortDate(headRange.end, locale),
      percent: discountPercent?.(days) ?? null,
    }) ?? "";
  } else if (draft.start) {
    headTitle = copy.selectEnd;
    headSub = copy.popSubStart?.(formatShortDate(draft.start, locale)) ?? "";
  }

  /* The trail class tells the CSS whether there is a wash to draw between the two
     end-caps, and which one — a committed range or the lighter hover/arrow preview.
     The start cell's half-wash is gated on it: a start with nothing yet on its right
     has nothing to connect to, and a bar leaking out of it would be a promise the
     calendar has not made. Both duo tables carry it, so a range straddling the fold
     paints one continuous wash across the two grids. */
  const gridClass = ["nk-cal__grid", isLoading && "is-loading", trail].filter(Boolean).join(" ");

  const weekdayHead = (
    <thead>
      <tr>
        {weekdays.map((day) => (
          <th key={day.long} scope="col" className="nk-cal__wd">
            <span aria-hidden="true">{day.short}</span>
            <span className="nk-sr-only">{day.long}</span>
          </th>
        ))}
      </tr>
    </thead>
  );

  const renderWeeks = (rows: (IsoDate | null)[][]) =>
    rows.map((week, index) => (
      <tr key={index}>
        {week.map((iso, dayIndex) => {
          if (iso === null) {
            return <td key={dayIndex} className="nk-cal__pad" />;
          }
          const reason = blockedReason(iso);
          return (
            // aria-disabled, never `disabled`: a grid cell must stay reachable by
            // the arrow keys even when it can't be chosen, or navigation would
            // have holes punched through it.
            <td key={dayIndex} role="gridcell" tabIndex={iso === focusDate ? 0 : -1}
              className={cellClass(iso, reason)}
              aria-selected={iso === draft.start || iso === draft.end}
              aria-disabled={reason !== null || undefined}
              aria-current={iso === today ? "date" : undefined}
              aria-label={cellLabel(iso, reason)}
              onClick={() => selectDay(iso)}
              // Entering a blocked cell CLEARS the preview rather than freezing it —
              // the wash must never promise a range the click would refuse.
              onMouseEnter={() => setHover(reason === null ? iso : null)}
              onFocus={() => setFocusDate(iso)}>
              <span aria-hidden="true">{dayOfMonth(iso)}</span>
            </td>
          );
        })}
      </tr>
    ));

  const legend = availability?.status === "known" && unavailable.size > 0 && (
    <span className="nk-cal__legend"><span className="nk-cal__swatch" aria-hidden="true" />{copy.booked}</span>
  );

  return (
    <div className="nk-cal-panel">
      {duo && (
        // Visual readout only — NOT a live region: it re-renders on every hover
        // while an end is being picked, and the sr-only region below already
        // narrates start picks and committed ranges exactly once.
        <div className="nk-cal-pophead">
          <span className="nk-cal-pophead__title">{headTitle}</span>
          <span className="nk-cal-pophead__sub">{headSub}</span>
        </div>
      )}
      {notice}

      {!duo && (
        <div className="nk-cal__head">
          <button type="button" className="nk-cal__nav" onClick={() => setMonthAnchor(addMonths(monthAnchor, -1))}
            disabled={atFirstMonth} aria-label={copy.prevMonth}>
            <Icon name="ChevronLeft" size={18} color="var(--nk-text)" />
          </button>
          <span className="nk-cal__title">{formatMonthHeading(monthAnchor, locale)}</span>
          <button type="button" className="nk-cal__nav" onClick={() => setMonthAnchor(addMonths(monthAnchor, 1))}
            disabled={atLastMonth} aria-label={copy.nextMonth}>
            <Icon name="ChevronRight" size={18} color="var(--nk-text)" />
          </button>
        </div>
      )}

      {!duo && (
        <table ref={setGridRef} role="grid" className={gridClass}
          aria-labelledby={captionId} aria-busy={isLoading || undefined}
          onKeyDown={onGridKeyDown} onMouseLeave={() => setHover(null)}>
          <caption id={captionId} className="nk-sr-only">{formatMonthHeading(monthAnchor, locale)}</caption>
          {weekdayHead}
          <tbody>{renderWeeks(weeks)}</tbody>
        </table>
      )}

      {duo && weeksB && (
        // One arrow pair, absolutely placed at the spread's top corners, steps BOTH
        // months. Leaving the whole spread drops the hover preview.
        <div ref={setGridRef} className="nk-cal-duo" onMouseLeave={() => setHover(null)}>
          <button type="button" className="nk-cal__nav nk-cal-duo__nav is-prev"
            onClick={() => setMonthAnchor(addMonths(monthAnchor, -1))}
            disabled={atFirstMonth} aria-label={copy.prevMonth}>
            <Icon name="ChevronLeft" size={18} color="var(--nk-text)" />
          </button>
          <button type="button" className="nk-cal__nav nk-cal-duo__nav is-next"
            onClick={() => setMonthAnchor(addMonths(monthAnchor, 1))}
            disabled={atLastMonth} aria-label={copy.nextMonth}>
            <Icon name="ChevronRight" size={18} color="var(--nk-text)" />
          </button>
          <div className="nk-cal-duo__month">
            <span className="nk-cal__mtitle" id={`${captionId}-a`}>{formatMonthHeading(monthAnchor, locale)}</span>
            <table role="grid" className={gridClass} aria-labelledby={`${captionId}-a`}
              aria-busy={isLoading || undefined} onKeyDown={onGridKeyDown}>
              {weekdayHead}
              <tbody>{renderWeeks(weeks)}</tbody>
            </table>
          </div>
          <div className="nk-cal-duo__month nk-cal-duo__month--b">
            <span className="nk-cal__mtitle" id={`${captionId}-b`}>{formatMonthHeading(monthB, locale)}</span>
            <table role="grid" className={gridClass} aria-labelledby={`${captionId}-b`}
              aria-busy={isLoading || undefined} onKeyDown={onGridKeyDown}>
              {weekdayHead}
              <tbody>{renderWeeks(weeksB)}</tbody>
            </table>
          </div>
        </div>
      )}

      {!duo && (
        <div className="nk-cal__meta">
          <span className="nk-cal__hint">
            {phase === "end" ? copy.selectEnd : draft.start ? copy.limits(minDays, maxDays) : copy.selectStart}
          </span>
          {legend}
        </div>
      )}

      {duo ? (
        <div className="nk-cal__actions">
          {legend}
          <div className="nk-cal__actions-btns">
            <button type="button" className="nk-cal__clearlink" onClick={clear}
              disabled={!draft.start && !value}>{copy.clearAll}</button>
            <button type="button" className="nk-btn nk-btn--primary nk-btn--sm" onClick={onClose}>{copy.done}</button>
          </div>
        </div>
      ) : (
        <div className="nk-cal__foot">
          <button type="button" className="nk-btn nk-btn--ghost" onClick={clear}
            disabled={!draft.start && !value}>{copy.clear}</button>
          {showApplyBtn && (
            <button type="button" className="nk-btn nk-btn--primary" onClick={onClose}>{copy.apply}</button>
          )}
        </div>
      )}

      {/* Mounted empty and filled on change — a live region that arrives already
          populated is not announced. */}
      <span role="status" aria-live="polite" className="nk-sr-only">
        {isLoading ? copy.loading : message}
      </span>
    </div>
  );
}
