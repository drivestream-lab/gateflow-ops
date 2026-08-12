# Technical Design Document — INIT-GATEFLOW-016

| Field | Value |
|-------|-------|
| Initiative | INIT-GATEFLOW-016 |
| Spec | `docs/specification/product/INIT-GATEFLOW-016-gateflow-ops.md` |
| Spec digest | `sha256:df50e720703a1d65b1cdac960b1ecb4826c0f87245ed86e0f128d34bb2b2506a` |
| Feasibility report | `docs/specification/reports/Initiative-Feasibility-Report-INIT-GATEFLOW-016.md` |
| PRD digest | `sha256:2ee19c297b4f948c9f3fbb29d5b45e1e5db9e32fce4a21780915872b3640947a` |
| Impact map / revision | `prayog-meta/prd/reports/Impact-Map-INIT-GATEFLOW-016.md` / `1` |
| Repo scope digest | `sha256:4daa0360b2c895fca619c93bc2bf765c6cca1a0c05d12e0cae9331bead47df08` |
| Approved meta PR head | `5422e0f28ce8cb6b0b9f936b5df87afe280d4957` |
| Source freshness | CURRENT — meta head `5422e0f…`; tip `cc63950…` on Draft PR #19; H1–H3 match |
| Repo | gateflow-ops |
| Date | 2026-08-12 |
| Branch | `chore/INIT-GATEFLOW-016-spec-gateflow-ops` (spec PR — TDD published via Forge) |
| Initiative segment | `INIT-GATEFLOW-016` |
| Status | Draft |
| Review deadline | 2026-08-19 |
| Deciders | PE: @drivestream-lab/prayog-pe-team — explicit LGTM required, not approval by silence |

---

## 1. Problem statement

The chassis has a single exemplar BFF route (`app/api/gateflow/status` →
`/api/dev-echo`) and a thin session→Bearer bridge (`upstreamFetch`), while
CTR-01–07 require many same-origin BFF resources and UI modules under one
upstream folder. Without a fixed module map, implementers can invent
UI-named API trees, duplicate upstream clients, or pull a second component
kit. This TDD locks layer boundaries, BFF resource folders, composition for
REQ-07, shell ownership, auth mode for live verify, and test policy — and
indexes ADR-001 for PE Accept.

---

## 2. Module / package boundaries

| Module | Current state | Change | Owns |
|--------|---------------|--------|------|
| `app/api/auth/*` | exists | unchanged | Portal session login/logout/me |
| `app/api/gateflow/status` | exemplar → dev-echo | keep as health exemplar until product pages replace | Chassis upstream probe |
| `app/api/gateflow/{tenants,programme,waves,runs,initiatives,metrics,checkpoints,board}/` | absent | create per wave | Same-origin BFF → gateflow HTTP (CTR-01–07) |
| `lib/upstream-fetch.ts`, `lib/bff.ts`, `lib/bff-logging.ts` | exists | reuse | Server upstream I/O, error map, logging |
| `lib/onboarding-verdict.ts` (new) | absent | create | Pure REQ-07 pass/fail composition (no I/O) |
| `lib/fetch-*.ts` / `lib/gateflow/*.ts` (new) | absent | create | Typed same-origin clients for hooks (no upstream URL) |
| `hooks/use-*` | exemplar only | extend | TanStack Query over `/api/gateflow/*` via `authFetch` |
| `components/ui/*` | exists | extend via shadcn CLI | Primitives (ADR-001) |
| `components/workspace/*` | absent | create | Shell: nav, page header/body, optional context panel |
| `components/{tenant,fleet,runs,initiatives,metrics,checkpoints,board}/` | absent | create per wave | Feature composition |
| `app/(dashboard)/**` | status page | replace/extend by workflow routes | Page assembly + server session guard |
| `tests/unit/*` | chassis | add verdict + BFF mappers | Pure logic |
| `tests/verify/*` | `01-login-status-page` | add per-wave scripts | Live journeys |

**Boundary diagram (text):**

```
Browser (authFetch /api only)
  → [app/api/gateflow/<resource>]  →  [upstreamFetch + session JWT]
       → gateflow HTTP (CTR-01–07)
  → [hooks] → [feature components] → [components/ui + workspace]
  → [lib/onboarding-verdict]  (pure; called from feature/BFF shaping only)
```

**Canonical BFF resource map (resolves FF-02 / Q-3):**

