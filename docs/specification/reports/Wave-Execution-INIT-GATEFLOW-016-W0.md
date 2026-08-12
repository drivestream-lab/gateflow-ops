# Wave execution — INIT-GATEFLOW-016 W0

| Field               | Value                                                                    |
| ------------------- | ------------------------------------------------------------------------ |
| Initiative          | INIT-GATEFLOW-016                                                        |
| Wave                | W0                                                                       |
| Wave head context   | Bound by Forge/human: `feature/INIT-GATEFLOW-016-w0-identity-onboarding` |
| Board issue         | https://github.com/drivestream-lab/gateflow-ops/issues/21                |
| WorkManifest source | plan §9 (immutable intent — not mutated)                                 |
| Outcome             | pass                                                                     |

## Completed TASKS

| TASK       | Implements     | Declared files                                                                 | Proof expected (manifest)                      | Observed (command / evidence)                      | Status |
| ---------- | -------------- | ------------------------------------------------------------------------------ | ---------------------------------------------- | -------------------------------------------------- | ------ |
| TASK-W0-01 | REQ-01…08      | `components/workspace/*`, `lib/workspace-nav.ts`, `app/(dashboard)/layout.tsx` | exit 0; assertions green                       | `make check` exit 0; `make test` exit 0 (20 tests) | green  |
| TASK-W0-02 | REQ-01, REQ-02 | tenants BFF/UI + locales + hook + page                                         | exit 0; assertions green                       | same                                               | green  |
| TASK-W0-03 | REQ-03…08      | programme BFF, onboarding-verdict, fleet UI/hook/page                          | exit 0; assertions green                       | same                                               | green  |
| TASK-W0-04 | REQ-07         | `tests/unit/onboarding-verdict.test.ts`                                        | `make test` green; all select×readiness combos | 5 unit cases green                                 | green  |
| TASK-W0-05 | REQ-01…08      | `tests/verify/02-w0-identity-onboarding.md`, as-built rows, tests README       | live FILE created; as-built index updated      | FILE present; as-built + feature map updated       | green  |

## Live verify (human — not claimed here)

- Planned script: `tests/verify/02-w0-identity-onboarding.md` under `tests/verify`
- Agent created planned FILE: **yes** — **did not** run smoke/sandbox as success
- Prerequisites: `AUTH_MODE=jwt-upstream`; live `UPSTREAM_BASE_URL`; TENANT_ADMIN session

## Notes

- Programme BFF is a single `app/api/gateflow/programme/route.ts` with `?op=` selector (WorkManifest file scope).
- Added `.prettierignore` for `prayog-skills/` / `.cursor/` so `make check` format gate is meaningful on the product tree.

## Forge readiness

- After this hop: `commit_workspace` (code on bound `head_ref`)
- Next external-action: `open_draft_pr` / `wave-pr-action`
  - title: `[INIT-GATEFLOW-016 W0] Identity, fleet onboarding, workspace shell`
  - body_path: `docs/specification/reports/Wave-Execution-INIT-GATEFLOW-016-W0.md`
  - head_ref: `feature/INIT-GATEFLOW-016-w0-identity-onboarding`
  - base_ref: `develop`

---

```yaml
handoff:
  contract: sdd-delivery/v2
  stage: loop-spec
  outcome: pass
  artifact:
    path: docs/specification/reports/Wave-Execution-INIT-GATEFLOW-016-W0.md
  blockers: []
  signals:
    initiative: INIT-GATEFLOW-016
    wave: W0
    wave_issue: https://github.com/drivestream-lab/gateflow-ops/issues/21
    completed_tasks:
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
    head_ref: feature/INIT-GATEFLOW-016-w0-identity-onboarding
    base_ref: develop
  next_candidates:
    - wave-pr-action
  human_checkpoint: false
  external_action: true
  forge:
    action: open_draft_pr
    draft: true
    apply_labels: []
    title: "[INIT-GATEFLOW-016 W0] Identity, fleet onboarding, workspace shell"
    body_path: docs/specification/reports/Wave-Execution-INIT-GATEFLOW-016-W0.md
    head_ref: feature/INIT-GATEFLOW-016-w0-identity-onboarding
    base_ref: develop
```
