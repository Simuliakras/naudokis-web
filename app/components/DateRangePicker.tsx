"use client";

// Rental date-range picker — the booking panel's "when?" field.
//
// A calendar on a bridge site earns its keep only twice: it lets a visitor find out a
// listing is taken BEFORE installing the app, and the range it produces rides into the
// app on the deep link. Everything here is shaped by that, and by one honesty rule
// inherited from the data layer:
//
//   We may show that a day is TAKEN. We may never show that a day is FREE.
//
// So there is no "available" state, no green tick, no count of free days. Booked days
// are struck out; everything else is simply selectable, under the booking panel's
// standing promise that dates and the final price are confirmed in the app. When
// availability cannot be read at all, a banner says so — it has to, because with no
// "available" affordance an unknown grid looks exactly like a wide-open one.
import { useEffect, useId, useMemo, useRef, useState } from "react";
import { useI18n } from "./I18nProvider";
import { CloseButton, Icon } from "./ui";
import { useDismissableLayer } from "@/app/lib/use-dismissable-layer";
import { useFocusTrap } from "@/app/lib/use-focus-trap";
import { useSheetDrag } from "@/app/lib/use-sheet-drag";
import { type Availability } from "@/app/lib/availability";
import {
  addDays, addMonths, clampDate, dayOfMonth, formatFullDate, formatMonthHeading,
  formatShortDate, monthWeeks, rentalDays, startOfMonth, startOfWeek, endOfWeek,
  weekdayNames, type IsoDate,
} from "@/app/lib/dates";

export type DateRange = { start: IsoDate; end: IsoDate };

// Why a day cannot be picked. Ordered by how much it tells the user: `booked` is
// tested before the length rules, so a taken day inside the minimum window announces
// the useful fact rather than "too short".
type BlockedReason = "past" | "booked" | "tooShort" | "tooLong" | "spansBooked";

// What the layers below need. `today` is definite here — the trigger can render
// without it, the calendar cannot.
type PanelProps = {
  value: DateRange | null;
  onChange: (range: DateRange | null) => void;
  availability: Availability | undefined; // undefined while the first fetch is in flight
  isLoading: boolean;
  onRetry: () => void;
  today: IsoDate;
  minDays: number;
  maxDays: number; // 0 = no ceiling on the wire
};

// `today` is a client-only fact (see use-market-today.ts), so it is undefined on the
// server and on the first client render. The TRIGGER survives that happily — it holds
// only labels and a placeholder until the user picks something, so it renders
// identically on both sides and reserves its own height. Only the calendar needs a
// real "today", and by the time anyone can click to open one, the mount has happened.
// That split is what keeps this component free of both a hydration mismatch and the
// layout shift a mount-gated field would cause.
type PickerProps = Omit<PanelProps, "today"> & {
  today: IsoDate | undefined;
  onOpen: () => void; // arms the lazily-enabled availability query
};

