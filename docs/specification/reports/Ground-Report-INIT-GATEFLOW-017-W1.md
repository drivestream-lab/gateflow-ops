# Ground report — INIT-GATEFLOW-017 W1

| Field             | Value                                                                                                                         |
| ----------------- | ----------------------------------------------------------------------------------------------------------------------------- |
| Wave              | W1 — Identity factory                                                                                                         |
| Spec              | `docs/specification/product/INIT-GATEFLOW-017-gateflow-ops.md`                                                                |
| Initiative        | INIT-GATEFLOW-017                                                                                                             |
| Date              | 2026-08-14                                                                                                                    |
| Wave head (exact) | `feature/INIT-GATEFLOW-017-w1-identity-factory` @ `9bf3c867728a28d4edad76c0def2d15064082bbb` — reviewed head for sign-off     |
| PR URL (if any)   | https://github.com/drivestream-lab/gateflow-ops/pull/39 — read-only context                                                   |
| Status            | Draft                                                                                                                         |
| Review deadline   | 2026-08-18                                                                                                                    |
| Deciders          | Tech lead / reviewer: PE — explicit LGTM required at merge discretion                                                         |
| Outcome           | pass                                                                                                                          |
| Outcome reason    | Wave-assigned factory REQs map to BFF, UI, units, and verify FILE; ADR-001/002 + MDC hold; Contracts produced complete for W2 |
| Assigned REQs     | REQ-01, REQ-02, REQ-03, REQ-04, REQ-05, REQ-12, REQ-13, REQ-14, REQ-22, REQ-25, REQ-29, REQ-30                                |

## Evidence sources (separate layers)

| Layer  | Source                                                       | Summary                                                                                               |
| ------ | ------------------------------------------------------------ | ----------------------------------------------------------------------------------------------------- |
| Unit   | `make test` / Wave-Execution proof                           | 71 tests green including `identities-bff.test.ts` (12) and nav hrefs in `platform-programmes.test.ts` |
| Ground | N/A ground_command — manual `source_roots` + `tests/**` scan | Identities BFF, list/detail UI, nav, locales, verify FILE present                                     |
| Accept | `wave-acceptance` label on PR #39 tip `9bf3c86…`             | Enter-at Pass-2; human_approved recorded at wave-acceptance (not re-marked here)                      |

## Automated ground check output

`ground_command` is N/A (no Makefile ground target). Manual scan:

- `app/api/gateflow/identities/route.ts` — list/search/create; `identityCreateRefuseKey`; `stripIdentitySecrets`; `filterIdentitiesByQuery`; create body forces `role: tenant_admin`
- `app/api/gateflow/identities/by-id/route.ts` — detail + `op=suspend|unsuspend|password-set`; `identityPasswordRefuseKey`
- `app/(dashboard)/identities/page.tsx` — RSC; `isPlatformAdmin` else redirect `/`
- `components/identities/identity-list.tsx` / `identity-detail.tsx` — enter, search, suspend, unsuspend, password-set; no grant controls
- `hooks/use-identities.ts` — `authFetch` to same-origin `/api/gateflow/identities*`
- `lib/workspace-nav.ts` — `/identities` for `platform_admin` only
- `lib/constants.ts` — `IDENTITIES_PAGE_SIZE_DEFAULT` / `IDENTITIES_PAGE_SIZE_MAX`
- `tests/unit/identities-bff.test.ts` — refuse, strip, search filter
- `tests/verify/07-identity-factory.md` — `prayog:covers: REQ-01, REQ-02, REQ-04, REQ-05, REQ-12, REQ-13, REQ-14, REQ-22, REQ-25, REQ-29, REQ-30`
- `make test` 2026-08-14 (Pass-1 / Wave-Execution): exit 0, 71 passed

## REQ checklist (wave-assigned only)

