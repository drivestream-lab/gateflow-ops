"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  classifyWaveMapStatus,
  compositionGapLabel,
  parseWaveTicketIds,
  useInitiativeOp,
  useInitiativesList,
  useStartClosure,
  type InitiativeByIdOp,
  type InitiativeSummary,
  type WaveMapStatus,
} from "@/hooks/use-initiatives";
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

export function InitiativeHub() {
  const { t } = useTranslation("initiatives");
  const [filters, setFilters] = useState({ org: "", repo: "" });
  const [applied, setApplied] = useState(filters);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [readoutOp, setReadoutOp] = useState<InitiativeByIdOp>("spec");
  const [waveId, setWaveId] = useState("");
  const [readoutArmed, setReadoutArmed] = useState(false);

  const list = useInitiativesList(applied);
  const selected = useMemo(
    () => list.initiatives.find((i) => i.initiativeId === selectedId) ?? null,
    [list.initiatives, selectedId],
  );

  const waves = useInitiativeOp(
    {
      initiativeId: selectedId,
      org: applied.org,
      repo: applied.repo,
      op: "waves",
    },
    { enabled: Boolean(selectedId) },
  );

  const readout = useInitiativeOp(
    {
      initiativeId: selectedId,
      org: applied.org,
      repo: applied.repo,
      op: readoutOp,
      waveId,
    },
    { enabled: readoutArmed && Boolean(selectedId) },
  );

  const startClosure = useStartClosure();
  const [closureForm, setClosureForm] = useState({
    initiative_id: "",
    epic_ticket_id: "",
    wave_ticket_ids: "",
    workspace: "",
    branch_slug: "",
    base_branch: "develop",
    runner: "",
    model_id: "",
    org: "",
    repo: "",
  });
  const [closureAck, setClosureAck] = useState<string | null>(null);

  function patchClosure(key: keyof typeof closureForm, value: string) {
    setClosureForm((prev) => ({ ...prev, [key]: value }));
  }

  function selectInitiative(item: InitiativeSummary) {
    setSelectedId(item.initiativeId);
    setReadoutArmed(false);
    setClosureForm((prev) => ({
      ...prev,
      initiative_id: item.initiativeId,
      epic_ticket_id: item.epicTicketId ?? prev.epic_ticket_id,
      org: applied.org || prev.org,
      repo: applied.repo || prev.repo,
    }));
  }

  return (
    <div className="space-y-6">
      <Card>
        <h2 className="mb-4 font-medium">{t("filters.title")}</h2>
        <form
          className="grid max-w-2xl gap-3 md:grid-cols-2"
          onSubmit={(e) => {
            e.preventDefault();
            setApplied({ ...filters });
            setSelectedId(null);
            setReadoutArmed(false);
          }}
        >
          <div className="space-y-1">
            <Label htmlFor="init-org">{t("filters.org")}</Label>
            <Input
              id="init-org"
              value={filters.org}
              onChange={(e) => setFilters((p) => ({ ...p, org: e.target.value }))}
            />
          </div>
          <div className="space-y-1">
            <Label htmlFor="init-repo">{t("filters.repo")}</Label>
            <Input
              id="init-repo"
              value={filters.repo}
              onChange={(e) => setFilters((p) => ({ ...p, repo: e.target.value }))}
            />
          </div>
          <div className="md:col-span-2">
            <Button type="submit">{t("filters.apply")}</Button>
          </div>
        </form>
      </Card>

      <Card>
        <h2 className="mb-4 font-medium">{t("list.title")}</h2>
        {list.isLoading ? (
          <p className="text-sm text-muted-foreground">{t("loading")}</p>
        ) : list.error ? (
          <p className="text-sm text-danger">{list.error.message}</p>
        ) : !applied.org || !applied.repo ? (
          <p className="text-sm text-muted-foreground">{t("detail.selectPrompt")}</p>
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
                  <tr key={item.initiativeId} className="border-b border-border/60">
                    <td className="py-2 pr-3 font-mono text-xs">{item.initiativeId}</td>
                    <td className="py-2 pr-3">{item.name}</td>
                    <td className="py-2 pr-3">{gapText(item.currentStage, t)}</td>
                    <td className="py-2 pr-3">{gapText(item.prdApproval, t)}</td>
                    <td className="py-2">
                      <Button
                        type="button"
                        variant="outline"
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
      </Card>

      <Card>
        <h2 className="mb-4 font-medium">{t("detail.title")}</h2>
        <DetailPanel item={selected} org={applied.org} repo={applied.repo} t={t} />
      </Card>

      <Card>
        <h2 className="mb-4 font-medium">{t("waves.title")}</h2>
        {!selectedId ? (
          <p className="text-sm text-muted-foreground">{t("detail.selectPrompt")}</p>
        ) : waves.isLoading ? (
          <p className="text-sm text-muted-foreground">{t("loading")}</p>
        ) : waves.error ? (
          <p className="text-sm text-danger">{waves.error.message}</p>
        ) : (
          <WaveRows data={waves.payload?.data} t={t} />
        )}
      </Card>

      <Card>
        <h2 className="mb-4 font-medium">{t("readout.title")}</h2>
        <form
          className="mb-4 grid max-w-3xl gap-3 md:grid-cols-2"
          onSubmit={(e) => {
            e.preventDefault();
            setReadoutArmed(true);
          }}
        >
          <div className="space-y-1">
            <Label htmlFor="readout-op">{t("readout.op")}</Label>
            <select
              id="readout-op"
              className="flex h-9 w-full rounded-md border border-border bg-background px-3 text-sm"
              value={readoutOp}
              onChange={(e) => {
                setReadoutOp(e.target.value as InitiativeByIdOp);
                setReadoutArmed(false);
              }}
            >
              {READOUT_OPS.map((op) => (
                <option key={op} value={op}>
                  {t(`readout.op.${op}`)}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-1">
            <Label htmlFor="readout-wave">{t("readout.waveId")}</Label>
            <Input
              id="readout-wave"
              value={waveId}
              onChange={(e) => {
                setWaveId(e.target.value);
                setReadoutArmed(false);
              }}
            />
          </div>
          <div className="md:col-span-2">
            <Button type="submit" disabled={!selectedId}>
              {t("readout.load")}
            </Button>
          </div>
        </form>
        {readoutArmed && readout.isLoading ? (
          <p className="text-sm text-muted-foreground">{t("loading")}</p>
        ) : readoutArmed && readout.error ? (
          <p className="text-sm text-danger">{readout.error.message}</p>
        ) : readoutArmed ? (
          <JsonReadout data={readout.payload?.data} t={t} />
        ) : (
          <p className="text-sm text-muted-foreground">{t("readout.empty")}</p>
        )}
      </Card>

      <Card>
        <h2 className="mb-2 font-medium">{t("closure.title")}</h2>
        <p className="mb-4 text-sm text-muted-foreground">{t("closure.hint")}</p>
        <form
          className="grid max-w-3xl gap-3 md:grid-cols-2"
          onSubmit={(e) => {
            e.preventDefault();
            setClosureAck(null);
            startClosure.mutate(
              {
                initiative_id: closureForm.initiative_id.trim(),
                epic_ticket_id: closureForm.epic_ticket_id.trim(),
                wave_ticket_ids: parseWaveTicketIds(closureForm.wave_ticket_ids),
                workspace: closureForm.workspace.trim(),
                branch_slug: closureForm.branch_slug.trim(),
                base_branch: closureForm.base_branch.trim(),
                runner: closureForm.runner.trim(),
                model_id: closureForm.model_id.trim(),
                org: closureForm.org.trim(),
                repo: closureForm.repo.trim(),
              },
              {
                onSuccess: (result) => {
                  setClosureAck(`${t("closure.success")} ${result.runId}`);
                },
              },
            );
          }}
        >
          {(
            [
              ["initiative_id", "closure.initiativeId"],
              ["epic_ticket_id", "closure.epicTicketId"],
              ["wave_ticket_ids", "closure.waveTicketIds"],
              ["workspace", "closure.workspace"],
              ["branch_slug", "closure.branchSlug"],
              ["base_branch", "closure.baseBranch"],
              ["runner", "closure.runner"],
              ["model_id", "closure.modelId"],
              ["org", "closure.org"],
              ["repo", "closure.repo"],
            ] as const
          ).map(([key, labelKey]) => (
            <div key={key} className="space-y-1">
              <Label htmlFor={`closure-${key}`}>{t(labelKey)}</Label>
              <Input
                id={`closure-${key}`}
                value={closureForm[key]}
                onChange={(e) => patchClosure(key, e.target.value)}
              />
            </div>
          ))}
          <div className="md:col-span-2 space-y-2">
            <Button type="submit" disabled={startClosure.isPending}>
              {t("closure.submit")}
            </Button>
            {startClosure.error ? (
              <p className="text-sm text-danger">{startClosure.error.message}</p>
            ) : null}
            {closureAck ? <p className="text-sm text-ok">{closureAck}</p> : null}
          </div>
        </form>
      </Card>
    </div>
  );
}
