"use client";

import { StatusScreen } from "@/app/components/StatusScreen";
import { useI18nOptional } from "@/app/components/I18nProvider";
import { localePath } from "@/app/lib/i18n/config";

export function LocalizedNotFoundScreen() {
  const { locale, dict } = useI18nOptional();
  const t = dict.errors;
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
