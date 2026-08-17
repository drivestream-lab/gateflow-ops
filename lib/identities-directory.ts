// Pure helpers for the identities BFF routes (CTR-01).
// Gateflow contract mapping lives here so route modules export only HTTP handlers.
import { isEmailIdentifier } from "@/lib/auth-login-upstream";

export const UPSTREAM_IDENTITIES_PATH = "/api/v1/identities";

export interface IdentityDto {
  id: string;
  name: string;
  email: string;
  role: string;
  suspended: boolean;
}

export function identityCreateRefuseKey(input: {
  name?: string;
  email?: string;
  password?: string;
}): string | null {
  if (!input.name?.trim()) return "identities.errors.missingName";
  const email = input.email?.trim() ?? "";
  if (!isEmailIdentifier(email)) return "identities.errors.notAnEmail";
  if (!input.password) return "identities.errors.missingPassword";
  return null;
}

export function identityPasswordRefuseKey(password?: string): string | null {
  if (!password) return "identities.errors.missingPassword";
  return null;
}

/** Whitelist DTO — never copies password or token fields (REQ-30). */
export function stripIdentitySecrets(raw: unknown): IdentityDto | null {
  if (!raw || typeof raw !== "object") return null;
  const rec = raw as Record<string, unknown>;
  const id = rec.id ?? rec.identity_id ?? rec.user_id;
  // Gateflow IdentityReadModel uses display_name; keep name as a legacy fallback.
  const name = rec.display_name ?? rec.name;
  const email = rec.email ?? rec.credential_identifier;
  if (typeof id !== "string" || !id) return null;
  if (typeof name !== "string" || typeof email !== "string") return null;
  const role = typeof rec.role === "string" ? rec.role : "tenant_admin";
  const suspended = rec.suspended === true || rec.status === "suspended";
  return { id, name, email, role, suspended };
}

export function filterIdentitiesByQuery(items: IdentityDto[], query: string): IdentityDto[] {
  const q = query.trim().toLowerCase();
  if (!q) return items;
  return items.filter(
    (item) => item.name.toLowerCase().includes(q) || item.email.toLowerCase() === q,
  );
}

/** Gateflow IdentityEnterRequest body — display_name/email/password only (extra=forbid). */
export function identityCreateUpstreamBody(input: {
  name?: string;
  email?: string;
  password?: string;
}): Record<string, unknown> {
  return {
    display_name: input.name?.trim(),
    email: input.email?.trim(),
    password: input.password,
  };
}

/** Log-safe upstream failure detail: status plus a trimmed body snippet. */
export async function upstreamErrorDetail(res: Response): Promise<string> {
  const text = await res.text().catch(() => "");
  const trimmed = text.trim();
  return `upstream ${res.status}${trimmed ? `: ${trimmed.slice(0, 300)}` : ""}`;
}

export function upstreamActionPath(id: string, op: string): string {
  const base = `${UPSTREAM_IDENTITIES_PATH}/${encodeURIComponent(id)}`;
  if (op === "suspend") return `${base}/suspend`;
  if (op === "unsuspend") return `${base}/unsuspend`;
  if (op === "password-set") return `${base}/password`;
  return base;
}

/** Gateflow: suspend/unsuspend are POST, password-set is PUT /{id}/password. */
export function upstreamActionMethod(op: string): "POST" | "PUT" {
  return op === "password-set" ? "PUT" : "POST";
}
