"use client";

import { useQuery } from "@tanstack/react-query";
import { authFetch } from "@/lib/auth-fetch";
import { t } from "@/lib/i18n";
import type { RunnerCatalogueResponse } from "@/lib/runner-catalogue";

async function fetchRunners(): Promise<RunnerCatalogueResponse> {
  const res = await authFetch("/api/gateflow/runners");
  if (!res.ok) {
    const body = (await res.json().catch(() => null)) as { error?: string } | null;
    throw new Error(body?.error ?? t("initiatives.errors.runnersFailed"));
  }
  return res.json() as Promise<RunnerCatalogueResponse>;
}

export function useRunnerCatalogue(options?: { enabled?: boolean }) {
  const query = useQuery({
    queryKey: ["gateflow", "runners"],
    queryFn: fetchRunners,
    enabled: options?.enabled ?? true,
    retry: false,
  });
  return {
    catalogue: query.data ?? null,
    isLoading: query.isPending,
    error:
      query.error instanceof Error
        ? query.error
        : query.error
          ? new Error(String(query.error))
          : null,
  };
}
