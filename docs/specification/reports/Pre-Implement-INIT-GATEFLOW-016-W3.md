## Pre-implement — gateflow-ops / W3 — Metrics & efficacy panel (CAP-G)

| Field             | Value                                                                                                                                                                                                        |
| ----------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Artifact          | `docs/specification/reports/Pre-Implement-INIT-GATEFLOW-016-W3.md`                                                                                                                                           |
| Initiative        | INIT-GATEFLOW-016                                                                                                                                                                                            |
| Wave              | W3                                                                                                                                                                                                           |
| Date              | 2026-08-13                                                                                                                                                                                                   |
| Outcome           | `pass`                                                                                                                                                                                                       |
| Outcome reason    | W2 Ground Report + as-built `human_approved`; spec PR #19 merged with `spec-lgtm`; board W3 #24 seeded with TASK-W3-01/02; WorkManifest contract pass; P15 live path and commands resolved                   |
| Wave head context | Bound by Forge/human context: `develop` @ `460d81829f0bb50636d427c40e006dc368577c5a` — not opened by this skill; coding should cut `feature/INIT-GATEFLOW-016-w3-*` from develop before `/loop-spec` publish |

---

### Gate check (prior wave)

> Complete this before reading anything else. Do not proceed if the gate fails.
> Board / branch / PR checks are **read-only**. Do not create tickets or open
> a branch from this skill — emit Forge readiness instead.

