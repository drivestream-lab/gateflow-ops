/**
 * Map portal login form fields to gateflow LoginRequest (INIT-GATEFLOW-014).
 * Portal UI keeps email/password; upstream expects credential_identifier.
 */
export function toUpstreamLoginBody(input: {
  email?: string;
  password?: string;
}): { credential_identifier: string; password: string } | null {
  const identifier = input.email?.trim();
  const password = input.password;
  if (!identifier || !password) return null;
  return { credential_identifier: identifier, password };
}

/** Gateflow JWT login path (mounted under /api). */
export const UPSTREAM_AUTH_LOGIN_PATH = "/api/auth/login";
