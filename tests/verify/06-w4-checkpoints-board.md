# Verify: W4 checkpoints & board (INIT-GATEFLOW-016)

<!-- prayog:covers: REQ-26, REQ-27, REQ-28, REQ-29, REQ-30, REQ-31 -->

Live smoke against **real gateflow**. Unit ownership:
`tests/unit/checkpoint-miss.test.ts`, `tests/unit/board-helpers.test.ts`.

## Prerequisites

- `AUTH_MODE=jwt-upstream`
- `UPSTREAM_BASE_URL` → live gateflow base
- Non-prod tenant with `TENANT_ADMIN` credentials
- Prefer fixtures with at least one initiative/wave and forge org/repo;
  missing run / empty history must still show **named** no-run / empty states
  (never fabricated checkpoint status)
- For board mutations: gateflow forge/board live GitHub configured (same as
  gateflow `verify_board`); otherwise list/create may fail closed with named
  errors — do not invent tickets client-side
- `npm run dev` (or production start) for gateflow-ops

## Steps — Checkpoints (CAP-D)

1. Sign in on `/login` as **tenant_admin** and enter a programme.
2. Open **Runs** from nav. Checkpoints are a section on that page
   (`/checkpoints` redirects here). There is no Checkpoints nav row.
3. **Live status — composed** (REQ-26): enter `checkpoint_id`, `initiative_id`,
   and `wave_id` for a wave **without** a matching run → UI shows named
   **“No run found for this wave”** (not a fabricated pass/fail verdict).
4. **Live status — raw** (REQ-26): query with `owner` / `repo` / `pr_number` +
   checkpoint id for a known PR when available → status payload renders, or a
   named not-found (never invented fields).
5. **History** (REQ-27): load history for org/repo/PR → records render, or
   named empty / not-found — no fabricated history rows.

## Steps — Board (CAP-E)

6. Open **Board** (`/board`) from nav.
7. **List** (REQ-28): pick an admitted repo from the dropdown (no typed
   org/repo); ticket **table** renders or honest empty. Empty fleet shows
   the named admit-first state.
8. **Create** (REQ-29): header/create action inherits the selected repo;
   create EPIC or Feature with `initiative_id` + type; submit twice with
   same key/identity → second response shows **idempotent replay**.
9. **Status** (REQ-30): row action updates column and/or state; result
   reflected on the table / subsequent list.
10. **Link** (REQ-31): row action links a PR number; `link_ref` (or
    equivalent) present on success.

## Negative checks

- Platform admin session cannot use Checkpoints or Board (redirect / wrong-role).
- List without a selected repo does not invent tickets.
- Upstream failure surfaces a named error (no silent mock tickets or status).

## Pass

All checklist steps PASS against live gateflow with **no fabricated checkpoint
status/history** and **idempotent create** behavior observed.

## Cleanup

Close or leave verify-created Feature tickets in the non-prod forge project as
per tenant policy; no local state to clear.
