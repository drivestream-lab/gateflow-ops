# Technical Design Document — INIT-GATEFLOW-017

| Field                 | Value                                                                                                         |
| --------------------- | ------------------------------------------------------------------------------------------------------------- |
| Initiative            | INIT-GATEFLOW-017                                                                                             |
| Spec                  | `docs/specification/product/INIT-GATEFLOW-017-gateflow-ops.md`                                                |
| Spec digest           | `sha256:993f2d32f3c3f5bbddb7c00b419aa6eb069b88ea060d6144bc84c9634f99ea60`                                     |
| Feasibility report    | `docs/specification/reports/Initiative-Feasibility-Report-INIT-GATEFLOW-017.md`                               |
| PRD digest            | `sha256:c0fe55040928a13976133edde5cf71f0524815c17c0a8de79173ed3fa0657f67`                                     |
| Impact map / revision | `prayog-meta/prd/reports/Impact-Map-INIT-GATEFLOW-017.md` / `1`                                               |
| Repo scope digest     | `sha256:13cee9aae41718fd4ad8655d77738042761b0e45db7eefc898a693c42c2fb987`                                     |
| Approved meta PR head | `601b00e0a74510a6af1c33bc80ca27260995c094`                                                                    |
| Source freshness      | CURRENT — meta PR #42 merged; head `601b00e0…` = G1; H1–H3 match spec header; ADR-002 Approved head `ae5e431` |
| Repo                  | gateflow-ops                                                                                                  |
| Date                  | 2026-08-14                                                                                                    |
| Branch                | `chore/INIT-GATEFLOW-017-spec-gateflow-ops` (spec PR — TDD published via Forge)                               |
| Initiative segment    | `INIT-GATEFLOW-017`                                                                                           |
| Status                | Accepted                                                                                                      |
| Review deadline       | 2026-08-20                                                                                                    |
| Deciders              | PE: @drivestream-lab/prayog-pe-team — explicit LGTM required, not approval by silence                         |

---

## 1. Problem statement

Delivery Route Handlers and dashboard server guards treat JWT `tenant_id` on
the single `SESSION_COOKIE` as tenant scope. CTR-03/04 and that claim are not
the same store. Without a locked storage model, implementers can remint the
session JWT on enter or add a second server-only cookie — incompatible BFF
contracts. This TDD locks Option B (ADR-002), BFF folders for CTR-01–04, purge
of invite/attach handlers, and test/error/log policy. UI primitives stay
ADR-001.

---

## 2. Module / package boundaries

| Module                                                                                   | Current state  | Change                                                                                                             | Owns                                                   |
| ---------------------------------------------------------------------------------------- | -------------- | ------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------ |
| `app/api/auth/login`, `logout`, `me`                                                     | exists         | extend: login/logout clear programme cookie; `me` may echo non-secret entered ids                                  | Identity session cookie                                |
| `app/api/auth/programme`                                                                 | absent         | create                                                                                                             | Enter / leave programme (sets/clears programme cookie) |
| `lib/programme-context.ts`                                                               | absent         | create                                                                                                             | `getEnteredProgrammeContext()` server-only             |
| `lib/auth.ts`, `lib/jwt.ts`, `lib/upstream-fetch.ts`                                     | exists         | identity cookie unchanged; Bearer still identity token                                                             | Session token I/O                                      |
| `lib/env.ts`                                                                             | exists         | add programme-cookie name                                                                                          | Server env                                             |
| `app/api/gateflow/identities/`                                                           | absent         | create                                                                                                             | CTR-01 consumer BFF                                    |
| `app/api/gateflow/grants/`                                                               | absent         | create                                                                                                             | CTR-02 consumer BFF                                    |
| `app/api/gateflow/programmes/`                                                           | exists (CAP-P) | keep onboard/catalogue; remove create+bind attach                                                                  | REQ-27; drop REQ-21 path                               |
| `app/api/gateflow/programmes/[programmeId]/tenant-admins`                                | exists         | delete                                                                                                             | 014 attach                                             |
| `lib/programme-attach.ts`                                                                | exists         | delete with attach                                                                                                 | Token-strip helper obsolete with attach                |
| `app/api/gateflow/tenants/users`                                                         | exists         | delete                                                                                                             | Invite BFF                                             |
| `components/tenant/tenant-detail.tsx` invite card                                        | exists         | remove invite; keep tenant read                                                                                    | REQ-20                                                 |
| `components/programmes/programme-detail.tsx` attach form                                 | exists         | replace with grant/membership (no password)                                                                        | CTR-02                                                 |
| `components/{identities,grants}/` + dashboard pages                                      | absent         | create                                                                                                             | Factory list/entry; membership chrome                  |
| `lib/workspace-nav.ts`                                                                   | exists         | add `platform_admin` identity/membership items; `tenant_admin` programme-enter; no factory list for `tenant_admin` | REQ-22, REQ-23, REQ-26                                 |
| `app/api/gateflow/{tenants,programme,waves,runs,initiatives,metrics,checkpoints,board}/` | exists         | switch tenant scope from JWT `tenant_id` to programme-context helper                                               | 016 delivery                                           |
| `app/(dashboard)/{fleet,runs,tenant,…}/page.tsx`                                         | exists         | same helper / empty when context null                                                                              | REQ-18, REQ-19                                         |
| `components/ui/*`, `components/workspace/*`                                              | exists         | reuse                                                                                                              | ADR-001 + shell                                        |
| `tests/unit/*`                                                                           | 016 + chassis  | add context helper, email-shape, grant idempotency, password strip                                                 | parsers/refuses                                        |
| `tests/verify/*`                                                                         | 016 scripts    | add 017 journeys; strip invite/attach steps                                                                        | live                                                   |