| Folder under `app/api/gateflow/` | CTR | Wave |
|----------------------------------|-----|------|
| `tenants/` | CTR-01 | W0 |
| `programme/` | CTR-02 | W0 |
| `waves/` | CTR-03 (start) | W1 |
| `runs/` (+ `runs/[runId]/forge`) | CTR-03 | W1 |
| `initiatives/` | CTR-06 | W2 |
| `metrics/` | CTR-07 | W3 |
| `checkpoints/` | CTR-04 | W4 |
| `board/` | CTR-05 | W4 |
| `status/` | chassis | keep |

Exact route filenames inside each folder are plan/wave tasks; folders must not
be named after UI workflows (`onboarding/`, `mission-control/`).

---

## 3. Public interface contracts

### 3.1 Browser → BFF (`authFetch`)

**Method / entry point:** `authFetch("/api/gateflow/…")`
**Arguments:**
- `path`: same-origin `/api/*` only
- `init`: standard fetch init; credentials same-origin

**Return:**
- `Response` JSON shaped by route handlers
- Error: `{ error: i18nKey }` via `bffError`; 401 redirects to login

**Invariants:**
- No upstream base URL or JWT in the browser
- No `PLATFORM_ADMIN` BFF surfaces exist

### 3.2 BFF → gateflow (`upstreamFetch`)

**Method / entry point:** `upstreamFetch(path, init)`
**Arguments:**
- `path`: gateflow API path (server-only)
- Bearer from session cookie when present
- optional `correlationId`

**Return:**
- Upstream `Response`; handlers map status via `mapUpstreamStatus`

**Invariants:**
- Session JWT never returned to client
- Minimal JSON shaping — no raw upstream dump

### 3.3 REQ-07 composition (`lib/onboarding-verdict`)

**Method / entry point:** `composeOnboardingVerdict(selectOutcome, readiness)`
**Arguments:**
- select outcome enum union from CTR-02
- readiness fields `harness_verified`, `verdict_type`

**Return:**
- `{ verdict: "pass" | "fail", reasonKey: string }` — never partial

**Invariants:**
- Pure function; unit-tested; single shared module (no per-screen copies)
- Fail outcomes block membership presentation

### 3.4 Shell → pages

**Method / entry point:** `WorkspaceShell` slots (`PageHeader`, `PageBody`, optional `ContextPanel`)
**Arguments:** page-provided title/actions/body nodes
**Return:** layout chrome only
**Invariants:**
- Nav from config (`lib/workspace-nav.ts` or `data/master/`); i18n via `t()`
- No feature data fetch inside shell

---

## 4. ADR resolutions

| Finding | Classification | ADR file / TDD section | product_constraints | Product exclusions | Recommendation / default | Status | Digest |
|---------|----------------|------------------------|---------------------|--------------------|--------------------------|--------|--------|
| FF-01 | ADR_REQUIRED | `docs/specification/adr/adr-001-ui-primitives-shadcn-semantic-tokens.md` | `[REQ-01…REQ-31]` | REQ behavior owned by spec | Option A (shadcn + semantic tokens); PE Accept | Draft | `sha256:fd47b3df782bfc5151b47448ccb2315f098bcff537d91e9860b9a6e882ee392d` |
| FF-02 | TDD_ONLY | §2 BFF resource map | CTR-01–07 | none | Folders under `app/api/gateflow/<resource>/` as table above | Resolved | N/A |
| FF-03 | TDD_ONLY | §5 / §9 | — | — | Live verify uses `AUTH_MODE=jwt-upstream` + real `UPSTREAM_BASE_URL` | Resolved | N/A |
| FF-04 | TDD_ONLY | §5 | — | — | One verify script per wave in `tests/verify/` + feature-map row | Resolved | N/A |
| FF-05 | TDD_ONLY | §2 | REQ-01–31 | — | Greenfield create modules per wave order | Resolved | N/A |
| FF-06 | TDD_ONLY | §2 / §3.4 | — | — | Implement `components/workspace/*` per `workspace-layout.md` in W0 | Resolved | N/A |

**Derived counts:**

- ADR_REQUIRED: 1 (existing ADR-001; no new ADR file)
- TDD_ONLY: 5
- DEFERRED_WITH_DEFAULT: 0
- Draft ADR files created: 0 (updated metadata on ADR-001)
- Missing/broken ADR files: 0

---

## 5. Test policy

