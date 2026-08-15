# Implementation plan — INIT-GATEFLOW-018 (review draft)

| Field            | Value                                                                                  |
| ---------------- | -------------------------------------------------------------------------------------- |
| Status           | **Review draft** — not Gate 2; no `prayog/v1` WorkManifest; not `/pre-implement` ready |
| Spec             | `docs/specification/product/INIT-GATEFLOW-018-ops-portal-layout.md`                    |
| Date             | 2026-08-15                                                                             |
| `check_command`  | `make check`                                                                           |
| `test_command`   | `make test`                                                                            |
| `verify_command` | per wave live FILE (below)                                                             |
| `ground_command` | N/A — no Makefile ground target                                                        |

Use this to **align IA**. After PE accepts the spec + open questions, run the
normal package (`/spec-draft` refresh → feas → TDD → `/spec-implementation-plan`
§9) on a `chore/…-spec-*` branch. Do not cut a feature branch from this file.

## Why this plan exists

016/017 shipped capabilities as **one nav row + one form page each**. That is
honest and testable. It is not how an ops portal is used.

This initiative is **layout and presentation only**. BFF ops stay. ADR-001 and
ADR-002 stay.

## Target shell (do this, not a new design system)

```text
Chrome:  mark | programme switcher | health dot | operator menu
Nav:     grouped work surfaces (role-filtered)
Page:    header (title + one CTA) | one body surface
```

Matches `docs/project-guidance/workspace-layout.md` slots. We are filling
chrome correctly and **stopping** the chassis Status page from occupying `/`.

## Decisions to confirm before coding

Copy from the spec. Defaults if PE is silent:

| #   | Default                                              |
| --- | ---------------------------------------------------- |
| Q1  | Entered `tenant_admin` `/` → `/runs`                 |
| Q2  | Checkpoints fold into Runs; `/checkpoints` redirects |
| Q3  | Board create = dialog                                |
| Q4  | `/tenant` stays as a no-nav deep link                |

## 1. Requirements

| ID     | Summary                                        | Waves    |
| ------ | ---------------------------------------------- | -------- |
| REQ-01 | `/` redirects to role home                     | W0       |
| REQ-02 | Health in chrome, not nav                      | W0       |
| REQ-03 | Operator + entered programme in chrome         | W0, W1   |
| REQ-04 | `tenant_admin` grouped nav                     | W0, W1   |
| REQ-05 | `platform_admin` nav = Programmes + Identities | W0       |
| REQ-06 | Programme switcher in chrome                   | W1       |
| REQ-07 | Tenant not a primary nav dest                  | W1       |
| REQ-08 | Board list from selected admitted repo         | W2       |
| REQ-09 | Board create inherits repo                     | W2       |
| REQ-10 | Board status / link are row actions            | W2       |
| REQ-11 | Board list is a table                          | W2       |
| REQ-12 | Checkpoints without required top-level nav     | W0 or W3 |

## 2. Waves

### W0 — Shell IA (health + home + nav)

**GOAL-W0:** Status is not a product route. Chrome shows health. `/` is a
role redirect. Nav matches REQ-04/05 (Enter/Tenant rows removed in W1 if
switcher is not ready — see note).

| Task       | Implements     | Files (path / action)                                                                                                                              | Exit criteria                                                                                    |
| ---------- | -------------- | -------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------ |
| TASK-W0-01 | REQ-02, REQ-03 | `components/workspace/workspace-shell.tsx` modify; `components/system/upstream-status.tsx` modify or wrap; `data/locales/en/workspace.json` modify | Health + operator visible in chrome on every authenticated page                                  |
| TASK-W0-02 | REQ-01, REQ-05 | `app/(dashboard)/page.tsx` modify (redirect); `app/(dashboard)/layout.tsx` if needed                                                               | `platform_admin` `/` → `/programmes`; `tenant_admin` entered → `/runs`; else `/programmes/enter` |
| TASK-W0-03 | REQ-04, REQ-05 | `lib/workspace-nav.ts` modify; `tests/unit/platform-programmes.test.ts` modify; `docs/project-guidance/workspace-layout.md` modify                 | Status href gone; platform nav = programmes + identities                                         |
| TASK-W0-04 | REQ-01, REQ-02 | `tests/verify/01-login-status-page.md` modify; `tests/README.md` modify; as-built 018 create + index row                                           | Verify 01 checks chrome health + role home; **does not** require a System status Card            |

**W0 nav note:** Removing Enter/Tenant from nav before the W1 switcher leaves
no way to switch programme. **Either** ship a minimal chrome switcher link in
W0 (href to `/programmes/enter`) **or** keep those two rows until W1. Prefer
a single chrome control in W0 that only links through — full switcher UI in W1.

**Must not:** delete `/api/health` or `/api/gateflow/status`. Do not remint
session. Do not put health back as a nav item.

**Verify:** `tests/verify/01-login-status-page.md` (human). `make check && make test`.

---

### W1 — Programme chrome (enter + tenant facts)

**GOAL-W1:** Switching programme is a header control. Tenant facts are not a
nav peer of Runs.

| Task       | Implements     | Files (path / action)                                                                                                                                    | Exit criteria                                                         |
| ---------- | -------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------- |
| TASK-W1-01 | REQ-06, REQ-03 | `components/workspace/` create switcher leaf; `app/(dashboard)/layout.tsx` or shell pass entered ids; reuse `GET /api/auth/programme`                    | Chrome shows entered programme; enter/leave without hunting a nav row |
| TASK-W1-02 | REQ-07         | `components/tenant/tenant-detail.tsx` reuse in popover; `lib/workspace-nav.ts` drop `/tenant`; `app/(dashboard)/tenant/page.tsx` keep or redirect per Q4 | No Tenant nav row; facts still readable                               |
| TASK-W1-03 | REQ-04, REQ-06 | `tests/unit/platform-programmes.test.ts` modify; live 01 or a small 018 FILE                                                                             | Nav assertions; enter still works                                     |

