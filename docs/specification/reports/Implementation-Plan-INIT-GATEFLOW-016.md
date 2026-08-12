---
goal: INIT-GATEFLOW-016 — implementation plan
initiative: INIT-GATEFLOW-016
status: Planned
date_created: 2026-08-12
source_spec: docs/specification/product/INIT-GATEFLOW-016-gateflow-ops.md
feasibility_report: docs/specification/reports/Initiative-Feasibility-Report-INIT-GATEFLOW-016.md
technical_review: docs/specification/reports/Technical-Review-INIT-GATEFLOW-016.md
prd_digest: sha256:2ee19c297b4f948c9f3fbb29d5b45e1e5db9e32fce4a21780915872b3640947a
impact_map: prayog-meta/prd/reports/Impact-Map-INIT-GATEFLOW-016.md
impact_map_revision: 1
repo_scope_digest: sha256:4daa0360b2c895fca619c93bc2bf765c6cca1a0c05d12e0cae9331bead47df08
approved_meta_pr_head: 5422e0f28ce8cb6b0b9f936b5df87afe280d4957
branch: chore/INIT-GATEFLOW-016-spec-gateflow-ops
review_deadline: 2026-08-17
deciders: PE — spec-lgtm + Approve on exact head after full package
---

# Implementation plan — INIT-GATEFLOW-016

## Source freshness and command contract

| Item                  | Value                                                                           | Status             |
| --------------------- | ------------------------------------------------------------------------------- | ------------------ |
| Spec                  | `docs/specification/product/INIT-GATEFLOW-016-gateflow-ops.md`                  | CURRENT            |
| Feasibility report    | `docs/specification/reports/Initiative-Feasibility-Report-INIT-GATEFLOW-016.md` | CURRENT            |
| Technical review      | `docs/specification/reports/Technical-Review-INIT-GATEFLOW-016.md`              | CURRENT (Accepted) |
| Impact map / revision | `prayog-meta/prd/reports/Impact-Map-INIT-GATEFLOW-016.md` / `1`                 | CURRENT            |
| Repo scope digest     | `sha256:4daa0360b2c895fca619c93bc2bf765c6cca1a0c05d12e0cae9331bead47df08`       | CURRENT            |
| Approved meta PR head | `5422e0f28ce8cb6b0b9f936b5df87afe280d4957`                                      | CURRENT            |
| `check_command`       | `make check`                                                                    | RESOLVED           |
| `test_command`        | `make test`                                                                     | RESOLVED           |
| `verify_command`      | per-wave `tests/verify/0N-….md` (human-run smoke)                               | RESOLVED           |
| `ground_command`      | N/A — no Makefile ground target; `/ground-spec` after waves uses as-built       | RESOLVED / N/A     |

## 0. Technical design reference

