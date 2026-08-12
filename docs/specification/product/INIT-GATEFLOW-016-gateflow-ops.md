# INIT-GATEFLOW-016 — spec slice for gateflow-ops

| Field | Value |
|-------|-------|
| Initiative | INIT-GATEFLOW-016 |
| PRD | `prayog-meta/prd/INIT-GATEFLOW-016.md` |
| PRD digest (H1) | `sha256:2ee19c297b4f948c9f3fbb29d5b45e1e5db9e32fce4a21780915872b3640947a` |
| Meta PR | https://github.com/drivestream-lab/prayog-meta/pull/41 |
| Meta PR approved head (G1) | `5422e0f28ce8cb6b0b9f936b5df87afe280d4957` |
| Impact map | `prayog-meta/prd/reports/Impact-Map-INIT-GATEFLOW-016.md` |
| Impact-map revision (H3) | `1` |
| Repo scope digest (H2) | `sha256:4daa0360b2c895fca619c93bc2bf765c6cca1a0c05d12e0cae9331bead47df08` |
| Tech-lead approval | [PRR](https://github.com/drivestream-lab/prayog-meta/pull/41#pullrequestreview-4915708147) by `@0xbeefdead`, submitted `2026-08-12T10:57:35Z`, review `commit_id` = G1 head; label `impact-map-lgtm` |
| Repo | gateflow-ops |
| Date | 2026-08-12 |
| Status | Draft — dev review required before Forge publish |

> **H4 citations:** The H1–H3 (and G1) rows above are the durable authority
> carrier for mid-lane freshness. Feas / TDD / plan digests are walk-time only
> and may be purged at initiative closure — see
> `prayog-skills/references/artifact-write-contract.md`.

## Overview

This repo delivers **Gateflow Mission Control (v0)**: authenticated UI and
same-origin BFF that present seven capability areas (identity, fleet
onboarding, wave operations, checkpoint evidence, board/tickets, initiative
delivery tracking, metrics/efficacy) by consuming **existing, live** gateflow
HTTP APIs only. Scope is UI/BFF product behavior for operators, tech leads, and
programme leads.

**Out of scope for this repo:** any gateflow route/schema/contract change;
platform-admin (`PLATFORM_ADMIN`) surfaces; Launchpad scaffolding;
`prayog-skills` pin/dispatch edits; auto-lift/auto-merge; roles/RBAC tiers.

**Ownership:** this slice states observable behavior and acceptance only.
BFF module layout, component trees, and transport details are for feasibility /
technical review — not decided here. Existing chassis constraints (session →
server-only upstream JWT; shadcn/token guidance; workspace shell guidance) may
be cited, not redesigned.

**Product wave order (PRD §5, OQ-3 locked):** W0 CAP-A/B → W1 CAP-C → W2 CAP-F →
W3 CAP-G → W4 CAP-D/E.

## Functional requirements

| ID | Requirement | PRD source | Condition / event | Observable result | Evidence layer |
|----|-------------|-----------|-------------------|-------------------|----------------|
| REQ-01 | Present the signed-in operator’s tenant detail for the resolved tenant | PRD `REQ-01`, `CAP-A` | Authorized operator opens tenant view | Tenant detail from gateflow tenant read is shown; path tenant must match session-resolved tenant | live verify |
| REQ-02 | Invite a teammate into the operator’s tenant | PRD `REQ-02`, `CAP-A` | Operator submits a valid invite | Invite succeeds via gateflow tenant-users create; success is observable in UI | live verify |
| REQ-03 | Browse catalogue candidates and trigger catalogue refresh | PRD `REQ-03`, `CAP-B` | Operator opens onboarding catalogue | Candidate list renders; refresh updates the list from gateflow catalogue endpoints | live verify |
| REQ-04 | Connect or re-sync the tenant’s programme meta connection before catalogue use | PRD `REQ-04`, `CAP-B` | Operator connects/re-syncs programme | Connection put/get succeed; catalogue browsing is gated on connection being available | live verify |
| REQ-05 | Admit a catalogue candidate into the fleet and show per-repo outcome in plain language | PRD `REQ-05`, `CAP-B` | Operator selects a candidate | Select response outcome (`ok` / `already_selected` / `setup_failed` / `status_failed` / `probe_failed` / `out_of_catalogue`) is shown as operator-readable text, not a raw enum | live verify |
| REQ-06 | Trigger readiness refresh for fleet repo(s) | PRD `REQ-06`, `CAP-B` | Operator requests readiness refresh | Readiness payload including `harness_verified` and `verdict_type` is obtained and available to the UI | live verify |
| REQ-07 | Compose a single pass/fail onboarding verdict client-side from select + readiness signals | PRD `REQ-07`, `CAP-B`, D7/OQ-2 | REQ-05 and REQ-06 results are available | UI shows exactly one pass/fail presentation — never a partial/ambiguous membership state | unit + live verify |
| REQ-08 | Remove a repo from the fleet | PRD `REQ-08`, `CAP-B` | Operator deselects a fleet member | Deselect succeeds; membership no longer listed as selected | live verify |
| REQ-09 | Start implement, spec, or closeout waves from the console | PRD `REQ-09`, `CAP-C` | Operator starts a wave for a supported lane | Wave-start enqueues a run via gateflow; success/failure is visible | live verify (all 3 lanes) |
| REQ-10 | List runs with filters (initiative/wave/org/repo/status) | PRD `REQ-10`, `CAP-C` | Operator filters fleet activity | Tenant-scoped filtered run list renders | live verify |
| REQ-11 | Open run detail and timeline with unambiguous stop-state presentation | PRD `REQ-11`, `CAP-C` | Operator opens a run | Stages, events, outcomes, durations, and PR number render; stop state is clearly human-checkpoint / failure / complete — expected stops are not styled as errors | live verify |
| REQ-12 | Authorize a pending forge action only via explicit operator action | PRD `REQ-12`, `CAP-C` | Run is `STOPPED` at an `external-action` node; operator authorizes | Forge authorize is invoked; console does not self-dispatch forge skills / Cursor forge actions | live verify |
| REQ-13 | List initiatives and open initiative detail composed from runs + board data | PRD `REQ-13`, `CAP-F` | Operator opens initiative list/detail | Composed initiative list/detail from gateflow renders without manual board/GitHub stitching in the UI | live verify |
| REQ-14 | Show per-wave status map for an initiative | PRD `REQ-14`, `CAP-F` | Operator opens wave map | Per-wave statuses (`done` / `ready-to-start` / `blocked` / `active`) render | live verify |
| REQ-15 | Show initiative spec-lane readout | PRD `REQ-15`, `CAP-F` | Operator opens spec readout | Spec readout from gateflow renders | live verify |
| REQ-16 | Show per-wave implementation readout | PRD `REQ-16`, `CAP-F` | Operator opens implementation readout | Implementation readout renders | live verify |
| REQ-17 | Show per-wave closeout readout | PRD `REQ-17`, `CAP-F` | Operator opens closeout readout | Closeout readout renders | live verify |
| REQ-18 | Show per-wave merge readout | PRD `REQ-18`, `CAP-F` | Operator opens merge readout | Merge readout renders | live verify |
| REQ-19 | Show completion eligibility readout | PRD `REQ-19`, `CAP-F` | Operator checks close-readiness | Completion readout renders | live verify |
| REQ-20 | Show closure preview (pre/post purge lists) | PRD `REQ-20`, `CAP-F` | Operator previews closure | Closure preview renders | live verify |
| REQ-21 | Start initiative closure | PRD `REQ-21`, `CAP-F` | Operator triggers closure | Closure start is accepted (gateflow 202 semantics) and visible as enqueued | live verify |
| REQ-22 | Show legacy stage-duration metrics by node/runner/model | PRD `REQ-22`, `CAP-G` | Operator opens metrics runs view | Metrics runs view renders tenant-scoped data | live verify |
| REQ-23 | Show skill/spec efficacy with filters | PRD `REQ-23`, `CAP-G` | Tech lead opens efficacy panel | Skill-efficacy metrics render; filterable by `model_id` / `prompt_revision` | live verify |
| REQ-24 | Show factory effectiveness metrics | PRD `REQ-24`, `CAP-G` | Tech lead/PE opens panel | Factory-effectiveness metrics render | live verify |
| REQ-25 | Show delivery scorecard with as-of, cumulative, and trailing-90-day delta | PRD `REQ-25`, `CAP-G` | Programme lead opens scorecard | Delivery scorecard renders those series without placeholder/mock values | live verify |
| REQ-26 | Query live checkpoint status by raw PR ref or composed initiative+wave ref | PRD `REQ-26`, `CAP-D` | Operator queries checkpoint status | Status renders; composed ref with no matching run shows named “no run found for this wave” — never fabricated status | live verify |
| REQ-27 | Show checkpoint history for a PR | PRD `REQ-27`, `CAP-D` | Operator opens history | History renders; missing history is a named not-found/empty, not fabricated | live verify |
| REQ-28 | List board tickets for a repo with required org/repo filters | PRD `REQ-28`, `CAP-E` | Operator opens board view with org/repo | Ticket list renders | live verify |
| REQ-29 | Create EPIC/Feature ticket idempotent on initiative_id+type | PRD `REQ-29`, `CAP-E` | Operator creates ticket | Create succeeds; repeated create with same initiative_id+type is idempotent | live verify |
| REQ-30 | Update ticket status | PRD `REQ-30`, `CAP-E` | Operator changes ticket status | Status update succeeds and is reflected | live verify |
| REQ-31 | Link a PR to a ticket | PRD `REQ-31`, `CAP-E` | Operator links a PR | Link succeeds and is visible | live verify |

> **Id convention:** `REQ-*` canonical. Same numbers as PRD `REQ-01`–`REQ-31`.
> Evidence layers name proof intent; they are not implementation design.

**Cross-cutting product rules (all CAP-*):**

- Tenant list (`GET /api/v1/tenants` list) is **not** a console capability (PRD US-1 / CAP-A).
- No client-side roles/RBAC tiers — every signed-in operator has identical capability (PRD D3).
- No UI or BFF call targets `PLATFORM_ADMIN`-gated programme-admin / agent-catalogue surfaces (PRD D4).
- Process/workflow editing is display-only; pin/`dispatch` remain outside this console (PRD D5).
- GitHub appears as outbound links only — no direct GitHub write from this portal (PRD §4).
- Exit proof (PRD): E2E against ≥1 onboarded repo, ≥1 real wave (incl. forge authorize path), ≥1 initiative with board EPIC + run; **zero** gateflow route/schema/contract changes in this initiative’s diffs.

## Negative and failure paths

| REQ | Condition | Required behavior | Why it matters | Evidence |
|-----|-----------|-------------------|-----------------|----------|
| REQ-05 / REQ-07 | Select/readiness outcome is `setup_failed` / `probe_failed` / `status_failed` / `out_of_catalogue` | Fleet membership blocked; operator-readable reason; no silent half-member | Prevents false “onboarded” fleet state | live verify |
| REQ-01–REQ-31 | Cross-tenant read attempt | Refused or scoped empty; never another tenant’s data | Prevents cross-tenant leakage | live verify / inspection |
| REQ-09 | Wave-start invalid/blocked precondition | Gateflow structured error surfaced; run not enqueued | Prevents duplicate/zombie runs | live verify |
| REQ-11 | Unknown `run_id` | Named not-found; no fabricated run | Prevents false ops decisions | live verify |
| REQ-12 | Authorize when run is not `STOPPED` at `external-action` | Structured error surfaced; no silent no-op / auto-retry that hides failure | Prevents accidental forge execution | live verify |
| REQ-26 | Composed checkpoint ref with no matching run | Named “no run found for this wave” | Prevents fabricated gate status | live verify |
| REQ-26 / REQ-27 | Raw PR ref with no checkpoint history | Named not-found/empty | Prevents fabricated evidence | live verify |
| REQ-13–REQ-21 | Incomplete board/GitHub composition from gateflow | Honest gap (e.g. no Draft PR yet); no invented fields | Prevents false delivery narrative | live verify |
| All list/readouts | Valid tenant, no data yet | Well-formed empty state; empty ≠ hard error | Prevents fake metrics/membership | live verify |
| All | Attempted `PLATFORM_ADMIN` route use | Never attempted — no UI/BFF surface | Prevents role leakage by design | inspection |

## Out of scope for this repo

- Any change to `drivestream-lab/gateflow` routes, schemas, or contracts (PRD D2; map §4 monitor-only)
- Named gateflow backend gaps: fleet-summary, workflow-pin readiness probe, process-map, log-pane narrative/deep links
- Platform-admin console (`programme_admin_routes` / `agent_catalogue_router`)
- Server-side composite onboarding-scorecard endpoint (client-side composition locked — OQ-2)
- Launchpad greenfield scaffolding; `prayog-skills` pin/`dispatch` edits
- Auto-lift checkpoints / auto-merge; roles/RBAC tiers; process editing in UI
- Cross-tenant tenant-list browsing

## Cross-service contracts

All contracts are **unchanged** consumer boundaries (map §6). Entry points name logical operations; concrete paths below are already approved in the PRD.

| Contract ID | Provider / owner | Consumer / owner | Entry point | Input shape | Output shape | Invariants | Errors | Compatibility / versioning | Contract-test location |
|-------------|------------------|------------------|-------------|-------------|--------------|------------|--------|----------------------------|------------------------|
| CTR-01 | gateflow / PE | gateflow-ops / PE | CAP-A identity: tenant detail read; tenant user invite | Resolved tenant id; invite payload | Tenant detail; invite acknowledgment | JWT tenant must match path tenant; no tenant-list surface in this console | Auth/tenant mismatch refused | Unchanged live surface; freeze/monitor per A4 / IM-01 | planned under `tests/verify` + BFF unit |
| CTR-02 | gateflow / PE | gateflow-ops / PE | CAP-B programme connect, catalogue, select/deselect, readiness refresh | Tenant id; programme connect; candidate selection; readiness refresh | Connection; catalogue; per-repo outcomes; harness_verified + verdict_type | Outcomes enumerated; fail outcomes block membership | Structured fail outcomes; upstream errors surfaced | Unchanged; composition stays client-side (REQ-07) | unit (composition) + live verify |
| CTR-03 | gateflow / PE | gateflow-ops / PE | CAP-C wave start; runs list/detail; forge authorize | Lane start; filters; run id; authorize | Enqueued run; run list/detail/timeline; authorize result | Expected stops ≠ errors; authorize only for external-action stop | Invalid start; authorize precondition errors | Unchanged | live verify |
| CTR-04 | gateflow / PE | gateflow-ops / PE | CAP-D checkpoint status/history | PR ref or composed initiative+wave ref | Status; history | No fabricated status when run missing | Named no-run / not-found | Unchanged | live verify |
| CTR-05 | gateflow / PE | gateflow-ops / PE | CAP-E board tickets list/create/status/link | org/repo required on list; ticket fields; link payload | Ticket list; create (idempotent on initiative_id+type); status; link | Idempotent create key | Upstream structured errors | Unchanged | live verify |
| CTR-06 | gateflow / PE | gateflow-ops / PE | CAP-F initiatives list/detail/waves/readouts/completion/closure/start | Initiative id; wave id; closure start | Composed readouts; 202 on closure start | Display gateflow composition as-is; honest gaps | Upstream errors; empty compositions | Unchanged | live verify |
| CTR-07 | gateflow / PE | gateflow-ops / PE | CAP-G metrics runs / skill-efficacy / factory-effectiveness / delivery-scorecard | Optional filters (model_id, prompt_revision) | Tenant-scoped metric series | No mock/placeholder values in exit proof | Empty tenant → empty state | Unchanged | live verify |

## Non-functional requirements

| Area | Requirement or N/A rationale | Acceptance / evidence |
|------|------------------------------|-----------------------|
| Security | Session cookie stays httpOnly; upstream JWT only on server BFF; no browser storage of upstream tokens; no `PLATFORM_ADMIN` calls; forge only on explicit authorize | inspection + live verify; route audit |
| Reliability | Upstream structured errors surfaced; no silent swallow on forge authorize / wave start; empty states for no-data | live verify negative paths |
| Performance / capacity | N/A for new capacity targets this INIT — present existing gateflow payloads; no SLA invented here | N/A — revisit if list sizes force pagination product rules |
| Observability | Follow existing portal BFF logging patterns for upstream calls/failures | inspection / unit on logging helpers as added |
| Privacy / data handling | No new PII store; tenant/user data only via existing gateflow endpoints | inspection |
| Migration / compatibility | Chassis login/session retained; exemplar status page may remain until replaced by product screens | as-built update per wave |
| Rollback / recovery | UI/BFF-only; rollback = revert app release; no gateflow schema rollback | ops note |
| Operations / support | Operators use console instead of raw API for in-scope flows; support via existing gateflow error payloads | live verify exit proof |

## Assumptions

| ID | Assumption | Evidence | Owner | Status | Invalidated when |
|----|------------|----------|-------|--------|------------------|
| A-1 | Consumed gateflow routes remain tenant-admin gated and stable for delivery | PRD A1; map CTR-01–07 unchanged | PE | confirmed (PRD) | Breaking gateflow auth/route change |
| A-2 | CAP-F readouts already compose runs+board; console displays as-is | PRD A2 | PE | confirmed (PRD) | Readout semantics change upstream |
| A-3 | CAP-B select+readiness shapes stay stable enough for client-side pass/fail composition | PRD A3 / OQ-2 | PE | open risk | Drift forces server composite ask |
| A-4 | No concurrent gateflow contract change during this INIT window | PRD A4; IM-01 | PE | open | Gateflow ships breaking consumer change |
| A-5 | Chassis session→server JWT bridge remains the auth path for BFF | as-built + `lib/auth*` | PE | confirmed (code) | Auth chassis redesign |

## Spec questions (ambiguities — need PM or domain confirmation before feasibility)

| ID | Lane | Question | Owner | Blocking | Required by | Default if deferred | Status | Resolution link |
|----|------|----------|-------|----------|-------------|---------------------|--------|-----------------|
| Q-1 | PE | Confirm consumed gateflow API groups (CTR-01–07) stay frozen/monitored for delivery (map IM-01) | PE | no | Before W0 impl | Proceed — monitor only; no gateflow change planned | open | Impact-Map IM-01 |
| Q-2 | PE | Whether CAP-F/G can parallelize with CAP-B/C in execution (map IM-02) | PE | no | `spec-implementation-plan` | Sequential W0→W4 per PRD OQ-3 | open | Impact-Map IM-02 |
| Q-3 | PE | Exact BFF path layout / module split under `app/api/<upstream>/…` for the seven route groups | PE | no | technical review | Follow repo BFF-by-upstream-service rule; name modules in TDD | open | pending TDD |

No material PM/domain blockers remain (PRD OQ-1–OQ-3 resolved).

## Draft check summary (D1–D12)

| Check | Status | Evidence / findings |
|-------|--------|---------------------|
| D1 Approved handoff current | PASS | Head `5422e0f…` = APPROVED review `commit_id`; H1 digest match; H3 rev 1; H2 scope digest present; repo affected; label `impact-map-lgtm`. Note: review *body* text still cites `meta_pr_head_sha: 003e4228…` (prior commit); PRD+map bytes identical on both SHAs — formal G1 uses `commit_id`. |
| D2 Complete PRD traceability | PASS | CAP-A–G / PRD REQ-01–31 → this slice REQ-01–31 |
| D3 Repo-bounded scope | PASS | Matches map §2 scope digest; out-of-scope lists gateflow/platform-admin/etc. |
| D4 Observable acceptance | PASS | Each REQ has condition, observable result, evidence layer |
| D5 Negative/failure paths | PASS | Table covers PRD error table situations |
| D6 Assumptions/questions | PASS | A-1–A-5; Q-1–Q-3 non-blocking with defaults |
| D7 Cross-repository contracts | PASS | CTR-01–07 semantic consumer contracts |
| D8 NFR applicability | PASS | All rows filled or N/A with reason |
| D9 As-built alignment | PASS | Chassis-only today (login, exemplar status, health); all CAP-* are **new** product behavior |
| D10 Dependency order | PASS | gateflow (live) → gateflow-ops; internal wave order W0–W4 |
| D11 Zero unresolved blockers | PASS | No blocking questions |
| D12 Output completeness | PASS | Header, tables, checks, outcome, PR readiness present |

**Draft verdict:** PASS

**Selected workflow outcome:** `pass`
**Outcome reason:** D1–D12 PASS, zero material blockers, Gate 1 identities current, PR READY package filled for `spec-pr-action`.

Do not advance to `/initiative-feasibility` until this draft is published on a Draft spec PR head and developer review below is complete.

## PR readiness handoff

| Item | Value |
|------|-------|
| Workflow outcome | `pass` — Gate 1 current; D1–D12 PASS; zero blockers |
| Verdict | PR READY |
| Existing spec PR | none |
| Proposed branch | `chore/INIT-GATEFLOW-016-spec-gateflow-ops` |
| Proposed base | `develop` |
| Proposed title | `[INIT-GATEFLOW-016] Spec — gateflow-ops` |
| PR type | **Draft** (entire spec lifecycle) |
| Local artifacts to publish | `docs/specification/product/INIT-GATEFLOW-016-gateflow-ops.md`, `docs/specification/product/README.md` |
| Forge readiness | fill `handoff.forge` for `open_draft_pr`; recommend `/commit-workspace` then `/open-draft-pr` — do not commit/push/open PR inside this skill |
| Reviewer | @drivestream-lab/prayog-pe-team |
| Initial Gate 2 label | `spec-pending` |
| Additional invalidation label | none |
| Blocking items | none |

**No GitHub side effects have occurred.** Persist the draft locally, present
this section in chat, and ask whether to authorize Forge publish
(`/commit-workspace` / `/open-draft-pr` or Gateflow ForgeClient). Continue only
after explicit authorization.

### Proposed Draft PR body

```markdown
## Initiative

INIT-GATEFLOW-016 — Gateflow Mission Control (v0) for gateflow-ops

## Meta handoff

- Meta PRD PR: https://github.com/drivestream-lab/prayog-meta/pull/41
- Approved meta head: `5422e0f28ce8cb6b0b9f936b5df87afe280d4957`
- Impact-map revision: 1
- PRD digest: `sha256:2ee19c297b4f948c9f3fbb29d5b45e1e5db9e32fce4a21780915872b3640947a`
- Repo scope digest: `sha256:4daa0360b2c895fca619c93bc2bf765c6cca1a0c05d12e0cae9331bead47df08`

## Spec path

`docs/specification/product/INIT-GATEFLOW-016-gateflow-ops.md`

## Summary

- 31 REQs (CAP-A–G) — UI/BFF only against live gateflow APIs
- 7 unchanged consumer contracts (CTR-01–07)
- Open engineering questions: Q-1–Q-3 (non-blocking)

## Gate 2 — spec package readiness

Initial label: `spec-pending`

- [ ] Spec slice published on this PR head (via Forge `/commit-workspace` / `/open-draft-pr`)
- [ ] Feasibility report (later Forge publish)
- [ ] Technical design + ADRs (later Forge publish)
- [ ] Implementation plan §9 (later Forge publish)
- [ ] PE sets `spec-lgtm` on exact final head before merge

Requested reviewer: @drivestream-lab/prayog-pe-team
```

## Developer review

- [ ] Scope matches the approved impact-map repo scope digest
- [ ] REQs have condition/event, observable result, and evidence layer
- [ ] Contracts are semantic (logical operation); no architecture decisions in REQs
- [ ] No blocking question remains
- [ ] Developer confirmed draft is ready for feasibility

## After Draft PR creation

PE controls Gate 2 labels on the spec PR. Never infer approval from labels
alone — `spec-lgtm` requires matching artifacts on the exact PR head.

Provision labels before PR creation when missing:

```bash
launchpad apply-gates --repo gateflow-ops --apply
```

| PE action | Remove | Add |
|-----------|--------|-----|
| Pending/new revision | `spec-lgtm`, `spec-blocked` | `spec-pending` |
| Request changes/hold | `spec-pending`, `spec-lgtm` | `spec-blocked` |
| Approve full package | `spec-pending`, `spec-blocked`, `spec-revised`, `spec-stale` | `spec-lgtm` |

## References

- PRD: `prayog-meta/prd/INIT-GATEFLOW-016.md`
- Meta PRD PR: https://github.com/drivestream-lab/prayog-meta/pull/41
- Spec PR: pending Forge
- Impact map: `prayog-meta/prd/reports/Impact-Map-INIT-GATEFLOW-016.md`
- As-built: `docs/specification/as-built/implementation-status.md`
- Workspace layout: `docs/project-guidance/workspace-layout.md`
- ADR-001 (Draft): `docs/specification/adr/adr-001-ui-primitives-shadcn-semantic-tokens.md`

---

```yaml
handoff:
  contract: sdd-delivery/v2
  stage: spec-draft
  outcome: pass
  artifact:
    path: docs/specification/product/INIT-GATEFLOW-016-gateflow-ops.md
  blockers: []
  signals:
    pr_ready: true
    initiative: INIT-GATEFLOW-016
    meta_pr: https://github.com/drivestream-lab/prayog-meta/pull/41
    meta_pr_head: 5422e0f28ce8cb6b0b9f936b5df87afe280d4957
    map_revision: 1
    source_prd_digest: sha256:2ee19c297b4f948c9f3fbb29d5b45e1e5db9e32fce4a21780915872b3640947a
    scope_digest: sha256:4daa0360b2c895fca619c93bc2bf765c6cca1a0c05d12e0cae9331bead47df08
  next_candidates:
    - spec-pr-action
  human_checkpoint: false
  external_action: true
  forge:
    action: open_draft_pr
    draft: true
    apply_labels:
      - spec-pending
    title: "[INIT-GATEFLOW-016] Spec — gateflow-ops"
    body_path: docs/specification/product/INIT-GATEFLOW-016-gateflow-ops.md
```
