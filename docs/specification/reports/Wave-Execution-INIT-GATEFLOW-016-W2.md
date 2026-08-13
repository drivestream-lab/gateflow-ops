# Wave execution — INIT-GATEFLOW-016 W2

| Field               | Value                                                                    |
| ------------------- | ------------------------------------------------------------------------ |
| Initiative          | INIT-GATEFLOW-016                                                        |
| Wave                | W2                                                                       |
| Wave head context   | Bound by Forge/human: `feature/INIT-GATEFLOW-016-w2-initiative-tracking` |
| Board issue         | https://github.com/drivestream-lab/gateflow-ops/issues/23                |
| WorkManifest source | plan §9 (immutable intent — not mutated)                                 |
| Outcome             | pass                                                                     |

## Completed TASKS

| TASK       | Implements                                                             | Declared files                                                                              | Proof expected (manifest) | Observed (command / evidence)                      | Status |
| ---------- | ---------------------------------------------------------------------- | ------------------------------------------------------------------------------------------- | ------------------------- | -------------------------------------------------- | ------ |
| TASK-W2-01 | REQ-13, REQ-14, REQ-15, REQ-16, REQ-17, REQ-18, REQ-19, REQ-20, REQ-21 | initiatives BFF, by-id, initiative-hub, use-initiatives, initiatives page, initiatives.json | exit 0; assertions green  | `make check` exit 0; `make test` exit 0 (43 tests) | green  |
| TASK-W2-02 | REQ-13, REQ-14, REQ-15, REQ-16, REQ-17, REQ-18, REQ-19, REQ-20, REQ-21 | `tests/verify/04-w2-initiative-tracking.md`, as-built rows, tests README                    | live FILE created         | FILE present; as-built + feature map updated       | green  |

## Live verify (human — not claimed here)

- Planned script: `tests/verify/04-w2-initiative-tracking.md` under `tests/verify`
- Agent created planned FILE: **yes** — **did not** run smoke/sandbox as success
- Prerequisites: `AUTH_MODE=jwt-upstream`; live `UPSTREAM_BASE_URL`; TENANT_ADMIN; initiative with board EPIC + run history

## Notes

- Supporting (outside strict WorkManifest file list, required for discoverability/i18n/unit): `lib/workspace-nav.ts`, `data/locales/en/workspace.json`, `lib/i18n.ts` initiatives catalog, `tests/unit/initiative-composition.test.ts`, nav expectations in `platform-programmes.test.ts`
- List BFF: `GET /api/gateflow/initiatives?org=&repo=`
- Closure start: `POST /api/gateflow/initiatives?op=closure-start` → upstream 202 enqueue
- Detail/readouts: `GET /api/gateflow/initiatives/by-id?initiative_id=&op=&org=&repo=&wave_id=`
- Composition gaps labeled empty/unavailable — no invented board/GitHub fields
- CAP-P verify `03-platform-programme-onboard.md` and W1 `03-w1-wave-operations.md` unchanged; W2 live FILE is `04-w2-initiative-tracking.md`

## Forge readiness

- After this hop: `commit_workspace` (code on bound `head_ref`)
- Next external-action: `open_draft_pr` / `wave-pr-action`
  - title: `[INIT-GATEFLOW-016 W2] Initiative tracking`
  - body_path: `docs/specification/reports/Wave-Execution-INIT-GATEFLOW-016-W2.md`
  - head_ref: `feature/INIT-GATEFLOW-016-w2-initiative-tracking`
  - base_ref: `develop`

---

```yaml
handoff:
  contract: sdd-delivery/v2
  stage: loop-spec
  outcome: pass
  artifact:
    path: docs/specification/reports/Wave-Execution-INIT-GATEFLOW-016-W2.md
  blockers: []
  signals:
    initiative: INIT-GATEFLOW-016
    wave: W2
    wave_issue: https://github.com/drivestream-lab/gateflow-ops/issues/23
    completed_tasks:
      - TASK-W2-01
      - TASK-W2-02
    implements:
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
    head_ref: feature/INIT-GATEFLOW-016-w2-initiative-tracking
    base_ref: develop
  next_candidates:
    - wave-pr-action
  human_checkpoint: false
  external_action: true
  forge:
    action: open_draft_pr
    draft: true
    title: "[INIT-GATEFLOW-016 W2] Initiative tracking"
    body_path: docs/specification/reports/Wave-Execution-INIT-GATEFLOW-016-W2.md
    head_ref: feature/INIT-GATEFLOW-016-w2-initiative-tracking
    base_ref: develop
```
