## Pre-implement — gateflow-ops / W0 — Programme-context chassis

| Field             | Value                                                                                                                                                                                                                        |
| ----------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Artifact          | `docs/specification/reports/Pre-Implement-INIT-GATEFLOW-017-W0.md`                                                                                                                                                           |
| Initiative        | INIT-GATEFLOW-017                                                                                                                                                                                                            |
| Wave              | W0                                                                                                                                                                                                                           |
| Date              | 2026-08-14                                                                                                                                                                                                                   |
| Outcome           | `pass`                                                                                                                                                                                                                       |
| Outcome reason    | Spec merged with `spec-lgtm`, board W0 seeded under EPIC, WorkManifest contract pass, PE sign-off complete, P15 live verify path resolved, commands resolved                                                                 |
| Wave head context | Bound by Forge/human context: `develop` @ `a65ae5835f2f2d884698db0dff24ab592c1a1ff5` — not opened by this skill; coding should cut `feature/INIT-GATEFLOW-017-w0-programme-context` from develop before `/loop-spec` publish |

---

### Gate check (prior wave)

> Complete this before reading anything else. Do not proceed if the gate fails.
> Board / branch / PR checks are **read-only**. Do not create tickets or open
> a branch from this skill — emit Forge readiness instead.

| Item                         | Required                                                                          | Status                                                                                                                                                                                                                            |
| ---------------------------- | --------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Branch context (read-only)   | Bound head is `develop` or `feature/INIT-*-w{N}-*` — not open `chore/*-spec-*`    | [x] ok — `develop` (not `chore/*-spec-*`)                                                                                                                                                                                         |
| Spec PR merged               | Implementation plan on integration branch                                         | [x] yes — PR #32 MERGED (`a65ae5835f2f2d884698db0dff24ab592c1a1ff5`)                                                                                                                                                              |
| Coding-readiness at merge    | Merged spec PR had `spec-lgtm` on head                                            | [x] verified — label on PR #32; `mergeCommit` = develop tip                                                                                                                                                                       |
| Board seed (read-only)       | Wave issue(s) from plan §9 exist; TASK ids present in wave body                   | [x] seeded — #34 under EPIC #33; W1–W3 #35–#37 are sub-issues; TASK-W0-01…04 in #34 body                                                                                                                                          |
| WorkManifest contract        | `prayog/v1` §9 passes `scripts/workmanifest_contract.py`                          | [x] pass                                                                                                                                                                                                                          |
| TASK exit proof              | Every wave `TASK-*` has `exit.criteria` + `exit.proof`                            | [x] complete                                                                                                                                                                                                                      |
| Live-verification contract   | When P15 applies: `verification.live` applicable + script under `live_verify_dir` | [x] contract — `tests/verify/01-login-status-page.md` (extend in TASK-W0-04)                                                                                                                                                      |
| Plan source freshness        | all upstream rows `CURRENT`                                                       | [x] current                                                                                                                                                                                                                       |
| Impact-map repo scope        | revision and scope digest match canonical handoff                                 | [x] match — H3 rev `1`; H2 `sha256:13cee9aae41718fd4ad8655d77738042761b0e45db7eefc898a693c42c2fb987`; H1 `sha256:c0fe55040928a13976133edde5cf71f0524815c17c0a8de79173ed3fa0657f67`; G1 `601b00e0a74510a6af1c33bc80ca27260995c094` |
| `check_command`              | resolved                                                                          | [x] `make check`                                                                                                                                                                                                                  |
| `test_command`               | resolved                                                                          | [x] `make test`                                                                                                                                                                                                                   |
| `verify_command`             | live script under `live_verify_dir` when P15 applies                              | [x] `tests/verify/01-login-status-page.md`                                                                                                                                                                                        |
| `ground_command`             | resolved or N/A with reason                                                       | [x] N/A — no Makefile ground target; `/ground-spec` uses as-built after wave                                                                                                                                                      |
| Co-shipped live verify (P15) | If wave adds/changes product surface: FILE path under `live_verify_dir` listed    | [x] `tests/verify/01-login-status-page.md` (login/me/logout surfaces change)                                                                                                                                                      |
| Prior wave as-built row      | `human_approved` (from prior `wave-acceptance`)                                   | [x] N/A — W0 first 017 wave                                                                                                                                                                                                       |
| Prior Ground Report exists   | `reports/Ground-Report-{SPEC}-W{N-1}.md`                                          | [x] N/A — W0                                                                                                                                                                                                                      |
| Plan PE sign-off (W0 only)   | Implementation-Plan §0 marked complete                                            | [x] complete — 2026-08-14 ([PR #32 comment](https://github.com/drivestream-lab/gateflow-ops/pull/32#issuecomment-5290307320))                                                                                                     |

**Gate verdict:** PASS

**Forge readiness (when seed / wave head absent):** N/A — board seeded; head context is integration `develop`. Publish checklist via `commit_workspace` onto bound wave head before `/loop-spec`.

---

### Contracts consumed (from prior Ground Report)

> W0 has no prior 017 Ground Report. Chassis contracts below confirmed against
> `source_roots` (`app/`, `lib/`) and TDD §3.1. Codegraph
> (`mcp-user-prayog-fleet-cbm`, project `data-repos-prayog-gateflow-ops`)
> located `getSessionToken` and `toUpstreamLoginBody`; confirmed by source
> read. Graph has no `programme-context` symbol (file absent).

| Assumed contract         | Entry point                                                | Input shape                | Output shape                                                         | Source                  | Confirmed?                                                                                                                           |
| ------------------------ | ---------------------------------------------------------- | -------------------------- | -------------------------------------------------------------------- | ----------------------- | ------------------------------------------------------------------------------------------------------------------------------------ |
| Identity session cookie  | `POST` `app/api/auth/login/route.ts`                       | JSON `{ email, password }` | `{ ok: true }` plus httpOnly `SESSION_COOKIE` holding `access_token` | source + ADR-002        | [x] yes — cookie flags: httpOnly, sameSite lax, path `/`                                                                             |
| Session token read       | `getSessionToken` in `lib/auth.ts`                         | cookie store               | token string or `null`                                               | source                  | [x] yes — reads `env.SESSION_COOKIE` only                                                                                            |
| Session payload          | `getSession` in `lib/auth.ts`                              | token                      | JWT claims or `null` if missing/expired                              | source                  | [x] yes — `tenant_id` is optional claim, not entered scope                                                                           |
| Bearer to upstream       | `upstreamFetch` in `lib/upstream-fetch.ts`                 | gateflow path + init       | upstream response; `Authorization: Bearer` from `getSessionToken()`  | source + ADR-002        | [x] yes — identity token is the only Bearer                                                                                          |
| Logout                   | `POST` `app/api/auth/logout/route.ts`                      | none                       | `{ ok: true }`; deletes `SESSION_COOKIE`                             | source                  | [x] yes — does **not** yet delete a programme cookie (W0 adds that)                                                                  |
| Me introspection         | `GET` `app/api/auth/me/route.ts`                           | session cookie             | `{ sub, email, tenantId, role, expiresAt }` — no raw token           | source + TDD §3.1       | [x] yes — `tenantId` today echoes JWT `tenant_id`; W0 must not leak tokens; entered ids stay unset until W3 writes the second cookie |
| Login body mapper        | `toUpstreamLoginBody` in `lib/auth-login-upstream.ts`      | `{ email?, password? }`    | `{ credential_identifier, password }` or `null`                      | source + unit           | [x] yes — refuses empty identifier/password only; **no** email-shape check yet (W0 TASK-W0-02)                                       |
| Env cookie name          | `env` in `lib/env.ts`                                      | process env                | `SESSION_COOKIE` default `portal_session`                            | source + `.env.example` | [x] yes — no programme-cookie name yet (W0 adds it)                                                                                  |
| Programme-context helper | `getEnteredProgrammeContext` in `lib/programme-context.ts` | cookie store               | `{ programmeId, tenantId }` or `null`                                | TDD §3.1 + plan         | [ ] NO — file absent; TASK-W0-01 creates it                                                                                          |
| `dev-stub` token         | `devStubToken` in `app/api/auth/login/route.ts`            | email                      | unsigned JWT with `tenant_id: "dev"`                                 | source + ADR-002        | [x] yes — W0 must leave `tenant_id` unset so the identity JWT cannot substitute for the helper                                       |

**Unconfirmed contracts** (prior wave not yet grounded or source not found):

- Gateflow CTR-01 (identity factory), CTR-02 (grants), CTR-04 (enter) HTTP — **not called in W0**. Do not invent those clients here.
- Delivery Route Handlers / RSC pages still read JWT `tenant_id` as tenant scope (fleet, runs, tenants, waves, initiatives, metrics, checkpoints, board). **Do not migrate those reads in W0.** W3 is the ADR-002 migration change set (plan RISK-02).
- TDD §3.2 enter/leave BFF (`/api/auth/programme`) — W3 only. Helper exists after W0 but no writer until W3; helper must return `null` after login/logout.
- Named i18n key for “not an email” — `data/locales/en/auth.json` today has `errors.invalidRequest`, `errors.invalidCredentials`, `errors.sessionExpired` only. TASK-W0-02 needs a named refuse key; locale file is not in WorkManifest `files[]` — add it in the same `/loop-spec` change if a new key is required.
- `.env.example` has `SESSION_COOKIE` only. Adding a programme-cookie env name should update `.env.example` in the same change (not listed in §9 files).

---

### Must read

- [x] `AGENTS.md` — constitution pin `nextjs-bff-rules` v0.1.6; skills v0.5.1; verify via `tests/README.md`
- [x] MDC rules (domain-filtered — list files read for this slice's domains):
  - [x] `nextjs-bff-server-auth.mdc` — httpOnly session; no browser JWT; `authFetch` for `/api/*`
  - [x] `nextjs-bff-route-handlers.mdc` — `bffError`, no token leak in JSON, server Bearer only
  - [x] `no-hardcoded-strings.mdc` — email-shape refuse must be a named i18n key
  - [x] `testing-verify-flows.mdc` — unit owns parsers; live smoke owns cookie journey
  - [x] `spec-driven-development.mdc` — as-built + tests map in the same change
  - [x] `nextjs-repository-layout.mdc` — portal session stays under `app/api/auth/`
  - [x] `typescript-react-style.mdc` — strict types; no `any` at cookie/JWT boundary
  - [ ] skipped: `workspace-page-layout.mdc`, `tailwind-design-tokens.mdc`, `client-forms-patterns.mdc`, `nextjs-app-router-stack.mdc` — no identity/grant UI or new pages in W0
  - [ ] skipped: `shared-limits-pagination.mdc` — no list/pageSize
  - [ ] skipped: `documentation-project-guidance.mdc`, `code-guidelines-index.mdc` — index/meta only
- [x] ADRs (keyword-matched — list ids):
  - [x] ADR-002 — Option B: identity `SESSION_COOKIE` stays the only Bearer; second httpOnly cookie + `getEnteredProgrammeContext()`; login/logout delete context cookie; `dev-stub` must not stamp a grant-implying `tenant_id`
  - [ ] skipped: ADR-001 — UI kit; W0 has no new screens
- [x] Spec: `docs/specification/product/INIT-GATEFLOW-017-gateflow-ops.md` — REQ-03, REQ-12, REQ-14, REQ-18 (W0 chassis half only)
- [x] Plan wave section / §9 WorkManifest: `docs/specification/reports/Implementation-Plan-INIT-GATEFLOW-017.md` W0
- [x] Board wave issue: https://github.com/drivestream-lab/gateflow-ops/issues/34 — TASK list (projected from WorkManifest; not a second authority):
  - [x] TASK-W0-01 — implements REQ-12, REQ-14, REQ-18 — depends_on: [] — create `lib/programme-context.ts`; modify `lib/env.ts`, `app/api/auth/login/route.ts`, `app/api/auth/logout/route.ts`, `app/api/auth/me/route.ts` — exit: helper returns `{programmeId,tenantId}` or `null` and never reads JWT `tenant_id`; login/logout delete context cookie; `me` JSON has no tokens — proof `make check && make test`
  - [x] TASK-W0-02 — implements REQ-03 — depends_on: [] — modify `lib/auth-login-upstream.ts` — exit: empty / no `@` / no domain → named i18n refuse; no upstream call — proof `make check && make test`
  - [x] TASK-W0-03 — implements REQ-03, REQ-12, REQ-14, REQ-18 — depends_on: [TASK-W0-01, TASK-W0-02] — create `tests/unit/programme-context.test.ts`; modify `tests/unit/auth-login-upstream.test.ts` — exit: cookie present/absent/malformed; helper never I/O; email-shape cases — proof `make test`
  - [x] TASK-W0-04 — implements REQ-03, REQ-12, REQ-14, REQ-18 — depends_on: [TASK-W0-03] — modify `tests/verify/01-login-status-page.md`; create `docs/specification/as-built/Implementation-Status-INIT-GATEFLOW-017.md`; modify `docs/specification/as-built/implementation-status.md` — exit: smoke records malformed-email refuse, logout clears both cookies, `me` has no token fields; marker `prayog:covers: REQ-03, REQ-12, REQ-14, REQ-18` — proof follow `tests/verify/01-login-status-page.md`

---

### Governance alignment

- [x] Slice spec does not contradict ADR-002 (`changes_user_visible_behavior: false`, `spec_amendment_required: false`; Option B)
- [x] Plan TASK MDC notes and ADR notes for this wave reviewed (`nextjs-bff-server-auth`, `no-hardcoded-strings`, `testing-verify-flows`; ADR-002 on TASK-W0-01/03/04)
- [x] ADR-002 is **Accepted** in `docs/specification/adr/` (Approved head `ae5e43115fa4090fcf487940bb99756709db9f95`)
- [x] ADR-001 remains Accepted and independent — not in W0 spend

---

### Must update (in the same change as the code — via `/loop-spec`)

- [ ] Product spec — only if observable REQ wording changes (not expected for W0 chassis)
- [ ] `docs/specification/as-built/implementation-status.md` — add INIT-017 / W0 verification row
- [ ] `docs/specification/as-built/Implementation-Status-INIT-GATEFLOW-017.md` — create initiative detail
- [ ] `tests/README.md` — feature map row for 017 W0 chassis (helper unit + extended login smoke). Do **not** treat 016 verify `prayog:covers: REQ-01…` as 017 coverage
- [ ] Unit verification — `tests/unit/programme-context.test.ts` (create) + `tests/unit/auth-login-upstream.test.ts` (email-shape)
- [ ] Live verification — extend `tests/verify/01-login-status-page.md` with `prayog:covers: REQ-03, REQ-12, REQ-14, REQ-18` (human-run at `wave-acceptance`)
- [ ] Locale — add named `auth.errors.*` key for not-an-email if mapper returns a new refuse (file not in §9 `files[]`)
- [ ] `.env.example` — document the new programme-context cookie name if `lib/env.ts` adds one
- [ ] ADR — no supersede expected; W0 **creates** the helper/cookie; W3 is the delivery-read migration change set

---

### Must not

- [ ] Implement against spec wording that contradicts ADR-002 without superseding it
- [ ] Duplicate unit assertions in live smoke scripts
- [ ] Assume gateflow CTR-01/02/04 HTTP or invent identity/grant screens
- [ ] Open a branch, commit, push, open a PR, apply labels, or create board issues from this skill
- [ ] Migrate delivery `session.tenant_id` / JWT `tenant_id` reads in W0 (W3 only; do not half-migrate per route)
- [ ] Stamp a populated `tenant_id` on `dev-stub` tokens
- [ ] Let `getEnteredProgrammeContext` read JWT `tenant_id`
- [ ] Put `access_token` in `/api/auth/me` JSON or any client-visible store
- [ ] Call upstream from the browser or store JWTs in `localStorage`
- [ ] Extend 016 verify files other than `tests/verify/01-login-status-page.md` for 017 coverage
- [ ] Ship identity factory or grant/detach UI (W1/W2)

---

### Verification plan

| Layer        | What it proves                                                                                             | Command (from tests_readme / profile)                                       |
| ------------ | ---------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------- |
| Static check | Formatting, linting, types, or equivalent repository checks                                                | `make check`                                                                |
| Unit         | Helper null/present/malformed (no I/O); email-shape refuse without upstream                                | `make test`                                                                 |
| Live verify  | Malformed email refused; logout clears session + context cookies; `GET /api/auth/me` has no `access_token` | `tests/verify/01-login-status-page.md` — P15 login/me/logout surface change |
| Ground check | Assigned wave REQs satisfied; boundaries respected                                                         | N/A — `/ground-spec` after accept uses as-built                             |

> P15 applies: live path is mandatory. Agent implements the script extension in `/loop-spec`; does **not** run it as success.
> Prerequisites (from plan): `npm run dev`; `.env` with `UPSTREAM_BASE_URL`; `AUTH_MODE=jwt-upstream` or documented stub; existing lab login; no new factory identity.
> 016 verify `02`–`06` markers reuse `REQ-01`–`REQ-31` for **016** behavior — not 017 proof.

### Human wave-acceptance (after loop-spec + Draft PR)

When checklist PASS and coding is green, the human at checkpoint
`wave-acceptance`:

- [ ] Run `tests/verify/01-login-status-page.md` against the running portal
- [ ] Confirm malformed email → named refuse; logout → both cookies gone; `GET /api/auth/me` has no token fields
- [ ] Signal accept with GitHub label `wave-accepted` on the tip — content skills do **not** apply it
- [ ] Apply tip hygiene for any hotfixes before Pass-2 closeout

---

### Tracker / PR (read-only context)

- Initiative: INIT-GATEFLOW-017
- Issue: [#34](https://github.com/drivestream-lab/gateflow-ops/issues/34) (EPIC [#33](https://github.com/drivestream-lab/gateflow-ops/issues/33); W1–W3 [#35](https://github.com/drivestream-lab/gateflow-ops/issues/35) [#36](https://github.com/drivestream-lab/gateflow-ops/issues/36) [#37](https://github.com/drivestream-lab/gateflow-ops/issues/37))
- Spec path: `docs/specification/product/INIT-GATEFLOW-017-gateflow-ops.md`
- Verify command (human): `tests/verify/01-login-status-page.md`
- ADRs in scope: ADR-002
- Wave head: bound by Forge/human context — `develop` (cut `feature/INIT-GATEFLOW-017-w0-programme-context` for coding publish)

---

### Checklist publish readiness (on `pass` — fill handoff.forge commit_workspace)

| Field            | Value                                                                                                 |
| ---------------- | ----------------------------------------------------------------------------------------------------- |
| Workflow outcome | `pass` — W0 gates satisfied                                                                           |
| Next             | `loop-spec` (`skill`) — `external_action: false`                                                      |
| Forge (this hop) | `commit_workspace` **required** — publish `Pre-Implement-INIT-GATEFLOW-017-W0.md` to bound `head_ref` |
| Later            | After `/loop-spec`, `wave-pr-action` opens Draft PR (checklist + code already on tip)                 |

Recommend `/commit-workspace` after explicit authorization. Do not open the PR here.

---

### Merge order (if cross-module / cross-service)

N/A — single-repo wave. Internal TASK order: TASK-W0-01 ∥ TASK-W0-02 → TASK-W0-03 → TASK-W0-04.

Cross-service: W0 does **not** wait on gateflow CTR-01/02/04. Kill line (FF-04 / A-5) applies at W1/W2 wave-acceptance, not this chassis wave.

---

```yaml
handoff:
  contract: sdd-delivery/v2
  stage: pre-implement
  outcome: pass
  artifact:
    path: docs/specification/reports/Pre-Implement-INIT-GATEFLOW-017-W0.md
  blockers: []
  signals:
    initiative: INIT-GATEFLOW-017
    wave: W0
    board_issue: https://github.com/drivestream-lab/gateflow-ops/issues/34
    epic_issue: https://github.com/drivestream-lab/gateflow-ops/issues/33
    tasks:
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
    ground_command: null
    workmanifest_contract: pass
    adr_in_scope:
      - ADR-002
    wave_head_context: develop
    repo: gateflow-ops
    codegraph_provider: mcp-user-prayog-fleet-cbm
    grounding_depth: light
  next_candidates:
    - loop-spec
  human_checkpoint: false
  external_action: false
  forge:
    action: commit_workspace
    draft: true
    apply_labels: []
    title: "[INIT-GATEFLOW-017 W0] Pre-implement checklist"
    body_path: docs/specification/reports/Pre-Implement-INIT-GATEFLOW-017-W0.md
```
