"use client";

import { useUpstreamStatus } from "@/hooks/use-upstream-status";
import { useTranslation } from "@/lib/i18n";

export function ChromeHealth() {
  const { t } = useTranslation("workspace");
  const { status, isLoading, error } = useUpstreamStatus();
  const ok = !isLoading && !error && Boolean(status?.connected);

  return (
    <span
      className={ok ? "text-ok" : "text-danger"}
      title={ok ? `${t("chrome.healthOk")} (${status?.latencyMs ?? 0}ms)` : t("chrome.healthDown")}
    >
      {ok ? t("chrome.healthOk") : t("chrome.healthDown")}
    </span>
  );
}
