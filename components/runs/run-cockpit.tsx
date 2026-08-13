"use client";

import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  classifyRunStopPresentation,
  isForgeAuthorizeEligible,
  useForgeAuthorize,
  useRunDetail,
  useRunsList,
  useStartWave,
  type WaveLane,
} from "@/hooks/use-runs";
import { useTranslation } from "@/lib/i18n";

function stopClass(kind: ReturnType<typeof classifyRunStopPresentation>): string {
  switch (kind) {
    case "human_checkpoint":
      return "text-sm font-semibold text-accent";
    case "failure":
      return "text-sm font-semibold text-danger";
    case "complete":
      return "text-sm font-semibold text-ok";
    case "active":
      return "text-sm font-semibold text-foreground";
    default:
      return "text-sm text-muted-foreground";
  }
}

export function RunCockpit() {
  const { t } = useTranslation("runs");
  const [filters, setFilters] = useState({
    initiative_id: "",
    wave_id: "",
    status_type: "",
    org: "",
    repo: "",
  });
  const [applied, setApplied] = useState(filters);
  const [selectedRunId, setSelectedRunId] = useState<string | null>(null);

  const list = useRunsList(applied);
  const detail = useRunDetail(selectedRunId);
  const startWave = useStartWave();
  const forge = useForgeAuthorize();

  const [lane, setLane] = useState<WaveLane>("implement");
  const [startForm, setStartForm] = useState({
    initiative_id: "",
    wave_id: "",
    branch_slug: "",
    base_branch: "develop",
    start_node: "",
    runner: "",
    model_id: "",
    org: "",
    repo: "",
    ticket_id: "",
    workspace_path: "",
    meta_pr_url: "",
    meta_workspace_path: "",
    pr_number: "",
  });
  const [startAck, setStartAck] = useState<string | null>(null);

  const [forgeForm, setForgeForm] = useState({
    workspace_path: "",
    head: "",
    base: "",
  });
  const [forgeAck, setForgeAck] = useState<string | null>(null);

  const stopKind = useMemo(
    () =>
      detail.run
        ? classifyRunStopPresentation(detail.run.statusType, detail.run.outcomeType)
        : null,
    [detail.run],
  );

  const forgeEligible = detail.run
    ? isForgeAuthorizeEligible(detail.run.statusType, detail.run.workflowNode)
    : false;

  function patchStart(key: keyof typeof startForm, value: string) {
    setStartForm((prev) => ({ ...prev, [key]: value }));
  }

  return (
    <div className="space-y-6">
      <Card>
        <h2 className="mb-4 font-medium">{t("start.title")}</h2>
        <form
          className="grid max-w-3xl gap-3 md:grid-cols-2"
          onSubmit={(e) => {
            e.preventDefault();
            setStartAck(null);
            const body: Record<string, unknown> = {
              initiative_id: startForm.initiative_id.trim(),
              wave_id: startForm.wave_id.trim(),
              base_branch: startForm.base_branch.trim(),
              runner: startForm.runner.trim(),
              model_id: startForm.model_id.trim(),
              org: startForm.org.trim(),
              repo: startForm.repo.trim(),
            };
            if (lane === "implement") {
              body.branch_slug = startForm.branch_slug.trim();
              body.start_node = startForm.start_node.trim();
              body.ticket_id = startForm.ticket_id.trim();
              if (startForm.workspace_path.trim()) {
                body.workspace_path = startForm.workspace_path.trim();
              }
            } else if (lane === "spec") {
              body.branch_slug = startForm.branch_slug.trim();
              body.start_node = startForm.start_node.trim();
              body.workspace_path = startForm.workspace_path.trim();
              body.meta_pr_url = startForm.meta_pr_url.trim();
              body.meta_workspace_path = startForm.meta_workspace_path.trim();
              if (startForm.ticket_id.trim()) body.ticket_id = startForm.ticket_id.trim();
            } else {
              body.ticket_id = startForm.ticket_id.trim();
              body.workspace_path = startForm.workspace_path.trim();
              body.pr_number = Number(startForm.pr_number);
            }
            startWave.mutate(
              { lane, body },
              {
                onSuccess: (result) => {
                  setStartAck(`${t("start.success")} ${result.runId}`);
                  setSelectedRunId(result.runId);
                },
              },
            );
          }}
        >
          <div className="space-y-1 md:col-span-2">
            <Label htmlFor="lane">{t("start.lane")}</Label>
            <select
              id="lane"
              className="flex h-9 w-full rounded-md border border-border bg-background px-3 text-sm"
              value={lane}
              onChange={(e) => setLane(e.target.value as WaveLane)}
            >
              <option value="implement">{t("start.lane.implement")}</option>
              <option value="spec">{t("start.lane.spec")}</option>
              <option value="closeout">{t("start.lane.closeout")}</option>
            </select>
          </div>
          {(
            [
              ["initiative_id", "start.initiativeId"],
              ["wave_id", "start.waveId"],
              ["org", "start.org"],
              ["repo", "start.repo"],
              ["base_branch", "start.baseBranch"],
              ["runner", "start.runner"],
              ["model_id", "start.modelId"],
            ] as const
          ).map(([key, label]) => (
            <div key={key} className="space-y-1">
              <Label htmlFor={`start-${key}`}>{t(label)}</Label>
              <Input
                id={`start-${key}`}
                value={startForm[key]}
                onChange={(e) => patchStart(key, e.target.value)}
                required
              />
            </div>
          ))}
          {lane !== "closeout" ? (
            <>
              <div className="space-y-1">
                <Label htmlFor="start-branch_slug">{t("start.branchSlug")}</Label>
                <Input
                  id="start-branch_slug"
                  value={startForm.branch_slug}
                  onChange={(e) => patchStart("branch_slug", e.target.value)}
                  required
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="start-start_node">{t("start.startNode")}</Label>
                <Input
                  id="start-start_node"
                  value={startForm.start_node}
                  onChange={(e) => patchStart("start_node", e.target.value)}
                  required
                />
              </div>
            </>
          ) : null}
          {lane === "implement" || lane === "closeout" ? (
            <div className="space-y-1">
              <Label htmlFor="start-ticket_id">{t("start.ticketId")}</Label>
              <Input
                id="start-ticket_id"
                value={startForm.ticket_id}
                onChange={(e) => patchStart("ticket_id", e.target.value)}
                required
              />
            </div>
          ) : null}
          {lane === "spec" || lane === "closeout" || lane === "implement" ? (
            <div className="space-y-1">
              <Label htmlFor="start-workspace_path">{t("start.workspacePath")}</Label>
              <Input
                id="start-workspace_path"
                value={startForm.workspace_path}
                onChange={(e) => patchStart("workspace_path", e.target.value)}
                required={lane !== "implement"}
              />
            </div>
          ) : null}
          {lane === "spec" ? (
            <>
              <div className="space-y-1">
                <Label htmlFor="start-meta_pr_url">{t("start.metaPrUrl")}</Label>
                <Input
                  id="start-meta_pr_url"
                  value={startForm.meta_pr_url}
                  onChange={(e) => patchStart("meta_pr_url", e.target.value)}
                  required
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="start-meta_workspace_path">{t("start.metaWorkspacePath")}</Label>
                <Input
                  id="start-meta_workspace_path"
                  value={startForm.meta_workspace_path}
                  onChange={(e) => patchStart("meta_workspace_path", e.target.value)}
                  required
                />
              </div>
            </>
          ) : null}
          {lane === "closeout" ? (
            <div className="space-y-1">
              <Label htmlFor="start-pr_number">{t("start.prNumber")}</Label>
              <Input
                id="start-pr_number"
                value={startForm.pr_number}
                onChange={(e) => patchStart("pr_number", e.target.value)}
                required
              />
            </div>
          ) : null}
          <div className="md:col-span-2">
            <Button type="submit" disabled={startWave.isPending}>
              {t("start.submit")}
            </Button>
          </div>
        </form>
        {startAck ? <p className="mt-2 text-sm text-ok">{startAck}</p> : null}
        {startWave.error ? (
          <p className="mt-2 text-sm text-danger" role="alert">
            {startWave.error.message}
          </p>
        ) : null}
      </Card>

      <Card>
        <h2 className="mb-4 font-medium">{t("filters.title")}</h2>
        <form
          className="grid max-w-3xl gap-3 md:grid-cols-3"
          onSubmit={(e) => {
            e.preventDefault();
            setApplied({ ...filters });
          }}
        >
          {(
            [
              ["initiative_id", "filters.initiativeId"],
              ["wave_id", "filters.waveId"],
              ["status_type", "filters.statusType"],
              ["org", "filters.org"],
              ["repo", "filters.repo"],
            ] as const
          ).map(([key, label]) => (
            <div key={key} className="space-y-1">
              <Label htmlFor={`filter-${key}`}>{t(label)}</Label>
              <Input
                id={`filter-${key}`}
                value={filters[key]}
                onChange={(e) => setFilters((prev) => ({ ...prev, [key]: e.target.value }))}
              />
            </div>
          ))}
          <div className="md:col-span-3">
            <Button type="submit">{t("filters.apply")}</Button>
          </div>
        </form>
      </Card>

      <Card>
        <h2 className="mb-4 font-medium">{t("list.title")}</h2>
        {list.isLoading ? (
          <p className="text-sm text-muted-foreground">{t("loading")}</p>
        ) : list.error ? (
          <p className="text-sm text-danger" role="alert">
            {list.error.message}
          </p>
        ) : list.items.length === 0 ? (
          <p className="text-sm text-muted-foreground">{t("list.empty")}</p>
        ) : (
          <ul className="divide-y divide-border">
            {list.items.map((item) => (
              <li
                key={item.runId}
                className="flex flex-wrap items-center justify-between gap-2 py-3 text-sm"
              >
                <div>
                  <p className="font-mono text-xs">{item.runId}</p>
                  <p className="text-muted-foreground">
                    {item.org}/{item.repo} · {item.statusType}
                    {item.initiativeId ? ` · ${item.initiativeId}` : ""}
                    {item.waveId ? `/${item.waveId}` : ""}
                  </p>
                </div>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={() => setSelectedRunId(item.runId)}
                >
                  {t("list.open")}
                </Button>
              </li>
            ))}
          </ul>
        )}
      </Card>

      <Card>
        <h2 className="mb-4 font-medium">{t("detail.title")}</h2>
        {!selectedRunId ? (
          <p className="text-sm text-muted-foreground">{t("detail.selectPrompt")}</p>
        ) : detail.isLoading ? (
          <p className="text-sm text-muted-foreground">{t("loading")}</p>
        ) : detail.error || !detail.run ? (
          <p className="text-sm text-danger" role="alert">
            {detail.error?.message ?? t("errors.detailFailed")}
          </p>
        ) : (
          <div className="space-y-4 text-sm">
            <dl className="grid grid-cols-[10rem_1fr] gap-y-2">
              <dt className="text-muted-foreground">{t("list.columns.runId")}</dt>
              <dd className="font-mono text-xs">{detail.run.runId}</dd>
              <dt className="text-muted-foreground">{t("list.columns.repo")}</dt>
              <dd>
                {detail.run.org}/{detail.run.repo}
              </dd>
              <dt className="text-muted-foreground">{t("list.columns.status")}</dt>
              <dd>
                <span
                  className={stopKind ? stopClass(stopKind) : undefined}
                  data-stop-presentation={stopKind ?? undefined}
                >
                  {stopKind ? t(`stop.${stopKind}`) : detail.run.statusType}
                  {` (${detail.run.statusType})`}
                </span>
              </dd>
              <dt className="text-muted-foreground">{t("detail.workflowNode")}</dt>
              <dd>{detail.run.workflowNode ?? "—"}</dd>
              <dt className="text-muted-foreground">{t("detail.outcome")}</dt>
              <dd>{detail.run.outcomeType ?? "—"}</dd>
              <dt className="text-muted-foreground">{t("detail.prNumber")}</dt>
              <dd>{detail.run.prNumber ?? "—"}</dd>
            </dl>

            <div>
              <h3 className="mb-2 font-medium">{t("detail.stages")}</h3>
              {!Array.isArray(detail.run.stages) || detail.run.stages.length === 0 ? (
                <p className="text-muted-foreground">{t("detail.stagesEmpty")}</p>
              ) : (
                <ul className="space-y-1 font-mono text-xs">
                  {detail.run.stages.map((stage, idx) => (
                    <li key={idx}>{JSON.stringify(stage)}</li>
                  ))}
                </ul>
              )}
            </div>

            <div>
              <h3 className="mb-2 font-medium">{t("detail.events")}</h3>
              {!Array.isArray(detail.run.events) || detail.run.events.length === 0 ? (
                <p className="text-muted-foreground">{t("detail.eventsEmpty")}</p>
              ) : (
                <ul className="space-y-1 font-mono text-xs">
                  {detail.run.events.map((event, idx) => (
                    <li key={idx}>{JSON.stringify(event)}</li>
                  ))}
                </ul>
              )}
            </div>

            <div className="border-t border-border pt-4">
              <h3 className="mb-2 font-medium">{t("forge.title")}</h3>
              <p className="mb-3 text-muted-foreground">{t("forge.hint")}</p>
              {!forgeEligible ? (
                <p className="text-sm text-muted-foreground">{t("forge.notEligible")}</p>
              ) : (
                <form
                  className="grid max-w-xl gap-3"
                  onSubmit={(e) => {
                    e.preventDefault();
                    setForgeAck(null);
                    if (!detail.run) return;
                    const body: Record<string, unknown> = {
                      authorized: true,
                      workspace_path: forgeForm.workspace_path.trim(),
                    };
                    if (forgeForm.head.trim()) body.head = forgeForm.head.trim();
                    if (forgeForm.base.trim()) body.base = forgeForm.base.trim();
                    forge.mutate(
                      { runId: detail.run.runId, body },
                      {
                        onSuccess: () => setForgeAck(t("forge.success")),
                      },
                    );
                  }}
                >
                  <div className="space-y-1">
                    <Label htmlFor="forge-workspace">{t("forge.workspacePath")}</Label>
                    <Input
                      id="forge-workspace"
                      value={forgeForm.workspace_path}
                      onChange={(e) =>
                        setForgeForm((prev) => ({ ...prev, workspace_path: e.target.value }))
                      }
                      required
                    />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="forge-head">{t("forge.head")}</Label>
                    <Input
                      id="forge-head"
                      value={forgeForm.head}
                      onChange={(e) => setForgeForm((prev) => ({ ...prev, head: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="forge-base">{t("forge.base")}</Label>
                    <Input
                      id="forge-base"
                      value={forgeForm.base}
                      onChange={(e) => setForgeForm((prev) => ({ ...prev, base: e.target.value }))}
                    />
                  </div>
                  <Button type="submit" disabled={forge.isPending}>
                    {t("forge.submit")}
                  </Button>
                </form>
              )}
              {forgeAck ? <p className="mt-2 text-sm text-ok">{forgeAck}</p> : null}
              {forge.error ? (
                <p className="mt-2 text-sm text-danger" role="alert">
                  {forge.error.message}
                </p>
              ) : null}
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}