| Module / area | Unit layer tests | Integration layer | Live verify | Golden test strategy |
|---------------|-----------------|-------------------|-------------|----------------------|
| `lib/onboarding-verdict` | All outcome × readiness combos; no I/O | N/A | W0 onboarding journey | exact verdict + reasonKey |
| BFF error/status mappers | `mapUpstreamStatus` / shaping helpers with mocked `fetch` | N/A | — | exact status codes |
| Feature hooks | Optional: query key + error normalize with MSW-style mock | N/A | — | exact |
| CAP journeys | — | N/A (no CI full stack) | `tests/verify/0N-…` per wave | exact UI/API assertions; no snapshot of upstream blobs |
| Chassis auth | existing `auth.test.ts` | — | `01-login-status-page` + jwt-upstream smoke for W0 | exact |

**AI-output determinism policy:** N/A — portal does not generate model output.

**CI vs live:** unit in CI; live verify documented manual/scripted against real gateflow (FF-03).

---

## 6. Error handling strategy

| Failure mode | Module where it originates | Propagation path | Recovery |
|--------------|---------------------------|------------------|----------|
| Missing session | BFF route | `bffError(401, …)` → `authFetch` redirect | re-login |
| Upstream 4xx/5xx | `upstreamFetch` | `mapUpstreamStatus` → `bffError` + i18n key | surface; no silent retry on forge authorize |
| Select/readiness fail outcomes | feature + verdict helper | UI fail state | operator-readable; no half-member |
| Forge authorize precondition fail | BFF runs/forge | structured error passthrough | terminal for that click |
| Empty tenant lists | BFF/UI | empty state | not treated as hard error |

---

## 7. Observability contract

| Module | Log level | Structured fields | Notes |
|--------|-----------|-------------------|-------|
| Each `app/api/gateflow/*` route | INFO success / ERROR fail | method, url, correlationId, userId, tenantId, module=`gateflow-<resource>-api` | Follow exemplar `status` route |
| `upstreamFetch` | DEBUG when `LOG_UPSTREAM_CALLS` | path, status, durationMs | no secrets |
| Client | — | — | no upstream logging from browser |

---

## 8. Data contract ownership

| Schema / data type | Owner (defines + validates) | Validation layer | Versioning |
|--------------------|----------------------------|------------------|------------|
| Gateflow API payloads (CTR-01–07) | gateflow (provider) | BFF edge minimal shape; UI consumes BFF DTO | unchanged — monitor IM-01 |
| BFF response DTOs | gateflow-ops BFF | Route handler | amend-by-PE per wave |
| Onboarding verdict | `lib/onboarding-verdict` | unit + call sites | immutable enum pass/fail |
| Session JWT claims | portal auth / upstream auth | `lib/jwt` decode | chassis |

---

## 9. Resolved engineering decisions

| Finding ID | Owner | Status | Question | Resolution | Required by | Default if deferred | Evidence / reference |
|------------|-------|--------|----------|------------|-------------|---------------------|----------------------|
| FF-01 | PE | resolved | Accept ADR-001 vs packaged kit | Keep Option A; PE Accept ADR-001 on this PR | plan | Chassis already Option A | ADR-001; `components/ui` |
| FF-02 | PE | resolved | BFF folder map | §2 table under `app/api/gateflow/<resource>/` | plan | — | `nextjs-repository-layout.mdc`; exemplar `status` |
| FF-03 | PE | resolved | Auth mode for live CAP verify | `jwt-upstream` + real upstream for W0+ verify | W0 verify | Document in `tests/README.md` | `lib/env.ts`; login route |
| FF-04 | PE | resolved | Verify inventory | One `tests/verify` script + feature-map row per wave | plan | — | testing-verify-flows.mdc |
| FF-05 | PE | resolved | Missing CAP modules | Create greenfield per §2 wave order | waves | — | as-built chassis |
| FF-06 | PE | resolved | Shell missing | Implement workspace shell in W0 with CAP-A/B | W0 | — | `workspace-layout.md` |
| Q-1 | PE | deferred | API freeze monitor | Proceed; revisit if gateflow breaks consumers | W0 | monitor-only | Impact-Map IM-01 |
| Q-2 | PE | deferred | Parallel CAP delivery | Sequential W0→W4 | plan | sequential | Impact-Map IM-02 / PRD OQ-3 |

---

## 10. Routed out — product questions (PM)

| ID | Owner | Status | Question | Blocking | Required by | Default if deferred | Evidence | Resolution reference |
|----|-------|--------|----------|----------|-------------|---------------------|----------|----------------------|
| — | — | — | none | — | — | — | — | — |

---

## 11. Routed out — domain clarifications (SME)

| ID | Owner | Status | Question | Blocking | Required by | Default if deferred | Evidence | Resolution reference |
|----|-------|--------|----------|----------|-------------|---------------------|----------|----------------------|
| — | — | — | none | — | — | — | — | — |

---

## 12. Fix disposition

