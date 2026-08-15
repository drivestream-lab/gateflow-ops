# INIT-GATEFLOW-018 — Ops portal layout (review draft)

| Field      | Value                                                                |
| ---------- | -------------------------------------------------------------------- |
| Status     | **Review draft** — not Gate 1; no H1/H2; not coding-ready            |
| Portal     | gateflow-ops                                                         |
| Depends on | INIT-GATEFLOW-016 (CAP-A–G live), INIT-GATEFLOW-017 (enter + helper) |
| Kind       | Presentation / information architecture — no new upstream contracts  |

This file is the **what** for PE review. Coding starts only after a later
formal spec package (`/spec-draft` → feas → TDD → plan §9).

## Problem

The shell grew by capability, not by operator job.

- `/` is a **System status** page (operator, role, tenant, session expiry,
  upstream health, locale). That was the 016 chassis hello-world. It is not
  a destination in a working ops portal.
- `tenant_admin` nav is a flat list of nine work surfaces plus Status and
  Enter. Typical ops shells keep **5–7 grouped items** and put health +
  workspace switch in **chrome**.
- Board is four API forms that re-ask org/repo and dump JSON. Fleet already
  knows admitted repos after programme enter.
- Tenant is a read-only definition list (id, name, workspace, board, repos)
  sitting as a peer of Runs.

## Target (typical ops portal)

```text
┌──────────────────────────────────────────────────────────────────┐
│  Mark   [Programme switcher ▾]              [health] [operator ▾]│
├────────────┬─────────────────────────────────────────────────────┤
│  Grouped   │  Page header (title · one primary CTA)              │
│  nav       ├─────────────────────────────────────────────────────┤
│            │  Page body — one work surface                       │
└────────────┴─────────────────────────────────────────────────────┘
```

| Chrome (every page)                          | Not a nav route                    |
| -------------------------------------------- | ---------------------------------- |
| Entered programme + switch / leave           | `/` System status                  |
| Operator + role + logout                     | Tenant as a primary dest           |
| Upstream health dot (existing `/health` BFF) | Typed org/repo on every Board form |

`/api/health` and `GET /api/gateflow/status` **stay**. Only the **page + nav
item** go away.

## Role homes

| Actor            | After sign-in `/` goes to                           |
| ---------------- | --------------------------------------------------- |
| `platform_admin` | `/programmes`                                       |
| `tenant_admin`   | `/programmes/enter` if helper is null; else `/runs` |

`/` itself is a redirect, not a third home.

## Nav (proposed)

**`platform_admin`**

- Programmes
- Identities

**`tenant_admin`** (after enter)

| Group    | Items               |
| -------- | ------------------- |
| Delivery | Fleet · Runs        |
| Work     | Initiatives · Board |
| Observe  | Metrics             |

Checkpoints stay reachable from a run / PR (016 REQ-26–27). They are **not**
required as a top-level nav item. `/checkpoints` may remain as a bookmark
redirect or a Runs subsection — decide in open questions.

Enter and Tenant are **chrome**, not nav rows.

## Board (same CAP-E, new presentation)

016 REQ-28–31 stay. Operator path:

1. Select an **admitted** `org/repo` (fleet list; one dropdown).
2. Ticket **table** loads (not JSON).
3. **Create** is the page-header CTA; org/repo inherited.
4. **Update status** and **Link PR** are row actions.

Advanced create fields (project number, parent EPIC, idempotency key) are
optional / collapsed. Server create remains idempotent on initiative id + type.

## Fleet (same CAP-B, new presentation)

016 REQ-03–08 stay. Operator path:

1. One **Catalogue** table with two blocks: **In fleet** then **Available**.
2. Admitted repos are highlighted in the first block with **Detach** (and
   readiness refresh). Available rows show **Admit**.
3. Verdict is inline. Programme meta re-sync is a compact footer.

## Initiatives (same CAP-F, new presentation)

016 REQ-13–21 stay. Operator path:

1. Select an **admitted** `org/repo` (fleet dropdown). List loads.
2. Open a row → detail + wave map + readouts. Wave id comes from the map.
3. Closure start asks only branch slug / runner / model. Workspace is
   `{tenant.workspace_root}/{org}/{repo}` — not typed. Gateflow still requires
   the absolute path on `POST /initiatives/closure/start`.

## Requirements (draft)

| ID     | Claim                                                                                        | Evidence        |
| ------ | -------------------------------------------------------------------------------------------- | --------------- |
| REQ-01 | `/` is not a System status page; it redirects to the role home above                         | live + unit nav |
| REQ-02 | Upstream health is visible in chrome on every authenticated page; it is not a nav item       | live            |
| REQ-03 | Chrome shows operator and entered programme (or “not entered”); logout stays in chrome       | live            |
| REQ-04 | `tenant_admin` primary nav is the grouped set above — no Status, Enter, or Tenant rows       | unit            |
| REQ-05 | `platform_admin` primary nav is Programmes + Identities only                                 | unit            |
| REQ-06 | Programme enter/leave is a chrome switcher; `/programmes/enter` remains the list surface     | live            |
| REQ-07 | Tenant read model is not a primary nav destination; facts are in the switcher / popover      | live            |
| REQ-08 | Board lists tickets for the selected admitted repo; org/repo are not typed on the list form  | live            |
| REQ-09 | Board create inherits selected org/repo; one header CTA                                      | live            |
| REQ-10 | Board status and link PR are actions on a ticket row                                         | live            |
| REQ-11 | Board list is a table (title, type, state, initiative, links) — not the raw upstream payload | live            |
| REQ-12 | 016 checkpoint status/history remains available without a required top-level Checkpoints nav | live / inspect  |

## Out of scope

- New gateflow board/ticket contracts
- Reminting `SESSION_COOKIE` or changing ADR-002
- Resurrecting invite / attach
- Visual redesign of tokens (ADR-001 stays)
- Platform delivery (REQ-23 still refused)

## Open questions (need PE before formal spec)

| #   | Question                                                               | Recommendation                       |
| --- | ---------------------------------------------------------------------- | ------------------------------------ |
| Q1  | Role home for entered `tenant_admin`: `/runs` or a new dashboard?      | `/runs` — work queue, no new page    |
| Q2  | Checkpoints: fold into Runs, or keep `/checkpoints` without a nav row? | Fold into Runs; keep URL as redirect |
| Q3  | Create ticket: dialog vs right Context panel?                          | Dialog — list stays the only Card    |
| Q4  | Keep `/tenant` as a deep link with no nav, or redirect to chrome only? | Deep link, no nav                    |

## Verify impact (existing files)

| File                                      | Change                                             |
| ----------------------------------------- | -------------------------------------------------- |
| `tests/verify/01-login-status-page.md`    | After login: role home + chrome health, not Status |
| `tests/verify/06-w4-checkpoints-board.md` | Board: repo dropdown + table + row actions         |
| `tests/unit/platform-programmes.test.ts`  | Nav hrefs                                          |
| `tests/README.md`                         | Feature map row for 018                            |
