## Pre-implement — gateflow-ops / W1 — Wave operations (CAP-C)

| Field             | Value                                                                                                                                                                                                        |
| ----------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Artifact          | `docs/specification/reports/Pre-Implement-INIT-GATEFLOW-016-W1.md`                                                                                                                                           |
| Initiative        | INIT-GATEFLOW-016                                                                                                                                                                                            |
| Wave              | W1                                                                                                                                                                                                           |
| Date              | 2026-08-13                                                                                                                                                                                                   |
| Outcome           | `pass`                                                                                                                                                                                                       |
| Outcome reason    | W0 Ground Report + as-built `human_approved`; spec PR #19 merged with `spec-lgtm`; board W1 #22 seeded with TASK-W1-01/02; WorkManifest contract pass; P15 live path and commands resolved                   |
| Wave head context | Bound by Forge/human context: `develop` @ `ddc4040e5f738cc195663a89b57b337fecc6966d` — not opened by this skill; coding should cut `feature/INIT-GATEFLOW-016-w1-*` from develop before `/loop-spec` publish |

---

### Gate check (prior wave)

> Complete this before reading anything else. Do not proceed if the gate fails.
> Board / branch / PR checks are **read-only**. Do not create tickets or open
> a branch from this skill — emit Forge readiness instead.

