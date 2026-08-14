## Pre-implement — gateflow-ops / W3 — Programme enter and delivery rebind

| Field             | Value                                                                                                                                                                                                                      |
| ----------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Artifact          | `docs/specification/reports/Pre-Implement-INIT-GATEFLOW-017-W3.md`                                                                                                                                                         |
| Initiative        | INIT-GATEFLOW-017                                                                                                                                                                                                          |
| Wave              | W3                                                                                                                                                                                                                         |
| Date              | 2026-08-14                                                                                                                                                                                                                 |
| Outcome           | `pass`                                                                                                                                                                                                                     |
| Outcome reason    | W2 Ground Report + `human_approved` present; spec on `develop`; board W3 seeded; WorkManifest pass; P15 live path `tests/verify/09-programme-enter-delivery.md`                                                            |
| Wave head context | Bound by Forge/human context: `develop` @ `97b76276116122a414fdfb3ef9df233d57eb7fe3` — not opened by this skill; coding should cut `feature/INIT-GATEFLOW-017-w3-programme-enter` from develop before `/loop-spec` publish |

---

### Gate check (prior wave)

| Item                         | Required                                                                       | Status                                                                              |
| ---------------------------- | ------------------------------------------------------------------------------ | ----------------------------------------------------------------------------------- |
| Branch context (read-only)   | Bound head is `develop` or `feature/INIT-*-w{N}-*` — not open `chore/*-spec-*` | [x] ok — `develop`                                                                  |
| Spec PR merged               | Implementation plan on integration branch                                      | [x] yes — PR #32 MERGED                                                             |
| Coding-readiness at merge    | Merged spec PR had `spec-lgtm` on head                                         | [x] verified — PR #32 (`spec-lgtm`; merge `a65ae583…`)                              |
| Board seed (read-only)       | Wave issue(s) from plan §9 exist; TASK ids present                             | [x] seeded — #37 under EPIC #33; TASK-W3-01…05 in body                              |
| WorkManifest contract        | `prayog/v1` §9 passes validator                                                | [x] pass — structural; see note on optional `--base-path`                           |
| TASK exit proof              | Every wave `TASK-*` has `exit.criteria` + `exit.proof`                         | [x] complete                                                                        |
| Live-verification contract   | P15: live script under `live_verify_dir`                                       | [x] contract — `tests/verify/09-programme-enter-delivery.md` (create in TASK-W3-05) |
| Plan source freshness        | upstream rows `CURRENT`                                                        | [x] current                                                                         |
| Impact-map repo scope        | H3/H2 match                                                                    | [x] match — H3 `1`; H2 `sha256:13cee9aa…`; H1 `sha256:c0fe5504…`; G1 `601b00e0…`    |
| `check_command`              | resolved                                                                       | [x] `make check`                                                                    |
| `test_command`               | resolved                                                                       | [x] `make test`                                                                     |
| `verify_command`             | live script when P15                                                           | [x] `tests/verify/09-programme-enter-delivery.md`                                   |
| `ground_command`             | resolved or N/A                                                                | [x] N/A — no Makefile ground target                                                 |
| Co-shipped live verify (P15) | new product surface                                                            | [x] `tests/verify/09-programme-enter-delivery.md`                                   |
| Prior wave as-built row      | `human_approved`                                                               | [x] W2 = `human_approved`                                                           |
| Prior Ground Report exists   | `Ground-Report-INIT-GATEFLOW-017-W2.md`                                        | [x] exists                                                                          |
| Plan PE sign-off (W0 only)   | N/A for W3                                                                     | [x] N/A                                                                             |

**Gate verdict:** PASS

**WorkManifest `--base-path` note:** optional coverage cross-check still reports `live_coverage_mismatch` on `tests/verify/03-platform-programme-onboard.md` vs **W2** `live.covers` (016 REQ-32–37 markers). That is leftover 016 collision (RISK-03), not a W3 P15 gap. Primary live FILE `09` is create-in-wave. Structural validator (no `--base-path`) **passed**. Do not treat 016 `04-w2-initiative-tracking.md` `REQ-16` as 017 enter coverage.

**Forge readiness:** N/A — board seeded; publish checklist via `commit_workspace` onto bound wave head before `/loop-spec`.

---

### Contracts consumed (from prior Ground Reports)