/* ---------------- Trigger + layers ---------------- */
export function DateRangePicker(props: PickerProps) {
  const { dict } = useI18n();
  const t = dict.detail;
  const [open, setOpen] = useState(false);
  const [isSheet, setIsSheet] = useState(false);
  // The FIELD, not the panel: it wraps the trigger and the popover both. That is what
  // the outside-click test has to measure against — see RangePopover.
  const fieldRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const { value, availability, today } = props;

  // Which layer to mount is a media query, read at the moment of opening — never
  // during render (SSR has no viewport) and never from an effect (that would be a
  // second render just to pick a layer). A click is the earliest point the answer is
  // both known and needed. The sheet additionally self-closes past 561px via
  // useDismissableLayer's `closeAt`, so a mid-open resize is handled too.
  const openPanel = () => {
    setIsSheet(window.matchMedia("(max-width: 560px)").matches);
    props.onOpen();
    setOpen(true);
  };
  // Closing from INSIDE the picker (Escape, the close button, committing a range):
  // focus has to come back to the trigger, or it falls to the top of the document.
  const close = () => {
    setOpen(false);
    triggerRef.current?.focus();
  };
  // Closing because the user clicked somewhere else: do NOT pull focus back. They are
  // already on their way to another control, and stealing it mid-mousedown would fight
  // them. Same split FilterSelect makes (ui.tsx).
  const dismiss = () => setOpen(false);
  // A real toggle, like every other trigger in the kit. Without this the button could
  // only ever open: the outside-click handler would close on mousedown and the click
  // that followed would re-open, remounting the calendar and discarding its draft.
  const toggle = () => {
    if (open) {
      close();
      return;
    }
    openPanel();
  };

  const summary = value
    ? t.calDays(rentalDays(value.start, value.end))
    : availability?.status === "unknown"
      ? t.calUnknownNote
      : null;

  return (
    <div ref={fieldRef} className="nk-cal-field">
      <span className="nk-cal-field__label">{t.datesLabel}</span>
      <button ref={triggerRef} type="button" className={"nk-cal-trigger" + (open ? " is-open" : "")}
        onClick={toggle} aria-haspopup="dialog" aria-expanded={open} aria-label={t.datesTriggerLabel}>
        <Icon name="Calendar" size={18} stroke={1.9} color="var(--nk-text-2)" />
        <span className="nk-cal-trigger__cols">
          <Field label={t.datesFrom} value={value?.start} placeholder={t.datesPlaceholder} />
          <span className="nk-cal-trigger__sep" aria-hidden="true" />
          <Field label={t.datesTo} value={value?.end} placeholder={t.datesPlaceholder} />
        </span>
      </button>
      {summary && (
        <span className={"nk-cal-summary" + (value ? "" : " is-warn")}>
          {!value && <Icon name="TriangleAlert" size={13} color="var(--nk-yellow)" />}
          {summary}
        </span>
      )}
      {open && today && !isSheet && <RangePopover {...props} today={today} onClose={close} onDismiss={dismiss} fieldRef={fieldRef} />}
      {open && today && isSheet && <RangeSheet {...props} today={today} onClose={close} />}
    </div>
  );
}

function Field({ label, value, placeholder }: { label: string; value?: IsoDate; placeholder: string }) {
  const { locale } = useI18n();
  return (
    <span className="nk-cal-trigger__col">
      <span className="nk-cal-trigger__cap">{label}</span>
      <span className={"nk-cal-trigger__val" + (value ? " is-set" : "")}>
        {value ? formatShortDate(value, locale) : placeholder}
      </span>
    </span>
  );
}

// Desktop: a non-modal popover. Deliberately NOT useDismissableLayer — that locks
// body scroll, which a non-modal layer must not do. Escape and outside-click are
// handled here, matching FilterSelect's contract (ui.tsx).
//
// That contract is precise, and getting it wrong is invisible until you try it: the
// containment test runs against the FIELD, which wraps the trigger as well as this
// panel. Test it against the panel alone and a mousedown on the trigger reads as
// "outside" — the popover closes, the click that follows re-opens it, and the button
// can never dismiss its own panel. (It would also remount CalendarPanel and throw away
// the user's half-picked range.) The trigger being a toggle is the other half of it.
function RangePopover({ onClose, onDismiss, fieldRef, ...rest }: PanelProps & {
  onClose: () => void;
  onDismiss: () => void;
  fieldRef: React.RefObject<HTMLDivElement | null>;
}) {
  const { dict } = useI18n();

  useEffect(() => {
    const onDown = (event: MouseEvent) => {
      const node = event.target;
      if (node instanceof Node && !fieldRef.current?.contains(node)) {
        onDismiss();
      }
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [onDismiss, fieldRef]);

  return (
    <div className="nk-cal-pop" role="dialog" aria-label={dict.detail.datesPanelTitle}
      onKeyDown={(event) => {
        if (event.key === "Escape") {
          // Stop it here: an Escape meant for the calendar must not also close the
          // app-redirect modal or any layer above it.
          event.stopPropagation();
          onClose();
        }
      }}>
      <CalendarPanel {...rest} onClose={onClose} commitCloses />
    </div>
  );
}

// Mobile: the bottom sheet, same construction as the feed's filter sheet.
function RangeSheet({ onClose, ...rest }: PanelProps & { onClose: () => void }) {
  const { dict } = useI18n();
  const t = dict.detail;
  const panelRef = useRef<HTMLDivElement>(null);
  const grabRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const [shown, setShown] = useState(false);

  useFocusTrap(panelRef, true);
  useDismissableLayer(true, onClose, { initialFocus: closeRef, closeAt: "(min-width: 561px)" });
  useSheetDrag({ panelRef, handleRef: grabRef, enabled: true, onDismiss: onClose });

  useEffect(() => {
    const frame = requestAnimationFrame(() => setShown(true));
    return () => cancelAnimationFrame(frame);
  }, []);

  return (
    <div className={"nk-modal-scrim nk-cal-sheet-scrim" + (shown ? " open" : "")}
      role="dialog" aria-modal="true" aria-label={t.datesPanelTitle}
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          onClose();
        }
      }}>
      <div ref={panelRef} className="nk-sheet nk-cal-sheet">
        <div ref={grabRef} className="nk-sheet-grabzone" aria-hidden="true"><span className="nk-sheet-grabber" /></div>
        <div className="nk-cal-sheet__head">
          <h2 className="nk-cal-sheet__title">{t.datesPanelTitle}</h2>
          <CloseButton ref={closeRef} label={t.datesClose} onClick={onClose} />
        </div>
        <CalendarPanel {...rest} onClose={onClose} commitCloses={false} />
      </div>
    </div>
  );
}

