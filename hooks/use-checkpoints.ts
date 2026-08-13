"use client";

import { useQuery } from "@tanstack/react-query";
import { authFetch } from "@/lib/auth-fetch";
import { PAGINATION } from "@/lib/constants";
import { t } from "@/lib/i18n";

export type CheckpointOp = "status" | "history";

export type CheckpointQueryMode = "raw" | "composed";

/** Pure: classify checkpoint miss for honest UI (REQ-26/27). */
export function classifyCheckpointMiss(
  status: number | null | undefined,
  errorKeyOrMessage: string | null | undefined,
): "no_run" | "not_found" | "other" | null {
  if (status == null) return null;
  if (status !== 404) return "other";
  const msg = (errorKeyOrMessage ?? "").toLowerCase();
  if (msg.includes("norunfound") || msg.includes("no run found") || msg.includes("no_run")) {
    return "no_run";
  }
  return "not_found";
}

/** Pure: history empty vs present. */
export function isCheckpointHistoryEmpty(data: unknown): boolean {
  if (!data || typeof data !== "object") return true;
  const records = (data as { records?: unknown }).records;
  return !Array.isArray(records) || records.length === 0;
}

async function readError(res: Response, fallbackKey: string): Promise<Error & { status?: number }> {
  const body = (await res.json().catch(() => null)) as { error?: string } | null;
  const err = new Error(body?.error ?? t(fallbackKey)) as Error & { status?: number };
  err.status = res.status;
  return err;
}

export interface CheckpointStatusFilters {
  mode: CheckpointQueryMode;
  checkpoint_id: string;
  owner?: string;
  repo?: string;
  pr_number?: string;
  initiative_id?: string;
  wave_id?: string;
}

export function useCheckpointStatus(
  filters: CheckpointStatusFilters,
  options?: { enabled?: boolean },
) {
  const query = useQuery({
    queryKey: ["gateflow", "checkpoints", "status", filters],
    queryFn: async () => {
      const params = new URLSearchParams({
        op: "status",
        checkpoint_id: filters.checkpoint_id.trim(),
      });
      if (filters.mode === "composed") {
        params.set("initiative_id", filters.initiative_id?.trim() ?? "");
        params.set("wave_id", filters.wave_id?.trim() ?? "");
      } else {
        params.set("owner", filters.owner?.trim() ?? "");
        params.set("repo", filters.repo?.trim() ?? "");
        params.set("pr_number", filters.pr_number?.trim() ?? "");
      }
      const res = await authFetch(`/api/gateflow/checkpoints?${params}`);
      if (!res.ok) throw await readError(res, "checkpoints.errors.loadFailed");
      return res.json() as Promise<{ op: string; data: unknown }>;
    },
    enabled:
      (options?.enabled ?? true) &&
      Boolean(filters.checkpoint_id.trim()) &&
      (filters.mode === "composed"
        ? Boolean(filters.initiative_id?.trim() && filters.wave_id?.trim())
        : Boolean(filters.owner?.trim() && filters.repo?.trim() && filters.pr_number?.trim())),
    retry: false,
  });

  return {
    payload: query.data ?? null,
    isLoading: query.isPending,
    error:
      query.error instanceof Error
        ? (query.error as Error & { status?: number })
        : query.error
          ? new Error(String(query.error))
          : null,
    refetch: query.refetch,
  };
}

export function useCheckpointHistory(
  filters: {
    owner: string;
    repo: string;
    pr_number: string;
    checkpoint_id?: string;
  },
  options?: { enabled?: boolean },
) {
  const query = useQuery({
    queryKey: ["gateflow", "checkpoints", "history", filters],
    queryFn: async () => {
      const params = new URLSearchParams({
        op: "history",
        owner: filters.owner.trim(),
        repo: filters.repo.trim(),
        pr_number: filters.pr_number.trim(),
        limit: String(PAGINATION.DEFAULT_LIMIT),
        skip: String(PAGINATION.DEFAULT_SKIP),
      });
      if (filters.checkpoint_id?.trim()) {
        params.set("checkpoint_id", filters.checkpoint_id.trim());
      }
      const res = await authFetch(`/api/gateflow/checkpoints?${params}`);
      if (!res.ok) throw await readError(res, "checkpoints.errors.loadFailed");
      return res.json() as Promise<{ op: string; data: unknown }>;
    },
    enabled:
      (options?.enabled ?? true) &&
      Boolean(filters.owner.trim() && filters.repo.trim() && filters.pr_number.trim()),
    retry: false,
  });

  return {
    payload: query.data ?? null,
    isLoading: query.isPending,
    error:
      query.error instanceof Error
        ? (query.error as Error & { status?: number })
        : query.error
          ? new Error(String(query.error))
          : null,
    refetch: query.refetch,
  };
}
