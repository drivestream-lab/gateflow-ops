# Verify: login → session → status page (the hello world)

Live verification of the full chassis. Needs `npm run dev` running and
`UPSTREAM_BASE_URL` pointing at live gateflow (status probes `GET /health`).
Unit tests owning shared logic: `tests/unit/auth.test.ts`, `tests/unit/bff.test.ts`.

## Steps

1. `cp .env.example .env` (set `UPSTREAM_BASE_URL` → gateflow; prefer `AUTH_MODE=jwt-upstream`)
2. `npm run dev` → open http://localhost:3000
3. Expect redirect to `/login` (server-side layout guard)
4. Sign in with valid gateflow credentials (`jwt-upstream`) — or any email/password if temporarily on `dev-stub` (upstream health still requires reachable gateflow)
5. Expect the System status page inside WorkspaceShell:
   - Page header title is “System status” (not a Welcome hero)
   - One status Card: operator, role/tenant when present, session expiry, upstream
   - “Upstream API ✓ connected (…ms)” (BFF probe via gateflow `GET /health`)
6. `curl -s localhost:3000/api/health` → `{"status":"ok"}` (this app’s own health)
7. Sign out → expect redirect to `/login`; revisiting `/` redirects again

## Pass = all seven observations hold.
