---
goal: INIT-GATEFLOW-017 — implementation plan
initiative: INIT-GATEFLOW-017
status: Planned
date_created: 2026-08-14
source_spec: docs/specification/product/INIT-GATEFLOW-017-gateflow-ops.md
feasibility_report: docs/specification/reports/Initiative-Feasibility-Report-INIT-GATEFLOW-017.md
technical_review: docs/specification/reports/Technical-Review-INIT-GATEFLOW-017.md
prd_digest: sha256:c0fe55040928a13976133edde5cf71f0524815c17c0a8de79173ed3fa0657f67
impact_map: prayog-meta/prd/reports/Impact-Map-INIT-GATEFLOW-017.md
impact_map_revision: 1
repo_scope_digest: sha256:13cee9aae41718fd4ad8655d77738042761b0e45db7eefc898a693c42c2fb987
approved_meta_pr_head: 601b00e0a74510a6af1c33bc80ca27260995c094
branch: chore/INIT-GATEFLOW-017-spec-gateflow-ops
review_deadline: 2026-08-19
deciders: PE — spec-lgtm + Approve on exact head after full package
---

# Implementation plan — INIT-GATEFLOW-017

## Source freshness and command contract

| Item                  | Value                                                                           | Status             |
| --------------------- | ------------------------------------------------------------------------------- | ------------------ |
| Spec                  | `docs/specification/product/INIT-GATEFLOW-017-gateflow-ops.md`                  | CURRENT            |
| Feasibility report    | `docs/specification/reports/Initiative-Feasibility-Report-INIT-GATEFLOW-017.md` | CURRENT            |
| Technical review      | `docs/specification/reports/Technical-Review-INIT-GATEFLOW-017.md`              | CURRENT (Accepted) |
| Impact map / revision | `prayog-meta/prd/reports/Impact-Map-INIT-GATEFLOW-017.md` / `1`                 | CURRENT            |
| Repo scope digest     | `sha256:13cee9aae41718fd4ad8655d77738042761b0e45db7eefc898a693c42c2fb987`       | CURRENT            |
| Approved meta PR head | `601b00e0a74510a6af1c33bc80ca27260995c094`                                      | CURRENT            |
| `check_command`       | `make check`                                                                    | RESOLVED           |
| `test_command`        | `make test`                                                                     | RESOLVED           |
| `verify_command`      | per-wave `tests/verify/0N-….md` (human-run smoke)                               | RESOLVED           |
| `ground_command`      | N/A — no Makefile ground target; `/ground-spec` after waves uses as-built       | RESOLVED / N/A     |

> Do not start W1–W3 live verify until gateflow CTR-01/02/04 HTTP is live
> (TDD FF-04 / spec A-5). W0 does not call those routes.

## 0. Technical design reference

