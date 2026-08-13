# Verify: W3 metrics & efficacy (INIT-GATEFLOW-016)

<!-- prayog:covers: REQ-22, REQ-23, REQ-24, REQ-25 -->

Live smoke against **real gateflow**. Unit ownership:
`tests/unit/metrics-empty.test.ts` (empty-series helpers).

## Prerequisites

- `AUTH_MODE=jwt-upstream`
- `UPSTREAM_BASE_URL` → live gateflow base
- Non-prod tenant with `TENANT_ADMIN` credentials
- Prefer a tenant with some run history; empty tenant must still show honest
  empty states (not mocks)
- `npm run dev` (or production start) for gateflow-ops

## Steps

1. Sign in on `/login` as **tenant_admin**.
2. Open **Metrics** (`/metrics`) from nav.
3. **Run stage durations** (REQ-22): panel loads tenant-scoped aggregates or a
   well-formed empty state — no fabricated series.
4. **Skill / spec efficacy** (REQ-23): panel loads; apply optional `model_id`
   and/or `prompt_revision` filters; results update without inventing rows.
5. **Factory effectiveness** (REQ-24): panel loads rates / breakdowns or empty.
6. **Delivery scorecard** (REQ-25): panel shows as-of, cumulative, and
   trailing-90-day deltas from gateflow (no placeholder values).

## Negative checks

- Platform admin session cannot use Metrics (redirect / wrong-role).
- Upstream failure surfaces a named error (no silent mock charts).
- Empty tenant history → empty copy / empty lists, not invented datapoints.

## Pass

All checklist steps PASS against live gateflow with **no fabricated/mock
values**.

## Cleanup

None required for read-only metrics smoke.
