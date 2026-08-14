# Wave execution — INIT-GATEFLOW-017 W2

| Field               | Value                                                             |
| ------------------- | ----------------------------------------------------------------- |
| Initiative          | INIT-GATEFLOW-017                                                 |
| Wave                | W2                                                                |
| Wave head context   | Bound by Forge/human: `feature/INIT-GATEFLOW-017-w2-grants-purge` |
| Board issue         | https://github.com/drivestream-lab/gateflow-ops/issues/36         |
| WorkManifest source | plan §9 (immutable intent — not mutated)                          |
| Outcome             | pass                                                              |

## Completed TASKS

| TASK       | Implements                                                     | Declared files                                                                                                                                                                                          | Proof expected (manifest)      | Observed (command / evidence)                                                                                                          | Status |
| ---------- | -------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------- | ------ |
| TASK-W2-01 | REQ-06, REQ-07, REQ-08, REQ-09, REQ-10, REQ-24, REQ-28, REQ-30 | `app/api/gateflow/grants/route.ts` create                                                                                                                                                               | exit 0; assertions green       | `make check` exit 0; `make test` exit 0 (71 tests)                                                                                     | green  |
| TASK-W2-02 | REQ-11, REQ-30                                                 | `components/grants/membership-panel.tsx` create; `hooks/use-grants.ts` create; `data/locales/en/grants.json` create; `components/programmes/programme-detail.tsx` modify; `lib/workspace-nav.ts` modify | exit 0; assertions green       | `make check` exit 0; `make test` exit 0                                                                                                | green  |
| TASK-W2-03 | REQ-20, REQ-21                                                 | `app/api/gateflow/tenants/users/route.ts` delete; `lib/programme-attach.ts` delete; `components/tenant/tenant-detail.tsx` modify                                                                        | exit 0; assertions green       | `make check` exit 0; `make test` exit 0 (70 tests after attach-strip case removed)                                                     | green  |
| TASK-W2-04 | REQ-07, REQ-08, REQ-28, REQ-30                                 | `tests/unit/grants-bff.test.ts` create                                                                                                                                                                  | exit 0; assertions green       | `make test` exit 0 — 9 helper cases; suite 79 tests                                                                                    | green  |
| TASK-W2-05 | REQ-06–11, REQ-15, REQ-20, REQ-21, REQ-24, REQ-28, REQ-30      | `tests/verify/08-grants-membership.md` create; `02` / `03` modify; as-built 017 + index modify                                                                                                          | human PASS observations (live) | FILE created with `prayog:covers:` W2 live REQs; 016 invite/attach steps stripped; as-built W2 = `implemented` — **did not** run smoke | green  |

## Live verify (human — not claimed here)

- Planned script: `tests/verify/08-grants-membership.md` under `tests/verify`
- Agent created planned FILE: **yes** — **did not** run smoke/sandbox as success
- Prerequisites: CTR-02 live; W1 identity + onboarded programme; W0 merged
- Kill line: provider 5xx or login still 014-binds → stop

## Notes

- Companion files outside §9 `files[]` (pre-implement flagged): `lib/i18n.ts` (`grants` catalog); `app/api/gateflow/programmes/[programmeId]/tenant-admins/route.ts` deleted (cannot list `[programmeId]` in manifest); `hooks/use-programmes.ts` / `hooks/use-tenant.ts` drop attach/invite; `tests/unit/platform-programmes.test.ts` drop `stripAttachAccessToken`; `components/identities/identity-detail.tsx` hosts identity-side membership; `tests/README.md`
- Grant POST never sends password; 409 on grant is treated as idempotent success
- Detach is `POST /api/gateflow/grants?op=detach` → upstream `DELETE /api/v1/grants`
- Programme-context cookie is not written (W3)

## Forge readiness

- After this hop: `commit_workspace` (code on bound `head_ref`)
- Next external-action: `open_draft_pr` / `wave-pr-action`
  - title: `[INIT-GATEFLOW-017 W2] Grants and purge invite/attach`
  - body_path: `docs/specification/reports/Wave-Execution-INIT-GATEFLOW-017-W2.md`
  - head_ref: `feature/INIT-GATEFLOW-017-w2-grants-purge`
  - base_ref: `develop`

---

```yaml
handoff:
  contract: sdd-delivery/v2
  stage: loop-spec
  outcome: pass
  artifact:
    path: docs/specification/reports/Wave-Execution-INIT-GATEFLOW-017-W2.md
  blockers: []
  signals:
    initiative: INIT-GATEFLOW-017
    wave: W2
    wave_issue: https://github.com/drivestream-lab/gateflow-ops/issues/36
    current_task: null
    completed_tasks:
      - TASK-W2-01
      - TASK-W2-02
      - TASK-W2-03
      - TASK-W2-04
      - TASK-W2-05
    implements:
      - REQ-06
      - REQ-07
      - REQ-08
      - REQ-09
      - REQ-10
      - REQ-11
      - REQ-15
      - REQ-20
      - REQ-21
      - REQ-24
      - REQ-28
      - REQ-30
    check_command: make check
    test_command: make test
    verify_command: tests/verify/08-grants-membership.md
    head_ref: feature/INIT-GATEFLOW-017-w2-grants-purge
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
    title: "[INIT-GATEFLOW-017 W2] Grants and purge invite/attach"
    body_path: docs/specification/reports/Wave-Execution-INIT-GATEFLOW-017-W2.md
    head_ref: feature/INIT-GATEFLOW-017-w2-grants-purge
    base_ref: develop
```
