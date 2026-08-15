"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  classifyWaveMapStatus,
  compositionGapLabel,
  useInitiativeOp,
  useInitiativesList,
  useStartClosure,
  type InitiativeByIdOp,
  type InitiativeSummary,
  type WaveMapStatus,
} from "@/hooks/use-initiatives";
import { useTenant } from "@/hooks/use-tenant";
import {
  deriveRepoWorkspacePath,
  fleetRepoKey,
  waveIdsFromMap,
  waveTicketIdsFromMap,
} from "@/lib/initiative-derive";
import { useTranslation } from "@/lib/i18n";

function waveStatusClass(status: WaveMapStatus): string {
  switch (status) {
    case "done":
      return "text-sm font-semibold text-ok";
    case "blocked":
      return "text-sm font-semibold text-danger";
    case "active":
      return "text-sm font-semibold text-accent";
    case "ready-to-start":
      return "text-sm font-semibold text-foreground";
    default:
      return "text-sm text-muted-foreground";
  }
}

function gapText(value: unknown, t: (key: string) => string): string {
  const gap = compositionGapLabel(value);
  if (gap === "unavailable") return t("list.gap.unavailable");
  if (gap === "empty") return t("list.gap.empty");
  if (typeof value === "string") return value;
  return String(value);
}

function asRecord(data: unknown): Record<string, unknown> | null {
  if (data && typeof data === "object" && !Array.isArray(data)) {
    return data as Record<string, unknown>;
  }
  return null;
}

