# Ground report — INIT-GATEFLOW-016 W1

| Field             | Value                                                                                                                          |
| ----------------- | ------------------------------------------------------------------------------------------------------------------------------ |
| Wave              | W1 — Wave operations (CAP-C)                                                                                                   |
| Spec              | `docs/specification/product/INIT-GATEFLOW-016-gateflow-ops.md`                                                                 |
| Initiative        | INIT-GATEFLOW-016                                                                                                              |
| Date              | 2026-08-13                                                                                                                     |
| Wave head (exact) | `feature/INIT-GATEFLOW-016-w1-wave-operations` @ `e708aa7a741ff998c4b7a5848de4c7e4ff4be3ac` — reviewed head for sign-off       |
| PR URL (if any)   | https://github.com/drivestream-lab/gateflow-ops/pull/28 — read-only context                                                    |
| Status            | Draft                                                                                                                          |
| Review deadline   | 2026-08-17                                                                                                                     |
| Deciders          | Tech lead / reviewer: PE — explicit LGTM required at merge discretion                                                          |
| Outcome           | pass                                                                                                                           |
| Outcome reason    | Wave-assigned REQ-09–12 map to BFF/UI/unit/verify artifacts; ADR-001 + MDC boundaries hold; Contracts produced complete for W2 |
| Assigned REQs     | REQ-09, REQ-10, REQ-11, REQ-12                                                                                                 |

## Evidence sources (separate layers)

| Layer  | Source                                                       | Summary                                                                          |
| ------ | ------------------------------------------------------------ | -------------------------------------------------------------------------------- |
| Unit   | `make test` / Wave-Execution proof                           | 39 tests green including `run-stop-presentation.test.ts` (5 cases)               |
| Ground | N/A ground_command — manual `source_roots` + `tests/**` scan | waves/runs BFF, run-cockpit, verify FILE present                                 |
| Accept | `wave-acceptance` label on PR #28 tip `e708aa7…`             | Enter-at Pass-2; human_approved recorded at wave-acceptance (not re-marked here) |

## Automated ground check output

`ground_command` is N/A (no Makefile ground target). Manual scan:

- `app/api/gateflow/waves/route.ts` — CAP-C start (`?lane=implement|spec|closeout`)
- `app/api/gateflow/runs/route.ts`, `runs/by-id/route.ts`, `runs/forge/route.ts` — list/detail/authorize
- `components/runs/run-cockpit.tsx` + `app/(dashboard)/runs/page.tsx` — Runs UI
- `hooks/use-runs.ts` — stop presentation helpers + TanStack Query
- `tests/unit/run-stop-presentation.test.ts` — REQ-11 unit
- `tests/verify/03-w1-wave-operations.md` — live FILE (P15)
- `make test` 2026-08-13: exit 0, 39 passed

## REQ checklist (wave-assigned only)

| REQ    | Spec claim                               | Verified artifact                                                                                                  | Status |
| ------ | ---------------------------------------- | ------------------------------------------------------------------------------------------------------------------ | ------ |
| REQ-09 | Start implement/spec/closeout waves      | `POST /api/gateflow/waves?lane=`; start form in run-cockpit; verify FILE step 3                                    | pass   |
| REQ-10 | List runs with filters                   | `GET /api/gateflow/runs` filters; list UI; verify FILE step 4                                                      | pass   |
| REQ-11 | Run detail + unambiguous stop-state      | `GET /api/gateflow/runs/by-id`; `classifyRunStopPresentation`; `data-stop-presentation`; unit + verify FILE step 5 | pass   |
| REQ-12 | Forge authorize only via explicit action | `POST /api/gateflow/runs/forge`; eligible only when STOPPED + workflow node; verify FILE step 6                    | pass   |

## Boundary checks

| Rule                                            | Source                       | Status                                                |
| ----------------------------------------------- | ---------------------------- | ----------------------------------------------------- |
| UI primitives via shadcn + semantic tokens only | ADR-001                      | pass — Runs UI uses `components/ui` + token utilities |
| Same-origin BFF; no browser upstream JWT        | nextjs-bff-server-auth.mdc   | pass — `authFetch` / `upstreamFetch`                  |
| BFF under `app/api/gateflow/`                   | nextjs-repository-layout.mdc | pass                                                  |
| No hardcoded UI strings                         | no-hardcoded-strings.mdc     | pass — `data/locales/en/runs.json`                    |
| Shell slots only                                | workspace-page-layout.mdc    | pass — PageHeader/PageBody                            |
| Unit vs live separation                         | testing-verify-flows.mdc     | pass — stop presentation unit; journey in verify FILE |
| CAP-C not folded into Fleet                     | product spec / as-built      | pass — `/runs` separate from `/fleet`                 |

## Cross-spec contracts consumed

| Assumed contract                       | Source                         | Match?                                             |
| -------------------------------------- | ------------------------------ | -------------------------------------------------- |
| Workspace shell slots                  | Ground-Report-W0               | yes                                                |
| Session → BFF → upstream chassis       | Ground-Report-W0 + chassis     | yes                                                |
| Client hooks + authFetch pattern       | Ground-Report-W0               | yes                                                |
| Fleet admit available for wave targets | Ground-Report-W0 programme BFF | yes — upstream gate; ops Fleet CAP-B separate      |
| CTR-03 gateflow shapes                 | product spec (live)            | yes — BFF forwards; fail-closed on upstream errors |

## Discrepancies (must fix before human checkpoint)

