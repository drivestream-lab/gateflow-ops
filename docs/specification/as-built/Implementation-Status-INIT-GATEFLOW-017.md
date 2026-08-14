# As-Built — INIT-GATEFLOW-017 (One human, many programmes, one login)

Initiative detail. Index row lives in `implementation-status.md`.

| Wave | Capability                                                        | Status            | Verification                                                                                                                                                                          |
| ---- | ----------------------------------------------------------------- | ----------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| W0   | Programme-context chassis (ADR-002 helper + cookie + email-shape) | ✅ human_approved | unit: `tests/unit/programme-context.test.ts`, `tests/unit/auth-login-upstream.test.ts`; live: `tests/verify/01-login-status-page.md`; ground: `Ground-Report-INIT-GATEFLOW-017-W0.md` |
| W1   | Identity factory BFF/UI (CTR-01)                                  | 🔧 implemented    | unit: `tests/unit/identities-bff.test.ts`; live: `tests/verify/07-identity-factory.md` (human at wave-acceptance)                                                                     |
| W2   | Grants + purge invite/attach (CTR-02)                             | ⏳ not started    | `tests/verify/08-grants-membership.md` (planned)                                                                                                                                      |
| W3   | Programme enter + delivery rebind (CTR-04, ADR-002 migration)     | ⏳ not started    | `tests/verify/09-programme-enter-delivery.md` (planned)                                                                                                                               |

## W0 notes

- Helper: `lib/programme-context.ts` — `getEnteredProgrammeContext()` returns
  `{ programmeId, tenantId }` or `null`; never reads JWT `tenant_id`
- Cookie: `PROGRAMME_CONTEXT_COOKIE` (default `portal_programme_context`);
  login and logout clear it; identity Bearer stays on `SESSION_COOKIE`
- `dev-stub` leaves `tenant_id` unset
- `/api/auth/me` may echo non-secret entered ids; no token fields
- Email-shape refuse: `portalLoginRefuseKey` → `auth.errors.notAnEmail` (no upstream)
- Delivery Route Handlers still read JWT `tenant_id` until W3 (do not half-migrate)
- Live: human at `wave-acceptance` follows `tests/verify/01-login-status-page.md`
- Ground: `docs/specification/reports/Ground-Report-INIT-GATEFLOW-017-W0.md` (§Contracts produced → W1/W3)

## W1 notes

- BFF: `GET`/`POST /api/gateflow/identities`, `GET`/`POST /api/gateflow/identities/by-id?id=&op=`
- UI: `/identities` list + enter + search; detail via `?id=` (no App Router `[id]` folder)
- Nav: `platform_admin` only (`/identities`); `tenant_admin` redirected
- Entry always sends role `tenant_admin`; password is write-only after set
- Grant/detach and programme-enter are W2/W3 — not on this surface
- Live: human at `wave-acceptance` follows `tests/verify/07-identity-factory.md`
- Kill line: stop if CTR-01 5xx or membership still 014-binds
