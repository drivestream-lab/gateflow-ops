## Pre-implement — gateflow-ops / W2 — Grants and purge invite/attach

| Field             | Value                                                                                                                                                                                                                   |
| ----------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Artifact          | `docs/specification/reports/Pre-Implement-INIT-GATEFLOW-017-W2.md`                                                                                                                                                      |
| Initiative        | INIT-GATEFLOW-017                                                                                                                                                                                                       |
| Wave              | W2                                                                                                                                                                                                                      |
| Date              | 2026-08-14                                                                                                                                                                                                              |
| Outcome           | `pass`                                                                                                                                                                                                                  |
| Outcome reason    | W1 Ground Report + `human_approved` present; spec on `develop`; board W2 seeded; WorkManifest pass; P15 live path `tests/verify/08-grants-membership.md`                                                                |
| Wave head context | Bound by Forge/human context: `develop` @ `60ba3262748ee550e8c25074f1566daa2e035de1` — not opened by this skill; coding should cut `feature/INIT-GATEFLOW-017-w2-grants-purge` from develop before `/loop-spec` publish |

---

### Gate check (prior wave)

| Item                         | Required                                                                       | Status                                                                           |
| ---------------------------- | ------------------------------------------------------------------------------ | -------------------------------------------------------------------------------- |
| Branch context (read-only)   | Bound head is `develop` or `feature/INIT-*-w{N}-*` — not open `chore/*-spec-*` | [x] ok — `develop`                                                               |
| Spec PR merged               | Implementation plan on integration branch                                      | [x] yes — PR #32 MERGED                                                          |
| Coding-readiness at merge    | Merged spec PR had `spec-lgtm` on head                                         | [x] verified — PR #32 (`spec-lgtm`; merge `a65ae583…`)                           |
| Board seed (read-only)       | Wave issue(s) from plan §9 exist; TASK ids present                             | [x] seeded — #36 under EPIC #33; TASK-W2-01…05 in body                           |
| WorkManifest contract        | `prayog/v1` §9 passes validator                                                | [x] pass — structural; see note on optional `--base-path`                        |
| TASK exit proof              | Every wave `TASK-*` has `exit.criteria` + `exit.proof`                         | [x] complete                                                                     |
| Live-verification contract   | P15: live script under `live_verify_dir`                                       | [x] contract — `tests/verify/08-grants-membership.md` (create in TASK-W2-05)     |
| Plan source freshness        | upstream rows `CURRENT`                                                        | [x] current                                                                      |
| Impact-map repo scope        | H3/H2 match                                                                    | [x] match — H3 `1`; H2 `sha256:13cee9aa…`; H1 `sha256:c0fe5504…`; G1 `601b00e0…` |
| `check_command`              | resolved                                                                       | [x] `make check`                                                                 |
| `test_command`               | resolved                                                                       | [x] `make test`                                                                  |
| `verify_command`             | live script when P15                                                           | [x] `tests/verify/08-grants-membership.md`                                       |
| `ground_command`             | resolved or N/A                                                                | [x] N/A — no Makefile ground target                                              |
| Co-shipped live verify (P15) | new product surface                                                            | [x] `tests/verify/08-grants-membership.md`                                       |
| Prior wave as-built row      | `human_approved`                                                               | [x] W1 = `human_approved`                                                        |
| Prior Ground Report exists   | `Ground-Report-INIT-GATEFLOW-017-W1.md`                                        | [x] exists                                                                       |
| Plan PE sign-off (W0 only)   | N/A for W2                                                                     | [x] N/A                                                                          |

**Gate verdict:** PASS

**WorkManifest `--base-path` note:** optional coverage cross-check reports `live_coverage_mismatch` on `tests/verify/02-w0-identity-onboarding.md` / `03-platform-programme-onboard.md` because those files still declare **016** `prayog:covers`. Plan P15 says W2-05 **modifies** them to strip invite/attach — not to host 017 grant coverage. Primary live FILE `08` is create-in-wave. Structural validator (no `--base-path`) **passed**.

**Forge readiness:** N/A — board seeded; publish checklist via `commit_workspace` onto bound wave head before `/loop-spec`.

---

### Contracts consumed (from prior Ground Report)

