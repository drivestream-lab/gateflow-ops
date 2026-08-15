"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  useConnectProgramme,
  useDeselectRepo,
  useProgrammeCatalogue,
  useProgrammeConnection,
  useRefreshCatalogue,
  useRefreshReadiness,
  useSelectRepos,
  type ReadinessResponse,
  type SelectResult,
} from "@/hooks/use-programme";
import { useTenant } from "@/hooks/use-tenant";
import { composeFleetRows, fleetRepoKey } from "@/lib/fleet-rows";
import { composeOnboardingVerdict, type SelectOutcome } from "@/lib/onboarding-verdict";
import { useTranslation, t } from "@/lib/i18n";

function outcomeLabel(outcome: SelectOutcome): string {
  return t(`fleet.outcomes.${outcome}`);
}

function cell(value: string | null): string {
  return value ?? "—";
}

export function OnboardingFlow() {
  const { t: tf } = useTranslation("fleet");
  const { tenant } = useTenant();
  const connectionQuery = useProgrammeConnection();
  const catalogueQuery = useProgrammeCatalogue({
    enabled: Boolean(connectionQuery.connection),
  });
  const connect = useConnectProgramme();
  const refreshCatalogue = useRefreshCatalogue();
  const selectRepos = useSelectRepos();
  const refreshReadiness = useRefreshReadiness();
  const deselect = useDeselectRepo();

  const [lastSelect, setLastSelect] = useState<SelectResult | null>(null);
  const [lastReadiness, setLastReadiness] = useState<ReadinessResponse | null>(null);
  const [activeRepos, setActiveRepos] = useState<{ org: string; repo: string }[]>([]);
  const tenantRepos = useMemo(() => tenant?.repos ?? [], [tenant?.repos]);

  useEffect(() => {
    if (tenantRepos.length) {
      setActiveRepos(tenantRepos);
    }
  }, [tenantRepos]);

  const autoConnectTried = useRef(false);
  const connectionMissing =
    !connectionQuery.isLoading && !connectionQuery.error && !connectionQuery.connection;

  useEffect(() => {
    if (connectionMissing && !autoConnectTried.current) {
      autoConnectTried.current = true;
      connect.mutate({});
    }
  }, [connectionMissing, connect]);

  const verdict = useMemo(() => {
    if (!lastSelect) return null;
    return composeOnboardingVerdict(
      lastSelect.outcome,
      lastReadiness
        ? {
            harness_verified: lastReadiness.harness_verified,
            verdict_type: lastReadiness.verdict_type,
          }
        : null,
    );
  }, [lastSelect, lastReadiness]);

  const connection = connectionQuery.connection;
  const rows = useMemo(
    () => composeFleetRows(activeRepos, catalogueQuery.catalogue?.candidates ?? []),
    [activeRepos, catalogueQuery.catalogue?.candidates],
  );

  function admit(org: string, repo: string) {
    setLastSelect(null);
    setLastReadiness(null);
    selectRepos.mutate([{ org, repo }], {
      onSuccess: (data) => {
        setActiveRepos(data.active_repos);
        const result = data.results[0];
        if (!result) return;
        setLastSelect(result);
        if (result.outcome === "ok" || result.outcome === "already_selected") {
          refreshReadiness.mutate({ org, repo }, { onSuccess: (ready) => setLastReadiness(ready) });
        }
      },
    });
  }

  function refreshReady(org: string, repo: string) {
    setLastSelect({
      org,
      repo,
      outcome: "already_selected",
    });
    refreshReadiness.mutate({ org, repo }, { onSuccess: (ready) => setLastReadiness(ready) });
  }

  const actionError =
    selectRepos.error ?? refreshCatalogue.error ?? refreshReadiness.error ?? deselect.error;

  return (
    <Card>
      <div className="mb-4 flex flex-wrap items-center justify-end gap-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={!connection || refreshCatalogue.isPending}
          onClick={() => refreshCatalogue.mutate()}
        >
          {tf("catalogue.refresh")}
        </Button>
      </div>

      {(lastSelect || verdict) && (
        <div className="mb-4 space-y-1 border-b border-border pb-4">
          {lastSelect ? (
            <p className="text-sm">
              {lastSelect.org}/{lastSelect.repo}: {outcomeLabel(lastSelect.outcome)}
            </p>
          ) : null}
          {verdict ? (
            <p
              className={
                verdict.verdict === "pass"
                  ? "text-sm font-semibold text-ok"
                  : "text-sm font-semibold text-danger"
              }
              data-verdict={verdict.verdict}
            >
              {verdict.verdict === "pass" ? tf("verdict.pass") : tf("verdict.fail")}
              {" — "}
              {t(verdict.reasonKey)}
            </p>
          ) : null}
        </div>
      )}

      <h2 className="mb-3 font-medium">{tf("catalogue.title")}</h2>
      {!connection ? (
        <p className="text-sm text-muted-foreground">{tf("catalogue.needsConnection")}</p>
      ) : catalogueQuery.isLoading ? (
        <p className="text-sm text-muted-foreground">{tf("loading")}</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-border text-muted-foreground">
                <th className="py-2 pr-3 font-medium">{tf("list.columns.repo")}</th>
                <th className="py-2 pr-3 font-medium">{tf("list.columns.service")}</th>
                <th className="py-2 pr-3 font-medium">{tf("list.columns.status")}</th>
                <th className="py-2 font-medium">{tf("list.columns.actions")}</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-border bg-muted">
                <th
                  colSpan={4}
                  className="py-2 text-xs font-medium uppercase tracking-wide text-muted-foreground"
                >
                  {tf("catalogue.block.inFleet")}
                </th>
              </tr>
              {rows.active.length === 0 ? (
                <tr className="border-b border-border">
                  <td colSpan={4} className="py-3 text-muted-foreground">
                    {tf("active.empty")}
                  </td>
                </tr>
              ) : (
                rows.active.map((row) => (
                  <tr
                    key={fleetRepoKey(row.org, row.repo)}
                    className="border-b border-border bg-muted"
                  >
                    <td className="py-2 pr-3">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-medium">
                          {row.org}/{row.repo}
                        </span>
                        <span className="inline-flex items-center rounded-full border border-ok bg-ok/10 px-2 py-0.5 text-xs font-medium text-ok">
                          {tf("catalogue.badge.inFleet")}
                        </span>
                      </div>
                    </td>
                    <td className="py-2 pr-3">{cell(row.serviceKey)}</td>
                    <td className="py-2 pr-3">{cell(row.status)}</td>
                    <td className="py-2">
                      <div className="flex flex-wrap gap-2">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          disabled={refreshReadiness.isPending}
                          onClick={() => refreshReady(row.org, row.repo)}
                        >
                          {tf("readiness.refresh")}
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          disabled={deselect.isPending}
                          onClick={() =>
                            deselect.mutate(
                              { org: row.org, repo: row.repo },
                              { onSuccess: (data) => setActiveRepos(data.active_repos) },
                            )
                          }
                        >
                          {tf("deselect")}
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
            <tbody>
              <tr className="border-b border-border bg-surface-alt">
                <th
                  colSpan={4}
                  className="py-2 text-xs font-medium uppercase tracking-wide text-muted-foreground"
                >
                  {tf("catalogue.block.available")}
                </th>
              </tr>
              {rows.candidates.length === 0 ? (
                <tr>
                  <td colSpan={4} className="py-3 text-muted-foreground">
                    {tf("catalogue.empty")}
                  </td>
                </tr>
              ) : (
                rows.candidates.map((row) => (
                  <tr key={fleetRepoKey(row.org, row.repo)} className="border-b border-border">
                    <td className="py-2 pr-3">
                      {row.org}/{row.repo}
                    </td>
                    <td className="py-2 pr-3">{cell(row.serviceKey)}</td>
                    <td className="py-2 pr-3">{cell(row.status)}</td>
                    <td className="py-2">
                      <Button
                        type="button"
                        size="sm"
                        disabled={selectRepos.isPending || refreshReadiness.isPending}
                        onClick={() => admit(row.org, row.repo)}
                      >
                        {tf("catalogue.select")}
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {actionError ? (
        <p className="mt-3 text-sm text-danger" role="alert">
          {actionError.message}
        </p>
      ) : null}

      <div className="mt-6 border-t border-border pt-4">
        <h2 className="mb-2 text-sm font-medium">{tf("connection.title")}</h2>
        {connection ? (
          <div className="flex flex-wrap items-center justify-between gap-3 text-sm">
            <p className="text-muted-foreground">
              {connection.org}/{connection.repo}
              {" · "}
              {tf("connection.lastSynced")} {connection.last_synced_at}
            </p>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              disabled={connect.isPending}
              onClick={() => connect.mutate({})}
            >
              {tf("connection.resync")}
            </Button>
          </div>
        ) : (
          <div className="flex flex-wrap items-center gap-3">
            <p className="text-sm text-muted-foreground">
              {connect.isPending ? tf("connection.connecting") : tf("connection.missing")}
            </p>
            {connect.isError ? (
              <Button type="button" variant="outline" size="sm" onClick={() => connect.mutate({})}>
                {tf("connection.retry")}
              </Button>
            ) : null}
          </div>
        )}
        {connect.error ? (
          <p className="mt-2 text-sm text-danger" role="alert">
            {connect.error.message}
          </p>
        ) : null}
      </div>
    </Card>
  );
}
