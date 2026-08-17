"use client";

import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { LaneStartDialog } from "@/components/lanes/lane-start-dialog";
import { RunnerModelFields } from "@/components/lanes/runner-model-fields";
import {
  classifyWaveMapStatus,
  compositionGapLabel,
  useInitiativeOp,
  type WaveMapStatus,
} from "@/hooks/use-initiatives";
import { useMetaPrPicker } from "@/hooks/use-meta-pr-picker";
import { useStartWave } from "@/hooks/use-runs";
import { useTenant } from "@/hooks/use-tenant";
import { deriveRepoWorkspacePath } from "@/lib/initiative-derive";
import { fleetRepoKey } from "@/lib/fleet-rows";
import { useTranslation } from "@/lib/i18n";
import type { MetaPrPickerItem } from "@/lib/meta-pr-picker";

const selectClass = "flex h-9 w-full rounded-md border border-border bg-background px-3 text-sm";

function asRecord(data: unknown): Record<string, unknown> | null {
  if (data && typeof data === "object" && !Array.isArray(data)) {
    return data as Record<string, unknown>;
  }
  return null;
}

function gapText(value: unknown, emptyLabel: string): string {
  const gap = compositionGapLabel(value);
  if (gap === "unavailable" || gap === "empty") return emptyLabel;
  if (typeof value === "string") return value;
  return String(value);
}

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

interface WaveStartTarget {
  item: MetaPrPickerItem;
  org: string;
  repo: string;
  waveId: string;
  ticketId: string;
  prNumber?: number;
}

