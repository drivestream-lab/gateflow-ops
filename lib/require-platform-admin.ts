import "server-only";
import { getSession, getSessionToken, decodeJwtPayload, type JwtPayload } from "@/lib/auth";
import { bffError } from "@/lib/bff";
import { isPlatformAdmin } from "@/lib/session-role";

export interface PlatformAdminSession {
  token: string;
  payload: JwtPayload;
}

/** Require httpOnly session + platform_admin role for CAP-P BFF routes. */
export async function requirePlatformAdminSession(): Promise<PlatformAdminSession | Response> {
  const token = await getSessionToken();
  if (!token) return bffError(401, "auth.errors.sessionExpired");
  const payload = decodeJwtPayload(token);
  const session = await getSession();
  if (!session || !payload) return bffError(401, "auth.errors.sessionExpired");
  if (!isPlatformAdmin(session)) {
    return bffError(403, "programmes.errors.platformAdminRequired");
  }
  return { token, payload };
}
