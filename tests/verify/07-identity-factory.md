# Verify: identity factory (INIT-GATEFLOW-017 W1)

<!-- prayog:covers: REQ-01, REQ-02, REQ-04, REQ-05, REQ-12, REQ-13, REQ-14, REQ-22, REQ-25, REQ-29, REQ-30 -->

Live smoke against **real gateflow CTR-01**. Do **not** treat
`tests/verify/02-w0-identity-onboarding.md` (016 REQ-01–08) as 017 factory
coverage.

Unit ownership: `tests/unit/identities-bff.test.ts` (create/password refuse,
secret strip, name/email search filter).

## Prerequisites

- Gateflow **CTR-01** is live (identity enter / list / search / suspend /
  unsuspend / password-set). If the provider returns 5xx, or creating an
  identity still 014-binds a programme membership, **stop** — do not accept
  this wave.
- `AUTH_MODE=jwt-upstream`
- `UPSTREAM_BASE_URL` → live gateflow base
- Seeded `platform_admin` lab login
- A separate seeded `tenant_admin` lab login (must not see the factory)
- W0 programme-context chassis merged
- Synthetic lab-domain email that does not already exist (e.g. `factory-w1-*@lab.example`)
- `npm run dev` (or production start) for gateflow-ops

## Steps

1. Sign in on `/login` as **platform_admin**.
2. Confirm left nav shows **Identities** (`/identities`) and **Programmes** —
   not Tenant / Fleet / System status (REQ-22). `/` redirects to Programmes.
3. Open **Identities**. Enter a human: name, email, password. No programme
   field is present (REQ-01).
   - Success: the identity appears on the list with that name and email;
     role is `tenant_admin` (REQ-05).
   - Network JSON for `POST /api/gateflow/identities` and the list has **no**
     `password`, `access_token`, or `token` fields (REQ-30).
4. Enter the **same email** again. Expect a named duplicate-email refuse;
   the first identity is unchanged (REQ-02).
5. Search by a name substring (mixed case) and by the exact email (mixed
   case). Matching rows appear. A query with no match shows the empty
   state — not an error (REQ-04).
6. Open the identity (`/identities?id=…`). Suspend it (REQ-12).
   - Sign out. Sign in with that identity’s email/password — sign-in is
     refused (suspended).
   - If a session was already open for that identity in another browser,
     product reads fail after suspend.
7. As **platform_admin**, unsuspend (REQ-13). The identity can sign in
   again. No grant/membership screen is shown in this wave.
8. As **platform_admin**, set a new password (REQ-14).
   - Sign in works only with the new password.
   - Prior password fails. Prior session cannot continue.
   - Password-set response JSON has no password field (REQ-30).
9. Sign in as **tenant_admin**. Confirm **Identities** is absent from nav
   and `/identities` redirects away. `POST /api/gateflow/identities` with
   that session is refused (wrong actor); 0 identities created (REQ-22).

## Negative checks

- Entry without a name is refused (missing name) (REQ-25).
- Entry with `plain` or `ops@` as the email is refused (not an email)
  (REQ-03 / REQ-25 companion).
- Entry without a password is refused (missing password) (REQ-29).
- Factory UI never displays a password after set (REQ-30).
- No grant, detach, or programme-enter controls on this page (W2/W3).

## Pass

All checklist steps PASS against live CTR-01 with **no fabricated/mock
values**. Kill line did not trip.

## Cleanup

Leave or wipe the synthetic factory identity per lab policy; rotate the
smoke password if the identity is kept.