| REQ    | Spec claim                                                                | Verified artifact                                                                                                                              | Status |
| ------ | ------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------- | ------ |
| REQ-01 | `platform_admin` enters a human (name, email, password) with no programme | `POST /api/gateflow/identities` body `{ name, email, password, role: tenant_admin }`; UI enter form has no programme field; verify FILE step 3 | pass   |
| REQ-02 | Email unique as factory sign-in identifier                                | Upstream 409 → `identities.errors.duplicateEmail`; verify FILE step 4                                                                          | pass   |
| REQ-03 | Login identifier must be an email on entry                                | `identityCreateRefuseKey` reuses `isEmailIdentifier`; unit empty / no-`@` / no-domain; verify FILE negative                                    | pass   |
| REQ-04 | List/search by name contains or email exact                               | `filterIdentitiesByQuery`; `GET ?q=`; unit cases; verify FILE step 5; empty match is empty list                                                | pass   |
| REQ-05 | Entry creates `tenant_admin`, never `platform_admin`                      | Create POST always sends `role: tenant_admin`; list/detail show role; verify FILE step 3                                                       | pass   |
| REQ-12 | Suspend stops sign-in and product acts                                    | `POST by-id?op=suspend` → upstream `…/{id}/suspend`; detail UI; verify FILE step 6. Session-death chassis remains W0 cookies                   | pass   |
| REQ-13 | Unsuspend restores sign-in; grants unchanged                              | `POST by-id?op=unsuspend`; no grant mutation on this surface; verify FILE step 7                                                               | pass   |
| REQ-14 | Password set; prior sign-in stops                                         | `POST by-id?op=password-set` with write-only password; verify FILE step 8. Logout/context-clear chassis is W0                                  | pass   |
| REQ-22 | `tenant_admin` cannot enter/suspend/set password or see factory list      | `requirePlatformAdminSession` remapped to `identities.errors.wrongActor`; page redirect; nav role filter; unit nav hrefs; verify FILE step 9   | pass   |
| REQ-25 | Name required at entry                                                    | `identityCreateRefuseKey` → `identities.errors.missingName`; unit; verify FILE negative                                                        | pass   |
| REQ-29 | Entry / password-set without password refused                             | create + `identityPasswordRefuseKey`; unit; verify FILE negative                                                                               | pass   |
| REQ-30 | Password never returned on list/search/detail                             | `stripIdentitySecrets` whitelist DTO; unit omits `password` / `access_token`; verify FILE steps 3/8                                            | pass   |

## Boundary checks

| Rule                                                                                       | Source                       | Status                                                                                           |
| ------------------------------------------------------------------------------------------ | ---------------------------- | ------------------------------------------------------------------------------------------------ |
| Identity Bearer on `SESSION_COOKIE` only; helper unused; no delivery `tenant_id` migration | ADR-002 Option B             | pass — factory BFF uses `upstreamFetch` / session token; `getEnteredProgrammeContext` not called |
| UI primitives for factory pages                                                            | ADR-001                      | pass — `Card` / `Button` / `Input` / `Label`; `PageHeader` / `PageBody`                          |
| httpOnly session; client uses `authFetch` only                                             | nextjs-bff-server-auth.mdc   | pass — hook calls `/api/gateflow/identities*`; no `NEXT_PUBLIC_` upstream                        |
| BFF under `app/api/gateflow/`                                                              | nextjs-repository-layout.mdc | pass                                                                                             |
| Named i18n; identities catalog                                                             | no-hardcoded-strings.mdc     | pass — `data/locales/en/identities.json` + `lib/i18n.ts`                                         |
| List skip/limit from constants                                                             | shared-limits-pagination.mdc | pass — `IDENTITIES_PAGE_SIZE_*` / `PAGINATION`                                                   |
| `"use client"` at list/detail leaves                                                       | typescript-react-style.mdc   | pass — page is RSC                                                                               |
| Unit vs live; new FILE 07; do not reuse 016 markers                                        | testing-verify-flows.mdc     | pass — `identities-bff.test.ts` + `07-identity-factory.md`                                       |
| No grant/enter screens                                                                     | WorkManifest W1 must-not     | pass — no grant/detach/enter UI or BFF                                                           |

## Cross-spec contracts consumed

| Assumed contract                          | Source                                | Match?                                                                                      |
| ----------------------------------------- | ------------------------------------- | ------------------------------------------------------------------------------------------- |
| Email-shape refuse / `isEmailIdentifier`  | Ground-Report-W0                      | yes — reused on factory entry                                                               |
| Identity session + Bearer `upstreamFetch` | Ground-Report-W0                      | yes                                                                                         |
| Platform-admin gate                       | chassis `requirePlatformAdminSession` | yes — 403 remapped to `identities.errors.wrongActor`                                        |
| Workspace shell + nav                     | 016 / W0 chassis                      | yes — `/identities` added for `platform_admin`                                              |
| Entered-programme helper                  | Ground-Report-W0                      | yes — **unused in W1** (no delivery rebind)                                                 |
| Gateflow CTR-01 HTTP paths                | Plan FF-04 / unconfirmed              | assumed `GET`/`POST /api/v1/identities` + action suffixes; fail-closed on unexpected fields |

## Discrepancies (must fix before human checkpoint)

| ID  | REQ | Finding | Severity |
| --- | --- | ------- | -------- |
| —   | —   | none    | —        |