| Assumed contract             | Entry point                                   | Input shape                                                  | Output shape                                         | Source           | Confirmed?                                                        |
| ---------------------------- | --------------------------------------------- | ------------------------------------------------------------ | ---------------------------------------------------- | ---------------- | ----------------------------------------------------------------- |
| Identity factory list/create | `GET` / `POST /api/gateflow/identities`       | query `q`, `skip`, `limit`; body `{ name, email, password }` | `{ identities: IdentityDto[] }` or one `IdentityDto` | Ground-Report-W1 | [x] yes — grant names an existing factory id/email                |
| Identity detail + actions    | `GET` / `POST /api/gateflow/identities/by-id` | query `id`; `op` suspend/unsuspend/password-set              | `IdentityDto` or `{ ok, id }`                        | Ground-Report-W1 | [x] yes — W2 must not invent grant via these ops                  |
| Identity DTO                 | `stripIdentitySecrets`                        | raw upstream object                                          | `{ id, name, email, role, suspended }`               | Ground-Report-W1 | [x] yes — membership views reuse this shape (REQ-30)              |
| Factory create refuses       | `identityCreateRefuseKey`                     | `{ name?, email?, password? }`                               | named i18n key or null                               | Ground-Report-W1 | [x] yes — grant must not collect/set password                     |
| Factory UI + nav             | `/identities` + `navItemsForRole`             | session role                                                 | list/enter/search; detail via `?id=`                 | Ground-Report-W1 | [x] yes — grant UI is a **different** surface                     |
| Platform-admin gate          | `requirePlatformAdminSession`                 | session                                                      | 401/403 or session                                   | W1 / chassis     | [x] yes — grant/detach are `platform_admin` only                  |
| Identity session + Bearer    | `upstreamFetch` / `getSessionToken`           | path + init                                                  | upstream Response                                    | Ground-Report-W0 | [x] yes                                                           |
| Entered-programme helper     | `getEnteredProgrammeContext`                  | cookie                                                       | `{ programmeId, tenantId }` or `null`                | Ground-Report-W0 | [x] yes — **unused in W2** (W3 writes cookie / migrates delivery) |

**Unconfirmed contracts:**

- Gateflow **CTR-02** HTTP paths are not published in the product spec (semantic only). BFF must fail closed on unexpected fields and map named refuses (unknown identity, unknown programme, seeded `platform_admin` not grantable, wrong actor). Kill line at wave-acceptance: provider still 014-binds login → stop.
- App Router `programmes/[programmeId]/tenant-admins` cannot appear in WorkManifest `files[]` (glob/`[]` forbidden). RISK-04: delete attach by removing `lib/programme-attach.ts` **and** gut/delete the tenant-admins Route Handler as a companion so `make check` stays green. Do not leave a live create+bind POST.
- Do not treat 016 verify `REQ-01`–`REQ-08` / `REQ-32`–`REQ-37` as 017 grant coverage. W2-05 strips invite/attach steps from `02` / `03`; 017 live lives in `08`.

---

### Must read

- [x] `AGENTS.md`
- [x] MDC (domain-filtered):
  - [x] `nextjs-repository-layout.mdc` — BFF under `app/api/gateflow/`; grants folder
  - [x] `nextjs-bff-route-handlers.mdc` — `bffError`, logging, no password leak
  - [x] `nextjs-bff-server-auth.mdc` — `authFetch`, server Bearer
  - [x] `no-hardcoded-strings.mdc` — grants catalog
  - [x] `workspace-page-layout.mdc` — membership on programme detail Card
  - [x] `testing-verify-flows.mdc` — unit vs live; new FILE `08`; trim 016 scripts
  - [x] `spec-driven-development.mdc` — as-built + tests map
  - [x] `typescript-react-style.mdc` — `"use client"` at membership leaf
  - [ ] skipped: tailwind / client-forms (use existing controlled + Card); shared-limits (no new list size unless grant list needs it — then extend `@/lib/constants`); code-guidelines-index
- [x] ADRs:
  - [x] ADR-001 — UI primitives for membership panel
  - [x] ADR-002 — session stays identity cookie; W2 does not write programme-context or migrate delivery `tenant_id`
- [x] Spec: `docs/specification/product/INIT-GATEFLOW-017-gateflow-ops.md` REQ-06–11, 15, 20, 21, 24, 28, 30
- [x] Plan §9 W2 + board https://github.com/drivestream-lab/gateflow-ops/issues/36
  - [x] TASK-W2-01 — REQ-06,07,08,09,10,24,28,30 — `app/api/gateflow/grants/route.ts` create
  - [x] TASK-W2-02 — REQ-11,30 — membership panel + hook + locales; modify programme-detail + workspace-nav (depends TASK-W2-01)
  - [x] TASK-W2-03 — REQ-20,21 — delete `tenants/users` + `programme-attach`; modify tenant-detail
  - [x] TASK-W2-04 — REQ-07,08,28,30 — `tests/unit/grants-bff.test.ts` (depends TASK-W2-01)
  - [x] TASK-W2-05 — live REQs — create `08`; modify 016 `02`/`03` + as-built (depends 02,03,04)

---

### Governance alignment

- [x] No ADR contradiction; no programme-enter / delivery rebind (W3)
- [x] Kill line documented for wave-acceptance (CTR-02 live first; stop if 014-bind remains)
- [x] ADR-001 + ADR-002 Accepted

---

### Must update (via `/loop-spec`)

