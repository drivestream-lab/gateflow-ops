# ADR-002 — Identity session cookie vs entered-programme context cookie

| Field | Value |
|-------|-------|
| Status | Accepted |
| Initiative | INIT-GATEFLOW-017 |
| Feasibility finding | FF-01 (`ALTERNATIVE: identity-scoped httpOnly session plus separate entered-programme authorization context vs reminting a programme-bound upstream JWT into the session cookie on programme enter`) |
| Technical review | `docs/specification/reports/Technical-Review-INIT-GATEFLOW-017.md` |
| Source spec | `docs/specification/product/INIT-GATEFLOW-017-gateflow-ops.md` |
| Source spec digest | `sha256:993f2d32f3c3f5bbddb7c00b419aa6eb069b88ea060d6144bc84c9634f99ea60` |
| product_constraints | `[REQ-12, REQ-14, REQ-16, REQ-17, REQ-18]` |
| changes_user_visible_behavior | `false` |
| spec_amendment_required | `false` |
| supersedes | none |
| superseded_by | none |
| Decision owner | @nikd10x |
| Approval evidence | https://github.com/drivestream-lab/gateflow-ops/pull/32#issuecomment-5290307320 |
| Approved head | e6c19a19c7dc5cc2f7fa749657a0f9159511c625 |
| Lint evidence | adr_boundary_lint.py 2/2, PASS, sha256:ab9d087eff5f6e50a2c023a3d9a33a3ab18032378bd7367874f92db117bdc4ce |

> If `changes_user_visible_behavior` or `spec_amendment_required` would be
> `true`, **stop**: amend and re-approve the product spec before this ADR may
> become Accepted. Do not invent scope, UX, acceptance, priority, or business
> rules here.

## Product decisions excluded

- See REQ-12.
- See REQ-14.
- See REQ-16.
- See REQ-17.
- See REQ-18.

## Context

This record binds REQ-12, REQ-14, REQ-16, REQ-17, and REQ-18. The chassis
stores the upstream `access_token` in one httpOnly cookie (`SESSION_COOKIE`).
The login Route Handler writes it; the logout Route Handler deletes it;
`upstreamFetch` sends it as Bearer (`app/api/auth/login/route.ts`,
`lib/upstream-fetch.ts`). Delivery Route Handlers and RSC pages read JWT
`tenant_id` as tenant scope (`app/api/gateflow/runs/route.ts`). No second
cookie exists. `dev-stub` stamps `tenant_id: "dev"`. ADR-001 does not
cover cookies. `nextjs-bff-server-auth.mdc` requires an httpOnly session
and forbids browser-held JWTs; it does not name a second store for
programme or tenant identifiers.

## Options considered

Grounded on the single-cookie chassis. No dormant second cookie exists.

| Option | Benefits | Costs / risks |
|--------|----------|---------------|
| A — Overwrite `SESSION_COOKIE` with a newly minted JWT that embeds programme/tenant claims | Existing `tenant_id` reads keep working | Overwrites identity claims; another mint per context write; lifetime couples to those claims |
| B — Keep the identity token on `SESSION_COOKIE`; second httpOnly cookie for programme/tenant ids; server helper | Bearer unchanged on context overwrite; helper `null` if that cookie is absent; one seam | Every `session.tenant_id` site moves to the helper |
| C — JS-readable store or client-supplied id on each fetch | None | Foreclosed by MDC (`localStorage`) and RSC cookie reads |

## Recommendation

**Option B.** Constraints: REQ-12, REQ-14, REQ-16, REQ-17, REQ-18.
The identity `access_token` stays the only credential on `SESSION_COOKIE`
and the only Bearer `upstreamFetch` sends. Programme and tenant
identifiers live on a second httpOnly cookie (flags aligned with the
session cookie; name from env). Server-only `getEnteredProgrammeContext()`
reads that cookie and returns `{ programmeId, tenantId }` or `null`.
Route Handlers, RSC page guards, and tenant-scoped upstream field
attachment use that helper only — not JWT `tenant_id`. The login and
logout Route Handlers that write or delete `SESSION_COOKIE` also delete
the context cookie so the two stores cannot diverge. `dev-stub` leaves
`tenant_id` unset so the identity JWT cannot substitute for the helper.

## Consequences

- Positive: one helper is the review seam; identity 401 still flows
  through `authFetch`; replacing context ids is a cookie overwrite, not
  a remint of `SESSION_COOKIE`.
- Negative: every current `session.tenant_id` read site must migrate in
  the same change set.

## Revisit triggers

- Provider rotates the `access_token` on context write and rejects
  identity Bearer on tenant-scoped routes.
- Session chassis leaves httpOnly cookies.
- A browser-visible credential store is mandated.

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
product_constraints: [REQ-12, REQ-14, REQ-16, REQ-17, REQ-18]
changes_user_visible_behavior: false
spec_amendment_required: false
Lint evidence: adr_boundary_lint.py {sources_checked}/{N expected}, PASS,
  sha256:{hex}
```
