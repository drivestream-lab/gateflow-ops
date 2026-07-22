# Verify: login → session → status page (the hello world)

Live verification of the full chassis. Needs `npm run dev` running.
Unit tests owning shared logic: `tests/unit/auth.test.ts`, `tests/unit/bff.test.ts`.

## Steps

1. `cp .env.example .env` (defaults point upstream at the dev echo)
2. `npm run dev` → open http://localhost:3000
3. Expect redirect to `/login` (server-side layout guard)
4. Sign in with any email/password (AUTH_MODE=dev-stub)
5. Expect the System status page:
   - "Signed in as" shows your email (session decoded server-side)
   - "Upstream API ✓ connected (…ms)" (BFF round-trip via authFetch + Query)
6. `curl -s localhost:3000/api/health` → `{"status":"ok"}`
7. Sign out → expect redirect to `/login`; revisiting `/` redirects again

## Pass = all seven observations hold.