**Boundary diagram (text):**

```
Browser (authFetch /api only)
  → [app/api/auth/*]  → identity SESSION_COOKIE + programme context cookie
  → [app/api/gateflow/identities|grants] → [upstreamFetch + identity Bearer]
  → [app/api/gateflow/<delivery>] → helper tenant ids + identity Bearer
       → gateflow HTTP (CTR-01–04; existing 016 CTRs)
  → [hooks] → [feature components] → [ui + workspace]
```

**Canonical BFF resource map (resolves FF-02 / spec Q-5):**

| Folder                                              | Contract           | Notes                                   |
| --------------------------------------------------- | ------------------ | --------------------------------------- |
| `app/api/auth/programme`                            | CTR-04 enter/leave | Session mutation; not a UI-named folder |
| `app/api/gateflow/identities/`                      | CTR-01             | list/search/create/suspend/password-set |
| `app/api/gateflow/grants/`                          | CTR-02             | grant/detach; who-can-enter list shapes |
| `app/api/gateflow/programmes/`                      | CAP-06 / REQ-27    | existing onboard/catalogue; no attach   |
| `app/api/gateflow/{tenants,programme,waves,runs,…}` | 016 delivery       | keep folders; change context source     |

Do not add UI-named trees (`factory/`, `membership-admin/`). Concrete gateflow
URL paths wait on the provider; BFF folders above are this repo’s layout.

**Grounding (T2 code):** `SESSION_COOKIE` only (`lib/env.ts`);
`cookies.set` only in login; `tenant_id` on `JwtPayload`; no programme cookie
symbol in `source_roots`. Codegraph BM25 for `getSession tenant_id` returned
zero (index lag); direct reads used.

---

## 3. Public interface contracts

### 3.1 `getEnteredProgrammeContext` (server-only)

**Method / entry point:** `getEnteredProgrammeContext()`
**Arguments:** none (reads cookies)
**Return:**

- `{ programmeId: string, tenantId: string }` when the programme cookie is
  present and well-formed
- `null` when unset/malformed
  **Error:** none — callers map `null` to empty/not-entered
  **Invariants:**
- Never reads JWT `tenant_id` as entered scope
- Cookie not writable from the client bundle
- Unit-tested with cookie doubles, no network
- `/api/auth/me` may echo non-secret entered ids; it must not return tokens (MDC)

### 3.2 Browser → enter BFF

**Method / entry point:** `authFetch("/api/auth/programme", { method, body })`
**Arguments:**

- enter: programme identifier already granted (shape from provider)
- leave: empty body / DELETE
  **Return:** `{ ok: true }` plus optional non-secret ids; `Set-Cookie` on the
  response
  **Error:** `{ error: i18nKey }` via `bffError` (not granted, wrong actor,
  upstream)
  **Invariants:**
- Does not collect a password
- Does not put access_token in JSON

### 3.3 Browser → identity / grant BFF

**Method / entry point:** `authFetch("/api/gateflow/identities|grants/…")`
**Arguments:** name, email, password on create; email/name query on search;
identity+programme on grant/detach — password never on grant
**Return:** list/detail DTOs without password fields
**Error:** named i18n keys for duplicate email, unknown identity, unknown
programme, wrong actor, missing name/password, not an email, suspended
**Invariants:**

