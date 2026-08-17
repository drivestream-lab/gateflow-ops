"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { authFetch } from "@/lib/auth-fetch";
import { PAGINATION } from "@/lib/constants";
import { t } from "@/lib/i18n";

export type WaveLane = "implement" | "spec" | "closeout";

export type RunStopPresentation = "human_checkpoint" | "failure" | "complete" | "active" | "other";

/** Pure: map run status/outcome to UI stop presentation (REQ-11). */
export function classifyRunStopPresentation(
  statusType: string | null | undefined,
  outcomeType?: string | null,
): RunStopPresentation {
  const status = (statusType ?? "").trim().toLowerCase();
  const outcome = (outcomeType ?? "").trim().toLowerCase();
  if (status === "stopped") return "human_checkpoint";
  if (status === "failed" || outcome === "failed" || outcome === "error") return "failure";
  if (status === "completed" || status === "succeeded" || outcome === "succeeded") {
    return "complete";
  }
  if (status === "active" || status === "running") return "active";
  return "other";
}

export function isForgeAuthorizeEligible(
  statusType: string | null | undefined,
  workflowNode: string | null | undefined,
): boolean {
  return (
    (statusType ?? "").trim().toLowerCase() === "stopped" &&
    Boolean(workflowNode && String(workflowNode).trim())
  );
}

export interface RunSummary {
  runId: string;
  org: string;
  repo: string;
  statusType: string;
  outcomeType: string | null;
  initiativeId: string | null;
  waveId: string | null;
  waveDurationMs: number | null;
  prNumber: number | null;
  issueNumber: number | null;
  createdAt: string | null;
  updatedAt: string | null;
}

export interface RunDetail extends RunSummary {
  workflowNode: string | null;
  retryCounter: number | null;
  notifyPending: boolean | null;
  stages: unknown[];
  events: unknown[];
}

export interface RunListFilters {
  initiative_id?: string;
  wave_id?: string;
  status_type?: string;
  org?: string;
  repo?: string;
  limit?: number;
  skip?: number;
}

export interface WaveStartResult {
  runId: string;
  jobId: string | null;
  status: string;
}

async function readError(res: Response, fallbackKey: string): Promise<Error> {
  const body = (await res.json().catch(() => null)) as { error?: string } | null;
  return new Error(body?.error ?? t(fallbackKey));
}

export function useRunsList(filters: RunListFilters, options?: { enabled?: boolean }) {
  const query = useQuery({
    queryKey: ["gateflow", "runs", "list", filters],
    queryFn: async () => {
      const params = new URLSearchParams();
      params.set("limit", String(filters.limit ?? PAGINATION.DEFAULT_LIMIT));
      params.set("skip", String(filters.skip ?? PAGINATION.DEFAULT_SKIP));
      for (const key of ["initiative_id", "wave_id", "status_type", "org", "repo"] as const) {
        const v = filters[key]?.trim();
        if (v) params.set(key, v);
      }
      const res = await authFetch(`/api/gateflow/runs?${params.toString()}`);
      if (!res.ok) throw await readError(res, "runs.errors.loadFailed");
      return res.json() as Promise<{ items: RunSummary[]; limit: number; skip: number }>;
    },
    enabled: options?.enabled ?? true,
  });
  return {
    items: query.data?.items ?? [],
    isLoading: query.isPending,
    error:
      query.error instanceof Error
        ? query.error
        : query.error
          ? new Error(String(query.error))
          : null,
    refetch: query.refetch,
  };
}

export function useRunDetail(runId: string | null, options?: { enabled?: boolean }) {
  const query = useQuery({
    queryKey: ["gateflow", "runs", "detail", runId],
    queryFn: async () => {
      const res = await authFetch(`/api/gateflow/runs/by-id?run_id=${encodeURIComponent(runId!)}`);
      if (!res.ok) throw await readError(res, "runs.errors.detailFailed");
      return res.json() as Promise<RunDetail>;
    },
    enabled: (options?.enabled ?? true) && Boolean(runId),
  });
  return {
    run: query.data ?? null,
    isLoading: query.isPending,
    error:
      query.error instanceof Error
        ? query.error
        : query.error
          ? new Error(String(query.error))
          : null,
    refetch: query.refetch,
  };
}

export function useStartWave() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: async ({ lane, body }: { lane: WaveLane; body: Record<string, unknown> }) => {
      const res = await authFetch(`/api/gateflow/waves?lane=${encodeURIComponent(lane)}`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) throw await readError(res, "runs.errors.waveStartFailed");
      return res.json() as Promise<WaveStartResult>;
    },
    onSuccess: () => {
      void client.invalidateQueries({ queryKey: ["gateflow", "runs"] });
      void client.invalidateQueries({ queryKey: ["gateflow", "meta", "pulls"] });
      void client.invalidateQueries({ queryKey: ["gateflow", "initiatives"] });
    },
  });
}

export function useForgeAuthorize() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: async ({ runId, body }: { runId: string; body: Record<string, unknown> }) => {
      const res = await authFetch(`/api/gateflow/runs/forge?run_id=${encodeURIComponent(runId)}`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) throw await readError(res, "runs.errors.forgeAuthorizeFailed");
      return res.json() as Promise<{
        runId: string;
        workflowNode: string;
        action: string;
        prNumber: number | null;
      }>;
    },
    onSuccess: (_data, vars) => {
      void client.invalidateQueries({ queryKey: ["gateflow", "runs", "detail", vars.runId] });
      void client.invalidateQueries({ queryKey: ["gateflow", "runs", "list"] });
    },
  });
}
