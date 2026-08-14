# Ground report — INIT-GATEFLOW-017 W0

| Field             | Value                                                                                                                                                    |
| ----------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Wave              | W0 — Programme-context chassis                                                                                                                           |
| Spec              | `docs/specification/product/INIT-GATEFLOW-017-gateflow-ops.md`                                                                                           |
| Initiative        | INIT-GATEFLOW-017                                                                                                                                        |
| Date              | 2026-08-14                                                                                                                                               |
| Wave head (exact) | `feature/INIT-GATEFLOW-017-w0-programme-context` @ `ab5dbde8a1df352d54fb88a2942d22a401563680` — reviewed head for sign-off                               |
| PR URL (if any)   | https://github.com/drivestream-lab/gateflow-ops/pull/38 — read-only context                                                                              |
| Status            | Draft                                                                                                                                                    |
| Review deadline   | 2026-08-18                                                                                                                                               |
| Deciders          | Tech lead / reviewer: PE — explicit LGTM required at merge discretion                                                                                    |
| Outcome           | pass                                                                                                                                                     |
| Outcome reason    | Wave-assigned REQ-03/12/14/18 chassis halves map to helper, login mapper, units, and verify FILE; ADR-002 + MDC hold; Contracts produced complete for W1 |
| Assigned REQs     | REQ-03, REQ-12, REQ-14, REQ-18                                                                                                                           |

## Evidence sources (separate layers)

| Layer  | Source                                                       | Summary                                                                                        |
| ------ | ------------------------------------------------------------ | ---------------------------------------------------------------------------------------------- |
| Unit   | `make test` / Wave-Execution proof                           | 59 tests green including `programme-context.test.ts` (5) and `auth-login-upstream.test.ts` (4) |
| Ground | N/A ground_command — manual `source_roots` + `tests/**` scan | Helper, env cookie name, login/logout/me, email-shape mapper, verify FILE present              |
| Accept | `wave-acceptance` label on PR #38 tip `ab5dbde8…`            | Enter-at Pass-2; human_approved recorded at wave-acceptance (not re-marked here)               |

## Automated ground check output

`ground_command` is N/A (no Makefile ground target). Manual scan:

- `lib/programme-context.ts` — `parseEnteredProgrammeContextCookie` / `getEnteredProgrammeContext`; never reads JWT `tenant_id`
- `lib/env.ts` — `PROGRAMME_CONTEXT_COOKIE` default `portal_programme_context`
- `app/api/auth/login/route.ts` — `portalLoginRefuseKey` before upstream; clears context cookie; `dev-stub` omits `tenant_id`
- `app/api/auth/logout/route.ts` — deletes session cookie; expires context cookie
- `app/api/auth/me/route.ts` — echoes non-secret entered ids; no token fields
- `lib/auth-login-upstream.ts` — email-shape refuse → `auth.errors.notAnEmail`
- `tests/unit/programme-context.test.ts`, `tests/unit/auth-login-upstream.test.ts`
- `tests/verify/01-login-status-page.md` — `prayog:covers: REQ-03, REQ-12, REQ-14, REQ-18`
- `make test` 2026-08-14 (Pass-1 / Wave-Execution): exit 0, 59 passed

## REQ checklist (wave-assigned only)

| REQ    | Spec claim                                                      | Verified artifact                                                                                                                                    | Status |
| ------ | --------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------- | ------ |
| REQ-03 | Login identifier must be an email (sign-in half)                | `portalLoginRefuseKey` / `toUpstreamLoginBody`; unit empty / no-`@` / no-domain; verify FILE step 6; login returns named i18n before `upstreamFetch` | pass   |
| REQ-12 | Suspended identity cannot continue acts (session-death chassis) | Login/logout expire `PROGRAMME_CONTEXT_COOKIE`; helper `null` when cookie absent; verify FILE step 8. Suspend BFF is W1                              | pass   |
| REQ-14 | Password set stops prior sign-in (logout/context-clear chassis) | Logout + login clear context cookie so prior entered ids cannot linger; unit helper malformed/absent → `null`. Password-set BFF is W1                | pass   |
| REQ-18 | Zero programmes: signed in; no delivery (helper-null chassis)   | After login, helper is `null`; `/api/auth/me` `enteredProgrammeId` / `enteredTenantId` are `null`; verify FILE step 7. Named empty-state UI is W3    | pass   |

## Boundary checks

| Rule                                                                                                  | Source                       | Status                                                                                                    |
| ----------------------------------------------------------------------------------------------------- | ---------------------------- | --------------------------------------------------------------------------------------------------------- |
| Identity Bearer on `SESSION_COOKIE` only; second cookie for entered ids; helper never JWT `tenant_id` | ADR-002 Option B             | pass — `getEnteredProgrammeContext` parses JSON cookie only; `upstreamFetch` still uses `getSessionToken` |
| `dev-stub` must not stamp grant-implying `tenant_id`                                                  | ADR-002                      | pass — stub payload has `sub`, `email`, `exp` only                                                        |
| httpOnly session; no browser JWT                                                                      | nextjs-bff-server-auth.mdc   | pass — cookies set httpOnly; me JSON has no tokens                                                        |
| Named i18n refuse, no hardcoded error                                                                 | no-hardcoded-strings.mdc     | pass — `auth.errors.notAnEmail` in `data/locales/en/auth.json`                                            |
| Unit vs live separation                                                                               | testing-verify-flows.mdc     | pass — parsers in unit; cookie journey in verify FILE                                                     |
| Portal session under `app/api/auth/`                                                                  | nextjs-repository-layout.mdc | pass                                                                                                      |

## Cross-spec contracts consumed

