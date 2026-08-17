# Workspace layout — gateflow-ops

Authenticated shell for this portal. **No ADR** — pattern lives here; code
lives under `components/workspace/` and `app/(dashboard)/layout.tsx`.
Primitives stay on ADR-001 (shadcn + semantic tokens).

Rules pointer: `workspace-page-layout.mdc`.

---

## Target composition (standard)

Every authenticated route uses the same chrome. Pages fill **slots**; they do
not invent their own outer grid.

```text
┌──────────────────────────────────────────────────────────────────┐
│  Mark (sidebar)     [Programme switcher]          [health] [user]│
├────────────┬─────────────────────────────────────────────────────┤
│  Grouped   │  Page header (title · one primary CTA)              │
│  nav       ├─────────────────────────────────────────────────────┤
│            │  Page body — one work surface                       │
└────────────┴─────────────────────────────────────────────────────┘
```

`/` is a **role-home redirect**, not a System status page. Health is chrome
(`ChromeHealth`). Programme enter/leave is the switcher (`ProgrammeSwitcher`).
Tenant facts are a deep link from the switcher, not a nav row. Checkpoints
render on Runs; `/checkpoints` redirects.

| Region            | Purpose                                                   | Persist across routes?      |
| ----------------- | --------------------------------------------------------- | --------------------------- |
| **App chrome**    | Product identity, signed-in user, logout / global actions | Yes — route-group layout    |
| **Left nav**      | Primary navigation (config-driven)                        | Yes — shell                 |
| **Page header**   | This page’s title, crumbs, primary actions                | Per page — required         |
| **Page body**     | Lists, forms, detail, status                              | Per page                    |
| **Context panel** | Inspector, help, secondary detail                         | Optional — omit when unused |

**Mobile:** same nav config; left nav becomes a sheet/drawer opened from the
page header (shadcn `Sidebar` + trigger). Do not maintain a second nav tree.

---

## Visual principles (beautiful + calm)

Ops UI should feel dense, readable, and quiet — not a marketing landing page.

| Principle | Do                                                              | Don’t                                  |
| --------- | --------------------------------------------------------------- | -------------------------------------- |
| Surfaces  | `bg-background` app · `bg-surface` panels · one `border-border` | Competing card-in-card chrome          |
| Hierarchy | One strong page title; nav quieter than content                 | Multiple hero headlines                |
| Density   | Comfortable padding (`p-4`–`p-6` content); compact nav rows     | Huge empty hero bands in the shell     |
| Focus     | Primary CTA only in page header                                 | CTA clusters in nav + header + body    |
| Motion    | Sidebar collapse / sheet only                                   | Decorative motion in the shell         |
| Tokens    | Semantic utilities only (ADR-001)                               | Raw hex, palette classes in layout JSX |

---

## Component map (portal vocabulary)

Implement under `components/workspace/`. Build on shadcn Sidebar / Button /
Separator / Breadcrumb (add via CLI as needed).

| Component         | Slot         | Responsibility                                                               |
| ----------------- | ------------ | ---------------------------------------------------------------------------- |
| `WorkspaceShell`  | Root         | `SidebarProvider` + left nav + inset; wraps authenticated children           |
| `WorkspaceNav`    | Left         | Renders nav config; active route via pathname; groups/labels                 |
| `WorkspaceChrome` | Top of inset | Optional thin product/session strip if not folded into sidebar header/footer |
| `PageHeader`      | Header       | Title, breadcrumb, actions — **required** on authenticated pages             |
| `PageBody`        | Content      | Width/padding for the feature; scrollable                                    |
| `ContextPanel`    | Right        | Optional; only mount when the page passes content                            |

**Nav data:** static config (e.g. `lib/workspace-nav.ts` or `data/master/`),
not hard-coded link arrays inside JSX. Filter by role later without changing
layout structure.

**i18n:** all chrome strings via `t()` / locale catalogs (`no-hardcoded-strings.mdc`).

---

## Page types

### 1. Catalog / list

- `PageHeader` + optional primary “Create” action
- Body: table or card list; filters in body or header secondary actions
- No context panel by default
- Inline section nav only when the catalog itself has peer hubs (rare)

### 2. Detail / task (nested)

- `PageHeader` with **one** “Back to parent” control
- Body: **one** primary `Card` for the task; subsections as headings inside it
- Context panel only for inspector-style secondary data
- Sibling shortcuts belong on hub pages, not on every child

### 3. Wizard

- Dedicated wizard tree (steps chrome) — do **not** reuse list chrome
- Still sits inside `WorkspaceShell` (nav may stay; wizard owns the inset)

### 4. Hub

- `PageHeader` + short body of peer entry points (links/cards)
- Prefer hub shortcuts over repeating the same links in every child header

---

## Wiring (App Router)

```text
app/(dashboard)/layout.tsx
  └─ session guard (server)
  └─ <WorkspaceShell>
        ├─ WorkspaceNav
        └─ inset
              ├─ WorkspaceChrome (session / logout)  — or sidebar footer
              └─ {children}   ← each page supplies PageHeader + PageBody
```

- Shell mounts **once** in the dashboard layout so nav does not remount on
  navigation.
- Pages are Server Components by default; only sidebar trigger / collapsible
  bits are client leaves (`typescript-react-style.mdc`).
- Do not put feature data fetching in the shell.

---

## Width and spacing defaults

| Area          | Guidance                                                                                    |
| ------------- | ------------------------------------------------------------------------------------------- |
| Left nav      | Fixed width when expanded; icon-collapsed on desktop (`icon` collapsible)                   |
| Page header   | Full inset width; `h-14`–`h-16`; bottom border                                              |
| Page body     | `p-4` md:`p-6`; max width only when readability needs it (forms), not for full-bleed tables |
| Context panel | Fixed ~320px; own border-l; hide below `lg` or move to sheet                                |

Exact tokenized sizes belong in CSS/components; this file owns the **roles**.

---

## Do / don’t

| Do                                                | Don’t                                      |
| ------------------------------------------------- | ------------------------------------------ |
| Use `WorkspaceShell` for every authenticated page | Hand-roll a new sidebar per feature        |
| Put title + primary action in `PageHeader`        | Duplicate app title / logout in every page |
| One primary Card on detail/edit tasks             | Nested card stacks for decoration          |
| Config-driven nav                                 | Hard-coded `<a>` lists in layout JSX       |
| Semantic tokens                                   | `bg-slate-*` / raw hex in shell            |
| Sheet nav on small screens                        | A second mobile-only sitemap               |

---

## Review checklist (layout PR)

- [ ] Authenticated page uses shell slots (`PageHeader` + `PageBody`)
- [ ] No parallel layout chrome outside `components/workspace/`
- [ ] Nav from config; active state correct; i18n on all chrome
- [ ] Catalog vs detail vs wizard type matches this doc
- [ ] Optional context panel omitted when empty
- [ ] ADR-001 respected (shadcn primitives + semantic tokens)

---

## Relationship to other docs

| Doc                                                                             | Owns                                        |
| ------------------------------------------------------------------------------- | ------------------------------------------- |
| [ADR-001](../specification/adr/adr-001-ui-primitives-shadcn-semantic-tokens.md) | Primitive kit + tokens                      |
| [component-development.md](./component-development.md)                          | Primitive / feature / page tiers            |
| This file                                                                       | Regions, shell components, page-type chrome |
| `docs/specification/product/`                                                   | Which routes exist (route map)              |

When product routes land, update the nav config and the route map together —
not the shell structure.
