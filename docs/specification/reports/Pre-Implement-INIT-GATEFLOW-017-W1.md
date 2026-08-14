## Pre-implement — gateflow-ops / W1 — Identity factory

| Field             | Value                                                                                                                                                                                                                       |
| ----------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Artifact          | `docs/specification/reports/Pre-Implement-INIT-GATEFLOW-017-W1.md`                                                                                                                                                          |
| Initiative        | INIT-GATEFLOW-017                                                                                                                                                                                                           |
| Wave              | W1                                                                                                                                                                                                                          |
| Date              | 2026-08-14                                                                                                                                                                                                                  |
| Outcome           | `pass`                                                                                                                                                                                                                      |
| Outcome reason    | W0 Ground Report + `human_approved` present; spec on `develop`; board W1 seeded; WorkManifest pass; P15 live path `tests/verify/07-identity-factory.md`                                                                     |
| Wave head context | Bound by Forge/human context: `develop` @ `39df2fe6b8bea6a905f2b3fbba88a9caadd92b15` — not opened by this skill; coding should cut `feature/INIT-GATEFLOW-017-w1-identity-factory` from develop before `/loop-spec` publish |

---

### Gate check (prior wave)

| Item                         | Required                                                                       | Status                                                                           |
| ---------------------------- | ------------------------------------------------------------------------------ | -------------------------------------------------------------------------------- |
| Branch context (read-only)   | Bound head is `develop` or `feature/INIT-*-w{N}-*` — not open `chore/*-spec-*` | [x] ok — `develop`                                                               |
| Spec PR merged               | Implementation plan on integration branch                                      | [x] yes — PR #32 MERGED                                                          |
| Coding-readiness at merge    | Merged spec PR had `spec-lgtm` on head                                         | [x] verified — PR #32                                                            |
| Board seed (read-only)       | Wave issue(s) from plan §9 exist; TASK ids present                             | [x] seeded — #35 under EPIC #33; TASK-W1-01…05 in body                           |
| WorkManifest contract        | `prayog/v1` §9 passes validator                                                | [x] pass                                                                         |
| TASK exit proof              | Every wave `TASK-*` has `exit.criteria` + `exit.proof`                         | [x] complete                                                                     |
| Live-verification contract   | P15: live script under `live_verify_dir`                                       | [x] contract — `tests/verify/07-identity-factory.md` (create in TASK-W1-05)      |
| Plan source freshness        | upstream rows `CURRENT`                                                        | [x] current                                                                      |
| Impact-map repo scope        | H3/H2 match                                                                    | [x] match — H3 `1`; H2 `sha256:13cee9aa…`; H1 `sha256:c0fe5504…`; G1 `601b00e0…` |
| `check_command`              | resolved                                                                       | [x] `make check`                                                                 |
| `test_command`               | resolved                                                                       | [x] `make test`                                                                  |
| `verify_command`             | live script when P15                                                           | [x] `tests/verify/07-identity-factory.md`                                        |
| `ground_command`             | resolved or N/A                                                                | [x] N/A — no Makefile ground target                                              |
| Co-shipped live verify (P15) | new product surface                                                            | [x] `tests/verify/07-identity-factory.md`                                        |
| Prior wave as-built row      | `human_approved`                                                               | [x] W0 = `human_approved`                                                        |
| Prior Ground Report exists   | `Ground-Report-INIT-GATEFLOW-017-W0.md`                                        | [x] exists                                                                       |
| Plan PE sign-off (W0 only)   | N/A for W1                                                                     | [x] N/A                                                                          |

**Gate verdict:** PASS

**Forge readiness:** N/A — board seeded; publish checklist via `commit_workspace` onto bound wave head before `/loop-spec`.

---

### Contracts consumed (from prior Ground Report)

