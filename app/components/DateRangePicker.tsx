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
//
// This file is a thin booking WRAPPER: the month grid lives in Calendar.tsx, shared
// verbatim with the feed's date filter — same one-month layout, same nav, same foot.
// Here we own the trigger field, the desktop popover and mobile sheet layers, and the
// mapping from dict.detail into the calendar's injected copy — plus the
// unknown-availability banner, which is booking-only and so stays here.
import { useEffect, useRef, useState } from "react";
import { useI18n } from "./I18nProvider";
import { CloseButton, Icon, RangePopoverLayer, tabOutDismiss, useTriggerPopover } from "./ui";
import { useDismissableLayer } from "@/app/lib/use-dismissable-layer";
import { useFocusTrap } from "@/app/lib/use-focus-trap";
import { useSheetDrag } from "@/app/lib/use-sheet-drag";
import { type Availability } from "@/app/lib/availability";
import { formatShortDate, type IsoDate } from "@/app/lib/dates";
import type { Dict } from "@/app/lib/i18n/types";
import { CalendarPanel, type CalendarCopy, type DateRange } from "./Calendar";

export type { DateRange };

// What the layers below need. `today` is definite here — the trigger can render without
// it, the calendar cannot.
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

// dict.detail → the calendar's injected copy. One mapping, shared by both layers.
function detailCalendarCopy(t: Dict["detail"]): CalendarCopy {
  return {
    prevMonth: t.calPrevMonth,
    nextMonth: t.calNextMonth,
    today: t.calToday,
    selectStart: t.calSelectStart,
    selectEnd: t.calSelectEnd,
    limits: t.calLimits,
    days: t.calDays,
    startSelected: t.calStartSelected,
    rangeSelected: t.calRangeSelected,
    blocked: t.calBlocked,
    booked: t.calBooked,
    clear: t.datesClear,
    apply: t.datesApply,
    loading: t.calLoading,
  };
}

// The unknown-availability banner: booking-only, so its copy stays in dict.detail and
// the shared Calendar carries none of it — it takes the rendered node via `notice`.
function UnknownNotice({ t, onRetry }: { t: Dict["detail"]; onRetry: () => void }) {
  return (
    <div className="nk-cal__notice" role="status">
      <Icon name="TriangleAlert" size={17} color="var(--nk-yellow)" />
      <span className="nk-cal__notice-text">
        <strong>{t.calUnknownTitle}</strong>
        {t.calUnknownBody}
      </span>
      <button type="button" className="nk-cal__retry" onClick={onRetry}>{t.calUnknownRetry}</button>
    </div>
  );
}

/* ---------------- Trigger + layers ---------------- */
export function DateRangePicker(props: PickerProps) {
  const { dict } = useI18n();
  const t = dict.detail;
  const [isSheet, setIsSheet] = useState(false);
  // The FIELD, not the panel: it wraps the trigger and the popover both. That is what the
  // outside-click and Tab-out tests have to measure against — see RangePopoverLayer.
  const fieldRef = useRef<HTMLDivElement>(null);
  const { value, availability, today } = props;

  // Which layer to mount is a media query, read at the moment of opening — never during
  // render (SSR has no viewport) and never from an effect (that would be a second render
  // just to pick a layer). A click is the earliest point the answer is both known and
  // needed. The sheet additionally self-closes past 561px via useDismissableLayer's
  // `closeAt`, so a mid-open resize is handled too. This also arms the lazily-enabled
  // availability query, so neither happens until the user actually asks for the calendar.
  const { open, triggerRef, close, dismiss, toggle } = useTriggerPopover<HTMLButtonElement>(() => {
    setIsSheet(window.matchMedia("(max-width: 560px)").matches);
    props.onOpen();
  });

  // Only the availability-unknown disclosure lives under the trigger.
  const summary =
    !value && availability?.status === "unknown" ? t.calUnknownNote : null;

  return (
    <div ref={fieldRef} className="nk-cal-field" onBlur={tabOutDismiss(open, dismiss)}>
      <button ref={triggerRef} type="button" className={"nk-cal-trigger" + (open ? " is-open" : "")}
        onClick={toggle} aria-haspopup="dialog" aria-expanded={open} aria-label={t.datesTriggerLabel}>
        <Icon name="Calendar" size={24} stroke={1.4} color="var(--nk-text-2)" />
        <span className="nk-cal-trigger__cols">
          <Field label={t.datesFrom} value={value?.start} placeholder={t.datesPlaceholder} />
          <span className="nk-cal-trigger__sep" aria-hidden="true" />
          <Field label={t.datesTo} value={value?.end} placeholder={t.datesPlaceholder} />
        </span>
      </button>
      {summary && (
        <span className="nk-cal-summary">
          <Icon name="TriangleAlert" size={13} color="var(--nk-yellow)" />
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

// The one booking calendar, shared verbatim by both layers below — the injected copy
// is identical by construction; only commitCloses differs (the popover commits-and-
// closes, the sheet stays open and keeps its Apply button).
function BookingCalendar({
  value, onChange, availability, isLoading, onRetry, today, minDays, maxDays, onClose, commitCloses,
}: PanelProps & { onClose: () => void; commitCloses: boolean }) {
  const { dict } = useI18n();
  const t = dict.detail;
  const notice = availability?.status === "unknown" ? <UnknownNotice t={t} onRetry={onRetry} /> : undefined;

  return (
    <CalendarPanel value={value} onChange={onChange} availability={availability} isLoading={isLoading}
      today={today} minDays={minDays} maxDays={maxDays} notice={notice}
      copy={detailCalendarCopy(t)} onClose={onClose} commitCloses={commitCloses} />
  );
}

// Desktop: the shared non-modal popover shell (ui.tsx owns the dismissal contract — the
// same one the feed's range filters run on). All this adds is the booking calendar.
function RangePopover({
  onDismiss, fieldRef, ...panel
}: PanelProps & {
  onClose: () => void;
  onDismiss: () => void;
  fieldRef: React.RefObject<HTMLDivElement | null>;
}) {
  const { dict } = useI18n();

  return (
    <RangePopoverLayer className="nk-cal-pop" ariaLabel={dict.detail.datesPanelTitle}
      onClose={panel.onClose} onDismiss={onDismiss} fieldRef={fieldRef}>
      <BookingCalendar {...panel} commitCloses />
    </RangePopoverLayer>
  );
}

// Mobile: the bottom sheet, same construction as the feed's filter sheet.
function RangeSheet(props: PanelProps & { onClose: () => void }) {
  const { onClose } = props;
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
        {/* Same panel as the popover; commitCloses={false} is what gives the sheet its
            Apply button (CalendarPanel defaults showApply to !commitCloses). */}
        <BookingCalendar {...props} commitCloses={false} />
      </div>
    </div>
  );
}
