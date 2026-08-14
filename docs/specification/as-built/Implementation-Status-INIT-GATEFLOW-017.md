# As-Built — INIT-GATEFLOW-017 (One human, many programmes, one login)

Initiative detail. Index row lives in `implementation-status.md`.

| Wave | Capability                                                        | Status            | Verification                                                                                                                                                                          |
| ---- | ----------------------------------------------------------------- | ----------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| W0   | Programme-context chassis (ADR-002 helper + cookie + email-shape) | ✅ human_approved | unit: `tests/unit/programme-context.test.ts`, `tests/unit/auth-login-upstream.test.ts`; live: `tests/verify/01-login-status-page.md`; ground: `Ground-Report-INIT-GATEFLOW-017-W0.md` |
| W1   | Identity factory BFF/UI (CTR-01)                                  | ✅ human_approved | unit: `tests/unit/identities-bff.test.ts`; live: `tests/verify/07-identity-factory.md`; ground: `Ground-Report-INIT-GATEFLOW-017-W1.md`                                               |
| W2   | Grants + purge invite/attach (CTR-02)                             | ✅ human_approved | unit: `tests/unit/grants-bff.test.ts`; live: `tests/verify/08-grants-membership.md`; ground: `Ground-Report-INIT-GATEFLOW-017-W2.md`                                                  |
| W3   | Programme enter + delivery rebind (CTR-04, ADR-002 migration)     | ✅ human_approved | unit: `tests/unit/programme-enter.test.ts`; live: `tests/verify/09-programme-enter-delivery.md`; ground: `Ground-Report-INIT-GATEFLOW-017-W3.md`                                      |

## W0 notes

- Helper: `lib/programme-context.ts` — `getEnteredProgrammeContext()` returns
  `{ programmeId, tenantId }` or `null`; never reads JWT `tenant_id`
- Cookie: `PROGRAMME_CONTEXT_COOKIE` (default `portal_programme_context`);
  login and logout clear it; identity Bearer stays on `SESSION_COOKIE`
- `dev-stub` leaves `tenant_id` unset
- `/api/auth/me` may echo non-secret entered ids; no token fields
- Email-shape refuse: `portalLoginRefuseKey` → `auth.errors.notAnEmail` (no upstream)
- Delivery Route Handlers read entered scope from the helper as of W3 (not JWT `tenant_id`)
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
- Ground: `docs/specification/reports/Ground-Report-INIT-GATEFLOW-017-W1.md` (§Contracts produced → W2)

## W2 notes

- BFF: `GET`/`POST /api/gateflow/grants` (detach via `?op=detach`); no password on grant
- UI: membership panel on programme detail and identity detail
- Purged: `tenants/users` invite, `programme-attach`, CAP-P `tenant-admins` create+bind
- 016 verify `02` / `03` no longer prove invite/attach
- Live: human at `wave-acceptance` follows `tests/verify/08-grants-membership.md`
- Kill line: stop if CTR-02 5xx or login still 014-binds
- Ground: `docs/specification/reports/Ground-Report-INIT-GATEFLOW-017-W2.md` (§Contracts produced → W3)
- Programme-context cookie is written on enter / cleared on leave (W3)

## W3 notes

- BFF: `GET`/`POST`/`DELETE /api/auth/programme` (leave via `?op=leave` or `DELETE`)
- Enter sets `PROGRAMME_CONTEXT_COOKIE` `{ programmeId, tenantId }`; does not remint `SESSION_COOKIE`
- Delivery BFF + RSC pages use `getEnteredProgrammeContext()` only; helper `null` → named `missingTenant` / redirect to `/programmes/enter`
- CAP-P `app/api/gateflow/programmes` is **not** migrated (REQ-27 onboard stays `platform_admin`)
- UI: `/programmes/enter` for `tenant_admin` only; zero-grant named empty state; no factory list
- Live: human at `wave-acceptance` follows `tests/verify/09-programme-enter-delivery.md`
- Kill line: stop if delivery still uses JWT `tenant_id` or provider rejects identity Bearer
- Status is `human_approved` from wave-acceptance on PR #41 (not re-approved here)
- Ground: `docs/specification/reports/Ground-Report-INIT-GATEFLOW-017-W3.md` (§Contracts produced → initiative-closure)
