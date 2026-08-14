# Feasibility report — INIT-GATEFLOW-017

| Field | Value |
|-------|-------|
| Initiative | INIT-GATEFLOW-017 |
| Spec | `docs/specification/product/INIT-GATEFLOW-017-gateflow-ops.md` |
| PRD digest | `sha256:c0fe55040928a13976133edde5cf71f0524815c17c0a8de79173ed3fa0657f67` |
| Impact map / revision | `prayog-meta/prd/reports/Impact-Map-INIT-GATEFLOW-017.md` / `1` |
| Repo scope digest | `sha256:13cee9aae41718fd4ad8655d77738042761b0e45db7eefc898a693c42c2fb987` |
| Approved meta PR head | `601b00e0a74510a6af1c33bc80ca27260995c094` |
| Impact-map approval | [PRR](https://github.com/drivestream-lab/prayog-meta/pull/42#pullrequestreview-4927360675) `@0xbeefdead` `2026-08-13T13:04:05Z` |
| Source freshness | CURRENT — meta PR #42 merged; head `601b00e0…` = review `commit_id`; H1 recomputed match; H2/H3 match spec header; label `impact-map-lgtm`; repo still `affected` |
| Repo | gateflow-ops |
| Date | 2026-08-13 |
| Branch | `chore/INIT-GATEFLOW-017-spec-gateflow-ops` — Draft spec PR [#32](https://github.com/drivestream-lab/gateflow-ops/pull/32) |
| Initiative segment | `INIT-GATEFLOW-017` |
| Status | Draft |
| Review deadline | 2026-08-18 |
| Deciders | PM: programme PM · Domain SME: @drivestream-lab/prayog-pe-team |

## Summary

Buildable on the live Mission Control chassis, but **not a greenfield add**.
016 delivery, CAP-P onboard/catalogue, httpOnly login, and role nav already
exist. The blocking engineering gap is **how the console holds “entered
programme” after one identity sign-in** — every delivery BFF/page today reads
`session.tenant_id` from the upstream JWT. Independent implementers could
remint a programme-bound JWT or keep an identity-scoped session plus a
separate authorization context. That is a **NEW-ADR** (FF-01). Invite UI and
CAP-P attach are **live and must be purged/replaced** (REQ-20/21). Kill line:
do not ship identity/grant screens while gateflow still creates membership via
014 create+bind.

Recommend `/spec-technical-review` to resolve FF-01 before plan. Gate 2 stays
`spec-pending`.

**Findings:** 7 total (0 Critical, 1 Should-fix, 3 Verify, 3 Gap)

### Derived counts (lane × severity)

| Lane | Blocking open | Non-blocking open | Resolved |
|------|---------------|-------------------|----------|
| PM | 0 | 1 | 0 |
| PE / ADR | 1 | 3 | 0 |
| Domain | 0 | 1 | 0 |
| Auto-fix | 0 | 2 | 0 |

| Severity | Unresolved count |
|----------|------------------|
| Critical | 0 |
| Should fix | 1 |
| Verify / Gap (informational) | 6 |

### Selected workflow outcome

| Field | Value |
|-------|-------|
| Outcome | `findings` |
| Rationale | Unresolved Should-fix PE/ADR item FF-01 (NEW-ADR: session vs programme-bound JWT) |
| Next (from workflow) | `spec-technical-review` |

Informational observations alone do **not** select `findings`. Unresolved
blocking PE/ADR → `findings`; blocking PM/domain → `needs-input`.

## ADR pass (before T2)

| ADR | Domain matched | Status |
|-----|----------------|--------|
| ADR-001 | UI primitives / tokens for new identity and grant screens | Accepted — aligned; no contradiction |
| 0000-template | n/a | skip |

No other Accepted ADRs. Session / entered-programme authorization is
**undocumented** → NEW-ADR (FF-01).

## MDC pass (before T2)

| MDC file | Domain | Read / skipped |
|----------|--------|----------------|
| `nextjs-bff-server-auth.mdc` | httpOnly session; no browser JWT | read |
| `nextjs-bff-route-handlers.mdc` | BFF errors, logging, strip secrets | read |
| `nextjs-repository-layout.mdc` | BFF by upstream service | read |
| `nextjs-app-router-stack.mdc` | TanStack Query; no browser upstream | read |
| `client-forms-patterns.mdc` | identity entry / grant / password forms | read |
| `no-hardcoded-strings.mdc` | new chrome copy | read |
| `workspace-page-layout.mdc` | identity + membership pages in shell | read |
| `shared-limits-pagination.mdc` | factory list skip/limit | read |
| `testing-verify-flows.mdc` | unit vs live; no-overlap | read |
| `typescript-react-style.mdc` | client leaf `"use client"` | read |
| `tailwind-design-tokens.mdc` | semantic tokens (ADR-001) | read |
| `spec-driven-development.mdc` | process | skipped — not a product-domain constraint |
| `documentation-project-guidance.mdc` | docs placement | skipped — report path already matches `reports_dir` |
| `code-guidelines-index.mdc` | index | skipped — covered by named files |

## Baseline snapshot (F1)

| Area | Current state | Evidence |
|------|---------------|----------|
| Unit tests | 13 files under `tests/unit/` including `auth`, `auth-login-upstream`, `platform-programmes`, onboarding/runs/metrics/board helpers | `tests/unit/*.ts`; `tests/README.md` |
| Live verify | 7 scripts: chassis login, W0 invite+fleet, CAP-P onboard+attach, W1–W4 delivery | `tests/verify/01`–`06` + `03-platform-programme-onboard.md` |
| As-built | 016 Mission Control live (W0–W4 human_approved; CAP-P implemented). No INIT-017 row | `docs/specification/as-built/implementation-status.md` |
| Auth / session | httpOnly cookie = upstream JWT; payload includes `tenant_id`; delivery pages/BFF require `session.tenant_id`; `authFetch` 401 → `/login` | `lib/auth.ts`, `lib/jwt.ts`, `app/api/auth/login/route.ts`, `lib/auth-fetch.ts` |
| Membership (live, to remove) | Tenant invite `POST …/tenants/users`; CAP-P attach credential+password `POST …/programmes/{id}/tenant-admins` | `app/api/gateflow/tenants/users/route.ts`; `components/tenant/tenant-detail.tsx`; `app/api/gateflow/programmes/[programmeId]/tenant-admins/route.ts`; `lib/programme-attach.ts` |
| Identity factory | **absent** | no `identities` BFF/UI under `app/` / `components/` |
| Programme onboard | CAP-P list/create/detail/catalogue-refresh live | `app/(dashboard)/programmes/**`; `app/api/gateflow/programmes/**` |
| Shell / nav | `WorkspaceShell`; role filter Status+Programmes vs Tenant/Fleet/Runs/… | `components/workspace/*`; `lib/workspace-nav.ts` |
| Primitives | shadcn + tokens | `components/ui/*`; ADR-001 Accepted |
| CI | lint, types, format:check, unit, production build — **on `main` only** | `.github/workflows/ci.yml`; Makefile `check`/`test`/`build` |
| Live verify in CI | not run | `testing-verify-flows.mdc`; no Makefile verify target |

## Traceability matrix

| Spec REQ / wave | Spec claim | Code evidence | Unit | Verify | Status |
|-----------------|------------|---------------|------|--------|--------|
| REQ-01, REQ-02, REQ-04, REQ-05, REQ-25, REQ-29 / CAP-01 | Enter/find factory identities; unique email; name+password required | none — no identity factory BFF/UI | — | — | gap |
| REQ-03 / CAP-01 | Email-shaped identifier on entry and sign-in | Login form `type="email"`; BFF `toUpstreamLoginBody` only requires non-empty identifier (no `@`/domain check) | `auth-login-upstream.test.ts` (mapping only) | `verify/01` | partial |
| REQ-30 / CAP-01 | Password never returned on list/search/membership | Attach already strips `access_token`; no identity list yet | `platform-programmes.test.ts` (attach strip) | — | gap (new surfaces) |
| REQ-06–11, REQ-24, REQ-28 / CAP-02 | Grant/detach/who-can-enter; many programmes; unknown identity/programme refuse | **Wrong model live:** attach mints credential+password on a programme | attach strip unit | `verify/03` step 6 (attach) | drift / gap |
| REQ-12–15 / CAP-03 | Suspend/unsuspend/set password; in-flight waves continue; open sign-in dies | none for suspend/password-set; 401→login exists if upstream invalidates token | — | — | gap |
| REQ-16–18 / CAP-04 | One sign-in; see granted programmes; enter one; zero-programme empty | Login exists; **no programme picker**; delivery gated on JWT `tenant_id` (1:1) | — | `verify/01` login | partial |
| REQ-19 / CAP-04 | Keep 016 delivery minus invite | Fleet/runs/initiatives/metrics/checkpoints/board live | per-016 units | `verify/02`–`06` | exists (invite still present) |
| REQ-20 / CAP-05 | No invite act | Invite form + BFF **live** | — | `verify/02` step 2 | drift |
| REQ-21 / CAP-05 | No create+bind attach | CAP-P attach **live** | `platform-programmes.test.ts` | `verify/03` step 6 | drift |
| REQ-22–23, REQ-26 / CAP-05/04 | Role split; no factory list for `tenant_admin`; `platform_admin` not delivery | Nav + page guards exist; identity surfaces absent so REQ-22 not yet exercisable | `platform-programmes.test.ts` nav | `verify/03` step 2 | partial |
| REQ-27 / CAP-06 | Programme onboard + catalogue show | CAP-P list/create/detail/refresh live | `platform-programmes.test.ts` | `verify/03` | exists |
| Chassis login | httpOnly session | `app/api/auth/login/route.ts`; `lib/auth.ts` | `auth.test.ts` | `verify/01` | exists |

Wave ids are not in this spec (Q-2 / IM-03 → plan). Rows grouped by CAP.

## ADR traceability (F13)

| Spec REQ / wave | Relevant ADR(s) | Status | Code evidence | Finding |
|-----------------|-----------------|--------|----------------|---------|
| REQ-16, REQ-12, REQ-14, CTR-03/04 | NEW-ADR | missing ADR | `lib/jwt.ts` (`tenant_id`); `app/api/auth/login/route.ts` (cookie = upstream JWT); delivery BFF/pages `session?.tenant_id` (e.g. `app/api/gateflow/runs/route.ts`, `app/(dashboard)/fleet/page.tsx`); `lib/auth-fetch.ts` | `ALTERNATIVE: identity-scoped httpOnly session plus separate entered-programme authorization context vs reminting a programme-bound upstream JWT into the session cookie on programme enter` |
| All new UI (CAP-01–03, grant/membership) | ADR-001 (Accepted) | aligned | `components/ui/*`; `app/globals.css`; `components.json` | none |
| New BFF resources (CTR-01–04 consumer) | N/A (`nextjs-repository-layout.mdc`) | aligned with rules | `app/api/gateflow/**` (existing by-upstream folders) | none — TDD names `<resource>` under `gateflow/` |

## Governance findings (F13–F14)

| ID | Check | Spec quote | Governing doc | Finding |
|----|-------|------------|---------------|---------|
| FF-01 | F13 | "Programme entry is authorization, not a second login" | no Accepted ADR; `nextjs-bff-server-auth.mdc` constrains cookie/JWT placement only | `ALTERNATIVE: identity-scoped httpOnly session plus separate entered-programme authorization context vs reminting a programme-bound upstream JWT into the session cookie on programme enter` |
| FF-02 | F14 | "Exact BFF path layout under `app/api/<upstream>/…` for CTR-01–04" | `nextjs-repository-layout.mdc`; `nextjs-bff-route-handlers.mdc` | Non-blocking PE — TDD must name `app/api/gateflow/<resource>/` for identities/grants; rules already forbid UI-named API folders |

## Findings by severity

### Critical

_None._

### Should fix

| ID | Check | Finding | Evidence |
|----|-------|---------|----------|
| FF-01 | F13 | `ALTERNATIVE: identity-scoped httpOnly session plus separate entered-programme authorization context vs reminting a programme-bound upstream JWT into the session cookie on programme enter` | Spec REQ-16 / Q-1; `lib/jwt.ts`; `app/api/auth/login/route.ts`; every delivery route/page using `session.tenant_id` |

### Verify

| ID | Check | Finding | Evidence |
|----|-------|---------|----------|
| FF-03 | F5/F3 | Live 016 invite and CAP-P attach contradict REQ-20/21; verify/02 step 2 and verify/03 step 6 still prove the old acts | `components/tenant/tenant-detail.tsx`; `app/api/gateflow/tenants/users/route.ts`; `components/programmes/programme-detail.tsx`; `tests/verify/02-w0-identity-onboarding.md`; `tests/verify/03-platform-programme-onboard.md` |
| FF-04 | F9/F10 | Kill line: confirm gateflow CTR-01–04 (enter/grant/sign-in, 014 bind deleted) before shipping identity/grant screens | Spec A-5; map §7; this repo has no provider APIs |
| FF-05 | F3 | No INIT-017 live verify scripts yet; plan must add them and trim 016 invite/attach steps | `tests/verify/*`; spec evidence layers |

### Gap

| ID | Check | Finding | Evidence |
|----|-------|---------|----------|
| FF-06 | F2 | Factory identity, grant/detach, who-can-enter, suspend, password-set, programme-enter picker, and zero-programme empty state are absent | `app/` inventory; no identities module |
| FF-07 | F2/F4 | REQ-03 email-shape refuse is not implemented in BFF (`toUpstreamLoginBody` accepts any non-empty identifier) | `lib/auth-login-upstream.ts`; `tests/unit/auth-login-upstream.test.ts` |
| FF-08 | F4 | New unit areas needed: email uniqueness/shape, grant idempotency, password strip on identity/membership JSON, role refuse — do not duplicate full HTTP journeys already planned for live verify | `testing-verify-flows.mdc`; existing attach-strip unit is the pattern to copy |

## Impact surface

| Wave / area | Likely files/modules | Test touch |
|-------------|----------------------|------------|
| Session / entered programme (FF-01) | `lib/jwt.ts`, `lib/auth.ts`, `app/api/auth/login/route.ts`, `app/api/auth/me/route.ts`, all `app/api/gateflow/{runs,waves,tenants,programme,initiatives,metrics,checkpoints,board}/route.ts`, all `app/(dashboard)/{fleet,runs,tenant,…}/page.tsx` | unit: session/programme context helper; live: enter P1 then P2 |
| CAP-01 identity factory | new `app/api/gateflow/<identities>/`; new `components/` + dashboard page; `data/locales/en/` | unit: email/name/password refuse + duplicate; live: enter + find |
| CAP-02 grant/detach/who-can-enter | new grant BFF; programme detail membership (replace attach); identity membership | unit: idempotent grant; live: grant two programmes |
| CAP-03 suspend / password-set | new BFF; `authFetch` 401 path may suffice if upstream kills token | live: suspend open tab; password-set kills prior sign-in |
| CAP-05 purge invite | delete/stop `tenants/users` BFF + invite card; `hooks/use-tenant.ts`; `data/locales/en/tenants.json` | amend `verify/02`; drop invite unit-if-any |
| CAP-05 replace attach | remove attach form + `tenant-admins` create+bind; keep token-strip pattern for any remaining secrets | amend `verify/03`; keep/adapt `platform-programmes.test.ts` |
| CAP-04 programme enter + zero-grant empty | new picker/empty; nav after enter | live: J2/J3 |
| CAP-06 keep onboard | `app/(dashboard)/programmes/**` unchanged except attach → membership | `verify/03` minus attach |
| 016 delivery keep | fleet/runs/initiatives/metrics/checkpoints/board — consume entered programme instead of JWT `tenant_id` | existing verify/02–06 (re-bind to entered programme) |
| Pagination | factory list via `@/lib/constants` (`PAGINATION`) | unit if parser extracted |

## Risks & assumptions

| ID | Risk / assumption | Mitigation |
|----|-------------------|------------|
| R-1 | Shipping identity/grant UI against live 014 bind (kill line) | Plan waves: gateflow APIs first (Q-2 default sequential); do not merge ops screens onto 1:1 bind |
| R-2 | FF-01 choice touches every delivery BFF | ADR before plan; one helper for “entered programme” — do not fork per route |
| R-3 | `dev-stub` login still stamps `tenant_id: "dev"` | TDD must say how stub behaves for zero-grant and multi-programme |
| R-4 | 016 spec/verify still require invite | Q-4 document follow-on; 017 wins in this repo (REQ-20) |
| A-5 (spec) | Kill line / leftover bind wipe is gateflow’s | FF-04 verify; this console must not expose attach (REQ-21) |

## Recommended spec edits

- None required for Gate 2 package start — Q-1 already defers schema to technical review; FF-01 is the ADR to write there.
- After TDD: cite the new ADR id on REQ-16 / CTR-03/04 (same branch, Forge publish).
- Do not amend 016 spec in this INIT except as Q-4 follow-on.

---

## Open items by lane

> Routing rubric: product scope / UX → PM · engineering decisions / ADR → PE ·
> business source-of-truth → Domain SME · naming drift / inferred fixes → Auto-fix.
> Full rubric: `skills/development/spec-technical-review/references/governance.md`

| ID | Lane | Question / item | Blocking | Owner | Status | Required by | Default if deferred | Evidence | Resolution reference |
|----|------|-----------------|----------|-------|--------|-------------|---------------------|----------|----------------------|
| FF-01 | PE | Session vs remint programme-bound JWT for entered programme | yes | PE | open | technical review | none — do not implement delivery rebinding until ADR Accepted | spec REQ-16/Q-1; `lib/jwt.ts` `tenant_id` | pending TDD |
| FF-02 | PE | Name `app/api/gateflow/<resource>/` for CTR-01–04 | no | PE | open | technical review | BFF-by-upstream-service; no UI-named folders | spec Q-5; `nextjs-repository-layout.mdc` | pending TDD |
| Q-2 | PE | Wave split vs kill line | no | PE | open | `spec-implementation-plan` | Sequential: gateflow enter+grant live, then console screens | spec Q-2; map IM-03 | pending plan |
| Q-3 | domain | Leftover 014 bind rows in lab DB | no | gateflow PE | open | gateflow cutover | Wipe leftover rows; no dual model; console must not expose attach | spec Q-3; PRD OQ-01 | pending gateflow |
| Q-4 | PM | Update 016 invite stories in meta PRD / 016 spec | no | PM | open | later | 017 truth is no invite (REQ-20) | spec Q-4; PRD OQ-02 | pending `/update-documents` |
| FF-03 | PE | Purge invite + replace attach in verify/UI | no | PE | open | plan / W0 identity screens | 017 wins; do not ship invite | live invite/attach | pending plan |
| FF-07 | auto-fix | Email-shape check missing in login BFF mapper | no | PE | open | wave implementing REQ-03 | Refuse empty / no `@` / no domain at BFF + unit | `lib/auth-login-upstream.ts` | later authorized edit |
| AF-1 | auto-fix | `tests/README.md` still lists “Tenant detail + invite” | no | PE | open | same PR as invite purge | Replace row with 017 identity/grant verify | `tests/README.md` | later authorized edit |

### PM questions (product scope, UX, priority)

#### Blocking — must resolve before spec merge

_None._

#### Defer — can proceed with documented assumption

1. Q-4 — 016 invite document update after this INIT is promoted (PRD OQ-02).

### PE questions (engineering decisions — resolved by `/spec-technical-review`)

> These are **not** for PM. Run `/spec-technical-review` to produce a Technical
> Design Document that resolves these before `/spec-implementation-plan`.

#### Blocking for implementation plan

1. FF-01 — `ALTERNATIVE: identity-scoped httpOnly session plus separate entered-programme authorization context vs reminting a programme-bound upstream JWT into the session cookie on programme enter`

#### Defer with default

1. FF-02 — BFF resource names under `app/api/gateflow/`.
2. Q-2 — sequential provider then consumer (plan).
3. FF-03 — purge/replace sequencing inside ops waves (plan).

### Domain clarifications (business source-of-truth)

> Route to the named SME or BU team, not to PM and not to engineering.

| # | Question | Suggested SME | Blocks |
|---|----------|---------------|--------|
| D-1 | Leftover 014 bind-row wipe in a lab database (OQ-01) | gateflow PE | no |

### Auto-fixable (agent resolves later — not inside this skill)

> Record these as findings/signals. Do **not** edit product source or commit
> fixes during feasibility. Later stages or an authorized forge publish may
> apply them.

| # | Item | Fix |
|---|------|-----|
| AF-1 | `tests/README.md` invite feature row | Swap for 017 identity/grant verify when invite is purged |
| FF-07 | `toUpstreamLoginBody` has no email-shape refuse | Add REQ-03 checks + unit when login/entry wave lands |

---

## Check summary

| Check | Status | Findings |
|-------|--------|----------|
| F1 Baseline snapshot | PASS | Chassis + live 016 Mission Control; invite/attach present |
| F2 Spec → code map | PASS | Gaps/drifts recorded (FF-06, FF-03); CAP-06/019 exist |
| F3 Spec → verify map | PASS | Spec does not claim 017 scripts exist; FF-05 informational |
| F4 Spec → unit map | PASS | New unit areas named (FF-08, FF-07); no-overlap noted |
| F5 As-built drift | PASS | Expected: 016 invite/attach live vs 017 purge; no 017 as-built row yet |
| F6 Docs drift | PASS | ADR-001 Accepted; `tests_readme` not used as per-capability SSOT |
| F7 Overlap risk | PASS | Invite is live-only today; new units should stay parsers/refuses |
| F8 CI vs live boundary | PASS | `make check` + `test` + `build`; live verify manual under `tests/verify` |
| F9 Cross-service touch | PASS | CTR-01–04 semantic; provider is gateflow; kill line FF-04 |
| F10 Assumptions | PASS | A-5/A-7 evidenced; kill line unverified here → FF-04 |
| F11 Effort drivers | PASS | Session rebind (cross-cutting) + purge + new factory; see impact |
| F12 PM questions | PASS | Zero blocking PM |
| F13 ADR conformance | FAIL | FF-01 NEW-ADR Should-fix (session vs remint JWT) |
| F14 MDC conformance | PASS | No spec wording contradicts rules; FF-02 names TDD work |

**Check PASS** = zero unresolved blocking findings (informational OK).

**Draft verdict:** FAIL (F13 Should-fix open) → workflow `findings`

---

## Next steps

> Persist this report locally alongside the spec draft. Fill `handoff.forge` for
> `/commit-workspace` (or Gateflow ForgeClient) onto the Draft spec PR —
> **do not** commit, push, open PRs, or apply labels inside this skill.
> The spec PR is the engineering review surface; product Q&A uses the meta PRD PR.

**PM questions** → post as numbered comments on the **meta PRD PR** (plain English).
  Link from a spec PR comment if helpful. PM answers on meta PRD PR.
  Unresolved blocking PM items → outcome `needs-input`.

**PE questions** → discuss on the **Draft spec PR**; run `/spec-technical-review` next.
  PE accepts TDD/ADRs in **files** (`Draft` → `Accepted`); do **not** set
  `spec-lgtm` until the full package includes the implementation plan.
  Unresolved blocking PE/ADR items → outcome `findings`.

**Domain clarifications** → meta PRD PR comment or tracked issue; record answers in
  `open-questions.md` and publish via Forge to the spec branch.
  Unresolved blocking domain items → outcome `needs-input`.

**Auto-fixable items** → leave in report; resolve in a later authorized edit —
  not during this read-only feasibility run.

### Forge readiness

| Item | Value |
|------|-------|
| Local report path | `docs/specification/reports/Initiative-Feasibility-Report-INIT-GATEFLOW-017.md` |
| Target branch | `chore/INIT-GATEFLOW-017-spec-gateflow-ops` |
| Recommended forge | `/commit-workspace` (Gate 2 stays `spec-pending`) |
| Mutations performed by this skill | **none** |

```
Draft spec PR: chore/INIT-GATEFLOW-017-spec-gateflow-ops  (spec-pending)
When ready:
  [x] Source freshness is CURRENT
  [x] All blocking PM questions answered on meta PRD PR (none)
  [x] All blocking Domain clarifications answered (none blocking)
  [ ] Spec updated to reflect answers (same branch, via Forge) — N/A unless PE amends after TDD
  [x] Incremental re-run of /initiative-feasibility on updated spec is clean — first run: findings (FF-01)
  [ ] Proceed: /spec-technical-review (always — pin routes pass and findings here)
  [ ] After spec + feasibility + TDD (if any) + plan on branch (Forge publish):
      PE sets spec-lgtm + Approve on exact head → Ready for review → merge
  [ ] After merge: `/create-board-tickets` from plan §9 — then /pre-implement → /loop-spec
```

---

```yaml
handoff:
  contract: sdd-delivery/v2
  stage: initiative-feasibility
  outcome: findings
  artifact:
    path: docs/specification/reports/Initiative-Feasibility-Report-INIT-GATEFLOW-017.md
  blockers:
    - FF-01
  signals:
    findings_total: 7
    critical: 0
    should_fix: 1
    verify_gap: 6
    new_adr: true
    pe_blocking_open: 1
    pm_blocking_open: 0
    domain_blocking_open: 0
    outcome_rationale: FF-01 NEW-ADR session vs remint programme-bound JWT
    ripple_action: continue
    spec_pr: https://github.com/drivestream-lab/gateflow-ops/pull/32
    codegraph_provider: mcp-user-prayog-fleet-cbm
    grounding_depth: light
  next_candidates:
    - spec-technical-review
  human_checkpoint: false
  external_action: false
  forge:
    action: commit_workspace
    draft: true
    apply_labels:
      - spec-pending
    title: "[INIT-GATEFLOW-017] Spec — gateflow-ops"
    body_path: docs/specification/reports/Initiative-Feasibility-Report-INIT-GATEFLOW-017.md
```
