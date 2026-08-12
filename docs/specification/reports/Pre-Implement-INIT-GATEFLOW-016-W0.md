## Pre-implement — gateflow-ops / W0 — Identity, fleet onboarding, workspace shell

| Field | Value |
|-------|-------|
| Artifact | `docs/specification/reports/Pre-Implement-INIT-GATEFLOW-016-W0.md` |
| Initiative | INIT-GATEFLOW-016 |
| Wave | W0 |
| Date | 2026-08-12 |
| Outcome | `pass` |
| Outcome reason | Spec merged with `spec-lgtm`, board W0 seeded under EPIC, WorkManifest contract pass, PE sign-off complete, P15 live verify path resolved, commands resolved |
| Wave head context | Bound by Forge/human context: `develop` @ `b86d0b9750a6524b67a8edb2e9ffad327a3a892b` — not opened by this skill; coding should cut `feature/INIT-GATEFLOW-016-w0-*` from develop before `/loop-spec` publish |

---

### Gate check (prior wave)

> Complete this before reading anything else. Do not proceed if the gate fails.
> Board / branch / PR checks are **read-only**. Do not create tickets or open
> a branch from this skill — emit Forge readiness instead.

| Item | Required | Status |
|------|----------|--------|
| Branch context (read-only) | Bound head is `develop` or `feature/INIT-*-w{N}-*` — not open `chore/*-spec-*` | [x] ok — `develop` |
| Spec PR merged | Implementation plan on integration branch | [x] yes — PR #19 MERGED |
| Coding-readiness at merge | Merged spec PR had `spec-lgtm` on head | [x] verified — label on merge; tip package `5beedd46…` |
| Board seed (read-only) | Wave issue(s) from plan §9 exist; TASK ids present in wave body | [x] seeded — #21 under EPIC #20; TASK-W0-01…05 in body |
| WorkManifest contract | `prayog/v1` §9 passes `scripts/workmanifest_contract.py` | [x] pass |
| TASK exit proof | Every wave `TASK-*` has `exit.criteria` + `exit.proof` | [x] complete |
| Live-verification contract | When P15 applies: `verification.live` applicable + script under `live_verify_dir` | [x] contract — `tests/verify/02-w0-identity-onboarding.md` (to create in TASK-W0-05) |
| Plan source freshness | all upstream rows `CURRENT` | [x] current |
| Impact-map repo scope | revision and scope digest match canonical handoff | [x] match — H3 rev `1`; H2 `sha256:4daa0360…` |
| `check_command` | resolved | [x] `make check` |
| `test_command` | resolved | [x] `make test` |
| `verify_command` | live script under `live_verify_dir` when P15 applies | [x] `tests/verify/02-w0-identity-onboarding.md` |
| `ground_command` | resolved or N/A with reason | [x] N/A — no Makefile ground target; `/ground-spec` uses as-built after wave |
| Co-shipped live verify (P15) | If wave adds/changes product surface: FILE path under `live_verify_dir` listed | [x] `tests/verify/02-w0-identity-onboarding.md` |
| Prior wave as-built row | `human_approved` (from prior `wave-acceptance`) | [x] N/A — W0 first wave |
| Prior Ground Report exists | `reports/Ground-Report-{SPEC}-W{N-1}.md` | [x] N/A — W0 |
| Plan PE sign-off (W0 only) | Implementation-Plan §0 marked complete | [x] complete — 2026-08-12 (PR #19 + Accepted TDD) |

**Gate verdict:** PASS

**Forge readiness (when seed / wave head absent):** N/A — board seeded; head context is integration `develop`. Publish checklist via `commit_workspace` onto bound wave head before `/loop-spec`.

---

### Contracts consumed (from prior Ground Report)

> W0 has no prior Ground Report. Chassis contracts below confirmed against
> `source_roots` (`app/`, `lib/`, `components/`).

| Assumed contract | Entry point | Input shape | Output shape | Source | Confirmed? |
|-----------------|-------------|-------------|--------------|--------|------------|
| Session guard on authenticated layout | `getSession` in `app/(dashboard)/layout.tsx` | cookies / session helper | redirect to `/login` or render children | chassis layout | [x] yes — layout redirects when no session |
| Client → BFF only | `authFetch` in `lib/auth-fetch.ts` | same-origin `/api/*` + fetch init | `Response`; 401 → login redirect | TDD §3.1 + source | [x] yes |
| BFF → upstream | `upstreamFetch` in `lib/upstream-fetch.ts` | gateflow path + session Bearer | upstream `Response`; handlers use `mapUpstreamStatus` / `bffError` | TDD §3.2 + exemplar `app/api/gateflow/status/route.ts` | [x] yes |
| BFF error + logging pattern | `bffError`, `logRequestStart/Success/Error` | status + i18n key | JSON `{ error: i18nKey }` | exemplar status route | [x] yes |
| UI primitives | `components/ui/*` + `app/globals.css` tokens | shadcn add / CVA | semantic utilities only | ADR-001 | [x] yes |
| Workspace shell (target) | `components/workspace/*` (absent) | slot props | left nav + header + body | project-guidance + plan | [ ] NO — not built yet; W0 creates it |

**Unconfirmed contracts** (prior wave not yet grounded or source not found):
- Gateflow upstream CTR-01 (tenants) and CTR-02 (programme) HTTP shapes — live only; treat TDD/spec as intent; fail closed on unexpected fields rather than inventing mocks.
- `composeOnboardingVerdict` — does not exist yet; TASK-W0-03/04 create + unit-test per TDD §3.3.

---

### Must read

- [x] `AGENTS.md`
- [x] MDC rules (domain-filtered — list files read for this slice's domains):
  - [x] `workspace-page-layout.mdc` — authenticated shell slots
  - [x] `nextjs-bff-server-auth.mdc` — session cookie, `authFetch`, server-only upstream
  - [x] `nextjs-bff-route-handlers.mdc` — BFF logging/errors/upstream
  - [x] `nextjs-repository-layout.mdc` — BFF by upstream service (`gateflow/`)
  - [x] `nextjs-app-router-stack.mdc` — App Router, TanStack Query, RSC vs client
  - [x] `no-hardcoded-strings.mdc` — i18n catalogs
  - [x] `typescript-react-style.mdc` — `"use client"` at leaves
  - [x] `tailwind-design-tokens.mdc` — semantic tokens
  - [x] `client-forms-patterns.mdc` — controlled forms + mutations
  - [x] `testing-verify-flows.mdc` — unit vs live verify
  - [x] `shared-limits-pagination.mdc` — constants for any list limits
  - [x] `spec-driven-development.mdc` — same-PR as-built/tests
  - [ ] skipped: `documentation-project-guidance.mdc`, `code-guidelines-index.mdc` — index/meta only for this slice
- [x] ADRs (keyword-matched — list ids):
  - [x] ADR-001 — shadcn + semantic tokens for all W0 UI (REQ-01–08 composition mechanism)
- [x] Spec: `docs/specification/product/INIT-GATEFLOW-016-gateflow-ops.md` (REQ-01–08, CTR-01–02)
- [x] Plan wave section / §9 WorkManifest: `docs/specification/reports/Implementation-Plan-INIT-GATEFLOW-016.md` W0
- [x] Board wave issue: https://github.com/drivestream-lab/gateflow-ops/issues/21 — TASK list (projected from WorkManifest; not a second authority):
  - [x] TASK-W0-01 — implements REQ-01…08 — depends_on: [] — workspace shell files — exit: layout renders nav + slots; proof `make check && make test`
  - [x] TASK-W0-02 — implements REQ-01, REQ-02 — depends_on: [TASK-W0-01] — tenants BFF/UI — exit: detail+invite via BFF; 401→login; proof `make check && make test`
  - [x] TASK-W0-03 — implements REQ-03…08 — depends_on: [TASK-W0-01] — programme/fleet + verdict helper — exit: catalogue/connect/select/readiness/deselect; pass|fail only; proof `make check && make test`
  - [x] TASK-W0-04 — implements REQ-07 — depends_on: [TASK-W0-03] — `tests/unit/onboarding-verdict.test.ts` — exit: all combos pass|fail; proof `make test`
  - [x] TASK-W0-05 — implements REQ-01…08 — depends_on: [TASK-W0-02, TASK-W0-03, TASK-W0-04] — live verify + as-built — exit: smoke PASS; proof follow `tests/verify/02-w0-identity-onboarding.md`

---

### Governance alignment

- [x] Slice spec does not contradict ADR-001 (`changes_user_visible_behavior: false`)
- [x] Plan TASK MDC notes and ADR notes for this wave reviewed (workspace-page-layout; BFF handlers/layout; ADR-001 on UI tasks)
- [x] ADR-001 is **Accepted** in `docs/specification/adr/`

---

### Must update (in the same change as the code — via `/loop-spec`)

- [ ] Product spec — only if observable REQ wording changes (not expected for W0)
- [ ] `docs/specification/as-built/implementation-status.md` — add INIT-016 / W0 verification row
- [ ] `docs/specification/as-built/Implementation-Status-INIT-GATEFLOW-016.md` — create initiative detail
- [ ] `tests/README.md` — feature map rows for CAP-A/B + onboarding verdict unit
- [ ] Unit verification — `tests/unit/onboarding-verdict.test.ts` (+ BFF shaping edges as extracted)
- [ ] Live verification — co-ship `tests/verify/02-w0-identity-onboarding.md` (human-run at `wave-acceptance`)
- [ ] ADR — no supersede expected

---

### Must not

- [ ] Implement against spec wording that contradicts ADR-001 without superseding it
- [ ] Duplicate unit assertions in live smoke scripts
- [ ] Assume gateflow CTR shapes beyond TDD/spec without failing closed on drift
- [ ] Open a branch, commit, push, open a PR, apply labels, or create board issues from this skill
- [ ] Call upstream from the browser; put JWT in `localStorage`; invent PLATFORM_ADMIN surfaces
- [ ] Show partial onboarding verdict (REQ-07 — pass|fail only)
- [ ] Invent parallel page chrome outside WorkspaceShell slots

---

### Verification plan

| Layer | What it proves | Command (from tests_readme / profile) |
|-------|----------------|---------------------------------------|
| Static check | Formatting, linting, types, or equivalent repository checks | `make check` |
| Unit | Module logic, boundary behaviour, edge cases (no external I/O) | `make test` |
| Live verify | Product behaviour on running stack (human-run at `wave-acceptance`) | `tests/verify/02-w0-identity-onboarding.md` — P15 new surfaces |
| Ground check | Assigned wave REQs satisfied; boundaries respected | N/A — `/ground-spec` after accept uses as-built |

> P15 applies: live path is mandatory. Agent implements the script in `/loop-spec`; does **not** run it as success.
> Prerequisites (from plan): `AUTH_MODE=jwt-upstream`; `UPSTREAM_BASE_URL` → live gateflow; TENANT_ADMIN session.

### Human wave-acceptance (after loop-spec + Draft PR)

When checklist PASS and coding is green, the human at checkpoint
`wave-acceptance`:

- [ ] Run `tests/verify/02-w0-identity-onboarding.md` against live gateflow
- [ ] Experience / inspect tenant + fleet onboarding to the depth env allows
- [ ] Signal accept with GitHub label `wave-accepted` on the tip — content skills do **not** apply it
- [ ] Apply tip hygiene for any hotfixes before Pass-2 closeout

---

### Tracker / PR (read-only context)

- Initiative: INIT-GATEFLOW-016
- Issue: [#21](https://github.com/drivestream-lab/gateflow-ops/issues/21) (EPIC [#20](https://github.com/drivestream-lab/gateflow-ops/issues/20))
- Spec path: `docs/specification/product/INIT-GATEFLOW-016-gateflow-ops.md`
- Verify command (human): `tests/verify/02-w0-identity-onboarding.md`
- ADRs in scope: ADR-001
- Wave head: bound by Forge/human context — `develop` (cut `feature/INIT-GATEFLOW-016-w0-*` for coding publish)

---

### Checklist publish readiness (on `pass` — fill handoff.forge commit_workspace)

| Field | Value |
|-------|-------|
| Workflow outcome | `pass` — W0 gates satisfied |
| Next | `loop-spec` (`skill`) — `external_action: false` |
| Forge (this hop) | `commit_workspace` **required** — publish `Pre-Implement-INIT-GATEFLOW-016-W0.md` to bound `head_ref` |
| Later | After `/loop-spec`, `wave-pr-action` opens Draft PR (checklist + code already on tip) |

Recommend `/commit-workspace` after explicit authorization. Do not open the PR here.

---

### Merge order (if cross-module / cross-service)

N/A — single-repo wave; internal TASK order TASK-W0-01 → (02 ∥ 03) → 04 → 05.

---

```yaml
handoff:
  contract: sdd-delivery/v2
  stage: pre-implement
  outcome: pass
  artifact:
    path: docs/specification/reports/Pre-Implement-INIT-GATEFLOW-016-W0.md
  blockers: []
  signals:
    initiative: INIT-GATEFLOW-016
    wave: W0
    board_issue: https://github.com/drivestream-lab/gateflow-ops/issues/21
    epic_issue: https://github.com/drivestream-lab/gateflow-ops/issues/20
    tasks:
      - TASK-W0-01
      - TASK-W0-02
      - TASK-W0-03
      - TASK-W0-04
      - TASK-W0-05
    implements:
      - REQ-01
      - REQ-02
      - REQ-03
      - REQ-04
      - REQ-05
      - REQ-06
      - REQ-07
      - REQ-08
    check_command: make check
    test_command: make test
    verify_command: tests/verify/02-w0-identity-onboarding.md
    ground_command: null
    workmanifest_contract: pass
    adr_in_scope:
      - ADR-001
    wave_head_context: develop
    repo: gateflow-ops
  next_candidates:
    - loop-spec
  human_checkpoint: false
  external_action: false
  forge:
    action: commit_workspace
    draft: true
    apply_labels: []
    title: "[INIT-GATEFLOW-016 W0] Pre-implement checklist"
    body_path: docs/specification/reports/Pre-Implement-INIT-GATEFLOW-016-W0.md
```
