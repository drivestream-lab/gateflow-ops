# As-Built — INIT-GATEFLOW-017 (One human, many programmes, one login)

Initiative detail. Index row lives in `implementation-status.md`.

| Wave | Capability                                                        | Status         | Verification                                                                                                                                                                           |
| ---- | ----------------------------------------------------------------- | -------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| W0   | Programme-context chassis (ADR-002 helper + cookie + email-shape) | 🔧 implemented | unit: `tests/unit/programme-context.test.ts`, `tests/unit/auth-login-upstream.test.ts`; live: `tests/verify/01-login-status-page.md` (`prayog:covers: REQ-03, REQ-12, REQ-14, REQ-18`) |
| W1   | Identity factory BFF/UI (CTR-01)                                  | ⏳ not started | `tests/verify/07-identity-factory.md` (planned)                                                                                                                                        |
| W2   | Grants + purge invite/attach (CTR-02)                             | ⏳ not started | `tests/verify/08-grants-membership.md` (planned)                                                                                                                                       |
| W3   | Programme enter + delivery rebind (CTR-04, ADR-002 migration)     | ⏳ not started | `tests/verify/09-programme-enter-delivery.md` (planned)                                                                                                                                |

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