- `platform_admin` session required (reuse `requirePlatformAdminSession`)
- Password write-only after set (REQ-30); strip like former attach helper

### 3.4 Delivery BFF → gateflow

**Method / entry point:** existing `upstreamFetch`
**Arguments:** identity Bearer; entered `tenantId`/`programmeId` from helper
on tenant-scoped paths
**Return:** unchanged mapping via `mapUpstreamStatus`
**Invariants:**

- Missing context → 400/403 with i18n, not a fabricated tenant
- `platform_admin` delivery routes stay refused (existing role guards)

### 3.5 Browser → BFF (`authFetch`)

Unchanged: same-origin `/api/*` only; 401 → `/login`.

---

## 4. ADR resolutions

Every feasibility `NEW-ADR` appears once. `ADR_REQUIRED` rows link actual files.
**Do not embed ADR body content in the TDD.**

| Finding | Classification        | ADR file / TDD section                                                           | product_constraints                        | Product exclusions | Recommendation / default                                                              | Status   | Digest                                                                    |
| ------- | --------------------- | -------------------------------------------------------------------------------- | ------------------------------------------ | ------------------ | ------------------------------------------------------------------------------------- | -------- | ------------------------------------------------------------------------- |
| FF-01   | ADR_REQUIRED          | `docs/specification/adr/adr-002-identity-session-vs-programme-context-cookie.md` | `[REQ-12, REQ-14, REQ-16, REQ-17, REQ-18]` | See those REQ ids  | Option B — identity cookie + programme context cookie                                 | Accepted | `sha256:4fadc933e25fb92930d6104f1bff67d937ee2410b2d8f66b7b3797af5f9bd667` |
| FF-02   | TDD_ONLY              | §2 BFF resource map                                                              | CTR-01–04                                  | none               | folders in §2 table                                                                   | Resolved | N/A                                                                       |
| FF-03   | TDD_ONLY              | §2 purge rows; §5                                                                | REQ-20, REQ-21                             | none               | delete invite + attach modules; amend verify 02/03                                    | Resolved | N/A                                                                       |
| FF-04   | DEFERRED_WITH_DEFAULT | §9                                                                               | kill line                                  | none               | sequential: provider enter+grant HTTP live, then ops BFF/pages that call those routes | Deferred | N/A                                                                       |
| FF-05   | TDD_ONLY              | §5                                                                               | —                                          | none               | new `tests/verify` script(s) for 017; trim 016 invite/attach steps                    | Resolved | N/A                                                                       |
| FF-06   | TDD_ONLY              | §2                                                                               | CAP-01–03                                  | none               | create identities/grants UI+BFF per map                                               | Resolved | N/A                                                                       |
| FF-07   | TDD_ONLY              | §5 / §12                                                                         | REQ-03                                     | none               | email-shape refuse in login/entry mapper + unit                                       | Resolved | N/A                                                                       |
| FF-08   | TDD_ONLY              | §5                                                                               | —                                          | none               | unit parsers/refuses only; journeys in live verify                                    | Resolved | N/A                                                                       |

**Derived counts:**

- ADR_REQUIRED: 1
- TDD_ONLY: 6
- DEFERRED_WITH_DEFAULT: 1 (FF-04 / Q-2)
- Draft ADR files created: 0
- Accepted ADR files: 1 (ADR-002)
- Missing/broken ADR files: 0

ADR-001 remains Accepted and **independent** (UI kit). It constrains new
identity/grant JSX only.

---

## 5. Test policy

| Module / area                      | Unit layer tests                           | Integration layer | Live verify                                                               | Golden test strategy |
| ---------------------------------- | ------------------------------------------ | ----------------- | ------------------------------------------------------------------------- | -------------------- |
| `lib/programme-context`            | cookie present/absent/malformed; never I/O | N/A               | helper after cookie set to P1 then P2; helper `null` when cookie unset    | exact null vs ids    |
| Email-shape / duplicate mapping    | REQ-03/02 refuse helpers with doubles      | N/A               | BFF 4xx + stable i18n key on malformed email at login and identity-create | exact i18n key       |
| Grant idempotency / password strip | pure mappers                               | N/A               | second grant is no-op; response DTO has no password fields                | exact                |
| Invite/attach absence              | N/A                                        | N/A               | deleted routes 404; invite/attach modules absent from the tree            | exact absence        |
| 016 delivery after enter           | existing units unchanged where pure        | N/A               | existing verify/02–06 use helper tenant ids, not JWT `tenant_id`          | exact                |
| Chassis login                      | existing `auth.test.ts` + email-shape      | N/A               | `verify/01`                                                               | exact                |

