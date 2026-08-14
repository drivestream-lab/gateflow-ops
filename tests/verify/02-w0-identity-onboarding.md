# Verify: W0 identity + fleet onboarding (INIT-GATEFLOW-016)

<!-- prayog:covers: REQ-01, REQ-03, REQ-04, REQ-05, REQ-06, REQ-07, REQ-08 -->

Live smoke against **real gateflow** (not the chassis echo). Unit ownership:
`tests/unit/onboarding-verdict.test.ts` (REQ-07 composition).

## Prerequisites

- `AUTH_MODE=jwt-upstream`
- `UPSTREAM_BASE_URL` → live gateflow base
- Non-prod tenant with `TENANT_ADMIN` credentials (gateflow identity)
- `npm run dev` (or production start) for gateflow-ops
- Login BFF uses gateflow `POST /api/auth/login` (portal form email →
  `credential_identifier`)
- Programme meta org/repo known (same as platform onboard). Until gateflow
  Q-4 auto-connect ships, tenant may need a one-time **Connect programme meta**
  after attach.

## Steps

1. Sign in on `/login` with a TENANT_ADMIN identity for the target tenant
   (`AUTH_MODE=jwt-upstream` → real JWT cookie with `tenant_id`).
2. Open **Tenant** (`/tenant`):
   - Tenant detail shows id/name/workspace for the **session tenant** (REQ-01).
   - Confirm there is **no** invite / teammate-attach control (017 REQ-20 supersedes 016 invite).
3. Open **Fleet** (`/fleet`):
   - **Active fleet** is the lead section (may be empty).
   - If disconnected: connect with meta **org/repo only** (no git ref field) (REQ-04).
   - If already connected: **Re-sync meta** is available; catalogue is unlocked.
   - Catalogue list renders; refresh updates candidates (REQ-03).
4. Admit one catalogue candidate (**Admit to fleet**) (REQ-05):
   - Outcome text is operator-readable (not a raw enum only).
   - Confirm this is **fleet onboard** — the page does **not** start a wave
     (waves remain CAP-C / W1).
5. Readiness refresh runs (REQ-06); UI shows a **single** pass/fail **fleet onboard**
   verdict with no partial membership state (REQ-07).
6. Deselect the admitted repo; it leaves the active fleet list (REQ-08).
7. Confirm left nav + page header/body chrome is shared — pages do not invent parallel shell chrome.

## Negative checks

- Fail select outcomes (`setup_failed` / `probe_failed` / `status_failed` / `out_of_catalogue`) present **fail** verdict and do not look “half onboarded”.
- Empty catalogue / no connection shows well-formed empty copy, not a hard crash.
- Connect / onboard forms do **not** collect a git ref / `meta_ref`.

## Pass

All checklist steps PASS against live gateflow with **no fabricated/mock values**.

## Cleanup

Remove smoke-only invites/tickets if created.
