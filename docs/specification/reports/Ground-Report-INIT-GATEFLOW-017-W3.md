# Ground report — INIT-GATEFLOW-017 W3

| Field             | Value                                                                                                                                                     |
| ----------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Wave              | W3 — Programme enter and delivery rebind                                                                                                                  |
| Spec              | `docs/specification/product/INIT-GATEFLOW-017-gateflow-ops.md`                                                                                            |
| Initiative        | INIT-GATEFLOW-017                                                                                                                                         |
| Date              | 2026-08-14                                                                                                                                                |
| Wave head (exact) | `feature/INIT-GATEFLOW-017-w3-programme-enter` @ `f513dcd0aa8ad46d55bbe294b8b8c49d000c0e30` — reviewed head for sign-off                                  |
| PR URL (if any)   | https://github.com/drivestream-lab/gateflow-ops/pull/41 — read-only context                                                                               |
| Status            | Draft                                                                                                                                                     |
| Review deadline   | 2026-08-18                                                                                                                                                |
| Deciders          | Tech lead / reviewer: PE — explicit LGTM required at merge discretion                                                                                     |
| Outcome           | pass                                                                                                                                                      |
| Outcome reason    | Wave-assigned enter/rebind REQs map to enter BFF, helper-only delivery, enter UI, units, and verify FILE; ADR-002 + MDC hold; Contracts produced complete |
| Assigned REQs     | REQ-16, REQ-17, REQ-18, REQ-19, REQ-22, REQ-23, REQ-26, REQ-27                                                                                            |

## Evidence sources (separate layers)

| Layer  | Source                                                       | Summary                                                                              |
| ------ | ------------------------------------------------------------ | ------------------------------------------------------------------------------------ |
| Unit   | `make test` / Wave-Execution proof                           | 90 tests green including `programme-enter.test.ts` (11)                              |
| Ground | N/A ground_command — manual `source_roots` + `tests/**` scan | Enter BFF, delivery helper wiring, enter UI, CAP-P not migrated, verify FILE present |
| Accept | `wave-acceptance` label on PR #41 tip `f513dcd…`             | Enter-at Pass-2; human_approved recorded at wave-acceptance (not re-marked here)     |

## Automated ground check output

`ground_command` is N/A (no Makefile ground target). Manual scan:

- `app/api/auth/programme/route.ts` — `GET`/`POST`/`DELETE`; leave via `?op=leave` or `DELETE`; `enterWriteRefuseKey`; `stripGrantedProgramme`; `enterUpstreamRefuseKey`; sets/clears `PROGRAMME_CONTEXT_COOKIE`; does not remint `SESSION_COOKIE`
- `lib/programme-context.ts` — `getEnteredProgrammeContext()` returns `{ programmeId, tenantId }` or `null`; never JWT `tenant_id`
- Delivery BFF (`programme`, `runs`, `runs/by-id`, `runs/forge`, `waves`, `initiatives`, `initiatives/by-id`, `metrics`, `checkpoints`, `board`, `tenants`) — helper only; `null` → `*.errors.missingTenant`
- RSC delivery pages (`fleet`, `runs`, `initiatives`, `metrics`, `checkpoints`, `board`, `tenant`) — helper `null` + `tenant_admin` → redirect `/programmes/enter`
- `app/(dashboard)/page.tsx` — entered tenant from helper, not JWT
- `app/api/gateflow/programmes/route.ts` — still `requirePlatformAdminSession`; no helper (REQ-27)
- `components/programmes/programme-enter.tsx` + `app/(dashboard)/programmes/enter/page.tsx` — `tenant_admin` only; `authFetch`; no password field; zero-grant empty state
- `lib/workspace-nav.ts` — `/programmes/enter` for `tenant_admin`; `/programmes` + `/identities` for `platform_admin`
- `tests/unit/programme-enter.test.ts` — refuse, strip, missing-context keys, no JWT fallback
- `tests/verify/09-programme-enter-delivery.md` — `prayog:covers: REQ-16, REQ-17, REQ-18, REQ-19, REQ-22, REQ-23, REQ-26, REQ-27`
- `make test` 2026-08-14 (closeout re-run): exit 0, 90 passed
- Codegraph `mcp-prayog-fleet-cbm` (`data-repos-prayog-gateflow-ops`) is **stale** (indexes W0 helper + CAP-P; does not yet list `/api/auth/programme`). Direct `source_roots` reads are ground truth.
- `/api/auth/me` still echoes JWT `session.tenant_id` as `tenantId` plus helper `enteredProgrammeId` / `enteredTenantId` (W0 contract — not delivery scope)

