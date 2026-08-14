# Wave execution — INIT-GATEFLOW-017 W3

| Field               | Value                                                                |
| ------------------- | -------------------------------------------------------------------- |
| Initiative          | INIT-GATEFLOW-017                                                    |
| Wave                | W3                                                                   |
| Wave head context   | Bound by Forge/human: `feature/INIT-GATEFLOW-017-w3-programme-enter` |
| Board issue         | https://github.com/drivestream-lab/gateflow-ops/issues/37            |
| WorkManifest source | plan §9 (immutable intent — not mutated)                             |
| Outcome             | pass                                                                 |

## Completed TASKS

| TASK       | Implements                                                     | Declared files                                                                                                                                                                                                                                       | Proof expected (manifest)      | Observed (command / evidence)                                                                              | Status |
| ---------- | -------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------ | ---------------------------------------------------------------------------------------------------------- | ------ |
| TASK-W3-01 | REQ-16, REQ-17, REQ-18                                         | `app/api/auth/programme/route.ts` create                                                                                                                                                                                                             | exit 0; assertions green       | `make check` exit 0; `make test` exit 0 (79 tests)                                                         | green  |
| TASK-W3-02 | REQ-16, REQ-19, REQ-23                                         | delivery BFF (`programme`, `runs`, `runs/by-id`, `runs/forge`, `waves`, `initiatives`, `initiatives/by-id`, `metrics`, `checkpoints`, `board`, `tenants`) + RSC (`fleet`, `runs`, `initiatives`, `metrics`, `checkpoints`, `board`, `tenant`) modify | exit 0; assertions green       | `make check` exit 0; `make test` exit 0 (79 tests); handlers use helper; `null` → `*.errors.missingTenant` | green  |
| TASK-W3-03 | REQ-16, REQ-18, REQ-22, REQ-26, REQ-27                         | `components/programmes/programme-enter.tsx` create; `app/(dashboard)/programmes/enter/page.tsx` create; `data/locales/en/programmes.json` modify; `lib/workspace-nav.ts` modify                                                                      | exit 0; assertions green       | `make check` exit 0; `make test` exit 0 (79 tests)                                                         | green  |
| TASK-W3-04 | REQ-16, REQ-18                                                 | `tests/unit/programme-enter.test.ts` create                                                                                                                                                                                                          | exit 0; assertions green       | `make check` exit 0; `make test` exit 0 — 11 helper/wiring cases; suite 90 tests                           | green  |
| TASK-W3-05 | REQ-16, REQ-17, REQ-18, REQ-19, REQ-22, REQ-23, REQ-26, REQ-27 | `tests/verify/09-programme-enter-delivery.md` create; `docs/specification/as-built/Implementation-Status-INIT-GATEFLOW-017.md` modify; `docs/specification/as-built/implementation-status.md` modify                                                 | human PASS observations (live) | FILE created with `prayog:covers:` W3 live REQs; as-built W3 = `implemented` — **did not** run smoke       | green  |

## Live verify (human — not claimed here)

- Planned script: `tests/verify/09-programme-enter-delivery.md` under `tests/verify`
- Agent created planned FILE: **yes** — **did not** run smoke/sandbox as success
- Prerequisites: CTR-04 live; W2 grants on two programmes; W0 helper present
- Kill line: delivery still reads JWT `tenant_id` or provider rejects identity Bearer → stop

## Notes

- Companion files outside §9 `files[]` (pre-implement flagged): `app/(dashboard)/page.tsx` (entered tenant from helper, not JWT); `data/locales/en/workspace.json` (`nav.enter`); `tests/unit/platform-programmes.test.ts` (nav hrefs); `tests/README.md` feature map
- Format-only wrap on already-published W2/W3 reports so `make check` prettier stays green
- Enter BFF assumed CTR-04 paths `GET /api/v1/grants` (actor list) and `POST /api/v1/programme-context` — fail closed on unexpected fields
- Grant BFF stays `platform_admin` only; enter does not invent grant
- CAP-P `app/api/gateflow/programmes` not migrated (REQ-27)
- 016 `04-w2-initiative-tracking.md` REQ-16 is not 017 enter coverage

## Forge readiness

- After this hop: `commit_workspace` (code on bound `head_ref`)
- Next external-action: `open_draft_pr` / `wave-pr-action`
  - title: `[INIT-GATEFLOW-017 W3] Programme enter and delivery rebind`
  - body_path: `docs/specification/reports/Wave-Execution-INIT-GATEFLOW-017-W3.md`
  - head_ref: `feature/INIT-GATEFLOW-017-w3-programme-enter`
  - base_ref: `develop`

---

```yaml
handoff:
  contract: sdd-delivery/v2
  stage: loop-spec
  outcome: pass
  artifact:
    path: docs/specification/reports/Wave-Execution-INIT-GATEFLOW-017-W3.md
  blockers: []
  signals:
    initiative: INIT-GATEFLOW-017
    wave: W3
    wave_issue: https://github.com/drivestream-lab/gateflow-ops/issues/37
    current_task: null
    completed_tasks:
      - TASK-W3-01
      - TASK-W3-02
      - TASK-W3-03
      - TASK-W3-04
      - TASK-W3-05
    implements:
      - REQ-16
      - REQ-17
      - REQ-18
      - REQ-19
      - REQ-22
      - REQ-23
      - REQ-26
      - REQ-27
    check_command: make check
    test_command: make test
    verify_command: tests/verify/09-programme-enter-delivery.md
    head_ref: feature/INIT-GATEFLOW-017-w3-programme-enter
    base_ref: develop
    workmanifest_contract: pass
  next_candidates:
    - wave-pr-action
  human_checkpoint: false
  external_action: true
  forge:
    action: open_draft_pr
    draft: true
    apply_labels: []
    title: "[INIT-GATEFLOW-017 W3] Programme enter and delivery rebind"
    body_path: docs/specification/reports/Wave-Execution-INIT-GATEFLOW-017-W3.md
    head_ref: feature/INIT-GATEFLOW-017-w3-programme-enter
    base_ref: develop
```