| ID | Status | Item | Target/evidence | Result digest |
|----|--------|------|-----------------|---------------|
| AF-1 | planned-auto-fix | Index reports in product README when convenient | `docs/specification/product/README.md` | N/A |
| ADR-001 meta | auto-fixed | Bind INIT-GATEFLOW-016 / FF-01 / TDD path | `docs/specification/adr/adr-001-…md` | see §4 |

---

## 13. Implementation readiness verdict

| Gate | Status |
|------|--------|
| All T1–T12 checks | PASS |
| Engineering decisions resolved | 6 resolved, 2 deferred with defaults |
| Draft ADR files written | 1 required (ADR-001 existing Draft) / 0 new |
| Product-boundary integrity (T12) | PASS (lint + re-read) |
| PM questions outstanding | 0 |
| Domain questions outstanding | 0 |
| Selected workflow outcome | `pass` — engineering package ready for PE Accept of TDD + ADR-001 |
| Ready for PE review | YES |
| **Ready for /spec-implementation-plan** | **NO — final exact-head PE approval required** |

---

## Check summary

| Check | Status | Notes |
|-------|--------|-------|
| T1 Module boundaries | PASS | Grounded: exemplar `app/api/gateflow/status`, no CAP folders yet; map named |
| T2 Interface contracts | PASS | authFetch / upstreamFetch / verdict / shell |
| T3 NEW-ADR dispositions | PASS | FF-01 → existing ADR-001; others TDD_ONLY |
| T4 Test policy | PASS | unit vs live verify; CI boundary |
| T5 Error handling | PASS | bffError + forge no silent retry |
| T6 Observability | PASS | createApiLogger pattern |
| T7 Data contract ownership | PASS | provider gateflow; BFF DTOs local |
| T8 Dependency graph | PASS | browser→BFF→upstream; no cycle; ADR-001 aligned |
| T9 Engineering questions zero | PASS | all PE items resolved/deferred |
| T10 PE review readiness | PASS | review ADR-001 + this TDD on PR #19 |
| T11 ADR artifact integrity | PASS | ADR-001 Draft linked; digest in §4 |
| T12 Product-boundary integrity | PASS | lint evidence below; no REQ prose in ADR body |

---

## Forge / PR instructions

> Persist this TDD locally and publish via `/commit-workspace` (or Gateflow
> ForgeClient) to the **Draft spec PR** branch. Do **not** commit, push, open
> PRs, or apply labels inside this skill. PE reviews on the **same PR**.
> Gate 2 label stays **`spec-pending`** until the implementation plan exists.
> PE accepts architecture by publishing **Accepted** TDD/ADR files — not by
> setting `spec-lgtm` yet.

```
Branch:   chore/INIT-GATEFLOW-016-spec-gateflow-ops
PR:       https://github.com/drivestream-lab/gateflow-ops/pull/19
Reviewers: @drivestream-lab/prayog-pe-team
Review deadline: 2026-08-19

PE review checklist:
  [ ] T1–T2 module map + contracts
  [ ] T3 ADR-001 Accept path
  [ ] T4–T7 test/errors/observability/data ownership
  [ ] T9–T12 clean
  [ ] Lint evidence recorded on Accept

PE action (artifact acceptance — mid-lane):
  Explicitly state decisions ready for acceptance
  Developer/PE: ADR-001 + this TDD Status → Accepted (+ Lint evidence, Approved head)
  Forge publish; label remains spec-pending
  → /spec-implementation-plan
```

---

```yaml
handoff:
  contract: sdd-delivery/v2
  stage: spec-technical-review
  outcome: pass
  artifact:
    path: docs/specification/reports/Technical-Review-INIT-GATEFLOW-016.md
  blockers: []
  signals:
    ready_for_pe_review: true
    ready_for_plan: false
    adr_required: 1
    adr_paths:
      - docs/specification/adr/adr-001-ui-primitives-shadcn-semantic-tokens.md
    adr_digests:
      - sha256:fd47b3df782bfc5151b47448ccb2315f098bcff537d91e9860b9a6e882ee392d
    tdd_only: 5
    deferred: 2
    new_adr_files_created: 0
    spec_pr: https://github.com/drivestream-lab/gateflow-ops/pull/19
  next_candidates:
    - technical-review-approval
  human_checkpoint: true
  external_action: false
  forge:
    action: commit_workspace
    draft: true
    apply_labels:
      - spec-pending
    title: "[INIT-GATEFLOW-016] Spec — gateflow-ops"
    body_path: docs/specification/product/INIT-GATEFLOW-016-gateflow-ops.md
```
