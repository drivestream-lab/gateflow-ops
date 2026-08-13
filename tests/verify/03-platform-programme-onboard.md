# Verify: platform programme onboard + tenant_admin attach (CAP-P)

<!-- prayog:covers: REQ-32, REQ-33, REQ-34, REQ-35, REQ-36, REQ-37 -->

Live smoke against **real gateflow**. Unit ownership:
`tests/unit/platform-programmes.test.ts` (nav filter, attach token strip).

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
2. Confirm left nav shows **System status** and **Programmes** only — not
   Tenant / Fleet (REQ-36).
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
6. Attach a **tenant_admin** with a new `credential_identifier` + password
   (REQ-35).
   - Success message appears; **no** access token is shown in the UI or network
     JSON for the BFF response.
7. Sign out. Sign in as the attached tenant_admin.
8. Confirm nav shows Status + Tenant + Fleet; Tenant detail loads for the
   programme’s child tenant.
9. Open **Fleet**: until gateflow auto-connect (INIT-016 Q-4) ships, connect
   once with the same meta org/repo if catalogue is still gated; confirm Fleet
   does not offer wave-start controls (CAP-C deferred).

## Negative checks

- Signed in as tenant_admin, `/programmes` redirects away (no create UI).
- Signed in as platform_admin, `/tenant` and `/fleet` redirect away.
- BFF `POST /api/gateflow/programmes/.../tenant-admins` response body has no
  `access_token` field.
- Onboard UI does not collect or submit `workspace_root` or `meta_ref`.

## Pass

All checklist steps PASS against live gateflow with **no fabricated/mock values**.

## Cleanup

Wipe or leave lab programme per gateflow lab policy; rotate smoke passwords if
needed.
