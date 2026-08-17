# Verify: W2 initiative tracking (INIT-GATEFLOW-016)

<!-- prayog:covers: REQ-13, REQ-14, REQ-15, REQ-16, REQ-17, REQ-18, REQ-19, REQ-20, REQ-21 -->

Live smoke against **real gateflow**. Unit ownership:
`tests/unit/initiative-composition.test.ts` (wave-map status + honest gaps).

## Prerequisites

- `AUTH_MODE=jwt-upstream`
- `UPSTREAM_BASE_URL` → live gateflow base
- Non-prod tenant with `TENANT_ADMIN` credentials
- At least one **admitted fleet** org/repo with an initiative that has board
  EPIC + run history (CAP-F composition source)
- Lab-safe closure-start inputs when exercising REQ-21 (runner/model; workspace
  is derived from tenant `workspace_root` + selected org/repo)
- `npm run dev` (or production start) for gateflow-ops

## Steps

1. Sign in on `/login` as **tenant_admin**.
2. Open **Spec lane** (`/spec-lane`) or **Implement lane** (`/implement-lane`) from Work nav. There is no `/initiatives` page (REQ-13 surfaces moved to lane routes).
3. Select an **admitted repo** from the dropdown (same fleet list as Board)
   (REQ-13):
   - List loads without typing org/repo.
   - Rows show id / name / stage / PRD approval from gateflow.
   - Missing or `unavailable` fields show honest gap labels — no invented
     board/GitHub values.
4. **Open an initiative** (REQ-13 detail): stage, PRD, EPIC link (when present),
   in-flight run (when present). Optional: follow **Open in Runs**.
5. **Wave map** (REQ-14): statuses render in
   `{done, ready-to-start, blocked, active}`; blocked rows show block reason
   when gateflow provides it; empty map is an honest empty state.
6. **Readouts** — pick each readout (wave comes from the wave-map dropdown
   where required):
   - Spec (REQ-15)
   - Implementation (REQ-16) — requires wave id
   - Closeout (REQ-17) — requires wave id
   - Merge (REQ-18) — requires wave id
   - Completion (REQ-19)
   - Closure preview (REQ-20) — pre/post purge lists as gateflow returns them
7. **Start closure** when lab-safe (REQ-21):
   - Operator only enters branch slug / runner / model
   - Workspace, org/repo, initiative, EPIC, and wave ticket ids are derived
   - Success shows accepted enqueue with run id (202 semantics)
   - Failure surfaces a named error (no silent success / fabricated run)

## Negative checks

- Empty fleet / no repo selected → list does not invent initiatives.
- Unknown initiative / upstream 404 → named error on detail/readout; no fake
  composition.
- Platform admin session cannot use Initiatives (redirect / wrong-role).
- Closure start with invalid body → structured failure; no fabricated run id.

## Pass

All checklist steps PASS against live gateflow with **no fabricated/mock
values**.

## Cleanup

Leave or cancel smoke closure runs per gateflow lab policy; do not merge
unintended PRs.
