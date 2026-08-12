# ADR-001 — UI primitives via shadcn + semantic design tokens

| Field                         | Value                                                                                                                                                                                                                                                                                      |
| ----------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Status                        | Accepted                                                                                                                                                                                                                                                                                   |
| Initiative                    | INIT-GATEFLOW-016 (was platform baseline; now bound for Mission Control UI waves)                                                                                                                                                                                                          |
| Feasibility finding           | FF-01 (`ALTERNATIVE: Accept ADR-001 vs packaged kit`)                                                                                                                                                                                                                                      |
| Technical review              | `docs/specification/reports/Technical-Review-INIT-GATEFLOW-016.md`                                                                                                                                                                                                                         |
| Source spec                   | `docs/specification/product/INIT-GATEFLOW-016-gateflow-ops.md`                                                                                                                                                                                                                             |
| Source spec digest            | `sha256:df50e720703a1d65b1cdac960b1ecb4826c0f87245ed86e0f128d34bb2b2506a`                                                                                                                                                                                                                  |
| product_constraints           | `[REQ-01, REQ-02, REQ-03, REQ-04, REQ-05, REQ-06, REQ-07, REQ-08, REQ-09, REQ-10, REQ-11, REQ-12, REQ-13, REQ-14, REQ-15, REQ-16, REQ-17, REQ-18, REQ-19, REQ-20, REQ-21, REQ-22, REQ-23, REQ-24, REQ-25, REQ-26, REQ-27, REQ-28, REQ-29, REQ-30, REQ-31]` — UI composition mechanism only |
| changes_user_visible_behavior | `false`                                                                                                                                                                                                                                                                                    |
| spec_amendment_required       | `false`                                                                                                                                                                                                                                                                                    |
| supersedes                    | none                                                                                                                                                                                                                                                                                       |
| superseded_by                 | none                                                                                                                                                                                                                                                                                       |
| Decision owner                | @nikd10x                                                                                                                                                                                                                                                                                   |
| Approval evidence             | https://github.com/drivestream-lab/gateflow-ops/pull/19#issuecomment-5266837472                                                                                                                                                                                                            |
| Approved head                 | 8a5d5b8551c645f449d2d1b6725f1925ec08d1f6                                                                                                                                                                                                                                                   |
| Lint evidence                 | adr_boundary_lint.py 2/2, PASS, sha256:16ffadbace2fa0e6780b22f68bfae973728448611ad8acb420f7fac7479484fd                                                                                                                                                                                    |

> If `changes_user_visible_behavior` or `spec_amendment_required` would be
> `true`, **stop**: amend and re-approve the product spec before this ADR may
> become Accepted. Do not invent scope, UX, acceptance, priority, or business
> rules here.

## Product decisions excluded

- Observable behavior for REQ-01–REQ-31 remains owned by the approved spec — this ADR does not amend those rows.
- Visual brand values (palette, density, external design-language inspiration) live in `docs/project-guidance/` and `app/globals.css`, not here.

## Context

UI surfaces for REQ-01–REQ-31 share one primitive ownership model. The chassis already uses shadcn, but selection in code is not governance. MDC and component-development describe the path; only an Accepted ADR makes alternate kits a review-blocking violation. Without that lock, later work can still fork dependency and CSS ownership across those REQs. The decision is which primitive ownership model is mandatory for portal UI modules.

## Options considered

Grounded against `components/ui/*`, `components.json` (`cssVariables: true`), no packaged design-system imports.

| Option                                   | Benefits                        | Costs / risks                                   |
| ---------------------------------------- | ------------------------------- | ----------------------------------------------- |
| A — shadcn copy-in + semantic tokens     | Matches chassis; one token SSOT | Team maintains copied primitives                |
| B — Packaged design-system React library | Rich catalog / upstream docs    | Parallel APIs; theme conflict; hard reverse     |
| C — Headless only, no shadcn generator   | Maximum control                 | Rebuilds variant/CLI discipline already settled |

## Recommendation

**Option A — normative (enforced once Accepted)** for UI delivering REQ-01–REQ-31:

- **MUST** add interactive UI primitives via `npx shadcn add` (or CVA + Slot equivalent) into `components/ui/` only.
- **MUST** put colors/surfaces/status/radius/rings in `app/globals.css` semantic tokens; feature JSX **MUST** use semantic utilities, never raw palette hex.
- **MUST NOT** add packaged design-system app UI deps (`@mui/*`, `antd`, `@primer/react`, Carbon React, Chakra, Mantine, …) or parallel primitive trees outside `components/ui/`.
- **MUST NOT** call vendor component APIs from feature modules — compose owned primitives only.
- External design languages **MAY** inform token values in CSS/project-guidance only — never a second runtime kit.

MDC and `component-development.md` are day-to-day checklists; **this ADR is the authority**. Conflicts resolve here until a superseding ADR is Accepted.

## Consequences

- Positive: reviews reject alternate kits by citing this ADR; token changes propagate without page restyles; Radix/Slot patterns stay canonical.
- Negative: gaps use `npx shadcn add` or hand-rolled CVA — not a second kit; brand _values_ stay in guidance/CSS (this ADR enforces mechanism, not hex).

## Revisit triggers

- PE/product mandates a packaged design-system kit as sole UI dependency.
- Chassis leaves Tailwind CSS variables / shadcn `components.json`.
- Non-React UI needs a shared non-React component distribution.

## Lifecycle — Accepted immutability and supersession

Once `Status: Accepted`, do **not** rewrite the accepted body in place.
To change the decision:

1. create a new ADR that `supersedes` this one,
2. set this ADR's `superseded_by` to the new id and status `Superseded`,
3. record owner, date, and review evidence on both files.

## Acceptance finalization

After PE review comments are resolved and PE explicitly states the decision is
ready for acceptance — **and** product-boundary fields remain `false` —
update the file before final GitHub approval:

```text
Status: Accepted
Decision owner: @{pe-name}
Approval evidence: {review/comment URL}
Approved head: {full SHA to be approved}
product_constraints: [REQ-01…REQ-31]
changes_user_visible_behavior: false
spec_amendment_required: false
Lint evidence: adr_boundary_lint.py {sources_checked}/{N expected}, PASS,
  sha256:{hex}
```

Generate the line with `prayog-skills/.../scripts/adr_boundary_lint.py --strict --print-evidence`.