| Assumed contract             | Entry point                                      | Input shape                                              | Output shape                                              | Source           | Confirmed?                                                                 |
| ---------------------------- | ------------------------------------------------ | -------------------------------------------------------- | --------------------------------------------------------- | ---------------- | -------------------------------------------------------------------------- |
| Entered-programme helper     | `getEnteredProgrammeContext`                     | cookie store                                             | `{ programmeId, tenantId }` or `null`                     | Ground-Report-W0 | [x] yes — unused in W1/W2; W3 **writes** cookie and migrates delivery reads |
| Programme-context cookie     | `PROGRAMME_CONTEXT_COOKIE` + login/logout clear  | login/logout / enter/leave                               | httpOnly ids cookie; expired on login/logout              | Ground-Report-W0 | [x] yes — W3 enter/leave must set/clear; do not remint `SESSION_COOKIE`    |
| Me introspection             | `GET /api/auth/me`                               | session + helper                                         | entered ids from helper only; no token                    | Ground-Report-W0 | [x] yes — `enteredProgrammeId` / `enteredTenantId` already echoed          |
| Identity session + Bearer    | `upstreamFetch` / `getSessionToken`              | path + init                                              | upstream Response                                         | Ground-Report-W0 | [x] yes — identity Bearer stays on `SESSION_COOKIE`                        |
| Grants list/grant/detach     | `GET` / `POST /api/gateflow/grants`              | `identity_id` / `programme_id`; grant/detach body        | `{ grants: GrantDto[] }` or one `GrantDto`                | Ground-Report-W2 | [x] yes — **`platform_admin` only**; W3 enter must not invent grant here   |
| Grant DTO                    | `stripGrantSecrets`                              | raw upstream object                                      | `{ identityId, programmeId, email, name, programmeName }` | Ground-Report-W2 | [x] yes — enter views must not leak password                               |
| Grant write refuses          | `grantWriteRefuseKey`                            | grant/detach body                                        | named i18n key or null                                    | Ground-Report-W2 | [x] yes — enter is not a grant; not-granted is a different refuse          |
| Membership chrome            | `MembershipPanel`                                | `programmeId` or `identityId`                            | identities ↔ programmes                                   | Ground-Report-W2 | [x] yes — enter UI is a **different** surface                              |
| Invite/attach absence        | leftover `tenants/users` / `tenant-admins`       | any actor                                                | 404 / no UI                                               | Ground-Report-W2 | [x] yes — W3 must not resurrect invite/attach                              |
| Identity factory + nav       | `/identities` + `navItemsForRole`                | session role                                             | factory hidden from `tenant_admin`                        | Ground-Report-W1 | [x] yes — REQ-22 / REQ-26 nav hide completes in W3                         |
| Platform-admin gate          | `requirePlatformAdminSession`                    | session                                                  | 401/403 or session                                        | W1 chassis       | [x] yes — factory/grant stay `platform_admin`; delivery stays refused      |

**Unconfirmed contracts:**

- Gateflow **CTR-04** HTTP paths are unpublished (semantic only: list granted programmes for this sign-in; enter one). BFF must fail closed on unexpected fields. Named refuse: `not granted`, `wrong actor`. Kill line at wave-acceptance: delivery still reads JWT `tenant_id`, or provider rejects identity Bearer → stop.
- `GET /api/gateflow/grants` is **not** the tenant enter list (W2 invariant: `platform_admin` only). Tenant granted-programme list belongs on `/api/auth/programme` (or a tenant-scoped CTR-04 proxy), not a bypass of the grants BFF.
- ADR-002: every `session.tenant_id` **entered-scope** site migrates in this change set. TASK-W3-02 lists delivery BFF + RSC pages. Companions not in `files[]`: `app/(dashboard)/page.tsx` (`sessionTenantLabel` still reads JWT `tenant_id`); do not treat `/api/gateflow/status` logger `tenantId` as entered scope. Do **not** migrate CAP-P `app/api/gateflow/programmes` (REQ-27 onboard stays `platform_admin`).
- Plan narrative says modify 016 verify `02`–`06` to read helper tenant ids. Those paths are **not** in TASK-W3-05 `files[]`. Treat as companions only if a script still assumes JWT `tenant_id` as entered scope — do not host 017 enter `prayog:covers` on 016 files.

---

### Must read

