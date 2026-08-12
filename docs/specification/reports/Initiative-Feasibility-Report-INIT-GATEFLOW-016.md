# Feasibility report — INIT-GATEFLOW-016

| Field                 | Value                                                                                                                           |
| --------------------- | ------------------------------------------------------------------------------------------------------------------------------- |
| Initiative            | INIT-GATEFLOW-016                                                                                                               |
| Spec                  | `docs/specification/product/INIT-GATEFLOW-016-gateflow-ops.md`                                                                  |
| PRD digest            | `sha256:2ee19c297b4f948c9f3fbb29d5b45e1e5db9e32fce4a21780915872b3640947a`                                                       |
| Impact map / revision | `prayog-meta/prd/reports/Impact-Map-INIT-GATEFLOW-016.md` / `1`                                                                 |
| Repo scope digest     | `sha256:4daa0360b2c895fca619c93bc2bf765c6cca1a0c05d12e0cae9331bead47df08`                                                       |
| Approved meta PR head | `5422e0f28ce8cb6b0b9f936b5df87afe280d4957`                                                                                      |
| Impact-map approval   | [PRR](https://github.com/drivestream-lab/prayog-meta/pull/41#pullrequestreview-4915708147) `@0xbeefdead` `2026-08-12T10:57:35Z` |
| Source freshness      | CURRENT — meta head still `5422e0f…`; H1/H2/H3 match spec header; label `impact-map-lgtm`                                       |
| Repo                  | gateflow-ops                                                                                                                    |
| Date                  | 2026-08-12                                                                                                                      |
| Branch                | `chore/INIT-GATEFLOW-016-spec-gateflow-ops` — Draft spec PR [#19](https://github.com/drivestream-lab/gateflow-ops/pull/19)      |
| Initiative segment    | `INIT-GATEFLOW-016`                                                                                                             |
| Status                | Draft                                                                                                                           |
| Review deadline       | 2026-08-17                                                                                                                      |
| Deciders              | PM: programme PM · Domain SME: @drivestream-lab/prayog-pe-team                                                                  |

## Summary

Buildable as a **greenfield Mission Control** on the existing Next.js BFF chassis
(session auth, `upstreamFetch`, exemplar `app/api/gateflow/status`). All 31 REQs
are **gaps** today — expected — with clear MDC patterns to copy. No blocking PM
or domain questions. No Accepted ADR conflicts; Draft ADR-001 aligns with the
chassis. Recommend proceed to `/spec-technical-review` (light TDD for BFF module
map + Accept ADR-001).

**Findings:** 4 total (0 Critical, 0 Should-fix blocking, 2 Verify, 2 Gap)

### Derived counts (lane × severity)

| Lane     | Blocking open | Non-blocking open | Resolved |
| -------- | ------------- | ----------------- | -------- |
| PM       | 0             | 0                 | 0        |
| PE / ADR | 0             | 3                 | 0        |
| Domain   | 0             | 0                 | 0        |
| Auto-fix | 0             | 1                 | 0        |

| Severity                     | Unresolved count |
| ---------------------------- | ---------------- |
| Critical                     | 0                |
| Should fix                   | 0                |
| Verify / Gap (informational) | 4                |

### Selected workflow outcome

| Field                | Value                                                                   |
| -------------------- | ----------------------------------------------------------------------- |
| Outcome              | `pass`                                                                  |
| Rationale            | Zero unresolved blocking PE/PM/domain findings; informational gaps only |
| Next (from workflow) | `spec-technical-review`                                                 |

## Baseline snapshot (F1)

| Area            | Current state                                                                                                 | Evidence                                                                            |
| --------------- | ------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------- |
| Unit tests      | Chassis only: `tests/unit/{auth,bff,bff-logging,i18n}.test.ts`                                                | `tests/README.md`                                                                   |
| Live verify     | One journey: login → status page                                                                              | `tests/verify/01-login-status-page.md`                                              |
| As-built        | Chassis: login, exemplar status, health — no CAP-* product                                                    | `docs/specification/as-built/implementation-status.md`                              |
| Auth / upstream | httpOnly session; `AUTH_MODE` default `dev-stub`; `jwt-upstream` path exists; `upstreamFetch` forwards Bearer | `lib/auth.ts`, `lib/env.ts`, `lib/upstream-fetch.ts`, `app/api/auth/login/route.ts` |
| BFF exemplar    | `GET app/api/gateflow/status` → currently hits `/api/dev-echo` stand-in                                       | `app/api/gateflow/status/route.ts`                                                  |
| UI shell        | Top header only; no `components/workspace/` yet                                                               | `app/(dashboard)/layout.tsx`; guidance `docs/project-guidance/workspace-layout.md`  |
| Primitives      | shadcn-style Button/Input/Card/Label                                                                          | `components/ui/*`; Draft ADR-001                                                    |

## Traceability matrix

| Spec REQ / wave   | Spec claim                                | Code evidence                                                          | Unit                                | Verify                 | Status |
| ----------------- | ----------------------------------------- | ---------------------------------------------------------------------- | ----------------------------------- | ---------------------- | ------ |
| REQ-01–02 / W0    | CAP-A tenant detail + invite              | none — no tenant BFF/UI                                                | —                                   | —                      | gap    |
| REQ-03–08 / W0    | CAP-B programme/catalogue/fleet/readiness | none                                                                   | planned composition unit for REQ-07 | —                      | gap    |
| REQ-09–12 / W1    | CAP-C waves/runs/forge authorize          | none                                                                   | —                                   | —                      | gap    |
| REQ-13–21 / W2    | CAP-F initiatives/readouts/closure        | none                                                                   | —                                   | —                      | gap    |
| REQ-22–25 / W3    | CAP-G metrics panels                      | none                                                                   | —                                   | —                      | gap    |
| REQ-26–27 / W4    | CAP-D checkpoints                         | none                                                                   | —                                   | —                      | gap    |
| REQ-28–31 / W4    | CAP-E board tickets                       | none                                                                   | —                                   | —                      | gap    |
| Chassis (pre-REQ) | Session + exemplar upstream status        | `lib/auth*`, `app/api/gateflow/status`, `hooks/use-upstream-status.ts` | auth/bff/i18n                       | `01-login-status-page` | exists |

## ADR traceability (F13)

| Spec REQ / wave | Relevant ADR(s)                      | Status                        | Code evidence                                           | Finding                                                                                                                        |
| --------------- | ------------------------------------ | ----------------------------- | ------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------ |
| All UI waves    | ADR-001 (Draft)                      | missing Accepted — Draft only | `components/ui/*`, `app/globals.css`, `components.json` | `ALTERNATIVE: Accept ADR-001 (shadcn+tokens) vs introduce a packaged design-system kit` — default Accept ADR-001; not blocking |
| REQ-01–31 BFF   | N/A (MDC `nextjs-repository-layout`) | aligned with rules            | `app/api/gateflow/status/route.ts`                      | none — folder-by-upstream already constrained                                                                                  |
| REQ-07          | N/A (PRD D7 locks client-side)       | aligned                       | none found — new capability                             | none — composition location is product-locked; TDD names shared pure helper path                                               |

## Governance findings (F13–F14)

| ID    | Check | Spec quote                                                                                      | Governing doc                                                   | Finding                                                                                                       |
| ----- | ----- | ----------------------------------------------------------------------------------------------- | --------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------- |
| FF-01 | F13   | "Visual values enter through `app/globals.css` (palette → semantic)." (ADR-001 Draft / chassis) | ADR-001 Draft; `tailwind-design-tokens.mdc`                     | `ALTERNATIVE: Accept ADR-001 vs packaged kit` — PE Accept during TDD; informational                           |
| FF-02 | F14   | "Exact BFF path layout / module split under `app/api/<upstream>/…`" (spec Q-3)                  | `nextjs-repository-layout.mdc`; `nextjs-bff-route-handlers.mdc` | Non-blocking PE — TDD must name `app/api/gateflow/<resource>/` map; rules already forbid UI-named API folders |

## Findings by severity

### Critical

_None._

### Should fix

_None blocking._

### Verify

| ID    | Check  | Finding                                                                                                                                                  | Evidence                                                                                                                 |
| ----- | ------ | -------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------ |
| FF-03 | F1/F10 | Confirm `AUTH_MODE=jwt-upstream` against live gateflow issues a session JWT that satisfies `TENANT_ADMIN` / `require_tenant_resolved` for W0 live verify | `lib/env.ts` default `dev-stub`; `app/api/auth/login/route.ts` jwt-upstream branch; exemplar still calls `/api/dev-echo` |
| FF-04 | F3     | Plan live verify scripts per wave (W0–W4) before coding; only chassis verify exists today                                                                | `tests/verify/01-login-status-page.md`; `tests/README.md`                                                                |

### Gap

| ID    | Check | Finding                                                                        | Evidence                                                                |
| ----- | ----- | ------------------------------------------------------------------------------ | ----------------------------------------------------------------------- |
| FF-05 | F2    | All CAP-A–G product BFF routes and UI screens are absent (expected greenfield) | `app/api/**` inventory; as-built chassis-only                           |
| FF-06 | F2/F6 | `WorkspaceShell` / left-nav not implemented; layout guidance exists            | no `components/workspace/`; `docs/project-guidance/workspace-layout.md` |

## Impact surface

| Wave / area   | Likely files/modules                                                                           | Test touch                                            |
| ------------- | ---------------------------------------------------------------------------------------------- | ----------------------------------------------------- |
| W0 CAP-A/B    | `app/api/gateflow/{tenants,programme}/…`; `components/{tenant,fleet}/`; `hooks/use-*`; locales | unit: readiness composition; verify: onboard + invite |
| W1 CAP-C      | `app/api/gateflow/{waves,runs,forge}/…`; run cockpit UI                                        | verify: start + authorize external-action             |
| W2 CAP-F      | `app/api/gateflow/initiatives/…`; initiative hub UI                                            | verify: list/detail/readouts/closure                  |
| W3 CAP-G      | `app/api/gateflow/metrics/…`; metrics panels                                                   | verify: four metric views                             |
| W4 CAP-D/E    | `app/api/gateflow/{checkpoints,board}/…`                                                       | verify: status/history; tickets CRUD/link             |
| Shell (cross) | `components/workspace/*`; `(dashboard)/layout.tsx`                                             | verify chrome once                                    |

## Risks & assumptions

| ID  | Risk / assumption                                | Mitigation                                     |
| --- | ------------------------------------------------ | ---------------------------------------------- |
| R-1 | Large surface (31 REQs)                          | Stick to PRD wave order W0→W4                  |
| R-2 | Client-side onboarding composition drift (A-3)   | One shared pure function + unit tests (REQ-07) |
| R-3 | Concurrent gateflow API change (A-4 / IM-01)     | Monitor; freeze expectation in TDD             |
| R-4 | `dev-stub` auth insufficient for real CAP verify | FF-03 — switch jwt-upstream for live verify    |
| A-5 | Session→Bearer bridge remains                    | Already in `upstreamFetch`                     |

## Recommended spec edits

- None required for buildability. Optional: cite Draft ADR-001 under References as UI constraint once Accepted.
- Keep Q-1–Q-3 non-blocking; resolve Q-3 in TDD resource map.

---

## Open items by lane

| ID    | Lane     | Question / item                                                       | Blocking | Owner | Status | Required by      | Default if deferred                            | Evidence                       | Resolution reference   |
| ----- | -------- | --------------------------------------------------------------------- | -------- | ----- | ------ | ---------------- | ---------------------------------------------- | ------------------------------ | ---------------------- |
| FF-01 | PE       | Accept ADR-001 (shadcn+tokens)                                        | no       | PE    | open   | technical review | Proceed on chassis + Draft ADR-001             | ADR-001 Draft; `components/ui` | pending TDD acceptance |
| FF-02 | PE       | Name `app/api/gateflow/<resource>/` map (spec Q-3)                    | no       | PE    | open   | technical review | One folder per resource group under `gateflow` | MDC repository layout          | pending TDD            |
| FF-03 | PE       | Prove jwt-upstream against live gateflow for W0                       | no       | PE    | open   | W0 verify        | Document verify env in `tests/README.md`       | login route; env               | pending wave verify    |
| FF-04 | PE       | Add verify scripts per wave to feature map                            | no       | PE    | open   | plan / W0        | Extend `tests/README.md` when waves land       | tests/README chassis-only      | pending plan           |
| Q-1   | PE       | API freeze monitoring (IM-01)                                         | no       | PE    | open   | W0               | Proceed — monitor                              | Impact map                     | meta IM-01             |
| Q-2   | PE       | Parallelize CAP-F/G vs sequential                                     | no       | PE    | open   | plan             | Sequential W0–W4                               | Impact map IM-02               | pending plan           |
| AF-1  | auto-fix | Index feasibility report in `docs/specification/README.md` if present | no       | agent | open   | later forge      | Skip until README indexes reports              | reports path                   | pending                |

### PM questions (product scope, UX, priority)

#### Blocking — must resolve before spec merge

_None._

#### Defer — can proceed with documented assumption

_None new — PRD OQ-1–OQ-3 already resolved._

### PE questions (engineering decisions — resolved by `/spec-technical-review`)

#### Blocking for implementation plan

_None._

#### Defer with default

1. **FF-01 / FF-02** — Accept ADR-001; publish BFF resource map under `app/api/gateflow/`.
2. **FF-03 / FF-04** — jwt-upstream + per-wave verify inventory.

### Domain clarifications (business source-of-truth)

| #   | Question | Suggested SME | Blocks |
| --- | -------- | ------------- | ------ |
| —   | None     | —             | —      |

### Auto-fixable (agent resolves later — not inside this skill)

| #    | Item          | Fix                                                      |
| ---- | ------------- | -------------------------------------------------------- |
| AF-1 | Reports index | Add reports pointer when product README/index is updated |

---

## Check summary

| Check                  | Status | Findings                                             |
| ---------------------- | ------ | ---------------------------------------------------- |
| F1 Baseline snapshot   | PASS   | Chassis documented                                   |
| F2 Spec → code map     | PASS   | All CAP-* = gap (expected); chassis mapped           |
| F3 Spec → verify map   | PASS   | FF-04 informational — only chassis verify today      |
| F4 Spec → unit map     | PASS   | Planned REQ-07 unit; chassis units exist             |
| F5 As-built drift      | PASS   | Spec correctly marks product as new vs chassis       |
| F6 Docs drift          | PASS   | Guidance/ADR Draft present; shell not coded (FF-06)  |
| F7 Overlap risk        | PASS   | No product journey duplicated yet                    |
| F8 CI vs live boundary | PASS   | Unit in CI; live verify manual/docs per tests README |
| F9 Cross-service touch | PASS   | CTR-01–07 consumer-only; gateflow unchanged          |
| F10 Assumptions        | PASS   | A-1–A-5; FF-03 verifies auth assumption              |
| F11 Effort drivers     | PASS   | Wave size + composition + forge-authorize E2E        |
| F12 PM questions       | PASS   | Zero blocking PM                                     |
| F13 ADR conformance    | PASS   | No Accepted ADR conflict; FF-01 Accept Draft ADR-001 |
| F14 MDC conformance    | PASS   | Spec stays behavior-only; FF-02 TDD names paths      |

**Check PASS** = zero unresolved blocking findings (informational OK).

---

## Next steps

> Persist this report locally alongside the spec draft. Fill `handoff.forge` for
> `/commit-workspace` (or Gateflow ForgeClient) onto the Draft spec PR —
> **do not** commit, push, open PRs, or apply labels inside this skill.
> The spec PR is the engineering review surface; product Q&A uses the meta PRD PR.

### Forge readiness

| Item                              | Value                                                                           |
| --------------------------------- | ------------------------------------------------------------------------------- |
| Local report path                 | `docs/specification/reports/Initiative-Feasibility-Report-INIT-GATEFLOW-016.md` |
| Target branch                     | `chore/INIT-GATEFLOW-016-spec-gateflow-ops`                                     |
| Recommended forge                 | `/commit-workspace` (Gate 2 stays `spec-pending`)                               |
| Mutations performed by this skill | **none**                                                                        |

```
Draft spec PR: https://github.com/drivestream-lab/gateflow-ops/pull/19  (spec-pending)
When ready:
  [x] Source freshness is CURRENT
  [x] All blocking PM questions answered (none)
  [x] All blocking Domain clarifications answered (none)
  [ ] Spec updated only if answers require (N/A)
  [x] /initiative-feasibility clean (pass)
  [ ] Proceed: /spec-technical-review
  [ ] After TDD + plan on branch: PE sets spec-lgtm + Approve → merge
  [ ] After merge: `/create-board-tickets` → /pre-implement → /loop-spec
```

---

```yaml
handoff:
  contract: sdd-delivery/v2
  stage: initiative-feasibility
  outcome: pass
  artifact:
    path: docs/specification/reports/Initiative-Feasibility-Report-INIT-GATEFLOW-016.md
  blockers: []
  signals:
    findings_total: 4
    critical: 0
    should_fix: 0
    verify_gap: 4
    new_adr: false
    pe_blocking_open: 0
    pm_blocking_open: 0
    domain_blocking_open: 0
    outcome_rationale: zero_blocking_findings_greenfield_gaps_only
    ripple_action: continue
    spec_pr: https://github.com/drivestream-lab/gateflow-ops/pull/19
  next_candidates:
    - spec-technical-review
  human_checkpoint: false
  external_action: false
  forge:
    action: commit_workspace
    draft: true
    apply_labels:
      - spec-pending
    title: "[INIT-GATEFLOW-016] Spec — gateflow-ops"
    body_path: docs/specification/product/INIT-GATEFLOW-016-gateflow-ops.md
```