**Must not:** invent grant; collect a password on enter; migrate CAP-P.

**Verify:** extend `01` or add `tests/verify/10-ops-portal-chrome.md` if 01
becomes too long (P15: new chrome surface).

---

### W2 — Board as a list (repo trigger + row actions)

**GOAL-W2:** One Card. Repo dropdown from admitted fleet. Table. Header create.
Row menu for status + link.

| Task       | Implements     | Files (path / action)                                                                                                                                          | Exit criteria                                                              |
| ---------- | -------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------- |
| TASK-W2-01 | REQ-08, REQ-11 | `components/board/ticket-views.tsx` rewrite; `hooks/use-board.ts` keep; `hooks/use-tenant.ts` or fleet repos for dropdown; `data/locales/en/board.json` modify | Select admitted repo → table; empty fleet named; no typed org/repo on list |
| TASK-W2-02 | REQ-09         | same board component + create dialog; page header CTA                                                                                                          | Create inherits org/repo; idempotent replay copy stays                     |
| TASK-W2-03 | REQ-10         | row menu + small dialogs for status + link                                                                                                                     | Ticket id / org / repo not re-typed                                        |
| TASK-W2-04 | REQ-08–11      | `tests/verify/06-w4-checkpoints-board.md` modify **or** new `tests/verify/11-board-list.md` if 06’s 016 markers must stay; as-built 018                        | Human smoke: list / create / status / link on selected repo                |

**Must not:** change board BFF ops or create idempotency rules. Do not host
017 enter `prayog:covers` on 016 files. If 06 cannot describe the new UI
without breaking 016 coverage, **add** FILE `11` and leave 06 as BFF-level
smoke or update steps only.

**Verify:** board live FILE (06 updated or 11). `make check && make test`.

---

### W3 — Checkpoints placement (only if Q2 = fold)

**GOAL-W3:** REQ-12. Checkpoints are a Runs subsection (or run-detail panel).
Top-level nav row removed. `/checkpoints` redirects.

Skip this wave if PE keeps `/checkpoints` as a no-nav deep link only (then
W0 already dropped the nav row).

| Task       | Implements | Files                                                                                         | Exit criteria                                     |
| ---------- | ---------- | --------------------------------------------------------------------------------------------- | ------------------------------------------------- |
| TASK-W3-01 | REQ-12     | `components/runs/` + `components/checkpoints/` compose; `lib/workspace-nav.ts`; page redirect | Status/history still work; no Checkpoints nav row |
| TASK-W3-02 | REQ-12     | `tests/verify/06-w4-checkpoints-board.md` steps update                                        | Human finds checkpoints from Runs                 |

## 3. Guidance / as-built (same PRs as behavior)

| Path                                                                     | When      | Change                                                                |
| ------------------------------------------------------------------------ | --------- | --------------------------------------------------------------------- |
| `docs/project-guidance/workspace-layout.md`                              | W0        | Chrome owns health + programme switcher; `/` is not a hub Status page |
| `docs/project-guidance/branding.md`                                      | W0        | Health dot uses semantic `text-ok` / `text-danger`                    |
| `docs/specification/as-built/Implementation-Status-INIT-GATEFLOW-018.md` | each wave | `implemented` then `human_approved`                                   |
| `docs/specification/as-built/implementation-status.md`                   | W0        | One index row                                                         |
| `tests/README.md`                                                        | each wave | Feature map                                                           |

## 4. Risks

| ID      | Risk                                                         | Mitigation                                                    |
| ------- | ------------------------------------------------------------ | ------------------------------------------------------------- |
| RISK-01 | Verify 01 still asserts a System status Card                 | Rewrite 01 in W0; do not leave chassis copy as 018 proof      |
| RISK-02 | Removing Enter nav before chrome switcher traps the operator | W0 ships a chrome link to `/programmes/enter`                 |
| RISK-03 | 016 `06` REQ markers vs new Board UI                         | Prefer new FILE 11 for 018 board presentation; keep 06 honest |
| RISK-04 | Ticket JSON shape unknown → table columns guess              | Fail-closed columns; “more” fold for unexpected fields        |
| RISK-05 | Scope creep into a visual redesign                           | Tokens + primitives unchanged (ADR-001)                       |

## 5. Must not (all waves)

- Remint or overwrite `SESSION_COOKIE`
- Call upstream from the browser
- Resurrect invite / attach
- Migrate CAP-P programmes BFF to the enter helper
- Add `NEXT_PUBLIC_*` privileged URLs
- Treat this draft as a WorkManifest or cut `feature/INIT-GATEFLOW-018-w*` from it

## 6. After PE review

1. Resolve Q1–Q4 on the spec.
2. `/spec-draft` (promote this draft) → `/initiative-feasibility` →
   `/spec-technical-review` (likely **no new ADR** — layout is project
   guidance, not an ADR unless we change cookie/session).
3. `/spec-implementation-plan` mints §9 on the spec branch.
4. Merge with `spec-lgtm` → `/create-board-tickets` → `/pre-implement` W0.

## Ready for formal spec package?

**Not yet.** Waiting on PE review of the IA and Q1–Q4.
