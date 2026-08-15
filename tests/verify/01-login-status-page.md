# Verify: login → session → status page (the hello world)

<!-- prayog:covers: REQ-03, REQ-12, REQ-14, REQ-18 -->

Live verification of the chassis plus INIT-GATEFLOW-017 W0 programme-context
cookie coupling. Needs `npm run dev` running and `UPSTREAM_BASE_URL` pointing
at live gateflow (status probes `GET /health`).

Unit tests owning shared logic: `tests/unit/auth.test.ts`,
`tests/unit/bff.test.ts`, `tests/unit/auth-login-upstream.test.ts`,
`tests/unit/programme-context.test.ts`.

016 verify files that mark `REQ-01`–`REQ-31` cover **016** behavior, not 017.

## Prerequisites

- `cp .env.example .env` (set `UPSTREAM_BASE_URL` → gateflow; prefer `AUTH_MODE=jwt-upstream`)
- Existing lab login; do **not** create a factory identity
- Cookie names: `SESSION_COOKIE` (default `portal_session`) and
  `PROGRAMME_CONTEXT_COOKIE` (default `portal_programme_context`)

## Steps

1. `npm run dev` → open http://localhost:3000
2. Expect redirect to `/login` (server-side layout guard)
3. Sign in with valid gateflow credentials (`jwt-upstream`) — or any
   well-formed email/password if temporarily on `dev-stub` (upstream health
   still requires reachable gateflow)
4. Expect a **role home** inside WorkspaceShell (not a System status page):
   - `platform_admin` lands on **Programmes**
   - `tenant_admin` with no entered programme lands on **Enter a programme**
   - `tenant_admin` after enter lands on **Runs**
   - Chrome shows upstream health (connected / unreachable) — not a nav item
   - Sidebar shows the signed-in operator; no “System status” nav row
5. `curl -s localhost:3000/api/health` → `{"status":"ok"}` (this app’s own health)
6. **REQ-03 — malformed email refused (no upstream sign-in):** from a signed-out
   browser or `curl`, `POST /api/auth/login` with JSON
   `{"email":"not-an-email","password":"x"}`. Expect HTTP 400 and the named
   “not an email” error (not a 5xx). No `portal_session` cookie is set.
   Repeat with `{"email":"ops@","password":"x"}` — same refuse.
7. Sign in with a valid email. `GET /api/auth/me` with the session cookie:
   JSON has `sub` / `email` as applicable; **no** `access_token`, `token`, or
   raw JWT fields. `enteredProgrammeId` and `enteredTenantId` are `null`
   (helper empty after login — REQ-18 chassis).
8. Sign out → expect redirect to `/login`; revisiting `/` redirects again.
   Confirm **both** `portal_session` and `portal_programme_context` are cleared
   (browser Application → Cookies, or `Set-Cookie` `Max-Age=0` on
   `POST /api/auth/logout`).

## Pass = all eight observations hold.

Stop if unexpected 5xx or if `/api/auth/me` leaks a token. Do not start Pass-2.