**AI-output determinism policy:** N/A — portal does not generate model output.

**CI vs live:** `make check` + `test` + `build` in CI; live verify remains
manual/scripted under `tests/verify/` (no Makefile verify target).

---

## 6. Error handling strategy

| Failure mode                                                                                | Module where it originates | Propagation path                             | Recovery                             |
| ------------------------------------------------------------------------------------------- | -------------------------- | -------------------------------------------- | ------------------------------------ |
| No identity session                                                                         | BFF                        | `bffError(401)` → `authFetch` redirect       | re-login                             |
| No entered context on delivery                                                              | delivery BFF / page guard  | i18n empty/not-entered; no fabricated tenant | enter a grant                        |
| Upstream named refuse (duplicate email, unknown identity/programme, suspended, wrong actor) | identity/grant/enter BFF   | `mapUpstreamStatus` + stable i18n key        | surface; no retry that hides failure |
| Invalid credentials                                                                         | login                      | 401 i18n                                     | terminal for that submit             |
| Attach/invite called                                                                        | deleted routes             | 404 if leftover client                       | purge UI same wave                   |
| Upstream 5xx                                                                                | `upstreamFetch`            | 502 `common.errors.upstreamUnavailable`      | terminal                             |

---

## 7. Observability contract

| Module                                           | Log level                       | Structured fields                                      | Notes              |
| ------------------------------------------------ | ------------------------------- | ------------------------------------------------------ | ------------------ |
| `gateflow-identities-api`, `gateflow-grants-api` | INFO success / ERROR fail       | method, url, correlationId, userId, module             | no password fields |
| `auth-programme-api`                             | INFO success / ERROR fail       | userId, programmeId (not token)                        |                    |
| Delivery routes                                  | keep existing                   | add `programmeId` when helper non-null; do not log JWT |                    |
| `upstreamFetch`                                  | DEBUG when `LOG_UPSTREAM_CALLS` | path, status, durationMs                               | no secrets         |

---

## 8. Data contract ownership

| Schema / data type                                   | Owner (defines + validates)  | Validation layer                | Versioning                                            |
| ---------------------------------------------------- | ---------------------------- | ------------------------------- | ----------------------------------------------------- |
| Gateflow identity/grant/session payloads (CTR-01–04) | gateflow (provider)          | BFF edge minimal shape          | provider; ops consumes                                |
| Programme context cookie payload                     | gateflow-ops                 | `lib/programme-context`         | amend-by-PE                                           |
| BFF identity/grant DTOs                              | gateflow-ops BFF             | route handler; password omitted | amend-by-PE                                           |
| Session JWT claims                                   | upstream auth; portal decode | `lib/jwt`                       | identity-scoped; ignore `tenant_id` for entered scope |
| 016 delivery DTOs                                    | unchanged                    | existing handlers               | keep                                                  |

---

## 9. Resolved engineering decisions

| Finding ID  | Owner | Status   | Question                                                  | Resolution                                                                                           | Required by   | Default if deferred                               | Evidence / reference                |
| ----------- | ----- | -------- | --------------------------------------------------------- | ---------------------------------------------------------------------------------------------------- | ------------- | ------------------------------------------------- | ----------------------------------- |
| FF-01       | PE    | resolved | Where entered programme scope is stored vs identity token | ADR-002 Option B                                                                                     | plan          | none — do not code delivery rebind until Accepted | ADR-002; `lib/jwt.ts`               |
| FF-02       | PE    | resolved | BFF folder names for CTR-01–04                            | §2 map (`identities/`, `grants/`, `auth/programme`)                                                  | plan          | MDC by-upstream-service                           | `nextjs-repository-layout.mdc`      |
| FF-03       | PE    | resolved | Invite + attach still live                                | Delete invite and attach Route Handlers, helpers, and verify steps; grant BFF remains the write path | plan          | 017 wins                                          | tenant-users + tenant-admins routes |
| FF-04 / Q-2 | PE    | deferred | Wave split vs kill line                                   | Sequential: provider enter+grant HTTP live, then ops BFF/pages that call those routes                | plan          | sequential                                        | map IM-03; spec A-5                 |
| FF-05       | PE    | resolved | 017 live verify missing                                   | Add script(s); trim 016 invite/attach steps                                                          | plan          | —                                                 | `tests/verify/02`, `03`             |
| FF-06       | PE    | resolved | Identity and grant BFF/page modules absent                | Create per §2                                                                                        | waves         | —                                                 | as-built                            |
| FF-07       | PE    | resolved | Email-shape not in mapper                                 | Unit + BFF refuse empty / no `@` / no domain                                                         | identity wave | —                                                 | `lib/auth-login-upstream.ts`        |
| FF-08       | PE    | resolved | Unit vs live overlap                                      | Parsers/refuses in unit; journeys live                                                               | plan          | testing-verify-flows.mdc                          |                                     |
| Q-5         | PE    | resolved | same as FF-02                                             | §2                                                                                                   | TDD           | —                                                 |                                     |