| Item                          | Value                                                                                                                                                                                                                                       |
| ----------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Technical review              | `docs/specification/reports/Technical-Review-INIT-GATEFLOW-016.md`                                                                                                                                                                          |
| Technical review status       | Accepted                                                                                                                                                                                                                                    |
| PE sign-off                   | [x] complete — 2026-08-12 (PR #19 comment + Accepted metadata)                                                                                                                                                                              |
| Resolved ADRs                 | [`docs/specification/adr/adr-001-ui-primitives-shadcn-semantic-tokens.md`](../adr/adr-001-ui-primitives-shadcn-semantic-tokens.md) — Status: **Accepted**; digest `sha256:d44f11b8dd464d95a624394f5d86b0babab129d1e60b6c2eea9e9e02564c9992` |
| ADR product-boundary re-check | `changes_user_visible_behavior: false`, `spec_amendment_required: false`; `adr_boundary_lint.py --verify-lint-evidence` PASS at plan time (Lint evidence refreshed after Approved-head metadata)                                            |
| Outstanding PM questions      | none — all resolved                                                                                                                                                                                                                         |
| Outstanding domain questions  | none — all resolved                                                                                                                                                                                                                         |

## 1. Requirements (REQ) — product ids

| ID     | Summary                   | Spec path                                                      | Waves |
| ------ | ------------------------- | -------------------------------------------------------------- | ----- |
| REQ-01 | View tenant detail        | `docs/specification/product/INIT-GATEFLOW-016-gateflow-ops.md` | W0    |
| REQ-02 | Invite teammate           | `docs/specification/product/INIT-GATEFLOW-016-gateflow-ops.md` | W0    |
| REQ-03 | Browse/refresh catalogue  | `docs/specification/product/INIT-GATEFLOW-016-gateflow-ops.md` | W0    |
| REQ-04 | Programme connect         | `docs/specification/product/INIT-GATEFLOW-016-gateflow-ops.md` | W0    |
| REQ-05 | Admit repo to fleet       | `docs/specification/product/INIT-GATEFLOW-016-gateflow-ops.md` | W0    |
| REQ-06 | Readiness refresh         | `docs/specification/product/INIT-GATEFLOW-016-gateflow-ops.md` | W0    |
| REQ-07 | Compose pass/fail verdict | `docs/specification/product/INIT-GATEFLOW-016-gateflow-ops.md` | W0    |
| REQ-08 | Deselect fleet repo       | `docs/specification/product/INIT-GATEFLOW-016-gateflow-ops.md` | W0    |
| REQ-09 | Start wave lanes          | `docs/specification/product/INIT-GATEFLOW-016-gateflow-ops.md` | W1    |
| REQ-10 | List runs filtered        | `docs/specification/product/INIT-GATEFLOW-016-gateflow-ops.md` | W1    |
| REQ-11 | Run detail+timeline       | `docs/specification/product/INIT-GATEFLOW-016-gateflow-ops.md` | W1    |
| REQ-12 | Forge authorize           | `docs/specification/product/INIT-GATEFLOW-016-gateflow-ops.md` | W1    |
| REQ-13 | List/detail initiatives   | `docs/specification/product/INIT-GATEFLOW-016-gateflow-ops.md` | W2    |
| REQ-14 | Wave map                  | `docs/specification/product/INIT-GATEFLOW-016-gateflow-ops.md` | W2    |
| REQ-15 | Spec readout              | `docs/specification/product/INIT-GATEFLOW-016-gateflow-ops.md` | W2    |
| REQ-16 | Implementation readout    | `docs/specification/product/INIT-GATEFLOW-016-gateflow-ops.md` | W2    |
| REQ-17 | Closeout readout          | `docs/specification/product/INIT-GATEFLOW-016-gateflow-ops.md` | W2    |
| REQ-18 | Merge readout             | `docs/specification/product/INIT-GATEFLOW-016-gateflow-ops.md` | W2    |
| REQ-19 | Completion readout        | `docs/specification/product/INIT-GATEFLOW-016-gateflow-ops.md` | W2    |
| REQ-20 | Closure preview           | `docs/specification/product/INIT-GATEFLOW-016-gateflow-ops.md` | W2    |
| REQ-21 | Start closure             | `docs/specification/product/INIT-GATEFLOW-016-gateflow-ops.md` | W2    |
| REQ-22 | Metrics runs heatmap      | `docs/specification/product/INIT-GATEFLOW-016-gateflow-ops.md` | W3    |
| REQ-23 | Skill efficacy            | `docs/specification/product/INIT-GATEFLOW-016-gateflow-ops.md` | W3    |
| REQ-24 | Factory effectiveness     | `docs/specification/product/INIT-GATEFLOW-016-gateflow-ops.md` | W3    |
| REQ-25 | Delivery scorecard        | `docs/specification/product/INIT-GATEFLOW-016-gateflow-ops.md` | W3    |
| REQ-26 | Checkpoint status         | `docs/specification/product/INIT-GATEFLOW-016-gateflow-ops.md` | W4    |
| REQ-27 | Checkpoint history        | `docs/specification/product/INIT-GATEFLOW-016-gateflow-ops.md` | W4    |
| REQ-28 | List board tickets        | `docs/specification/product/INIT-GATEFLOW-016-gateflow-ops.md` | W4    |
| REQ-29 | Create ticket             | `docs/specification/product/INIT-GATEFLOW-016-gateflow-ops.md` | W4    |
| REQ-30 | Update ticket status      | `docs/specification/product/INIT-GATEFLOW-016-gateflow-ops.md` | W4    |
| REQ-31 | Link PR to ticket         | `docs/specification/product/INIT-GATEFLOW-016-gateflow-ops.md` | W4    |

## 2. Implementation phases

> **Path note:** WorkManifest forbids `[]` glob chars in `files[].path`. BFF handlers use exact folders (`by-id`, `users`, `forge`); request params carry ids. App Router `[param]` folders are not required by this plan.

### Phase W0 — Identity, fleet onboarding, workspace shell

**GOAL-W0:** Operators sign in, manage tenant identity, onboard catalogue repos with a single pass/fail verdict, and navigate via WorkspaceShell.

**P15 overlap check:** Ran `PYTHONPATH=prayog-skills python3 prayog-skills/scripts/verify_coverage_query.py --dump tests/verify` and `--req REQ-01` / CAP-B: only legacy `01-login-status-page.md` (no marker). No extendable coverage for CAP-A/B → new FILE warranted.

| Task       | Description                                                 | Implements                                                     | Depends on                         | Files (path/action)                                                                                                                                                                                                                                                | Exit criteria                                                                                               | Proof (kind / command\|review)                               | Expected                  | Evidence expected                                   | Codebase                                            | Spec path                                                      | Verify command                                                 | MDC notes                                           | ADR notes                                           | Branch                               |
| ---------- | ----------------------------------------------------------- | -------------------------------------------------------------- | ---------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------ | ------------------------- | --------------------------------------------------- | --------------------------------------------------- | -------------------------------------------------------------- | -------------------------------------------------------------- | --------------------------------------------------- | --------------------------------------------------- | ------------------------------------ |
| TASK-W0-01 | Workspace shell (nav, PageHeader/Body) per workspace-layout | REQ-01, REQ-02, REQ-03, REQ-04, REQ-05, REQ-06, REQ-07, REQ-08 | —                                  | `components/workspace/workspace-shell.tsx` create; `components/workspace/workspace-nav.tsx` create; `components/workspace/page-header.tsx` create; `components/workspace/page-body.tsx` create; `lib/workspace-nav.ts` create; `app/(dashboard)/layout.tsx` modify | Authenticated layout renders left nav + page slots; no page invents parallel chrome                         | command / `make check && make test`                          | exit 0 + assertions green | Wave-Execution-INIT-GATEFLOW-016-W0.md § TASK-W0-01 | gateflow-ops                                        | `docs/specification/product/INIT-GATEFLOW-016-gateflow-ops.md` | `make check && make test`                                      | workspace-page-layout                               | ADR-001                                             | `feature/INIT-GATEFLOW-016-w0-w0-01` |
| TASK-W0-02 | BFF + UI CAP-A tenants detail/invite                        | REQ-01, REQ-02                                                 | TASK-W0-01                         | `app/api/gateflow/tenants/route.ts` create; `app/api/gateflow/tenants/users/route.ts` create; `components/tenant/tenant-detail.tsx` create; `hooks/use-tenant.ts` create; `data/locales/en/tenants.json` create; `app/(dashboard)/tenant/page.tsx` create          | Tenant detail and invite succeed via same-origin BFF; 401 redirects login                                   | command / `make check && make test`                          | exit 0 + assertions green | Wave-Execution-INIT-GATEFLOW-016-W0.md § TASK-W0-02 | gateflow-ops                                        | `docs/specification/product/INIT-GATEFLOW-016-gateflow-ops.md` | `make check && make test`                                      | nextjs-bff-route-handlers; nextjs-repository-layout | ADR-001                                             | `feature/INIT-GATEFLOW-016-w0-w0-02` |
| TASK-W0-03 | BFF + UI CAP-B programme/catalogue/fleet + verdict helper   | REQ-03, REQ-04, REQ-05, REQ-06, REQ-07, REQ-08                 | TASK-W0-01                         | `app/api/gateflow/programme/route.ts` create; `lib/onboarding-verdict.ts` create; `components/fleet/onboarding-flow.tsx` create; `hooks/use-programme.ts` create; `data/locales/en/fleet.json` create; `app/(dashboard)/fleet/page.tsx` create                     | Catalogue/connect/select/readiness/deselect work; UI shows single pass/fail never partial                   | command / `make check && make test`                          | exit 0 + assertions green | Wave-Execution-INIT-GATEFLOW-016-W0.md § TASK-W0-03 | gateflow-ops                                        | `docs/specification/product/INIT-GATEFLOW-016-gateflow-ops.md` | `make check && make test`                                      | nextjs-bff-route-handlers; nextjs-repository-layout | ADR-001                                             | `feature/INIT-GATEFLOW-016-w0-w0-03` |
| TASK-W0-04 | Unit tests for onboarding verdict + BFF error shaping       | REQ-07                                                         | TASK-W0-03                         | `tests/unit/onboarding-verdict.test.ts` create                                                                                                                                                                                                                     | All select×readiness combos assert pass                                                                     | fail only; vitest green                                      | command / `make test`     | exit 0 + assertions green                           | Wave-Execution-INIT-GATEFLOW-016-W0.md § TASK-W0-04 | gateflow-ops                                                   | `docs/specification/product/INIT-GATEFLOW-016-gateflow-ops.md` | `make check && make test`                           | nextjs-bff-route-handlers; nextjs-repository-layout | —                                    | `feature/INIT-GATEFLOW-016-w0-w0-04` |
| TASK-W0-05 | Live verify W0 + as-built updates                           | REQ-01, REQ-02, REQ-03, REQ-04, REQ-05, REQ-06, REQ-07, REQ-08 | TASK-W0-02, TASK-W0-03, TASK-W0-04 | `tests/verify/02-w0-identity-onboarding.md` create; `docs/specification/as-built/Implementation-Status-INIT-GATEFLOW-016.md` create; `docs/specification/as-built/implementation-status.md` modify                                                                 | Human smoke against jwt-upstream + real gateflow exits PASS; as-built index row points to initiative detail | command / `Follow tests/verify/02-w0-identity-onboarding.md` | exit 0 + assertions green | Wave-Execution-INIT-GATEFLOW-016-W0.md § TASK-W0-05 | gateflow-ops                                        | `docs/specification/product/INIT-GATEFLOW-016-gateflow-ops.md` | `tests/verify/02-w0-identity-onboarding.md`                    | testing-verify-flows                                | —                                                   | `feature/INIT-GATEFLOW-016-w0-w0-05` |

#### Files (W0)

| ID         | Path                                                                     | Action |
| ---------- | ------------------------------------------------------------------------ | ------ |
| FILE-W0-01 | `components/workspace/workspace-shell.tsx`                               | create |
| FILE-W0-02 | `components/workspace/workspace-nav.tsx`                                 | create |
| FILE-W0-03 | `components/workspace/page-header.tsx`                                   | create |
| FILE-W0-04 | `components/workspace/page-body.tsx`                                     | create |
| FILE-W0-05 | `lib/workspace-nav.ts`                                                   | create |
| FILE-W0-06 | `app/(dashboard)/layout.tsx`                                             | modify |
| FILE-W0-07 | `app/api/gateflow/tenants/route.ts`                                      | create |
| FILE-W0-08 | `app/api/gateflow/tenants/users/route.ts`                                | create |
| FILE-W0-09 | `components/tenant/tenant-detail.tsx`                                    | create |
| FILE-W0-10 | `hooks/use-tenant.ts`                                                    | create |
| FILE-W0-11 | `data/locales/en/tenants.json`                                           | create |
| FILE-W0-12 | `app/(dashboard)/tenant/page.tsx`                                        | create |
| FILE-W0-13 | `app/api/gateflow/programme/route.ts`                                    | create |
| FILE-W0-14 | `lib/onboarding-verdict.ts`                                              | create |
| FILE-W0-15 | `components/fleet/onboarding-flow.tsx`                                   | create |
| FILE-W0-16 | `hooks/use-programme.ts`                                                 | create |
| FILE-W0-17 | `data/locales/en/fleet.json`                                             | create |
| FILE-W0-18 | `app/(dashboard)/fleet/page.tsx`                                         | create |
| FILE-W0-19 | `tests/unit/onboarding-verdict.test.ts`                                  | create |
| FILE-W0-20 | `tests/verify/02-w0-identity-onboarding.md`                              | create |
| FILE-W0-21 | `docs/specification/as-built/Implementation-Status-INIT-GATEFLOW-016.md` | create |
| FILE-W0-22 | `docs/specification/as-built/implementation-status.md`                   | modify |

#### Tests (W0)

| ID        | Layer        | Command                                                 | Proves                                                         |
| --------- | ------------ | ------------------------------------------------------- | -------------------------------------------------------------- |
| TEST-W0-U | unit         | `make test`                                             | wave REQs pure logic / mappers                                 |
| TEST-W0-L | live (smoke) | `tests/verify/02-w0-identity-onboarding.md` (human-run) | REQ-01, REQ-02, REQ-03, REQ-04, REQ-05, REQ-06, REQ-07, REQ-08 |

#### Verification Coverage (W0)

| REQ / criterion | unit      | integration/contract                  | smoke     | sandbox | Notes |
| --------------- | --------- | ------------------------------------- | --------- | ------- | ----- |
| REQ-01          | TEST-W0-U | N/A — BFF mocked in unit where needed | TEST-W0-L | N/A     |       |
| REQ-02          | TEST-W0-U | N/A — BFF mocked in unit where needed | TEST-W0-L | N/A     |       |
| REQ-03          | TEST-W0-U | N/A — BFF mocked in unit where needed | TEST-W0-L | N/A     |       |
| REQ-04          | TEST-W0-U | N/A — BFF mocked in unit where needed | TEST-W0-L | N/A     |       |
| REQ-05          | TEST-W0-U | N/A — BFF mocked in unit where needed | TEST-W0-L | N/A     |       |
| REQ-06          | TEST-W0-U | N/A — BFF mocked in unit where needed | TEST-W0-L | N/A     |       |
| REQ-07          | TEST-W0-U | N/A — BFF mocked in unit where needed | TEST-W0-L | N/A     |       |
| REQ-08          | TEST-W0-U | N/A — BFF mocked in unit where needed | TEST-W0-L | N/A     |       |

#### Live-verification intent (W0)

| Field                 | Value                                                                                                                                         |
| --------------------- | --------------------------------------------------------------------------------------------------------------------------------------------- |
| Applicable            | yes — new product surfaces (P15)                                                                                                              |
| Environment class     | local-compose / staging with real gateflow                                                                                                    |
| Mode                  | smoke                                                                                                                                         |
| Runtime head binding  | Bound at `wave-acceptance`                                                                                                                    |
| Prerequisites         | `AUTH_MODE=jwt-upstream`; `UPSTREAM_BASE_URL` → live gateflow; signed-in TENANT_ADMIN session                                                 |
| Safe test data        | Synthetic/non-prod tenant fixtures; no PLATFORM_ADMIN routes                                                                                  |
| Steps / command       | Follow `tests/verify/02-w0-identity-onboarding.md` (includes `prayog:covers: REQ-01, REQ-02, REQ-03, REQ-04, REQ-05, REQ-06, REQ-07, REQ-08`) |
| Expected observations | Checklist PASS; no fabricated data; empty states well-formed                                                                                  |
| Expected evidence     | `wave-accepted` on tip                                                                                                                        |
| Cleanup               | Remove smoke-only invites/tickets if created                                                                                                  |
| Stop conditions       | Non-zero/fail step or unexpected 5xx → stop; no Pass-2                                                                                        |

### Phase W1 — Wave operations

**GOAL-W1:** Start implement/spec/closeout waves, inspect runs/timelines, authorize forge external-action stops.

**P15 overlap check:** Coverage query: no existing artifact covers REQ-09–12 → new FILE.

| Task       | Description                                             | Implements                     | Depends on | Files (path/action)                                                                                                                                                                                                                                                                                                               | Exit criteria                                                                                                              | Proof (kind / command\|review)                           | Expected                  | Evidence expected                                   | Codebase     | Spec path                                                      | Verify command                          | MDC notes                                           | ADR notes | Branch                               |
| ---------- | ------------------------------------------------------- | ------------------------------ | ---------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------- | ------------------------- | --------------------------------------------------- | ------------ | -------------------------------------------------------------- | --------------------------------------- | --------------------------------------------------- | --------- | ------------------------------------ |
| TASK-W1-01 | BFF + UI waves start, runs list/detail, forge authorize | REQ-09, REQ-10, REQ-11, REQ-12 | —          | `app/api/gateflow/waves/route.ts` create; `app/api/gateflow/runs/route.ts` create; `app/api/gateflow/runs/by-id/route.ts` create; `app/api/gateflow/runs/forge/route.ts` create; `components/runs/run-cockpit.tsx` create; `hooks/use-runs.ts` create; `app/(dashboard)/runs/page.tsx` create; `data/locales/en/runs.json` create | Three lanes start; run timeline renders; forge authorize only on external-action stop; expected stops not styled as errors | command / `make check && make test`                      | exit 0 + assertions green | Wave-Execution-INIT-GATEFLOW-016-W1.md § TASK-W1-01 | gateflow-ops | `docs/specification/product/INIT-GATEFLOW-016-gateflow-ops.md` | `make check && make test`               | nextjs-bff-route-handlers; nextjs-repository-layout | ADR-001   | `feature/INIT-GATEFLOW-016-w1-w1-01` |
| TASK-W1-02 | Live verify W1 + as-built                               | REQ-09, REQ-10, REQ-11, REQ-12 | TASK-W1-01 | `tests/verify/03-w1-wave-operations.md` create; `docs/specification/as-built/Implementation-Status-INIT-GATEFLOW-016.md` modify; `docs/specification/as-built/implementation-status.md` modify                                                                                                                                    | Smoke against real wave reaching external-action authorize PASS                                                            | command / `Follow tests/verify/03-w1-wave-operations.md` | exit 0 + assertions green | Wave-Execution-INIT-GATEFLOW-016-W1.md § TASK-W1-02 | gateflow-ops | `docs/specification/product/INIT-GATEFLOW-016-gateflow-ops.md` | `tests/verify/03-w1-wave-operations.md` | testing-verify-flows                                | —         | `feature/INIT-GATEFLOW-016-w1-w1-02` |

#### Files (W1)

| ID         | Path                                                                     | Action |
| ---------- | ------------------------------------------------------------------------ | ------ |
| FILE-W1-01 | `app/api/gateflow/waves/route.ts`                                        | create |
| FILE-W1-02 | `app/api/gateflow/runs/route.ts`                                         | create |
| FILE-W1-03 | `app/api/gateflow/runs/by-id/route.ts`                                   | create |
| FILE-W1-04 | `app/api/gateflow/runs/forge/route.ts`                                   | create |
| FILE-W1-05 | `components/runs/run-cockpit.tsx`                                        | create |
| FILE-W1-06 | `hooks/use-runs.ts`                                                      | create |
| FILE-W1-07 | `app/(dashboard)/runs/page.tsx`                                          | create |
| FILE-W1-08 | `data/locales/en/runs.json`                                              | create |
| FILE-W1-09 | `tests/verify/03-w1-wave-operations.md`                                  | create |
| FILE-W1-10 | `docs/specification/as-built/Implementation-Status-INIT-GATEFLOW-016.md` | modify |
| FILE-W1-11 | `docs/specification/as-built/implementation-status.md`                   | modify |

#### Tests (W1)

| ID        | Layer        | Command                                             | Proves                         |
| --------- | ------------ | --------------------------------------------------- | ------------------------------ |
| TEST-W1-U | unit         | `make test`                                         | wave REQs pure logic / mappers |
| TEST-W1-L | live (smoke) | `tests/verify/03-w1-wave-operations.md` (human-run) | REQ-09, REQ-10, REQ-11, REQ-12 |

#### Verification Coverage (W1)

| REQ / criterion | unit      | integration/contract                  | smoke     | sandbox | Notes |
| --------------- | --------- | ------------------------------------- | --------- | ------- | ----- |
| REQ-09          | TEST-W1-U | N/A — BFF mocked in unit where needed | TEST-W1-L | N/A     |       |
| REQ-10          | TEST-W1-U | N/A — BFF mocked in unit where needed | TEST-W1-L | N/A     |       |
| REQ-11          | TEST-W1-U | N/A — BFF mocked in unit where needed | TEST-W1-L | N/A     |       |
| REQ-12          | TEST-W1-U | N/A — BFF mocked in unit where needed | TEST-W1-L | N/A     |       |

#### Live-verification intent (W1)

| Field                 | Value                                                                                                     |
| --------------------- | --------------------------------------------------------------------------------------------------------- |
| Applicable            | yes — new product surfaces (P15)                                                                          |
| Environment class     | local-compose / staging with real gateflow                                                                |
| Mode                  | smoke                                                                                                     |
| Runtime head binding  | Bound at `wave-acceptance`                                                                                |
| Prerequisites         | `AUTH_MODE=jwt-upstream`; `UPSTREAM_BASE_URL` → live gateflow; signed-in TENANT_ADMIN session             |
| Safe test data        | Synthetic/non-prod tenant fixtures; no PLATFORM_ADMIN routes                                              |
| Steps / command       | Follow `tests/verify/03-w1-wave-operations.md` (includes `prayog:covers: REQ-09, REQ-10, REQ-11, REQ-12`) |
| Expected observations | Checklist PASS; no fabricated data; empty states well-formed                                              |
| Expected evidence     | `wave-accepted` on tip                                                                                    |
| Cleanup               | Remove smoke-only invites/tickets if created                                                              |
| Stop conditions       | Non-zero/fail step or unexpected 5xx → stop; no Pass-2                                                    |

### Phase W2 — Initiative & delivery tracking

**GOAL-W2:** List/detail initiatives and compose readouts through closure start.

**P15 overlap check:** Coverage query: no existing artifact covers REQ-13–21 → new FILE.

| Task       | Description                                             | Implements                                                             | Depends on | Files (path/action)                                                                                                                                                                                                                                                                   | Exit criteria                                                                                                            | Proof (kind / command\|review)                               | Expected                  | Evidence expected                                   | Codebase     | Spec path                                                      | Verify command                              | MDC notes                                           | ADR notes | Branch                               |
| ---------- | ------------------------------------------------------- | ---------------------------------------------------------------------- | ---------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------ | ------------------------- | --------------------------------------------------- | ------------ | -------------------------------------------------------------- | ------------------------------------------- | --------------------------------------------------- | --------- | ------------------------------------ |
| TASK-W2-01 | BFF + UI initiatives list/detail/waves/readouts/closure | REQ-13, REQ-14, REQ-15, REQ-16, REQ-17, REQ-18, REQ-19, REQ-20, REQ-21 | —          | `app/api/gateflow/initiatives/route.ts` create; `app/api/gateflow/initiatives/by-id/route.ts` create; `components/initiatives/initiative-hub.tsx` create; `hooks/use-initiatives.ts` create; `app/(dashboard)/initiatives/page.tsx` create; `data/locales/en/initiatives.json` create | Initiative list/detail and readouts render gateflow composition with honest gaps; closure start returns accepted enqueue | command / `make check && make test`                          | exit 0 + assertions green | Wave-Execution-INIT-GATEFLOW-016-W2.md § TASK-W2-01 | gateflow-ops | `docs/specification/product/INIT-GATEFLOW-016-gateflow-ops.md` | `make check && make test`                   | nextjs-bff-route-handlers; nextjs-repository-layout | ADR-001   | `feature/INIT-GATEFLOW-016-w2-w2-01` |
| TASK-W2-02 | Live verify W2 + as-built                               | REQ-13, REQ-14, REQ-15, REQ-16, REQ-17, REQ-18, REQ-19, REQ-20, REQ-21 | TASK-W2-01 | `tests/verify/04-w2-initiative-tracking.md` create; `docs/specification/as-built/Implementation-Status-INIT-GATEFLOW-016.md` modify; `docs/specification/as-built/implementation-status.md` modify                                                                                    | Smoke vs initiative with board EPIC + run history PASS                                                                   | command / `Follow tests/verify/04-w2-initiative-tracking.md` | exit 0 + assertions green | Wave-Execution-INIT-GATEFLOW-016-W2.md § TASK-W2-02 | gateflow-ops | `docs/specification/product/INIT-GATEFLOW-016-gateflow-ops.md` | `tests/verify/04-w2-initiative-tracking.md` | testing-verify-flows                                | —         | `feature/INIT-GATEFLOW-016-w2-w2-02` |

#### Files (W2)

| ID         | Path                                                                     | Action |
| ---------- | ------------------------------------------------------------------------ | ------ |
| FILE-W2-01 | `app/api/gateflow/initiatives/route.ts`                                  | create |
| FILE-W2-02 | `app/api/gateflow/initiatives/by-id/route.ts`                            | create |
| FILE-W2-03 | `components/initiatives/initiative-hub.tsx`                              | create |
| FILE-W2-04 | `hooks/use-initiatives.ts`                                               | create |
| FILE-W2-05 | `app/(dashboard)/initiatives/page.tsx`                                   | create |
| FILE-W2-06 | `data/locales/en/initiatives.json`                                       | create |
| FILE-W2-07 | `tests/verify/04-w2-initiative-tracking.md`                              | create |
| FILE-W2-08 | `docs/specification/as-built/Implementation-Status-INIT-GATEFLOW-016.md` | modify |
| FILE-W2-09 | `docs/specification/as-built/implementation-status.md`                   | modify |

#### Tests (W2)

| ID        | Layer        | Command                                                 | Proves                                                                 |
| --------- | ------------ | ------------------------------------------------------- | ---------------------------------------------------------------------- |
| TEST-W2-U | unit         | `make test`                                             | wave REQs pure logic / mappers                                         |
| TEST-W2-L | live (smoke) | `tests/verify/04-w2-initiative-tracking.md` (human-run) | REQ-13, REQ-14, REQ-15, REQ-16, REQ-17, REQ-18, REQ-19, REQ-20, REQ-21 |

#### Verification Coverage (W2)

| REQ / criterion | unit      | integration/contract                  | smoke     | sandbox | Notes |
| --------------- | --------- | ------------------------------------- | --------- | ------- | ----- |
| REQ-13          | TEST-W2-U | N/A — BFF mocked in unit where needed | TEST-W2-L | N/A     |       |
| REQ-14          | TEST-W2-U | N/A — BFF mocked in unit where needed | TEST-W2-L | N/A     |       |
| REQ-15          | TEST-W2-U | N/A — BFF mocked in unit where needed | TEST-W2-L | N/A     |       |
| REQ-16          | TEST-W2-U | N/A — BFF mocked in unit where needed | TEST-W2-L | N/A     |       |
| REQ-17          | TEST-W2-U | N/A — BFF mocked in unit where needed | TEST-W2-L | N/A     |       |
| REQ-18          | TEST-W2-U | N/A — BFF mocked in unit where needed | TEST-W2-L | N/A     |       |
| REQ-19          | TEST-W2-U | N/A — BFF mocked in unit where needed | TEST-W2-L | N/A     |       |
| REQ-20          | TEST-W2-U | N/A — BFF mocked in unit where needed | TEST-W2-L | N/A     |       |
| REQ-21          | TEST-W2-U | N/A — BFF mocked in unit where needed | TEST-W2-L | N/A     |       |

#### Live-verification intent (W2)

| Field                 | Value                                                                                                                                                 |
| --------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------- |
| Applicable            | yes — new product surfaces (P15)                                                                                                                      |
| Environment class     | local-compose / staging with real gateflow                                                                                                            |
| Mode                  | smoke                                                                                                                                                 |
| Runtime head binding  | Bound at `wave-acceptance`                                                                                                                            |
| Prerequisites         | `AUTH_MODE=jwt-upstream`; `UPSTREAM_BASE_URL` → live gateflow; signed-in TENANT_ADMIN session                                                         |
| Safe test data        | Synthetic/non-prod tenant fixtures; no PLATFORM_ADMIN routes                                                                                          |
| Steps / command       | Follow `tests/verify/04-w2-initiative-tracking.md` (includes `prayog:covers: REQ-13, REQ-14, REQ-15, REQ-16, REQ-17, REQ-18, REQ-19, REQ-20, REQ-21`) |
| Expected observations | Checklist PASS; no fabricated data; empty states well-formed                                                                                          |
| Expected evidence     | `wave-accepted` on tip                                                                                                                                |
| Cleanup               | Remove smoke-only invites/tickets if created                                                                                                          |
| Stop conditions       | Non-zero/fail step or unexpected 5xx → stop; no Pass-2                                                                                                |

### Phase W3 — Metrics & efficacy panel

**GOAL-W3:** Render four tenant-scoped metrics views without mocks.

**P15 overlap check:** Coverage query: no existing artifact covers REQ-22–25 → new FILE.

| Task       | Description                  | Implements                     | Depends on | Files (path/action)                                                                                                                                                                                         | Exit criteria                                                                   | Proof (kind / command\|review)                            | Expected                  | Evidence expected                                   | Codebase     | Spec path                                                      | Verify command                           | MDC notes                                           | ADR notes | Branch                               |
| ---------- | ---------------------------- | ------------------------------ | ---------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------- | --------------------------------------------------------- | ------------------------- | --------------------------------------------------- | ------------ | -------------------------------------------------------------- | ---------------------------------------- | --------------------------------------------------- | --------- | ------------------------------------ |
| TASK-W3-01 | BFF + UI metrics four panels | REQ-22, REQ-23, REQ-24, REQ-25 | —          | `app/api/gateflow/metrics/route.ts` create; `components/metrics/metrics-panels.tsx` create; `hooks/use-metrics.ts` create; `app/(dashboard)/metrics/page.tsx` create; `data/locales/en/metrics.json` create | Four panels render tenant-scoped data; empty tenant shows empty state not mocks | command / `make check && make test`                       | exit 0 + assertions green | Wave-Execution-INIT-GATEFLOW-016-W3.md § TASK-W3-01 | gateflow-ops | `docs/specification/product/INIT-GATEFLOW-016-gateflow-ops.md` | `make check && make test`                | nextjs-bff-route-handlers; nextjs-repository-layout | ADR-001   | `feature/INIT-GATEFLOW-016-w3-w3-01` |
| TASK-W3-02 | Live verify W3 + as-built    | REQ-22, REQ-23, REQ-24, REQ-25 | TASK-W3-01 | `tests/verify/05-w3-metrics-efficacy.md` create; `docs/specification/as-built/Implementation-Status-INIT-GATEFLOW-016.md` modify; `docs/specification/as-built/implementation-status.md` modify             | Smoke metrics views PASS with real tenant history                               | command / `Follow tests/verify/05-w3-metrics-efficacy.md` | exit 0 + assertions green | Wave-Execution-INIT-GATEFLOW-016-W3.md § TASK-W3-02 | gateflow-ops | `docs/specification/product/INIT-GATEFLOW-016-gateflow-ops.md` | `tests/verify/05-w3-metrics-efficacy.md` | testing-verify-flows                                | —         | `feature/INIT-GATEFLOW-016-w3-w3-02` |

#### Files (W3)

| ID         | Path                                                                     | Action |
| ---------- | ------------------------------------------------------------------------ | ------ |
| FILE-W3-01 | `app/api/gateflow/metrics/route.ts`                                      | create |
| FILE-W3-02 | `components/metrics/metrics-panels.tsx`                                  | create |
| FILE-W3-03 | `hooks/use-metrics.ts`                                                   | create |
| FILE-W3-04 | `app/(dashboard)/metrics/page.tsx`                                       | create |
| FILE-W3-05 | `data/locales/en/metrics.json`                                           | create |
| FILE-W3-06 | `tests/verify/05-w3-metrics-efficacy.md`                                 | create |
| FILE-W3-07 | `docs/specification/as-built/Implementation-Status-INIT-GATEFLOW-016.md` | modify |
| FILE-W3-08 | `docs/specification/as-built/implementation-status.md`                   | modify |

#### Tests (W3)

| ID        | Layer        | Command                                              | Proves                         |
| --------- | ------------ | ---------------------------------------------------- | ------------------------------ |
| TEST-W3-U | unit         | `make test`                                          | wave REQs pure logic / mappers |
| TEST-W3-L | live (smoke) | `tests/verify/05-w3-metrics-efficacy.md` (human-run) | REQ-22, REQ-23, REQ-24, REQ-25 |

#### Verification Coverage (W3)

| REQ / criterion | unit      | integration/contract                  | smoke     | sandbox | Notes |
| --------------- | --------- | ------------------------------------- | --------- | ------- | ----- |
| REQ-22          | TEST-W3-U | N/A — BFF mocked in unit where needed | TEST-W3-L | N/A     |       |
| REQ-23          | TEST-W3-U | N/A — BFF mocked in unit where needed | TEST-W3-L | N/A     |       |
| REQ-24          | TEST-W3-U | N/A — BFF mocked in unit where needed | TEST-W3-L | N/A     |       |
| REQ-25          | TEST-W3-U | N/A — BFF mocked in unit where needed | TEST-W3-L | N/A     |       |

#### Live-verification intent (W3)

| Field                 | Value                                                                                                      |
| --------------------- | ---------------------------------------------------------------------------------------------------------- |
| Applicable            | yes — new product surfaces (P15)                                                                           |
| Environment class     | local-compose / staging with real gateflow                                                                 |
| Mode                  | smoke                                                                                                      |
| Runtime head binding  | Bound at `wave-acceptance`                                                                                 |
| Prerequisites         | `AUTH_MODE=jwt-upstream`; `UPSTREAM_BASE_URL` → live gateflow; signed-in TENANT_ADMIN session              |
| Safe test data        | Synthetic/non-prod tenant fixtures; no PLATFORM_ADMIN routes                                               |
| Steps / command       | Follow `tests/verify/05-w3-metrics-efficacy.md` (includes `prayog:covers: REQ-22, REQ-23, REQ-24, REQ-25`) |
| Expected observations | Checklist PASS; no fabricated data; empty states well-formed                                               |
| Expected evidence     | `wave-accepted` on tip                                                                                     |
| Cleanup               | Remove smoke-only invites/tickets if created                                                               |
| Stop conditions       | Non-zero/fail step or unexpected 5xx → stop; no Pass-2                                                     |

### Phase W4 — Checkpoints & board tickets

**GOAL-W4:** Checkpoint status/history and board ticket list/create/status/link.

**P15 overlap check:** Coverage query: no existing artifact covers REQ-26–31 → new FILE.

| Task       | Description                         | Implements                                     | Depends on             | Files (path/action)                                                                                                                                                                                                               | Exit criteria                                                                                  | Proof (kind / command\|review)                             | Expected                  | Evidence expected                                   | Codebase     | Spec path                                                      | Verify command                            | MDC notes                                           | ADR notes | Branch                               |
| ---------- | ----------------------------------- | ---------------------------------------------- | ---------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------- | ---------------------------------------------------------- | ------------------------- | --------------------------------------------------- | ------------ | -------------------------------------------------------------- | ----------------------------------------- | --------------------------------------------------- | --------- | ------------------------------------ |
| TASK-W4-01 | BFF + UI checkpoints status/history | REQ-26, REQ-27                                 | —                      | `app/api/gateflow/checkpoints/route.ts` create; `components/checkpoints/checkpoint-views.tsx` create; `hooks/use-checkpoints.ts` create; `app/(dashboard)/checkpoints/page.tsx` create; `data/locales/en/checkpoints.json` create | Status/history render; composed ref with no run shows named no-run state                       | command / `make check && make test`                        | exit 0 + assertions green | Wave-Execution-INIT-GATEFLOW-016-W4.md § TASK-W4-01 | gateflow-ops | `docs/specification/product/INIT-GATEFLOW-016-gateflow-ops.md` | `make check && make test`                 | nextjs-bff-route-handlers; nextjs-repository-layout | ADR-001   | `feature/INIT-GATEFLOW-016-w4-w4-01` |
| TASK-W4-02 | BFF + UI board tickets CRUD/link    | REQ-28, REQ-29, REQ-30, REQ-31                 | TASK-W4-01             | `app/api/gateflow/board/route.ts` create; `components/board/ticket-views.tsx` create; `hooks/use-board.ts` create; `app/(dashboard)/board/page.tsx` create; `data/locales/en/board.json` create                                   | List/create/status/link succeed with org/repo filters; create idempotent on initiative_id+type | command / `make check && make test`                        | exit 0 + assertions green | Wave-Execution-INIT-GATEFLOW-016-W4.md § TASK-W4-02 | gateflow-ops | `docs/specification/product/INIT-GATEFLOW-016-gateflow-ops.md` | `make check && make test`                 | nextjs-bff-route-handlers; nextjs-repository-layout | ADR-001   | `feature/INIT-GATEFLOW-016-w4-w4-02` |
| TASK-W4-03 | Live verify W4 + as-built           | REQ-26, REQ-27, REQ-28, REQ-29, REQ-30, REQ-31 | TASK-W4-01, TASK-W4-02 | `tests/verify/06-w4-checkpoints-board.md` create; `docs/specification/as-built/Implementation-Status-INIT-GATEFLOW-016.md` modify; `docs/specification/as-built/implementation-status.md` modify                                  | Smoke checkpoints + board PASS                                                                 | command / `Follow tests/verify/06-w4-checkpoints-board.md` | exit 0 + assertions green | Wave-Execution-INIT-GATEFLOW-016-W4.md § TASK-W4-03 | gateflow-ops | `docs/specification/product/INIT-GATEFLOW-016-gateflow-ops.md` | `tests/verify/06-w4-checkpoints-board.md` | testing-verify-flows                                | —         | `feature/INIT-GATEFLOW-016-w4-w4-03` |

#### Files (W4)

| ID         | Path                                                                     | Action |
| ---------- | ------------------------------------------------------------------------ | ------ |
| FILE-W4-01 | `app/api/gateflow/checkpoints/route.ts`                                  | create |
| FILE-W4-02 | `components/checkpoints/checkpoint-views.tsx`                            | create |
| FILE-W4-03 | `hooks/use-checkpoints.ts`                                               | create |
| FILE-W4-04 | `app/(dashboard)/checkpoints/page.tsx`                                   | create |
| FILE-W4-05 | `data/locales/en/checkpoints.json`                                       | create |
| FILE-W4-06 | `app/api/gateflow/board/route.ts`                                        | create |
| FILE-W4-07 | `components/board/ticket-views.tsx`                                      | create |
| FILE-W4-08 | `hooks/use-board.ts`                                                     | create |
| FILE-W4-09 | `app/(dashboard)/board/page.tsx`                                         | create |
| FILE-W4-10 | `data/locales/en/board.json`                                             | create |
| FILE-W4-11 | `tests/verify/06-w4-checkpoints-board.md`                                | create |
| FILE-W4-12 | `docs/specification/as-built/Implementation-Status-INIT-GATEFLOW-016.md` | modify |
| FILE-W4-13 | `docs/specification/as-built/implementation-status.md`                   | modify |

#### Tests (W4)

| ID        | Layer        | Command                                               | Proves                                         |
| --------- | ------------ | ----------------------------------------------------- | ---------------------------------------------- |
| TEST-W4-U | unit         | `make test`                                           | wave REQs pure logic / mappers                 |
| TEST-W4-L | live (smoke) | `tests/verify/06-w4-checkpoints-board.md` (human-run) | REQ-26, REQ-27, REQ-28, REQ-29, REQ-30, REQ-31 |

#### Verification Coverage (W4)

| REQ / criterion | unit      | integration/contract                  | smoke     | sandbox | Notes |
| --------------- | --------- | ------------------------------------- | --------- | ------- | ----- |
| REQ-26          | TEST-W4-U | N/A — BFF mocked in unit where needed | TEST-W4-L | N/A     |       |
| REQ-27          | TEST-W4-U | N/A — BFF mocked in unit where needed | TEST-W4-L | N/A     |       |
| REQ-28          | TEST-W4-U | N/A — BFF mocked in unit where needed | TEST-W4-L | N/A     |       |
| REQ-29          | TEST-W4-U | N/A — BFF mocked in unit where needed | TEST-W4-L | N/A     |       |
| REQ-30          | TEST-W4-U | N/A — BFF mocked in unit where needed | TEST-W4-L | N/A     |       |
| REQ-31          | TEST-W4-U | N/A — BFF mocked in unit where needed | TEST-W4-L | N/A     |       |

#### Live-verification intent (W4)

| Field                 | Value                                                                                                                       |
| --------------------- | --------------------------------------------------------------------------------------------------------------------------- |
| Applicable            | yes — new product surfaces (P15)                                                                                            |
| Environment class     | local-compose / staging with real gateflow                                                                                  |
| Mode                  | smoke                                                                                                                       |
| Runtime head binding  | Bound at `wave-acceptance`                                                                                                  |
| Prerequisites         | `AUTH_MODE=jwt-upstream`; `UPSTREAM_BASE_URL` → live gateflow; signed-in TENANT_ADMIN session                               |
| Safe test data        | Synthetic/non-prod tenant fixtures; no PLATFORM_ADMIN routes                                                                |
| Steps / command       | Follow `tests/verify/06-w4-checkpoints-board.md` (includes `prayog:covers: REQ-26, REQ-27, REQ-28, REQ-29, REQ-30, REQ-31`) |
| Expected observations | Checklist PASS; no fabricated data; empty states well-formed                                                                |
| Expected evidence     | `wave-accepted` on tip                                                                                                      |
| Cleanup               | Remove smoke-only invites/tickets if created                                                                                |
| Stop conditions       | Non-zero/fail step or unexpected 5xx → stop; no Pass-2                                                                      |

## 3. Dependencies (DEP)

| ID     | Dependency                                  | Blocks    |
| ------ | ------------------------------------------- | --------- |
| DEP-01 | Live gateflow APIs CTR-01–07 stable (IM-01) | All waves |
| DEP-02 | W0 shell + auth jwt-upstream                | W1–W4 UI  |
| DEP-03 | W0 complete                                 | W1        |
| DEP-04 | W1 complete                                 | W2        |
| DEP-05 | W2 complete                                 | W3        |
| DEP-06 | W3 complete                                 | W4        |

## 4. Risks (RISK)

| ID      | Risk                                     | Mitigation                                       |
| ------- | ---------------------------------------- | ------------------------------------------------ |
| RISK-01 | Client-side onboarding composition drift | Single `lib/onboarding-verdict.ts` + unit matrix |
| RISK-02 | Concurrent gateflow contract change      | Monitor IM-01; freeze expectation                |
| RISK-03 | Thin run narrative (no log pane)         | Accepted v0 risk; timeline/outcomes still real   |
| RISK-04 | Large surface scope creep                | Strict W0→W4 order                               |

## 5. Out of scope

- Any gateflow backend/route/schema change
- PLATFORM_ADMIN console; Launchpad scaffolding; prayog-skills pin edits
- Auto-lift / auto-merge; RBAC tiers; process editing
- Named backend gaps (fleet-summary, process-map, log-pane richness)

## 6. As-built and docs tasks

| Task                                         | File                                                                     | Action                                                                      |
| -------------------------------------------- | ------------------------------------------------------------------------ | --------------------------------------------------------------------------- |
| Create/update per-initiative as-built detail | `docs/specification/as-built/Implementation-Status-INIT-GATEFLOW-016.md` | create/modify each wave                                                     |
| Update as-built index row                    | `docs/specification/as-built/implementation-status.md`                   | overwrite capability rows in place                                          |
| Live-verify coverage markers                 | each `tests/verify/0N-….md`                                              | self-declare `prayog:covers:` — do not use tests/README.md as coverage SSOT |

## 7. Plan check summary

| Check                          | Status                            |
| ------------------------------ | --------------------------------- |
| P1 REQ inventory               | PASS                              |
| P2 REQ↔TASK                    | PASS                              |
| P3 FILE paths                  | PASS                              |
| P4 Exit evidence               | PASS                              |
| P5 Verification layers         | PASS                              |
| P6 Scope                       | PASS                              |
| P7 Risks                       | PASS                              |
| P8 Wave order                  | PASS                              |
| P9 As-built                    | PASS                              |
| P10 Self-contained + commands  | PASS                              |
| P11 MDC notes                  | PASS                              |
| P12 ADR Accepted               | PASS — ADR-001 Accepted           |
| P13 TDD Accepted + lint verify | PASS                              |
| P14 WorkManifest seed          | PASS                              |
| P15 Co-ship live verify        | PASS — overlap checked; new FILEs |
| P16 WorkManifest contract      | PASS — see validator after write  |

## 8. Forge / PR instructions

> Persist locally; publish via `/commit-workspace` to Draft spec PR. Label stays `spec-pending` until §10.

```
Branch:   chore/INIT-GATEFLOW-016-spec-gateflow-ops
PR:       https://github.com/drivestream-lab/gateflow-ops/pull/19
Reviewers: @drivestream-lab/prayog-pe-team
Review deadline: 2026-08-17
```

## 10. Coding-readiness unlock (PE — after plan on head)

| Item                 | Value                                                                                             |
| -------------------- | ------------------------------------------------------------------------------------------------- |
| Workflow outcome     | `pass` — P1–P16 PASS; Accepted TDD/ADR; CURRENT sources                                           |
| Verdict              | GATE OPEN REQUEST                                                                                 |
| Spec PR              | https://github.com/drivestream-lab/gateflow-ops/pull/19                                           |
| Spec PR head SHA     | `{after-forge-commit}` (currently `831929be21f765089e6f7f1ce477a89b7d113d43` before plan publish) |
| Gate label (current) | `spec-pending`                                                                                    |
| Gate label (target)  | `spec-lgtm`                                                                                       |
| Local plan path      | `docs/specification/reports/Implementation-Plan-INIT-GATEFLOW-016.md`                             |
| Forge readiness      | `/commit-workspace` — do not commit inside this skill                                             |
| Blocking items       | none                                                                                              |

### Approve attestation body

```text
Spec package approved
initiative: INIT-GATEFLOW-016
spec_pr_head_sha: {SHA after plan commit}
meta_pr_head_sha: 5422e0f28ce8cb6b0b9f936b5df87afe280d4957
impact_map_revision: 1
prd_digest: sha256:2ee19c297b4f948c9f3fbb29d5b45e1e5db9e32fce4a21780915872b3640947a
scope_digest: sha256:4daa0360b2c895fca619c93bc2bf765c6cca1a0c05d12e0cae9331bead47df08
plan_digest: sha256:{plan digest after publish}
artifacts:
  - docs/specification/product/INIT-GATEFLOW-016-gateflow-ops.md
  - docs/specification/reports/Initiative-Feasibility-Report-INIT-GATEFLOW-016.md
  - docs/specification/reports/Technical-Review-INIT-GATEFLOW-016.md
  - docs/specification/reports/Implementation-Plan-INIT-GATEFLOW-016.md
```

## 9. WorkManifest seed

```yaml
# Generated by /spec-implementation-plan — 2026-08-12
apiVersion: prayog/v1
kind: WorkManifest

initiative: INIT-GATEFLOW-016

metadata:
  title: INIT-GATEFLOW-016 — Gateflow Mission Control
  summary: |
    Build gateflow-ops Mission Control UI/BFF for CAP-A–G against live
    gateflow APIs only (REQ-01–REQ-31), sequenced W0–W4.
  playbook:
    - docs/specification/product/INIT-GATEFLOW-016-gateflow-ops.md
    - docs/specification/reports/Implementation-Plan-INIT-GATEFLOW-016.md

target:
  org: drivestream-lab
  project: "drivestream-lab Board"

defaults:
  initiative: INIT-GATEFLOW-016
  parent: EPIC
  labels:
    - INIT-GATEFLOW-016

epic:
  id: EPIC
  repo: gateflow-ops
  title: "[feature] INIT-GATEFLOW-016 — Gateflow Mission Control"
  codebase: gateflow-ops
  spec_path: docs/specification/product/INIT-GATEFLOW-016-gateflow-ops.md
  verify_command: tests/verify/02-w0-identity-onboarding.md
  body: |
    ## Objective

    Deliver Mission Control v0 across seven capability areas as UI/BFF
    only against existing gateflow APIs.

    ## Waves

    | Wave | Goal |
    |------|------|
    | W0 | Operators sign in, manage tenant identity, onboard catalogue repos with a single pass/fail verdict, and navigate via WorkspaceShell. |
    | W1 | Start implement/spec/closeout waves, inspect runs/timelines, authorize forge external-action stops. |
    | W2 | List/detail initiatives and compose readouts through closure start. |
    | W3 | Render four tenant-scoped metrics views without mocks. |
    | W4 | Checkpoint status/history and board ticket list/create/status/link. |

    ## References

    - Spec: docs/specification/product/INIT-GATEFLOW-016-gateflow-ops.md
    - Plan: docs/specification/reports/Implementation-Plan-INIT-GATEFLOW-016.md
    - TDD: docs/specification/reports/Technical-Review-INIT-GATEFLOW-016.md

work:
  - id: W0
    kind: issue
    repo: gateflow-ops
    title: "[INIT-GATEFLOW-016 W0] Identity, fleet onboarding, workspace shell"
    depends_on: []
    codebase: gateflow-ops
    spec_path: docs/specification/product/INIT-GATEFLOW-016-gateflow-ops.md
    verify_command: tests/verify/02-w0-identity-onboarding.md
    tasks:
      - id: TASK-W0-01
        implements: [REQ-01, REQ-02, REQ-03, REQ-04, REQ-05, REQ-06, REQ-07, REQ-08]
        depends_on: []
        files:
          - path: components/workspace/workspace-shell.tsx
            action: create
          - path: components/workspace/workspace-nav.tsx
            action: create
          - path: components/workspace/page-header.tsx
            action: create
          - path: components/workspace/page-body.tsx
            action: create
          - path: lib/workspace-nav.ts
            action: create
          - path: app/(dashboard)/layout.tsx
            action: modify
        exit:
          criteria:
            - "Authenticated layout renders left nav + page slots; no page invents parallel chrome"
          proof:
            kind: command
            command: "make check && make test"
            expected: "exit 0; assertions green"
            evidence_expected: "Wave-Execution-INIT-GATEFLOW-016-W0.md § TASK-W0-01"
      - id: TASK-W0-02
        implements: [REQ-01, REQ-02]
        depends_on:
          - TASK-W0-01
        files:
          - path: app/api/gateflow/tenants/route.ts
            action: create
          - path: app/api/gateflow/tenants/users/route.ts
            action: create
          - path: components/tenant/tenant-detail.tsx
            action: create
          - path: hooks/use-tenant.ts
            action: create
          - path: data/locales/en/tenants.json
            action: create
          - path: app/(dashboard)/tenant/page.tsx
            action: create
        exit:
          criteria:
            - "Tenant detail and invite succeed via same-origin BFF; 401 redirects login"
          proof:
            kind: command
            command: "make check && make test"
            expected: "exit 0; assertions green"
            evidence_expected: "Wave-Execution-INIT-GATEFLOW-016-W0.md § TASK-W0-02"
      - id: TASK-W0-03
        implements: [REQ-03, REQ-04, REQ-05, REQ-06, REQ-07, REQ-08]
        depends_on:
          - TASK-W0-01
        files:
          - path: app/api/gateflow/programme/route.ts
            action: create
          - path: lib/onboarding-verdict.ts
            action: create
          - path: components/fleet/onboarding-flow.tsx
            action: create
          - path: hooks/use-programme.ts
            action: create
          - path: data/locales/en/fleet.json
            action: create
          - path: app/(dashboard)/fleet/page.tsx
            action: create
        exit:
          criteria:
            - "Catalogue/connect/select/readiness/deselect work; UI shows single pass/fail never partial"
          proof:
            kind: command
            command: "make check && make test"
            expected: "exit 0; assertions green"
            evidence_expected: "Wave-Execution-INIT-GATEFLOW-016-W0.md § TASK-W0-03"
      - id: TASK-W0-04
        implements: [REQ-07]
        depends_on:
          - TASK-W0-03
        files:
          - path: tests/unit/onboarding-verdict.test.ts
            action: create
        exit:
          criteria:
            - "All select×readiness combos assert pass|fail only; vitest green"
          proof:
            kind: command
            command: "make test"
            expected: "exit 0; assertions green"
            evidence_expected: "Wave-Execution-INIT-GATEFLOW-016-W0.md § TASK-W0-04"
      - id: TASK-W0-05
        implements: [REQ-01, REQ-02, REQ-03, REQ-04, REQ-05, REQ-06, REQ-07, REQ-08]
        depends_on:
          - TASK-W0-02
          - TASK-W0-03
          - TASK-W0-04
        files:
          - path: tests/verify/02-w0-identity-onboarding.md
            action: create
          - path: docs/specification/as-built/Implementation-Status-INIT-GATEFLOW-016.md
            action: create
          - path: docs/specification/as-built/implementation-status.md
            action: modify
        exit:
          criteria:
            - "Human smoke against jwt-upstream + real gateflow exits PASS; as-built index row points to initiative detail"
          proof:
            kind: command
            command: "Follow tests/verify/02-w0-identity-onboarding.md"
            expected: "exit 0; assertions green"
            evidence_expected: "wave-accepted on tip"
    verification:
      check: "make check"
      unit: "make test"
      live:
        applicable: true
        mode: smoke
        command: tests/verify/02-w0-identity-onboarding.md
        covers: [REQ-01, REQ-02, REQ-03, REQ-04, REQ-05, REQ-06, REQ-07, REQ-08]
        prerequisites:
          - "AUTH_MODE=jwt-upstream; UPSTREAM_BASE_URL=live gateflow; TENANT_ADMIN session"
        safe_test_data:
          - "non-prod tenant fixtures only"
        steps:
          - "Follow tests/verify/02-w0-identity-onboarding.md checklist end-to-end"
        expected_observations:
          - "All checklist steps PASS; no fabricated/mock values"
        evidence_expected: "wave-accepted on tip"
        cleanup:
          - "Remove smoke-only invites/tickets if created"
        stop_conditions:
          - "Any fail step or unexpected 5xx → stop; do not start Pass-2"
    body: |
      ## Wave goal

      Operators sign in, manage tenant identity, onboard catalogue repos with a single pass/fail verdict, and navigate via WorkspaceShell.

      ## Tasks (from plan §2)

      | Task | Implements | Depends on | Exit criteria | Proof |
      |------|------------|------------|---------------|-------|
      | TASK-W0-01 | REQ-01, REQ-02, REQ-03, REQ-04, REQ-05, REQ-06, REQ-07, REQ-08 | — | Authenticated layout renders left nav + page slots; no page invents parallel chrome | `make check && make test` |
      | TASK-W0-02 | REQ-01, REQ-02 | TASK-W0-01 | Tenant detail and invite succeed via same-origin BFF; 401 redirects login | `make check && make test` |
      | TASK-W0-03 | REQ-03, REQ-04, REQ-05, REQ-06, REQ-07, REQ-08 | TASK-W0-01 | Catalogue/connect/select/readiness/deselect work; UI shows single pass/fail never partial | `make check && make test` |
      | TASK-W0-04 | REQ-07 | TASK-W0-03 | All select×readiness combos assert pass|fail only; vitest green | `make test` |
      | TASK-W0-05 | REQ-01, REQ-02, REQ-03, REQ-04, REQ-05, REQ-06, REQ-07, REQ-08 | TASK-W0-02, TASK-W0-03, TASK-W0-04 | Human smoke against jwt-upstream + real gateflow exits PASS; as-built index row points to initiative detail | `Follow tests/verify/02-w0-identity-onboarding.md` |

      ## Done when

      - [ ] All W0 tasks complete per plan exit proof

      ## Spec reference

      docs/specification/product/INIT-GATEFLOW-016-gateflow-ops.md

  - id: W1
    kind: issue
    repo: gateflow-ops
    title: "[INIT-GATEFLOW-016 W1] Wave operations"
    depends_on:
      - W0
    codebase: gateflow-ops
    spec_path: docs/specification/product/INIT-GATEFLOW-016-gateflow-ops.md
    verify_command: tests/verify/03-w1-wave-operations.md
    tasks:
      - id: TASK-W1-01
        implements: [REQ-09, REQ-10, REQ-11, REQ-12]
        depends_on: []
        files:
          - path: app/api/gateflow/waves/route.ts
            action: create
          - path: app/api/gateflow/runs/route.ts
            action: create
          - path: app/api/gateflow/runs/by-id/route.ts
            action: create
          - path: app/api/gateflow/runs/forge/route.ts
            action: create
          - path: components/runs/run-cockpit.tsx
            action: create
          - path: hooks/use-runs.ts
            action: create
          - path: app/(dashboard)/runs/page.tsx
            action: create
          - path: data/locales/en/runs.json
            action: create
        exit:
          criteria:
            - "Three lanes start; run timeline renders; forge authorize only on external-action stop; expected stops not styled as errors"
          proof:
            kind: command
            command: "make check && make test"
            expected: "exit 0; assertions green"
            evidence_expected: "Wave-Execution-INIT-GATEFLOW-016-W1.md § TASK-W1-01"
      - id: TASK-W1-02
        implements: [REQ-09, REQ-10, REQ-11, REQ-12]
        depends_on:
          - TASK-W1-01
        files:
          - path: tests/verify/03-w1-wave-operations.md
            action: create
          - path: docs/specification/as-built/Implementation-Status-INIT-GATEFLOW-016.md
            action: modify
          - path: docs/specification/as-built/implementation-status.md
            action: modify
        exit:
          criteria:
            - "Smoke against real wave reaching external-action authorize PASS"
          proof:
            kind: command
            command: "Follow tests/verify/03-w1-wave-operations.md"
            expected: "exit 0; assertions green"
            evidence_expected: "wave-accepted on tip"
    verification:
      check: "make check"
      unit: "make test"
      live:
        applicable: true
        mode: smoke
        command: tests/verify/03-w1-wave-operations.md
        covers: [REQ-09, REQ-10, REQ-11, REQ-12]
        prerequisites:
          - "AUTH_MODE=jwt-upstream; UPSTREAM_BASE_URL=live gateflow; TENANT_ADMIN session"
        safe_test_data:
          - "non-prod tenant fixtures only"
        steps:
          - "Follow tests/verify/03-w1-wave-operations.md checklist end-to-end"
        expected_observations:
          - "All checklist steps PASS; no fabricated/mock values"
        evidence_expected: "wave-accepted on tip"
        cleanup:
          - "Remove smoke-only invites/tickets if created"
        stop_conditions:
          - "Any fail step or unexpected 5xx → stop; do not start Pass-2"
    body: |
      ## Wave goal

      Start implement/spec/closeout waves, inspect runs/timelines, authorize forge external-action stops.

      ## Tasks (from plan §2)

      | Task | Implements | Depends on | Exit criteria | Proof |
      |------|------------|------------|---------------|-------|
      | TASK-W1-01 | REQ-09, REQ-10, REQ-11, REQ-12 | — | Three lanes start; run timeline renders; forge authorize only on external-action stop; expected stops not styled as errors | `make check && make test` |
      | TASK-W1-02 | REQ-09, REQ-10, REQ-11, REQ-12 | TASK-W1-01 | Smoke against real wave reaching external-action authorize PASS | `Follow tests/verify/03-w1-wave-operations.md` |

      ## Done when

      - [ ] All W1 tasks complete per plan exit proof

      ## Spec reference

      docs/specification/product/INIT-GATEFLOW-016-gateflow-ops.md

  - id: W2
    kind: issue
    repo: gateflow-ops
    title: "[INIT-GATEFLOW-016 W2] Initiative & delivery tracking"
    depends_on:
      - W1
    codebase: gateflow-ops
    spec_path: docs/specification/product/INIT-GATEFLOW-016-gateflow-ops.md
    verify_command: tests/verify/04-w2-initiative-tracking.md
    tasks:
      - id: TASK-W2-01
        implements: [REQ-13, REQ-14, REQ-15, REQ-16, REQ-17, REQ-18, REQ-19, REQ-20, REQ-21]
        depends_on: []
        files:
          - path: app/api/gateflow/initiatives/route.ts
            action: create
          - path: app/api/gateflow/initiatives/by-id/route.ts
            action: create
          - path: components/initiatives/initiative-hub.tsx
            action: create
          - path: hooks/use-initiatives.ts
            action: create
          - path: app/(dashboard)/initiatives/page.tsx
            action: create
          - path: data/locales/en/initiatives.json
            action: create
        exit:
          criteria:
            - "Initiative list/detail and readouts render gateflow composition with honest gaps; closure start returns accepted enqueue"
          proof:
            kind: command
            command: "make check && make test"
            expected: "exit 0; assertions green"
            evidence_expected: "Wave-Execution-INIT-GATEFLOW-016-W2.md § TASK-W2-01"
      - id: TASK-W2-02
        implements: [REQ-13, REQ-14, REQ-15, REQ-16, REQ-17, REQ-18, REQ-19, REQ-20, REQ-21]
        depends_on:
          - TASK-W2-01
        files:
          - path: tests/verify/04-w2-initiative-tracking.md
            action: create
          - path: docs/specification/as-built/Implementation-Status-INIT-GATEFLOW-016.md
            action: modify
          - path: docs/specification/as-built/implementation-status.md
            action: modify
        exit:
          criteria:
            - "Smoke vs initiative with board EPIC + run history PASS"
          proof:
            kind: command
            command: "Follow tests/verify/04-w2-initiative-tracking.md"
            expected: "exit 0; assertions green"
            evidence_expected: "wave-accepted on tip"
    verification:
      check: "make check"
      unit: "make test"
      live:
        applicable: true
        mode: smoke
        command: tests/verify/04-w2-initiative-tracking.md
        covers: [REQ-13, REQ-14, REQ-15, REQ-16, REQ-17, REQ-18, REQ-19, REQ-20, REQ-21]
        prerequisites:
          - "AUTH_MODE=jwt-upstream; UPSTREAM_BASE_URL=live gateflow; TENANT_ADMIN session"
        safe_test_data:
          - "non-prod tenant fixtures only"
        steps:
          - "Follow tests/verify/04-w2-initiative-tracking.md checklist end-to-end"
        expected_observations:
          - "All checklist steps PASS; no fabricated/mock values"
        evidence_expected: "wave-accepted on tip"
        cleanup:
          - "Remove smoke-only invites/tickets if created"
        stop_conditions:
          - "Any fail step or unexpected 5xx → stop; do not start Pass-2"
    body: |
      ## Wave goal

      List/detail initiatives and compose readouts through closure start.

      ## Tasks (from plan §2)

      | Task | Implements | Depends on | Exit criteria | Proof |
      |------|------------|------------|---------------|-------|
      | TASK-W2-01 | REQ-13, REQ-14, REQ-15, REQ-16, REQ-17, REQ-18, REQ-19, REQ-20, REQ-21 | — | Initiative list/detail and readouts render gateflow composition with honest gaps; closure start returns accepted enqueue | `make check && make test` |
      | TASK-W2-02 | REQ-13, REQ-14, REQ-15, REQ-16, REQ-17, REQ-18, REQ-19, REQ-20, REQ-21 | TASK-W2-01 | Smoke vs initiative with board EPIC + run history PASS | `Follow tests/verify/04-w2-initiative-tracking.md` |

      ## Done when

      - [ ] All W2 tasks complete per plan exit proof

      ## Spec reference

      docs/specification/product/INIT-GATEFLOW-016-gateflow-ops.md

  - id: W3
    kind: issue
    repo: gateflow-ops
    title: "[INIT-GATEFLOW-016 W3] Metrics & efficacy panel"
    depends_on:
      - W2
    codebase: gateflow-ops
    spec_path: docs/specification/product/INIT-GATEFLOW-016-gateflow-ops.md
    verify_command: tests/verify/05-w3-metrics-efficacy.md
    tasks:
      - id: TASK-W3-01
        implements: [REQ-22, REQ-23, REQ-24, REQ-25]
        depends_on: []
        files:
          - path: app/api/gateflow/metrics/route.ts
            action: create
          - path: components/metrics/metrics-panels.tsx
            action: create
          - path: hooks/use-metrics.ts
            action: create
          - path: app/(dashboard)/metrics/page.tsx
            action: create
          - path: data/locales/en/metrics.json
            action: create
        exit:
          criteria:
            - "Four panels render tenant-scoped data; empty tenant shows empty state not mocks"
          proof:
            kind: command
            command: "make check && make test"
            expected: "exit 0; assertions green"
            evidence_expected: "Wave-Execution-INIT-GATEFLOW-016-W3.md § TASK-W3-01"
      - id: TASK-W3-02
        implements: [REQ-22, REQ-23, REQ-24, REQ-25]
        depends_on:
          - TASK-W3-01
        files:
          - path: tests/verify/05-w3-metrics-efficacy.md
            action: create
          - path: docs/specification/as-built/Implementation-Status-INIT-GATEFLOW-016.md
            action: modify
          - path: docs/specification/as-built/implementation-status.md
            action: modify
        exit:
          criteria:
            - "Smoke metrics views PASS with real tenant history"
          proof:
            kind: command
            command: "Follow tests/verify/05-w3-metrics-efficacy.md"
            expected: "exit 0; assertions green"
            evidence_expected: "wave-accepted on tip"
    verification:
      check: "make check"
      unit: "make test"
      live:
        applicable: true
        mode: smoke
        command: tests/verify/05-w3-metrics-efficacy.md
        covers: [REQ-22, REQ-23, REQ-24, REQ-25]
        prerequisites:
          - "AUTH_MODE=jwt-upstream; UPSTREAM_BASE_URL=live gateflow; TENANT_ADMIN session"
        safe_test_data:
          - "non-prod tenant fixtures only"
        steps:
          - "Follow tests/verify/05-w3-metrics-efficacy.md checklist end-to-end"
        expected_observations:
          - "All checklist steps PASS; no fabricated/mock values"
        evidence_expected: "wave-accepted on tip"
        cleanup:
          - "Remove smoke-only invites/tickets if created"
        stop_conditions:
          - "Any fail step or unexpected 5xx → stop; do not start Pass-2"
    body: |
      ## Wave goal

      Render four tenant-scoped metrics views without mocks.

      ## Tasks (from plan §2)

      | Task | Implements | Depends on | Exit criteria | Proof |
      |------|------------|------------|---------------|-------|
      | TASK-W3-01 | REQ-22, REQ-23, REQ-24, REQ-25 | — | Four panels render tenant-scoped data; empty tenant shows empty state not mocks | `make check && make test` |
      | TASK-W3-02 | REQ-22, REQ-23, REQ-24, REQ-25 | TASK-W3-01 | Smoke metrics views PASS with real tenant history | `Follow tests/verify/05-w3-metrics-efficacy.md` |

      ## Done when

      - [ ] All W3 tasks complete per plan exit proof

      ## Spec reference

      docs/specification/product/INIT-GATEFLOW-016-gateflow-ops.md

  - id: W4
    kind: issue
    repo: gateflow-ops
    title: "[INIT-GATEFLOW-016 W4] Checkpoints & board tickets"
    depends_on:
      - W3
    codebase: gateflow-ops
    spec_path: docs/specification/product/INIT-GATEFLOW-016-gateflow-ops.md
    verify_command: tests/verify/06-w4-checkpoints-board.md
    tasks:
      - id: TASK-W4-01
        implements: [REQ-26, REQ-27]
        depends_on: []
        files:
          - path: app/api/gateflow/checkpoints/route.ts
            action: create
          - path: components/checkpoints/checkpoint-views.tsx
            action: create
          - path: hooks/use-checkpoints.ts
            action: create
          - path: app/(dashboard)/checkpoints/page.tsx
            action: create
          - path: data/locales/en/checkpoints.json
            action: create
        exit:
          criteria:
            - "Status/history render; composed ref with no run shows named no-run state"
          proof:
            kind: command
            command: "make check && make test"
            expected: "exit 0; assertions green"
            evidence_expected: "Wave-Execution-INIT-GATEFLOW-016-W4.md § TASK-W4-01"
      - id: TASK-W4-02
        implements: [REQ-28, REQ-29, REQ-30, REQ-31]
        depends_on:
          - TASK-W4-01
        files:
          - path: app/api/gateflow/board/route.ts
            action: create
          - path: components/board/ticket-views.tsx
            action: create
          - path: hooks/use-board.ts
            action: create
          - path: app/(dashboard)/board/page.tsx
            action: create
          - path: data/locales/en/board.json
            action: create
        exit:
          criteria:
            - "List/create/status/link succeed with org/repo filters; create idempotent on initiative_id+type"
          proof:
            kind: command
            command: "make check && make test"
            expected: "exit 0; assertions green"
            evidence_expected: "Wave-Execution-INIT-GATEFLOW-016-W4.md § TASK-W4-02"
      - id: TASK-W4-03
        implements: [REQ-26, REQ-27, REQ-28, REQ-29, REQ-30, REQ-31]
        depends_on:
          - TASK-W4-01
          - TASK-W4-02
        files:
          - path: tests/verify/06-w4-checkpoints-board.md
            action: create
          - path: docs/specification/as-built/Implementation-Status-INIT-GATEFLOW-016.md
            action: modify
          - path: docs/specification/as-built/implementation-status.md
            action: modify
        exit:
          criteria:
            - "Smoke checkpoints + board PASS"
          proof:
            kind: command
            command: "Follow tests/verify/06-w4-checkpoints-board.md"
            expected: "exit 0; assertions green"
            evidence_expected: "wave-accepted on tip"
    verification:
      check: "make check"
      unit: "make test"
      live:
        applicable: true
        mode: smoke
        command: tests/verify/06-w4-checkpoints-board.md
        covers: [REQ-26, REQ-27, REQ-28, REQ-29, REQ-30, REQ-31]
        prerequisites:
          - "AUTH_MODE=jwt-upstream; UPSTREAM_BASE_URL=live gateflow; TENANT_ADMIN session"
        safe_test_data:
          - "non-prod tenant fixtures only"
        steps:
          - "Follow tests/verify/06-w4-checkpoints-board.md checklist end-to-end"
        expected_observations:
          - "All checklist steps PASS; no fabricated/mock values"
        evidence_expected: "wave-accepted on tip"
        cleanup:
          - "Remove smoke-only invites/tickets if created"
        stop_conditions:
          - "Any fail step or unexpected 5xx → stop; do not start Pass-2"
    body: |
      ## Wave goal

      Checkpoint status/history and board ticket list/create/status/link.

      ## Tasks (from plan §2)

      | Task | Implements | Depends on | Exit criteria | Proof |
      |------|------------|------------|---------------|-------|
      | TASK-W4-01 | REQ-26, REQ-27 | — | Status/history render; composed ref with no run shows named no-run state | `make check && make test` |
      | TASK-W4-02 | REQ-28, REQ-29, REQ-30, REQ-31 | TASK-W4-01 | List/create/status/link succeed with org/repo filters; create idempotent on initiative_id+type | `make check && make test` |
      | TASK-W4-03 | REQ-26, REQ-27, REQ-28, REQ-29, REQ-30, REQ-31 | TASK-W4-01, TASK-W4-02 | Smoke checkpoints + board PASS | `Follow tests/verify/06-w4-checkpoints-board.md` |

      ## Done when

      - [ ] All W4 tasks complete per plan exit proof

      ## Spec reference

      docs/specification/product/INIT-GATEFLOW-016-gateflow-ops.md
```

---

```yaml
handoff:
  contract: sdd-delivery/v2
  stage: spec-implementation-plan
  outcome: pass
  artifact:
    path: docs/specification/reports/Implementation-Plan-INIT-GATEFLOW-016.md
  blockers: []
  signals:
    plan_ready: true
    p15_overlap_checked: true
    waves: [W0, W1, W2, W3, W4]
    req_count: 31
    adr_accepted: [ADR-001]
  next_candidates:
    - coding-readiness
  human_checkpoint: true
  external_action: false
  forge:
    action: commit_workspace
    draft: true
    apply_labels:
      - spec-pending
    title: "[INIT-GATEFLOW-016] Spec — gateflow-ops"
    body_path: docs/specification/product/INIT-GATEFLOW-016-gateflow-ops.md
```