| Assumed contract          | Entry point                                                                  | Input shape             | Output shape                       | Source                                  | Confirmed?                                      |
| ------------------------- | ---------------------------------------------------------------------------- | ----------------------- | ---------------------------------- | --------------------------------------- | ----------------------------------------------- |
| Email-shape refuse        | `portalLoginRefuseKey` / `isEmailIdentifier` in `lib/auth-login-upstream.ts` | `{ email?, password? }` | named i18n key or mapped body      | Ground-Report-W0                        | [x] yes — reuse `isEmailIdentifier` on entry    |
| Identity session + Bearer | `getSessionToken` / `upstreamFetch`                                          | path + init             | upstream Response                  | Ground-Report-W0                        | [x] yes                                         |
| Platform-admin gate       | `requirePlatformAdminSession` / `isPlatformAdmin`                            | session                 | 401/403 or session                 | chassis `lib/require-platform-admin.ts` | [x] yes — W1 factory acts use this role         |
| Workspace shell + nav     | `navItemsForRole` / `PageHeader` / `PageBody`                                | role                    | filtered hrefs                     | 016 Ground-Report-W0                    | [x] yes                                         |
| Entered-programme helper  | `getEnteredProgrammeContext`                                                 | cookie                  | `{programmeId,tenantId}` or `null` | Ground-Report-W0                        | [x] yes — **unused in W1** (no delivery rebind) |

**Unconfirmed contracts:**

- Gateflow **CTR-01** HTTP paths are not published in the product spec (semantic only). BFF must fail closed on unexpected fields and map named refuses. Kill line at wave-acceptance: provider 5xx or membership still 014-binds → stop. Do not invent grant screens (W2).
- Do not treat 016 verify `REQ-01`–`REQ-08` as 017 factory coverage.

---

### Must read

- [x] `AGENTS.md`
- [x] MDC (domain-filtered):
  - [x] `nextjs-repository-layout.mdc` — BFF under `app/api/gateflow/`
  - [x] `nextjs-bff-route-handlers.mdc` — `bffError`, logging, no password leak
  - [x] `nextjs-bff-server-auth.mdc` — `authFetch`, server Bearer
  - [x] `no-hardcoded-strings.mdc` — identities catalog
  - [x] `workspace-page-layout.mdc` — PageHeader / PageBody
  - [x] `shared-limits-pagination.mdc` — list skip/limit from `@/lib/constants`
  - [x] `testing-verify-flows.mdc` — unit vs live; new FILE `07`
  - [x] `spec-driven-development.mdc` — as-built + tests map
  - [x] `typescript-react-style.mdc` — `"use client"` at list/detail leaves
  - [ ] skipped: tailwind / client-forms (use existing controlled + Card pattern); code-guidelines-index
- [x] ADRs:
  - [x] ADR-001 — UI primitives for factory pages
  - [x] ADR-002 — session death on suspend/password-set is provider+cookie chassis; W1 does not migrate delivery `tenant_id` reads
- [x] Spec: `docs/specification/product/INIT-GATEFLOW-017-gateflow-ops.md` REQ-01–05, 12–14, 22, 25, 29, 30
- [x] Plan §9 W1 + board https://github.com/drivestream-lab/gateflow-ops/issues/35
  - [x] TASK-W1-01 — REQ-01,02,03,04,05,25,29,30 — identities BFF + constants
  - [x] TASK-W1-02 — REQ-01,04,05,22 — list UI + nav (depends TASK-W1-01)
  - [x] TASK-W1-03 — REQ-12,13,14,22 — by-id BFF + detail UI (depends TASK-W1-01)
  - [x] TASK-W1-04 — REQ-02,03,25,29,30 — unit (depends TASK-W1-01)
  - [x] TASK-W1-05 — live REQs — `07-identity-factory.md` + as-built (depends 02,03,04)

---

### Governance alignment

- [x] No ADR contradiction; no grant/enter screens
- [x] Kill line documented for wave-acceptance (CTR-01 live first)
- [x] ADR-001 + ADR-002 Accepted

---

### Must update (via `/loop-spec`)

- [ ] `app/api/gateflow/identities/route.ts` + `by-id/route.ts` + `lib/constants.ts`
- [ ] Factory UI/nav/locales/hook
- [ ] `tests/unit/identities-bff.test.ts`
- [ ] `tests/verify/07-identity-factory.md` + as-built rows
- [ ] `tests/README.md` feature map (same-PR; not in §9 `files[]`)
- [ ] `lib/i18n.ts` + `data/locales/en/workspace.json` nav key (companions so catalog/nav resolve)
- [ ] Nav unit expectations in `tests/unit/platform-programmes.test.ts` (companion; will fail when `/identities` is added)

