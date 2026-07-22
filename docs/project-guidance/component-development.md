# Component-based development

The settled discipline for building UI in this portal. shadcn + Tailwind v4 +
CVA. When in doubt, copy the shape of `components/ui/button.tsx` and
`components/system/upstream-status.tsx`.

## The three component tiers

| Tier                   | Location                | Owns                                                          | Never contains                                   |
| ---------------------- | ----------------------- | ------------------------------------------------------------- | ------------------------------------------------ |
| **Primitives**         | `components/ui/`        | Visual variants (CVA), a11y, composition (`asChild`)          | Business logic, data fetching, hardcoded strings |
| **Feature components** | `components/<feature>/` | Composition of primitives + domain hooks for one product area | Raw fetch calls, other features' concerns        |
| **Pages/layouts**      | `app/`                  | Route wiring, server-side data/session, page assembly         | Reusable markup (extract to components)          |

## Rules

1. **Adding a primitive:** first try `npx shadcn add <component>` — components.json
   is wired, generated code lands in `components/ui/` consuming our tokens. Hand-roll
   only what shadcn doesn't have, following the CVA pattern in `button.tsx`.
2. **Variants via CVA, never prop-conditional class strings.** One `cva()` per
   primitive; consumers pass `variant`/`size`, extend with `className` via `cn()`.
3. **Semantic tokens only** (`bg-accent`, `text-danger`, `border-border`).
   Raw hex/palette values in JSX fail review; new colors enter `app/globals.css`
   as tokens first (palette → semantic mapping).
4. **Server components by default.** `"use client"` only at interactive leaves.
   Client data flows exclusively: `lib/fetch-<domain>.ts` (typed fetch via
   authFetch) → `hooks/use-<domain>.ts` (useQuery: key, staleTime, error
   normalization) → component consumes the hook. No inline `useQuery`/`authFetch`
   in components.
5. **Composition over configuration:** primitives expose `asChild` (Radix Slot)
   rather than growing `as`/`href`/`onX` prop zoos.
6. **Strings via `t()`** — no hardcoded copy anywhere (no-hardcoded-strings.mdc).
7. **Form options from `data/master/`** (or master APIs) — never inline option
   arrays in components. See `data/master/README.md` for the shape contract.

## Review checklist for a new component PR

- [ ] Right tier and folder; primitive is product-agnostic
- [ ] CVA variants, semantic tokens, `cn()` for class merging
- [ ] Data via domain hook; no fetch logic in the component
- [ ] All strings from catalogs; options from master data
- [ ] Unit test for any extracted logic (hook/lib), not for markup