/* ---------------- The calendar ---------------- */
function CalendarPanel({
  value, onChange, availability, isLoading, onRetry, today, minDays, maxDays, onClose, commitCloses,
}: PanelProps & { onClose: () => void; commitCloses: boolean }) {
  const { locale, dict } = useI18n();
  const t = dict.detail;
  const gridRef = useRef<HTMLTableElement>(null);
  const captionId = useId();

  // The draft is what the grid is painting; `value` is what the panel has committed.
  const [draft, setDraft] = useState<{ start: IsoDate | null; end: IsoDate | null }>(
    () => ({ start: value?.start ?? null, end: value?.end ?? null }),
  );
  const [hover, setHover] = useState<IsoDate | null>(null);
  const [focusDate, setFocusDate] = useState<IsoDate>(value?.start ?? today);
  const [monthAnchor, setMonthAnchor] = useState<IsoDate>(startOfMonth(value?.start ?? today));
  const [message, setMessage] = useState("");

  // Derived, never stored: storing a phase means it can disagree with the draft.
  const phase: "start" | "end" = draft.start && !draft.end ? "end" : "start";

  const horizonEnd = availability?.status === "known" ? availability.windowEnd : addDays(today, 180);
  const unavailable = useMemo(
    () => new Set(availability?.status === "known" ? availability.unavailableDates : []),
    [availability],
  );

  // The first taken day strictly after the chosen start. This single value is the
  // whole no-straddle answer: once a start is picked, every day at or after it is
  // disabled, so a range spanning a booked Saturday cannot be constructed at all —
  // it is not rejected after the fact, it is unreachable.
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

  const blockedReason = (iso: IsoDate): BlockedReason | null => {
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

  const blockedAmount = (reason: BlockedReason) => (reason === "tooLong" ? maxDays : minDays);

  const selectDay = (iso: IsoDate) => {
    const reason = blockedReason(iso);
    if (reason) {
      // No state change — just tell the user why. Disabled cells stay focusable (they
      // must, in a grid), so a keyboard user can land on one and press Enter.
      setMessage(t.calBlocked(reason, blockedAmount(reason)));
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
      setMessage(t.calStartSelected(formatFullDate(iso, locale)));
      return;
    }
    const range = { start, end: iso };
    setDraft(range);
    onChange(range);
    setMessage(t.calRangeSelected({
      start: formatFullDate(range.start, locale),
      end: formatFullDate(range.end, locale),
      days: t.calDays(rentalDays(range.start, range.end)),
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
  };

  // Navigation is by DATE, not by DOM position — which is why rovingKeyNav can't be
  // reused. Arrowing off the edge of a month must land on a real day in the NEXT
  // month, an element that does not exist yet; so the handler moves a date, React
  // re-renders (possibly paging the month), and the focus effect below re-attaches.
  const go = (target: IsoDate) => {
    const next = clampDate(target, today, horizonEnd);
    setFocusDate(next);
    if (startOfMonth(next) !== monthAnchor) {
      setMonthAnchor(startOfMonth(next));
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

  // Re-attach focus to the roving cell after a date move — but only when focus is
  // already inside the grid, so opening the panel or clicking elsewhere never yanks it.
  useEffect(() => {
    const grid = gridRef.current;
    if (!grid || !grid.contains(document.activeElement)) {
      return;
    }
    grid.querySelector<HTMLElement>('[tabindex="0"]')?.focus();
  }, [focusDate, monthAnchor]);

  // Hover and keyboard focus feed the SAME preview variable — which is the one change
  // that makes keyboard parity real rather than nominal: the range grows under the
  // arrow keys exactly as it does under the pointer. Touch never sets hover, so no
  // preview paints there, which is correct.
  const previewEnd = phase === "end" ? (hover ?? focusDate) : null;
  const showPreview =
    previewEnd !== null && draft.start !== null
    && previewEnd > draft.start && blockedReason(previewEnd) === null;

  // Which wash the grid is painting, if any. The two are mutually exclusive by
  // construction: `is-inrange` needs both ends, and a preview only exists while the end
  // is still missing.
  const trail = draft.start && draft.end ? "has-range" : showPreview ? "has-preview" : "";

  const weeks = useMemo(() => monthWeeks(monthAnchor), [monthAnchor]);
  const weekdays = useMemo(() => weekdayNames(locale), [locale]);
  const atFirstMonth = monthAnchor <= startOfMonth(today);
  const atLastMonth = monthAnchor >= startOfMonth(horizonEnd);

  const cellClass = (iso: IsoDate, reason: BlockedReason | null) => {
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

  const cellLabel = (iso: IsoDate, reason: BlockedReason | null) => {
    const parts = [formatFullDate(iso, locale)];
    if (iso === today) {
      parts.push(t.calToday);
    }
    if (reason) {
      parts.push(t.calBlocked(reason, blockedAmount(reason)));
    }
    return parts.join(", ");
  };

  return (
    <div className="nk-cal-panel">
      {availability?.status === "unknown" && (
        <div className="nk-cal__notice" role="status">
          <Icon name="TriangleAlert" size={17} color="var(--nk-yellow)" />
          <span className="nk-cal__notice-text">
            <strong>{t.calUnknownTitle}</strong>
            {t.calUnknownBody}
          </span>
          <button type="button" className="nk-cal__retry" onClick={onRetry}>{t.calUnknownRetry}</button>
        </div>
      )}
      <div className="nk-cal__head">
        <button type="button" className="nk-cal__nav" onClick={() => setMonthAnchor(addMonths(monthAnchor, -1))}
          disabled={atFirstMonth} aria-label={t.calPrevMonth}>
          <Icon name="ChevronLeft" size={18} color="var(--nk-text)" />
        </button>
        <span className="nk-cal__title">{formatMonthHeading(monthAnchor, locale)}</span>
        <button type="button" className="nk-cal__nav" onClick={() => setMonthAnchor(addMonths(monthAnchor, 1))}
          disabled={atLastMonth} aria-label={t.calNextMonth}>
          <Icon name="ChevronRight" size={18} color="var(--nk-text)" />
        </button>
      </div>

      {/* The trail class tells the CSS whether there is a wash to draw between the two
          end-caps, and which one — a committed range or the lighter hover/arrow preview.
          The start cell's half-wash is gated on it: a start with nothing yet on its right
          has nothing to connect to, and a bar leaking out of it would be a promise the
          calendar has not made. */}
      <table ref={gridRef} role="grid"
        className={["nk-cal__grid", isLoading && "is-loading", trail].filter(Boolean).join(" ")}
        aria-labelledby={captionId} aria-busy={isLoading || undefined}
        onKeyDown={onGridKeyDown} onMouseLeave={() => setHover(null)}>
        <caption id={captionId} className="nk-sr-only">{formatMonthHeading(monthAnchor, locale)}</caption>
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
        <tbody>
          {weeks.map((week, index) => (
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
                    onMouseEnter={() => reason === null && setHover(iso)}
                    onFocus={() => setFocusDate(iso)}>
                    <span aria-hidden="true">{dayOfMonth(iso)}</span>
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>

      <div className="nk-cal__meta">
        <span className="nk-cal__hint">
          {phase === "end" ? t.calSelectEnd : draft.start ? t.calLimits(minDays, maxDays) : t.calSelectStart}
        </span>
        {availability?.status === "known" && unavailable.size > 0 && (
          <span className="nk-cal__legend"><span className="nk-cal__swatch" aria-hidden="true" />{t.calBooked}</span>
        )}
      </div>

      <div className="nk-cal__foot">
        <button type="button" className="nk-btn nk-btn--ghost" onClick={clear}
          disabled={!draft.start && !value}>{t.datesClear}</button>
        {!commitCloses && (
          <button type="button" className="nk-btn nk-btn--primary" onClick={onClose}>{t.datesApply}</button>
        )}
      </div>

      {/* Mounted empty and filled on change — a live region that arrives already
          populated is not announced. */}
      <span role="status" aria-live="polite" className="nk-sr-only">
        {isLoading ? t.calLoading : message}
      </span>
    </div>
  );
}