- [ ] `app/api/gateflow/grants/route.ts` — grant/detach/list; no password on grant body
- [ ] Membership panel + hook + `grants.json`; programme-detail loses attach form
- [ ] Delete invite BFF + `programme-attach`; tenant-detail loses invite card
- [ ] `tests/unit/grants-bff.test.ts`
- [ ] `tests/verify/08-grants-membership.md` + trim invite/attach from `02` / `03` + as-built W2
- [ ] `tests/README.md` feature map (same-PR; not in §9 `files[]`)
- [ ] `lib/i18n.ts` — register `grants` catalog (companion)
- [ ] Companions required for green `make check` after `programme-attach` delete:
  - `app/api/gateflow/programmes/[programmeId]/tenant-admins/route.ts` — remove create+bind (cannot list `[programmeId]` in manifest)
  - `hooks/use-programmes.ts` — drop `useAttachTenantAdmin`
  - `hooks/use-tenant.ts` — drop invite mutation once tenant-detail stops calling it
  - `tests/unit/platform-programmes.test.ts` — drop `stripAttachAccessToken` cases
- [ ] Optional companion for REQ-11 identity-side membership: compose `membership-panel` from `components/identities/identity-detail.tsx` (not in `files[]`; programme-detail is the declared host)

---

### Must not

- [ ] Programme enter / delivery `tenant_id` migration (W3)
- [ ] Write `PROGRAMME_CONTEXT_COOKIE` (W3)
- [ ] Collect a password on grant
- [ ] Grant the seeded `platform_admin` as `tenant_admin`
- [ ] Leave CAP-P attach POST or tenant invite POST live
- [ ] Ship grant screens if kill line trips (014 bind still required)
- [ ] Return password or `access_token` on membership JSON/UI
- [ ] Show grant/detach to `tenant_admin`
- [ ] Open a branch/commit/PR from this skill
- [ ] Host 017 grant `prayog:covers` on 016 verify `02` / `03`

---

### Verification plan

| Layer        | What it proves                                                                       | Command                                |
| ------------ | ------------------------------------------------------------------------------------ | -------------------------------------- |
| Static check | lint/types/format                                                                    | `make check`                           |
| Unit         | idempotent grant; unknown identity/programme refuse; password strip                  | `make test`                            |
| Live verify  | grant/detach/multi-programme/membership; invite/attach gone; in-flight wave persists | `tests/verify/08-grants-membership.md` |
| Ground check | N/A — `/ground-spec` after accept                                                    | N/A                                    |

### Human wave-acceptance

- [ ] Run `tests/verify/08-grants-membership.md` against live CTR-02
- [ ] Stop if provider still 014-binds login or grant 5xx
- [ ] Confirm invite + attach UI/BFF are gone
- [ ] Label `wave-accepted` / `wave-acceptance` on the tip — skills do not apply it

---

### Tracker / PR (read-only)

- Initiative: INIT-GATEFLOW-017
- Issue: [#36](https://github.com/drivestream-lab/gateflow-ops/issues/36) (EPIC [#33](https://github.com/drivestream-lab/gateflow-ops/issues/33))
- Spec path: `docs/specification/product/INIT-GATEFLOW-017-gateflow-ops.md`
- Verify command: `tests/verify/08-grants-membership.md`
- ADRs: ADR-001, ADR-002
- Wave head: `develop` (cut `feature/INIT-GATEFLOW-017-w2-grants-purge` for coding)

---

### Checklist publish readiness

| Field            | Value                                            |
| ---------------- | ------------------------------------------------ |
| Workflow outcome | `pass` — W2 gates satisfied                      |
| Next             | `loop-spec` (`skill`) — `external_action: false` |
| Forge (this hop) | `commit_workspace` **required**                  |
| Later            | After `/loop-spec`, `wave-pr-action`             |

Recommend `/commit-workspace` after explicit authorization.

---

### Merge order

TASK-W2-01 ∥ TASK-W2-03 → (TASK-W2-02 ∥ TASK-W2-04 after 01) → TASK-W2-05.

Cross-service: W2 **consumes** gateflow CTR-02 (unconfirmed path) and W1 factory identities. Do not wait on CTR-04 (W3).

---

```yaml
handoff:
  contract: sdd-delivery/v2
  stage: pre-implement
  outcome: pass
  artifact:
    path: docs/specification/reports/Pre-Implement-INIT-GATEFLOW-017-W2.md
  blockers: []
  signals:
    initiative: INIT-GATEFLOW-017
    wave: W2
    board_issue: https://github.com/drivestream-lab/gateflow-ops/issues/36
    epic_issue: https://github.com/drivestream-lab/gateflow-ops/issues/33
    tasks:
      - TASK-W2-01
      - TASK-W2-02
      - TASK-W2-03
      - TASK-W2-04
      - TASK-W2-05
    implements:
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
    check_command: make check
    test_command: make test
    verify_command: tests/verify/08-grants-membership.md
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
    title: "[INIT-GATEFLOW-017 W2] Pre-implement checklist"
    body_path: docs/specification/reports/Pre-Implement-INIT-GATEFLOW-017-W2.md
```
