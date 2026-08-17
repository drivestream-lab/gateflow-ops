"use client";

import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { LaneStartDialog } from "@/components/lanes/lane-start-dialog";
import { RunnerModelFields } from "@/components/lanes/runner-model-fields";
import { useInitiativeOp } from "@/hooks/use-initiatives";
import { useMetaPrPicker } from "@/hooks/use-meta-pr-picker";
import { useStartWave } from "@/hooks/use-runs";
import { useTenant } from "@/hooks/use-tenant";
import { fleetRepoKey } from "@/lib/fleet-rows";
import { useTranslation } from "@/lib/i18n";
import {
  buildSpecStartBody,
  canStartSpec,
  classifySpecLaneStatus,
  specRunForRepo,
  type MetaPrPickerItem,
} from "@/lib/meta-pr-picker";

const selectClass = "flex h-9 w-full rounded-md border border-border bg-background px-3 text-sm";

function asRecord(data: unknown): Record<string, unknown> | null {
  if (data && typeof data === "object" && !Array.isArray(data)) {
    return data as Record<string, unknown>;
  }
  return null;
}

function SpecPrCell({
  initiativeId,
  org,
  repo,
  specRunId,
}: {
  initiativeId: string;
  org: string;
  repo: string;
  specRunId: string | null;
}) {
  const spec = useInitiativeOp(
    { initiativeId, org, repo, op: "spec" },
    { enabled: Boolean(specRunId && org && repo) },
  );
  const rec = asRecord(spec.payload?.data);
  const number = rec?.draft_spec_pr_number;
  const url = rec?.draft_spec_pr_url;
  if (typeof number === "number" && number > 0) {
    if (typeof url === "string" && url) {
      return (
        <a className="text-accent underline" href={url} rel="noreferrer" target="_blank">
          #{number}
        </a>
      );
    }
    return <span className="font-mono text-xs">#{number}</span>;
  }
  return <span className="text-muted-foreground">—</span>;
}

function SpecStatusCell({
  initiativeId,
  org,
  repo,
  specRunId,
}: {
  initiativeId: string;
  org: string;
  repo: string;
  specRunId: string | null;
}) {
  const { t } = useTranslation("spec-lane");
  const spec = useInitiativeOp(
    { initiativeId, org, repo, op: "spec" },
    { enabled: Boolean(specRunId && org && repo) },
  );
  const rec = asRecord(spec.payload?.data);
  const status = classifySpecLaneStatus({
    specRunId,
    workflowNode: typeof rec?.workflow_node === "string" ? rec.workflow_node : null,
    nextStepNodeId: typeof rec?.next_step_node_id === "string" ? rec.next_step_node_id : null,
  });
  return <span>{t(`status.${status}`)}</span>;
}

export function SpecLaneTable() {
  const { t } = useTranslation("spec-lane");
  const { t: ti } = useTranslation("initiatives");
  const tenant = useTenant();
  const picker = useMetaPrPicker({ scope: "onboarded" });
  const startWave = useStartWave();
  const repos = useMemo(() => tenant.tenant?.repos ?? [], [tenant.tenant?.repos]);
  const [repoByInitiative, setRepoByInitiative] = useState<Record<string, string>>({});
  const [dialogItem, setDialogItem] = useState<MetaPrPickerItem | null>(null);
  const [dialogRepo, setDialogRepo] = useState<{ org: string; repo: string } | null>(null);
  const [runner, setRunner] = useState("");
  const [modelId, setModelId] = useState("");

  function repoFor(item: MetaPrPickerItem): { org: string; repo: string } | null {
    const selected = repoByInitiative[item.initiativeId];
    if (selected) {
      const match = repos.find((row) => fleetRepoKey(row.org, row.repo) === selected);
      if (match) return match;
    }
    return repos[0] ?? null;
  }

  function openStart(item: MetaPrPickerItem) {
    const chosen = repoFor(item);
    if (!chosen) return;
    setDialogItem(item);
    setDialogRepo(chosen);
    setRunner("");
    setModelId("");
  }

  function submitSpec() {
    if (!dialogItem || !dialogRepo) return;
    startWave.mutate(
      {
        lane: "spec",
        body: buildSpecStartBody({
          initiativeId: dialogItem.initiativeId,
          org: dialogRepo.org,
          repo: dialogRepo.repo,
          metaPrUrl: dialogItem.htmlUrl,
          baseBranch: "develop",
          runner: runner.trim(),
          modelId: modelId.trim(),
        }),
      },
      {
        onSuccess: () => {
          setDialogItem(null);
          setDialogRepo(null);
          void picker.refetch();
        },
      },
    );
  }

  if (repos.length === 0 && !tenant.isLoading) {
    return <p className="text-sm text-muted-foreground">{t("emptyFleet")}</p>;
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
        <table className="w-full min-w-[48rem] text-left text-sm">
          <thead>
            <tr className="border-b border-border text-muted-foreground">
              <th className="py-2 pr-3 font-medium">{t("columns.initiative")}</th>
              <th className="py-2 pr-3 font-medium">{t("columns.repo")}</th>
              <th className="py-2 pr-3 font-medium">{t("columns.prdPr")}</th>
              <th className="py-2 pr-3 font-medium">{t("columns.specPr")}</th>
              <th className="py-2 pr-3 font-medium">{t("columns.status")}</th>
              <th className="py-2 font-medium">{t("columns.action")}</th>
            </tr>
          </thead>
          <tbody>
            {picker.picker.items.map((item) => {
              const chosen = repoFor(item);
              const specRunId = chosen ? specRunForRepo(item, chosen.org, chosen.repo) : null;
              const startable = chosen ? canStartSpec(item, chosen.org, chosen.repo) : false;
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
                  <td className="py-2 pr-3">
                    {chosen ? (
                      <SpecPrCell
                        initiativeId={item.initiativeId}
                        org={chosen.org}
                        repo={chosen.repo}
                        specRunId={specRunId}
                      />
                    ) : (
                      "—"
                    )}
                  </td>
                  <td className="py-2 pr-3">
                    {chosen ? (
                      <SpecStatusCell
                        initiativeId={item.initiativeId}
                        org={chosen.org}
                        repo={chosen.repo}
                        specRunId={specRunId}
                      />
                    ) : (
                      t("status.not_started")
                    )}
                  </td>
                  <td className="py-2">
                    <Button
                      type="button"
                      size="sm"
                      disabled={!startable}
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
          pending={startWave.isPending}
          error={startWave.error instanceof Error ? startWave.error.message : null}
          onClose={() => {
            setDialogItem(null);
            setDialogRepo(null);
          }}
          onSubmit={submitSpec}
        >
          <div className="space-y-1">
            <Label htmlFor="spec-initiative">{ti("picker.initiativeId")}</Label>
            <Input id="spec-initiative" value={dialogItem.initiativeId} readOnly />
          </div>
          <div className="space-y-1">
            <Label htmlFor="spec-prd">{t("columns.prdPr")}</Label>
            <Input id="spec-prd" value={`#${dialogItem.number}`} readOnly />
          </div>
          <div className="md:col-span-2 space-y-1">
            <Label htmlFor="spec-repo">{t("columns.repo")}</Label>
            <Input id="spec-repo" value={fleetRepoKey(dialogRepo.org, dialogRepo.repo)} readOnly />
          </div>
          <RunnerModelFields
            idPrefix="spec-lane"
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
