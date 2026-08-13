## Pre-implement — gateflow-ops / W4 — Checkpoints & board tickets (CAP-D/E)

| Field             | Value                                                                                                                                                                                                        |
| ----------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Artifact          | `docs/specification/reports/Pre-Implement-INIT-GATEFLOW-016-W4.md`                                                                                                                                           |
| Initiative        | INIT-GATEFLOW-016                                                                                                                                                                                            |
| Wave              | W4                                                                                                                                                                                                           |
| Date              | 2026-08-13                                                                                                                                                                                                   |
| Outcome           | `pass`                                                                                                                                                                                                       |
| Outcome reason    | W3 Ground Report + as-built `human_approved`; spec PR #19 merged with `spec-lgtm`; board W4 #25 seeded with TASK-W4-01/02/03; WorkManifest contract pass; P15 live path and commands resolved                |
| Wave head context | Bound by Forge/human context: `develop` @ `a5fcb0bfede2b1e68beb5052312a42e267633a23` — not opened by this skill; coding should cut `feature/INIT-GATEFLOW-016-w4-*` from develop before `/loop-spec` publish |

---

### Gate check (prior wave)

> Complete this before reading anything else. Do not proceed if the gate fails.
> Board / branch / PR checks are **read-only**. Do not create tickets or open
> a branch from this skill — emit Forge readiness instead.

