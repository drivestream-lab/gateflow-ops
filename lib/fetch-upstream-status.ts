"use client";
// Fetch function for the upstream status BFF route — the settled API-calling
// pattern: a typed lib fetch function consumed by a domain hook (hooks/).
// Components never call authFetch inline; they use the hook.
import { authFetch } from "@/lib/auth-fetch";

export interface UpstreamStatusResponse {
  connected: boolean;
  latencyMs: number;
}

export async function fetchUpstreamStatus(): Promise<UpstreamStatusResponse> {
  const res = await authFetch("/api/gateflow/status");
  if (!res.ok) {
    const body = (await res.json().catch(() => null)) as { error?: string } | null;
    throw new Error(body?.error ?? `status ${res.status}`);
  }
  return res.json();
}
