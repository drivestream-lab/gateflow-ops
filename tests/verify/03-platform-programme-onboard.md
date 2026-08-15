# Verify: platform programme onboard (CAP-P)

<!-- prayog:covers: REQ-32, REQ-33, REQ-34, REQ-36, REQ-37 -->

Live smoke against **real gateflow**. Unit ownership:
`tests/unit/platform-programmes.test.ts` (nav filter, programme read model).
016 attach (former REQ-35) is purged — grant/detach lives in
`tests/verify/08-grants-membership.md`.

## Prerequisites

- `AUTH_MODE=jwt-upstream`
- `UPSTREAM_BASE_URL` → live gateflow base
- Seeded `platform_admin` credentials (gateflow identity seed)
- Gateflow host has absolute `GATEFLOW_WORKSPACE_ROOT` configured (ops does
  **not** collect workspace)
- Lab-safe programme onboard inputs: `meta_org`, `meta_repo`, and a GitHub PAT
  with read access to that meta repo (ops does **not** collect `meta_ref` or
  `workspace_root`)
- Meta catalogue `links.repo` values are `https://github.com/{org}/{repo}`
  (SSH URLs are rejected upstream)
- `npm run dev` (or production start) for gateflow-ops

## Steps

1. Sign in on `/login` as **platform_admin**.
2. Confirm left nav shows **Programmes** and **Identities** — not Tenant /
   Fleet / System status (REQ-36). `/` redirects to Programmes.
3. Open **Programmes** (`/programmes`): list renders (empty state OK) (REQ-32).
4. Click **Onboard programme** (`/programmes/new`). Submit validate-then-create
   with name + meta org/repo + PAT only — **no** workspace or meta-ref field (REQ-33).
   - On success, navigate to programme detail.
   - PAT field must not reappear on the detail page.
5. On detail (`/programmes/{id}`): confirm name, programme id, tenant id, meta,
   workspace root, and **repo catalogue** candidates (org/repo/service key/status)
   are visible without secrets (REQ-34). Catalogue is informational — not fleet
   membership. Empty catalogue is allowed for programmes created before gateflow
   catalogue persistence.
   5b. Click **Refresh catalogue** (REQ-37): candidates update from meta (or a named
   failure is shown). No Fleet connect required.
6. Confirm there is **no** attach form collecting credential + password
   (017 REQ-21). Membership grant (no password) is a separate control — prove
   it in `08-grants-membership.md`, not here.

## Negative checks

- Signed in as tenant_admin, `/programmes` redirects away (no create UI).
- Signed in as platform_admin, `/tenant` and `/fleet` redirect away.
- `POST /api/gateflow/programmes/.../tenant-admins` is absent (404).
- Onboard UI does not collect or submit `workspace_root` or `meta_ref`.

## Pass

All checklist steps PASS against live gateflow with **no fabricated/mock values**.

## Cleanup

Wipe or leave lab programme per gateflow lab policy.