---

### Must not

- [ ] Grant/detach/membership UI (W2)
- [ ] Programme enter / delivery `tenant_id` migration (W3)
- [ ] Ship factory screens if kill line trips (014 bind still required)
- [ ] Return password or `access_token` in JSON/UI
- [ ] Create `platform_admin` via factory entry
- [ ] Show factory list to `tenant_admin`
- [ ] Open a branch/commit/PR from this skill
- [ ] Extend 016 verify files for 017 REQ ids

---

### Verification plan

| Layer        | What it proves                                                         | Command                               |
| ------------ | ---------------------------------------------------------------------- | ------------------------------------- |
| Static check | lint/types/format                                                      | `make check`                          |
| Unit         | refuses + password strip                                               | `make test`                           |
| Live verify  | create/list/search/suspend/unsuspend/password-set; tenant_admin refuse | `tests/verify/07-identity-factory.md` |
| Ground check | N/A — `/ground-spec` after accept                                      | N/A                                   |

### Human wave-acceptance

- [ ] Run `tests/verify/07-identity-factory.md` against live CTR-01
- [ ] Stop if provider 5xx or membership still requires 014 create+bind
- [ ] Label `wave-accepted` / `wave-acceptance` on the tip — skills do not apply it

---

### Tracker / PR (read-only)

- Initiative: INIT-GATEFLOW-017
- Issue: [#35](https://github.com/drivestream-lab/gateflow-ops/issues/35) (EPIC [#33](https://github.com/drivestream-lab/gateflow-ops/issues/33))
- Spec path: `docs/specification/product/INIT-GATEFLOW-017-gateflow-ops.md`
- Verify command: `tests/verify/07-identity-factory.md`
- ADRs: ADR-001, ADR-002
- Wave head: `develop` (cut `feature/INIT-GATEFLOW-017-w1-identity-factory` for coding)

---

### Checklist publish readiness

| Field            | Value                                            |
| ---------------- | ------------------------------------------------ |
| Workflow outcome | `pass` — W1 gates satisfied                      |
| Next             | `loop-spec` (`skill`) — `external_action: false` |
| Forge (this hop) | `commit_workspace` **required**                  |
| Later            | After `/loop-spec`, `wave-pr-action`             |

Recommend `/commit-workspace` after explicit authorization.

---

### Merge order

TASK-W1-01 → (TASK-W1-02 ∥ TASK-W1-03 ∥ TASK-W1-04) → TASK-W1-05.

Cross-service: W1 **consumes** gateflow CTR-01 (unconfirmed path). Do not wait on CTR-02/04.

---

```yaml
handoff:
  contract: sdd-delivery/v2
  stage: pre-implement
  outcome: pass
  artifact:
    path: docs/specification/reports/Pre-Implement-INIT-GATEFLOW-017-W1.md
  blockers: []
  signals:
    initiative: INIT-GATEFLOW-017
    wave: W1
    board_issue: https://github.com/drivestream-lab/gateflow-ops/issues/35
    epic_issue: https://github.com/drivestream-lab/gateflow-ops/issues/33
    tasks:
      - TASK-W1-01
      - TASK-W1-02
      - TASK-W1-03
      - TASK-W1-04
      - TASK-W1-05
    implements:
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
    check_command: make check
    test_command: make test
    verify_command: tests/verify/07-identity-factory.md
    ground_command: null
    workmanifest_contract: pass
    adr_in_scope:
      - ADR-001
      - ADR-002
    wave_head_context: develop
    repo: gateflow-ops
  next_candidates:
    - loop-spec
  human_checkpoint: false
  external_action: false
  forge:
    action: commit_workspace
    draft: true
    apply_labels: []
    title: "[INIT-GATEFLOW-017 W1] Pre-implement checklist"
    body_path: docs/specification/reports/Pre-Implement-INIT-GATEFLOW-017-W1.md
```