| Assumed contract                                                     | Source                                          | Match?                                 |
| -------------------------------------------------------------------- | ----------------------------------------------- | -------------------------------------- |
| Identity session cookie + `getSessionToken` / `upstreamFetch` Bearer | Chassis source (no prior 017 Ground Report)     | yes                                    |
| Login mapper `toUpstreamLoginBody`                                   | Pre-implement W0 / `lib/auth-login-upstream.ts` | yes — extended with email-shape refuse |
| Gateflow CTR-01 / CTR-02 / CTR-04 HTTP                               | Plan FF-04                                      | N/A — W0 does not call those routes    |
| Delivery JWT `tenant_id` reads                                       | Live delivery BFF/RSC                           | yes — left in place until W3 (RISK-02) |

## Discrepancies (must fix before human checkpoint)

| ID  | REQ | Finding | Severity |
| --- | --- | ------- | -------- |
| —   | —   | none    | —        |

## Learning cited

| L-id | Class | How it affects this ground                                      |
| ---- | ----- | --------------------------------------------------------------- |
| —    | —     | Learning-Extract has `items: []` (no human_fix); no L-* to cite |

## Contracts produced by this wave

| Contract                 | Module / component                | Entry point                                                         | Input shape                      | Output shape                                                                     | Invariants                                                                   | Next wave                                      |
| ------------------------ | --------------------------------- | ------------------------------------------------------------------- | -------------------------------- | -------------------------------------------------------------------------------- | ---------------------------------------------------------------------------- | ---------------------------------------------- |
| Entered-programme helper | `lib/programme-context`           | `getEnteredProgrammeContext` / `parseEnteredProgrammeContextCookie` | cookie store / raw cookie string | `{ programmeId, tenantId }` or `null`                                            | Never reads JWT `tenant_id`; malformed/absent → `null`; no network           | W1 (exists unused); W3 migrates delivery reads |
| Programme-context cookie | `lib/env` + login/logout          | `PROGRAMME_CONTEXT_COOKIE` (default `portal_programme_context`)     | login/logout response            | cookie expired (`maxAge` 0) on login and logout                                  | httpOnly, sameSite lax, path `/`; not a Bearer                               | W3 writes entered ids                          |
| Email-shape login refuse | `lib/auth-login-upstream`         | `portalLoginRefuseKey` / `toUpstreamLoginBody`                      | `{ email?, password? }`          | named i18n key or mapped `{ credential_identifier, password }`                   | Empty / no `@` / no domain → `auth.errors.notAnEmail`; no upstream on refuse | W1 entry-side email-shape                      |
| Me introspection         | `GET /api/auth/me`                | session + helper                                                    | session cookie                   | `{ sub, email, tenantId, role, expiresAt, enteredProgrammeId, enteredTenantId }` | No `access_token` / raw JWT; entered ids from helper only                    | W1+ clients; W3 when cookie is written         |
| Identity stub token      | `POST /api/auth/login` `dev-stub` | email                                                               | unsigned JWT                     | no `tenant_id` claim                                                             | Must not substitute for helper                                               | W1 lab / local                                 |

## Exact-head merge package (for wave-signoff)

> Write the Ground Report and as-built updates **locally**. Emit Forge
> readiness for publication. Do **not** commit, push, merge, or apply labels
> from this skill. Human approved was `wave-acceptance`. At `wave-signoff`
> the human merges/publishes the **exact wave head** only.

- PR URL / wave head: https://github.com/drivestream-lab/gateflow-ops/pull/38 @ `ab5dbde8a1df352d54fb88a2942d22a401563680` — **expected reviewed head SHA** (closeout publish may advance tip with this report)
- Ground Report path: `docs/specification/reports/Ground-Report-INIT-GATEFLOW-017-W0.md`
- Accept evidence: `wave-acceptance` on tip (wave-acceptance) — human approved already
- Wave-Execution path: `docs/specification/reports/Wave-Execution-INIT-GATEFLOW-017-W0.md`
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

| ID  | Result                                                                 |
| --- | ---------------------------------------------------------------------- |
| G1  | PASS — W0 REQ-03, REQ-12, REQ-14, REQ-18 chassis only                  |
| G2  | PASS — ground_command N/A; manual + unit cited                         |
| G3  | PASS — all assigned REQs in checklist                                  |
| G4  | PASS — Wave-Execution + unit + wave-acceptance label                   |
| G5  | PASS — ADR-002 Option B                                                |
| G6  | PASS — BFF/auth/i18n/testing/layout MDCs                               |
| G7  | PASS — contracts consumed + produced                                   |
| G8  | PASS — empty learning cited                                            |
| G9  | PASS — no GF-* open                                                    |
| G10 | PASS — report written; as-built human_approved recorded; handoff below |

```yaml
handoff:
  contract: sdd-delivery/v2
  stage: ground-spec
  outcome: pass
  artifact:
    path: docs/specification/reports/Ground-Report-INIT-GATEFLOW-017-W0.md
  blockers: []
  signals:
    wave: W0
    contracts_produced: 5
    assigned_reqs:
      - REQ-03
      - REQ-12
      - REQ-14
      - REQ-18
    tip_sha: ab5dbde8a1df352d54fb88a2942d22a401563680
    pr_url: https://github.com/drivestream-lab/gateflow-ops/pull/38
    learning_extract: docs/specification/reports/Learning-Extract-INIT-GATEFLOW-017-W0.md
  next_candidates:
    - wave-done-action
  human_checkpoint: false
  external_action: true
  forge:
    action: update_board_status
    ticket: https://github.com/drivestream-lab/gateflow-ops/issues/34
```
