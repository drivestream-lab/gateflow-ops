// Pure helpers for the grants BFF routes (CTR-02).
// Gateflow grants are programme-scoped — there is no /api/v1/grants upstream:
//   grant:  POST   /api/v1/programmes/{pid}/grants            body {identity_id}
//   detach: DELETE /api/v1/programmes/{pid}/grants/{iid}
//   list:   GET    /api/v1/programmes/{pid}/grants  → IdentityReadModel[]
//           GET    /api/v1/identities/{iid}/grants  → ProgrammeMembershipReadModel[]
import { UPSTREAM_IDENTITIES_PATH } from "@/lib/identities-directory";

export const UPSTREAM_PROGRAMMES_PATH = "/api/v1/programmes";

export interface GrantDto {
  identityId: string;
  programmeId: string;
  email: string | null;
  name: string | null;
  programmeName: string | null;
}

export interface GrantWriteInput {
  identityId?: string;
  email?: string;
  programmeId?: string;
  password?: string;
  role?: string;
}

export function grantWriteRefuseKey(input: GrantWriteInput): string | null {
  const identityId = input.identityId?.trim() ?? "";
  const email = input.email?.trim() ?? "";
  if (!identityId && !email) return "grants.errors.unknownIdentity";
  if (!input.programmeId?.trim()) return "grants.errors.unknownProgramme";
  if (input.password) return "grants.errors.passwordNotAllowed";
  if (input.role?.trim().toLowerCase() === "platform_admin") {
    return "grants.errors.platformAdminNotGrantable";
  }
  return null;
}

/** Whitelist DTO — never copies password or token fields (REQ-30). */
export function stripGrantSecrets(raw: unknown): GrantDto | null {
  if (!raw || typeof raw !== "object") return null;
  const rec = raw as Record<string, unknown>;
  const identityId = rec.identity_id ?? rec.identityId ?? rec.user_id ?? rec.id;
  const programmeId = rec.programme_id ?? rec.programmeId;
  if (typeof identityId !== "string" || !identityId) return null;
  if (typeof programmeId !== "string" || !programmeId) return null;
  const email =
    typeof rec.email === "string"
      ? rec.email
      : typeof rec.credential_identifier === "string"
        ? rec.credential_identifier
        : null;
  const name = typeof rec.name === "string" ? rec.name : null;
  const programmeName =
    typeof rec.programme_name === "string"
      ? rec.programme_name
      : typeof rec.programmeName === "string"
        ? rec.programmeName
        : null;
  return { identityId, programmeId, email, name, programmeName };
}

/**
 * Map an upstream failure to a refuse key. Gateflow reports unknown
 * identity/programme as 422 with {"error": {"message", "details"}}.
 */
export function grantUpstreamRefuseKey(status: number, raw: unknown): string {
  if (status === 403) return "grants.errors.wrongActor";
  const text =
    raw && typeof raw === "object"
      ? JSON.stringify(raw).toLowerCase()
      : typeof raw === "string"
        ? raw.toLowerCase()
        : "";
  if (text.includes("platform_admin")) return "grants.errors.platformAdminNotGrantable";
  if (status === 404 || status === 400 || status === 422) {
    if (text.includes("programme")) return "grants.errors.unknownProgramme";
    if (text.includes("identity") || text.includes("user") || text.includes("email")) {
      return "grants.errors.unknownIdentity";
    }
    return "grants.errors.unknownIdentity";
  }
  if (status === 409) return "grants.errors.duplicateGrant";
  return "grants.errors.actionFailed";
}

/** Log-safe upstream failure summary from an already-read error body. */
export function upstreamErrorSummary(status: number, raw: unknown): string {
  const text = raw == null ? "" : JSON.stringify(raw);
  return `upstream ${status}${text ? `: ${text.slice(0, 300)}` : ""}`;
}

export interface GrantsListTarget {
  path: string;
  /** members: IdentityReadModel[] (programme filter); identity: ProgrammeMembershipReadModel[] */
  shape: "members" | "identity";
}

/** Route the list to the gateflow endpoint that actually exists. */
export function grantsListUpstreamTarget(filter: {
  identityId?: string;
  programmeId?: string;
}): GrantsListTarget | null {
  const programmeId = filter.programmeId?.trim() ?? "";
  const identityId = filter.identityId?.trim() ?? "";
  if (programmeId) {
    return {
      path: `${UPSTREAM_PROGRAMMES_PATH}/${encodeURIComponent(programmeId)}/grants`,
      shape: "members",
    };
  }
  if (identityId) {
    return {
      path: `${UPSTREAM_IDENTITIES_PATH}/${encodeURIComponent(identityId)}/grants`,
      shape: "identity",
    };
  }
  return null;
}

/** Gateflow IdentityReadModel[] → GrantDto[] (programme member listing). */
export function membersToGrantDtos(raw: unknown, programmeId: string): GrantDto[] {
  const list = Array.isArray(raw) ? raw : [];
  return list
    .map((item): GrantDto | null => {
      if (!item || typeof item !== "object") return null;
      const rec = item as Record<string, unknown>;
      const identityId = rec.id ?? rec.identity_id;
      if (typeof identityId !== "string" || !identityId) return null;
      const email = typeof rec.email === "string" ? rec.email : null;
      const displayName = rec.display_name ?? rec.name;
      const name = typeof displayName === "string" ? displayName : null;
      return { identityId, programmeId, email, name, programmeName: null };
    })
    .filter((item): item is GrantDto => item !== null);
}

/** Gateflow ProgrammeMembershipReadModel[] → GrantDto[] (identity grant listing). */
export function membershipsToGrantDtos(raw: unknown): GrantDto[] {
  const list = Array.isArray(raw) ? raw : [];
  return list.map(stripGrantSecrets).filter((item): item is GrantDto => item !== null);
}

export function grantUpstreamPath(programmeId: string): string {
  return `${UPSTREAM_PROGRAMMES_PATH}/${encodeURIComponent(programmeId)}/grants`;
}

export function detachUpstreamPath(programmeId: string, identityId: string): string {
  return `${UPSTREAM_PROGRAMMES_PATH}/${encodeURIComponent(programmeId)}/grants/${encodeURIComponent(identityId)}`;
}

/** Gateflow IdentityGrantRequest body — identity_id only (extra=forbid). */
export function grantUpstreamBody(identityId: string): Record<string, string> {
  return { identity_id: identityId };
}

export function identitiesByEmailPath(email: string): string {
  return `${UPSTREAM_IDENTITIES_PATH}?q=${encodeURIComponent(email)}`;
}

/** Find an identity id by exact email (case-insensitive) in a gateflow identity list. */
export function resolveIdentityIdByEmail(raw: unknown, email: string): string | null {
  const target = email.trim().toLowerCase();
  if (!target) return null;
  const list = Array.isArray(raw) ? raw : [];
  for (const item of list) {
    if (!item || typeof item !== "object") continue;
    const rec = item as Record<string, unknown>;
    const recEmail = typeof rec.email === "string" ? rec.email.toLowerCase() : "";
    const id = rec.id;
    if (recEmail === target && typeof id === "string" && id) return id;
  }
  return null;
}