| Item                         | Required                                                                                 | Status                                                                                                                                                                           |
| ---------------------------- | ---------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Branch context (read-only)   | Bound head is `develop` or `feature/INIT-*-w{N}-*` — not open `chore/*-spec-*`           | [x] ok — `develop`                                                                                                                                                               |
| Spec PR merged               | Implementation plan on integration branch                                                | [x] yes — PR #19 MERGED; plan on `develop`                                                                                                                                       |
| Coding-readiness at merge    | Merged spec PR had `spec-lgtm` on head                                                   | [x] verified — label on PR #19                                                                                                                                                   |
| Board seed (read-only)       | Wave issue(s) from plan §9 exist; TASK ids present in wave body                          | [x] seeded — [#25](https://github.com/drivestream-lab/gateflow-ops/issues/25) under EPIC [#20](https://github.com/drivestream-lab/gateflow-ops/issues/20); TASK-W4-01…03 in body |
| WorkManifest contract        | `prayog/v1` §9 passes `scripts/workmanifest_contract.py`                                 | [x] pass — `prayog-skills/scripts/workmanifest_contract.py`                                                                                                                      |
| TASK exit proof              | Every wave `TASK-*` has `exit.criteria` + `exit.proof` (kind/expected/evidence_expected) | [x] complete                                                                                                                                                                     |
| Live-verification contract   | When P15 applies: `verification.live` applicable + script under `live_verify_dir`        | [x] contract — `tests/verify/06-w4-checkpoints-board.md` (create in TASK-W4-03)                                                                                                  |
| Plan source freshness        | all upstream rows `CURRENT`                                                              | [x] current                                                                                                                                                                      |
| Impact-map repo scope        | revision and scope digest match canonical handoff                                        | [x] match — H3 rev `1`; H2 `sha256:4daa0360…`; product-spec H1–H3 align                                                                                                          |
| `check_command`              | resolved                                                                                 | [x] `make check`                                                                                                                                                                 |
| `test_command`               | resolved                                                                                 | [x] `make test`                                                                                                                                                                  |
| `verify_command`             | live script under `live_verify_dir` when P15 applies                                     | [x] `tests/verify/06-w4-checkpoints-board.md`                                                                                                                                    |
| `ground_command`             | resolved or N/A with reason                                                              | [x] N/A — no Makefile ground target; `/ground-spec` after wave uses as-built                                                                                                     |
| Co-shipped live verify (P15) | If wave adds/changes product surface: FILE path under `live_verify_dir` listed           | [x] `tests/verify/06-w4-checkpoints-board.md`                                                                                                                                    |
| Prior wave as-built row      | `human_approved` (from prior `wave-acceptance`)                                          | [x] W3 = `human_approved`                                                                                                                                                        |
| Prior Ground Report exists   | `reports/Ground-Report-{SPEC}-W{N-1}.md`                                                 | [x] exists — `Ground-Report-INIT-GATEFLOW-016-W3.md`                                                                                                                             |
| Plan PE sign-off (W0 only)   | Implementation-Plan §0 marked complete                                                   | [x] N/A — W4                                                                                                                                                                     |

**Gate verdict:** PASS

**Forge readiness (when seed / wave head absent):** N/A — board seeded; head context is integration `develop`. Publish checklist via `commit_workspace` onto bound wave head before `/loop-spec`.

---

### Contracts consumed (from prior Ground Report)

> Read `Ground-Report-INIT-GATEFLOW-016-W3.md` §Contracts produced.
> Confirmed against `source_roots` on `develop` @ `a5fcb0b…`.

| Assumed contract                    | Entry point                                | Input shape    | Output shape                 | Source              | Confirmed?                                                                 |
| ----------------------------------- | ------------------------------------------ | -------------- | ---------------------------- | ------------------- | -------------------------------------------------------------------------- |
| Workspace shell + authFetch chassis | W0 / layout + `authFetch`                  | session cookie | shell + relative `/api/*`    | Ground-Report-W0    | [x] yes                                                                    |
| Session → BFF → upstream            | Route Handlers + `upstreamFetch`           | tenant session | mapped JSON / BFF errors     | Ground-Report-W0    | [x] yes                                                                    |
| Metrics BFF / panels                | `app/api/gateflow/metrics` + `/metrics`    | op + filters   | `{ op, data }` / four panels | Ground-Report-W3    | [x] yes — present; **CAP-D/E must not fold into Metrics**                  |
| Empty-series helper                 | `hooks/use-metrics` `isMetricsSeriesEmpty` | op + payload   | boolean                      | Ground-Report-W3    | [x] yes — pattern reference only; checkpoints use named no-run / not-found |
| Runs / Initiatives surfaces         | `/runs`, `/initiatives`                    | tenant_admin   | CAP-C / CAP-F                | Ground-Report-W1/W2 | [x] yes — keep Checkpoints and Board as **separate** nav/pages             |

**Unconfirmed contracts** (no Ground Report backing — live gateflow only):

- **CTR-04** checkpoint HTTP shapes — consume product-spec CTR-04 + live upstream:
  - `GET /api/v1/checkpoints/status` — raw (`owner`/`repo`/`pr_number`) **or** composed (`initiative_id`/`wave_id`) + `checkpoint_id`; composed with no run → named **no run found for this wave** (never fabricate status)
  - `GET /api/v1/checkpoints/history` — `owner`/`repo`/`pr_number` (+ optional `checkpoint_id`, pagination); missing → named not-found/empty
- **CTR-05** board HTTP shapes — consume product-spec CTR-05 + live upstream:
  - `GET /api/v1/board/tickets` — **org/repo required**; optional initiative/type/state
  - `POST /api/v1/board/tickets` — create EPIC/Feature; idempotent on `initiative_id`+type
  - `PATCH /api/v1/board/tickets/{id}/status`
  - `POST /api/v1/board/tickets/{id}/links`
- Prefer single BFF files per WorkManifest (`checkpoints/route.ts`, `board/route.ts`) with `?op=` (or method+op) — do not invent undeclared path folders.

---

### Must read

- [x] `AGENTS.md`
- [x] MDC rules (domain-filtered — list files read for this slice's domains):
  - [x] `nextjs-bff-server-auth.mdc` — session cookie, `authFetch`, server-only upstream
  - [x] `nextjs-bff-route-handlers.mdc` — BFF logging/errors/upstream
  - [x] `nextjs-repository-layout.mdc` — BFF by upstream (`gateflow/`); UI by workflow (`/checkpoints`, `/board`)
  - [x] `nextjs-app-router-stack.mdc` — App Router, TanStack Query, RSC vs client
  - [x] `workspace-page-layout.mdc` — WorkspaceShell slots
  - [x] `no-hardcoded-strings.mdc` — `checkpoints.json` / `board.json`
  - [x] `typescript-react-style.mdc` — `"use client"` at leaves
  - [x] `tailwind-design-tokens.mdc` — semantic tokens
  - [x] `client-forms-patterns.mdc` — create/status/link actions
  - [x] `testing-verify-flows.mdc` — unit vs live; no-overlap
  - [x] `shared-limits-pagination.mdc` — history/list limits via `@/lib/constants`
  - [x] `spec-driven-development.mdc` — same-PR as-built/tests
  - [ ] skipped: `documentation-project-guidance.mdc`, `code-guidelines-index.mdc` — index/meta only
- [x] ADRs (keyword-matched — list ids):
  - [x] ADR-001 — shadcn + semantic tokens for CAP-D/E UI (REQ-26–31)
- [x] Spec: `docs/specification/product/INIT-GATEFLOW-016-gateflow-ops.md` (REQ-26–31, CTR-04, CTR-05)
- [x] Plan wave section / §9 WorkManifest: `docs/specification/reports/Implementation-Plan-INIT-GATEFLOW-016.md` W4
- [x] Board wave issue: https://github.com/drivestream-lab/gateflow-ops/issues/25 — TASK list (projected from WorkManifest; not a second authority):
  - [x] TASK-W4-01 — implements REQ-26, REQ-27 — depends_on: [] — files: checkpoints BFF/UI/i18n — exit: status/history; named no-run — proof `make check && make test`
  - [x] TASK-W4-02 — implements REQ-28…31 — depends_on: [TASK-W4-01] — files: board BFF/UI/i18n — exit: list/create/status/link; create idempotent — proof `make check && make test`
  - [x] TASK-W4-03 — implements REQ-26…31 — depends_on: [TASK-W4-01, TASK-W4-02] — files: verify FILE + as-built — exit: smoke PASS — proof follow verify FILE; evidence `wave-accepted` on tip

---

### Governance alignment

- [x] Slice spec does not contradict ADR-001
- [x] Plan TASK MDC notes and ADR notes for this wave reviewed
- [x] ADR-001 is **Accepted** in `docs/specification/adr/`
- [x] Never fabricate checkpoint status/history (REQ-26/27 negatives)
- [x] Board list requires org/repo; create idempotent on initiative_id+type (REQ-28/29)
- [x] Prefer `route.ts` + query `op` (plan forbids inventing undeclared folders)

---

### Must update (in the same change as the code — via `/loop-spec`)

- [ ] Product spec — only if observable REQ-26–31 / CTR-04/05 wording changes (not expected)
- [ ] `docs/specification/as-built/implementation-status.md` — W4 verification row
- [ ] `docs/specification/as-built/Implementation-Status-INIT-GATEFLOW-016.md` — W4 status + notes
- [ ] `tests/README.md` — feature map rows for checkpoints + board
- [ ] Unit verification — no-run / not-found / idempotency helpers (mock upstream)
- [ ] Live verification — co-ship `tests/verify/06-w4-checkpoints-board.md` (human-run at `wave-acceptance`)
- [ ] ADR — no supersede expected
- [ ] Nav — add Checkpoints + Board for `tenant_admin` in `lib/workspace-nav.ts` + i18n (plan file list omits nav; required for discoverability, same as prior waves)

---

### Must not

- [ ] Implement against spec wording that contradicts an Accepted ADR without first superseding that ADR
- [ ] Duplicate unit verification assertions in live smoke scripts
- [ ] Fabricate checkpoint status when composed ref has no run
- [ ] Fold CAP-D/E into Fleet, Runs, Initiatives, or Metrics pages
- [ ] Open a branch, commit, push, open a PR, apply labels, or create board issues from this skill
- [ ] Change gateflow routes/schemas (ops is consumer-only)

---

### Verification plan

| Layer        | What it proves                                            | Command                                             |
| ------------ | --------------------------------------------------------- | --------------------------------------------------- |
| Static check | Formatting, linting, types                                | `make check`                                        |
| Unit         | no-run / not-found / idempotency helpers; no external I/O | `make test`                                         |
| Live verify  | Checkpoints + board vs real gateflow (human at accept)    | `tests/verify/06-w4-checkpoints-board.md`           |
| Ground check | Assigned wave REQs satisfied; boundaries respected        | N/A — `/ground-spec` after wave; no Makefile ground |

> P15 applies: live FILE is mandatory. Agent creates it in `/loop-spec`; does
> **not** run it as success. Human runs at `wave-acceptance`.

### Human wave-acceptance (after loop-spec + Draft PR)

When checklist PASS and coding is green, the human at checkpoint
`wave-acceptance`:

- [ ] Run `tests/verify/06-w4-checkpoints-board.md` against live gateflow
- [ ] Exercise status/history + board list/create/status/link; confirm named no-run / not-found
- [ ] Signal accept with GitHub label `wave-accepted` on the tip — content skills do **not** apply it
- [ ] Apply tip hygiene for any hotfixes before Pass-2 closeout

---

### Tracker / PR (read-only context)

- Initiative: INIT-GATEFLOW-016
- Issue: [#25](https://github.com/drivestream-lab/gateflow-ops/issues/25) (EPIC [#20](https://github.com/drivestream-lab/gateflow-ops/issues/20))
- Spec path: `docs/specification/product/INIT-GATEFLOW-016-gateflow-ops.md`
- Verify command (human): `tests/verify/06-w4-checkpoints-board.md`
- ADRs in scope: ADR-001
- Wave head: bound by Forge/human context — `develop` (cut `feature/INIT-GATEFLOW-016-w4-*` for coding publish)

---

### Checklist publish readiness (on `pass` — fill handoff.forge commit_workspace)

| Field            | Value                                                                                                 |
| ---------------- | ----------------------------------------------------------------------------------------------------- |
| Workflow outcome | `pass` — W4 gates satisfied                                                                           |
| Next             | `loop-spec` (`skill`) — `external_action: false`                                                      |
| Forge (this hop) | `commit_workspace` **required** — publish `Pre-Implement-INIT-GATEFLOW-016-W4.md` to bound `head_ref` |
| Later            | After `/loop-spec`, `wave-pr-action` opens Draft PR (checklist + code already on tip)                 |

Recommend `/commit-workspace` after explicit authorization. Do not open the PR here.

---

### Merge order (if cross-module / cross-service)

1. W0–W3 merged + `human_approved` (shell through metrics).
2. W4 CAP-D/E on new feature branch from `develop` → Draft PR → `wave-accepted` → human merge.
3. Gateflow remains provider-only (CTR-04/05 unchanged consumers).
4. Checkpoints and Board stay on `/checkpoints` and `/board`; do not embed CAP-C/F/G controls.
5. W4 is the final product wave for this initiative’s CAP-A–G delivery package (initiative closure is a separate programme hop).

```yaml
handoff:
  contract: sdd-delivery/v2
  stage: pre-implement
  outcome: pass
  artifact:
    path: docs/specification/reports/Pre-Implement-INIT-GATEFLOW-016-W4.md
  blockers: []
  signals:
    wave: W4
    initiative: INIT-GATEFLOW-016
    board_issue: https://github.com/drivestream-lab/gateflow-ops/issues/25
    epic_issue: https://github.com/drivestream-lab/gateflow-ops/issues/20
    tasks:
      - TASK-W4-01
      - TASK-W4-02
      - TASK-W4-03
    assigned_reqs:
      - REQ-26
      - REQ-27
      - REQ-28
      - REQ-29
      - REQ-30
      - REQ-31
    check_command: make check
    test_command: make test
    verify_command: tests/verify/06-w4-checkpoints-board.md
    ground_command: null
    tip_sha: a5fcb0bfede2b1e68beb5052312a42e267633a23
    head_ref_hint: feature/INIT-GATEFLOW-016-w4-checkpoints-board
  next_candidates:
    - loop-spec
  human_checkpoint: false
  external_action: false
  forge:
    action: commit_workspace
    head_ref: develop
    paths:
      - docs/specification/reports/Pre-Implement-INIT-GATEFLOW-016-W4.md
    message: "docs(pre-implement): INIT-GATEFLOW-016 W4 preflight checklist."
```
