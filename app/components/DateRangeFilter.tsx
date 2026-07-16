"use client";

// The feed's date-range filter — a calendar behind a "Dates" pill.
//
// It is the exact twin of the price filter (PriceRange.tsx): a trigger pill that opens a
// desktop popover, and the SAME panel rendered inline inside the mobile filter sheet.
// That shell — the pill, the popover layer and the dismissal contract — is literally
// shared with it: both compose RangePillControl (ui.tsx), so the twins cannot drift.
//
// The month grid itself is the shared Calendar engine, run WITHOUT availability: there is
// no single listing here, so the grid only knows structural rules — past days are
// disabled, today is the earliest selectable day, and a window may not exceed
// MAX_WINDOW_DAYS. There is no "booked" state, no legend and no unknown-availability
// banner. Committing is a discrete act (a second date click / Enter), so — unlike the
// dragged price slider — there is no debounce: every commit is one deliberate URL write,
// and re-picking the window already in the URL is absorbed by setParams' no-op guard
// (FeedScreen), which both range filters share.
import { useI18n } from "./I18nProvider";
import { RangePillControl } from "./ui";
import { useMarketToday } from "@/app/lib/use-market-today";
import { MAX_WINDOW_DAYS, dateBandArgs, type DateFilterRange } from "@/app/lib/date-filter";
import type { Dict } from "@/app/lib/i18n/types";
import { CalendarPanel, type CalendarCopy } from "./Calendar";

// dict.feed → the calendar's injected copy. The feed owns its calendar strings; the
// clear button reuses feed.clear, and the availability-only fields are omitted (the grid
// never renders them without an `availability`).
function feedCalendarCopy(t: Dict["feed"]): CalendarCopy {
  return {
    prevMonth: t.datePrevMonth,
    nextMonth: t.dateNextMonth,
    today: t.dateToday,
    selectStart: t.dateSelectStart,
    selectEnd: t.dateSelectEnd,
    limits: (_min, max) => t.dateWindowHint(max),
    days: t.dateDays,
    startSelected: t.dateStartSelected,
    rangeSelected: t.dateRangeSelected,
    blocked: t.dateBlocked,
    clear: t.clear,
  };
}

/* ---------------- Core panel (shared by popover + sheet) ---------------- */
export function DateRangeFilterPanel({
  value,
  onChange,
  variant,
  onDone,
  autoFocus = false,
}: {
  value: DateFilterRange | null; // committed range from the URL; null = no filter
  onChange: (range: DateFilterRange | null) => void; // commit — the parent serializes it to the URL
  variant: "popover" | "inline";
  onDone?: () => void; // popover only: close the layer + restore focus to the trigger
  autoFocus?: boolean; // popover: move focus into the grid when it opens
}) {
  const { dict } = useI18n();
  const t = dict.feed;
  // Market "today" is client-only (undefined on the server + first client render), but
  // the calendar needs a definite one. Both layers mount only on a click — the popover on
  // the pill, the sheet's children behind its own `if (!open) return null` — so by then
  // `today` has resolved and this branch never paints. It is here to narrow the type, not
  // to be seen: nothing to reserve height for, and no state to announce.
  const today = useMarketToday();
  if (!today) {
    return null;
  }
  return (
    // Named INLINE only, exactly as the price twin: in the popover the role="dialog"
    // already carries this name, but in the filter sheet there is no dialog and the
    // sheet's visual label is associated with nothing.
    <div className="nk-datefilter-panel"
      role={variant === "inline" ? "group" : undefined}
      aria-label={variant === "inline" ? t.datePanelTitle : undefined}>
      <CalendarPanel
        value={value}
        onChange={onChange}
        today={today}
        minDays={1}
        maxDays={MAX_WINDOW_DAYS}
        copy={feedCalendarCopy(t)}
        commitCloses={variant === "popover"}
        showApply={false}
        autoFocus={autoFocus && variant === "popover"}
        onClose={onDone ?? (() => {})}
      />
    </div>
  );
}

/* ---------------- Desktop trigger + popover ---------------- */
// The pill, the popover layer and the dismissal contract are RangePillControl's (shared
// with the price filter); all that is date-specific is the label and the panel.
export function DateRangeFilterControl({
  value,
  onChange,
}: {
  value: DateFilterRange | null;
  onChange: (range: DateFilterRange | null) => void;
}) {
  const { locale, dict } = useI18n();
  const t = dict.feed;

  const active = value !== null;
  const label = value ? t.dateBand(...dateBandArgs(value, locale)) : t.dateAny;

  return (
    <RangePillControl
      icon="Calendar"
      label={label}
      active={active}
      triggerAriaLabel={active ? `${t.dateLabel}: ${label}` : t.dateLabel}
      panelAriaLabel={t.datePanelTitle}
      fieldClassName="nk-datefilter-field"
      popClassName="nk-datefilter-pop"
      renderPanel={(onDone) => (
        <DateRangeFilterPanel value={value} onChange={onChange} variant="popover" onDone={onDone} autoFocus />
      )}
    />
  );
}
