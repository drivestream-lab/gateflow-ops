"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useAuthProgramme, useEnterProgramme, useLeaveProgramme } from "@/hooks/use-auth-programme";
import { useTranslation } from "@/lib/i18n";

export function ProgrammeSwitcher() {
  const { t } = useTranslation("workspace");
  const list = useAuthProgramme();
  const enter = useEnterProgramme();
  const leave = useLeaveProgramme();

  const programmes = list.data?.programmes ?? [];
  const enteredId = list.data?.entered?.programmeId ?? null;
  const current = programmes.find((row) => row.programmeId === enteredId);
  const label = current?.programmeName || current?.programmeId || t("chrome.notEntered");

  return (
    <details className="relative">
      <summary className="cursor-pointer list-none rounded-md px-2 py-1 text-sm text-foreground hover:bg-surface-alt">
        {list.isLoading ? t("chrome.loading") : label}
      </summary>
      <div className="absolute left-0 z-20 mt-1 w-72 rounded-md border border-border bg-surface p-3 shadow-sm">
        {list.error ? (
          <p className="text-sm text-danger" role="alert">
            {list.error.message}
          </p>
        ) : programmes.length === 0 ? (
          <p className="text-sm text-muted-foreground">{t("chrome.noProgrammes")}</p>
        ) : (
          <ul className="space-y-2">
            {programmes.map((row) => {
              const active = enteredId === row.programmeId;
              return (
                <li key={row.programmeId} className="flex items-center justify-between gap-2">
                  <span className="min-w-0 truncate text-sm">
                    {row.programmeName || row.programmeId}
                  </span>
                  {active ? (
                    <span className="text-xs text-muted-foreground">{t("chrome.current")}</span>
                  ) : (
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      disabled={enter.isPending}
                      onClick={() => enter.mutate(row.programmeId)}
                    >
                      {t("chrome.enter")}
                    </Button>
                  )}
                </li>
              );
            })}
          </ul>
        )}
        <div className="mt-3 flex flex-wrap gap-2 border-t border-border pt-3">
          {enteredId ? (
            <Button
              type="button"
              size="sm"
              variant="ghost"
              disabled={leave.isPending}
              onClick={() => leave.mutate()}
            >
              {t("chrome.leave")}
            </Button>
          ) : null}
          <Button type="button" size="sm" variant="link" asChild>
            <Link href="/programmes/enter">{t("chrome.manageEntry")}</Link>
          </Button>
          <Button type="button" size="sm" variant="link" asChild>
            <Link href="/tenant">{t("chrome.tenantFacts")}</Link>
          </Button>
        </div>
      </div>
    </details>
  );
}
