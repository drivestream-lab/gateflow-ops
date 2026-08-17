"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { authFetch } from "@/lib/auth-fetch";
import { t } from "@/lib/i18n";

export interface GrantedProgramme {
  programmeId: string;
  tenantId: string | null;
  programmeName: string | null;
}

export interface EnterListResponse {
  programmes: GrantedProgramme[];
  entered: { programmeId: string; tenantId: string } | null;
}

async function readError(res: Response, fallbackKey: string): Promise<Error> {
  const body = (await res.json().catch(() => null)) as { error?: string } | null;
  return new Error(body?.error ?? t(fallbackKey));
}

export function useAuthProgramme(options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: ["auth", "programme", "list"],
    queryFn: async () => {
      const res = await authFetch("/api/auth/programme");
      if (!res.ok) throw await readError(res, "programmes.errors.loadFailed");
      return (await res.json()) as EnterListResponse;
    },
    enabled: options?.enabled ?? true,
    retry: false,
  });
}

export function useEnterProgramme() {
  const qc = useQueryClient();
  const router = useRouter();
  return useMutation({
    mutationFn: async (programmeId: string) => {
      const res = await authFetch("/api/auth/programme", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ programmeId }),
      });
      if (!res.ok) throw await readError(res, "programmes.errors.actionFailed");
      return (await res.json()) as { ok: boolean; programmeId: string; tenantId: string };
    },
    onSuccess: () => {
      void qc.invalidateQueries();
      router.refresh();
    },
  });
}

export function useLeaveProgramme() {
  const qc = useQueryClient();
  const router = useRouter();
  return useMutation({
    mutationFn: async () => {
      const res = await authFetch("/api/auth/programme?op=leave", { method: "POST" });
      if (!res.ok) throw await readError(res, "programmes.errors.actionFailed");
      return (await res.json()) as { ok: boolean };
    },
    onSuccess: () => {
      void qc.invalidateQueries();
      router.refresh();
    },
  });
}
