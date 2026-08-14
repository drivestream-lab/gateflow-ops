# Ground report — INIT-GATEFLOW-017 W2

| Field             | Value                                                                                                                          |
| ----------------- | ------------------------------------------------------------------------------------------------------------------------------ |
| Wave              | W2 — Grants and purge invite/attach                                                                                            |
| Spec              | `docs/specification/product/INIT-GATEFLOW-017-gateflow-ops.md`                                                                 |
| Initiative        | INIT-GATEFLOW-017                                                                                                              |
| Date              | 2026-08-14                                                                                                                     |
| Wave head (exact) | `feature/INIT-GATEFLOW-017-w2-grants-purge` @ `44eb6bd6550577601dbcdc75989c17a843b07c96` — reviewed head for sign-off          |
| PR URL (if any)   | https://github.com/drivestream-lab/gateflow-ops/pull/40 — read-only context                                                    |
| Status            | Draft                                                                                                                          |
| Review deadline   | 2026-08-18                                                                                                                     |
| Deciders          | Tech lead / reviewer: PE — explicit LGTM required at merge discretion                                                          |
| Outcome           | pass                                                                                                                           |
| Outcome reason    | Wave-assigned grant/purge REQs map to BFF, membership UI, units, and verify FILE; ADR-001/002 + MDC hold; Contracts produced complete for W3 |
| Assigned REQs     | REQ-06, REQ-07, REQ-08, REQ-09, REQ-10, REQ-11, REQ-15, REQ-20, REQ-21, REQ-24, REQ-28, REQ-30                                 |

## Evidence sources (separate layers)

| Layer  | Source                                                       | Summary                                                                                          |
| ------ | ------------------------------------------------------------ | ------------------------------------------------------------------------------------------------ |
| Unit   | `make test` / Wave-Execution proof                           | 79 tests green including `grants-bff.test.ts` (9)                                                |
| Ground | N/A ground_command — manual `source_roots` + `tests/**` scan | Grants BFF, membership panel, invite/attach absent, verify FILE present                          |
| Accept | `wave-acceptance` label on PR #40 tip `44eb6bd…`             | Enter-at Pass-2; human_approved recorded at wave-acceptance (not re-marked here)                 |

## Automated ground check output

`ground_command` is N/A (no Makefile ground target). Manual scan:

- `app/api/gateflow/grants/route.ts` — `GET`/`POST`; detach via `?op=detach` → upstream `DELETE /api/v1/grants`; `grantWriteRefuseKey`; `stripGrantSecrets`; `grantUpstreamRefuseKey`; 409 grant treated as idempotent success
- `components/grants/membership-panel.tsx` — programme-side and identity-side membership; grant form has no password field
- `hooks/use-grants.ts` — `authFetch` to same-origin `/api/gateflow/grants*`
- `data/locales/en/grants.json` + `lib/i18n.ts` catalog `grants`
- `components/programmes/programme-detail.tsx` / `components/identities/identity-detail.tsx` — host `MembershipPanel`; no attach/password collect
- `components/tenant/tenant-detail.tsx` — no invite control
- Deleted: `app/api/gateflow/tenants/users/route.ts`, `lib/programme-attach.ts`, `app/api/gateflow/programmes/[programmeId]/tenant-admins/route.ts`
- `tests/unit/grants-bff.test.ts` — refuse, strip, 409 mapping
- `tests/verify/08-grants-membership.md` — `prayog:covers: REQ-06, REQ-07, REQ-08, REQ-09, REQ-10, REQ-11, REQ-15, REQ-20, REQ-21, REQ-24, REQ-28, REQ-30`
- `make test` 2026-08-14 (closeout re-run): exit 0, 79 passed
- Codegraph `mcp-prayog-fleet-cbm` (`data-repos-prayog-gateflow-ops`) is **stale** (still indexes deleted attach/invite symbols). Direct `source_roots` reads are ground truth; those paths are absent.

## REQ checklist (wave-assigned only)

