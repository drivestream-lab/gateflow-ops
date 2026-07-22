"use client";
// Client → this app ONLY, relative URLs (nextjs-bff-server-auth.mdc).
// 401 redirects to login. Login pages use plain fetch for POST /api/auth/*.

export async function authFetch(input: string, init?: RequestInit): Promise<Response> {
  if (!input.startsWith("/api/")) {
    throw new Error(`authFetch only calls same-origin /api/* paths, got: ${input}`);
  }
  const res = await fetch(input, { ...init, credentials: "same-origin" });
  if (res.status === 401 && typeof window !== "undefined") {
    window.location.assign(`/login?next=${encodeURIComponent(window.location.pathname)}`);
  }
  return res;
}
