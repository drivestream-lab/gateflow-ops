## Pre-implement — gateflow-ops / W2 — Initiative & delivery tracking (CAP-F)

| Field | Value |
|-------|-------|
| Artifact | `docs/specification/reports/Pre-Implement-INIT-GATEFLOW-016-W2.md` |
| Initiative | INIT-GATEFLOW-016 |
| Wave | W2 |
| Date | 2026-08-13 |
| Outcome | `pass` |
| Outcome reason | W1 Ground Report + as-built `human_approved`; spec PR #19 merged with `spec-lgtm`; board W2 #23 seeded with TASK-W2-01/02; WorkManifest contract pass; P15 live path and commands resolved |
| Wave head context | Bound by Forge/human context: `develop` @ `221a03bea895d50f1d3b4e033a64ad2c3ee4d0da` — not opened by this skill; coding should cut `feature/INIT-GATEFLOW-016-w2-*` from develop before `/loop-spec` publish |

---

### Gate check (prior wave)

> Complete this before reading anything else. Do not proceed if the gate fails.
> Board / branch / PR checks are **read-only**. Do not create tickets or open
> a branch from this skill — emit Forge readiness instead.

| Item | Required | Status |
|------|----------|--------|
| Branch context (read-only) | Bound head is `develop` or `feature/INIT-*-w{N}-*` — not open `chore/*-spec-*` | [x] ok — `develop` |
| Spec PR merged | Implementation plan on integration branch | [x] yes — PR #19 MERGED; plan on `develop` |
| Coding-readiness at merge | Merged spec PR had `spec-lgtm` on head | [x] verified — label on PR #19 |
| Board seed (read-only) | Wave issue(s) from plan §9 exist; TASK ids present in wave body | [x] seeded — [#23](https://github.com/drivestream-lab/gateflow-ops/issues/23) under EPIC [#20](https://github.com/drivestream-lab/gateflow-ops/issues/20); TASK-W2-01, TASK-W2-02 in body |
| WorkManifest contract | `prayog/v1` §9 passes `scripts/workmanifest_contract.py` | [x] pass |
| TASK exit proof | Every wave `TASK-*` has `exit.criteria` + `exit.proof` (kind/expected/evidence_expected) | [x] complete |
| Live-verification contract | When P15 applies: `verification.live` applicable + script under `live_verify_dir` | [x] contract — `tests/verify/04-w2-initiative-tracking.md` (create in TASK-W2-02) |
| Plan source freshness | all upstream rows `CURRENT` | [x] current |
| Impact-map repo scope | revision and scope digest match canonical handoff | [x] match — H3 rev `1`; H2 `sha256:4daa0360…`; product-spec H1–H3 align |
| `check_command` | resolved | [x] `make check` |
| `test_command` | resolved | [x] `make test` |
| `verify_command` | live script under `live_verify_dir` when P15 applies | [x] `tests/verify/04-w2-initiative-tracking.md` |
| `ground_command` | resolved or N/A with reason | [x] N/A — no Makefile ground target; `/ground-spec` after wave uses as-built |
| Co-shipped live verify (P15) | If wave adds/changes product surface: FILE path under `live_verify_dir` listed | [x] `tests/verify/04-w2-initiative-tracking.md` |
| Prior wave as-built row | `human_approved` (from prior `wave-acceptance`) | [x] W1 = `human_approved` |
| Prior Ground Report exists | `reports/Ground-Report-{SPEC}-W{N-1}.md` | [x] exists — `Ground-Report-INIT-GATEFLOW-016-W1.md` |
| Plan PE sign-off (W0 only) | Implementation-Plan §0 marked complete | [x] N/A — W2 |

**Gate verdict:** PASS

**Forge readiness (when seed / wave head absent):** N/A — board seeded; head context is integration `develop`. Publish checklist via `commit_workspace` onto bound wave head before `/loop-spec`.

---

### Contracts consumed (from prior Ground Report)

> Read `Ground-Report-INIT-GATEFLOW-016-W1.md` §Contracts produced.
> Confirmed against `source_roots` on `develop` @ `221a03b…`.

| Assumed contract | Entry point | Input shape | Output shape | Source | Confirmed? |
|-----------------|-------------|-------------|--------------|--------|------------|
| Wave start BFF | `app/api/gateflow/waves` POST `?lane=` | lane + start body | `{ runId, jobId, status }` | Ground-Report-W1 | [x] yes — present; W2 may deep-link from initiative → run |
| Runs list BFF | `app/api/gateflow/runs` GET | filters + pagination | `{ items[], limit, skip }` | Ground-Report-W1 | [x] yes |
| Run detail BFF | `app/api/gateflow/runs/by-id` GET `?run_id=` | run id | header + stages/events | Ground-Report-W1 | [x] yes |
| Forge authorize BFF | `app/api/gateflow/runs/forge` POST | authorize body | action ack | Ground-Report-W1 | [x] yes — optional from initiative UI; do not re-implement |
| Stop presentation helper | `hooks/use-runs` `classifyRunStopPresentation` | status + outcome | presentation enum | Ground-Report-W1 | [x] yes — reuse if initiative surfaces run status |
| Runs cockpit UI | `/runs` + RunCockpit | tenant_admin | CAP-C surfaces | Ground-Report-W1 | [x] yes — keep Initiatives separate nav/page |
| Workspace shell + authFetch chassis | W0/W1 | session cookie | shell + relative `/api/*` | Ground-Report-W0/W1 | [x] yes |

**Unconfirmed contracts** (no Ground Report backing — live gateflow only):

- **CTR-06** gateflow initiatives list/detail/waves/readouts/completion/closure/start HTTP shapes — consume product-spec CTR-06 + live upstream; fail closed; honest empty/gap states (no fabricated board/GitHub fields).
- Closure start **202** enqueue semantics — verify against live gateflow; surface accepted enqueue without inventing run rows.

---

### Must read

- [x] `AGENTS.md`
- [x] MDC rules (domain-filtered — list files read for this slice's domains):
  - [x] `nextjs-bff-server-auth.mdc` — session cookie, `authFetch`, server-only upstream
  - [x] `nextjs-bff-route-handlers.mdc` — BFF logging/errors/upstream
  - [x] `nextjs-repository-layout.mdc` — BFF by upstream (`gateflow/`); UI by workflow (`/initiatives`)
  - [x] `nextjs-app-router-stack.mdc` — App Router, TanStack Query, RSC vs client
  - [x] `workspace-page-layout.mdc` — WorkspaceShell slots for initiative hub
  - [x] `no-hardcoded-strings.mdc` — `data/locales/en/initiatives.json`
  - [x] `typescript-react-style.mdc` — `"use client"` at leaves
  - [x] `tailwind-design-tokens.mdc` — semantic tokens
  - [x] `client-forms-patterns.mdc` — closure start action
  - [x] `testing-verify-flows.mdc` — unit vs live; no-overlap
  - [x] `shared-limits-pagination.mdc` — list limits via `@/lib/constants`
  - [x] `spec-driven-development.mdc` — same-PR as-built/tests
  - [ ] skipped: `documentation-project-guidance.mdc`, `code-guidelines-index.mdc` — index/meta only
- [x] ADRs (keyword-matched — list ids):
  - [x] ADR-001 — shadcn + semantic tokens for CAP-F UI (REQ-13–21 composition mechanism)
- [x] Spec: `docs/specification/product/INIT-GATEFLOW-016-gateflow-ops.md` (REQ-13–21, CTR-06)
- [x] Plan wave section / §9 WorkManifest: `docs/specification/reports/Implementation-Plan-INIT-GATEFLOW-016.md` W2
- [x] Board wave issue: https://github.com/drivestream-lab/gateflow-ops/issues/23 — TASK list (projected from WorkManifest; not a second authority):
  - [x] TASK-W2-01 — implements REQ-13…21 — depends_on: [] — files: `app/api/gateflow/initiatives/route.ts`, `initiatives/by-id/route.ts`, `components/initiatives/initiative-hub.tsx`, `hooks/use-initiatives.ts`, `app/(dashboard)/initiatives/page.tsx`, `data/locales/en/initiatives.json` — exit: list/detail/readouts with honest gaps; closure start accepted enqueue — proof `make check && make test`
  - [x] TASK-W2-02 — implements REQ-13…21 — depends_on: [TASK-W2-01] — files: `tests/verify/04-w2-initiative-tracking.md`, as-built rows — exit: smoke vs initiative + board EPIC + run history PASS — proof follow verify FILE; evidence `wave-accepted` on tip

---

### Governance alignment

- [x] Slice spec does not contradict ADR-001 (`changes_user_visible_behavior: false`)
- [x] Plan TASK MDC notes and ADR notes for this wave reviewed (BFF handlers/layout; ADR-001 on UI)
- [x] ADR-001 is **Accepted** in `docs/specification/adr/`
- [x] Display gateflow composition as-is; never invent board/GitHub fields (REQ-13–21 negatives)
- [x] Prefer `by-id` + query params for initiative id (same pattern as W1 runs) — WorkManifest path `initiatives/by-id/route.ts`

---

### Must update (in the same change as the code — via `/loop-spec`)

- [ ] Product spec — only if observable REQ-13–21 / CTR-06 wording changes (not expected)
- [ ] `docs/specification/as-built/implementation-status.md` — W2 / CAP-F verification row
- [ ] `docs/specification/as-built/Implementation-Status-INIT-GATEFLOW-016.md` — W2 status + notes
- [ ] `tests/README.md` — feature map rows for initiatives / readouts / closure
- [ ] Unit verification — pure mappers / gap-status helpers extracted from handlers (mock upstream)
- [ ] Live verification — co-ship `tests/verify/04-w2-initiative-tracking.md` (human-run at `wave-acceptance`)
- [ ] ADR — no supersede expected
- [ ] Nav — add Initiatives for `tenant_admin` in `lib/workspace-nav.ts` + i18n (plan file list omits nav; required for discoverability, same as W1 Runs)

---

### Must not

- [ ] Implement against spec wording that contradicts ADR-001 without superseding it
- [ ] Duplicate unit assertions in live smoke scripts
- [ ] Assume CTR-06 field shapes without fail-closed handling
- [ ] Open a branch, commit, push, open a PR, apply labels, or create board issues from this skill
- [ ] Call upstream from the browser; store upstream JWT in `localStorage`
- [ ] Fabricate initiative/wave/board fields when gateflow composition has gaps
- [ ] Fold CAP-F into Fleet or Runs pages as the only surface — Initiatives is its own workflow
- [ ] Change gateflow routes/schemas/contracts
- [ ] Re-implement wave-start/forge on the Initiatives page beyond optional deep-links to `/runs`

---

### Verification plan

| Layer | What it proves | Command (from tests_readme / profile) |
|-------|----------------|---------------------------------------|
| Static check | Formatting, linting, types, or equivalent repository checks | `make check` |
| Unit | Module logic, boundary behaviour, edge cases (no external I/O) | `make test` |
| Live verify | Product behaviour on running stack (human-run at `wave-acceptance`) | `tests/verify/04-w2-initiative-tracking.md` — P15 new surfaces |
| Ground check | Assigned wave REQs satisfied; boundaries respected | N/A — `/ground-spec` after accept uses as-built |

> P15 applies: live path is mandatory. Agent implements the script in `/loop-spec`; does **not** run it as success.
> Prerequisites (from plan): `AUTH_MODE=jwt-upstream`; `UPSTREAM_BASE_URL` → live gateflow; TENANT_ADMIN; initiative with board EPIC + run history when available.

### Human wave-acceptance (after loop-spec + Draft PR)

When checklist PASS and coding is green, the human at checkpoint
`wave-acceptance`:

- [ ] Run `tests/verify/04-w2-initiative-tracking.md` against live gateflow
- [ ] Experience list/detail/readouts/closure to the depth env allows; confirm honest gaps
- [ ] Signal accept with GitHub label `wave-accepted` on the tip — content skills do **not** apply it
- [ ] Apply tip hygiene for any hotfixes before Pass-2 closeout

---

### Tracker / PR (read-only context)

- Initiative: INIT-GATEFLOW-016
- Issue: [#23](https://github.com/drivestream-lab/gateflow-ops/issues/23) (EPIC [#20](https://github.com/drivestream-lab/gateflow-ops/issues/20))
- Spec path: `docs/specification/product/INIT-GATEFLOW-016-gateflow-ops.md`
- Verify command (human): `tests/verify/04-w2-initiative-tracking.md`
- ADRs in scope: ADR-001
- Wave head: bound by Forge/human context — `develop` (cut `feature/INIT-GATEFLOW-016-w2-*` for coding publish)

---

### Checklist publish readiness (on `pass` — fill handoff.forge commit_workspace)

| Field | Value |
|-------|-------|
| Workflow outcome | `pass` — W2 gates satisfied |
| Next | `loop-spec` (`skill`) — `external_action: false` |
| Forge (this hop) | `commit_workspace` **required** — publish `Pre-Implement-INIT-GATEFLOW-016-W2.md` to bound `head_ref` |
| Later | After `/loop-spec`, `wave-pr-action` opens Draft PR (checklist + code already on tip) |

Recommend `/commit-workspace` after explicit authorization. Do not open the PR here.

---

### Merge order (if cross-module / cross-service)

1. W0 + W1 merged + `human_approved` (shell, fleet, runs/waves).
2. W2 CAP-F on new feature branch from `develop` → Draft PR → `wave-accepted` → human merge.
3. Gateflow remains provider-only (CTR-06 unchanged consumer).
4. Optional deep-links from Initiatives → `/runs` reuse W1 contracts; do not duplicate CAP-C.

```yaml
handoff:
  contract: sdd-delivery/v2
  stage: pre-implement
  outcome: pass
  artifact:
    path: docs/specification/reports/Pre-Implement-INIT-GATEFLOW-016-W2.md
  blockers: []
  signals:
    wave: W2
    initiative: INIT-GATEFLOW-016
    board_issue: https://github.com/drivestream-lab/gateflow-ops/issues/23
    epic_issue: https://github.com/drivestream-lab/gateflow-ops/issues/20
    tasks:
      - TASK-W2-01
      - TASK-W2-02
    assigned_reqs:
      - REQ-13
      - REQ-14
      - REQ-15
      - REQ-16
      - REQ-17
      - REQ-18
      - REQ-19
      - REQ-20
      - REQ-21
    check_command: make check
    test_command: make test
    verify_command: tests/verify/04-w2-initiative-tracking.md
    ground_command: null
    tip_sha: 221a03bea895d50f1d3b4e033a64ad2c3ee4d0da
    head_ref_hint: feature/INIT-GATEFLOW-016-w2-initiative-tracking
  next_candidates:
    - loop-spec
  human_checkpoint: false
  external_action: false
  forge:
    action: commit_workspace
    head_ref: develop
    paths:
      - docs/specification/reports/Pre-Implement-INIT-GATEFLOW-016-W2.md
    message: "docs(pre-implement): INIT-GATEFLOW-016 W2 preflight checklist."
```
