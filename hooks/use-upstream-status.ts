"use client";
// Domain hook — the settled client-data pattern (extracted from drivestream-ops):
// lib/ owns the typed fetch function, hooks/ owns the useQuery wrapper (query key,
// staleTime, enabled logic, error normalization), components consume the hook.
import { useQuery } from "@tanstack/react-query";
import { fetchUpstreamStatus, type UpstreamStatusResponse } from "@/lib/fetch-upstream-status";

export function useUpstreamStatus(options?: { enabled?: boolean }) {
  const query = useQuery<UpstreamStatusResponse>({
    queryKey: ["gateflow", "status"],
    queryFn: fetchUpstreamStatus,
    enabled: options?.enabled ?? true,
    staleTime: 30_000,
    refetchInterval: 30_000,
    refetchOnWindowFocus: false,
  });

  return {
    status: query.data ?? null,
    isLoading: query.isPending,
    error:
      query.error instanceof Error
        ? query.error
        : query.error
          ? new Error(String(query.error))
          : null,
  };
}
