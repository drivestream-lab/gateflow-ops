// Session helpers (nextjs-bff-server-auth.mdc): httpOnly cookie set by route
// handlers after server-side login; browser never holds upstream tokens.
// Pure JWT logic lives in lib/jwt.ts (client-safe, unit-tested there).
import "server-only";
import { cookies } from "next/headers";
import { env } from "@/lib/env";
import { decodeJwtPayload, isExpired, type JwtPayload } from "@/lib/jwt";

export { decodeJwtPayload, isExpired, type JwtPayload };

export async function getSessionToken(): Promise<string | null> {
  const store = await cookies();
  return store.get(env.SESSION_COOKIE)?.value ?? null;
}

export async function getSession(): Promise<JwtPayload | null> {
  const token = await getSessionToken();
  if (!token) return null;
  const payload = decodeJwtPayload(token);
  return isExpired(payload) ? null : payload;
}