## REQ checklist (wave-assigned only)

| REQ    | Spec claim                                                                                     | Verified artifact                                                                                                                                                         | Status |
| ------ | ---------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------ |
| REQ-16 | After one sign-in, `tenant_admin` sees granted programmes and reaches delivery by entering one | `GET`/`POST /api/auth/programme`; cookie write; not-granted / password refuse; enter UI lists grants only; delivery uses helper; unit refuse/strip; verify FILE steps 1–2 | pass   |
| REQ-17 | Same identity can run delivery in two granted programmes                                       | Enter overwrites context cookie with P2 ids; identity Bearer unchanged; verify FILE step 3                                                                                | pass   |
| REQ-18 | Zero-grant identity cannot run delivery                                                        | Empty list → `enter.empty`; helper `null` → `missingTenant` / redirect; unit missing-context; verify FILE step 5                                                          | pass   |
| REQ-19 | Granted `tenant_admin` keeps 016 delivery in entered programme; invite absent                  | Delivery BFF/pages after enter; `tenants/users` still absent; verify FILE steps 2/8                                                                                       | pass   |
| REQ-22 | `tenant_admin` cannot factory/grant/detach/suspend/password-set                                | Nav hides `/identities` / `/programmes`; enter page `isTenantAdmin` only; grant BFF remains `platform_admin`; verify FILE steps 1/7                                       | pass   |
| REQ-23 | `platform_admin` cannot run delivery                                                           | Enter BFF `wrongActor`; nav has no delivery hrefs; RSC without helper redirects to `/`; verify FILE step 6                                                                | pass   |
| REQ-26 | `tenant_admin` does not see factory identity list or other identities                          | Enter surface lists granted programmes only; no factory roster; nav hides `/identities`; verify FILE steps 1/7                                                            | pass   |
| REQ-27 | `platform_admin` still onboards programme + catalogue                                          | CAP-P `app/api/gateflow/programmes` not migrated to helper; `requirePlatformAdminSession`; nav `/programmes` remains; verify FILE step 6                                  | pass   |

## Boundary checks

| Rule                                                                                     | Source                       | Status                                                                                                            |
| ---------------------------------------------------------------------------------------- | ---------------------------- | ----------------------------------------------------------------------------------------------------------------- |
| Identity Bearer on `SESSION_COOKIE`; second cookie for entered ids; helper-only delivery | ADR-002 Option B             | pass — enter writes `PROGRAMME_CONTEXT_COOKIE` only; delivery BFF/RSC use helper; no `session.tenant_id` on those |
| UI primitives for enter + empty state                                                    | ADR-001                      | pass — `Card` / `Button` / `PageHeader` / `PageBody`                                                              |
| httpOnly session; client uses `authFetch` only                                           | nextjs-bff-server-auth.mdc   | pass — enter leaf calls `/api/auth/programme`; no `NEXT_PUBLIC_` upstream                                         |
| Enter under `app/api/auth/`; delivery stays `app/api/gateflow/`                          | nextjs-repository-layout.mdc | pass                                                                                                              |
| Named i18n                                                                               | no-hardcoded-strings.mdc     | pass — `programmes.json` enter/error keys; `workspace.json` `nav.enter`                                           |
| `"use client"` at enter leaf                                                             | typescript-react-style.mdc   | pass — `programme-enter.tsx` is the leaf; page is RSC                                                             |
| Unit vs live; new FILE 09; do not reuse 016 REQ-16                                       | testing-verify-flows.mdc     | pass — `programme-enter.test.ts` + `09`; 016 `04` not marked 017                                                  |
| Do not migrate CAP-P programmes BFF                                                      | WorkManifest W3 must-not     | pass — `app/api/gateflow/programmes` still platform onboard                                                       |
| Do not resurrect invite/attach                                                           | Ground-Report-W2             | pass — no `tenants/users` / attach restore                                                                        |

