"use client";
// Localized 404 for the [lang] segment. Rendered inside the locale layout, so
// the I18nProvider context (and the site chrome) is available.
import { StatusScreen } from "@/app/components/StatusScreen";
import { useI18nOptional } from "@/app/components/I18nProvider";

export default function NotFound() {
  const { dict } = useI18nOptional();
  const t = dict.errors;
  // No onAction: the back-home CTA falls through to StatusScreen's locale-home default.
  return (
    <StatusScreen
      illustration="search"
      title={t.notFoundTitle}
      body={t.notFoundBody}
      actionLabel={t.notFoundAction}
    />
  );
}
