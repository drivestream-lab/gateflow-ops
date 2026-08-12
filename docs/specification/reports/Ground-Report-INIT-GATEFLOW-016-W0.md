# Ground report — INIT-GATEFLOW-016 W0

| Field             | Value                                                                                                                             |
| ----------------- | --------------------------------------------------------------------------------------------------------------------------------- |
| Wave              | W0 — Identity, fleet onboarding, workspace shell                                                                                  |
| Spec              | `docs/specification/product/INIT-GATEFLOW-016-gateflow-ops.md`                                                                    |
| Initiative        | INIT-GATEFLOW-016                                                                                                                 |
| Date              | 2026-08-12                                                                                                                        |
| Wave head (exact) | `feature/INIT-GATEFLOW-016-w0-identity-onboarding` @ `b65fd833156827cd4c8e1d75dd4cf6af4b63093e` — reviewed head for sign-off      |
| PR URL (if any)   | https://github.com/drivestream-lab/gateflow-ops/pull/26 — read-only context                                                       |
| Status            | Draft                                                                                                                             |
| Review deadline   | 2026-08-14                                                                                                                        |
| Deciders          | Tech lead / reviewer: PE — explicit LGTM required at merge discretion                                                             |
| Outcome           | pass                                                                                                                              |
| Outcome reason    | Wave-assigned REQ-01–08 map to BFF/UI/verdict/verify artifacts; ADR-001 + MDC boundaries hold; Contracts produced complete for W1 |
| Assigned REQs     | REQ-01, REQ-02, REQ-03, REQ-04, REQ-05, REQ-06, REQ-07, REQ-08                                                                    |

## Evidence sources (separate layers)

| Layer  | Source                                                       | Summary                                                                          |
| ------ | ------------------------------------------------------------ | -------------------------------------------------------------------------------- |
| Unit   | `make test` / Wave-Execution proof                           | 20 tests green including `onboarding-verdict.test.ts` (5 cases)                  |
| Ground | N/A ground_command — manual `source_roots` + `tests/**` scan | Shell, tenants/programme BFF, verdict helper, verify FILE present                |
| Accept | `wave-acceptance` label on PR #26 tip `cce93b8…`             | Enter-at Pass-2; human_approved recorded at wave-acceptance (not re-marked here) |

## Automated ground check output

`ground_command` is N/A (no Makefile ground target). Manual scan:

- `components/workspace/*` + `app/(dashboard)/layout.tsx` — WorkspaceShell
- `app/api/gateflow/tenants/route.ts`, `tenants/users/route.ts` — CAP-A
- `app/api/gateflow/programme/route.ts` — CAP-B ops via `op` query
- `lib/onboarding-verdict.ts` + `tests/unit/onboarding-verdict.test.ts` — REQ-07
- `tests/verify/02-w0-identity-onboarding.md` — live FILE (P15)
- `make test` 2026-08-12: exit 0, 20 passed

## REQ checklist (wave-assigned only)

| REQ    | Spec claim                          | Verified artifact                                                                                             | Status |
| ------ | ----------------------------------- | ------------------------------------------------------------------------------------------------------------- | ------ |
| REQ-01 | Present session tenant detail       | `GET /api/gateflow/tenants` → upstream tenant read; `components/tenant/tenant-detail.tsx`; verify FILE step 2 | pass   |
| REQ-02 | Invite teammate                     | `POST /api/gateflow/tenants/users`; tenant invite form; verify FILE step 2                                    | pass   |
| REQ-03 | Catalogue browse/refresh            | `programme?op=catalogue` / `catalogue-refresh`; onboarding flow; verify FILE step 3                           | pass   |
| REQ-04 | Programme connect                   | `programme?op=connect` / `connection`; connection form; verify FILE step 3                                    | pass   |
| REQ-05 | Admit repo + plain-language outcome | `programme?op=select`; outcome i18n keys; verify FILE step 4                                                  | pass   |
| REQ-06 | Readiness refresh                   | `programme?op=readiness`; readiness panel; verify FILE step 5                                                 | pass   |
| REQ-07 | Single pass/fail verdict            | `composeOnboardingVerdict`; unit matrix; UI `data-verdict`; verify FILE step 5                                | pass   |
| REQ-08 | Deselect fleet repo                 | `programme?op=deselect`; active fleet list; verify FILE step 6                                                | pass   |

## Boundary checks

| Rule                                            | Source                       | Status                                                   |
| ----------------------------------------------- | ---------------------------- | -------------------------------------------------------- |
| UI primitives via shadcn + semantic tokens only | ADR-001                      | pass — feature UI uses `components/ui` + token utilities |
| Same-origin BFF; no browser upstream JWT        | nextjs-bff-server-auth.mdc   | pass — `authFetch` / `upstreamFetch` pattern             |
| BFF under `app/api/gateflow/`                   | nextjs-repository-layout.mdc | pass                                                     |
| No hardcoded UI strings                         | no-hardcoded-strings.mdc     | pass — tenants/fleet/workspace catalogs                  |
| Shell slots only                                | workspace-page-layout.mdc    | pass — PageHeader/PageBody via WorkspaceShell            |
| Unit vs live separation                         | testing-verify-flows.mdc     | pass — verdict unit; journey in verify FILE              |

