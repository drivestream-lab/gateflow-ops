# Ground report — INIT-GATEFLOW-016 W2

| Field             | Value                                                                                                                          |
| ----------------- | ------------------------------------------------------------------------------------------------------------------------------ |
| Wave              | W2 — Initiative & delivery tracking (CAP-F)                                                                                    |
| Spec              | `docs/specification/product/INIT-GATEFLOW-016-gateflow-ops.md`                                                                 |
| Initiative        | INIT-GATEFLOW-016                                                                                                              |
| Date              | 2026-08-13                                                                                                                     |
| Wave head (exact) | `feature/INIT-GATEFLOW-016-w2-initiative-tracking` @ `fcae0e89c33562a87e10bc8afa2aa6a4397e32e2` — reviewed head for sign-off   |
| PR URL (if any)   | https://github.com/drivestream-lab/gateflow-ops/pull/29 — read-only context                                                    |
| Status            | Draft                                                                                                                          |
| Review deadline   | 2026-08-17                                                                                                                     |
| Deciders          | Tech lead / reviewer: PE — explicit LGTM required at merge discretion                                                          |
| Outcome           | pass                                                                                                                           |
| Outcome reason    | Wave-assigned REQ-13–21 map to BFF/UI/unit/verify artifacts; ADR-001 + MDC boundaries hold; Contracts produced complete for W3 |
| Assigned REQs     | REQ-13, REQ-14, REQ-15, REQ-16, REQ-17, REQ-18, REQ-19, REQ-20, REQ-21                                                         |

## Evidence sources (separate layers)

| Layer  | Source                                                       | Summary                                                                                      |
| ------ | ------------------------------------------------------------ | -------------------------------------------------------------------------------------------- |
| Unit   | `make test` / Wave-Execution proof                           | 43 tests green including `initiative-composition.test.ts` (4 cases)                          |
| Ground | N/A ground_command — manual `source_roots` + `tests/**` scan | initiatives BFF, initiative-hub, verify FILE present                                         |
| Accept | `wave-acceptance` label on PR #29 tip `fcae0e8…`             | Enter-at Pass-2; human_approved recorded at wave-acceptance (not re-marked as approval here) |

## Automated ground check output

`ground_command` is N/A (no Makefile ground target). Manual scan:

- `app/api/gateflow/initiatives/route.ts` — list GET; closure-start POST `?op=closure-start`
- `app/api/gateflow/initiatives/by-id/route.ts` — detail/waves/spec/implementation/closeout/merge/completion/closure via `?op=`
- `components/initiatives/initiative-hub.tsx` + `app/(dashboard)/initiatives/page.tsx` — Initiatives UI
- `hooks/use-initiatives.ts` — wave-map status, composition gaps, closure ticket parse + TanStack Query
- `tests/unit/initiative-composition.test.ts` — REQ-14 / gap helpers unit
- `tests/verify/04-w2-initiative-tracking.md` — live FILE (P15)
- `make test` 2026-08-13: exit 0, 43 passed

## REQ checklist (wave-assigned only)

| REQ    | Spec claim                         | Verified artifact                                                                                    | Status |
| ------ | ---------------------------------- | ---------------------------------------------------------------------------------------------------- | ------ |
| REQ-13 | List/detail initiatives (composed) | `GET /api/gateflow/initiatives`; detail panel; verify FILE steps 3–4; gaps via `compositionGapLabel` | pass   |
| REQ-14 | Per-wave status map                | `by-id?op=waves`; WaveRows + `classifyWaveMapStatus`; verify FILE step 5                             | pass   |
| REQ-15 | Spec-lane readout                  | `by-id?op=spec`; readout panel; verify FILE step 6                                                   | pass   |
| REQ-16 | Per-wave implementation readout    | `by-id?op=implementation&wave_id=`; verify FILE step 6                                               | pass   |
| REQ-17 | Per-wave closeout readout          | `by-id?op=closeout&wave_id=`; verify FILE step 6                                                     | pass   |
| REQ-18 | Per-wave merge readout             | `by-id?op=merge&wave_id=`; verify FILE step 6                                                        | pass   |
| REQ-19 | Completion eligibility readout     | `by-id?op=completion`; verify FILE step 6                                                            | pass   |
| REQ-20 | Closure preview (pre/post purge)   | `by-id?op=closure`; JSON readout as-is; verify FILE step 6                                           | pass   |
| REQ-21 | Start initiative closure           | `POST /api/gateflow/initiatives?op=closure-start`; form + 202 enqueue ack; verify FILE step 7        | pass   |

## Boundary checks

| Rule                                            | Source                       | Status                                                             |
| ----------------------------------------------- | ---------------------------- | ------------------------------------------------------------------ |
| UI primitives via shadcn + semantic tokens only | ADR-001                      | pass — Initiatives UI uses `components/ui` + token utilities       |
| Same-origin BFF; no browser upstream JWT        | nextjs-bff-server-auth.mdc   | pass — `authFetch` / `upstreamFetch`                               |
| BFF under `app/api/gateflow/`                   | nextjs-repository-layout.mdc | pass                                                               |
| No hardcoded UI strings                         | no-hardcoded-strings.mdc     | pass — `data/locales/en/initiatives.json`                          |
| Shell slots only                                | workspace-page-layout.mdc    | pass — PageHeader/PageBody                                         |
| Unit vs live separation                         | testing-verify-flows.mdc     | pass — composition helpers unit; journey in verify FILE            |
| CAP-F not folded into Fleet/Runs                | product spec / as-built      | pass — `/initiatives` separate; optional deep-link to `/runs` only |
| Honest composition gaps                         | product CTR-06 / REQ-13–20   | pass — empty/unavailable labels; no invented board/GitHub fields   |

