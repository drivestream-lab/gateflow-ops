"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { authFetch } from "@/lib/auth-fetch";
import { t } from "@/lib/i18n";

export interface TenantDetail {
  tenantId: string;
  name: string;
  workspaceRoot: string;
  repos: { org: string; repo: string }[];
  board: { org?: string; project?: string } | null;
}

async function fetchTenant(): Promise<TenantDetail> {
  const res = await authFetch("/api/gateflow/tenants");
  if (!res.ok) {
    const body = (await res.json().catch(() => null)) as { error?: string } | null;
    throw new Error(body?.error ?? t("tenants.errors.loadFailed"));
  }
  return res.json() as Promise<TenantDetail>;
}

async function inviteUser(identity: string): Promise<{ tenantId: string; identity: string }> {
  const res = await authFetch("/api/gateflow/tenants/users", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ identity }),
  });
  if (!res.ok) {
    const body = (await res.json().catch(() => null)) as { error?: string } | null;
    throw new Error(body?.error ?? t("tenants.errors.inviteFailed"));
  }
  return res.json() as Promise<{ tenantId: string; identity: string }>;
}

export function useTenant(options?: { enabled?: boolean }) {
  const query = useQuery({
    queryKey: ["gateflow", "tenants", "detail"],
    queryFn: fetchTenant,
    enabled: options?.enabled ?? true,
  });

  return {
    tenant: query.data ?? null,
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

export function useInviteTeammate() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: inviteUser,
    onSuccess: () => {
      void client.invalidateQueries({ queryKey: ["gateflow", "tenants"] });
    },
  });
}
