"use client";
// Route-level error boundary for the [lang] segment. Rendered inside the locale
// layout, so I18nProvider + site chrome are available. `reset()` re-renders the
// failed segment (the retry CTA). Sentry capture is wired in instrumentation.
import { useEffect } from "react";
import * as Sentry from "@sentry/nextjs";
import { StatusScreen } from "@/app/components/StatusScreen";
import { useI18nOptional } from "@/app/components/I18nProvider";

export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  const { dict } = useI18nOptional();
  const t = dict.errors;

  useEffect(() => {
    Sentry.captureException(error);
  }, [error]);

  return (
    <StatusScreen
      illustration="error"
      title={t.errorTitle}
      body={t.errorBody}
      actionLabel={t.errorAction}
      onAction={reset}
    />
  );
}