## Cross-spec contracts consumed

| Assumed contract                  | Source                     | Match?                                                             |
| --------------------------------- | -------------------------- | ------------------------------------------------------------------ |
| Workspace shell slots             | Ground-Report-W0           | yes                                                                |
| Session → BFF → upstream chassis  | Ground-Report-W0 + chassis | yes                                                                |
| Wave start / runs / forge BFF     | Ground-Report-W1           | yes — optional deep-link only; not re-implemented                  |
| Stop presentation helper          | Ground-Report-W1           | yes — available if initiative surfaces run status; not required UI |
| Runs cockpit UI                   | Ground-Report-W1           | yes — kept separate from Initiatives                               |
| CTR-06 gateflow initiative shapes | product spec (live)        | yes — BFF forwards; fail-closed; display as-is                     |

## Discrepancies (must fix before human checkpoint)

| ID  | REQ | Finding | Severity |
| --- | --- | ------- | -------- |
| —   | —   | none    | —        |

## Learning cited

| L-id | Class | How it affects this ground                                      |
| ---- | ----- | --------------------------------------------------------------- |
| —    | —     | Learning-Extract has `items: []` (no human_fix); no L-* to cite |

## Contracts produced by this wave

| Contract                  | Module / component                        | Entry point                                                            | Input shape                                                             | Output shape                                       | Invariants                                                                     | Next wave |
| ------------------------- | ----------------------------------------- | ---------------------------------------------------------------------- | ----------------------------------------------------------------------- | -------------------------------------------------- | ------------------------------------------------------------------------------ | --------- |
| Initiatives list BFF      | `app/api/gateflow/initiatives`            | GET                                                                    | org + repo + pagination                                                 | `{ initiatives[], org, repo }` (camelCase rows)    | tenant session; limits from `@/lib/constants`; fail-closed upstream            | W3        |
| Initiative readout BFF    | `app/api/gateflow/initiatives/by-id`      | GET `?initiative_id=&op=&org=&repo=&wave_id=`                          | op ∈ detail/waves/spec/implementation/closeout/merge/completion/closure | `{ op, initiativeId, org, repo, waveId, data }`    | wave_id required for implement/closeout/merge; query id (no App Router `[id]`) | W3        |
| Closure start BFF         | `app/api/gateflow/initiatives`            | POST `?op=closure-start`                                               | upstream ClosureStartRequest body                                       | `{ runId, jobId, status }` (202 when upstream 202) | operator-explicit enqueue; no fabricated run rows                              | W3        |
| Composition helpers       | `hooks/use-initiatives`                   | `classifyWaveMapStatus` / `compositionGapLabel` / `parseWaveTicketIds` | status string / unknown field / raw ticket string                       | wave status enum / gap label / id[]                | unit-tested; never invent board/GitHub values                                  | W3        |
| Initiatives hub UI        | `components/initiatives` + `/initiatives` | InitiativeHub                                                          | tenant_admin session                                                    | list/detail/waves/readouts/closure surfaces        | not on Fleet/Runs; nav item for tenant_admin                                   | W3        |
| Runs deep-link (optional) | Initiative detail                         | link to `/runs` with initiative/org/repo query                         | selected initiative                                                     | navigation only                                    | does not embed CAP-C controls                                                  | W3        |

## Exact-head merge package (for wave-signoff)

> Write the Ground Report and as-built updates **locally**. Emit Forge
> readiness for publication. Do **not** commit, push, merge, or apply labels
> from this skill. Human approved was `wave-acceptance`. At `wave-signoff`
> the human merges/publishes the **exact wave head** only.

- PR URL / wave head: https://github.com/drivestream-lab/gateflow-ops/pull/29 @ `fcae0e89c33562a87e10bc8afa2aa6a4397e32e2` — **expected reviewed head SHA** (closeout publish may advance tip with this report)
- Ground Report path: `docs/specification/reports/Ground-Report-INIT-GATEFLOW-016-W2.md`
- Accept evidence: `wave-acceptance` on tip (wave-acceptance) — human approved already
- Wave-Execution path: `docs/specification/reports/Wave-Execution-INIT-GATEFLOW-016-W2.md`
- Optional/legacy Live-Verify path: n/a
- As-built: W2 `human_approved` from wave-acceptance (recorded in closeout docs; approval signal remains wave-acceptance)
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
| G1  | PASS — W2 REQ-13–21 only                                      |
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
    path: docs/specification/reports/Ground-Report-INIT-GATEFLOW-016-W2.md
  blockers: []
  signals:
    wave: W2
    contracts_produced: 6
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
    tip_sha: fcae0e89c33562a87e10bc8afa2aa6a4397e32e2
    pr_url: https://github.com/drivestream-lab/gateflow-ops/pull/29
    learning_extract: docs/specification/reports/Learning-Extract-INIT-GATEFLOW-016-W2.md
  next_candidates:
    - wave-done-action
  human_checkpoint: false
  external_action: true
  forge:
    action: update_board_status
    ticket: https://github.com/drivestream-lab/gateflow-ops/issues/23
```