## Cross-spec contracts consumed

| Assumed contract                        | Source             | Match?                                                                                          |
| --------------------------------------- | ------------------ | ----------------------------------------------------------------------------------------------- |
| Entered-programme helper                | Ground-Report-W0   | yes — W3 **writes** the cookie and migrates delivery reads; helper still never reads JWT        |
| Programme-context cookie + login/logout | Ground-Report-W0   | yes — enter/leave set/clear; login/logout still clear; `SESSION_COOKIE` not reminted            |
| Me introspection                        | Ground-Report-W0   | yes — `enteredProgrammeId` / `enteredTenantId` from helper; JWT `tenantId` echo is not delivery |
| Identity session + Bearer               | Ground-Report-W0   | yes — `upstreamFetch` still sends identity Bearer                                               |
| Grants list/grant/detach                | Ground-Report-W2   | yes — grant BFF stays `platform_admin`; enter does not invent grant                             |
| Grant DTO / write refuses               | Ground-Report-W2   | yes — enter uses `stripGrantedProgramme` / `enterWriteRefuseKey`; no password                   |
| Membership chrome                       | Ground-Report-W2   | yes — enter is a different surface (`/programmes/enter`)                                        |
| Invite/attach absence                   | Ground-Report-W2   | yes — not resurrected                                                                           |
| Identity factory + nav                  | Ground-Report-W1   | yes — factory hidden from `tenant_admin`; enter nav added                                       |
| Platform-admin gate                     | W1 chassis         | yes — factory/grant stay `platform_admin`; enter refuses that actor                             |
| Gateflow CTR-04 HTTP paths              | Plan / unpublished | assumed `GET /api/v1/grants` + `POST /api/v1/programme-context`; fail-closed                    |

## Discrepancies (must fix before human checkpoint)

| ID  | REQ | Finding | Severity |
| --- | --- | ------- | -------- |
| —   | —   | none    | —        |

## Learning cited

| L-id | Class | How it affects this ground                                       |
| ---- | ----- | ---------------------------------------------------------------- |
| —    | —     | Learning-Extract has `items: []` (no human_fix); no L-\* to cite |

## Contracts produced by this wave

| Contract                 | Module / component                     | Entry point                             | Input shape                                      | Output shape                                                 | Invariants                                                                                         | Next wave                                    |
| ------------------------ | -------------------------------------- | --------------------------------------- | ------------------------------------------------ | ------------------------------------------------------------ | -------------------------------------------------------------------------------------------------- | -------------------------------------------- |
| Enter/leave BFF          | `app/api/auth/programme`               | `GET` / `POST` / `DELETE`               | `{ programmeId }` on enter; `op=leave` or DELETE | `{ programmes, entered }` or `{ ok, programmeId, tenantId }` | `tenant_admin` only; no password; no token in JSON; not-granted → named refuse                     | initiative-closure — do not remint session   |
| Granted-programme DTO    | `stripGrantedProgramme`                | list / enter responses                  | raw upstream object                              | `{ programmeId, tenantId, programmeName }`                   | Never copies `password` / `access_token`; fail-closed if ids missing                               | initiative-closure / future enter views      |
| Enter write refuses      | `enterWriteRefuseKey`                  | before upstream enter                   | `{ programmeId?, password? }`                    | named i18n key or null                                       | missing programme / password present                                                               | do not treat JWT `tenant_id` as enter input  |
| Programme-context cookie | `PROGRAMME_CONTEXT_COOKIE`             | enter set; leave / login / logout clear | `{ programmeId, tenantId }` JSON                 | httpOnly ids cookie or absent                                | Identity Bearer stays on `SESSION_COOKIE`; helper `null` when cookie absent                        | closure must not revert to JWT entered scope |
| Delivery helper seam     | delivery BFF + RSC pages               | `getEnteredProgrammeContext`            | cookie store                                     | `{ programmeId, tenantId }` or `null`                        | `null` → named `missingTenant` / redirect `/programmes/enter`; no JWT `tenant_id` as entered scope | last 017 wave — keep this seam               |
| Enter UI + role nav      | `ProgrammeEnter` + `/programmes/enter` | `tenant_admin` page + nav               | granted list from enter BFF                      | enter / leave / zero-grant empty state                       | No factory list; no password; `platform_admin` onboard nav unchanged                               | do not show factory to `tenant_admin`        |
| CAP-P onboard unchanged  | `app/api/gateflow/programmes`          | `GET` / `POST` platform programmes      | platform-admin session                           | programme list / create / catalogue                          | Not migrated to helper; include-into-delivery remains a `tenant_admin` act after enter             | REQ-27 stays platform onboard                |

