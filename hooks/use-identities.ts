"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { IDENTITIES_PAGE_SIZE_DEFAULT, PAGINATION } from "@/lib/constants";
import { authFetch } from "@/lib/auth-fetch";
import { t } from "@/lib/i18n";

export interface IdentitySummary {
  id: string;
  name: string;
  email: string;
  role: string;
  suspended: boolean;
}

export interface IdentityCreateInput {
  name: string;
  email: string;
  password: string;
}

async function readError(res: Response, fallbackKey: string): Promise<Error> {
  const body = (await res.json().catch(() => null)) as { error?: string } | null;
  return new Error(body?.error ?? t(fallbackKey));
}

export function useIdentitiesList(query: string) {
  const list = useQuery({
    queryKey: ["gateflow", "identities", "list", query],
    queryFn: async () => {
      const params = new URLSearchParams({
        skip: String(PAGINATION.DEFAULT_SKIP),
        limit: String(IDENTITIES_PAGE_SIZE_DEFAULT),
      });
      if (query.trim()) params.set("q", query.trim());
      const res = await authFetch(`/api/gateflow/identities?${params.toString()}`);
      if (!res.ok) throw await readError(res, "identities.errors.loadFailed");
      const data = (await res.json()) as { identities: IdentitySummary[] };
      return data.identities ?? [];
    },
  });
  return {
    identities: list.data ?? [],
    isLoading: list.isLoading,
    error: list.error,
  };
}

export function useIdentity(id: string | null) {
  const detail = useQuery({
    queryKey: ["gateflow", "identities", "by-id", id],
    enabled: Boolean(id),
    queryFn: async () => {
      const res = await authFetch(
        `/api/gateflow/identities/by-id?id=${encodeURIComponent(id ?? "")}`,
      );
      if (!res.ok) throw await readError(res, "identities.errors.loadFailed");
      return (await res.json()) as IdentitySummary;
    },
  });
  return {
    identity: detail.data ?? null,
    isLoading: detail.isLoading,
    error: detail.error,
  };
}

export function useCreateIdentity() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: IdentityCreateInput) => {
      const res = await authFetch("/api/gateflow/identities", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(input),
      });
      if (!res.ok) throw await readError(res, "identities.errors.createFailed");
      return (await res.json()) as IdentitySummary;
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["gateflow", "identities"] });
    },
  });
}

export function useIdentityAction(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: {
      op: "suspend" | "unsuspend" | "password-set";
      password?: string;
    }) => {
      const params = new URLSearchParams({ id, op: input.op });
      const res = await authFetch(`/api/gateflow/identities/by-id?${params.toString()}`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body:
          input.op === "password-set" ? JSON.stringify({ password: input.password }) : undefined,
      });
      if (!res.ok) throw await readError(res, "identities.errors.actionFailed");
      return (await res.json()) as IdentitySummary | { ok: boolean; id: string };
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["gateflow", "identities"] });
    },
  });
}
