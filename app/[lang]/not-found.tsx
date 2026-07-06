"use client";
// Localized 404 for the [lang] segment. Rendered inside the locale layout, so
// the I18nProvider context (and the site chrome) is available.
import { StatusScreen } from "@/app/components/StatusScreen";
import { useI18nOptional } from "@/app/components/I18nProvider";
import { localePath } from "@/app/lib/i18n/config";

export default function NotFound() {
  const { locale, dict } = useI18nOptional();
  const t = dict.errors;
  // No onAction: the back-home CTA falls through to StatusScreen's locale-home
  // default. The body invites browsing, so offer a matching feed route too.
  return (
    <StatusScreen
      illustration="notFound"
      title={t.notFoundTitle}
      body={t.notFoundBody}
      actionLabel={t.notFoundAction}
      secondaryLabel={t.notFoundBrowse}
      onSecondaryAction={() => { window.location.href = localePath(locale, "/skelbimai"); }}
    />
  );
}