- [x] `AGENTS.md`
- [x] MDC (domain-filtered):
  - [x] `nextjs-bff-server-auth.mdc` — httpOnly session; enter writes second cookie only; `authFetch`
  - [x] `nextjs-repository-layout.mdc` — enter under `app/api/auth/`; delivery stays `app/api/gateflow/`
  - [x] `nextjs-bff-route-handlers.mdc` — `bffError`, logging; helper `null` → named 400/403
  - [x] `no-hardcoded-strings.mdc` — enter copy in `programmes.json` (already registered)
  - [x] `workspace-page-layout.mdc` — enter page header/body; empty state
  - [x] `testing-verify-flows.mdc` — unit vs live; new FILE `09`; do not reuse 016 REQ-16
  - [x] `spec-driven-development.mdc` — as-built + tests map
  - [x] `typescript-react-style.mdc` — `"use client"` at enter leaf; RSC pages stay server
  - [ ] skipped: tailwind / client-forms (existing controlled + Card); shared-limits (no new list size unless enter list needs it — then `@/lib/constants`); code-guidelines-index
- [x] ADRs:
  - [x] ADR-001 — UI primitives for enter + empty state
  - [x] ADR-002 Option B — write `PROGRAMME_CONTEXT_COOKIE`; migrate delivery `session.tenant_id` → helper; do not remint `SESSION_COOKIE`
- [x] Spec: `docs/specification/product/INIT-GATEFLOW-017-gateflow-ops.md` REQ-16, 17, 18, 19, 22, 23, 26, 27
- [x] Plan §9 W3 + board https://github.com/drivestream-lab/gateflow-ops/issues/37
  - [x] TASK-W3-01 — REQ-16,17,18 — `app/api/auth/programme/route.ts` create
  - [x] TASK-W3-02 — REQ-16,19,23 — delivery BFF + RSC pages use helper only (depends TASK-W3-01)
  - [x] TASK-W3-03 — REQ-16,18,22,26,27 — enter UI + empty state + nav (depends TASK-W3-01)
  - [x] TASK-W3-04 — REQ-16,18 — `tests/unit/programme-enter.test.ts` (depends 01, 02)
  - [x] TASK-W3-05 — live REQs — create `09` + as-built (depends 02, 03, 04)

---

### Governance alignment

- [x] No ADR contradiction; this wave **is** the ADR-002 migration change set (RISK-02)
- [x] Kill line documented for wave-acceptance (CTR-04 live; stop if JWT `tenant_id` still scopes delivery)
- [x] ADR-001 + ADR-002 Accepted
- [x] Slice does not resurrect invite/attach (W2 contract)

---

### Must update (via `/loop-spec`)

- [ ] `app/api/auth/programme/route.ts` — enter/leave; set/clear context cookie; no password; no token in JSON; not-granted → named refuse
- [ ] Delivery BFF + RSC pages in TASK-W3-02 `files[]` — `getEnteredProgrammeContext` only; helper `null` → named 400/403 / redirect; `platform_admin` delivery still refused
- [ ] `components/programmes/programme-enter.tsx` + `app/(dashboard)/programmes/enter/page.tsx` + `data/locales/en/programmes.json` + `lib/workspace-nav.ts`
- [ ] `tests/unit/programme-enter.test.ts` — not-granted / missing context; no JWT `tenant_id` fallback
- [ ] `tests/verify/09-programme-enter-delivery.md` + as-built W3 + `tests/README.md` feature map (same-PR; map not in §9 `files[]`)
- [ ] Stale attach copy in `programmes.json` (`attach.*`, list description) — replace with enter/empty-state keys while modifying that file
- [ ] Companions required for green `make check` / ADR-002 seam (not all listable in `files[]`):
  - `app/(dashboard)/page.tsx` — stop presenting JWT `tenant_id` as entered tenant (`sessionTenantLabel`)
  - optional hook leaf if enter UI needs TanStack Query — keep `"use client"` at the leaf; `authFetch` only
  - 016 verify `02`–`06` only if they still treat JWT `tenant_id` as entered scope — do not add 017 `prayog:covers`

---

### Must not