| Item                          | Value                                                                                                                                                                                                                                                                                                                |
| ----------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Technical review              | `docs/specification/reports/Technical-Review-INIT-GATEFLOW-017.md`                                                                                                                                                                                                                                                   |
| Technical review status       | Accepted                                                                                                                                                                                                                                                                                                             |
| PE sign-off                   | [x] complete — 2026-08-14 ([PR #32 comment](https://github.com/drivestream-lab/gateflow-ops/pull/32#issuecomment-5290307320))                                                                                                                                                                                        |
| Resolved ADRs                 | [`docs/specification/adr/adr-002-identity-session-vs-programme-context-cookie.md`](../adr/adr-002-identity-session-vs-programme-context-cookie.md) — Status: **Accepted**; file digest `sha256:4fadc933e25fb92930d6104f1bff67d937ee2410b2d8f66b7b3797af5f9bd667`. ADR-001 remains Accepted and independent (UI kit). |
| ADR product-boundary re-check | ADR-002 `changes_user_visible_behavior: false`, `spec_amendment_required: false`; `adr_boundary_lint.py --verify-lint-evidence --require-sources` PASS at plan time (`sha256:501e402009b86244f70aef08f405b11a4f706979e223f7b7a1b977990c46a499`) with spec REQ rows + feasibility Spec quote reconstructed            |
| Outstanding PM questions      | PM-1 — update 016 invite stories after promote (non-blocking)                                                                                                                                                                                                                                                        |
| Outstanding domain questions  | D-1 — leftover 014 bind rows in lab DB (gateflow PE; non-blocking)                                                                                                                                                                                                                                                   |

> Do not start W0 implementation until PE sign-off is marked complete above.

---

## 1. Requirements (REQ) — product ids

| ID     | Summary                                                   | Spec path                                                      | Waves  |
| ------ | --------------------------------------------------------- | -------------------------------------------------------------- | ------ |
| REQ-01 | Enter identity (name, email, password) with no programme  | `docs/specification/product/INIT-GATEFLOW-017-gateflow-ops.md` | W1     |
| REQ-02 | Email unique as factory sign-in identifier                | `docs/specification/product/INIT-GATEFLOW-017-gateflow-ops.md` | W1     |
| REQ-03 | Login identifier must be an email on entry and sign-in    | `docs/specification/product/INIT-GATEFLOW-017-gateflow-ops.md` | W0, W1 |
| REQ-04 | List/search factory identities by name or email           | `docs/specification/product/INIT-GATEFLOW-017-gateflow-ops.md` | W1     |
| REQ-05 | Entry creates `tenant_admin`, never `platform_admin`      | `docs/specification/product/INIT-GATEFLOW-017-gateflow-ops.md` | W1     |
| REQ-06 | Grant existing identity to a programme; no password       | `docs/specification/product/INIT-GATEFLOW-017-gateflow-ops.md` | W2     |
| REQ-07 | Repeat grant is idempotent                                | `docs/specification/product/INIT-GATEFLOW-017-gateflow-ops.md` | W2     |
| REQ-08 | Unknown identity cannot be granted                        | `docs/specification/product/INIT-GATEFLOW-017-gateflow-ops.md` | W2     |
| REQ-09 | One identity may be granted more than one programme       | `docs/specification/product/INIT-GATEFLOW-017-gateflow-ops.md` | W2     |
| REQ-10 | Detach identity from a programme                          | `docs/specification/product/INIT-GATEFLOW-017-gateflow-ops.md` | W2     |
| REQ-11 | Membership visible without opening delivery               | `docs/specification/product/INIT-GATEFLOW-017-gateflow-ops.md` | W2     |
| REQ-12 | Suspended identity cannot sign in or continue acts        | `docs/specification/product/INIT-GATEFLOW-017-gateflow-ops.md` | W0, W1 |
| REQ-13 | Unsuspend restores sign-in; grants unchanged              | `docs/specification/product/INIT-GATEFLOW-017-gateflow-ops.md` | W1     |
| REQ-14 | Password set stops prior sign-in                          | `docs/specification/product/INIT-GATEFLOW-017-gateflow-ops.md` | W0, W1 |
| REQ-15 | Detach/suspend does not cancel in-flight waves            | `docs/specification/product/INIT-GATEFLOW-017-gateflow-ops.md` | W2     |
| REQ-16 | After one sign-in, enter a granted programme for delivery | `docs/specification/product/INIT-GATEFLOW-017-gateflow-ops.md` | W3     |
| REQ-17 | Same identity can run delivery in two granted programmes  | `docs/specification/product/INIT-GATEFLOW-017-gateflow-ops.md` | W3     |
| REQ-18 | Zero programmes: signed in; no delivery                   | `docs/specification/product/INIT-GATEFLOW-017-gateflow-ops.md` | W0, W3 |
| REQ-19 | 016 delivery kept in entered programme; invite absent     | `docs/specification/product/INIT-GATEFLOW-017-gateflow-ops.md` | W3     |
| REQ-20 | No invite act in this console                             | `docs/specification/product/INIT-GATEFLOW-017-gateflow-ops.md` | W2     |
| REQ-21 | Membership not created by create+bind attach              | `docs/specification/product/INIT-GATEFLOW-017-gateflow-ops.md` | W2     |
| REQ-22 | `tenant_admin` cannot perform factory/grant acts          | `docs/specification/product/INIT-GATEFLOW-017-gateflow-ops.md` | W1, W3 |
| REQ-23 | `platform_admin` cannot perform delivery acts             | `docs/specification/product/INIT-GATEFLOW-017-gateflow-ops.md` | W3     |
| REQ-24 | Suspended identity may still be granted or detached       | `docs/specification/product/INIT-GATEFLOW-017-gateflow-ops.md` | W2     |
| REQ-25 | Name required at identity entry                           | `docs/specification/product/INIT-GATEFLOW-017-gateflow-ops.md` | W1     |
| REQ-26 | `tenant_admin` does not see factory identity list         | `docs/specification/product/INIT-GATEFLOW-017-gateflow-ops.md` | W3     |
| REQ-27 | `platform_admin` still onboards programme + catalogue     | `docs/specification/product/INIT-GATEFLOW-017-gateflow-ops.md` | W3     |
| REQ-28 | Grant/detach of unknown programme refused                 | `docs/specification/product/INIT-GATEFLOW-017-gateflow-ops.md` | W2     |
| REQ-29 | Entry without password refused                            | `docs/specification/product/INIT-GATEFLOW-017-gateflow-ops.md` | W1     |
| REQ-30 | Password never returned after set                         | `docs/specification/product/INIT-GATEFLOW-017-gateflow-ops.md` | W1, W2 |

---

## 2. Implementation phases

> **Path note:** WorkManifest forbids `[]` glob chars in `files[].path`. BFF
> handlers use exact folders (`identities/`, `grants/`, `by-id`); request
> params carry ids. App Router `[param]` folders are not listed; W2 deletes
> attach via `lib/programme-attach.ts` and observable 404 on the old route.
> **Kill line (A-5 / FF-04):** do not merge W1/W2 identity or grant screens
> while gateflow still creates membership via 014 create+bind. W3 enter+delivery
> rebind is the ADR-002 migration change set.

### Phase W0 — Programme-context chassis

**GOAL-W0:** Identity `SESSION_COOKIE` stays the only Bearer. A second httpOnly
cookie plus `getEnteredProgrammeContext()` exist. Login/logout clear that
cookie. Email-shape refuse works on sign-in. Delivery still reads JWT
`tenant_id` until W3 (same-change-set migration). No identity/grant screens.

**P15 overlap check:** `PYTHONPATH=prayog-skills python3 prayog-skills/scripts/verify_coverage_query.py --dump tests/verify` and `--req REQ-03`. Hits: `01-login-status-page.md` (legacy, no marker — login chassis); `02-w0-identity-onboarding.md` marker is **016** REQ-01–08 (tenant/invite/catalogue), not 017 email-shape. **Extend `01`** (related login surface). Do not extend `02` (REQ-id collision with 016).

| Task       | Description                                        | Implements                     | Depends on             | Files (path/action)                                                                                                                                                                           | Exit criteria                                                                                                                                                              | Proof (kind / command\|review)                          | Expected                 | Evidence expected                                   | Codebase     | Spec path                                                      | Verify command                         | MDC notes              | ADR notes        | Branch                                           |
| ---------- | -------------------------------------------------- | ------------------------------ | ---------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------- | ------------------------ | --------------------------------------------------- | ------------ | -------------------------------------------------------------- | -------------------------------------- | ---------------------- | ---------------- | ------------------------------------------------ |
| TASK-W0-01 | Programme-context cookie + helper; login/logout/me | REQ-12, REQ-14, REQ-18         | —                      | `lib/programme-context.ts` create; `lib/env.ts` modify; `app/api/auth/login/route.ts` modify; `app/api/auth/logout/route.ts` modify; `app/api/auth/me/route.ts` modify                        | Helper returns `{programmeId,tenantId}` or `null`; never JWT `tenant_id`; login/logout delete context cookie; `me` JSON has no tokens; `dev-stub` leaves `tenant_id` unset | command / `make check && make test`                     | exit 0; assertions green | Wave-Execution-INIT-GATEFLOW-017-W0.md § TASK-W0-01 | gateflow-ops | `docs/specification/product/INIT-GATEFLOW-017-gateflow-ops.md` | `make check && make test`              | nextjs-bff-server-auth | ADR-002 Option B | `feature/INIT-GATEFLOW-017-w0-programme-context` |
| TASK-W0-02 | Email-shape refuse on sign-in mapper               | REQ-03                         | —                      | `lib/auth-login-upstream.ts` modify                                                                                                                                                           | Empty / no `@` / no domain maps to named i18n refuse; no upstream call                                                                                                     | command / `make check && make test`                     | exit 0; assertions green | Wave-Execution-INIT-GATEFLOW-017-W0.md § TASK-W0-02 | gateflow-ops | `docs/specification/product/INIT-GATEFLOW-017-gateflow-ops.md` | `make check && make test`              | no-hardcoded-strings   | —                | `feature/INIT-GATEFLOW-017-w0-programme-context` |
| TASK-W0-03 | Unit tests for helper + email-shape                | REQ-03, REQ-12, REQ-14, REQ-18 | TASK-W0-01, TASK-W0-02 | `tests/unit/programme-context.test.ts` create; `tests/unit/auth-login-upstream.test.ts` modify                                                                                                | Cookie present/absent/malformed; helper never I/O; email-shape cases assert                                                                                                | command / `make test`                                   | exit 0; assertions green | Wave-Execution-INIT-GATEFLOW-017-W0.md § TASK-W0-03 | gateflow-ops | `docs/specification/product/INIT-GATEFLOW-017-gateflow-ops.md` | `make check && make test`              | testing-verify-flows   | ADR-002          | `feature/INIT-GATEFLOW-017-w0-programme-context` |
| TASK-W0-04 | Extend login live verify + as-built                | REQ-03, REQ-12, REQ-14, REQ-18 | TASK-W0-03             | `tests/verify/01-login-status-page.md` modify; `docs/specification/as-built/Implementation-Status-INIT-GATEFLOW-017.md` create; `docs/specification/as-built/implementation-status.md` modify | Smoke: malformed email refused; logout clears both cookies; `me` has no token fields; marker `prayog:covers: REQ-03, REQ-12, REQ-14, REQ-18`                               | command / `Follow tests/verify/01-login-status-page.md` | human PASS observations  | Wave-Execution-INIT-GATEFLOW-017-W0.md § TASK-W0-04 | gateflow-ops | `docs/specification/product/INIT-GATEFLOW-017-gateflow-ops.md` | `tests/verify/01-login-status-page.md` | testing-verify-flows   | ADR-002          | `feature/INIT-GATEFLOW-017-w0-programme-context` |

#### Files (W0)

| ID         | Path                                                                     | Action |
| ---------- | ------------------------------------------------------------------------ | ------ |
| FILE-W0-01 | `lib/programme-context.ts`                                               | create |
| FILE-W0-02 | `lib/env.ts`                                                             | modify |
| FILE-W0-03 | `app/api/auth/login/route.ts`                                            | modify |
| FILE-W0-04 | `app/api/auth/logout/route.ts`                                           | modify |
| FILE-W0-05 | `app/api/auth/me/route.ts`                                               | modify |
| FILE-W0-06 | `lib/auth-login-upstream.ts`                                             | modify |
| FILE-W0-07 | `tests/unit/programme-context.test.ts`                                   | create |
| FILE-W0-08 | `tests/unit/auth-login-upstream.test.ts`                                 | modify |
| FILE-W0-09 | `tests/verify/01-login-status-page.md`                                   | modify |
| FILE-W0-10 | `docs/specification/as-built/Implementation-Status-INIT-GATEFLOW-017.md` | create |
| FILE-W0-11 | `docs/specification/as-built/implementation-status.md`                   | modify |

#### Tests (W0)

| ID        | Layer        | Command                                            | Proves                                 |
| --------- | ------------ | -------------------------------------------------- | -------------------------------------- |
| TEST-W0-U | unit         | `make test`                                        | REQ-03, REQ-12, REQ-14, REQ-18 parsers |
| TEST-W0-L | live (smoke) | `tests/verify/01-login-status-page.md` (human-run) | REQ-03, REQ-12, REQ-14, REQ-18 chassis |

#### Verification Coverage (W0)

| REQ / criterion                | unit      | integration/contract | smoke     | sandbox | Notes                      |
| ------------------------------ | --------- | -------------------- | --------- | ------- | -------------------------- |
| REQ-03 / sign-in email-shape   | TEST-W0-U | N/A                  | TEST-W0-L | N/A     | Entry email-shape is W1    |
| REQ-12 / session cookie death  | TEST-W0-U | N/A                  | TEST-W0-L | N/A     | Suspend BFF is W1          |
| REQ-14 / logout clears context | TEST-W0-U | N/A                  | TEST-W0-L | N/A     | Password-set BFF is W1     |
| REQ-18 / helper `null`         | TEST-W0-U | N/A                  | TEST-W0-L | N/A     | Named empty state UI is W3 |

#### Live-verification intent (W0)

| Field                 | Value                                                                                              |
| --------------------- | -------------------------------------------------------------------------------------------------- |
| Applicable            | yes — login/me/logout surfaces change                                                              |
| Environment class     | local-compose                                                                                      |
| Mode                  | smoke                                                                                              |
| Runtime head binding  | Bound at `wave-acceptance` against the wave PR head                                                |
| Prerequisites         | `npm run dev`; `.env` with `UPSTREAM_BASE_URL`; `AUTH_MODE=jwt-upstream` or documented stub        |
| Safe test data        | existing lab login; no new factory identity                                                        |
| Steps / command       | `tests/verify/01-login-status-page.md`                                                             |
| Expected observations | malformed email → named refuse; logout → both cookies gone; `GET /api/auth/me` has no access_token |
| Expected evidence     | `wave-accepted on tip`                                                                             |
| Cleanup               | sign out                                                                                           |
| Stop conditions       | Non-zero / unexpected 5xx → stop; do not start Pass-2                                              |

---

### Phase W1 — Identity factory

**GOAL-W1:** `platform_admin` enters, lists, searches, suspends, unsuspends, and
sets password on factory identities. `tenant_admin` is refused. No grant
screens. Depends on gateflow CTR-01 live (FF-04).

**P15 overlap check:** `--req REQ-01` / `--capability CAP-01`. Hit `02-w0-identity-onboarding.md` covers **016** REQ-01–08 (tenant detail + invite + catalogue), not 017 factory identity. CAP-01: no matches. **New FILE** `tests/verify/07-identity-factory.md` warranted (REQ-id collision; different surface).

| Task       | Description                                        | Implements                                                                             | Depends on                         | Files (path/action)                                                                                                                                                                                       | Exit criteria                                                                                                                          | Proof (kind / command\|review)                         | Expected                 | Evidence expected                                   | Codebase     | Spec path                                                      | Verify command                        | MDC notes                                                                     | ADR notes               | Branch                                          |
| ---------- | -------------------------------------------------- | -------------------------------------------------------------------------------------- | ---------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------ | ------------------------ | --------------------------------------------------- | ------------ | -------------------------------------------------------------- | ------------------------------------- | ----------------------------------------------------------------------------- | ----------------------- | ----------------------------------------------- |
| TASK-W1-01 | Identity BFF (list/search/create)                  | REQ-01, REQ-02, REQ-03, REQ-04, REQ-05, REQ-25, REQ-29, REQ-30                         | —                                  | `app/api/gateflow/identities/route.ts` create; `app/api/gateflow/identities/by-id/route.ts` create; `lib/constants.ts` modify                                                                             | `platform_admin` session required; DTOs omit password; named i18n for duplicate email / not an email / missing name / missing password | command / `make check && make test`                    | exit 0; assertions green | Wave-Execution-INIT-GATEFLOW-017-W1.md § TASK-W1-01 | gateflow-ops | `docs/specification/product/INIT-GATEFLOW-017-gateflow-ops.md` | `make check && make test`             | nextjs-repository-layout; nextjs-bff-route-handlers; shared-limits-pagination | —                       | `feature/INIT-GATEFLOW-017-w1-identity-factory` |
| TASK-W1-02 | Factory list/entry UI + nav                        | REQ-01, REQ-04, REQ-05, REQ-22                                                         | TASK-W1-01                         | `components/identities/identity-list.tsx` create; `app/(dashboard)/identities/page.tsx` create; `hooks/use-identities.ts` create; `data/locales/en/identities.json` create; `lib/workspace-nav.ts` modify | `platform_admin` sees factory chrome; `tenant_admin` nav omits it; copy via i18n                                                       | command / `make check && make test`                    | exit 0; assertions green | Wave-Execution-INIT-GATEFLOW-017-W1.md § TASK-W1-02 | gateflow-ops | `docs/specification/product/INIT-GATEFLOW-017-gateflow-ops.md` | `make check && make test`             | no-hardcoded-strings; workspace-page-layout                                   | ADR-001                 | `feature/INIT-GATEFLOW-017-w1-identity-factory` |
| TASK-W1-03 | Suspend / unsuspend / password-set BFF+UI          | REQ-12, REQ-13, REQ-14, REQ-22                                                         | TASK-W1-01                         | `app/api/gateflow/identities/by-id/route.ts` modify; `components/identities/identity-detail.tsx` create                                                                                                   | Suspend/password-set return 4xx/2xx with i18n; password write-only; `tenant_admin` → wrong actor                                       | command / `make check && make test`                    | exit 0; assertions green | Wave-Execution-INIT-GATEFLOW-017-W1.md § TASK-W1-03 | gateflow-ops | `docs/specification/product/INIT-GATEFLOW-017-gateflow-ops.md` | `make check && make test`             | nextjs-bff-route-handlers                                                     | ADR-002 (session death) | `feature/INIT-GATEFLOW-017-w1-identity-factory` |
| TASK-W1-04 | Unit: email/name/password refuses + password strip | REQ-02, REQ-03, REQ-25, REQ-29, REQ-30                                                 | TASK-W1-01                         | `tests/unit/identities-bff.test.ts` create                                                                                                                                                                | Doubles assert named refuses and omitted password fields                                                                               | command / `make test`                                  | exit 0; assertions green | Wave-Execution-INIT-GATEFLOW-017-W1.md § TASK-W1-04 | gateflow-ops | `docs/specification/product/INIT-GATEFLOW-017-gateflow-ops.md` | `make check && make test`             | testing-verify-flows                                                          | —                       | `feature/INIT-GATEFLOW-017-w1-identity-factory` |
| TASK-W1-05 | Live verify factory + as-built                     | REQ-01, REQ-02, REQ-04, REQ-05, REQ-12, REQ-13, REQ-14, REQ-22, REQ-25, REQ-29, REQ-30 | TASK-W1-02, TASK-W1-03, TASK-W1-04 | `tests/verify/07-identity-factory.md` create; `docs/specification/as-built/Implementation-Status-INIT-GATEFLOW-017.md` modify; `docs/specification/as-built/implementation-status.md` modify              | Human smoke against live CTR-01; marker `prayog:covers:` lists W1 live REQs                                                            | command / `Follow tests/verify/07-identity-factory.md` | human PASS observations  | Wave-Execution-INIT-GATEFLOW-017-W1.md § TASK-W1-05 | gateflow-ops | `docs/specification/product/INIT-GATEFLOW-017-gateflow-ops.md` | `tests/verify/07-identity-factory.md` | testing-verify-flows                                                          | —                       | `feature/INIT-GATEFLOW-017-w1-identity-factory` |

#### Files (W1)

| ID         | Path                                                                     | Action |
| ---------- | ------------------------------------------------------------------------ | ------ |
| FILE-W1-01 | `app/api/gateflow/identities/route.ts`                                   | create |
| FILE-W1-02 | `app/api/gateflow/identities/by-id/route.ts`                             | create |
| FILE-W1-03 | `lib/constants.ts`                                                       | modify |
| FILE-W1-04 | `components/identities/identity-list.tsx`                                | create |
| FILE-W1-05 | `components/identities/identity-detail.tsx`                              | create |
| FILE-W1-06 | `app/(dashboard)/identities/page.tsx`                                    | create |
| FILE-W1-07 | `hooks/use-identities.ts`                                                | create |
| FILE-W1-08 | `data/locales/en/identities.json`                                        | create |
| FILE-W1-09 | `lib/workspace-nav.ts`                                                   | modify |
| FILE-W1-10 | `tests/unit/identities-bff.test.ts`                                      | create |
| FILE-W1-11 | `tests/verify/07-identity-factory.md`                                    | create |
| FILE-W1-12 | `docs/specification/as-built/Implementation-Status-INIT-GATEFLOW-017.md` | modify |
| FILE-W1-13 | `docs/specification/as-built/implementation-status.md`                   | modify |

#### Tests (W1)

| ID        | Layer        | Command                                           | Proves                                                                                 |
| --------- | ------------ | ------------------------------------------------- | -------------------------------------------------------------------------------------- |
| TEST-W1-U | unit         | `make test`                                       | REQ-02, REQ-03, REQ-25, REQ-29, REQ-30                                                 |
| TEST-W1-L | live (smoke) | `tests/verify/07-identity-factory.md` (human-run) | REQ-01, REQ-02, REQ-04, REQ-05, REQ-12, REQ-13, REQ-14, REQ-22, REQ-25, REQ-29, REQ-30 |

#### Verification Coverage (W1)

| REQ / criterion         | unit      | integration/contract | smoke     | sandbox | Notes              |
| ----------------------- | --------- | -------------------- | --------- | ------- | ------------------ |
| REQ-01                  | TEST-W1-U | N/A                  | TEST-W1-L | N/A     |                    |
| REQ-02                  | TEST-W1-U | N/A                  | TEST-W1-L | N/A     |                    |
| REQ-03 / entry          | TEST-W1-U | N/A                  | TEST-W1-L | N/A     | Sign-in half in W0 |
| REQ-04                  | TEST-W1-U | N/A                  | TEST-W1-L | N/A     |                    |
| REQ-05                  | TEST-W1-U | N/A                  | TEST-W1-L | N/A     |                    |
| REQ-12 / suspend        | TEST-W1-U | N/A                  | TEST-W1-L | N/A     |                    |
| REQ-13                  | TEST-W1-U | N/A                  | TEST-W1-L | N/A     |                    |
| REQ-14 / password-set   | TEST-W1-U | N/A                  | TEST-W1-L | N/A     |                    |
| REQ-22 / factory refuse | TEST-W1-U | N/A                  | TEST-W1-L | N/A     | Nav hide is W3     |
| REQ-25                  | TEST-W1-U | N/A                  | TEST-W1-L | N/A     |                    |
| REQ-29                  | TEST-W1-U | N/A                  | TEST-W1-L | N/A     |                    |
| REQ-30 / identity DTO   | TEST-W1-U | N/A                  | TEST-W1-L | N/A     | Grant views in W2  |

#### Live-verification intent (W1)

| Field                 | Value                                                                                      |
| --------------------- | ------------------------------------------------------------------------------------------ |
| Applicable            | yes — new identities HTTP + pages                                                          |
| Environment class     | local-compose                                                                              |
| Mode                  | smoke                                                                                      |
| Runtime head binding  | Bound at `wave-acceptance`                                                                 |
| Prerequisites         | gateflow CTR-01 live; `platform_admin` + `tenant_admin` lab logins; W0 merged              |
| Safe test data        | synthetic email under lab domain; no prod identities                                       |
| Steps / command       | `tests/verify/07-identity-factory.md`                                                      |
| Expected observations | create/list/search/suspend/unsuspend/password-set; named refuses; tenant_admin wrong actor |
| Expected evidence     | `wave-accepted on tip`                                                                     |
| Cleanup               | suspend or leave synthetic identity unused                                                 |
| Stop conditions       | Provider 5xx or create+bind still required for membership → stop (kill line)               |

---

### Phase W2 — Grants and purge invite/attach

**GOAL-W2:** Grant/detach/membership BFF+UI. Invite and CAP-P attach modules
gone. Depends on gateflow CTR-02 live and W1 identities.

**P15 overlap check:** `--req REQ-06` / `--req REQ-20`. `02` and `03-platform-programme-onboard.md` declare **016** REQ-01–08 / REQ-32–37 (invite + attach). **New FILE** `tests/verify/08-grants-membership.md` for 017 grants. **Modify** `02` and `03` to strip invite/attach steps (016 supersede), not to host 017 grant coverage.

| Task       | Description                                                | Implements                                                                                     | Depends on                         | Files (path/action)                                                                                                                                                                                                                                                                                       | Exit criteria                                                                                                         | Proof (kind / command\|review)                          | Expected                 | Evidence expected                                   | Codebase     | Spec path                                                      | Verify command                         | MDC notes                                           | ADR notes | Branch                                      |
| ---------- | ---------------------------------------------------------- | ---------------------------------------------------------------------------------------------- | ---------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------- | ------------------------ | --------------------------------------------------- | ------------ | -------------------------------------------------------------- | -------------------------------------- | --------------------------------------------------- | --------- | ------------------------------------------- |
| TASK-W2-01 | Grant/detach BFF                                           | REQ-06, REQ-07, REQ-08, REQ-09, REQ-10, REQ-24, REQ-28, REQ-30                                 | —                                  | `app/api/gateflow/grants/route.ts` create                                                                                                                                                                                                                                                                 | No password on grant body; idempotent second grant; unknown identity/programme / seeded platform_admin → named refuse | command / `make check && make test`                     | exit 0; assertions green | Wave-Execution-INIT-GATEFLOW-017-W2.md § TASK-W2-01 | gateflow-ops | `docs/specification/product/INIT-GATEFLOW-017-gateflow-ops.md` | `make check && make test`              | nextjs-repository-layout; nextjs-bff-route-handlers | —         | `feature/INIT-GATEFLOW-017-w2-grants-purge` |
| TASK-W2-02 | Membership chrome (no delivery)                            | REQ-11, REQ-30                                                                                 | TASK-W2-01                         | `components/grants/membership-panel.tsx` create; `hooks/use-grants.ts` create; `data/locales/en/grants.json` create; `components/programmes/programme-detail.tsx` modify; `lib/workspace-nav.ts` modify                                                                                                   | Identities ↔ programmes visible; password fields absent in JSON and UI                                                | command / `make check && make test`                     | exit 0; assertions green | Wave-Execution-INIT-GATEFLOW-017-W2.md § TASK-W2-02 | gateflow-ops | `docs/specification/product/INIT-GATEFLOW-017-gateflow-ops.md` | `make check && make test`              | no-hardcoded-strings; workspace-page-layout         | ADR-001   | `feature/INIT-GATEFLOW-017-w2-grants-purge` |
| TASK-W2-03 | Delete invite + attach modules                             | REQ-20, REQ-21                                                                                 | —                                  | `app/api/gateflow/tenants/users/route.ts` delete; `lib/programme-attach.ts` delete; `components/tenant/tenant-detail.tsx` modify                                                                                                                                                                          | Invite/attach Route Handlers absent; leftover client hits 404; no password collect on programme detail                | command / `make check && make test`                     | exit 0; assertions green | Wave-Execution-INIT-GATEFLOW-017-W2.md § TASK-W2-03 | gateflow-ops | `docs/specification/product/INIT-GATEFLOW-017-gateflow-ops.md` | `make check && make test`              | nextjs-repository-layout                            | —         | `feature/INIT-GATEFLOW-017-w2-grants-purge` |
| TASK-W2-04 | Unit: grant idempotency + password strip + unknown refuses | REQ-07, REQ-08, REQ-28, REQ-30                                                                 | TASK-W2-01                         | `tests/unit/grants-bff.test.ts` create                                                                                                                                                                                                                                                                    | Second grant no-op; DTO has no password; unknown identity/programme refuse                                            | command / `make test`                                   | exit 0; assertions green | Wave-Execution-INIT-GATEFLOW-017-W2.md § TASK-W2-04 | gateflow-ops | `docs/specification/product/INIT-GATEFLOW-017-gateflow-ops.md` | `make check && make test`              | testing-verify-flows                                | —         | `feature/INIT-GATEFLOW-017-w2-grants-purge` |
| TASK-W2-05 | Live verify grants + trim 016 invite/attach + as-built     | REQ-06, REQ-07, REQ-08, REQ-09, REQ-10, REQ-11, REQ-15, REQ-20, REQ-21, REQ-24, REQ-28, REQ-30 | TASK-W2-02, TASK-W2-03, TASK-W2-04 | `tests/verify/08-grants-membership.md` create; `tests/verify/02-w0-identity-onboarding.md` modify; `tests/verify/03-platform-programme-onboard.md` modify; `docs/specification/as-built/Implementation-Status-INIT-GATEFLOW-017.md` modify; `docs/specification/as-built/implementation-status.md` modify | Grant/detach/membership smoke; invite/attach steps gone from 016 scripts; in-flight wave continues after detach       | command / `Follow tests/verify/08-grants-membership.md` | human PASS observations  | Wave-Execution-INIT-GATEFLOW-017-W2.md § TASK-W2-05 | gateflow-ops | `docs/specification/product/INIT-GATEFLOW-017-gateflow-ops.md` | `tests/verify/08-grants-membership.md` | testing-verify-flows                                | —         | `feature/INIT-GATEFLOW-017-w2-grants-purge` |

#### Files (W2)

| ID         | Path                                                                     | Action |
| ---------- | ------------------------------------------------------------------------ | ------ |
| FILE-W2-01 | `app/api/gateflow/grants/route.ts`                                       | create |
| FILE-W2-02 | `components/grants/membership-panel.tsx`                                 | create |
| FILE-W2-03 | `hooks/use-grants.ts`                                                    | create |
| FILE-W2-04 | `data/locales/en/grants.json`                                            | create |
| FILE-W2-05 | `components/programmes/programme-detail.tsx`                             | modify |
| FILE-W2-06 | `lib/workspace-nav.ts`                                                   | modify |
| FILE-W2-07 | `app/api/gateflow/tenants/users/route.ts`                                | delete |
| FILE-W2-08 | `lib/programme-attach.ts`                                                | delete |
| FILE-W2-09 | `components/tenant/tenant-detail.tsx`                                    | modify |
| FILE-W2-10 | `tests/unit/grants-bff.test.ts`                                          | create |
| FILE-W2-11 | `tests/verify/08-grants-membership.md`                                   | create |
| FILE-W2-12 | `tests/verify/02-w0-identity-onboarding.md`                              | modify |
| FILE-W2-13 | `tests/verify/03-platform-programme-onboard.md`                          | modify |
| FILE-W2-14 | `docs/specification/as-built/Implementation-Status-INIT-GATEFLOW-017.md` | modify |
| FILE-W2-15 | `docs/specification/as-built/implementation-status.md`                   | modify |

#### Tests (W2)

| ID        | Layer        | Command                                            | Proves                                                    |
| --------- | ------------ | -------------------------------------------------- | --------------------------------------------------------- |
| TEST-W2-U | unit         | `make test`                                        | REQ-07, REQ-08, REQ-28, REQ-30                            |
| TEST-W2-L | live (smoke) | `tests/verify/08-grants-membership.md` (human-run) | REQ-06–11, REQ-15, REQ-20, REQ-21, REQ-24, REQ-28, REQ-30 |

#### Verification Coverage (W2)

| REQ / criterion    | unit          | integration/contract | smoke     | sandbox | Notes              |
| ------------------ | ------------- | -------------------- | --------- | ------- | ------------------ |
| REQ-06             | TEST-W2-U     | N/A                  | TEST-W2-L | N/A     |                    |
| REQ-07             | TEST-W2-U     | N/A                  | TEST-W2-L | N/A     |                    |
| REQ-08             | TEST-W2-U     | N/A                  | TEST-W2-L | N/A     |                    |
| REQ-09             | TEST-W2-U     | N/A                  | TEST-W2-L | N/A     |                    |
| REQ-10             | TEST-W2-U     | N/A                  | TEST-W2-L | N/A     |                    |
| REQ-11             | TEST-W2-U     | N/A                  | TEST-W2-L | N/A     |                    |
| REQ-15             | TEST-W2-U     | N/A                  | TEST-W2-L | N/A     |                    |
| REQ-20             | N/A — absence | N/A                  | TEST-W2-L | N/A     | deleted routes 404 |
| REQ-21             | N/A — absence | N/A                  | TEST-W2-L | N/A     | attach module gone |
| REQ-24             | TEST-W2-U     | N/A                  | TEST-W2-L | N/A     |                    |
| REQ-28             | TEST-W2-U     | N/A                  | TEST-W2-L | N/A     |                    |
| REQ-30 / grant DTO | TEST-W2-U     | N/A                  | TEST-W2-L | N/A     |                    |

#### Live-verification intent (W2)

| Field                 | Value                                                                                |
| --------------------- | ------------------------------------------------------------------------------------ |
| Applicable            | yes — new grants HTTP; invite/attach removed                                         |
| Environment class     | local-compose                                                                        |
| Mode                  | smoke                                                                                |
| Runtime head binding  | Bound at `wave-acceptance`                                                           |
| Prerequisites         | gateflow CTR-02 live; W1 identity exists; onboarded programme; kill line clear       |
| Safe test data        | W1 synthetic identity; existing lab programme                                        |
| Steps / command       | `tests/verify/08-grants-membership.md`                                               |
| Expected observations | grant/detach/idempotent/unknown refuses; invite/attach 404; in-flight wave continues |
| Expected evidence     | `wave-accepted on tip`                                                               |
| Cleanup               | detach synthetic grant                                                               |
| Stop conditions       | Provider still 014-binds login → stop (A-5)                                          |

---

### Phase W3 — Programme enter and delivery rebind

**GOAL-W3:** Enter/leave BFF sets the context cookie. Delivery Route Handlers
and RSC pages use the helper only (ADR-002 migration change set). Granted
`tenant_admin` keeps 016 delivery minus invite. Zero-grant empty state.
`platform_admin` onboard/catalogue unchanged.

**P15 overlap check:** `--req REQ-16` / `--capability CAP-04`. Hit `04-w2-initiative-tracking.md` covers **016** REQ-13–21 (initiative readouts), not 017 programme enter. **New FILE** `tests/verify/09-programme-enter-delivery.md` warranted. Modify 016 verify `02`–`06` only to read helper tenant ids (not to host 017 enter coverage).

| Task       | Description                                  | Implements                                                     | Depends on                         | Files (path/action)                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                | Exit criteria                                                                                                                                              | Proof (kind / command\|review)                                 | Expected                 | Evidence expected                                   | Codebase     | Spec path                                                      | Verify command                                | MDC notes                                        | ADR notes        | Branch                                         |
| ---------- | -------------------------------------------- | -------------------------------------------------------------- | ---------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------- | ------------------------ | --------------------------------------------------- | ------------ | -------------------------------------------------------------- | --------------------------------------------- | ------------------------------------------------ | ---------------- | ---------------------------------------------- |
| TASK-W3-01 | Enter/leave BFF (`/api/auth/programme`)      | REQ-16, REQ-17, REQ-18                                         | —                                  | `app/api/auth/programme/route.ts` create                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           | Sets/clears context cookie; no password; no token in JSON; not-granted → named refuse                                                                      | command / `make check && make test`                            | exit 0; assertions green | Wave-Execution-INIT-GATEFLOW-017-W3.md § TASK-W3-01 | gateflow-ops | `docs/specification/product/INIT-GATEFLOW-017-gateflow-ops.md` | `make check && make test`                     | nextjs-bff-server-auth; nextjs-repository-layout | ADR-002          | `feature/INIT-GATEFLOW-017-w3-programme-enter` |
| TASK-W3-02 | Delivery BFF/pages use helper only           | REQ-16, REQ-19, REQ-23                                         | TASK-W3-01                         | `app/api/gateflow/programme/route.ts` modify; `app/api/gateflow/runs/route.ts` modify; `app/api/gateflow/runs/by-id/route.ts` modify; `app/api/gateflow/runs/forge/route.ts` modify; `app/api/gateflow/waves/route.ts` modify; `app/api/gateflow/initiatives/route.ts` modify; `app/api/gateflow/initiatives/by-id/route.ts` modify; `app/api/gateflow/metrics/route.ts` modify; `app/api/gateflow/checkpoints/route.ts` modify; `app/api/gateflow/board/route.ts` modify; `app/api/gateflow/tenants/route.ts` modify; `app/(dashboard)/fleet/page.tsx` modify; `app/(dashboard)/runs/page.tsx` modify; `app/(dashboard)/initiatives/page.tsx` modify; `app/(dashboard)/metrics/page.tsx` modify; `app/(dashboard)/checkpoints/page.tsx` modify; `app/(dashboard)/board/page.tsx` modify; `app/(dashboard)/tenant/page.tsx` modify | No delivery handler reads JWT `tenant_id` as entered scope; helper `null` → 400/403 i18n, not a fabricated tenant; `platform_admin` delivery still refused | command / `make check && make test`                            | exit 0; assertions green | Wave-Execution-INIT-GATEFLOW-017-W3.md § TASK-W3-02 | gateflow-ops | `docs/specification/product/INIT-GATEFLOW-017-gateflow-ops.md` | `make check && make test`                     | nextjs-bff-server-auth                           | ADR-002          | `feature/INIT-GATEFLOW-017-w3-programme-enter` |
| TASK-W3-03 | Enter UI, empty state, role nav              | REQ-16, REQ-18, REQ-22, REQ-26, REQ-27                         | TASK-W3-01                         | `components/programmes/programme-enter.tsx` create; `app/(dashboard)/programmes/enter/page.tsx` create; `data/locales/en/programmes.json` modify; `lib/workspace-nav.ts` modify                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    | `tenant_admin` sees granted-programme enter + empty state; no factory list; `platform_admin` onboard/catalogue still reachable                             | command / `make check && make test`                            | exit 0; assertions green | Wave-Execution-INIT-GATEFLOW-017-W3.md § TASK-W3-03 | gateflow-ops | `docs/specification/product/INIT-GATEFLOW-017-gateflow-ops.md` | `make check && make test`                     | no-hardcoded-strings; workspace-page-layout      | ADR-001; ADR-002 | `feature/INIT-GATEFLOW-017-w3-programme-enter` |
| TASK-W3-04 | Unit: enter refuse + helper wiring           | REQ-16, REQ-18                                                 | TASK-W3-01, TASK-W3-02             | `tests/unit/programme-enter.test.ts` create                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        | Not-granted / missing context map to named i18n; no JWT `tenant_id` fallback                                                                               | command / `make test`                                          | exit 0; assertions green | Wave-Execution-INIT-GATEFLOW-017-W3.md § TASK-W3-04 | gateflow-ops | `docs/specification/product/INIT-GATEFLOW-017-gateflow-ops.md` | `make check && make test`                     | testing-verify-flows                             | ADR-002          | `feature/INIT-GATEFLOW-017-w3-programme-enter` |
| TASK-W3-05 | Live enter + two-programme switch + as-built | REQ-16, REQ-17, REQ-18, REQ-19, REQ-22, REQ-23, REQ-26, REQ-27 | TASK-W3-02, TASK-W3-03, TASK-W3-04 | `tests/verify/09-programme-enter-delivery.md` create; `docs/specification/as-built/Implementation-Status-INIT-GATEFLOW-017.md` modify; `docs/specification/as-built/implementation-status.md` modify                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               | Enter P1 then P2; zero-grant empty; 016 delivery acts succeed after enter; invite control absent; marker lists W3 live REQs                                | command / `Follow tests/verify/09-programme-enter-delivery.md` | human PASS observations  | Wave-Execution-INIT-GATEFLOW-017-W3.md § TASK-W3-05 | gateflow-ops | `docs/specification/product/INIT-GATEFLOW-017-gateflow-ops.md` | `tests/verify/09-programme-enter-delivery.md` | testing-verify-flows                             | ADR-002          | `feature/INIT-GATEFLOW-017-w3-programme-enter` |

#### Files (W3)

| ID         | Path                                                                     | Action |
| ---------- | ------------------------------------------------------------------------ | ------ |
| FILE-W3-01 | `app/api/auth/programme/route.ts`                                        | create |
| FILE-W3-02 | `app/api/gateflow/programme/route.ts`                                    | modify |
| FILE-W3-03 | `app/api/gateflow/runs/route.ts`                                         | modify |
| FILE-W3-04 | `app/api/gateflow/runs/by-id/route.ts`                                   | modify |
| FILE-W3-05 | `app/api/gateflow/runs/forge/route.ts`                                   | modify |
| FILE-W3-06 | `app/api/gateflow/waves/route.ts`                                        | modify |
| FILE-W3-07 | `app/api/gateflow/initiatives/route.ts`                                  | modify |
| FILE-W3-08 | `app/api/gateflow/initiatives/by-id/route.ts`                            | modify |
| FILE-W3-09 | `app/api/gateflow/metrics/route.ts`                                      | modify |
| FILE-W3-10 | `app/api/gateflow/checkpoints/route.ts`                                  | modify |
| FILE-W3-11 | `app/api/gateflow/board/route.ts`                                        | modify |
| FILE-W3-12 | `app/api/gateflow/tenants/route.ts`                                      | modify |
| FILE-W3-13 | `app/(dashboard)/fleet/page.tsx`                                         | modify |
| FILE-W3-14 | `app/(dashboard)/runs/page.tsx`                                          | modify |
| FILE-W3-15 | `app/(dashboard)/initiatives/page.tsx`                                   | modify |
| FILE-W3-16 | `app/(dashboard)/metrics/page.tsx`                                       | modify |
| FILE-W3-17 | `app/(dashboard)/checkpoints/page.tsx`                                   | modify |
| FILE-W3-18 | `app/(dashboard)/board/page.tsx`                                         | modify |
| FILE-W3-19 | `app/(dashboard)/tenant/page.tsx`                                        | modify |
| FILE-W3-20 | `components/programmes/programme-enter.tsx`                              | create |
| FILE-W3-21 | `app/(dashboard)/programmes/enter/page.tsx`                              | create |
| FILE-W3-22 | `data/locales/en/programmes.json`                                        | modify |
| FILE-W3-23 | `lib/workspace-nav.ts`                                                   | modify |
| FILE-W3-24 | `tests/unit/programme-enter.test.ts`                                     | create |
| FILE-W3-25 | `tests/verify/09-programme-enter-delivery.md`                            | create |
| FILE-W3-26 | `docs/specification/as-built/Implementation-Status-INIT-GATEFLOW-017.md` | modify |
| FILE-W3-27 | `docs/specification/as-built/implementation-status.md`                   | modify |

#### Tests (W3)

| ID        | Layer        | Command                                                   | Proves                                                         |
| --------- | ------------ | --------------------------------------------------------- | -------------------------------------------------------------- |
| TEST-W3-U | unit         | `make test`                                               | REQ-16, REQ-18 helper/enter mapping                            |
| TEST-W3-L | live (smoke) | `tests/verify/09-programme-enter-delivery.md` (human-run) | REQ-16, REQ-17, REQ-18, REQ-19, REQ-22, REQ-23, REQ-26, REQ-27 |

#### Verification Coverage (W3)

| REQ / criterion      | unit      | integration/contract | smoke     | sandbox | Notes      |
| -------------------- | --------- | -------------------- | --------- | ------- | ---------- |
| REQ-16               | TEST-W3-U | N/A                  | TEST-W3-L | N/A     |            |
| REQ-17               | TEST-W3-U | N/A                  | TEST-W3-L | N/A     |            |
| REQ-18 / empty state | TEST-W3-U | N/A                  | TEST-W3-L | N/A     |            |
| REQ-19               | TEST-W3-U | N/A                  | TEST-W3-L | N/A     |            |
| REQ-22 / nav         | TEST-W3-U | N/A                  | TEST-W3-L | N/A     |            |
| REQ-23               | TEST-W3-U | N/A                  | TEST-W3-L | N/A     |            |
| REQ-26               | TEST-W3-U | N/A                  | TEST-W3-L | N/A     |            |
| REQ-27               | TEST-W3-U | N/A                  | TEST-W3-L | N/A     | keep CAP-P |

#### Live-verification intent (W3)

| Field                 | Value                                                                                                            |
| --------------------- | ---------------------------------------------------------------------------------------------------------------- |
| Applicable            | yes — enter HTTP + delivery rebind                                                                               |
| Environment class     | local-compose                                                                                                    |
| Mode                  | smoke                                                                                                            |
| Runtime head binding  | Bound at `wave-acceptance`                                                                                       |
| Prerequisites         | gateflow CTR-04 live; W2 grants on two programmes; W0 helper present                                             |
| Safe test data        | W1/W2 synthetic identity with two grants; no prod mutation                                                       |
| Steps / command       | `tests/verify/09-programme-enter-delivery.md`                                                                    |
| Expected observations | enter P1 delivery works; switch P2; zero-grant empty; platform_admin delivery refused; CAP-P onboard still works |
| Expected evidence     | `wave-accepted on tip`                                                                                           |
| Cleanup               | leave programme (clear context cookie); sign out                                                                 |
| Stop conditions       | Delivery still uses JWT `tenant_id` or provider rejects identity Bearer → stop                                   |

---

## 3. Dependencies (DEP)

| ID     | Dependency                                        | Blocks                                                                   |
| ------ | ------------------------------------------------- | ------------------------------------------------------------------------ |
| DEP-01 | gateflow CTR-01 identity HTTP live                | W1 live verify / wave-acceptance                                         |
| DEP-02 | gateflow CTR-02 grant HTTP live                   | W2 live verify / wave-acceptance                                         |
| DEP-03 | gateflow CTR-04 enter HTTP live                   | W3 live verify / wave-acceptance                                         |
| DEP-04 | A-5 kill line: provider no longer 014-binds login | W1/W2 screen merge                                                       |
| DEP-05 | W0 merged                                         | W1, W2, W3 code that imports helper                                      |
| DEP-06 | W1 identity exists                                | W2 grant of that identity                                                |
| DEP-07 | W2 grants exist                                   | W3 two-programme enter (REQ-17)                                          |
| DEP-08 | D-1 leftover bind rows (gateflow)                 | dual-model confusion if attach UI remains — W2 purge is this repo’s half |

---

## 4. Risks (RISK)

| ID      | Risk                                                                    | Mitigation                                                                        |
| ------- | ----------------------------------------------------------------------- | --------------------------------------------------------------------------------- |
| RISK-01 | Provider enter+grant not live; screens ship on 1:1 bind                 | FF-04 default: sequential; W1/W2 wave-acceptance stop condition                   |
| RISK-02 | W0 helper unused until W3; delivery still JWT `tenant_id`               | Documented; W3 is the ADR-002 migration change set; do not half-migrate per route |
| RISK-03 | 016 verify markers collide with 017 REQ ids                             | New 07/08/09 files; do not reuse 016 `prayog:covers` rows                         |
| RISK-04 | App Router `[programmeId]` attach path cannot be listed in WorkManifest | Delete via `lib/programme-attach.ts` + observable 404; review tree                |
| RISK-05 | PM-1 016 invite stories stale in meta                                   | Non-blocking; 017 REQ-20 is console truth                                         |
| RISK-06 | D-1 leftover bind rows                                                  | Console must not expose attach (W2); wipe is gateflow                             |

---

## 5. Out of scope

- gateflow provider HTTP ownership (CTR-01–04 implementation)
- Leftover 014 bind-row wipe (D-1 / OQ-01)
- Delete-identity, change-email, self-serve password, SSO, extra programme roles
- `platform_admin` delivery acts
- Rewriting 016 delivery except invite purge and attach replacement
- Setting `spec-lgtm` or seeding the board (post-merge `/create-board-tickets`)

---

## 6. As-built and docs tasks

> Update these in the **same PR** as the code they describe.

| Task                                         | File                                                                     | Action                                                |
| -------------------------------------------- | ------------------------------------------------------------------------ | ----------------------------------------------------- |
| Create/update per-initiative as-built detail | `docs/specification/as-built/Implementation-Status-INIT-GATEFLOW-017.md` | Record this wave's capability/code/test/verify detail |
| Update as-built index row                    | `docs/specification/as-built/implementation-status.md`                   | Overwrite this capability's one row in place          |
| Ensure live-verify coverage marker           | co-shipped/extended `tests/verify/01`, `07`, `08`, `09`                  | Self-declare `prayog:covers: REQ-*` on the artifact   |

> **ADR lifecycle** — ADR-002 is already Accepted. Do not add promotion tasks.

---

## 7. Plan check summary

| Check                     | Status | Notes                                                |
| ------------------------- | ------ | ---------------------------------------------------- |
| P1 REQ inventory          | PASS   | REQ-01–30 in §1; each wave Implements those ids      |
| P2 TASK ↔ REQ             | PASS   | every TASK Implements ≥1 REQ; no `REQ-W*`            |
| P3 FILE paths             | PASS   | every TASK has exact paths or delete/inspect         |
| P4 exit evidence          | PASS   | criteria + proof + expected + evidence_expected      |
| P5 verification layers    | PASS   | unit + smoke per wave; integration N/A (BFF doubles) |
| P6 scope                  | PASS   | console/BFF only; provider out of scope              |
| P7 feas/ops               | PASS   | FF-04 deferred sequential; PM-1/D-1 in RISK          |
| P8 wave order             | PASS   | W0→W1→W2→W3; kill line on W1/W2                      |
| P9 as-built               | PASS   | detail + index row each wave                         |
| P10 self-contained        | PASS   | commands resolved; live prereqs stated               |
| P11 MDC                   | PASS   | notes on BFF layout, i18n, auth, pagination          |
| P12 ADR                   | PASS   | ADR-002 Accepted; cited on W0/W3                     |
| P13 TDD                   | PASS   | TDD Accepted; lint `--verify-lint-evidence` PASS     |
| P14 WorkManifest seed     | PASS   | §9 W0–W3 + tasks[]                                   |
| P15 co-ship live          | PASS   | overlap recorded; extend 01; new 07/08/09            |
| P16 WorkManifest contract | PASS   | `workmanifest_contract.py` PASS                      |

---

## 8. Forge / PR instructions

> Persist this plan locally and publish via `/commit-workspace` to the
> **Draft spec PR** branch. Do **not** commit inside this skill. Label remains
> **`spec-pending`** until PE completes §10.

```
Branch:   chore/INIT-GATEFLOW-017-spec-gateflow-ops
PR title: "[INIT-GATEFLOW-017] Spec — gateflow-ops"
PR body:  link meta PRD PR #42; paste §1 + wave goals

Required reviewers: @drivestream-lab/prayog-pe-team
Review deadline: 2026-08-19

PE checklist (before spec-lgtm):
  [ ] Spec + feasibility + TDD + Accepted ADRs + this plan on current head
  [ ] §0 PE sign-off on TDD marked complete
  [ ] Wave order and dependencies make sense
  [ ] Done-when / exit criteria are observable (P4)
  [ ] Verification Coverage maps every criterion (P5)
  [ ] WorkManifest YAML (§9) passes workmanifest-contract-pass (P16)
  [ ] P1–P16 checks all pass (including P15)

After spec-lgtm + Approve + merge — `/create-board-tickets` from §9 (post-merge only)
```

---

## 10. Coding-readiness unlock (PE — after plan on head)

| Item                 | Value                                                                                  |
| -------------------- | -------------------------------------------------------------------------------------- |
| Workflow outcome     | `pass` — P1–P16 intended PASS; sources CURRENT; ADR-002 Accepted                       |
| Verdict              | GATE OPEN REQUEST                                                                      |
| Spec PR              | https://github.com/drivestream-lab/gateflow-ops/pull/32                                |
| Spec PR head SHA     | `33a31a4a7c5eca19938f4c6b3f9adb83f1dbd4fb` (pre-plan tip; PE attests post-publish tip) |
| Gate label (current) | `spec-pending`                                                                         |
| Gate label (target)  | `spec-lgtm`                                                                            |
| Local plan path      | `docs/specification/reports/Implementation-Plan-INIT-GATEFLOW-017.md`                  |
| Forge readiness      | fill `handoff.forge` for `/commit-workspace`                                           |
| Blocking items       | none                                                                                   |
| plan_digest          | sha256:dc283629b58c5cfac822d511486b80230ea4abd1150129ef416b707ec4ba9f91                |

Provision labels when missing:

```bash
launchpad apply-gates --repo gateflow-ops --apply
```

PE actions (all on **exact current head**):

1. Remove `spec-pending`, `spec-blocked`, `spec-revised`, `spec-stale`; add **`spec-lgtm`**
2. Submit GitHub **Approve** with attestation body (below)
3. Mark Draft PR **Ready for review**
4. Authorize merge; then **`/create-board-tickets`** from §9

### Approve attestation body

```text
Spec package approved
initiative: INIT-GATEFLOW-017
spec_pr_head_sha: {SHA after plan publish}
meta_pr_head_sha: 601b00e0a74510a6af1c33bc80ca27260995c094
impact_map_revision: 1
prd_digest: sha256:c0fe55040928a13976133edde5cf71f0524815c17c0a8de79173ed3fa0657f67
scope_digest: sha256:13cee9aae41718fd4ad8655d77738042761b0e45db7eefc898a693c42c2fb987
plan_digest: sha256:dc283629b58c5cfac822d511486b80230ea4abd1150129ef416b707ec4ba9f91
artifacts:
  - docs/specification/product/INIT-GATEFLOW-017-gateflow-ops.md
  - docs/specification/reports/Initiative-Feasibility-Report-INIT-GATEFLOW-017.md
  - docs/specification/reports/Technical-Review-INIT-GATEFLOW-017.md
  - docs/specification/adr/adr-002-identity-session-vs-programme-context-cookie.md
  - docs/specification/reports/Implementation-Plan-INIT-GATEFLOW-017.md
```

---

## 9. WorkManifest seed

```yaml
# Generated by /spec-implementation-plan — 2026-08-14
apiVersion: prayog/v1
kind: WorkManifest

initiative: INIT-GATEFLOW-017

metadata:
  title: INIT-GATEFLOW-017 — One human, many programmes, one login
  summary: |
    Console/BFF for identity factory, grant/detach, programme enter, and
    016 delivery minus invite. ADR-002 identity cookie plus programme-context
    cookie. Kill line: no identity/grant screens while gateflow still 014-binds.
  playbook:
    - docs/specification/product/INIT-GATEFLOW-017-gateflow-ops.md
    - docs/specification/reports/Implementation-Plan-INIT-GATEFLOW-017.md

target:
  org: drivestream-lab
  project: "drivestream-lab Board"

defaults:
  initiative: INIT-GATEFLOW-017
  parent: EPIC
  labels:
    - INIT-GATEFLOW-017

epic:
  id: EPIC
  repo: gateflow-ops
  title: "[feature] INIT-GATEFLOW-017 — One human, many programmes, one login"
  codebase: gateflow-ops
  spec_path: docs/specification/product/INIT-GATEFLOW-017-gateflow-ops.md
  verify_command: tests/verify/09-programme-enter-delivery.md
  body: |
    ## Objective

    platform_admin enters identities and grants programme entry. tenant_admin
    signs in once, enters a granted programme, and keeps 016 delivery minus
    invite. Purge 016 invite and 014 create+bind attach.

    ## Waves

    | Wave | Goal |
    |------|------|
    | W0 | Programme-context chassis (ADR-002 helper + cookie + email-shape) |
    | W1 | Identity factory BFF/UI (CTR-01) |
    | W2 | Grants + purge invite/attach (CTR-02) |
    | W3 | Programme enter + delivery rebind (CTR-04, ADR-002 migration) |

    ## References

    - Spec: docs/specification/product/INIT-GATEFLOW-017-gateflow-ops.md
    - Plan: docs/specification/reports/Implementation-Plan-INIT-GATEFLOW-017.md
    - TDD: docs/specification/reports/Technical-Review-INIT-GATEFLOW-017.md

work:
  - id: W0
    kind: issue
    repo: gateflow-ops
    title: "[INIT-GATEFLOW-017 W0] Programme-context chassis"
    depends_on: []
    codebase: gateflow-ops
    spec_path: docs/specification/product/INIT-GATEFLOW-017-gateflow-ops.md
    verify_command: tests/verify/01-login-status-page.md
    tasks:
      - id: TASK-W0-01
        implements: [REQ-12, REQ-14, REQ-18]
        depends_on: []
        files:
          - path: lib/programme-context.ts
            action: create
          - path: lib/env.ts
            action: modify
          - path: app/api/auth/login/route.ts
            action: modify
          - path: app/api/auth/logout/route.ts
            action: modify
          - path: app/api/auth/me/route.ts
            action: modify
        exit:
          criteria:
            - "getEnteredProgrammeContext returns programmeId+tenantId or null and never reads JWT tenant_id; login and logout delete the context cookie; /api/auth/me JSON has no tokens"
          proof:
            kind: command
            command: "make check && make test"
            expected: "exit 0; assertions green"
            evidence_expected: "Wave-Execution-INIT-GATEFLOW-017-W0.md § TASK-W0-01"
      - id: TASK-W0-02
        implements: [REQ-03]
        depends_on: []
        files:
          - path: lib/auth-login-upstream.ts
            action: modify
        exit:
          criteria:
            - "Sign-in mapper refuses empty, no-at, and no-domain identifiers with a named i18n key and does not call upstream"
          proof:
            kind: command
            command: "make check && make test"
            expected: "exit 0; assertions green"
            evidence_expected: "Wave-Execution-INIT-GATEFLOW-017-W0.md § TASK-W0-02"
      - id: TASK-W0-03
        implements: [REQ-03, REQ-12, REQ-14, REQ-18]
        depends_on: [TASK-W0-01, TASK-W0-02]
        files:
          - path: tests/unit/programme-context.test.ts
            action: create
          - path: tests/unit/auth-login-upstream.test.ts
            action: modify
        exit:
          criteria:
            - "Unit suite asserts helper null/present/malformed with no network and email-shape refuses"
          proof:
            kind: command
            command: "make test"
            expected: "exit 0; assertions green"
            evidence_expected: "Wave-Execution-INIT-GATEFLOW-017-W0.md § TASK-W0-03"
      - id: TASK-W0-04
        implements: [REQ-03, REQ-12, REQ-14, REQ-18]
        depends_on: [TASK-W0-03]
        files:
          - path: tests/verify/01-login-status-page.md
            action: modify
          - path: docs/specification/as-built/Implementation-Status-INIT-GATEFLOW-017.md
            action: create
          - path: docs/specification/as-built/implementation-status.md
            action: modify
        exit:
          criteria:
            - "Human smoke records malformed-email refuse, logout clearing both cookies, and me JSON without tokens"
          proof:
            kind: command
            command: "Follow tests/verify/01-login-status-page.md"
            expected: "human PASS observations"
            evidence_expected: "wave-accepted on tip"
    verification:
      check: "make check"
      unit: "make test"
      live:
        applicable: true
        mode: smoke
        command: tests/verify/01-login-status-page.md
        covers: [REQ-03, REQ-12, REQ-14, REQ-18]
        prerequisites:
          - "npm run dev and .env UPSTREAM_BASE_URL set"
        safe_test_data:
          - "existing lab login; no new factory identity"
        steps:
          - "Follow tests/verify/01-login-status-page.md"
        expected_observations:
          - "malformed email refused; logout clears session and context cookies; me has no access_token"
        evidence_expected: "wave-accepted on tip"
        cleanup:
          - "sign out"
        stop_conditions:
          - "Unexpected 5xx or token leaked in me JSON → stop; do not start Pass-2"
    body: |
      ## Wave goal

      Programme-context chassis (ADR-002 helper + cookie + email-shape). No identity/grant screens.

      ## Tasks (from plan §2) — stable ids for loop-spec / board

      | Task | Implements | Depends on | Exit criteria | Proof |
      |------|------------|------------|---------------|-------|
      | TASK-W0-01 | REQ-12, REQ-14, REQ-18 | — | helper + cookie coupling | command/make check && make test |
      | TASK-W0-02 | REQ-03 | — | email-shape refuse | command/make check && make test |
      | TASK-W0-03 | REQ-03, REQ-12, REQ-14, REQ-18 | TASK-W0-01, TASK-W0-02 | unit green | command/make test |
      | TASK-W0-04 | REQ-03, REQ-12, REQ-14, REQ-18 | TASK-W0-03 | login smoke | command/tests/verify/01-login-status-page.md |

      ## Done when

      - [ ] All W0 tasks complete per plan exit proof

      ## Spec reference

      docs/specification/product/INIT-GATEFLOW-017-gateflow-ops.md

  - id: W1
    kind: issue
    repo: gateflow-ops
    title: "[INIT-GATEFLOW-017 W1] Identity factory"
    depends_on: [W0]
    codebase: gateflow-ops
    spec_path: docs/specification/product/INIT-GATEFLOW-017-gateflow-ops.md
    verify_command: tests/verify/07-identity-factory.md
    tasks:
      - id: TASK-W1-01
        implements: [REQ-01, REQ-02, REQ-03, REQ-04, REQ-05, REQ-25, REQ-29, REQ-30]
        depends_on: []
        files:
          - path: app/api/gateflow/identities/route.ts
            action: create
          - path: app/api/gateflow/identities/by-id/route.ts
            action: create
          - path: lib/constants.ts
            action: modify
        exit:
          criteria:
            - "Identity BFF requires platform_admin; list/create/search DTOs omit password; named i18n for duplicate email, not an email, missing name, missing password"
          proof:
            kind: command
            command: "make check && make test"
            expected: "exit 0; assertions green"
            evidence_expected: "Wave-Execution-INIT-GATEFLOW-017-W1.md § TASK-W1-01"
      - id: TASK-W1-02
        implements: [REQ-01, REQ-04, REQ-05, REQ-22]
        depends_on: [TASK-W1-01]
        files:
          - path: components/identities/identity-list.tsx
            action: create
          - path: app/(dashboard)/identities/page.tsx
            action: create
          - path: hooks/use-identities.ts
            action: create
          - path: data/locales/en/identities.json
            action: create
          - path: lib/workspace-nav.ts
            action: modify
        exit:
          criteria:
            - "platform_admin factory page renders via i18n; tenant_admin nav omits factory list"
          proof:
            kind: command
            command: "make check && make test"
            expected: "exit 0; assertions green"
            evidence_expected: "Wave-Execution-INIT-GATEFLOW-017-W1.md § TASK-W1-02"
      - id: TASK-W1-03
        implements: [REQ-12, REQ-13, REQ-14, REQ-22]
        depends_on: [TASK-W1-01]
        files:
          - path: app/api/gateflow/identities/by-id/route.ts
            action: modify
          - path: components/identities/identity-detail.tsx
            action: create
        exit:
          criteria:
            - "Suspend, unsuspend, and password-set return named i18n; password is write-only; tenant_admin receives wrong-actor"
          proof:
            kind: command
            command: "make check && make test"
            expected: "exit 0; assertions green"
            evidence_expected: "Wave-Execution-INIT-GATEFLOW-017-W1.md § TASK-W1-03"
      - id: TASK-W1-04
        implements: [REQ-02, REQ-03, REQ-25, REQ-29, REQ-30]
        depends_on: [TASK-W1-01]
        files:
          - path: tests/unit/identities-bff.test.ts
            action: create
        exit:
          criteria:
            - "Unit doubles assert named refuses and omitted password fields"
          proof:
            kind: command
            command: "make test"
            expected: "exit 0; assertions green"
            evidence_expected: "Wave-Execution-INIT-GATEFLOW-017-W1.md § TASK-W1-04"
      - id: TASK-W1-05
        implements:
          [REQ-01, REQ-02, REQ-04, REQ-05, REQ-12, REQ-13, REQ-14, REQ-22, REQ-25, REQ-29, REQ-30]
        depends_on: [TASK-W1-02, TASK-W1-03, TASK-W1-04]
        files:
          - path: tests/verify/07-identity-factory.md
            action: create
          - path: docs/specification/as-built/Implementation-Status-INIT-GATEFLOW-017.md
            action: modify
          - path: docs/specification/as-built/implementation-status.md
            action: modify
        exit:
          criteria:
            - "Human smoke against live CTR-01 records create/list/search/suspend/password-set and tenant_admin refuse"
          proof:
            kind: command
            command: "Follow tests/verify/07-identity-factory.md"
            expected: "human PASS observations"
            evidence_expected: "wave-accepted on tip"
    verification:
      check: "make check"
      unit: "make test"
      live:
        applicable: true
        mode: smoke
        command: tests/verify/07-identity-factory.md
        covers:
          [REQ-01, REQ-02, REQ-04, REQ-05, REQ-12, REQ-13, REQ-14, REQ-22, REQ-25, REQ-29, REQ-30]
        prerequisites:
          - "gateflow CTR-01 HTTP live"
          - "W0 merged; platform_admin and tenant_admin lab logins"
        safe_test_data:
          - "synthetic lab-domain email; no prod identities"
        steps:
          - "Follow tests/verify/07-identity-factory.md"
        expected_observations:
          - "factory create/list/search/suspend/unsuspend/password-set; named refuses; tenant_admin wrong actor"
        evidence_expected: "wave-accepted on tip"
        cleanup:
          - "leave synthetic identity unused or suspended"
        stop_conditions:
          - "Provider 5xx or membership still requires 014 create+bind → stop"
    body: |
      ## Wave goal

      Identity factory BFF/UI. No grant screens. Kill line: CTR-01 live first.

      ## Tasks (from plan §2) — stable ids for loop-spec / board

      | Task | Implements | Depends on | Exit criteria | Proof |
      |------|------------|------------|---------------|-------|
      | TASK-W1-01 | REQ-01, REQ-02, REQ-03, REQ-04, REQ-05, REQ-25, REQ-29, REQ-30 | — | identity BFF | command/make check && make test |
      | TASK-W1-02 | REQ-01, REQ-04, REQ-05, REQ-22 | TASK-W1-01 | factory UI | command/make check && make test |
      | TASK-W1-03 | REQ-12, REQ-13, REQ-14, REQ-22 | TASK-W1-01 | suspend/password | command/make check && make test |
      | TASK-W1-04 | REQ-02, REQ-03, REQ-25, REQ-29, REQ-30 | TASK-W1-01 | unit | command/make test |
      | TASK-W1-05 | REQ-01, REQ-02, REQ-04, REQ-05, REQ-12, REQ-13, REQ-14, REQ-22, REQ-25, REQ-29, REQ-30 | TASK-W1-02, TASK-W1-03, TASK-W1-04 | live 07 | command/tests/verify/07-identity-factory.md |

      ## Done when

      - [ ] All W1 tasks complete per plan exit proof

      ## Spec reference

      docs/specification/product/INIT-GATEFLOW-017-gateflow-ops.md

  - id: W2
    kind: issue
    repo: gateflow-ops
    title: "[INIT-GATEFLOW-017 W2] Grants and purge invite/attach"
    depends_on: [W1]
    codebase: gateflow-ops
    spec_path: docs/specification/product/INIT-GATEFLOW-017-gateflow-ops.md
    verify_command: tests/verify/08-grants-membership.md
    tasks:
      - id: TASK-W2-01
        implements: [REQ-06, REQ-07, REQ-08, REQ-09, REQ-10, REQ-24, REQ-28, REQ-30]
        depends_on: []
        files:
          - path: app/api/gateflow/grants/route.ts
            action: create
        exit:
          criteria:
            - "Grant BFF accepts identity+programme with no password; second grant is a no-op; unknown identity/programme and seeded platform_admin return named i18n"
          proof:
            kind: command
            command: "make check && make test"
            expected: "exit 0; assertions green"
            evidence_expected: "Wave-Execution-INIT-GATEFLOW-017-W2.md § TASK-W2-01"
      - id: TASK-W2-02
        implements: [REQ-11, REQ-30]
        depends_on: [TASK-W2-01]
        files:
          - path: components/grants/membership-panel.tsx
            action: create
          - path: hooks/use-grants.ts
            action: create
          - path: data/locales/en/grants.json
            action: create
          - path: components/programmes/programme-detail.tsx
            action: modify
          - path: lib/workspace-nav.ts
            action: modify
        exit:
          criteria:
            - "Membership panel shows identities and programmes without opening delivery; password fields absent"
          proof:
            kind: command
            command: "make check && make test"
            expected: "exit 0; assertions green"
            evidence_expected: "Wave-Execution-INIT-GATEFLOW-017-W2.md § TASK-W2-02"
      - id: TASK-W2-03
        implements: [REQ-20, REQ-21]
        depends_on: []
        files:
          - path: app/api/gateflow/tenants/users/route.ts
            action: delete
          - path: lib/programme-attach.ts
            action: delete
          - path: components/tenant/tenant-detail.tsx
            action: modify
        exit:
          criteria:
            - "Invite users route and programme-attach helper are absent from the tree; leftover client calls return 404"
          proof:
            kind: command
            command: "make check && make test"
            expected: "exit 0; assertions green"
            evidence_expected: "Wave-Execution-INIT-GATEFLOW-017-W2.md § TASK-W2-03"
      - id: TASK-W2-04
        implements: [REQ-07, REQ-08, REQ-28, REQ-30]
        depends_on: [TASK-W2-01]
        files:
          - path: tests/unit/grants-bff.test.ts
            action: create
        exit:
          criteria:
            - "Unit doubles assert idempotent grant, omitted password, and unknown identity/programme refuse"
          proof:
            kind: command
            command: "make test"
            expected: "exit 0; assertions green"
            evidence_expected: "Wave-Execution-INIT-GATEFLOW-017-W2.md § TASK-W2-04"
      - id: TASK-W2-05
        implements:
          [
            REQ-06,
            REQ-07,
            REQ-08,
            REQ-09,
            REQ-10,
            REQ-11,
            REQ-15,
            REQ-20,
            REQ-21,
            REQ-24,
            REQ-28,
            REQ-30,
          ]
        depends_on: [TASK-W2-02, TASK-W2-03, TASK-W2-04]
        files:
          - path: tests/verify/08-grants-membership.md
            action: create
          - path: tests/verify/02-w0-identity-onboarding.md
            action: modify
          - path: tests/verify/03-platform-programme-onboard.md
            action: modify
          - path: docs/specification/as-built/Implementation-Status-INIT-GATEFLOW-017.md
            action: modify
          - path: docs/specification/as-built/implementation-status.md
            action: modify
        exit:
          criteria:
            - "Human smoke records grant/detach/membership; 016 invite/attach steps are gone; in-flight wave continues after detach"
          proof:
            kind: command
            command: "Follow tests/verify/08-grants-membership.md"
            expected: "human PASS observations"
            evidence_expected: "wave-accepted on tip"
    verification:
      check: "make check"
      unit: "make test"
      live:
        applicable: true
        mode: smoke
        command: tests/verify/08-grants-membership.md
        covers:
          [
            REQ-06,
            REQ-07,
            REQ-08,
            REQ-09,
            REQ-10,
            REQ-11,
            REQ-15,
            REQ-20,
            REQ-21,
            REQ-24,
            REQ-28,
            REQ-30,
          ]
        prerequisites:
          - "gateflow CTR-02 HTTP live"
          - "W1 identity and an onboarded programme exist"
        safe_test_data:
          - "W1 synthetic identity; existing lab programme"
        steps:
          - "Follow tests/verify/08-grants-membership.md"
        expected_observations:
          - "grant/detach/idempotent/unknown refuses; invite/attach 404; in-flight wave continues"
        evidence_expected: "wave-accepted on tip"
        cleanup:
          - "detach synthetic grant"
        stop_conditions:
          - "Provider still 014-binds login → stop (A-5)"
    body: |
      ## Wave goal

      Grants + purge invite/attach. Kill line: CTR-02 live first.

      ## Tasks (from plan §2) — stable ids for loop-spec / board

      | Task | Implements | Depends on | Exit criteria | Proof |
      |------|------------|------------|---------------|-------|
      | TASK-W2-01 | REQ-06, REQ-07, REQ-08, REQ-09, REQ-10, REQ-24, REQ-28, REQ-30 | — | grant BFF | command/make check && make test |
      | TASK-W2-02 | REQ-11, REQ-30 | TASK-W2-01 | membership UI | command/make check && make test |
      | TASK-W2-03 | REQ-20, REQ-21 | — | purge invite/attach | command/make check && make test |
      | TASK-W2-04 | REQ-07, REQ-08, REQ-28, REQ-30 | TASK-W2-01 | unit | command/make test |
      | TASK-W2-05 | REQ-06–11, REQ-15, REQ-20, REQ-21, REQ-24, REQ-28, REQ-30 | TASK-W2-02, TASK-W2-03, TASK-W2-04 | live 08 | command/tests/verify/08-grants-membership.md |

      ## Done when

      - [ ] All W2 tasks complete per plan exit proof

      ## Spec reference

      docs/specification/product/INIT-GATEFLOW-017-gateflow-ops.md

  - id: W3
    kind: issue
    repo: gateflow-ops
    title: "[INIT-GATEFLOW-017 W3] Programme enter and delivery rebind"
    depends_on: [W2]
    codebase: gateflow-ops
    spec_path: docs/specification/product/INIT-GATEFLOW-017-gateflow-ops.md
    verify_command: tests/verify/09-programme-enter-delivery.md
    tasks:
      - id: TASK-W3-01
        implements: [REQ-16, REQ-17, REQ-18]
        depends_on: []
        files:
          - path: app/api/auth/programme/route.ts
            action: create
        exit:
          criteria:
            - "Enter/leave sets or clears the context cookie; response JSON has no access_token; not-granted returns named i18n"
          proof:
            kind: command
            command: "make check && make test"
            expected: "exit 0; assertions green"
            evidence_expected: "Wave-Execution-INIT-GATEFLOW-017-W3.md § TASK-W3-01"
      - id: TASK-W3-02
        implements: [REQ-16, REQ-19, REQ-23]
        depends_on: [TASK-W3-01]
        files:
          - path: app/api/gateflow/programme/route.ts
            action: modify
          - path: app/api/gateflow/runs/route.ts
            action: modify
          - path: app/api/gateflow/runs/by-id/route.ts
            action: modify
          - path: app/api/gateflow/runs/forge/route.ts
            action: modify
          - path: app/api/gateflow/waves/route.ts
            action: modify
          - path: app/api/gateflow/initiatives/route.ts
            action: modify
          - path: app/api/gateflow/initiatives/by-id/route.ts
            action: modify
          - path: app/api/gateflow/metrics/route.ts
            action: modify
          - path: app/api/gateflow/checkpoints/route.ts
            action: modify
          - path: app/api/gateflow/board/route.ts
            action: modify
          - path: app/api/gateflow/tenants/route.ts
            action: modify
          - path: app/(dashboard)/fleet/page.tsx
            action: modify
          - path: app/(dashboard)/runs/page.tsx
            action: modify
          - path: app/(dashboard)/initiatives/page.tsx
            action: modify
          - path: app/(dashboard)/metrics/page.tsx
            action: modify
          - path: app/(dashboard)/checkpoints/page.tsx
            action: modify
          - path: app/(dashboard)/board/page.tsx
            action: modify
          - path: app/(dashboard)/tenant/page.tsx
            action: modify
        exit:
          criteria:
            - "Delivery handlers and RSC pages read entered scope only from getEnteredProgrammeContext; helper null yields named 400/403; platform_admin delivery remains refused"
          proof:
            kind: command
            command: "make check && make test"
            expected: "exit 0; assertions green"
            evidence_expected: "Wave-Execution-INIT-GATEFLOW-017-W3.md § TASK-W3-02"
      - id: TASK-W3-03
        implements: [REQ-16, REQ-18, REQ-22, REQ-26, REQ-27]
        depends_on: [TASK-W3-01]
        files:
          - path: components/programmes/programme-enter.tsx
            action: create
          - path: app/(dashboard)/programmes/enter/page.tsx
            action: create
          - path: data/locales/en/programmes.json
            action: modify
          - path: lib/workspace-nav.ts
            action: modify
        exit:
          criteria:
            - "tenant_admin sees granted-programme enter and zero-grant empty state; factory list is hidden; platform_admin onboard/catalogue remains reachable"
          proof:
            kind: command
            command: "make check && make test"
            expected: "exit 0; assertions green"
            evidence_expected: "Wave-Execution-INIT-GATEFLOW-017-W3.md § TASK-W3-03"
      - id: TASK-W3-04
        implements: [REQ-16, REQ-18]
        depends_on: [TASK-W3-01, TASK-W3-02]
        files:
          - path: tests/unit/programme-enter.test.ts
            action: create
        exit:
          criteria:
            - "Unit doubles assert not-granted and missing-context map to named i18n with no JWT tenant_id fallback"
          proof:
            kind: command
            command: "make test"
            expected: "exit 0; assertions green"
            evidence_expected: "Wave-Execution-INIT-GATEFLOW-017-W3.md § TASK-W3-04"
      - id: TASK-W3-05
        implements: [REQ-16, REQ-17, REQ-18, REQ-19, REQ-22, REQ-23, REQ-26, REQ-27]
        depends_on: [TASK-W3-02, TASK-W3-03, TASK-W3-04]
        files:
          - path: tests/verify/09-programme-enter-delivery.md
            action: create
          - path: docs/specification/as-built/Implementation-Status-INIT-GATEFLOW-017.md
            action: modify
          - path: docs/specification/as-built/implementation-status.md
            action: modify
        exit:
          criteria:
            - "Human smoke records enter P1 then P2, zero-grant empty state, 016 delivery after enter, and absent invite control"
          proof:
            kind: command
            command: "Follow tests/verify/09-programme-enter-delivery.md"
            expected: "human PASS observations"
            evidence_expected: "wave-accepted on tip"
    verification:
      check: "make check"
      unit: "make test"
      live:
        applicable: true
        mode: smoke
        command: tests/verify/09-programme-enter-delivery.md
        covers: [REQ-16, REQ-17, REQ-18, REQ-19, REQ-22, REQ-23, REQ-26, REQ-27]
        prerequisites:
          - "gateflow CTR-04 HTTP live"
          - "W0 helper present; W2 grants on two programmes"
        safe_test_data:
          - "W1/W2 synthetic identity with two grants"
        steps:
          - "Follow tests/verify/09-programme-enter-delivery.md"
        expected_observations:
          - "enter P1 delivery works; switch P2; zero-grant empty; platform_admin delivery refused; CAP-P onboard still works"
        evidence_expected: "wave-accepted on tip"
        cleanup:
          - "leave programme; sign out"
        stop_conditions:
          - "Delivery still reads JWT tenant_id or provider rejects identity Bearer → stop"
    body: |
      ## Wave goal

      Programme enter + delivery rebind (ADR-002 migration change set).

      ## Tasks (from plan §2) — stable ids for loop-spec / board

      | Task | Implements | Depends on | Exit criteria | Proof |
      |------|------------|------------|---------------|-------|
      | TASK-W3-01 | REQ-16, REQ-17, REQ-18 | — | enter BFF | command/make check && make test |
      | TASK-W3-02 | REQ-16, REQ-19, REQ-23 | TASK-W3-01 | delivery helper | command/make check && make test |
      | TASK-W3-03 | REQ-16, REQ-18, REQ-22, REQ-26, REQ-27 | TASK-W3-01 | enter UI | command/make check && make test |
      | TASK-W3-04 | REQ-16, REQ-18 | TASK-W3-01, TASK-W3-02 | unit | command/make test |
      | TASK-W3-05 | REQ-16, REQ-17, REQ-18, REQ-19, REQ-22, REQ-23, REQ-26, REQ-27 | TASK-W3-02, TASK-W3-03, TASK-W3-04 | live 09 | command/tests/verify/09-programme-enter-delivery.md |

      ## Done when

      - [ ] All W3 tasks complete per plan exit proof

      ## Spec reference

      docs/specification/product/INIT-GATEFLOW-017-gateflow-ops.md
```

```yaml
handoff:
  contract: sdd-delivery/v2
  stage: spec-implementation-plan
  outcome: pass
  artifact:
    path: docs/specification/reports/Implementation-Plan-INIT-GATEFLOW-017.md
  blockers: []
  signals:
    ready_for_pe_review: true
    ready_for_plan: false
    plan_digest: sha256:dc283629b58c5cfac822d511486b80230ea4abd1150129ef416b707ec4ba9f91
    spec_pr: https://github.com/drivestream-lab/gateflow-ops/pull/32
  next_candidates:
    - coding-readiness
  human_checkpoint: true
  external_action: false
  forge:
    action: commit_workspace
    draft: true
    apply_labels:
      - spec-pending
    title: "[INIT-GATEFLOW-017] Spec — gateflow-ops"
    body_path: docs/specification/reports/Implementation-Plan-INIT-GATEFLOW-017.md
```
