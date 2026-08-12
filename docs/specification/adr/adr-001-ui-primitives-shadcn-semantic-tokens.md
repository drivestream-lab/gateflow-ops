# ADR-001 — UI primitives via shadcn + semantic design tokens

| Field | Value |
|-------|-------|
| Status | Draft |
| Initiative | none (platform baseline) |
| Feasibility finding | none |
| Technical review | none |
| Source spec | `docs/project-guidance/component-development.md` |
| Source spec digest | `sha256:253a1d2b7517b2114cfdc5d3a4e0ebb594600d0cffe52018507f69580fb1a854` |
| product_constraints | `[]` — no approved `REQ-*`; engineering composition only |
| changes_user_visible_behavior | `false` |
| spec_amendment_required | `false` |
| supersedes | none |
| superseded_by | none |
| Decision owner | PE |
| Approval evidence | Pending |
| Approved head | Pending |

> If `changes_user_visible_behavior` or `spec_amendment_required` would be
> `true`, **stop**: amend and re-approve the product spec before this ADR may
> become Accepted. Do not invent scope, UX, acceptance, priority, or business
> rules here.

## Product decisions excluded

- none — no product `REQ-*` owns component-kit or token-layer selection.
- Visual brand values (palette, density, external design-language inspiration) live in `docs/project-guidance/` and `app/globals.css`, not here.

## Context

The chassis already uses shadcn, but selection in code is not governance. MDC and component-development describe the path; only an Accepted ADR makes alternate kits a review-blocking violation. Without that lock, later work can still fork dependency and CSS ownership. The decision is which primitive ownership model is mandatory for all portal UI modules.

## Options considered

Grounded against `components/ui/*`, `components.json` (`cssVariables: true`), no packaged design-system imports.

| Option | Benefits | Costs / risks |
|--------|----------|---------------|
| A — shadcn copy-in + semantic tokens | Matches chassis; one token SSOT | Team maintains copied primitives |
| B — Packaged design-system React library | Rich catalog / upstream docs | Parallel APIs; theme conflict; hard reverse |
| C — Headless only, no shadcn generator | Maximum control | Rebuilds variant/CLI discipline already settled |

## Recommendation

**Option A — normative (enforced once Accepted):**

- **MUST** add interactive UI primitives via `npx shadcn add` (or CVA + Slot equivalent) into `components/ui/` only.
- **MUST** put colors/surfaces/status/radius/rings in `app/globals.css` semantic tokens; feature JSX **MUST** use semantic utilities, never raw palette hex.
- **MUST NOT** add packaged design-system app UI deps (`@mui/*`, `antd`, `@primer/react`, Carbon React, Chakra, Mantine, …) or parallel primitive trees outside `components/ui/`.
- **MUST NOT** call vendor component APIs from feature modules — compose owned primitives only.
- External design languages **MAY** inform token values in CSS/project-guidance only — never a second runtime kit.

MDC and `component-development.md` are day-to-day checklists; **this ADR is the authority**. Conflicts resolve here until a superseding ADR is Accepted.

## Consequences

- Positive: reviews reject alternate kits by citing this ADR; token changes propagate without page restyles; Radix/Slot patterns stay canonical.
- Negative: gaps use `npx shadcn add` or hand-rolled CVA — not a second kit; brand *values* stay in guidance/CSS (this ADR enforces mechanism, not hex).

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
product_constraints: []
changes_user_visible_behavior: false
spec_amendment_required: false
Lint evidence: adr_boundary_lint.py {sources_checked}/{N expected}, PASS,
  sha256:{hex}
```

For this platform baseline (no `FF-*` / `REQ-*` sources), PE may record
`Lint evidence: SKIPPED — no initiative REQ/FF sources; product_constraints empty`
only after a manual T12 re-read. When initiative sources exist, generate the
line with `prayog-skills/.../scripts/adr_boundary_lint.py --strict --print-evidence`.