---

## 10. Routed out — product questions (PM)

| ID   | Owner | Status | Question                                                        | Blocking | Required by | Default if deferred | Evidence            | Resolution reference        |
| ---- | ----- | ------ | --------------------------------------------------------------- | -------- | ----------- | ------------------- | ------------------- | --------------------------- |
| PM-1 | PM    | open   | After promote, update 016 invite stories in meta PRD / 016 spec | no       | later       | 017 truth is REQ-20 | spec Q-4; PRD OQ-02 | pending `/update-documents` |

---

## 11. Routed out — domain clarifications (SME)

| ID  | Owner       | Status | Question                         | Blocking | Required by      | Default if deferred                                           | Evidence            | Resolution reference |
| --- | ----------- | ------ | -------------------------------- | -------- | ---------------- | ------------------------------------------------------------- | ------------------- | -------------------- |
| D-1 | gateflow PE | open   | Leftover 014 bind rows in lab DB | no       | gateflow cutover | Wipe rows; no dual model; this console must not expose attach | spec Q-3; PRD OQ-01 | pending gateflow     |

---

## 12. Fix disposition

| ID    | Status           | Item                                 | Target/evidence         | Result digest |
| ----- | ---------------- | ------------------------------------ | ----------------------- | ------------- |
| AF-1  | planned-auto-fix | `tests/README.md` invite row         | swap when invite purged | N/A           |
| FF-07 | planned-auto-fix | email-shape in `toUpstreamLoginBody` | identity/login wave     | N/A           |

---

## 13. Implementation readiness verdict

| Gate                                    | Status                                                                                |
| --------------------------------------- | ------------------------------------------------------------------------------------- |
| All T1–T12 checks                       | PASS                                                                                  |
| Engineering decisions resolved          | 8 resolved, 1 deferred with default (FF-04)                                           |
| Accepted ADR files written              | 1 / 1 required (ADR-002)                                                              |
| Product-boundary integrity (T12)        | PASS — lint 2/2; independent re-read PASS after in-artifact fix                       |
| PM questions outstanding                | 1 non-blocking (PM-1)                                                                 |
| Domain questions outstanding            | 1 non-blocking (D-1)                                                                  |
| Selected workflow outcome               | `pass` — artifacts Accepted; `ready_for_plan: false` until exact-head GitHub approval |
| Ready for PE review                     | YES — PE accepted ADR-002 + TDD                                                       |
| **Ready for /spec-implementation-plan** | **NO — final exact-head PE approval required**                                        |

---

## Check summary

| Check                          | Status | Notes                                                                                                                                 |
| ------------------------------ | ------ | ------------------------------------------------------------------------------------------------------------------------------------- |
| T1 Module boundaries           | PASS   | §2; grounded in login/JWT/delivery `tenant_id` reads                                                                                  |
| T2 Interface contracts         | PASS   | §3 helper, enter, identity/grant, delivery                                                                                            |
| T3 NEW-ADR dispositions        | PASS   | FF-01 Finding marker `ALTERNATIVE:` validated; ADR-002 Option B; others TDD_ONLY / deferred                                           |
| T4 Test policy                 | PASS   | unit vs live; no undefined “integration”                                                                                              |
| T5 Error handling              | PASS   | 401, missing context, named upstream refuses                                                                                          |
| T6 Observability               | PASS   | no password in logs                                                                                                                   |
| T7 Data contract ownership     | PASS   | provider vs programme cookie vs BFF DTOs                                                                                              |
| T8 Dependency graph            | PASS   | auth → helper → delivery BFF → upstreamFetch; no cycle; ADR-001 independent                                                           |
| T9 Engineering questions zero  | PASS   | PE items resolved/deferred; PM/domain in §10–11                                                                                       |
| T10 PE review readiness        | PASS   | Accepted TDD + ADR-002; `ready_for_plan: false`                                                                                       |
| T11 ADR artifact integrity     | PASS   | ADR-002 Accepted at `adr_dir` with required sections                                                                                  |
| T12 Product-boundary integrity | PASS   | ADR `--strict` 2/2 PASS `sha256:501e402009b86244f70aef08f405b11a4f706979e223f7b7a1b977990c46a499`; TDD `--tdd --require-sources` PASS |

