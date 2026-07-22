// Pure JWT helpers — no server dependencies, unit-testable directly.
// Session/cookie access lives in lib/auth.ts (server-only).

export type JwtPayload = {
  sub?: string;
  email?: string;
  tenant_id?: string;
  exp?: number;
  [k: string]: unknown;
};

/** Decode WITHOUT verifying — verification is the upstream's job; the BFF
 *  forwards the token and treats upstream 401 as the source of truth. */
export function decodeJwtPayload(token: string): JwtPayload | null {
  const parts = token.split(".");
  const payload = parts.length === 3 ? parts[1] : undefined;
  if (!payload) return null;
  try {
    return JSON.parse(Buffer.from(payload, "base64url").toString("utf8"));
  } catch {
    return null;
  }
}

export function isExpired(payload: JwtPayload | null): boolean {
  return !payload?.exp || payload.exp * 1000 < Date.now();
}
