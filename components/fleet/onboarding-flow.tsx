"use client";

import { useMemo, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import { composeOnboardingVerdict, type SelectOutcome } from "@/lib/onboarding-verdict";
import { useTranslation, t } from "@/lib/i18n";

function outcomeLabel(outcome: SelectOutcome): string {
  return t(`fleet.outcomes.${outcome}`);
}

export function OnboardingFlow() {
  const { t: tf } = useTranslation("fleet");
  const connectionQuery = useProgrammeConnection();
  const catalogueQuery = useProgrammeCatalogue({
    enabled: Boolean(connectionQuery.connection),
  });
  const connect = useConnectProgramme();
  const refreshCatalogue = useRefreshCatalogue();
  const selectRepos = useSelectRepos();
  const refreshReadiness = useRefreshReadiness();
  const deselect = useDeselectRepo();

  const [org, setOrg] = useState("");
  const [repo, setRepo] = useState("");
  const [ref, setRef] = useState("");
  const [lastSelect, setLastSelect] = useState<SelectResult | null>(null);
  const [lastReadiness, setLastReadiness] = useState<ReadinessResponse | null>(null);
  const [activeRepos, setActiveRepos] = useState<{ org: string; repo: string }[]>([]);

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

  return (
    <div className="space-y-6">
      <Card>
        <h2 className="mb-4 font-medium">{tf("connection.title")}</h2>
        {connectionQuery.connection ? (
          <dl className="mb-4 grid grid-cols-[10rem_1fr] gap-y-2 text-sm">
            <dt className="text-muted-foreground">{tf("connection.org")}</dt>
            <dd>
              {connectionQuery.connection.org}/{connectionQuery.connection.repo}
            </dd>
            <dt className="text-muted-foreground">{tf("connection.lastSynced")}</dt>
            <dd>{connectionQuery.connection.last_synced_at}</dd>
          </dl>
        ) : (
          <p className="mb-4 text-sm text-muted-foreground">{tf("connection.missing")}</p>
        )}
        <form
          className="grid max-w-xl gap-3 md:grid-cols-3"
          onSubmit={(e) => {
            e.preventDefault();
            connect.mutate(
              { org: org.trim(), repo: repo.trim(), ref: ref.trim() || undefined },
              {
                onSuccess: () => {
                  setOrg("");
                  setRepo("");
                  setRef("");
                },
              },
            );
          }}
        >
          <div className="space-y-1">
            <Label htmlFor="meta-org">{tf("connection.org")}</Label>
            <Input id="meta-org" value={org} onChange={(e) => setOrg(e.target.value)} required />
          </div>
          <div className="space-y-1">
            <Label htmlFor="meta-repo">{tf("connection.repo")}</Label>
            <Input id="meta-repo" value={repo} onChange={(e) => setRepo(e.target.value)} required />
          </div>
          <div className="space-y-1">
            <Label htmlFor="meta-ref">{tf("connection.ref")}</Label>
            <Input id="meta-ref" value={ref} onChange={(e) => setRef(e.target.value)} />
          </div>
          <div className="md:col-span-3">
            <Button type="submit" disabled={connect.isPending}>
              {tf("connection.submit")}
            </Button>
          </div>
        </form>
        {connect.error ? (
          <p className="mt-2 text-sm text-danger" role="alert">
            {connect.error.message}
          </p>
        ) : null}
      </Card>

      <Card>
        <div className="mb-4 flex items-center justify-between gap-2">
          <h2 className="font-medium">{tf("catalogue.title")}</h2>
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={!connectionQuery.connection || refreshCatalogue.isPending}
            onClick={() => refreshCatalogue.mutate()}
          >
            {tf("catalogue.refresh")}
          </Button>
        </div>
        {!connectionQuery.connection ? (
          <p className="text-sm text-muted-foreground">{tf("connection.missing")}</p>
        ) : catalogueQuery.isLoading ? (
          <p className="text-sm text-muted-foreground">{tf("loading")}</p>
        ) : !catalogueQuery.catalogue?.candidates.length ? (
          <p className="text-sm text-muted-foreground">{tf("catalogue.empty")}</p>
        ) : (
          <ul className="divide-y divide-border">
            {catalogueQuery.catalogue.candidates.map((c) => (
              <li
                key={`${c.org}/${c.repo}`}
                className="flex flex-wrap items-center justify-between gap-2 py-3 text-sm"
              >
                <div>
                  <p className="font-medium">
                    {c.org}/{c.repo}
                  </p>
                  <p className="text-muted-foreground">
                    {c.service_key} · {c.status}
                  </p>
                </div>
                <Button
                  type="button"
                  size="sm"
                  disabled={selectRepos.isPending || refreshReadiness.isPending}
                  onClick={() => {
                    setLastSelect(null);
                    setLastReadiness(null);
                    selectRepos.mutate([{ org: c.org, repo: c.repo }], {
                      onSuccess: (data) => {
                        setActiveRepos(data.active_repos);
                        const result = data.results[0];
                        if (!result) return;
                        setLastSelect(result);
                        if (result.outcome === "ok" || result.outcome === "already_selected") {
                          refreshReadiness.mutate(
                            { org: c.org, repo: c.repo },
                            { onSuccess: (r) => setLastReadiness(r) },
                          );
                        }
                      },
                    });
                  }}
                >
                  {tf("catalogue.select")}
                </Button>
              </li>
            ))}
          </ul>
        )}
        {selectRepos.error || refreshCatalogue.error || refreshReadiness.error ? (
          <p className="mt-2 text-sm text-danger" role="alert">
            {(selectRepos.error ?? refreshCatalogue.error ?? refreshReadiness.error)?.message}
          </p>
        ) : null}
      </Card>

      {(lastSelect || verdict) && (
        <Card>
          <h2 className="mb-2 font-medium">{tf("verdict.label")}</h2>
          {lastSelect ? (
            <p className="mb-2 text-sm">
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
          {lastSelect &&
          (lastSelect.outcome === "ok" || lastSelect.outcome === "already_selected") ? (
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="mt-3"
              disabled={refreshReadiness.isPending}
              onClick={() =>
                refreshReadiness.mutate(
                  { org: lastSelect.org, repo: lastSelect.repo },
                  { onSuccess: (r) => setLastReadiness(r) },
                )
              }
            >
              {tf("readiness.refresh")}
            </Button>
          ) : null}
        </Card>
      )}

      <Card>
        <h2 className="mb-4 font-medium">{tf("active.title")}</h2>
        {activeRepos.length === 0 && !connectionQuery.connection ? (
          <p className="text-sm text-muted-foreground">{tf("active.empty")}</p>
        ) : activeRepos.length === 0 ? (
          <p className="text-sm text-muted-foreground">{tf("active.empty")}</p>
        ) : (
          <ul className="divide-y divide-border">
            {activeRepos.map((r) => (
              <li
                key={`${r.org}/${r.repo}`}
                className="flex items-center justify-between gap-2 py-3 text-sm"
              >
                <span>
                  {r.org}/{r.repo}
                </span>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={deselect.isPending}
                  onClick={() =>
                    deselect.mutate(
                      { org: r.org, repo: r.repo },
                      { onSuccess: (data) => setActiveRepos(data.active_repos) },
                    )
                  }
                >
                  {tf("deselect")}
                </Button>
              </li>
            ))}
          </ul>
        )}
        {deselect.error ? (
          <p className="mt-2 text-sm text-danger" role="alert">
            {deselect.error.message}
          </p>
        ) : null}
      </Card>
    </div>
  );
}