| Item                         | Required                                                                                             | Status                                                                                                                                                                                    |
| ---------------------------- | ---------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Branch context (read-only)   | Bound head is `develop` or `feature/INIT-*-w{N}-*` — not open `chore/*-spec-*`                       | [x] ok — `develop`                                                                                                                                                                        |
| Spec PR merged               | Implementation plan on integration branch                                                            | [x] yes — PR #19 MERGED (`b86d0b97…`); plan on `develop`                                                                                                                                  |
| Coding-readiness at merge    | Merged spec PR had `spec-lgtm` on head                                                               | [x] verified — label on PR #19; head `5beedd46…`                                                                                                                                          |
| Board seed (read-only)       | Wave issue(s) from plan §9 exist; TASK ids present in wave body                                      | [x] seeded — [#22](https://github.com/drivestream-lab/gateflow-ops/issues/22) under EPIC [#20](https://github.com/drivestream-lab/gateflow-ops/issues/20); TASK-W1-01, TASK-W1-02 in body |
| WorkManifest contract        | `prayog/v1` §9 passes `scripts/workmanifest_contract.py`                                             | [x] pass                                                                                                                                                                                  |
| TASK exit proof              | Every wave `TASK-*` has `exit.criteria` + `exit.proof` (kind/expected/evidence_expected)             | [x] complete                                                                                                                                                                              |
| Live-verification contract   | When P15 applies: `verification.live` applicable + script under `live_verify_dir` (not unit-as-live) | [x] contract — `tests/verify/03-w1-wave-operations.md` (create in TASK-W1-02)                                                                                                             |
| Plan source freshness        | all upstream rows `CURRENT`                                                                          | [x] current                                                                                                                                                                               |
| Impact-map repo scope        | revision and scope digest match canonical handoff                                                    | [x] match — H3 rev `1`; H2 `sha256:4daa0360…`; product-spec H1–H3 align                                                                                                                   |
| `check_command`              | resolved                                                                                             | [x] `make check`                                                                                                                                                                          |
| `test_command`               | resolved                                                                                             | [x] `make test`                                                                                                                                                                           |
| `verify_command`             | live script under `live_verify_dir` when P15 applies; else command or N/A with reason                | [x] `tests/verify/03-w1-wave-operations.md`                                                                                                                                               |
| `ground_command`             | resolved or N/A with reason                                                                          | [x] N/A — no Makefile ground target; `/ground-spec` after wave uses as-built                                                                                                              |
| Co-shipped live verify (P15) | If wave adds/changes product surface: FILE path under `live_verify_dir` listed                       | [x] `tests/verify/03-w1-wave-operations.md`                                                                                                                                               |
| Prior wave as-built row      | `human_approved` (from prior `wave-acceptance`)                                                      | [x] W0 = `human_approved`                                                                                                                                                                 |
| Prior Ground Report exists   | `reports/Ground-Report-{SPEC}-W{N-1}.md`                                                             | [x] exists — `Ground-Report-INIT-GATEFLOW-016-W0.md`                                                                                                                                      |
| Plan PE sign-off (W0 only)   | Implementation-Plan §0 marked complete                                                               | [x] N/A — W1                                                                                                                                                                              |

**Gate verdict:** PASS

**Forge readiness (when seed / wave head absent):** N/A — board seeded; head context is integration `develop`. Publish checklist via `commit_workspace` onto bound wave head before `/loop-spec`.

**Hygiene note (non-blocking):** CAP-P backfill already co-shipped `tests/verify/03-platform-programme-onboard.md`. WorkManifest still names `tests/verify/03-w1-wave-operations.md` (different filename — valid). Prefer keeping the WorkManifest name; do not overwrite the CAP-P verify FILE.

---

### Contracts consumed (from prior Ground Report)

> Read `Ground-Report-INIT-GATEFLOW-016-W0.md` §Contracts produced.
> Confirmed against `source_roots` on `develop` @ `ddc4040…`.

| Assumed contract                          | Entry point                                                     | Input shape                                    | Output shape                     | Source           | Confirmed?                                                                      |
| ----------------------------------------- | --------------------------------------------------------------- | ---------------------------------------------- | -------------------------------- | ---------------- | ------------------------------------------------------------------------------- |
| Workspace shell slots                     | `components/workspace` — WorkspaceShell / PageHeader / PageBody | authenticated children; title/actions          | left nav + inset chrome          | Ground-Report-W0 | [x] yes — present under `components/workspace/*` + dashboard layout             |
| Tenant BFF                                | `app/api/gateflow/tenants` GET; `tenants/users` POST            | session cookie; invite `{ identity }`          | shaped tenant detail; invite ack | Ground-Report-W0 | [x] yes                                                                         |
| Programme BFF (fleet gate for wave repos) | `app/api/gateflow/programme` `op=…`                             | connection/catalogue/select/readiness/deselect | upstream-shaped JSON             | Ground-Report-W0 | [x] yes — W1 waves need fleet-admitted repos upstream; ops Fleet already admits |
| Onboarding verdict helper                 | `lib/onboarding-verdict` composeOnboardingVerdict               | select + readiness                             | pass\|fail + reasonKey           | Ground-Report-W0 | [x] yes — optional for W1 (run stop-state is separate UI concern)               |
| Client data hooks pattern                 | `hooks/use-tenant`, `hooks/use-programme`                       | authFetch + TanStack Query                     | typed client models              | Ground-Report-W0 | [x] yes — W1 adds `hooks/use-runs.ts` same pattern                              |
| Session → BFF → upstream chassis          | `getSession` / `authFetch` / `upstreamFetch` / `bffError`       | cookie + relative `/api/*`                     | JSON / redirects                 | W0 + chassis     | [x] yes                                                                         |

**Unconfirmed contracts** (no Ground Report backing — live gateflow only):

- **CTR-03** gateflow wave start / runs list-detail / forge authorize HTTP shapes — consume product-spec CTR-03 + live upstream; fail closed on unexpected fields; do not invent mocks for live verify.
- Run timeline / stop-state presentation semantics (`STOPPED` + `external-action`) — gateflow live; UI must not style expected human checkpoints as errors (REQ-11).

---

### Must read

- [x] `AGENTS.md`
- [x] MDC rules (domain-filtered — list files read for this slice's domains):
  - [x] `nextjs-bff-server-auth.mdc` — session cookie, `authFetch`, server-only upstream
  - [x] `nextjs-bff-route-handlers.mdc` — BFF logging/errors/upstream
  - [x] `nextjs-repository-layout.mdc` — BFF by upstream service (`gateflow/`); UI by workflow (`/runs`)
  - [x] `nextjs-app-router-stack.mdc` — App Router, TanStack Query, RSC vs client
  - [x] `workspace-page-layout.mdc` — WorkspaceShell slots for runs cockpit
  - [x] `no-hardcoded-strings.mdc` — `data/locales/en/runs.json`
  - [x] `typescript-react-style.mdc` — `"use client"` at leaves
  - [x] `tailwind-design-tokens.mdc` — semantic tokens (stop states ≠ destructive by default)
  - [x] `client-forms-patterns.mdc` — wave-start + authorize actions
  - [x] `testing-verify-flows.mdc` — unit vs live; no-overlap
  - [x] `shared-limits-pagination.mdc` — run list filters/limits via `@/lib/constants`
  - [x] `spec-driven-development.mdc` — same-PR as-built/tests
  - [ ] skipped: `documentation-project-guidance.mdc`, `code-guidelines-index.mdc` — index/meta only for this slice
- [x] ADRs (keyword-matched — list ids):
  - [x] ADR-001 — shadcn + semantic tokens for CAP-C UI (REQ-09–12 composition mechanism)
- [x] Spec: `docs/specification/product/INIT-GATEFLOW-016-gateflow-ops.md` (REQ-09–12, CTR-03; CAP-C ≠ Fleet admit)
- [x] Plan wave section / §9 WorkManifest: `docs/specification/reports/Implementation-Plan-INIT-GATEFLOW-016.md` W1
- [x] Board wave issue: https://github.com/drivestream-lab/gateflow-ops/issues/22 — TASK list (projected from WorkManifest; not a second authority):
  - [x] TASK-W1-01 — implements REQ-09…12 — depends_on: [] — files: `app/api/gateflow/waves/route.ts`, `runs/route.ts`, `runs/by-id/route.ts`, `runs/forge/route.ts`, `components/runs/run-cockpit.tsx`, `hooks/use-runs.ts`, `app/(dashboard)/runs/page.tsx`, `data/locales/en/runs.json` — exit: three lanes start; timeline; forge authorize only on external-action; expected stops not errors — proof `make check && make test`
  - [x] TASK-W1-02 — implements REQ-09…12 — depends_on: [TASK-W1-01] — files: `tests/verify/03-w1-wave-operations.md`, as-built rows — exit: smoke to external-action authorize PASS — proof follow verify FILE; evidence `wave-accepted` on tip

---

### Governance alignment

- [x] Slice spec does not contradict ADR-001 (`changes_user_visible_behavior: false`)
- [x] Plan TASK MDC notes and ADR notes for this wave reviewed (BFF handlers/layout; ADR-001 on UI)
- [x] ADR-001 is **Accepted** in `docs/specification/adr/`
- [x] Product rule: Fleet select/admit remains CAP-B; do **not** fold wave-start into `/fleet` (spec out-of-scope + as-built W1 note)

---

### Must update (in the same change as the code — via `/loop-spec`)

- [ ] Product spec — only if observable REQ-09–12 / CTR-03 wording changes (not expected)
- [ ] `docs/specification/as-built/implementation-status.md` — W1 / CAP-C verification row
- [ ] `docs/specification/as-built/Implementation-Status-INIT-GATEFLOW-016.md` — W1 status + notes
- [ ] `tests/README.md` — feature map rows for wave start / runs / forge authorize
- [ ] Unit verification — pure mappers / stop-state presentation helpers extracted from handlers (mock upstream)
- [ ] Live verification — co-ship `tests/verify/03-w1-wave-operations.md` (human-run at `wave-acceptance`)
- [ ] ADR — no supersede expected
- [ ] Nav — add Runs (or equivalent) for `tenant_admin` in `lib/workspace-nav.ts` + i18n (plan file list omits nav; required for discoverability)

---

### Must not

- [ ] Implement against spec wording that contradicts ADR-001 without superseding it
- [ ] Duplicate unit assertions in live smoke scripts
- [ ] Assume CTR-03 field shapes without fail-closed handling / Ground Report for prior ops contracts only
- [ ] Open a branch, commit, push, open a PR, apply labels, or create board issues from this skill
- [ ] Call upstream from the browser; store upstream JWT in `localStorage`
- [ ] Self-dispatch forge skills / Cursor forge actions — authorize only via explicit operator action (REQ-12)
- [ ] Style expected human-checkpoint / `STOPPED`+`external-action` stops as errors (REQ-11)
- [ ] Put wave-start UI on the Fleet page (CAP-B ≠ CAP-C)
- [ ] Change gateflow routes/schemas/contracts

---

### Verification plan

| Layer        | What it proves                                                      | Command (from tests_readme / profile)                      |
| ------------ | ------------------------------------------------------------------- | ---------------------------------------------------------- |
| Static check | Formatting, linting, types, or equivalent repository checks         | `make check`                                               |
| Unit         | Module logic, boundary behaviour, edge cases (no external I/O)      | `make test`                                                |
| Live verify  | Product behaviour on running stack (human-run at `wave-acceptance`) | `tests/verify/03-w1-wave-operations.md` — P15 new surfaces |
| Ground check | Assigned wave REQs satisfied; boundaries respected                  | N/A — `/ground-spec` after accept uses as-built            |

> P15 applies: live path is mandatory. Agent implements the script in `/loop-spec`; does **not** run it as success.
> Prerequisites (from plan): `AUTH_MODE=jwt-upstream`; `UPSTREAM_BASE_URL` → live gateflow; TENANT_ADMIN session; fleet-admitted repo available for wave start.

### Human wave-acceptance (after loop-spec + Draft PR)

When checklist PASS and coding is green, the human at checkpoint
`wave-acceptance`:

- [ ] Run `tests/verify/03-w1-wave-operations.md` against live gateflow (all three lanes + forge authorize path)
- [ ] Experience / inspect runs cockpit stop-state presentation to the depth env allows
- [ ] Signal accept with GitHub label `wave-accepted` on the tip — content skills do **not** apply it
- [ ] Apply tip hygiene for any hotfixes before Pass-2 closeout

---

### Tracker / PR (read-only context)

- Initiative: INIT-GATEFLOW-016
- Issue: [#22](https://github.com/drivestream-lab/gateflow-ops/issues/22) (EPIC [#20](https://github.com/drivestream-lab/gateflow-ops/issues/20))
- Spec path: `docs/specification/product/INIT-GATEFLOW-016-gateflow-ops.md`
- Verify command (human): `tests/verify/03-w1-wave-operations.md`
- ADRs in scope: ADR-001
- Wave head: bound by Forge/human context — `develop` (cut `feature/INIT-GATEFLOW-016-w1-*` for coding publish)

---

### Checklist publish readiness (on `pass` — fill handoff.forge commit_workspace)

| Field            | Value                                                                                                 |
| ---------------- | ----------------------------------------------------------------------------------------------------- |
| Workflow outcome | `pass` — W1 gates satisfied                                                                           |
| Next             | `loop-spec` (`skill`) — `external_action: false`                                                      |
| Forge (this hop) | `commit_workspace` **required** — publish `Pre-Implement-INIT-GATEFLOW-016-W1.md` to bound `head_ref` |
| Later            | After `/loop-spec`, `wave-pr-action` opens Draft PR (checklist + code already on tip)                 |

Recommend `/commit-workspace` after explicit authorization. Do not open the PR here.

---

### Merge order (if cross-module / cross-service)

1. W0 already merged + `human_approved` (shell, tenant, fleet admit).
2. CAP-P backfill merged on `develop` (programmes) — not a WorkManifest wave; optional env prep for tenants; W1 does not require new CAP-P APIs.
3. W1 CAP-C on new feature branch from `develop` → Draft PR → `wave-accepted` → human merge.
4. Gateflow remains provider-only (CTR-03 unchanged consumer).

```yaml
handoff:
  contract: sdd-delivery/v2
  stage: pre-implement
  outcome: pass
  artifact:
    path: docs/specification/reports/Pre-Implement-INIT-GATEFLOW-016-W1.md
  blockers: []
  signals:
    wave: W1
    initiative: INIT-GATEFLOW-016
    board_issue: https://github.com/drivestream-lab/gateflow-ops/issues/22
    epic_issue: https://github.com/drivestream-lab/gateflow-ops/issues/20
    tasks:
      - TASK-W1-01
      - TASK-W1-02
    assigned_reqs:
      - REQ-09
      - REQ-10
      - REQ-11
      - REQ-12
    check_command: make check
    test_command: make test
    verify_command: tests/verify/03-w1-wave-operations.md
    ground_command: null
    tip_sha: ddc4040e5f738cc195663a89b57b337fecc6966d
    head_ref_hint: feature/INIT-GATEFLOW-016-w1-wave-operations
  next_candidates:
    - loop-spec
  human_checkpoint: false
  external_action: false
  forge:
    action: commit_workspace
    head_ref: develop
    paths:
      - docs/specification/reports/Pre-Implement-INIT-GATEFLOW-016-W1.md
    message: "docs(pre-implement): INIT-GATEFLOW-016 W1 preflight checklist."
```