| REQ    | Spec claim                                                                 | Verified artifact                                                                                                                                     | Status |
| ------ | -------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------- | ------ |
| REQ-06 | Grant existing identity to a programme; no password; seeded admin not grantable | `POST /api/gateflow/grants` body `{ identityId \| email, programmeId }` — no password; `grantWriteRefuseKey` → `passwordNotAllowed` / `platformAdminNotGrantable`; membership form has no password; verify FILE steps 2/7 | pass   |
| REQ-07 | Repeat grant is idempotent                                                 | Grant POST treats upstream 409 as `{ …dto, idempotent: true }`; unit 409 mapping; verify FILE step 3                                                  | pass   |
| REQ-08 | Unknown identity cannot be granted                                         | `grantWriteRefuseKey` / `grantUpstreamRefuseKey` → `grants.errors.unknownIdentity`; unit; verify FILE step 5                                          | pass   |
| REQ-09 | One identity may be granted more than one programme                        | `GET ?identity_id=` returns a list; UI lists multiple rows; verify FILE step 4                                                                        | pass   |
| REQ-10 | Detach identity from a programme                                           | `POST /api/gateflow/grants?op=detach` → upstream `DELETE`; identity/other grants not wiped; verify FILE step 9                                        | pass   |
| REQ-11 | Membership visible without opening delivery                                | `MembershipPanel` on programme detail and identity detail; no delivery navigation required; verify FILE steps 1/11                                    | pass   |
| REQ-15 | Detach/suspend does not cancel in-flight waves                             | Detach mutates grants only — no wave-cancel entry point; verify FILE step 10; human accept on tip                                                     | pass   |
| REQ-20 | No invite act in this console                                              | `tenants/users` route absent; tenant detail has no invite; verify FILE step 12; 016 `02` invite step stripped                                         | pass   |
| REQ-21 | Membership not created by create+bind attach                               | `programme-attach` and `tenant-admins` absent; programme detail has no attach+password; verify FILE step 13; 016 `03` attach stripped                 | pass   |
| REQ-24 | Suspended identity may still be granted or detached                        | Grant/detach BFF does not gate on suspended; verify FILE step 8                                                                                       | pass   |
| REQ-28 | Grant/detach of unknown programme refused                                  | `grantWriteRefuseKey` / upstream 404 programme → `grants.errors.unknownProgramme`; unit; verify FILE step 6                                           | pass   |
| REQ-30 | Password never returned on membership views                                | `stripGrantSecrets` whitelist DTO; unit omits `password` / `access_token`; hook POST body has no password; verify FILE steps 1/2/11                   | pass   |

## Boundary checks

| Rule                                                                                       | Source                       | Status                                                                                                      |
| ------------------------------------------------------------------------------------------ | ---------------------------- | ----------------------------------------------------------------------------------------------------------- |
| Identity Bearer on `SESSION_COOKIE` only; helper unused; no delivery `tenant_id` migration | ADR-002 Option B             | pass — grants BFF uses `upstreamFetch` / session token; `getEnteredProgrammeContext` not called from grants |
| UI primitives for membership                                                               | ADR-001                      | pass — `Card` / `Button` / `Input` / `Label` on `MembershipPanel`                                           |
| httpOnly session; client uses `authFetch` only                                             | nextjs-bff-server-auth.mdc   | pass — hook calls `/api/gateflow/grants*`; no `NEXT_PUBLIC_` upstream                                       |
| BFF under `app/api/gateflow/`                                                              | nextjs-repository-layout.mdc | pass                                                                                                        |
| Named i18n; grants catalog                                                                 | no-hardcoded-strings.mdc     | pass — `data/locales/en/grants.json` + `lib/i18n.ts`                                                        |
| `"use client"` at membership leaf                                                          | typescript-react-style.mdc   | pass — panel/hook are leaves                                                                                |
| Unit vs live; new FILE 08; do not reuse 016 markers as 017 coverage                        | testing-verify-flows.mdc     | pass — `grants-bff.test.ts` + `08-grants-membership.md`; 016 `02`/`03` stripped                             |
| No programme-enter / cookie write                                                          | WorkManifest W2 must-not     | pass — `PROGRAMME_CONTEXT_COOKIE` not written on grant                                                      |

## Cross-spec contracts consumed

| Assumed contract                          | Source               | Match?                                                                                         |
| ----------------------------------------- | -------------------- | ---------------------------------------------------------------------------------------------- |
| Identity factory list/create              | Ground-Report-W1     | yes — grant names existing `identityId` / email; does not create a factory identity            |
| Identity detail + actions                 | Ground-Report-W1     | yes — suspend/unsuspend/password-set unchanged; grant is a different surface                   |
| Identity DTO (`stripIdentitySecrets`)     | Ground-Report-W1     | yes — membership uses `stripGrantSecrets`; never copies password                               |
| Factory create refuses                    | Ground-Report-W1     | yes — grant does not bypass factory entry; unknown identity refused                            |
| Factory UI + nav                          | Ground-Report-W1     | yes — grant UI is `MembershipPanel` on detail pages, not a new nav href                        |
| Identity session + Bearer `upstreamFetch` | Ground-Report-W0     | yes                                                                                            |
| Entered-programme helper                  | Ground-Report-W0     | yes — **unused in W2** (no delivery rebind)                                                    |
| Platform-admin gate                       | W1 chassis           | yes — `requirePlatformAdminSession`; 403 → `grants.errors.wrongActor`                          |
| Gateflow CTR-02 HTTP paths                | Plan / unpublished   | assumed `GET`/`POST`/`DELETE /api/v1/grants`; fail-closed on unexpected fields                 |

## Discrepancies (must fix before human checkpoint)

| ID  | REQ | Finding | Severity |
| --- | --- | ------- | -------- |
| —   | —   | none    | —        |

