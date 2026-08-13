"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { authFetch } from "@/lib/auth-fetch";
import { t } from "@/lib/i18n";
import type { ReadinessVerdictType, SelectOutcome } from "@/lib/onboarding-verdict";

export interface ProgrammeConnection {
  tenant_id: string;
  org: string;
  repo: string;
  ref?: string | null;
  last_synced_at: string;
}

export interface CatalogueCandidate {
  org: string;
  repo: string;
  service_key: string;
  status: string;
}

export interface ProgrammeCatalogue {
  programme_org: string;
  candidates: CatalogueCandidate[];
}

export interface SelectResult {
  org: string;
  repo: string;
  outcome: SelectOutcome;
  reason?: string | null;
}

export interface SelectResponse {
  results: SelectResult[];
  active_repos: { org: string; repo: string }[];
}

export interface ReadinessResponse {
  org: string;
  repo: string;
  readiness_source: string;
  harness_verified: boolean;
  verdict_type: ReadinessVerdictType;
  reason?: string | null;
}

export interface DeselectResponse {
  org: string;
  repo: string;
  active_repos: { org: string; repo: string }[];
}

async function programmeFetch<T>(op: string, init?: RequestInit): Promise<T> {
  const url = `/api/gateflow/programme?op=${encodeURIComponent(op)}`;
  const res = await authFetch(url, init);
  if (!res.ok) {
    const body = (await res.json().catch(() => null)) as { error?: string } | null;
    throw new Error(body?.error ?? t("fleet.errors.actionFailed"));
  }
  return res.json() as Promise<T>;
}

export function useProgrammeConnection(options?: { enabled?: boolean }) {
  const query = useQuery({
    queryKey: ["gateflow", "programme", "connection"],
    queryFn: () => programmeFetch<ProgrammeConnection>("connection"),
    enabled: options?.enabled ?? true,
    retry: false,
  });
  return {
    connection: query.data ?? null,
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

export function useProgrammeCatalogue(options?: { enabled?: boolean }) {
  const query = useQuery({
    queryKey: ["gateflow", "programme", "catalogue"],
    queryFn: () => programmeFetch<ProgrammeCatalogue>("catalogue"),
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
    refetch: query.refetch,
  };
}

export function useConnectProgramme() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: (body: { org: string; repo: string }) =>
      programmeFetch<{ connection: ProgrammeConnection }>("connect", {
        method: "PUT",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ org: body.org, repo: body.repo }),
      }),
    onSuccess: () => {
      void client.invalidateQueries({ queryKey: ["gateflow", "programme"] });
    },
  });
}

export function useRefreshCatalogue() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: () =>
      programmeFetch<{
        connection: ProgrammeConnection;
        repo_catalogue?: unknown[];
      }>("catalogue-refresh", {
        method: "POST",
      }),
    onSuccess: () => {
      void client.invalidateQueries({ queryKey: ["gateflow", "programme"] });
    },
  });
}

export function useSelectRepos() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: (repos: { org: string; repo: string }[]) =>
      programmeFetch<SelectResponse>("select", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ repos }),
      }),
    onSuccess: () => {
      void client.invalidateQueries({ queryKey: ["gateflow", "programme"] });
      void client.invalidateQueries({ queryKey: ["gateflow", "tenants"] });
    },
  });
}

export function useRefreshReadiness() {
  return useMutation({
    mutationFn: (body: { org: string; repo: string }) =>
      programmeFetch<ReadinessResponse>("readiness", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(body),
      }),
  });
}

export function useDeselectRepo() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: (body: { org: string; repo: string }) =>
      programmeFetch<DeselectResponse>("deselect", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(body),
      }),
    onSuccess: () => {
      void client.invalidateQueries({ queryKey: ["gateflow", "programme"] });
      void client.invalidateQueries({ queryKey: ["gateflow", "tenants"] });
    },
  });
}
