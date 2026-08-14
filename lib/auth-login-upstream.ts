/**
 * Map portal login form fields to gateflow LoginRequest (INIT-GATEFLOW-014).
 * Portal UI keeps email/password; upstream expects credential_identifier.
 * REQ-03: identifier must be an email shape before any upstream call.
 */
export const LOGIN_ERROR_NOT_AN_EMAIL = "auth.errors.notAnEmail";
export const LOGIN_ERROR_INVALID_REQUEST = "auth.errors.invalidRequest";

export function isEmailIdentifier(identifier: string): boolean {
  const at = identifier.indexOf("@");
  if (at <= 0) return false;
  return identifier.slice(at + 1).length > 0;
}

export function portalLoginRefuseKey(input: { email?: string; password?: string }): string | null {
  const identifier = input.email?.trim() ?? "";
  if (!isEmailIdentifier(identifier)) return LOGIN_ERROR_NOT_AN_EMAIL;
  if (!input.password) return LOGIN_ERROR_INVALID_REQUEST;
  return null;
}

export function toUpstreamLoginBody(input: {
  email?: string;
  password?: string;
}): { credential_identifier: string; password: string } | null {
  if (portalLoginRefuseKey(input)) return null;
  const identifier = input.email?.trim() ?? "";
  const password = input.password ?? "";
  return { credential_identifier: identifier, password };
}

/** Gateflow JWT login path (mounted under /api). */
export const UPSTREAM_AUTH_LOGIN_PATH = "/api/auth/login";
