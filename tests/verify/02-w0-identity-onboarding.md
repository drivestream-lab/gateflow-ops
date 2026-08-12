# Verify: W0 identity + fleet onboarding (INIT-GATEFLOW-016)

<!-- prayog:covers: REQ-01, REQ-02, REQ-03, REQ-04, REQ-05, REQ-06, REQ-07, REQ-08 -->

Live smoke against **real gateflow** (not the chassis echo). Unit ownership:
`tests/unit/onboarding-verdict.test.ts` (REQ-07 composition).

## Prerequisites

- `AUTH_MODE=jwt-upstream`
- `UPSTREAM_BASE_URL` → live gateflow base
- Non-prod tenant with `TENANT_ADMIN` credentials
- `npm run dev` (or production start) for gateflow-ops

## Steps

1. Sign in with a TENANT_ADMIN session for the target tenant.
2. Open **Tenant** (`/tenant`):
   - Tenant detail shows id/name/workspace for the **session tenant** (REQ-01).
   - Invite a teammate with a safe non-prod identity; success message appears (REQ-02).
3. Open **Fleet** (`/fleet`):
   - Connect or re-sync programme meta (`org`/`repo`) (REQ-04).
   - Catalogue list renders; refresh updates candidates (REQ-03).
4. Admit one catalogue candidate (REQ-05):
   - Outcome text is operator-readable (not a raw enum only).
5. Readiness refresh runs (REQ-06); UI shows a **single** pass/fail verdict with no partial membership state (REQ-07).
6. Deselect the admitted repo; it leaves the active fleet list (REQ-08).
7. Confirm left nav + page header/body chrome is shared — pages do not invent parallel shell chrome.

## Negative checks

- Fail select outcomes (`setup_failed` / `probe_failed` / `status_failed` / `out_of_catalogue`) present **fail** verdict and do not look “half onboarded”.
- Empty catalogue / no connection shows well-formed empty copy, not a hard crash.

## Pass

All checklist steps PASS against live gateflow with **no fabricated/mock values**.

## Cleanup

Remove smoke-only invites/tickets if created.
