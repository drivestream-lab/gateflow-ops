# Verify: grants and membership (INIT-GATEFLOW-017 W2)

<!-- prayog:covers: REQ-06, REQ-07, REQ-08, REQ-09, REQ-10, REQ-11, REQ-15, REQ-20, REQ-21, REQ-24, REQ-28, REQ-30 -->

Live smoke against **real gateflow CTR-02**. Do **not** treat 016
`tests/verify/02-w0-identity-onboarding.md` or
`tests/verify/03-platform-programme-onboard.md` as 017 grant coverage.

Unit ownership: `tests/unit/grants-bff.test.ts` (unknown identity/programme
refuse, password-on-grant refuse, secret strip).

## Prerequisites

- Gateflow **CTR-02** is live (grant / detach / membership list). If the
  provider returns 5xx, or login still 014-binds a programme, **stop** — do
  not accept this wave.
- `AUTH_MODE=jwt-upstream`
- `UPSTREAM_BASE_URL` → live gateflow base
- Seeded `platform_admin` lab login
- A W1 factory identity (synthetic lab-domain email) and an onboarded programme
- Optional second onboarded programme for REQ-09
- Optional in-flight wave on a granted programme’s repo for REQ-15
- `npm run dev` (or production start) for gateflow-ops

## Steps

1. Sign in as **platform_admin**. Open a programme detail. Confirm
   **Membership** is visible without opening a delivery screen (REQ-11).
   Confirm there is no password field on grant (REQ-06, REQ-30).
2. Grant the existing factory identity (email or id) to that programme.
   - Success: membership row appears; no new login/password collected (REQ-06).
   - Network JSON has **no** `password` or `access_token` (REQ-30).
3. Grant the **same** identity to the **same** programme again. Success;
   still one grant (REQ-07).
4. Grant the same identity a **second** programme. Both grants exist; one
   email (REQ-09).
5. Grant an email that is **not** on the factory list. Named unknown-identity
   refuse; 0 grant (REQ-08).
6. Grant or detach a programme id that is **not** onboarded. Named
   unknown-programme refuse (REQ-28).
7. Grant the seeded `platform_admin` as `tenant_admin`. Refused (REQ-06).
8. If the factory identity is suspended, grant or detach still succeeds
   (REQ-24). They still cannot sign in until unsuspended.
9. Detach one grant (REQ-10). That grant is gone; identity remains; other
   grants remain; programme is not wiped.
10. If a wave is in flight on a detached programme’s repo, it **continues**
    (REQ-15). That identity cannot start further work in the detached
    programme.
11. Open identity detail (`/identities?id=`): programmes they can enter are
    listed (REQ-11). No password shown.
12. Confirm **Tenant** has no invite control and
    `POST /api/gateflow/tenants/users` is 404 (REQ-20).
13. Confirm `POST /api/gateflow/programmes/{id}/tenant-admins` is 404
    (REQ-21).

## Negative checks

- `tenant_admin` cannot open grant/detach (wrong actor / redirect).
- Grant body with a password is refused (password not allowed).
- Membership JSON/UI never displays a password (REQ-30).

## Pass

All checklist steps PASS against live CTR-02 with **no fabricated/mock
values**. Kill line did not trip.

## Cleanup

Detach synthetic grants; leave or wipe lab identities per policy.
