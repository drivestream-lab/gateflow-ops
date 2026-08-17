"use client";

import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { LaneStartDialog } from "@/components/lanes/lane-start-dialog";
import { RunnerModelFields } from "@/components/lanes/runner-model-fields";
import { useInitiativeOp, useInitiativesList, useStartClosure } from "@/hooks/use-initiatives";
import { useMetaPrPicker } from "@/hooks/use-meta-pr-picker";
import { useTenant } from "@/hooks/use-tenant";
import {
  deriveRepoWorkspacePath,
  fleetRepoKey,
  waveTicketIdsFromMap,
} from "@/lib/initiative-derive";
import { useTranslation } from "@/lib/i18n";
import type { MetaPrPickerItem } from "@/lib/meta-pr-picker";

const selectClass = "flex h-9 w-full rounded-md border border-border bg-background px-3 text-sm";

export function ClosureLaneTable() {
  const { t } = useTranslation("initiative-closure");
  const { t: ti } = useTranslation("initiatives");
  const tenant = useTenant();
  const picker = useMetaPrPicker({ scope: "onboarded" });
  const startClosure = useStartClosure();
  const repos = useMemo(() => tenant.tenant?.repos ?? [], [tenant.tenant?.repos]);
  const [repoByInitiative, setRepoByInitiative] = useState<Record<string, string>>({});
  const [dialogItem, setDialogItem] = useState<MetaPrPickerItem | null>(null);
  const [dialogRepo, setDialogRepo] = useState<{ org: string; repo: string } | null>(null);
  const [runner, setRunner] = useState("");
  const [modelId, setModelId] = useState("");
  const [localError, setLocalError] = useState<string | null>(null);

  function repoFor(item: MetaPrPickerItem) {
    const selected = repoByInitiative[item.initiativeId];
    if (selected) {
      const match = repos.find((row) => fleetRepoKey(row.org, row.repo) === selected);
      if (match) return match;
    }
    return repos[0] ?? null;
  }

  const list = useInitiativesList(
    { org: dialogRepo?.org ?? "", repo: dialogRepo?.repo ?? "" },
    { enabled: Boolean(dialogRepo) },
  );
  const waves = useInitiativeOp(
    {
      initiativeId: dialogItem?.initiativeId ?? null,
      org: dialogRepo?.org ?? "",
      repo: dialogRepo?.repo ?? "",
      op: "waves",
    },
    { enabled: Boolean(dialogItem && dialogRepo) },
  );

  function openStart(item: MetaPrPickerItem) {
    const chosen = repoFor(item);
    if (!chosen) return;
    setDialogItem(item);
    setDialogRepo(chosen);
    setRunner("");
    setModelId("");
    setLocalError(null);
  }

  function submit() {
    if (!dialogItem || !dialogRepo) return;
    const summary = list.initiatives.find((row) => row.initiativeId === dialogItem.initiativeId);
    const ticketIds = waveTicketIdsFromMap(waves.payload?.data);
    const workspacePath = deriveRepoWorkspacePath(
      tenant.tenant?.workspaceRoot,
      dialogRepo.org,
      dialogRepo.repo,
    );
    setLocalError(null);
    if (!summary?.epicTicketId) {
      setLocalError(ti("errors.missingEpic"));
      return;
    }
    if (ticketIds.length === 0) {
      setLocalError(ti("errors.missingWaveTickets"));
      return;
    }
    if (!workspacePath) {
      setLocalError(ti("errors.missingWorkspace"));
      return;
    }
    startClosure.mutate(
      {
        initiative_id: dialogItem.initiativeId,
        epic_ticket_id: summary.epicTicketId,
        wave_ticket_ids: ticketIds,
        workspace: workspacePath,
        branch_slug: "closure",
        base_branch: "develop",
        runner: runner.trim(),
        model_id: modelId.trim(),
        org: dialogRepo.org,
        repo: dialogRepo.repo,
      },
      { onSuccess: () => setDialogItem(null) },
    );
  }

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
    <div className="space-y-4">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[36rem] text-left text-sm">
          <thead>
            <tr className="border-b border-border text-muted-foreground">
              <th className="py-2 pr-3 font-medium">{ti("list.columns.id")}</th>
              <th className="py-2 pr-3 font-medium">{ti("filters.repo")}</th>
              <th className="py-2 pr-3 font-medium">{ti("picker.columns.pr")}</th>
              <th className="py-2 font-medium">{ti("waves.columns.action")}</th>
            </tr>
          </thead>
          <tbody>
            {picker.picker.items.map((item) => {
              const chosen = repoFor(item);
              return (
                <tr key={item.number} className="border-b border-border/60">
                  <td className="py-2 pr-3 font-mono text-xs">{item.initiativeId}</td>
                  <td className="py-2 pr-3">
                    <select
                      className={selectClass}
                      value={chosen ? fleetRepoKey(chosen.org, chosen.repo) : ""}
                      onChange={(e) =>
                        setRepoByInitiative((prev) => ({
                          ...prev,
                          [item.initiativeId]: e.target.value,
                        }))
                      }
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
                  <td className="py-2 pr-3">
                    <a
                      className="text-accent underline"
                      href={item.htmlUrl}
                      rel="noreferrer"
                      target="_blank"
                    >
                      #{item.number}
                    </a>
                  </td>
                  <td className="py-2">
                    <Button
                      type="button"
                      size="sm"
                      disabled={!chosen}
                      onClick={() => openStart(item)}
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

      {dialogItem && dialogRepo ? (
        <LaneStartDialog
          title={t("dialog.title")}
          submitLabel={t("dialog.submit")}
          pending={startClosure.isPending}
          error={
            localError ?? (startClosure.error instanceof Error ? startClosure.error.message : null)
          }
          onClose={() => setDialogItem(null)}
          onSubmit={submit}
        >
          <div className="space-y-1">
            <Label htmlFor="closure-initiative">{ti("picker.initiativeId")}</Label>
            <Input id="closure-initiative" value={dialogItem.initiativeId} readOnly />
          </div>
          <div className="space-y-1">
            <Label htmlFor="closure-repo">{ti("filters.repo")}</Label>
            <Input
              id="closure-repo"
              value={fleetRepoKey(dialogRepo.org, dialogRepo.repo)}
              readOnly
            />
          </div>
          <RunnerModelFields
            idPrefix="closure"
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
