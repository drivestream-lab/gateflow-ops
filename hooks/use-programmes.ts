"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { authFetch } from "@/lib/auth-fetch";
import { t } from "@/lib/i18n";

export interface CatalogueCandidate {
  org: string;
  repo: string;
  serviceKey: string;
  status: string;
}

export interface ProgrammeSummary {
  id: string;
  name: string;
  tenantId: string;
  workspaceRoot: string;
  metaOrg: string;
  metaRepo: string;
  metaRef: string | null;
  repoCatalogue: CatalogueCandidate[];
}

export interface ProgrammeCreateResponse {
  programmeId: string;
  tenantId: string;
  repoCatalogue: CatalogueCandidate[];
}

export interface ProgrammeOnboardInput {
  name: string;
  meta_org: string;
  meta_repo: string;
  github_pat: string;
}

async function readError(res: Response, fallbackKey: string): Promise<Error> {
  const body = (await res.json().catch(() => null)) as { error?: string } | null;
  return new Error(body?.error ?? t(fallbackKey));
}

export function useProgrammesList(options?: { enabled?: boolean }) {
  const query = useQuery({
    queryKey: ["gateflow", "programmes", "list"],
    queryFn: async () => {
      const res = await authFetch("/api/gateflow/programmes");
      if (!res.ok) throw await readError(res, "programmes.errors.loadFailed");
      const data = (await res.json()) as { programmes: ProgrammeSummary[] };
      return data.programmes ?? [];
    },
    enabled: options?.enabled ?? true,
  });
  return {
    programmes: query.data ?? [],
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

export function useProgramme(programmeId: string, options?: { enabled?: boolean }) {
  const query = useQuery({
    queryKey: ["gateflow", "programmes", programmeId],
    queryFn: async () => {
      const res = await authFetch(`/api/gateflow/programmes/${encodeURIComponent(programmeId)}`);
      if (!res.ok) throw await readError(res, "programmes.errors.loadFailed");
      return res.json() as Promise<ProgrammeSummary>;
    },
    enabled: (options?.enabled ?? true) && Boolean(programmeId),
  });
  return {
    programme: query.data ?? null,
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

export function useCreateProgramme() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: async (body: ProgrammeOnboardInput) => {
      const res = await authFetch("/api/gateflow/programmes", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) throw await readError(res, "programmes.errors.createFailed");
      return res.json() as Promise<ProgrammeCreateResponse>;
    },
    onSuccess: () => {
      void client.invalidateQueries({ queryKey: ["gateflow", "programmes"] });
    },
  });
}

export function useRefreshProgrammeCatalogue(programmeId: string) {
  const client = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      const res = await authFetch(
        `/api/gateflow/programmes/${encodeURIComponent(programmeId)}/catalogue/refresh`,
        { method: "POST" },
      );
      if (!res.ok) throw await readError(res, "programmes.errors.catalogueRefreshFailed");
      return res.json() as Promise<ProgrammeSummary>;
    },
    onSuccess: (data) => {
      client.setQueryData(["gateflow", "programmes", programmeId], data);
      void client.invalidateQueries({ queryKey: ["gateflow", "programmes", "list"] });
    },
  });
}
