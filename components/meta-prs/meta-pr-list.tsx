"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useMetaPrPicker } from "@/hooks/use-meta-pr-picker";
import { useTranslation } from "@/lib/i18n";
import { classifyCap01 } from "@/lib/meta-pr-picker";

function cap01Class(tone: ReturnType<typeof classifyCap01>): string {
  switch (tone) {
    case "ready":
      return "text-sm font-semibold text-ok";
    case "stale":
    case "blocked":
    case "missing_label":
      return "text-sm font-semibold text-danger";
    default:
      return "text-sm text-muted-foreground";
  }
}

export function MetaPrList() {
  const { t } = useTranslation("initiatives");
  const picker = useMetaPrPicker();
  const [refreshing, setRefreshing] = useState(false);
  const [refreshError, setRefreshError] = useState<string | null>(null);
  const [onboardError, setOnboardError] = useState<string | null>(null);
  const [onboardingUrl, setOnboardingUrl] = useState<string | null>(null);

  async function refreshFromGithub() {
    setRefreshError(null);
    setRefreshing(true);
    try {
      await picker.hardRefresh();
    } catch (error) {
      setRefreshError(error instanceof Error ? error.message : t("errors.pickerFailed"));
    } finally {
      setRefreshing(false);
    }
  }

  async function onboard(htmlUrl: string) {
    setOnboardError(null);
    setOnboardingUrl(htmlUrl);
    try {
      await picker.onboard.mutateAsync(htmlUrl);
    } catch (error) {
      setOnboardError(error instanceof Error ? error.message : t("errors.onboardFailed"));
    } finally {
      setOnboardingUrl(null);
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="space-y-1">
          <h2 className="font-medium">{t("picker.title")}</h2>
          <p className="text-sm text-muted-foreground">{t("picker.hint")}</p>
        </div>
        <Button
          type="button"
          variant="outline"
          disabled={refreshing || picker.isLoading}
          onClick={() => void refreshFromGithub()}
        >
          {refreshing ? t("picker.refreshing") : t("picker.refresh")}
        </Button>
      </div>
      {refreshError ? <p className="text-sm text-danger">{refreshError}</p> : null}
      {onboardError ? <p className="text-sm text-danger">{onboardError}</p> : null}
      {picker.isLoading ? (
        <p className="text-sm text-muted-foreground">{t("picker.loading")}</p>
      ) : picker.error ? (
        <p className="text-sm text-danger">{picker.error.message}</p>
      ) : !picker.picker || picker.picker.items.length === 0 ? (
        <p className="text-sm text-muted-foreground">{t("picker.empty")}</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[48rem] text-left text-sm">
            <thead>
              <tr className="border-b border-border text-muted-foreground">
                <th className="py-2 pr-3 font-medium">{t("picker.columns.initiative")}</th>
                <th className="py-2 pr-3 font-medium">{t("picker.columns.pr")}</th>
                <th className="py-2 pr-3 font-medium">{t("picker.columns.cap01")}</th>
                <th className="py-2 font-medium">{t("picker.columns.action")}</th>
              </tr>
            </thead>
            <tbody>
              {picker.picker.items.map((item) => {
                const tone = classifyCap01(item.checkpoint);
                const busy = onboardingUrl === item.htmlUrl;
                return (
                  <tr key={item.number} className="border-b border-border/60">
                    <td className="py-2 pr-3 font-mono text-xs">{item.initiativeId}</td>
                    <td className="py-2 pr-3">
                      <a
                        className="text-accent underline"
                        href={item.htmlUrl}
                        rel="noreferrer"
                        target="_blank"
                      >
                        #{item.number}
                      </a>
                      <div className="text-xs text-muted-foreground">{item.title}</div>
                    </td>
                    <td className={`py-2 pr-3 ${cap01Class(tone)}`}>{t(`picker.cap01.${tone}`)}</td>
                    <td className="py-2">
                      {item.onboarded ? (
                        <span className="text-sm text-ok">{t("picker.onboarded")}</span>
                      ) : (
                        <Button
                          type="button"
                          size="sm"
                          disabled={busy}
                          onClick={() => void onboard(item.htmlUrl)}
                        >
                          {busy ? t("picker.onboarding") : t("picker.onboard")}
                        </Button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
