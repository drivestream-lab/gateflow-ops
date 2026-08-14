# Wave execution — INIT-GATEFLOW-017 W0

| Field               | Value                                                                  |
| ------------------- | ---------------------------------------------------------------------- |
| Initiative          | INIT-GATEFLOW-017                                                      |
| Wave                | W0                                                                     |
| Wave head context   | Bound by Forge/human: `feature/INIT-GATEFLOW-017-w0-programme-context` |
| Board issue         | https://github.com/drivestream-lab/gateflow-ops/issues/34              |
| WorkManifest source | plan §9 (immutable intent — not mutated)                               |
| Outcome             | pass                                                                   |

## Completed TASKS

| TASK       | Implements                     | Declared files                                                                                                                                    | Proof expected (manifest)      | Observed (command / evidence)                                                                                     | Status |
| ---------- | ------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------ | ----------------------------------------------------------------------------------------------------------------- | ------ |
| TASK-W0-01 | REQ-12, REQ-14, REQ-18         | `lib/programme-context.ts` create; `lib/env.ts`, `app/api/auth/login/route.ts`, `app/api/auth/logout/route.ts`, `app/api/auth/me/route.ts` modify | exit 0; assertions green       | `make check` exit 0; `make test` exit 0 (59 tests)                                                                | green  |
| TASK-W0-02 | REQ-03                         | `lib/auth-login-upstream.ts` modify                                                                                                               | exit 0; assertions green       | `make check` exit 0; `make test` exit 0                                                                           | green  |
| TASK-W0-03 | REQ-03, REQ-12, REQ-14, REQ-18 | `tests/unit/programme-context.test.ts` create; `tests/unit/auth-login-upstream.test.ts` modify                                                    | exit 0; assertions green       | `make test` exit 0 — 5 helper cases + email-shape cases                                                           | green  |
| TASK-W0-04 | REQ-03, REQ-12, REQ-14, REQ-18 | `tests/verify/01-login-status-page.md` modify; as-built 017 create + index modify                                                                 | human PASS observations (live) | FILE extended with `prayog:covers: REQ-03, REQ-12, REQ-14, REQ-18`; as-built rows written — **did not** run smoke | green  |

## Live verify (human — not claimed here)

- Planned script: `tests/verify/01-login-status-page.md` under `tests/verify`
- Agent created planned FILE: **yes** (extended existing) — **did not** run smoke/sandbox as success
- Prerequisites: `npm run dev`; `.env` with `UPSTREAM_BASE_URL`; `AUTH_MODE=jwt-upstream` or documented stub; existing lab login; no new factory identity

## Notes

- Companion files outside §9 `files[]` (pre-implement flagged; required for named i18n / env / feature map): `data/locales/en/auth.json` (`errors.notAnEmail`), `.env.example` (`PROGRAMME_CONTEXT_COOKIE`), `tests/README.md`
- `make check` format gate also required Prettier on already-merged 017 spec/ADR/plan reports (drift on `develop`); no product wording change intended
- Delivery JWT `tenant_id` reads are unchanged (W3 migration). `dev-stub` no longer stamps `tenant_id`
- Identity Bearer remains `SESSION_COOKIE` only; helper never reads JWT `tenant_id`

## Forge readiness

- After this hop: `commit_workspace` (code on bound `head_ref`)
- Next external-action: `open_draft_pr` / `wave-pr-action`
  - title: `[INIT-GATEFLOW-017 W0] Programme-context chassis`
  - body_path: `docs/specification/reports/Wave-Execution-INIT-GATEFLOW-017-W0.md`
  - head_ref: `feature/INIT-GATEFLOW-017-w0-programme-context`
  - base_ref: `develop`

---

```yaml
handoff:
  contract: sdd-delivery/v2
  stage: loop-spec
  outcome: pass
  artifact:
    path: docs/specification/reports/Wave-Execution-INIT-GATEFLOW-017-W0.md
  blockers: []
  signals:
    initiative: INIT-GATEFLOW-017
    wave: W0
    wave_issue: https://github.com/drivestream-lab/gateflow-ops/issues/34
    current_task: null
    completed_tasks:
      - TASK-W0-01
      - TASK-W0-02
      - TASK-W0-03
      - TASK-W0-04
    implements:
      - REQ-03
      - REQ-12
      - REQ-14
      - REQ-18
    check_command: make check
    test_command: make test
    verify_command: tests/verify/01-login-status-page.md
    head_ref: feature/INIT-GATEFLOW-017-w0-programme-context
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
    title: "[INIT-GATEFLOW-017 W0] Programme-context chassis"
    body_path: docs/specification/reports/Wave-Execution-INIT-GATEFLOW-017-W0.md
    head_ref: feature/INIT-GATEFLOW-017-w0-programme-context
    base_ref: develop
```
