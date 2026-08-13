# Verify: W1 wave operations (INIT-GATEFLOW-016)

<!-- prayog:covers: REQ-09, REQ-10, REQ-11, REQ-12 -->

Live smoke against **real gateflow**. Unit ownership:
`tests/unit/run-stop-presentation.test.ts` (REQ-11 stop presentation).

## Prerequisites

- `AUTH_MODE=jwt-upstream`
- `UPSTREAM_BASE_URL` → live gateflow base
- Non-prod tenant with `TENANT_ADMIN` credentials
- At least one fleet-admitted repo (CAP-B) suitable for wave start
- Lab-safe wave-start inputs (initiative/wave/ticket/runner/model/workspace as
  required per lane)
- `npm run dev` (or production start) for gateflow-ops

## Steps

1. Sign in on `/login` as **tenant_admin**.
2. Open **Runs** (`/runs`) from nav (REQ-09 surface).
3. **Start wave** for each supported lane when lab fixtures allow (REQ-09):
   - Implement
   - Spec
   - Closeout  
     Success shows run id; failure surfaces a named error (no silent enqueue).
4. **Filters** (REQ-10): apply initiative/wave/org/repo/status filters; list
   updates with tenant-scoped results (empty state OK).
5. **Open a run** (REQ-11): detail shows stages/events; when status is
   `stopped`, UI presents **human checkpoint** styling (not destructive error).
6. When a run is `STOPPED` at an `external-action` node (REQ-12):
   - Forge authorize form is enabled
   - Submit with `authorized: true` + workspace path via explicit button only
   - Success is visible; console must not self-dispatch forge skills

## Negative checks

- Invalid wave-start preconditions → structured failure; no fabricated run id.
- Forge authorize when run is not STOPPED → form unavailable or upstream error
  surfaced; no silent success.
- Platform admin session cannot use Runs (redirect / wrong-role).

## Pass

All checklist steps PASS against live gateflow with **no fabricated/mock values**.

## Cleanup

Leave or cancel smoke runs per gateflow lab policy; do not merge unintended PRs.