## Learning cited

| L-id | Class | How it affects this ground                                       |
| ---- | ----- | ---------------------------------------------------------------- |
| —    | —     | Learning-Extract has `items: []` (no human_fix); no L-\* to cite |

## Contracts produced by this wave

| Contract                     | Module / component                  | Entry point                                   | Input shape                                                  | Output shape                                         | Invariants                                                                                     | Next wave                                     |
| ---------------------------- | ----------------------------------- | --------------------------------------------- | ------------------------------------------------------------ | ---------------------------------------------------- | ---------------------------------------------------------------------------------------------- | --------------------------------------------- |
| Identity factory list/create | `app/api/gateflow/identities`       | `GET` / `POST /api/gateflow/identities`       | query `q`, `skip`, `limit`; body `{ name, email, password }` | `{ identities: IdentityDto[] }` or one `IdentityDto` | `platform_admin` only; create sends `role: tenant_admin`; no programme grant; secrets stripped | W2 grants attach to these ids                 |
| Identity detail + actions    | `app/api/gateflow/identities/by-id` | `GET` / `POST /api/gateflow/identities/by-id` | query `id`; `op` = `suspend` / `unsuspend` / `password-set`  | `IdentityDto` or `{ ok, id }`                        | Password write-only; 403 → `wrongActor`; unknown id named refuse                               | W2 membership must not invent grant via these |
| Identity DTO                 | `stripIdentitySecrets`              | list / create / detail / action responses     | raw upstream object                                          | `{ id, name, email, role, suspended }`               | Never copies `password` / `access_token`; fail-closed if id/name/email missing                 | W2 membership views (REQ-30)                  |
| Factory create refuses       | `identityCreateRefuseKey`           | before upstream create                        | `{ name?, email?, password? }`                               | named i18n key or null                               | missing name / not an email / missing password; duplicate email from upstream 409              | W2 must not bypass on grant                   |
| Factory UI + nav             | `/identities` + `navItemsForRole`   | page + list/detail leaves                     | session role                                                 | list/enter/search; detail via `?id=`                 | `tenant_admin` redirected; no grant/enter controls; password fields are write-only             | W2 adds grant UI on a different surface       |

## Exact-head merge package (for wave-signoff)

> Write the Ground Report and as-built updates **locally**. Emit Forge
> readiness for publication. Do **not** commit, push, merge, or apply labels
> from this skill. Human approved was `wave-acceptance`. At `wave-signoff`
> the human merges/publishes the **exact wave head** only.

- PR URL / wave head: https://github.com/drivestream-lab/gateflow-ops/pull/39 @ `9bf3c867728a28d4edad76c0def2d15064082bbb` — **expected reviewed head SHA** (closeout publish may advance tip with this report)
- Ground Report path: `docs/specification/reports/Ground-Report-INIT-GATEFLOW-017-W1.md`
- Accept evidence: `wave-acceptance` on tip (wave-acceptance) — human approved already
- Wave-Execution path: `docs/specification/reports/Wave-Execution-INIT-GATEFLOW-017-W1.md`
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

| ID  | Result                                                                 |
| --- | ---------------------------------------------------------------------- |
| G1  | PASS — W1 factory REQs only; no grant/enter (W2/W3)                    |
| G2  | PASS — ground_command N/A; manual + unit cited                         |
| G3  | PASS — all assigned REQs in checklist                                  |
| G4  | PASS — Wave-Execution + unit + wave-acceptance label                   |
| G5  | PASS — ADR-001 + ADR-002                                               |
| G6  | PASS — BFF/auth/i18n/layout/pagination/testing MDCs                    |
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
    path: docs/specification/reports/Ground-Report-INIT-GATEFLOW-017-W1.md
  blockers: []
  signals:
    wave: W1
    contracts_produced: 5
    assigned_reqs:
      - REQ-01
      - REQ-02
      - REQ-03
      - REQ-04
      - REQ-05
      - REQ-12
      - REQ-13
      - REQ-14
      - REQ-22
      - REQ-25
      - REQ-29
      - REQ-30
    tip_sha: 9bf3c867728a28d4edad76c0def2d15064082bbb
    pr_url: https://github.com/drivestream-lab/gateflow-ops/pull/39
    learning_extract: docs/specification/reports/Learning-Extract-INIT-GATEFLOW-017-W1.md
  next_candidates:
    - wave-done-action
  human_checkpoint: false
  external_action: true
  forge:
    action: update_board_status
    ticket: https://github.com/drivestream-lab/gateflow-ops/issues/35
```