| ID  | REQ | Finding | Severity |
| --- | --- | ------- | -------- |
| —   | —   | none    | —        |

## Learning cited

| L-id | Class | How it affects this ground                                      |
| ---- | ----- | --------------------------------------------------------------- |
| —    | —     | Learning-Extract has `items: []` (no human_fix); no L-* to cite |

## Contracts produced by this wave

| Contract                 | Module / component               | Entry point                            | Input shape                                      | Output shape                                 | Invariants                                                  | Next wave |
| ------------------------ | -------------------------------- | -------------------------------------- | ------------------------------------------------ | -------------------------------------------- | ----------------------------------------------------------- | --------- |
| Wave start BFF           | `app/api/gateflow/waves`         | POST `?lane=implement\|spec\|closeout` | lane + upstream start body                       | `{ runId, jobId, status }`                   | tenant session; lanes enumerated; fail-closed upstream      | W2        |
| Runs list BFF            | `app/api/gateflow/runs`          | GET with filters                       | initiative/wave/status/org/repo + pagination     | `{ items[], limit, skip }`                   | limits from `@/lib/constants`; session tenant               | W2        |
| Run detail BFF           | `app/api/gateflow/runs/by-id`    | GET `?run_id=`                         | run id                                           | header + stages/events                       | query param id (no App Router dynamic segment)              | W2        |
| Forge authorize BFF      | `app/api/gateflow/runs/forge`    | POST `?run_id=`                        | authorize body (`authorized`, workspace_path, …) | action ack                                   | operator-explicit only; UI gates on STOPPED + workflow node | W2        |
| Stop presentation helper | `hooks/use-runs`                 | `classifyRunStopPresentation`          | status + outcome                                 | human_checkpoint \| failure \| complete \| … | `stopped` ≠ failure styling; unit-tested                    | W2        |
| Runs cockpit UI          | `components/runs` + `/runs` page | RunCockpit                             | tenant_admin session                             | start / list / detail / forge surfaces       | not on Fleet; nav item for tenant_admin                     | W2        |

## Exact-head merge package (for wave-signoff)

> Write the Ground Report and as-built updates **locally**. Emit Forge
> readiness for publication. Do **not** commit, push, merge, or apply labels
> from this skill. Human approved was `wave-acceptance`. At `wave-signoff`
> the human merges/publishes the **exact wave head** only.

- PR URL / wave head: https://github.com/drivestream-lab/gateflow-ops/pull/28 @ `e708aa7a741ff998c4b7a5848de4c7e4ff4be3ac` — **expected reviewed head SHA** (closeout publish may advance tip with this report)
- Ground Report path: `docs/specification/reports/Ground-Report-INIT-GATEFLOW-016-W1.md`
- Accept evidence: `wave-acceptance` on tip (wave-acceptance) — human approved already
- Wave-Execution path: `docs/specification/reports/Wave-Execution-INIT-GATEFLOW-016-W1.md`
- Optional/legacy Live-Verify path: n/a
- As-built: W1 `human_approved` from wave-acceptance (do not re-mark beyond recording status)
- Required merge fields (human fills at `wave-signoff`; not `handoff.forge`):
  `reviewed_head_sha`, `merge_commit_sha`

### Human merge checklist (wave-signoff)

- [ ] Review REQ checklist — all wave-assigned REQs pass or explicitly deferred
- [ ] Review §Contracts produced — accurate and complete for next wave
- [ ] Confirm reviewed head SHA matches the package above (after closeout commit)
- [ ] Confirm human_approved already recorded at wave-acceptance (do not re-mark)
- [ ] Merge the wave PR manually at wave-signoff (human only) — record merge commit SHA
- [ ] Do not ask Gateflow/Forge to merge; no approval-label auto-merge

## Ready for wave-signoff (merge)?

yes — after Forge publishes closeout artifacts to tip; merge remains human-only

### Checks G1–G10

| ID  | Result                                                        |
| --- | ------------------------------------------------------------- |
| G1  | PASS — W1 REQ-09–12 only                                      |
| G2  | PASS — ground_command N/A; manual + unit cited                |
| G3  | PASS — all assigned REQs in checklist                         |
| G4  | PASS — Wave-Execution + unit + wave-acceptance label          |
| G5  | PASS — ADR-001                                                |
| G6  | PASS — BFF/auth/i18n/shell/testing MDCs                       |
| G7  | PASS — contracts consumed + produced                          |
| G8  | PASS — empty learning cited                                   |
| G9  | PASS — no GF-* open                                           |
| G10 | PASS — report written; as-built human_approved; handoff below |

```yaml
handoff:
  contract: sdd-delivery/v2
  stage: ground-spec
  outcome: pass
  artifact:
    path: docs/specification/reports/Ground-Report-INIT-GATEFLOW-016-W1.md
  blockers: []
  signals:
    wave: W1
    contracts_produced: 6
    assigned_reqs:
      - REQ-09
      - REQ-10
      - REQ-11
      - REQ-12
    tip_sha: e708aa7a741ff998c4b7a5848de4c7e4ff4be3ac
    pr_url: https://github.com/drivestream-lab/gateflow-ops/pull/28
    learning_extract: docs/specification/reports/Learning-Extract-INIT-GATEFLOW-016-W1.md
  next_candidates:
    - wave-done-action
  human_checkpoint: false
  external_action: true
  forge:
    action: update_board_status
    ticket: https://github.com/drivestream-lab/gateflow-ops/issues/22
```
