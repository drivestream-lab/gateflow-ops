# Verify: programme enter and delivery rebind (INIT-GATEFLOW-017 W3)

<!-- prayog:covers: REQ-16, REQ-17, REQ-18, REQ-19, REQ-22, REQ-23, REQ-26, REQ-27 -->

Live smoke against **real gateflow CTR-04**. Do **not** treat 016
`tests/verify/04-w2-initiative-tracking.md` (that file’s `REQ-16` is 016
initiative tracking) or `tests/verify/08-grants-membership.md` as 017 enter
coverage.

Unit ownership: `tests/unit/programme-enter.test.ts` (not-granted / missing
context named refuse, secret strip, no JWT `tenant_id` fallback).

## Prerequisites

- Gateflow **CTR-04** is live (list granted programmes for this sign-in;
  enter one). If the provider returns 5xx, or delivery still scopes from JWT
  `tenant_id`, or the provider rejects identity Bearer, **stop** — do not
  accept this wave.
- `AUTH_MODE=jwt-upstream`
- `UPSTREAM_BASE_URL` → live gateflow base
- Seeded `platform_admin` lab login
- A W1 factory identity granted **two** onboarded programmes (W2 grants)
- A second factory identity with **zero** grants (REQ-18)
- `npm run dev` (or production start) for gateflow-ops

## Steps

1. Sign in as the **granted** `tenant_admin`. Open `/programmes/enter`.
   Confirm only granted programmes are listed. Confirm there is **no**
   factory identity list, no grant/detach, and no password field (REQ-16,
   REQ-22, REQ-26).
2. Enter **programme P1**. Status / `/api/auth/me` shows
   `enteredProgrammeId` / `enteredTenantId` for P1 (not JWT `tenant_id`).
   Open Fleet, Meta PRs, Runs (checkpoints section), Initiatives, Metrics, Board —
   016 delivery acts succeed in P1 (REQ-16, REQ-19). Network JSON has
   **no** `password` or `access_token`.
3. Return to `/programmes/enter` and enter **programme P2**. Delivery now
   uses P2 (different tenant / repos). Work can start in both granted
   programmes; one active wave per repo still holds (REQ-17).
4. Leave the programme. Delivery pages redirect to `/programmes/enter`.
   `/api/auth/me` entered ids are `null`.
5. Sign out. Sign in as the **zero-grant** identity. They are signed in.
   `/programmes/enter` shows the named empty state. Fleet / Runs / Metrics
   do not run delivery (REQ-18).
6. Sign in as **platform_admin**. Confirm `/programmes/enter` is not in
   nav (redirect or wrong actor). Confirm programme onboard and catalogue
   still work (REQ-27). Confirm delivery (Fleet / Runs / wave start) is
   refused (REQ-23).
7. As `tenant_admin`, confirm `/identities` is hidden / redirected and
   grant/detach BFF is wrong-actor (REQ-22, REQ-26).
8. Confirm Tenant has **no** invite / teammate-attach control
   (`POST /api/gateflow/tenants/users` is 404) (REQ-19).

## Negative checks

- Enter a programme id that is **not** granted → named not-granted refuse
  (REQ-16).
- Enter body with a password is refused (password not allowed).
- `platform_admin` cannot set the programme-context cookie via
  `POST /api/auth/programme`.
- CAP-P `GET`/`POST /api/gateflow/programmes` still requires
  `platform_admin` and does **not** read the enter helper (REQ-27).

## Pass

All checklist steps PASS against live CTR-04 with **no fabricated/mock
values**. Kill line did not trip.

## Cleanup

Leave the entered programme; sign out. Do not detach W2 grants unless the
lab policy requires it.