---

## Forge / PR instructions

> Persist this TDD locally and publish via `/commit-workspace` (or Gateflow
> ForgeClient) to the **Draft spec PR** branch. Do **not** commit, push, open
> PRs, or apply labels inside this skill. PE reviews on the **same PR**.
> Gate 2 label stays **`spec-pending`** until the implementation plan exists.
> PE accepts architecture by publishing **Accepted** TDD/ADR files — not by
> setting `spec-lgtm` yet. CODEOWNERS may request PE review on `Technical-Review-*`.

```
Branch:   chore/INIT-GATEFLOW-017-spec-gateflow-ops
PR title: "[INIT-GATEFLOW-017] Spec — gateflow-ops"
PR body:  link meta PRD PR #42; paste §13 Implementation readiness verdict when TDD is ready

Required reviewers (enforced by CODEOWNERS when TDD file is present):
  @drivestream-lab/pe-team  ← CODEOWNERS on Technical-Review-*
  @drivestream-lab/prayog-pe-team  ← spec reviewer

Review deadline: 2026-08-20
PE review checklist (PE works through this on the spec PR):
  [ ] T1 Module boundaries — can I draw the box?
  [ ] T2 Interface contracts — are shapes and invariants specified?
  [ ] T3 ADR dispositions — required Draft files exist; TDD-only/deferred rationales are valid
  [ ] T4 Test policy — is determinism policy acceptable?
  [ ] T9 Zero unresolved PE items?
  [ ] T11 ADR artifact integrity — every required file/link/digest is valid
  [ ] T12 Product-boundary integrity — every user-visible statement cites approved REQ-*
  [ ] T12 mechanical: adr_boundary_lint.py on ADR-002 (--strict) AND on this TDD (--tdd)
  [ ] T12 manual (lint cannot see these — see checks.md "three gaps")

PE action (artifact acceptance — mid-lane):
  Review/comment or Request changes → developer updates TDD/ADR files
  Explicitly state when decisions are ready for acceptance
  Developer/PE updates ADR metadata Draft → Accepted and TDD Status → Accepted
  Publish acceptance package via Forge to spec branch (label remains spec-pending)

After artifact acceptance:
  → /spec-implementation-plan may run on the same branch
  → after plan on head: PE sets spec-lgtm + Approve + attestation
  → Ready for review → merge → `/create-board-tickets` from merged plan §9
```

---

```yaml
handoff:
  contract: sdd-delivery/v2
  stage: spec-technical-review
  outcome: pass
  artifact:
    path: docs/specification/reports/Technical-Review-INIT-GATEFLOW-017.md
  blockers: []
  signals:
    ready_for_pe_review: true
    ready_for_plan: false
    new_adr: true
    adr_files:
      - docs/specification/adr/adr-002-identity-session-vs-programme-context-cookie.md
    adr_digest: sha256:4fadc933e25fb92930d6104f1bff67d937ee2410b2d8f66b7b3797af5f9bd667
    lint_evidence: "adr_boundary_lint.py 2/2, PASS, sha256:501e402009b86244f70aef08f405b11a4f706979e223f7b7a1b977990c46a499"
    spec_pr: https://github.com/drivestream-lab/gateflow-ops/pull/32
    codegraph_provider: mcp-user-prayog-fleet-cbm
    grounding_depth: light
  next_candidates:
    - technical-review-approval
  human_checkpoint: true
  external_action: false
  forge:
    action: commit_workspace
    draft: true
    apply_labels:
      - spec-pending
    title: "[INIT-GATEFLOW-017] Spec — gateflow-ops"
    body_path: docs/specification/reports/Technical-Review-INIT-GATEFLOW-017.md
```