- [ ] Remint or overwrite `SESSION_COOKIE` with a programme-bound JWT (ADR-002 Option A)
- [ ] Leave any TASK-W3-02 delivery handler reading JWT `tenant_id` as entered scope
- [ ] Half-migrate (one delivery route on helper, another still on JWT)
- [ ] Collect a password on enter (not a second login)
- [ ] Invent grant via `POST /api/gateflow/grants` or identities `by-id` ops
- [ ] Let `tenant_admin` call factory/grant BFF or see `/identities`
- [ ] Let `platform_admin` run delivery (REQ-23)
- [ ] Resurrect invite or create+bind attach
- [ ] Migrate CAP-P `app/api/gateflow/programmes` to the helper (REQ-27 stays platform onboard)
- [ ] Host 017 enter `prayog:covers` on 016 verify `02`–`06` / `04-w2-initiative-tracking.md`
- [ ] Open a branch/commit/PR from this skill

---

### Verification plan

| Layer        | What it proves                                                                                          | Command                                     |
| ------------ | ------------------------------------------------------------------------------------------------------- | ------------------------------------------- |
| Static check | lint/types/format                                                                                       | `make check`                                |
| Unit         | not-granted / missing-context named refuse; no JWT `tenant_id` fallback                                 | `make test`                                 |
| Live verify  | enter P1 then P2; zero-grant empty; 016 delivery after enter; invite absent; platform delivery refused  | `tests/verify/09-programme-enter-delivery.md` |
| Ground check | N/A — `/ground-spec` after accept                                                                       | N/A                                         |

### Human wave-acceptance

- [ ] Run `tests/verify/09-programme-enter-delivery.md` against live CTR-04
- [ ] Stop if delivery still uses JWT `tenant_id` or provider rejects identity Bearer
- [ ] Confirm zero-grant empty state; two-programme switch; CAP-P onboard still works; invite still gone
- [ ] Label `wave-accepted` / `wave-acceptance` on the tip — skills do not apply it

---

### Tracker / PR (read-only)

- Initiative: INIT-GATEFLOW-017
- Issue: [#37](https://github.com/drivestream-lab/gateflow-ops/issues/37) (EPIC [#33](https://github.com/drivestream-lab/gateflow-ops/issues/33))
- Spec path: `docs/specification/product/INIT-GATEFLOW-017-gateflow-ops.md`
- Verify command: `tests/verify/09-programme-enter-delivery.md`
- ADRs: ADR-001, ADR-002
- Wave head: `develop` (cut `feature/INIT-GATEFLOW-017-w3-programme-enter` for coding)

---

### Checklist publish readiness

| Field            | Value                                            |
| ---------------- | ------------------------------------------------ |
| Workflow outcome | `pass` — W3 gates satisfied                      |
| Next             | `loop-spec` (`skill`) — `external_action: false` |
| Forge (this hop) | `commit_workspace` **required**                  |
| Later            | After `/loop-spec`, `wave-pr-action`             |

Recommend `/commit-workspace` after explicit authorization.

---

### Merge order

TASK-W3-01 → (TASK-W3-02 ∥ TASK-W3-03) → TASK-W3-04 (after 01+02) → TASK-W3-05.

Cross-service: W3 **consumes** gateflow CTR-04 (unconfirmed path), W0 helper, and W2 grants (membership already exists; enter does not create it). Do not wait on further provider waves.

---

```yaml
handoff:
  contract: sdd-delivery/v2
  stage: pre-implement
  outcome: pass
  artifact:
    path: docs/specification/reports/Pre-Implement-INIT-GATEFLOW-017-W3.md
  blockers: []
  signals:
    initiative: INIT-GATEFLOW-017
    wave: W3
    board_issue: https://github.com/drivestream-lab/gateflow-ops/issues/37
    epic_issue: https://github.com/drivestream-lab/gateflow-ops/issues/33
    tasks:
      - TASK-W3-01
      - TASK-W3-02
      - TASK-W3-03
      - TASK-W3-04
      - TASK-W3-05
    implements:
      - REQ-16
      - REQ-17
      - REQ-18
      - REQ-19
      - REQ-22
      - REQ-23
      - REQ-26
      - REQ-27
    check_command: make check
    test_command: make test
    verify_command: tests/verify/09-programme-enter-delivery.md
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
    title: "[INIT-GATEFLOW-017 W3] Pre-implement checklist"
    body_path: docs/specification/reports/Pre-Implement-INIT-GATEFLOW-017-W3.md
```