| Item                         | Required                                                                                 | Status                                                                                                                                                                                    |
| ---------------------------- | ---------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Branch context (read-only)   | Bound head is `develop` or `feature/INIT-*-w{N}-*` — not open `chore/*-spec-*`           | [x] ok — `develop`                                                                                                                                                                        |
| Spec PR merged               | Implementation plan on integration branch                                                | [x] yes — PR #19 MERGED; plan on `develop`                                                                                                                                                |
| Coding-readiness at merge    | Merged spec PR had `spec-lgtm` on head                                                   | [x] verified — label on PR #19                                                                                                                                                            |
| Board seed (read-only)       | Wave issue(s) from plan §9 exist; TASK ids present in wave body                          | [x] seeded — [#24](https://github.com/drivestream-lab/gateflow-ops/issues/24) under EPIC [#20](https://github.com/drivestream-lab/gateflow-ops/issues/20); TASK-W3-01, TASK-W3-02 in body |
| WorkManifest contract        | `prayog/v1` §9 passes `scripts/workmanifest_contract.py`                                 | [x] pass — `prayog-skills/scripts/workmanifest_contract.py`                                                                                                                               |
| TASK exit proof              | Every wave `TASK-*` has `exit.criteria` + `exit.proof` (kind/expected/evidence_expected) | [x] complete                                                                                                                                                                              |
| Live-verification contract   | When P15 applies: `verification.live` applicable + script under `live_verify_dir`        | [x] contract — `tests/verify/05-w3-metrics-efficacy.md` (create in TASK-W3-02)                                                                                                            |
| Plan source freshness        | all upstream rows `CURRENT`                                                              | [x] current                                                                                                                                                                               |
| Impact-map repo scope        | revision and scope digest match canonical handoff                                        | [x] match — H3 rev `1`; H2 `sha256:4daa0360…`; product-spec H1–H3 align                                                                                                                   |
| `check_command`              | resolved                                                                                 | [x] `make check`                                                                                                                                                                          |
| `test_command`               | resolved                                                                                 | [x] `make test`                                                                                                                                                                           |
| `verify_command`             | live script under `live_verify_dir` when P15 applies                                     | [x] `tests/verify/05-w3-metrics-efficacy.md`                                                                                                                                              |
| `ground_command`             | resolved or N/A with reason                                                              | [x] N/A — no Makefile ground target; `/ground-spec` after wave uses as-built                                                                                                              |
| Co-shipped live verify (P15) | If wave adds/changes product surface: FILE path under `live_verify_dir` listed           | [x] `tests/verify/05-w3-metrics-efficacy.md`                                                                                                                                              |
| Prior wave as-built row      | `human_approved` (from prior `wave-acceptance`)                                          | [x] W2 = `human_approved`                                                                                                                                                                 |
| Prior Ground Report exists   | `reports/Ground-Report-{SPEC}-W{N-1}.md`                                                 | [x] exists — `Ground-Report-INIT-GATEFLOW-016-W2.md`                                                                                                                                      |
| Plan PE sign-off (W0 only)   | Implementation-Plan §0 marked complete                                                   | [x] N/A — W3                                                                                                                                                                              |

**Gate verdict:** PASS

**Forge readiness (when seed / wave head absent):** N/A — board seeded; head context is integration `develop`. Publish checklist via `commit_workspace` onto bound wave head before `/loop-spec`.

---

### Contracts consumed (from prior Ground Report)

> Read `Ground-Report-INIT-GATEFLOW-016-W2.md` §Contracts produced.
> Confirmed against `source_roots` on `develop` @ `460d818…`.

| Assumed contract                    | Entry point                                | Input shape      | Output shape                | Source           | Confirmed?                                                                 |
| ----------------------------------- | ------------------------------------------ | ---------------- | --------------------------- | ---------------- | -------------------------------------------------------------------------- |
| Workspace shell + authFetch chassis | W0 / layout + `authFetch`                  | session cookie   | shell + relative `/api/*`   | Ground-Report-W0 | [x] yes                                                                    |
| Session → BFF → upstream            | Route Handlers + `upstreamFetch`           | tenant session   | mapped JSON / BFF errors    | Ground-Report-W0 | [x] yes                                                                    |
| Initiatives list/readout/closure    | `app/api/gateflow/initiatives` (+ `by-id`) | org/repo + ops   | composed data / enqueue ack | Ground-Report-W2 | [x] yes — present; **CAP-G does not require reusing** these surfaces       |
| Composition helpers                 | `hooks/use-initiatives` gap/status helpers | status / unknown | enum / gap label            | Ground-Report-W2 | [x] yes — optional pattern for empty-state honesty; do not fold metrics UI |
| Initiatives hub UI                  | `/initiatives`                             | tenant_admin     | CAP-F surfaces              | Ground-Report-W2 | [x] yes — keep Metrics as a **separate** nav/page                          |
| Runs cockpit (optional deep-link)   | `/runs`                                    | tenant_admin     | CAP-C surfaces              | Ground-Report-W1 | [x] yes — Metrics must not embed wave start / forge                        |

**Unconfirmed contracts** (no Ground Report backing — live gateflow only):

- **CTR-07** gateflow metrics HTTP shapes — consume product-spec CTR-07 + live upstream:
  - `GET /api/v1/metrics/runs`
  - `GET /api/v1/metrics/skill-efficacy` (filters: `model_id` / `prompt_revision` per REQ-23)
  - `GET /api/v1/metrics/factory-effectiveness`
  - `GET /api/v1/metrics/delivery-scorecard`
- Empty tenant → **well-formed empty state**, never mock/placeholder series (REQ-22–25 negatives / product empty-state row).
- Prefer a **single** BFF `app/api/gateflow/metrics/route.ts` with `?op=` (or equivalent) — same WorkManifest path constraint as prior waves (no inventing extra folders beyond plan `files[]`).

---

### Must read

- [x] `AGENTS.md`
- [x] MDC rules (domain-filtered — list files read for this slice's domains):
  - [x] `nextjs-bff-server-auth.mdc` — session cookie, `authFetch`, server-only upstream
  - [x] `nextjs-bff-route-handlers.mdc` — BFF logging/errors/upstream
  - [x] `nextjs-repository-layout.mdc` — BFF by upstream (`gateflow/`); UI by workflow (`/metrics`)
  - [x] `nextjs-app-router-stack.mdc` — App Router, TanStack Query, RSC vs client
  - [x] `workspace-page-layout.mdc` — WorkspaceShell slots for metrics page
  - [x] `no-hardcoded-strings.mdc` — `data/locales/en/metrics.json`
  - [x] `typescript-react-style.mdc` — `"use client"` at leaves
  - [x] `tailwind-design-tokens.mdc` — semantic tokens
  - [x] `client-forms-patterns.mdc` — efficacy filters (model_id / prompt_revision)
  - [x] `testing-verify-flows.mdc` — unit vs live; no-overlap
  - [x] `shared-limits-pagination.mdc` — any list/window limits via `@/lib/constants`
  - [x] `spec-driven-development.mdc` — same-PR as-built/tests
  - [ ] skipped: `documentation-project-guidance.mdc`, `code-guidelines-index.mdc` — index/meta only
- [x] ADRs (keyword-matched — list ids):
  - [x] ADR-001 — shadcn + semantic tokens for CAP-G UI (REQ-22–25)
- [x] Spec: `docs/specification/product/INIT-GATEFLOW-016-gateflow-ops.md` (REQ-22–25, CTR-07)
- [x] Plan wave section / §9 WorkManifest: `docs/specification/reports/Implementation-Plan-INIT-GATEFLOW-016.md` W3
- [x] Board wave issue: https://github.com/drivestream-lab/gateflow-ops/issues/24 — TASK list (projected from WorkManifest; not a second authority):
  - [x] TASK-W3-01 — implements REQ-22…25 — depends_on: [] — files: `app/api/gateflow/metrics/route.ts`, `components/metrics/metrics-panels.tsx`, `hooks/use-metrics.ts`, `app/(dashboard)/metrics/page.tsx`, `data/locales/en/metrics.json` — exit: four panels tenant-scoped; empty ≠ mocks — proof `make check && make test`
  - [x] TASK-W3-02 — implements REQ-22…25 — depends_on: [TASK-W3-01] — files: `tests/verify/05-w3-metrics-efficacy.md`, as-built rows — exit: smoke with real tenant history PASS — proof follow verify FILE; evidence `wave-accepted` on tip

---

### Governance alignment

- [x] Slice spec does not contradict ADR-001 (`changes_user_visible_behavior: false`)
- [x] Plan TASK MDC notes and ADR notes for this wave reviewed (BFF handlers/layout; ADR-001 on UI)
- [x] ADR-001 is **Accepted** in `docs/specification/adr/`
- [x] No mock/placeholder metric series in exit proof (REQ-22–25 / CTR-07)
- [x] Prefer single `metrics/route.ts` + query `op` (plan forbids inventing undeclared path folders)

---

### Must update (in the same change as the code — via `/loop-spec`)

- [ ] Product spec — only if observable REQ-22–25 / CTR-07 wording changes (not expected)
- [ ] `docs/specification/as-built/implementation-status.md` — W3 / CAP-G verification row
- [ ] `docs/specification/as-built/Implementation-Status-INIT-GATEFLOW-016.md` — W3 status + notes
- [ ] `tests/README.md` — feature map rows for metrics / efficacy / scorecard
- [ ] Unit verification — pure mappers / empty-state helpers extracted from handlers (mock upstream)
- [ ] Live verification — co-ship `tests/verify/05-w3-metrics-efficacy.md` (human-run at `wave-acceptance`)
- [ ] ADR — no supersede expected
- [ ] Nav — add Metrics for `tenant_admin` in `lib/workspace-nav.ts` + i18n (plan file list omits nav; required for discoverability, same as W1/W2)

---

### Must not

- [ ] Implement against spec wording that contradicts an Accepted ADR without first superseding that ADR
- [ ] Duplicate unit verification assertions in live smoke scripts
- [ ] Assume CTR-07 shapes without fail-closed upstream errors / honest empty states
- [ ] Fold CAP-G into Fleet, Runs, or Initiatives pages
- [ ] Fabricate metric series when tenant has no history
- [ ] Open a branch, commit, push, open a PR, apply labels, or create board issues from this skill
- [ ] Change gateflow routes/schemas (ops is consumer-only)

---

### Verification plan

| Layer        | What it proves                                                | Command (from tests_readme / profile)                        |
| ------------ | ------------------------------------------------------------- | ------------------------------------------------------------ |
| Static check | Formatting, linting, types                                    | `make check`                                                 |
| Unit         | Empty-state / filter helpers; no external I/O                 | `make test`                                                  |
| Live verify  | Four panels vs real gateflow tenant history (human at accept) | `tests/verify/05-w3-metrics-efficacy.md`                     |
| Ground check | Assigned wave REQs satisfied; boundaries respected            | N/A — `/ground-spec` after wave; no Makefile `ground` target |

> P15 applies: live FILE is mandatory. Agent creates it in `/loop-spec`; does
> **not** run it as success. Human runs at `wave-acceptance`.

### Human wave-acceptance (after loop-spec + Draft PR)

When checklist PASS and coding is green, the human at checkpoint
`wave-acceptance`:

- [ ] Run `tests/verify/05-w3-metrics-efficacy.md` against live gateflow
- [ ] Experience all four panels + filters; confirm empty states (no mocks)
- [ ] Signal accept with GitHub label `wave-accepted` on the tip — content skills do **not** apply it
- [ ] Apply tip hygiene for any hotfixes before Pass-2 closeout

---

### Tracker / PR (read-only context)

- Initiative: INIT-GATEFLOW-016
- Issue: [#24](https://github.com/drivestream-lab/gateflow-ops/issues/24) (EPIC [#20](https://github.com/drivestream-lab/gateflow-ops/issues/20))
- Spec path: `docs/specification/product/INIT-GATEFLOW-016-gateflow-ops.md`
- Verify command (human): `tests/verify/05-w3-metrics-efficacy.md`
- ADRs in scope: ADR-001
- Wave head: bound by Forge/human context — `develop` (cut `feature/INIT-GATEFLOW-016-w3-*` for coding publish)

---

### Checklist publish readiness (on `pass` — fill handoff.forge commit_workspace)

| Field            | Value                                                                                                 |
| ---------------- | ----------------------------------------------------------------------------------------------------- |
| Workflow outcome | `pass` — W3 gates satisfied                                                                           |
| Next             | `loop-spec` (`skill`) — `external_action: false`                                                      |
| Forge (this hop) | `commit_workspace` **required** — publish `Pre-Implement-INIT-GATEFLOW-016-W3.md` to bound `head_ref` |
| Later            | After `/loop-spec`, `wave-pr-action` opens Draft PR (checklist + code already on tip)                 |

Recommend `/commit-workspace` after explicit authorization. Do not open the PR here.

---

### Merge order (if cross-module / cross-service)

1. W0–W2 merged + `human_approved` (shell, fleet, runs, initiatives).
2. W3 CAP-G on new feature branch from `develop` → Draft PR → `wave-accepted` → human merge.
3. Gateflow remains provider-only (CTR-07 unchanged consumer).
4. Metrics stay on `/metrics`; do not embed CAP-C/CAP-F controls.

```yaml
handoff:
  contract: sdd-delivery/v2
  stage: pre-implement
  outcome: pass
  artifact:
    path: docs/specification/reports/Pre-Implement-INIT-GATEFLOW-016-W3.md
  blockers: []
  signals:
    wave: W3
    initiative: INIT-GATEFLOW-016
    board_issue: https://github.com/drivestream-lab/gateflow-ops/issues/24
    epic_issue: https://github.com/drivestream-lab/gateflow-ops/issues/20
    tasks:
      - TASK-W3-01
      - TASK-W3-02
    assigned_reqs:
      - REQ-22
      - REQ-23
      - REQ-24
      - REQ-25
    check_command: make check
    test_command: make test
    verify_command: tests/verify/05-w3-metrics-efficacy.md
    ground_command: null
    tip_sha: 460d81829f0bb50636d427c40e006dc368577c5a
    head_ref_hint: feature/INIT-GATEFLOW-016-w3-metrics-efficacy
  next_candidates:
    - loop-spec
  human_checkpoint: false
  external_action: false
  forge:
    action: commit_workspace
    head_ref: develop
    paths:
      - docs/specification/reports/Pre-Implement-INIT-GATEFLOW-016-W3.md
    message: "docs(pre-implement): INIT-GATEFLOW-016 W3 preflight checklist."
```
