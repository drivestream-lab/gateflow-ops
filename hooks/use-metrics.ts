"use client";

import { useQuery } from "@tanstack/react-query";
import { authFetch } from "@/lib/auth-fetch";
import { t } from "@/lib/i18n";

export type MetricsOp = "runs" | "skill-efficacy" | "factory-effectiveness" | "delivery-scorecard";

export interface MetricsFilters {
  model_id?: string;
  prompt_revision?: string;
}

/**
 * Pure: detect well-formed empty metric payloads (REQ-22–25).
 * Never treats missing upstream as success with invented series.
 */
export function isMetricsSeriesEmpty(op: MetricsOp, data: unknown): boolean {
  if (data === null || data === undefined) return true;
  if (typeof data !== "object" || Array.isArray(data)) return true;
  const rec = data as Record<string, unknown>;

  switch (op) {
    case "runs": {
      const nodes = Array.isArray(rec.by_workflow_node) ? rec.by_workflow_node : [];
      const runners = Array.isArray(rec.by_runner) ? rec.by_runner : [];
      const models = Array.isArray(rec.by_model_id) ? rec.by_model_id : [];
      return nodes.length === 0 && runners.length === 0 && models.length === 0;
    }
    case "skill-efficacy": {
      const nodes = Array.isArray(rec.by_workflow_node) ? rec.by_workflow_node : [];
      return nodes.length === 0;
    }
    case "factory-effectiveness": {
      const gate =
        typeof rec.gate_reaching_run_count === "number" ? rec.gate_reaching_run_count : 0;
      const cycle = Array.isArray(rec.cycle_time_by_lane) ? rec.cycle_time_by_lane : [];
      const stops = Array.isArray(rec.stop_reason_breakdown) ? rec.stop_reason_breakdown : [];
      return gate === 0 && cycle.length === 0 && stops.length === 0;
    }
    case "delivery-scorecard":
      // Scorecard always returns framed numbers from upstream when ok —
      // not an empty list surface; treat only null/non-object as empty.
      return false;
    default:
      return true;
  }
}

async function readError(res: Response, fallbackKey: string): Promise<Error> {
  const body = (await res.json().catch(() => null)) as { error?: string } | null;
  return new Error(body?.error ?? t(fallbackKey));
}

export function useMetrics(
  op: MetricsOp,
  filters: MetricsFilters = {},
  options?: { enabled?: boolean },
) {
  const modelId = filters.model_id?.trim() ?? "";
  const promptRevision = filters.prompt_revision?.trim() ?? "";

  const query = useQuery({
    queryKey: ["gateflow", "metrics", op, modelId, promptRevision],
    queryFn: async () => {
      const params = new URLSearchParams({ op });
      if (op === "skill-efficacy") {
        if (modelId) params.set("model_id", modelId);
        if (promptRevision) params.set("prompt_revision", promptRevision);
      }
      const res = await authFetch(`/api/gateflow/metrics?${params}`);
      if (!res.ok) throw await readError(res, "metrics.errors.loadFailed");
      return res.json() as Promise<{ op: string; data: unknown }>;
    },
    enabled: options?.enabled ?? true,
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
