# Implementation plan — INIT-GATEFLOW-019 (gateflow-ops)

| Field            | Value                                                                                    |
| ---------------- | ---------------------------------------------------------------------------------------- |
| Status           | **Review draft** — Gate 1 skipped; **blocked on provider W1+W2**                         |
| Spec             | `docs/specification/product/INIT-GATEFLOW-019-gateflow-ops.md`                           |
| Provider plan    | sibling `gateflow` `docs/specification/reports/Implementation-Plan-INIT-GATEFLOW-019.md` |
| Date             | 2026-08-15                                                                               |
| `check_command`  | `make check`                                                                             |
| `test_command`   | `make test`                                                                              |
| `verify_command` | per-wave FILE below                                                                      |
| `ground_command` | N/A                                                                                      |

018 chrome stays. This INIT only changes **start**. Do not implement W0 until gateflow picker + operator-shaped spec start are on the consumed tip.

## Why this plan exists

`RunCockpit` satisfies 016 REQ-09 (a wave can be started). It does not satisfy the operator walk: attested meta PR → derived spec start → later lanes from tickets.

## 1. Requirements

| ID        | Summary                                                                     | Wave |
| --------- | --------------------------------------------------------------------------- | ---- |
| REQ-01…05 | Picker from gateflow; CAP-01 badge; Start spec; hide PE fields; spec states | W0   |
| REQ-06…08 | Implement/closeout from wave map; cockpit not primary                       | W1   |

## 2. Waves

### W0 — Picker + Start spec (CAP-1)

**GOAL-W0:** `/meta-prs` is look-only. `/spec-lane` starts spec. `/initiatives` is removed.

| Task       | Implements     | Files                                                                                                                                                                                                       | Exit                                                                      |
| ---------- | -------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------- |
| TASK-W0-01 | REQ-01, REQ-02 | New BFF `app/api/gateflow/meta/pulls` (or equivalent) → provider list; **no Octokit**. Hook + types                                                                                                         | Unit: BFF maps upstream; 502 on upstream fail                             |
| TASK-W0-02 | REQ-03, REQ-04 | Start spec form: confirm initiative, fleet-repo lock/picker, runner/model from `GET /agent-catalogue` + programme `lane_defaults`. POST existing `waves?lane=spec` with **omitted** paths/slug/`start_node` | Unit: body has no `workspace_path` / `meta_workspace_path` / `start_node` |
| TASK-W0-03 | REQ-05         | Spec readout panel: running / draft-PR / tickets-seeded copy (use existing `by-id?op=spec`)                                                                                                                 | Draft PR never labelled “spec done”                                       |
| TASK-W0-04 | REQ-01…05      | `tests/verify/10-meta-pr-spec-start.md`; locales                                                                                                                                                            | Live FILE against lab: attested PR → start → run id visible               |

**verify_command (W0):** live markdown `tests/verify/10-meta-pr-spec-start.md`

### W1 — Wave-map actions (CAP-2)

**GOAL-W1:** Implement/closeout from CAP-F wave map. Cockpit is advanced-only.

| Task       | Implements | Files                                                                                                                           | Exit                                                                                  |
| ---------- | ---------- | ------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------- |
| TASK-W1-01 | REQ-06     | Wave row: Start implement when status ≠ `done`; prefills ticket + initiative + wave; omit path; slug omitted (provider default) | Disabled when `done`; unit                                                            |
| TASK-W1-02 | REQ-07     | Wave row: Start closeout when app `pr_number` present; prefills ticket + pr                                                     | Unit                                                                                  |
| TASK-W1-03 | REQ-08     | `run-cockpit.tsx`: default hidden or “Advanced”; primary CTA is picker / wave map                                               | Verify 03 still can start a lane via advanced **or** update verify 03 to the new path |
| TASK-W1-04 | REQ-06…08  | `tests/verify/11-wave-map-lane-start.md`                                                                                        | Live: implement refused on Done ticket; closeout uses existing PR                     |

**verify_command (W1):** `tests/verify/11-wave-map-lane-start.md`

## 3. Verification coverage

| Wave | Unit                   | Live                              |
| ---- | ---------------------- | --------------------------------- |
| W0   | BFF + start-body shape | `10-meta-pr-spec-start.md` (P15)  |
| W1   | wave-map enablement    | `11-wave-map-lane-start.md` (P15) |

## 4. Risks

| Risk                                     | Mitigation                                          |
| ---------------------------------------- | --------------------------------------------------- |
| Implementing against old spec-start body | Hard gate: provider W2 on tip                       |
| BFF lists GitHub                         | Forbidden; fail review if Octokit appears on picker |
| 016 verify 03 assumes cockpit fields     | Update or keep advanced path                        |

## 5. Coding-readiness (local only)

- [ ] Provider W1+W2 consumable
- [ ] PE accepts local 019-ops spec
- [ ] 018 nav: Initiatives remains the dest (no new top-level item required)

```yaml
workmanifest_draft:
  initiative: INIT-GATEFLOW-019
  repo: gateflow-ops
  waves:
    - id: W0
      tasks: [TASK-W0-01, TASK-W0-02, TASK-W0-03, TASK-W0-04]
      blocked_on: gateflow W1+W2
    - id: W1
      tasks: [TASK-W1-01, TASK-W1-02, TASK-W1-03, TASK-W1-04]
```
