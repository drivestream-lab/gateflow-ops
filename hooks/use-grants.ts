"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { authFetch } from "@/lib/auth-fetch";
import { t } from "@/lib/i18n";

export interface GrantSummary {
  identityId: string;
  programmeId: string;
  email: string | null;
  name: string | null;
  programmeName: string | null;
  idempotent?: boolean;
  ok?: boolean;
}

export interface GrantWriteInput {
  identityId?: string;
  email?: string;
  programmeId: string;
}

async function readError(res: Response, fallbackKey: string): Promise<Error> {
  const body = (await res.json().catch(() => null)) as { error?: string } | null;
  return new Error(body?.error ?? t(fallbackKey));
}

export function useGrantsList(filter: { identityId?: string; programmeId?: string }) {
  const identityId = filter.identityId?.trim() ?? "";
  const programmeId = filter.programmeId?.trim() ?? "";
  const list = useQuery({
    queryKey: ["gateflow", "grants", "list", identityId, programmeId],
    enabled: Boolean(identityId || programmeId),
    queryFn: async () => {
      const params = new URLSearchParams();
      if (identityId) params.set("identity_id", identityId);
      if (programmeId) params.set("programme_id", programmeId);
      const res = await authFetch(`/api/gateflow/grants?${params.toString()}`);
      if (!res.ok) throw await readError(res, "grants.errors.loadFailed");
      const data = (await res.json()) as { grants: GrantSummary[] };
      return data.grants ?? [];
    },
  });
  return {
    grants: list.data ?? [],
    isLoading: list.isLoading,
    error: list.error,
  };
}

export function useGrantEntry() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: GrantWriteInput) => {
      const res = await authFetch("/api/gateflow/grants", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          identityId: input.identityId,
          email: input.email,
          programmeId: input.programmeId,
        }),
      });
      if (!res.ok) throw await readError(res, "grants.errors.actionFailed");
      return (await res.json()) as GrantSummary;
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["gateflow", "grants"] });
    },
  });
}

export function useDetachGrant() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: GrantWriteInput) => {
      const res = await authFetch("/api/gateflow/grants?op=detach", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          identityId: input.identityId,
          email: input.email,
          programmeId: input.programmeId,
        }),
      });
      if (!res.ok) throw await readError(res, "grants.errors.actionFailed");
      return (await res.json()) as GrantSummary;
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["gateflow", "grants"] });
    },
  });
}
