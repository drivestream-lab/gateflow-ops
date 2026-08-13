/**
 * JWT role helpers — gateflow RoleType values (`platform_admin` | `tenant_admin`).
 * Pure / client-safe for unit tests and nav filtering.
 */
import type { JwtPayload } from "@/lib/jwt";

export type SessionRole = "platform_admin" | "tenant_admin" | "unknown";

export function normalizeSessionRole(
  role: string | null | undefined,
): SessionRole {
  if (typeof role !== "string") return "unknown";
  const normalized = role.trim().toLowerCase();
  if (normalized === "platform_admin") return "platform_admin";
  if (normalized === "tenant_admin") return "tenant_admin";
  return "unknown";
}

export function sessionRoleFromPayload(
  payload: JwtPayload | null | undefined,
): SessionRole {
  return normalizeSessionRole(
    typeof payload?.role === "string" ? payload.role : null,
  );
}

export function isPlatformAdmin(
  payload: JwtPayload | null | undefined,
): boolean {
  return sessionRoleFromPayload(payload) === "platform_admin";
}

export function isTenantAdmin(payload: JwtPayload | null | undefined): boolean {
  return sessionRoleFromPayload(payload) === "tenant_admin";
}