## Cross-spec contracts consumed

| Assumed contract                                      | Source                                              | Match?                                             |
| ----------------------------------------------------- | --------------------------------------------------- | -------------------------------------------------- |
| Session guard + `authFetch` / `upstreamFetch` chassis | Pre-implement W0 / chassis (no prior Ground Report) | yes                                                |
| Gateflow CTR-01 / CTR-02 live HTTP shapes             | Product spec + gateflow routes                      | yes — BFF forwards; fail-closed on upstream errors |

## Discrepancies (must fix before human checkpoint)

| ID  | REQ | Finding | Severity |
| --- | --- | ------- | -------- |
| —   | —   | none    | —        |

## Learning cited

| L-id | Class | How it affects this ground                                      |
| ---- | ----- | --------------------------------------------------------------- |
| —    | —     | Learning-Extract has `items: []` (no human_fix); no L-* to cite |

## Contracts produced by this wave

| Contract              | Module / component                        | Entry point                            | Input shape                                             | Output shape                         | Invariants                                                        | Next wave                        |
| --------------------- | ----------------------------------------- | -------------------------------------- | ------------------------------------------------------- | ------------------------------------ | ----------------------------------------------------------------- | -------------------------------- |
| Workspace shell slots | `components/workspace`                    | WorkspaceShell / PageHeader / PageBody | authenticated children; title/actions slots             | left nav + inset chrome              | Pages do not invent parallel chrome; nav from `lib/workspace-nav` | W1                               |
| Tenant BFF            | `app/api/gateflow/tenants`                | GET tenants; POST tenants/users        | session cookie; invite `{ identity }`                   | shaped tenant detail; invite ack     | Session tenant only; no tenant list                               | W1+                              |
| Programme BFF         | `app/api/gateflow/programme`              | GET/PUT/POST with `op`                 | connection/catalogue/select/readiness/deselect payloads | upstream-shaped JSON                 | Session tenant; no PLATFORM_ADMIN                                 | W1                               |
| Onboarding verdict    | `lib/onboarding-verdict`                  | composeOnboardingVerdict               | select outcome + readiness signals                      | `{ verdict: pass\|fail, reasonKey }` | Never partial; pure; unit-tested                                  | W1 (consume if composing status) |
| Client data hooks     | `hooks/use-tenant`, `hooks/use-programme` | TanStack Query + authFetch             | enabled flags / mutation bodies                         | typed client models                  | Relative `/api/gateflow/*` only                                   | W1                               |

## Exact-head merge package (for wave-signoff)

> Write the Ground Report and as-built updates **locally**. Emit Forge
> readiness for publication. Do **not** commit, push, merge, or apply labels
> from this skill. Human approved was `wave-acceptance`. At `wave-signoff`
> the human merges/publishes the **exact wave head** only.

- PR URL / wave head: https://github.com/drivestream-lab/gateflow-ops/pull/26 @ `b65fd833156827cd4c8e1d75dd4cf6af4b63093e` — **expected reviewed head SHA** (pre-closeout publish may advance tip with this report)
- Ground Report path: `docs/specification/reports/Ground-Report-INIT-GATEFLOW-016-W0.md`
- Accept evidence: `wave-acceptance` on tip (wave-acceptance) — human approved already
- Wave-Execution path: `docs/specification/reports/Wave-Execution-INIT-GATEFLOW-016-W0.md`
- Optional/legacy Live-Verify path: n/a
- As-built: W0 `human_approved` from wave-acceptance (do not re-mark beyond recording status)
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
| G1  | PASS — W0 REQ-01–08 only                                      |
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
    path: docs/specification/reports/Ground-Report-INIT-GATEFLOW-016-W0.md
  blockers: []
  signals:
    wave: W0
    contracts_produced: 5
    assigned_reqs:
      - REQ-01
      - REQ-02
      - REQ-03
      - REQ-04
      - REQ-05
      - REQ-06
      - REQ-07
      - REQ-08
    tip_sha: b65fd833156827cd4c8e1d75dd4cf6af4b63093e
    pr_url: https://github.com/drivestream-lab/gateflow-ops/pull/26
    learning_extract: docs/specification/reports/Learning-Extract-INIT-GATEFLOW-016-W0.md
  next_candidates:
    - wave-done-action
  human_checkpoint: false
  external_action: true
  forge:
    action: update_board_status
    ticket: https://github.com/drivestream-lab/gateflow-ops/issues/21
```
