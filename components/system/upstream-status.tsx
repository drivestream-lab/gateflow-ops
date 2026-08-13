"use client";
// Consumes the domain hook — components never call authFetch/useQuery inline.
import { useUpstreamStatus } from "@/hooks/use-upstream-status";
import { useTranslation } from "@/lib/i18n";

export function UpstreamStatus() {
  const { t } = useTranslation("system");
  const { status, isLoading, error } = useUpstreamStatus();

  if (isLoading) return <span className="text-muted-foreground">…</span>;
  if (error || !status?.connected) {
    return <span className="text-danger">✗ {t("status.upstreamUnreachable")}</span>;
  }
  return (
    <span className="text-ok">
      ✓ {t("status.upstreamConnected")} ({status.latencyMs}ms)
    </span>
  );
}
