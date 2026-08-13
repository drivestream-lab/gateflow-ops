"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { authFetch } from "@/lib/auth-fetch";
import { t } from "@/lib/i18n";

/** Pure: detect empty ticket list (REQ-28). */
export function isBoardTicketListEmpty(data: unknown): boolean {
  if (!data || typeof data !== "object") return true;
  const tickets = (data as { tickets?: unknown }).tickets;
  return !Array.isArray(tickets) || tickets.length === 0;
}

/** Pure: create was an idempotent replay (REQ-29). */
export function isBoardCreateIdempotentReplay(data: unknown): boolean {
  if (!data || typeof data !== "object") return false;
  return Boolean((data as { idempotent_replay?: unknown }).idempotent_replay);
}

async function readError(res: Response, fallbackKey: string): Promise<Error> {
  const body = (await res.json().catch(() => null)) as { error?: string } | null;
  return new Error(body?.error ?? t(fallbackKey));
}

export interface BoardListFilters {
  org: string;
  repo: string;
  initiative_id?: string;
  type?: string;
  state?: string;
}

export function useBoardTickets(filters: BoardListFilters, options?: { enabled?: boolean }) {
  const query = useQuery({
    queryKey: ["gateflow", "board", "list", filters],
    queryFn: async () => {
      const params = new URLSearchParams({
        op: "list",
        org: filters.org.trim(),
        repo: filters.repo.trim(),
      });
      if (filters.initiative_id?.trim()) {
        params.set("initiative_id", filters.initiative_id.trim());
      }
      if (filters.type?.trim()) params.set("type", filters.type.trim());
      if (filters.state?.trim()) params.set("state", filters.state.trim());
      const res = await authFetch(`/api/gateflow/board?${params}`);
      if (!res.ok) throw await readError(res, "board.errors.loadFailed");
      return res.json() as Promise<{ op: string; data: unknown }>;
    },
    enabled: (options?.enabled ?? true) && Boolean(filters.org.trim() && filters.repo.trim()),
    retry: false,
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

export interface BoardCreateBody {
  org: string;
  repo: string;
  title: string;
  ticket_type: "EPIC" | "Feature";
  initiative_id: string;
  body?: string;
  project_number?: number;
  project_owner?: string;
  parent_ticket_id?: string;
  idempotency_key?: string;
}

export function useCreateBoardTicket() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (body: BoardCreateBody) => {
      const { idempotency_key, ...payload } = body;
      const headers: Record<string, string> = { "content-type": "application/json" };
      if (idempotency_key?.trim()) headers["Idempotency-Key"] = idempotency_key.trim();
      const res = await authFetch("/api/gateflow/board?op=create", {
        method: "POST",
        headers,
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw await readError(res, "board.errors.createFailed");
      return res.json() as Promise<{ op: string; data: unknown }>;
    },
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ["gateflow", "board"] });
    },
  });
}

export interface BoardStatusBody {
  ticket_id: string;
  org: string;
  repo: string;
  state?: string;
  column?: string;
}

export function useUpdateBoardTicketStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (body: BoardStatusBody) => {
      const res = await authFetch("/api/gateflow/board?op=status", {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) throw await readError(res, "board.errors.statusFailed");
      return res.json() as Promise<{ op: string; data: unknown }>;
    },
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ["gateflow", "board"] });
    },
  });
}

export interface BoardLinkBody {
  ticket_id: string;
  org: string;
  repo: string;
  pr_number: number;
}

export function useLinkBoardTicket() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (body: BoardLinkBody) => {
      const res = await authFetch("/api/gateflow/board?op=link", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) throw await readError(res, "board.errors.linkFailed");
      return res.json() as Promise<{ op: string; data: unknown }>;
    },
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ["gateflow", "board"] });
    },
  });
}
