/**
 * Display helpers for decoded session JWT (gateflow tokens omit email).
 */
import type { JwtPayload } from "@/lib/jwt";

export function sessionDisplayName(payload: JwtPayload | null | undefined): string {
  if (!payload) return "—";
  if (typeof payload.email === "string" && payload.email.trim()) return payload.email.trim();
  if (typeof payload.credential_identifier === "string" && payload.credential_identifier.trim()) {
    return payload.credential_identifier.trim();
  }
  if (typeof payload.sub === "string" && payload.sub.trim()) return payload.sub.trim();
  return "—";
}

export function sessionRoleLabel(payload: JwtPayload | null | undefined): string | null {
  return typeof payload?.role === "string" && payload.role.trim() ? payload.role.trim() : null;
}

export function sessionTenantLabel(payload: JwtPayload | null | undefined): string | null {
  return typeof payload?.tenant_id === "string" && payload.tenant_id.trim()
    ? payload.tenant_id.trim()
    : null;
}