## Exact-head merge package (for wave-signoff)

> Write the Ground Report and as-built updates **locally**. Emit Forge
> readiness for publication. Do **not** commit, push, merge, or apply labels
> from this skill. Human approved was `wave-acceptance`. At `wave-signoff`
> the human merges/publishes the **exact wave head** only.

- PR URL / wave head: https://github.com/drivestream-lab/gateflow-ops/pull/41 @ `f513dcd0aa8ad46d55bbe294b8b8c49d000c0e30` — **expected reviewed head SHA** (closeout publish may advance tip with this report)
- Ground Report path: `docs/specification/reports/Ground-Report-INIT-GATEFLOW-017-W3.md`
- Accept evidence: `wave-acceptance` on tip (wave-acceptance) — human approved already
- Wave-Execution path: `docs/specification/reports/Wave-Execution-INIT-GATEFLOW-017-W3.md`
- Optional/legacy Live-Verify path: n/a
- As-built: W3 `human_approved` from wave-acceptance (do not re-mark beyond recording status)
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

yes — after Forge publishes closeout artifacts to tip; merge remains human-only. This is the last 017 wave; next programme hop is initiative-closure after merge.

### Checks G1–G10

| ID  | Result                                                                 |
| --- | ---------------------------------------------------------------------- |
| G1  | PASS — W3 enter/rebind REQs only; no extra factory/grant scope         |
| G2  | PASS — ground_command N/A; manual + unit cited                         |
| G3  | PASS — all assigned REQs in checklist                                  |
| G4  | PASS — Wave-Execution + unit + wave-acceptance label                   |
| G5  | PASS — ADR-001 + ADR-002                                               |
| G6  | PASS — BFF/auth/i18n/layout/testing MDCs                               |
| G7  | PASS — contracts consumed + produced (7)                               |
| G8  | PASS — empty learning cited                                            |
| G9  | PASS — no GF-\* open                                                   |
| G10 | PASS — report written; as-built human_approved recorded; handoff below |

```yaml
handoff:
  contract: sdd-delivery/v2
  stage: ground-spec
  outcome: pass
  artifact:
    path: docs/specification/reports/Ground-Report-INIT-GATEFLOW-017-W3.md
  blockers: []
  signals:
    wave: W3
    contracts_produced: 7
    assigned_reqs:
      - REQ-16
      - REQ-17
      - REQ-18
      - REQ-19
      - REQ-22
      - REQ-23
      - REQ-26
      - REQ-27
    tip_sha: f513dcd0aa8ad46d55bbe294b8b8c49d000c0e30
    pr_url: https://github.com/drivestream-lab/gateflow-ops/pull/41
    learning_extract: docs/specification/reports/Learning-Extract-INIT-GATEFLOW-017-W3.md
    codegraph_provider: mcp-prayog-fleet-cbm
    grounding_depth: light
  next_candidates:
    - wave-done-action
  human_checkpoint: false
  external_action: true
  forge:
    action: update_board_status
    ticket: https://github.com/drivestream-lab/gateflow-ops/issues/37
```
