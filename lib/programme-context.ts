// Entered-programme authorization context (ADR-002 Option B).
// Identity Bearer stays on SESSION_COOKIE; this cookie is ids only.
import "server-only";
import { cookies } from "next/headers";
import { env } from "@/lib/env";

export interface EnteredProgrammeContext {
  programmeId: string;
  /** Programme-bound tenant when gateflow exposes it; otherwise null. */
  tenantId: string | null;
}

/**
 * Parse the programme-context cookie value. Never reads a JWT or tenant_id
 * claim. Malformed / missing → null (callers treat as not entered).
 * programmeId is required; tenantId is optional (gateflow does not expose it
 * to tenant_admin tokens today).
 */
export function parseEnteredProgrammeContextCookie(
  raw: string | undefined | null,
): EnteredProgrammeContext | null {
  if (!raw) return null;
  try {
    const parsed: unknown = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object") return null;
    const rec = parsed as Record<string, unknown>;
    const programmeId = rec.programmeId;
    if (typeof programmeId !== "string" || !programmeId) return null;
    const tenantId = typeof rec.tenantId === "string" && rec.tenantId ? rec.tenantId : null;
    return { programmeId, tenantId };
  } catch {
    return null;
  }
}

export async function getEnteredProgrammeContext(): Promise<EnteredProgrammeContext | null> {
  const store = await cookies();
  return parseEnteredProgrammeContextCookie(store.get(env.PROGRAMME_CONTEXT_COOKIE)?.value);
}

export function programmeContextCookieOptions(): {
  httpOnly: true;
  sameSite: "lax";
  secure: boolean;
  path: "/";
} {
  return {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
  };
}

/** Durable options for the last-programme hint cookie (survives login/logout). */
export function lastProgrammeCookieOptions(): {
  httpOnly: true;
  sameSite: "lax";
  secure: boolean;
  path: "/";
  maxAge: number;
} {
  return {
    ...programmeContextCookieOptions(),
    maxAge: 60 * 60 * 24 * 30,
  };
}
