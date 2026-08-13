"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  classifyCheckpointMiss,
  isCheckpointHistoryEmpty,
  useCheckpointHistory,
  useCheckpointStatus,
  type CheckpointQueryMode,
} from "@/hooks/use-checkpoints";
import { useTranslation } from "@/lib/i18n";

function JsonBlock({ data }: { data: unknown }) {
  return (
    <pre className="mt-3 max-h-72 overflow-auto rounded-md border border-border bg-surface p-3 text-xs text-foreground">
      {JSON.stringify(data, null, 2)}
    </pre>
  );
}

export function CheckpointViews() {
  const { t } = useTranslation("checkpoints");
  const [mode, setMode] = useState<CheckpointQueryMode>("composed");
  const [statusForm, setStatusForm] = useState({
    checkpoint_id: "wave-acceptance",
    owner: "",
    repo: "",
    pr_number: "",
    initiative_id: "",
    wave_id: "",
  });
  const [statusApplied, setStatusApplied] = useState<typeof statusForm | null>(null);
  const [statusArmed, setStatusArmed] = useState(false);

  const [historyForm, setHistoryForm] = useState({
    owner: "",
    repo: "",
    pr_number: "",
    checkpoint_id: "",
  });
  const [historyApplied, setHistoryApplied] = useState<typeof historyForm | null>(null);
  const [historyArmed, setHistoryArmed] = useState(false);

  const status = useCheckpointStatus(
    {
      mode,
      checkpoint_id: statusApplied?.checkpoint_id ?? "",
      owner: statusApplied?.owner,
      repo: statusApplied?.repo,
      pr_number: statusApplied?.pr_number,
      initiative_id: statusApplied?.initiative_id,
      wave_id: statusApplied?.wave_id,
    },
    { enabled: statusArmed && Boolean(statusApplied) },
  );

  const history = useCheckpointHistory(
    {
      owner: historyApplied?.owner ?? "",
      repo: historyApplied?.repo ?? "",
      pr_number: historyApplied?.pr_number ?? "",
      checkpoint_id: historyApplied?.checkpoint_id,
    },
    { enabled: historyArmed && Boolean(historyApplied) },
  );

  const miss = status.error
    ? classifyCheckpointMiss(
        (status.error as Error & { status?: number }).status,
        status.error.message,
      )
    : null;

  return (
    <div className="space-y-6">
      <Card>
        <h2 className="mb-4 font-medium">{t("status.title")}</h2>
        <form
          className="grid max-w-3xl gap-3 md:grid-cols-2"
          onSubmit={(e) => {
            e.preventDefault();
            setStatusApplied({ ...statusForm });
            setStatusArmed(true);
          }}
        >
          <div className="space-y-1 md:col-span-2">
            <Label htmlFor="cp-mode">{t("status.mode")}</Label>
            <select
              id="cp-mode"
              className="flex h-9 w-full rounded-md border border-border bg-background px-3 text-sm"
              value={mode}
              onChange={(e) => {
                setMode(e.target.value as CheckpointQueryMode);
                setStatusArmed(false);
              }}
            >
              <option value="composed">{t("status.mode.composed")}</option>
              <option value="raw">{t("status.mode.raw")}</option>
            </select>
          </div>
          <div className="space-y-1 md:col-span-2">
            <Label htmlFor="cp-id">{t("status.checkpointId")}</Label>
            <Input
              id="cp-id"
              value={statusForm.checkpoint_id}
              onChange={(e) => setStatusForm((p) => ({ ...p, checkpoint_id: e.target.value }))}
            />
          </div>
          {mode === "composed" ? (
            <>
              <div className="space-y-1">
                <Label htmlFor="cp-init">{t("status.initiativeId")}</Label>
                <Input
                  id="cp-init"
                  value={statusForm.initiative_id}
                  onChange={(e) => setStatusForm((p) => ({ ...p, initiative_id: e.target.value }))}
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="cp-wave">{t("status.waveId")}</Label>
                <Input
                  id="cp-wave"
                  value={statusForm.wave_id}
                  onChange={(e) => setStatusForm((p) => ({ ...p, wave_id: e.target.value }))}
                />
              </div>
            </>
          ) : (
            <>
              <div className="space-y-1">
                <Label htmlFor="cp-owner">{t("status.owner")}</Label>
                <Input
                  id="cp-owner"
                  value={statusForm.owner}
                  onChange={(e) => setStatusForm((p) => ({ ...p, owner: e.target.value }))}
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="cp-repo">{t("status.repo")}</Label>
                <Input
                  id="cp-repo"
                  value={statusForm.repo}
                  onChange={(e) => setStatusForm((p) => ({ ...p, repo: e.target.value }))}
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="cp-pr">{t("status.prNumber")}</Label>
                <Input
                  id="cp-pr"
                  value={statusForm.pr_number}
                  onChange={(e) => setStatusForm((p) => ({ ...p, pr_number: e.target.value }))}
                />
              </div>
            </>
          )}
          <div className="md:col-span-2">
            <Button type="submit">{t("status.submit")}</Button>
          </div>
        </form>
        <div className="mt-4">
          {!statusArmed ? null : status.isLoading ? (
            <p className="text-sm text-muted-foreground">{t("loading")}</p>
          ) : miss === "no_run" ? (
            <p className="text-sm font-semibold text-accent">{t("miss.no_run")}</p>
          ) : miss === "not_found" ? (
            <p className="text-sm font-semibold text-muted-foreground">{t("miss.not_found")}</p>
          ) : status.error ? (
            <p className="text-sm text-danger">{status.error.message}</p>
          ) : (
            <>
              <JsonBlock data={status.payload?.data} />
            </>
          )}
        </div>
      </Card>

      <Card>
        <h2 className="mb-4 font-medium">{t("history.title")}</h2>
        <form
          className="grid max-w-3xl gap-3 md:grid-cols-2"
          onSubmit={(e) => {
            e.preventDefault();
            setHistoryApplied({ ...historyForm });
            setHistoryArmed(true);
          }}
        >
          <div className="space-y-1">
            <Label htmlFor="hist-owner">{t("history.owner")}</Label>
            <Input
              id="hist-owner"
              value={historyForm.owner}
              onChange={(e) => setHistoryForm((p) => ({ ...p, owner: e.target.value }))}
            />
          </div>
          <div className="space-y-1">
            <Label htmlFor="hist-repo">{t("history.repo")}</Label>
            <Input
              id="hist-repo"
              value={historyForm.repo}
              onChange={(e) => setHistoryForm((p) => ({ ...p, repo: e.target.value }))}
            />
          </div>
          <div className="space-y-1">
            <Label htmlFor="hist-pr">{t("history.prNumber")}</Label>
            <Input
              id="hist-pr"
              value={historyForm.pr_number}
              onChange={(e) => setHistoryForm((p) => ({ ...p, pr_number: e.target.value }))}
            />
          </div>
          <div className="space-y-1">
            <Label htmlFor="hist-cp">{t("history.checkpointId")}</Label>
            <Input
              id="hist-cp"
              value={historyForm.checkpoint_id}
              onChange={(e) => setHistoryForm((p) => ({ ...p, checkpoint_id: e.target.value }))}
            />
          </div>
          <div className="md:col-span-2">
            <Button type="submit">{t("history.submit")}</Button>
          </div>
        </form>
        <div className="mt-4">
          {!historyArmed ? null : history.isLoading ? (
            <p className="text-sm text-muted-foreground">{t("loading")}</p>
          ) : history.error ? (
            <p className="text-sm text-danger">{history.error.message}</p>
          ) : isCheckpointHistoryEmpty(history.payload?.data) ? (
            <p className="text-sm text-muted-foreground">{t("history.empty")}</p>
          ) : (
            <JsonBlock data={history.payload?.data} />
          )}
        </div>
      </Card>
    </div>
  );
}
