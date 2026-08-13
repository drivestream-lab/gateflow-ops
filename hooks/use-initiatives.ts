"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { authFetch } from "@/lib/auth-fetch";
import { PAGINATION } from "@/lib/constants";
import { t } from "@/lib/i18n";

export type WaveMapStatus = "done" | "ready-to-start" | "blocked" | "active" | "unknown";

export type InitiativeByIdOp =
  "detail" | "waves" | "spec" | "implementation" | "closeout" | "merge" | "completion" | "closure";

export interface InitiativeRunLink {
  runId: string;
  waveId: string | null;
  statusType: string;
  workflowNode: string | null;
  prNumber: number | null;
  org: string;
  repo: string;
}

export interface InitiativeSummary {
  initiativeId: string;
  name: string;
  prdApproval: string;
  prdApprovalReason: string | null;
  affectedRepos: string[];
  currentStage: string;
  currentStageDetail: string | null;
  inFlightRun: InitiativeRunLink | null;
  epicTicketId: string | null;
  epicTicketUrl: string | null;
}

export interface ClosureStartResult {
  runId: string;
  jobId: string | null;
  status: string;
}

export interface ClosureStartBody {
  initiative_id: string;
  epic_ticket_id: string;
  wave_ticket_ids: string[];
  workspace: string;
  branch_slug: string;
  base_branch: string;
  runner: string;
  model_id: string;
  org: string;
  repo: string;
}

/** Pure: normalize gateflow wave-map status for UI (REQ-14). */
export function classifyWaveMapStatus(status: string | null | undefined): WaveMapStatus {
  const s = (status ?? "").trim().toLowerCase();
  if (s === "done") return "done";
  if (s === "ready-to-start" || s === "ready_to_start") return "ready-to-start";
  if (s === "blocked") return "blocked";
  if (s === "active") return "active";
  return "unknown";
}

/**
 * Pure: honest gap when a composition field is absent (REQ-13–20).
 * Never invents board/GitHub values — only labels missing upstream data.
 */
export function compositionGapLabel(
  value: unknown,
  unavailableToken = "unavailable",
): "present" | "empty" | "unavailable" {
  if (value === null || value === undefined) return "empty";
  if (typeof value === "string") {
    const trimmed = value.trim();
    if (!trimmed) return "empty";
    if (trimmed.toLowerCase() === unavailableToken) return "unavailable";
    return "present";
  }
  if (Array.isArray(value)) return value.length === 0 ? "empty" : "present";
  return "present";
}

/** Pure: split comma/whitespace wave ticket ids for closure start (REQ-21). */
export function parseWaveTicketIds(raw: string): string[] {
  return raw
    .split(/[,;\s]+/)
    .map((s) => s.trim())
    .filter(Boolean);
}

async function readError(res: Response, fallbackKey: string): Promise<Error> {
  const body = (await res.json().catch(() => null)) as { error?: string } | null;
  return new Error(body?.error ?? t(fallbackKey));
}

export function useInitiativesList(
  filters: { org: string; repo: string; limit?: number; skip?: number },
  options?: { enabled?: boolean },
) {
  const org = filters.org.trim();
  const repo = filters.repo.trim();
  const query = useQuery({
    queryKey: ["gateflow", "initiatives", "list", org, repo, filters.limit, filters.skip],
    queryFn: async () => {
      const params = new URLSearchParams({
        org,
        repo,
        limit: String(filters.limit ?? PAGINATION.DEFAULT_LIMIT),
        skip: String(filters.skip ?? PAGINATION.DEFAULT_SKIP),
      });
      const res = await authFetch(`/api/gateflow/initiatives?${params}`);
      if (!res.ok) throw await readError(res, "initiatives.errors.loadFailed");
      return res.json() as Promise<{ initiatives: InitiativeSummary[]; org: string; repo: string }>;
    },
    enabled: (options?.enabled ?? true) && Boolean(org && repo),
  });
  return {
    initiatives: query.data?.initiatives ?? [],
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

export function useInitiativeOp(
  args: {
    initiativeId: string | null;
    org: string;
    repo: string;
    op: InitiativeByIdOp;
    waveId?: string;
  },
  options?: { enabled?: boolean },
) {
  const initiativeId = args.initiativeId?.trim() ?? "";
  const org = args.org.trim();
  const repo = args.repo.trim();
  const waveId = args.waveId?.trim() ?? "";
  const needsWave = ["implementation", "closeout", "merge"].includes(args.op);

  const query = useQuery({
    queryKey: ["gateflow", "initiatives", "op", args.op, initiativeId, org, repo, waveId],
    queryFn: async () => {
      const params = new URLSearchParams({
        initiative_id: initiativeId,
        org,
        repo,
        op: args.op,
      });
      if (needsWave && waveId) params.set("wave_id", waveId);
      const res = await authFetch(`/api/gateflow/initiatives/by-id?${params}`);
      if (!res.ok) throw await readError(res, "initiatives.errors.detailFailed");
      return res.json() as Promise<{
        op: string;
        initiativeId: string;
        org: string;
        repo: string;
        waveId: string | null;
        data: unknown;
      }>;
    },
    enabled:
      (options?.enabled ?? true) &&
      Boolean(initiativeId && org && repo) &&
      (!needsWave || Boolean(waveId)),
  });

  return {
    payload: query.data ?? null,
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

export function useStartClosure() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (body: ClosureStartBody) => {
      const res = await authFetch("/api/gateflow/initiatives?op=closure-start", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) throw await readError(res, "initiatives.errors.closureStartFailed");
      return res.json() as Promise<ClosureStartResult>;
    },
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ["gateflow", "initiatives"] });
      void qc.invalidateQueries({ queryKey: ["gateflow", "runs"] });
    },
  });
}