function WaveRows({ data, t }: { data: unknown; t: (key: string) => string }) {
  const rec = asRecord(data);
  const waves = Array.isArray(rec?.waves) ? rec.waves : [];
  if (waves.length === 0) {
    return <p className="text-sm text-muted-foreground">{t("waves.empty")}</p>;
  }
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[40rem] text-left text-sm">
        <thead>
          <tr className="border-b border-border text-muted-foreground">
            <th className="py-2 pr-3 font-medium">{t("waves.columns.wave")}</th>
            <th className="py-2 pr-3 font-medium">{t("waves.columns.title")}</th>
            <th className="py-2 pr-3 font-medium">{t("waves.columns.status")}</th>
            <th className="py-2 pr-3 font-medium">{t("waves.columns.block")}</th>
            <th className="py-2 pr-3 font-medium">{t("waves.columns.ticket")}</th>
            <th className="py-2 font-medium">{t("waves.columns.run")}</th>
          </tr>
        </thead>
        <tbody>
          {waves.map((row) => {
            const w = asRecord(row) ?? {};
            const waveId = String(w.wave_id ?? "");
            const status = classifyWaveMapStatus(typeof w.status === "string" ? w.status : null);
            return (
              <tr key={waveId || JSON.stringify(row)} className="border-b border-border/60">
                <td className="py-2 pr-3 font-mono text-xs">{waveId || t("list.gap.empty")}</td>
                <td className="py-2 pr-3">{gapText(w.title, t)}</td>
                <td className={`py-2 pr-3 ${waveStatusClass(status)}`}>
                  {t(`waves.status.${status}`)}
                </td>
                <td className="py-2 pr-3 text-muted-foreground">{gapText(w.block_reason, t)}</td>
                <td className="py-2 pr-3">
                  {typeof w.ticket_url === "string" && w.ticket_url ? (
                    <a
                      className="text-accent underline"
                      href={w.ticket_url}
                      rel="noreferrer"
                      target="_blank"
                    >
                      {String(w.ticket_id ?? w.ticket_url)}
                    </a>
                  ) : (
                    gapText(w.ticket_id, t)
                  )}
                </td>
                <td className="py-2 font-mono text-xs">{gapText(w.in_flight_run_id, t)}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

function JsonReadout({ data, t }: { data: unknown; t: (key: string) => string }) {
  if (data === null || data === undefined) {
    return <p className="text-sm text-muted-foreground">{t("readout.empty")}</p>;
  }
  return (
    <pre className="max-h-96 overflow-auto rounded-md border border-border bg-surface p-3 text-xs text-foreground">
      {JSON.stringify(data, null, 2)}
    </pre>
  );
}

function DetailPanel({
  item,
  org,
  repo,
  t,
}: {
  item: InitiativeSummary | null;
  org: string;
  repo: string;
  t: (key: string) => string;
}) {
  if (!item) {
    return <p className="text-sm text-muted-foreground">{t("detail.selectPrompt")}</p>;
  }
  const runsHref = `/runs`;
  return (
    <dl className="grid gap-3 text-sm md:grid-cols-2">
      <div>
        <dt className="text-muted-foreground">{t("list.columns.id")}</dt>
        <dd className="font-mono">{item.initiativeId}</dd>
      </div>
      <div>
        <dt className="text-muted-foreground">{t("list.columns.name")}</dt>
        <dd>{item.name}</dd>
      </div>
      <div>
        <dt className="text-muted-foreground">{t("detail.stage")}</dt>
        <dd>{gapText(item.currentStage, t)}</dd>
      </div>
      <div>
        <dt className="text-muted-foreground">{t("detail.stageDetail")}</dt>
        <dd>{gapText(item.currentStageDetail, t)}</dd>
      </div>
      <div>
        <dt className="text-muted-foreground">{t("detail.prd")}</dt>
        <dd>{gapText(item.prdApproval, t)}</dd>
      </div>
      <div>
        <dt className="text-muted-foreground">{t("detail.prdReason")}</dt>
        <dd>{gapText(item.prdApprovalReason, t)}</dd>
      </div>
      <div className="md:col-span-2">
        <dt className="text-muted-foreground">{t("detail.repos")}</dt>
        <dd>
          {item.affectedRepos.length === 0 ? t("list.gap.empty") : item.affectedRepos.join(", ")}
        </dd>
      </div>
      <div>
        <dt className="text-muted-foreground">{t("detail.epic")}</dt>
        <dd>
          {item.epicTicketUrl ? (
            <a
              className="text-accent underline"
              href={item.epicTicketUrl}
              rel="noreferrer"
              target="_blank"
            >
              {item.epicTicketId ?? item.epicTicketUrl}
            </a>
          ) : (
            gapText(item.epicTicketId, t)
          )}
        </dd>
      </div>
      <div>
        <dt className="text-muted-foreground">{t("detail.inFlight")}</dt>
        <dd className="font-mono text-xs">
          {item.inFlightRun
            ? `${item.inFlightRun.runId} (${item.inFlightRun.statusType})`
            : t("list.gap.empty")}
        </dd>
      </div>
      <div className="md:col-span-2">
        <Link
          className="text-sm text-accent underline"
          href={`${runsHref}?initiative_id=${encodeURIComponent(item.initiativeId)}&org=${encodeURIComponent(org)}&repo=${encodeURIComponent(repo)}`}
        >
          {t("detail.openRuns")}
        </Link>
      </div>
    </dl>
  );
}

const READOUT_OPS: InitiativeByIdOp[] = [
  "spec",
  "implementation",
  "closeout",
  "merge",
  "completion",
  "closure",
];

const WAVE_READOUTS = new Set<InitiativeByIdOp>(["implementation", "closeout", "merge"]);

export function InitiativeHub() {
  const { t } = useTranslation("initiatives");
  const tenant = useTenant();
  const repos = useMemo(() => tenant.tenant?.repos ?? [], [tenant.tenant?.repos]);

  const [selectedRepo, setSelectedRepo] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [readoutOp, setReadoutOp] = useState<InitiativeByIdOp>("spec");
  const [waveId, setWaveId] = useState("");
  const [closureForm, setClosureForm] = useState({
    branch_slug: "closure",
    runner: "",
    model_id: "",
  });
  const [closureAck, setClosureAck] = useState<string | null>(null);
  const [closureLocalError, setClosureLocalError] = useState<string | null>(null);

  useEffect(() => {
    if (!selectedRepo && repos[0]) {
      setSelectedRepo(fleetRepoKey(repos[0].org, repos[0].repo));
    }
  }, [repos, selectedRepo]);

  const [org, repo] = useMemo(() => {
    const [o, r] = selectedRepo.split("/");
    return [o ?? "", r ?? ""];
  }, [selectedRepo]);

  const list = useInitiativesList({ org, repo });
  const selected = useMemo(
    () => list.initiatives.find((i) => i.initiativeId === selectedId) ?? null,
    [list.initiatives, selectedId],
  );

  const waves = useInitiativeOp(
    {
      initiativeId: selectedId,
      org,
      repo,
      op: "waves",
    },
    { enabled: Boolean(selectedId && org && repo) },
  );

  const mapWaveIds = useMemo(() => waveIdsFromMap(waves.payload?.data), [waves.payload?.data]);
  const mapTicketIds = useMemo(
    () => waveTicketIdsFromMap(waves.payload?.data),
    [waves.payload?.data],
  );

  useEffect(() => {
    if (mapWaveIds[0] && !mapWaveIds.includes(waveId)) {
      setWaveId(mapWaveIds[0]);
    }
  }, [mapWaveIds, waveId]);

  const readout = useInitiativeOp(
    {
      initiativeId: selectedId,
      org,
      repo,
      op: readoutOp,
      waveId,
    },
    { enabled: Boolean(selectedId && org && repo) },
  );

  const startClosure = useStartClosure();
  const workspacePath = deriveRepoWorkspacePath(tenant.tenant?.workspaceRoot, org, repo);

  function selectInitiative(item: InitiativeSummary) {
    setSelectedId(item.initiativeId);
    setClosureAck(null);
    setClosureLocalError(null);
  }

  return (
    <Card>
      <div className="mb-4 max-w-sm space-y-1">
        <Label htmlFor="init-repo">{t("filters.repo")}</Label>
        <select
          id="init-repo"
          className="flex h-9 w-full rounded-md border border-border bg-background px-3 text-sm"
          value={selectedRepo}
          onChange={(e) => {
            setSelectedRepo(e.target.value);
            setSelectedId(null);
            setWaveId("");
          }}
        >
          <option value="">{t("filters.repoPlaceholder")}</option>
          {repos.map((row) => (
            <option key={fleetRepoKey(row.org, row.repo)} value={fleetRepoKey(row.org, row.repo)}>
              {row.org}/{row.repo}
            </option>
          ))}
        </select>
      </div>

      {repos.length === 0 && !tenant.isLoading ? (
        <p className="text-sm text-muted-foreground">{t("filters.emptyFleet")}</p>
      ) : list.isLoading ? (
        <p className="text-sm text-muted-foreground">{t("loading")}</p>
      ) : list.error ? (
        <p className="text-sm text-danger">{list.error.message}</p>
      ) : !org || !repo ? (
        <p className="text-sm text-muted-foreground">{t("filters.repoPlaceholder")}</p>
      ) : list.initiatives.length === 0 ? (
        <p className="text-sm text-muted-foreground">{t("list.empty")}</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[36rem] text-left text-sm">
            <thead>
              <tr className="border-b border-border text-muted-foreground">
                <th className="py-2 pr-3 font-medium">{t("list.columns.id")}</th>
                <th className="py-2 pr-3 font-medium">{t("list.columns.name")}</th>
                <th className="py-2 pr-3 font-medium">{t("list.columns.stage")}</th>
                <th className="py-2 pr-3 font-medium">{t("list.columns.prd")}</th>
                <th className="py-2 font-medium">{t("list.columns.epic")}</th>
              </tr>
            </thead>
            <tbody>
              {list.initiatives.map((item) => (
                <tr
                  key={item.initiativeId}
                  className={
                    item.initiativeId === selectedId
                      ? "border-b border-border bg-muted"
                      : "border-b border-border"
                  }
                >
                  <td className="py-2 pr-3 font-mono text-xs">{item.initiativeId}</td>
                  <td className="py-2 pr-3">{item.name}</td>
                  <td className="py-2 pr-3">{gapText(item.currentStage, t)}</td>
                  <td className="py-2 pr-3">{gapText(item.prdApproval, t)}</td>
                  <td className="py-2">
                    <Button
                      type="button"
                      variant={item.initiativeId === selectedId ? "default" : "outline"}
                      size="sm"
                      onClick={() => selectInitiative(item)}
                    >
                      {t("list.open")}
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <h2 className="mb-3 mt-6 font-medium">{t("detail.title")}</h2>
      <DetailPanel item={selected} org={org} repo={repo} t={t} />

      <h2 className="mb-3 mt-6 font-medium">{t("waves.title")}</h2>
      {!selectedId ? (
        <p className="text-sm text-muted-foreground">{t("detail.selectPrompt")}</p>
      ) : waves.isLoading ? (
        <p className="text-sm text-muted-foreground">{t("loading")}</p>
      ) : waves.error ? (
        <p className="text-sm text-danger">{waves.error.message}</p>
      ) : (
        <WaveRows data={waves.payload?.data} t={t} />
      )}

      <h2 className="mb-3 mt-6 font-medium">{t("readout.title")}</h2>
      <div className="mb-4 grid max-w-3xl gap-3 md:grid-cols-2">
        <div className="space-y-1">
          <Label htmlFor="readout-op">{t("readout.op")}</Label>
          <select
            id="readout-op"
            className="flex h-9 w-full rounded-md border border-border bg-background px-3 text-sm"
            value={readoutOp}
            onChange={(e) => setReadoutOp(e.target.value as InitiativeByIdOp)}
          >
            {READOUT_OPS.map((op) => (
              <option key={op} value={op}>
                {t(`readout.op.${op}`)}
              </option>
            ))}
          </select>
        </div>
        {WAVE_READOUTS.has(readoutOp) ? (
          <div className="space-y-1">
            <Label htmlFor="readout-wave">{t("readout.waveId")}</Label>
            <select
              id="readout-wave"
              className="flex h-9 w-full rounded-md border border-border bg-background px-3 text-sm"
              value={waveId}
              onChange={(e) => setWaveId(e.target.value)}
              disabled={!selectedId || mapWaveIds.length === 0}
            >
              <option value="">{t("readout.wavePlaceholder")}</option>
              {mapWaveIds.map((id) => (
                <option key={id} value={id}>
                  {id}
                </option>
              ))}
            </select>
          </div>
        ) : null}
      </div>
      {!selectedId ? (
        <p className="text-sm text-muted-foreground">{t("detail.selectPrompt")}</p>
      ) : readout.isLoading ? (
        <p className="text-sm text-muted-foreground">{t("loading")}</p>
      ) : readout.error ? (
        <p className="text-sm text-danger">{readout.error.message}</p>
      ) : (
        <JsonReadout data={readout.payload?.data} t={t} />
      )}

      <h2 className="mb-2 mt-6 font-medium">{t("closure.title")}</h2>
      <p className="mb-4 text-sm text-muted-foreground">{t("closure.hint")}</p>
      {!selected ? (
        <p className="text-sm text-muted-foreground">{t("closure.selectPrompt")}</p>
      ) : (
        <form
          className="grid max-w-xl gap-3 md:grid-cols-2"
          onSubmit={(e) => {
            e.preventDefault();
            setClosureAck(null);
            setClosureLocalError(null);
            if (!selected.epicTicketId) {
              setClosureLocalError(t("errors.missingEpic"));
              return;
            }
            if (mapTicketIds.length === 0) {
              setClosureLocalError(t("errors.missingWaveTickets"));
              return;
            }
            if (!workspacePath) {
              setClosureLocalError(t("errors.missingWorkspace"));
              return;
            }
            startClosure.mutate(
              {
                initiative_id: selected.initiativeId,
                epic_ticket_id: selected.epicTicketId,
                wave_ticket_ids: mapTicketIds,
                workspace: workspacePath,
                branch_slug: closureForm.branch_slug.trim(),
                base_branch: "develop",
                runner: closureForm.runner.trim(),
                model_id: closureForm.model_id.trim(),
                org,
                repo,
              },
              {
                onSuccess: (result) => {
                  setClosureAck(`${t("closure.success")} ${result.runId}`);
                },
              },
            );
          }}
        >
          <div className="space-y-1">
            <Label htmlFor="closure-branch_slug">{t("closure.branchSlug")}</Label>
            <Input
              id="closure-branch_slug"
              value={closureForm.branch_slug}
              onChange={(e) => setClosureForm((p) => ({ ...p, branch_slug: e.target.value }))}
            />
          </div>
          <div className="space-y-1">
            <Label htmlFor="closure-runner">{t("closure.runner")}</Label>
            <Input
              id="closure-runner"
              value={closureForm.runner}
              onChange={(e) => setClosureForm((p) => ({ ...p, runner: e.target.value }))}
            />
          </div>
          <div className="space-y-1 md:col-span-2">
            <Label htmlFor="closure-model_id">{t("closure.modelId")}</Label>
            <Input
              id="closure-model_id"
              value={closureForm.model_id}
              onChange={(e) => setClosureForm((p) => ({ ...p, model_id: e.target.value }))}
            />
          </div>
          <div className="md:col-span-2 space-y-2">
            <Button type="submit" disabled={startClosure.isPending}>
              {t("closure.submit")}
            </Button>
            {closureLocalError ? <p className="text-sm text-danger">{closureLocalError}</p> : null}
            {startClosure.error ? (
              <p className="text-sm text-danger">{startClosure.error.message}</p>
            ) : null}
            {closureAck ? <p className="text-sm text-ok">{closureAck}</p> : null}
          </div>
        </form>
      )}
    </Card>
  );
}