export function WaveLaneTable({ mode }: { mode: "implement" | "closeout" }) {
  const { t } = useTranslation(mode === "implement" ? "implement-lane" : "closeout-lane");
  const { t: ti } = useTranslation("initiatives");
  const tenant = useTenant();
  const picker = useMetaPrPicker({ scope: "onboarded" });
  const startWave = useStartWave();
  const repos = useMemo(() => tenant.tenant?.repos ?? [], [tenant.tenant?.repos]);
  const [repoByInitiative, setRepoByInitiative] = useState<Record<string, string>>({});
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [dialog, setDialog] = useState<WaveStartTarget | null>(null);
  const [runner, setRunner] = useState("");
  const [modelId, setModelId] = useState("");

  const selectedItem =
    picker.picker?.items.find((item) => item.initiativeId === selectedId) ?? null;
  const selectedRepoKey = selectedItem ? repoByInitiative[selectedItem.initiativeId] : "";
  const selectedRepo =
    repos.find((row) => fleetRepoKey(row.org, row.repo) === selectedRepoKey) ?? repos[0] ?? null;

  const waves = useInitiativeOp(
    {
      initiativeId: selectedItem?.initiativeId ?? null,
      org: selectedRepo?.org ?? "",
      repo: selectedRepo?.repo ?? "",
      op: "waves",
    },
    { enabled: Boolean(selectedItem && selectedRepo) },
  );
  const implementation = useInitiativeOp(
    {
      initiativeId: selectedItem?.initiativeId ?? null,
      org: selectedRepo?.org ?? "",
      repo: selectedRepo?.repo ?? "",
      op: "implementation",
      waveId: dialog?.waveId,
    },
    { enabled: mode === "closeout" && Boolean(dialog?.waveId && selectedItem && selectedRepo) },
  );

  function repoFor(item: MetaPrPickerItem) {
    const selected = repoByInitiative[item.initiativeId];
    if (selected) {
      const match = repos.find((row) => fleetRepoKey(row.org, row.repo) === selected);
      if (match) return match;
    }
    return repos[0] ?? null;
  }

  function openStart(waveId: string, ticketId: string) {
    if (!selectedItem || !selectedRepo) return;
    const impl = asRecord(implementation.payload?.data);
    const prNumber = typeof impl?.draft_pr_number === "number" ? impl.draft_pr_number : undefined;
    setDialog({
      item: selectedItem,
      org: selectedRepo.org,
      repo: selectedRepo.repo,
      waveId,
      ticketId,
      prNumber,
    });
    setRunner("");
    setModelId("");
  }

  function submit() {
    if (!dialog) return;
    if (mode === "implement") {
      startWave.mutate(
        {
          lane: "implement",
          body: {
            org: dialog.org,
            repo: dialog.repo,
            initiative_id: dialog.item.initiativeId,
            wave_id: dialog.waveId,
            ticket_id: dialog.ticketId,
            base_branch: "develop",
            runner: runner.trim(),
            model_id: modelId.trim(),
          },
        },
        { onSuccess: () => setDialog(null) },
      );
      return;
    }
    const impl = asRecord(implementation.payload?.data);
    const prNumber =
      typeof impl?.draft_pr_number === "number" ? impl.draft_pr_number : dialog.prNumber;
    const workspacePath = deriveRepoWorkspacePath(
      tenant.tenant?.workspaceRoot,
      dialog.org,
      dialog.repo,
    );
    if (!prNumber || !workspacePath) return;
    startWave.mutate(
      {
        lane: "closeout",
        body: {
          org: dialog.org,
          repo: dialog.repo,
          initiative_id: dialog.item.initiativeId,
          wave_id: dialog.waveId,
          ticket_id: dialog.ticketId,
          pr_number: prNumber,
          workspace_path: workspacePath,
          base_branch: "develop",
          runner: runner.trim(),
          model_id: modelId.trim(),
        },
      },
      { onSuccess: () => setDialog(null) },
    );
  }

  const waveRows = Array.isArray(asRecord(waves.payload?.data)?.waves)
    ? (asRecord(waves.payload?.data)?.waves as unknown[])
    : [];

  if (repos.length === 0 && !tenant.isLoading) {
    return <p className="text-sm text-muted-foreground">{ti("filters.emptyFleet")}</p>;
  }
  if (picker.isLoading) {
    return <p className="text-sm text-muted-foreground">{ti("picker.loading")}</p>;
  }
  if (picker.error) {
    return <p className="text-sm text-danger">{picker.error.message}</p>;
  }
  if (!picker.picker || picker.picker.items.length === 0) {
    return <p className="text-sm text-muted-foreground">{ti("picker.emptyOnboarded")}</p>;
  }

  return (
    <div className="space-y-6">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[36rem] text-left text-sm">
          <thead>
            <tr className="border-b border-border text-muted-foreground">
              <th className="py-2 pr-3 font-medium">{ti("list.columns.id")}</th>
              <th className="py-2 pr-3 font-medium">{ti("filters.repo")}</th>
              <th className="py-2 font-medium">{ti("picker.columns.pr")}</th>
            </tr>
          </thead>
          <tbody>
            {picker.picker.items.map((item) => {
              const chosen = repoFor(item);
              const selected = item.initiativeId === selectedId;
              return (
                <tr
                  key={item.number}
                  className={
                    selected ? "border-b border-border bg-muted" : "border-b border-border/60"
                  }
                >
                  <td className="py-2 pr-3">
                    <button
                      type="button"
                      className="font-mono text-xs underline"
                      onClick={() => {
                        setSelectedId(item.initiativeId);
                        if (chosen) {
                          setRepoByInitiative((prev) => ({
                            ...prev,
                            [item.initiativeId]: fleetRepoKey(chosen.org, chosen.repo),
                          }));
                        }
                      }}
                    >
                      {item.initiativeId}
                    </button>
                  </td>
                  <td className="py-2 pr-3">
                    <select
                      className={selectClass}
                      value={chosen ? fleetRepoKey(chosen.org, chosen.repo) : ""}
                      onChange={(e) => {
                        setRepoByInitiative((prev) => ({
                          ...prev,
                          [item.initiativeId]: e.target.value,
                        }));
                        setSelectedId(item.initiativeId);
                      }}
                    >
                      {repos.map((row) => (
                        <option
                          key={fleetRepoKey(row.org, row.repo)}
                          value={fleetRepoKey(row.org, row.repo)}
                        >
                          {fleetRepoKey(row.org, row.repo)}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="py-2">
                    <a
                      className="text-accent underline"
                      href={item.htmlUrl}
                      rel="noreferrer"
                      target="_blank"
                    >
                      #{item.number}
                    </a>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {!selectedItem || !selectedRepo ? (
        <p className="text-sm text-muted-foreground">{ti("detail.selectPrompt")}</p>
      ) : waves.isLoading ? (
        <p className="text-sm text-muted-foreground">{ti("loading")}</p>
      ) : waves.error ? (
        <p className="text-sm text-danger">{waves.error.message}</p>
      ) : waveRows.length === 0 ? (
        <p className="text-sm text-muted-foreground">{ti("waves.empty")}</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[40rem] text-left text-sm">
            <thead>
              <tr className="border-b border-border text-muted-foreground">
                <th className="py-2 pr-3 font-medium">{ti("waves.columns.wave")}</th>
                <th className="py-2 pr-3 font-medium">{ti("waves.columns.status")}</th>
                <th className="py-2 pr-3 font-medium">{ti("waves.columns.ticket")}</th>
                <th className="py-2 font-medium">{ti("waves.columns.action")}</th>
              </tr>
            </thead>
            <tbody>
              {waveRows.map((row) => {
                const w = asRecord(row) ?? {};
                const waveId = String(w.wave_id ?? "");
                const status = classifyWaveMapStatus(
                  typeof w.status === "string" ? w.status : null,
                );
                const ticketId = w.ticket_id == null ? "" : String(w.ticket_id);
                const startable =
                  mode === "implement" ? status !== "done" && Boolean(ticketId) : Boolean(ticketId);
                return (
                  <tr key={waveId || JSON.stringify(row)} className="border-b border-border/60">
                    <td className="py-2 pr-3 font-mono text-xs">
                      {waveId || ti("list.gap.empty")}
                    </td>
                    <td className={`py-2 pr-3 ${waveStatusClass(status)}`}>
                      {ti(`waves.status.${status}`)}
                    </td>
                    <td className="py-2 pr-3">{gapText(w.ticket_id, ti("list.gap.empty"))}</td>
                    <td className="py-2">
                      <Button
                        type="button"
                        size="sm"
                        disabled={!startable}
                        onClick={() => openStart(waveId, ticketId)}
                      >
                        {t("start")}
                      </Button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {dialog ? (
        <LaneStartDialog
          title={t("dialog.title")}
          submitLabel={t("dialog.submit")}
          pending={startWave.isPending}
          error={startWave.error instanceof Error ? startWave.error.message : null}
          onClose={() => setDialog(null)}
          onSubmit={submit}
        >
          <div className="space-y-1">
            <Label htmlFor={`${mode}-initiative`}>{ti("picker.initiativeId")}</Label>
            <Input id={`${mode}-initiative`} value={dialog.item.initiativeId} readOnly />
          </div>
          <div className="space-y-1">
            <Label htmlFor={`${mode}-wave`}>{ti("waves.columns.wave")}</Label>
            <Input id={`${mode}-wave`} value={dialog.waveId} readOnly />
          </div>
          <div className="md:col-span-2 space-y-1">
            <Label htmlFor={`${mode}-ticket`}>{ti("waves.columns.ticket")}</Label>
            <Input id={`${mode}-ticket`} value={dialog.ticketId} readOnly />
          </div>
          <RunnerModelFields
            idPrefix={mode}
            runner={runner}
            modelId={modelId}
            onRunnerChange={setRunner}
            onModelChange={setModelId}
          />
        </LaneStartDialog>
      ) : null}
    </div>
  );
}
