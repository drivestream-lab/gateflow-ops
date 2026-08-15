// Pure helpers for the auth/programme BFF route (CTR-04 enter / leave).
// Gateflow tenant flow (INIT-GATEFLOW-017 W3), mounted at /api:
//   GET  /api/auth/me                 → AuthSessionSnapshot (identity + grants)
//   POST /api/auth/session/programme  → enter a granted programme (no JWT remint)
// Gateflow user JWTs carry no tenant_id claim and grants carry no tenant_id;
// tenantId stays null here until gateflow exposes the programme tenant binding.

export const UPSTREAM_ME_PATH = "/api/auth/me";
export const UPSTREAM_ENTER_PATH = "/api/auth/session/programme";

export interface GrantedProgrammeDto {
  programmeId: string;
  tenantId: string | null;
  programmeName: string | null;
}

export interface EnterWriteInput {
  programmeId?: string;
  password?: string;
}

export function enterWriteRefuseKey(input: EnterWriteInput): string | null {
  if (input.password) return "programmes.errors.passwordNotAllowed";
  if (!input.programmeId?.trim()) return "programmes.errors.notGranted";
  return null;
}

/**
 * Whitelist DTO for one grant row — never copies password or token fields.
 * Gateflow ProgrammeMembershipReadModel: {id, identity_id, programme_id}.
 */
export function stripGrantedProgramme(raw: unknown): GrantedProgrammeDto | null {
  if (!raw || typeof raw !== "object") return null;
  const rec = raw as Record<string, unknown>;
  const programmeId = rec.programme_id ?? rec.programmeId;
  if (typeof programmeId !== "string" || !programmeId) return null;
  const tenantRaw = rec.tenant_id ?? rec.tenantId;
  const tenantId = typeof tenantRaw === "string" && tenantRaw ? tenantRaw : null;
  const nameRaw = rec.programme_name ?? rec.programmeName;
  const programmeName = typeof nameRaw === "string" && nameRaw ? nameRaw : null;
  return { programmeId, tenantId, programmeName };
}

/** Grant list from an AuthSessionSnapshot ({grants: [...]}). */
export function snapshotGrants(raw: unknown): GrantedProgrammeDto[] {
  if (!raw || typeof raw !== "object") return [];
  const grants = (raw as Record<string, unknown>).grants;
  const list = Array.isArray(grants) ? grants : [];
  return list
    .map(stripGrantedProgramme)
    .filter((item): item is GrantedProgrammeDto => item !== null);
}

/**
 * Confirm an enter response: AuthSessionSnapshot.entered_programme_id must
 * match the requested programme (grant list is the fallback evidence).
 */
export function snapshotEnteredProgramme(
  raw: unknown,
  requestedProgrammeId: string,
): GrantedProgrammeDto | null {
  const requested = requestedProgrammeId.trim();
  if (!requested || !raw || typeof raw !== "object") return null;
  // Resolve tenant/name from the grant row whenever possible —
  // entered_programme_id alone carries no tenant binding.
  const grant = snapshotGrants(raw).find((item) => item.programmeId === requested) ?? null;
  const rec = raw as Record<string, unknown>;
  if (rec.entered_programme_id === requested) {
    return grant ?? { programmeId: requested, tenantId: null, programmeName: null };
  }
  return grant;
}

export interface LastProgrammeRef {
  sub: string;
  programmeId: string;
}

export function parseLastProgrammeCookie(raw: string | undefined | null): LastProgrammeRef | null {
  if (!raw) return null;
  try {
    const parsed: unknown = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object") return null;
    const rec = parsed as Record<string, unknown>;
    if (typeof rec.sub !== "string" || typeof rec.programmeId !== "string") return null;
    if (!rec.sub || !rec.programmeId) return null;
    return { sub: rec.sub, programmeId: rec.programmeId };
  } catch {
    return null;
  }
}

export function lastProgrammeCookieValue(ref: LastProgrammeRef): string {
  return JSON.stringify(ref);
}

/**
 * Choose which programme to auto-enter at login: the remembered choice wins
 * when the same identity still holds that grant; a single grant auto-enters;
 * otherwise null (chooser page decides).
 */
export function pickAutoEnterProgramme(
  grants: GrantedProgrammeDto[],
  last: LastProgrammeRef | null,
  sub: string | null,
): GrantedProgrammeDto | null {
  if (last && sub && last.sub === sub) {
    const remembered = grants.find((g) => g.programmeId === last.programmeId);
    if (remembered) return remembered;
  }
  if (grants.length === 1) return grants[0] ?? null;
  return null;
}

/**
 * Map an upstream failure to a refuse key. Gateflow enter refusals:
 * 403 {"details": {"reason": "not granted"}} — role guards use "wrong actor".
 */
export function enterUpstreamRefuseKey(status: number, raw: unknown): string {
  const text =
    raw && typeof raw !== "object"
      ? String(raw).toLowerCase()
      : raw && typeof raw === "object"
        ? JSON.stringify(raw).toLowerCase()
        : "";
  if (status === 403) {
    return text.includes("not granted") || text.includes("not_granted")
      ? "programmes.errors.notGranted"
      : "programmes.errors.wrongActor";
  }
  if (status === 401) return "auth.errors.sessionExpired";
  if (status === 404 || status === 400 || status === 422) {
    return "programmes.errors.notGranted";
  }
  return "programmes.errors.actionFailed";
}