## Learning cited

| L-id | Class | How it affects this ground                                       |
| ---- | ----- | ---------------------------------------------------------------- |
| —    | —     | Learning-Extract has `items: []` (no human_fix); no L-\* to cite |

## Contracts produced by this wave

| Contract                | Module / component            | Entry point                              | Input shape                                              | Output shape                                              | Invariants                                                                                          | Next wave                                                          |
| ----------------------- | ----------------------------- | ---------------------------------------- | -------------------------------------------------------- | --------------------------------------------------------- | --------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------ |
| Grants list/grant/detach | `app/api/gateflow/grants`    | `GET` / `POST /api/gateflow/grants`      | query `identity_id` and/or `programme_id`; body `{ identityId \| email, programmeId }`; `op=detach` | `{ grants: GrantDto[] }` or one `GrantDto` (`idempotent` on repeat grant) | `platform_admin` only; no password on grant; 409 grant is success; detach is not a wipe             | W3 enter lists these grants; must not invent grant via identities  |
| Grant DTO               | `stripGrantSecrets`           | list / grant / detach responses          | raw upstream object                                      | `{ identityId, programmeId, email, name, programmeName }` | Never copies `password` / `access_token`; fail-closed if identity/programme ids missing             | W3 membership / enter views (REQ-30)                               |
| Grant write refuses     | `grantWriteRefuseKey`         | before upstream grant/detach             | `{ identityId?, email?, programmeId?, password?, role? }` | named i18n key or null                                    | missing identity / missing programme / password present / `role: platform_admin`                    | W3 must not bypass on enter                                        |
| Membership chrome       | `MembershipPanel` + `use-grants` | programme detail + identity detail     | `programmeId` or `identityId`                            | identities ↔ programmes; grant/detach actions             | No password field; no delivery navigation required; `tenant_admin` refused at BFF                   | W3 adds enter on a different surface                               |
| Invite/attach absence   | deleted invite + attach paths | leftover `tenants/users` / `tenant-admins` | any actor                                                | 404 / no UI control                                       | Invite and create+bind attach are gone; 016 `02`/`03` no longer prove those acts                    | W3 must not resurrect invite/attach; delivery minus invite remains |

## Exact-head merge package (for wave-signoff)

> Write the Ground Report and as-built updates **locally**. Emit Forge
> readiness for publication. Do **not** commit, push, merge, or apply labels
> from this skill. Human approved was `wave-acceptance`. At `wave-signoff`
> the human merges/publishes the **exact wave head** only.

- PR URL / wave head: https://github.com/drivestream-lab/gateflow-ops/pull/40 @ `44eb6bd6550577601dbcdc75989c17a843b07c96` — **expected reviewed head SHA** (closeout publish may advance tip with this report)
- Ground Report path: `docs/specification/reports/Ground-Report-INIT-GATEFLOW-017-W2.md`
- Accept evidence: `wave-acceptance` on tip (wave-acceptance) — human approved already
- Wave-Execution path: `docs/specification/reports/Wave-Execution-INIT-GATEFLOW-017-W2.md`
- Optional/legacy Live-Verify path: n/a
- As-built: W2 `human_approved` from wave-acceptance (do not re-mark beyond recording status)
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

| ID  | Result                                                                 |
| --- | ---------------------------------------------------------------------- |
| G1  | PASS — W2 grant/purge REQs only; no programme-enter (W3)               |
| G2  | PASS — ground_command N/A; manual + unit cited                         |
| G3  | PASS — all assigned REQs in checklist                                  |
| G4  | PASS — Wave-Execution + unit + wave-acceptance label                   |
| G5  | PASS — ADR-001 + ADR-002                                               |
| G6  | PASS — BFF/auth/i18n/layout/testing MDCs                               |
| G7  | PASS — contracts consumed + produced (5)                               |
| G8  | PASS — empty learning cited                                            |
| G9  | PASS — no GF-\* open                                                   |
| G10 | PASS — report written; as-built human_approved recorded; handoff below |

```yaml
handoff:
  contract: sdd-delivery/v2
  stage: ground-spec
  outcome: pass
  artifact:
    path: docs/specification/reports/Ground-Report-INIT-GATEFLOW-017-W2.md
  blockers: []
  signals:
    wave: W2
    contracts_produced: 5
    assigned_reqs:
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
    tip_sha: 44eb6bd6550577601dbcdc75989c17a843b07c96
    pr_url: https://github.com/drivestream-lab/gateflow-ops/pull/40
    learning_extract: docs/specification/reports/Learning-Extract-INIT-GATEFLOW-017-W2.md
    codegraph_provider: mcp-prayog-fleet-cbm
    grounding_depth: light
  next_candidates:
    - wave-done-action
  human_checkpoint: false
  external_action: true
  forge:
    action: update_board_status
    ticket: https://github.com/drivestream-lab/gateflow-ops/issues/36
```
