"use client";
// Full-page fallback shared by the route-level not-found (404) and error
// boundaries. Reuses the site chrome (Nav + Footer) so failures stay on-brand,
// and the centered EmptyState carries the message + a single primary action.
import { Nav } from "./sections";
import { Footer } from "./sections-home";
import { EmptyState } from "./cards";
import { useI18nOptional } from "./I18nProvider";
import { localeHome } from "@/app/lib/i18n/config";
import type { IllusName } from "./ui";

export function StatusScreen({
  illustration, title, body, actionLabel, onAction, tone = "default",
}: {
  illustration: IllusName;
  title: string;
  body: string;
  actionLabel: string;
  // Defaults to navigating to the locale home — the right action for a 404. The
  // error boundary overrides it with reset() to retry the failed segment.
  onAction?: () => void;
  // "danger" (crash boundary) makes EmptyState announce via role="alert" and
  // move focus to the retry action; 404 stays "default".
  tone?: "default" | "danger";
}) {
  const { locale } = useI18nOptional();
  // The Nav search icon must not piggyback on the page action (on the error
  // boundary that would silently retry); send it to the locale home instead.
  const goHome = () => {
    window.location.href = localeHome(locale);
  };
  return (
    <div className="nk-page">
      <Nav onSearch={goHome} />
      <main
        id="nk-main"
        className="nk-container"
        style={{ minHeight: "62vh", display: "flex", alignItems: "center", justifyContent: "center", padding: "120px 0" }}
      >
        <EmptyState
          illustration={illustration}
          title={title}
          subtitle={body}
          actionLabel={actionLabel}
          onAction={onAction ?? goHome}
          actionPrimary
          tone={tone}
        />
      </main>
      <Footer locale={locale} />
    </div>
  );
}
