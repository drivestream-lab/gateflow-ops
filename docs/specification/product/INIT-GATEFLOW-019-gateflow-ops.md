# INIT-GATEFLOW-019 — spec slice for gateflow-ops (lane start UX)

| Field      | Value                                                                                                                                    |
| ---------- | ---------------------------------------------------------------------------------------------------------------------------------------- |
| Initiative | INIT-GATEFLOW-019                                                                                                                        |
| PRD        | **skipped** — no `prayog-meta` Gate 1 this pass (local backfill)                                                                         |
| Provider   | `gateflow` `docs/specification/product/INIT-GATEFLOW-019-gateflow.md`                                                                    |
| Repo       | drivestream-lab/gateflow-ops                                                                                                             |
| Date       | 2026-08-15                                                                                                                               |
| Status     | Draft — **Gate 1 skipped**. Coding of W0 **blocked** until provider W1+W2 are on the consumed gateflow `develop` (or an agreed lab tip). |

## Overview

016 CAP-C already starts lanes via a **raw PE form** (`RunCockpit`). 016 CAP-F already **renders** spec / wave / implement / closeout readouts. This INIT changes **how start is offered**:

- Spec starts from **Spec lane**, not Meta PRs. Meta PRs is the last-10 catalogue plus **Onboard**.
- There is no Initiatives page. Work is independent routes: Meta PRs · Spec lane · Board · Implement lane · Closeout lane · Initiative closure.
- Each lane uses the same table + Start + popup (locked context + runner/model).
- Implement / closeout start from their lane pages (tickets / wave app PR), not the meta-PR row.

GitHub is outbound links only. The BFF must not list meta PRs by calling GitHub.

## Capabilities

| CAP       | Intent                                                         |
| --------- | -------------------------------------------------------------- |
| **CAP-1** | Meta PR picker + Start spec (derived binds)                    |
| **CAP-2** | Implement / closeout from wave map; cockpit not the happy path |

## Functional requirements

| ID     | Requirement                                                                                                                                                                                                                                                                                | CAP   | Wave |
| ------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ----- | ---- |
| REQ-01 | After programme enter, operator lands on **Meta PRs** (`/meta-prs`) and sees the last 10 INIT-* rows from **gateflow** CAP-A (not a GitHub scrape). Rows without `INIT-*` never appear. **Refresh from GitHub** calls `refresh=true`. **Onboard** admits a row. Meta PRs has **no Start**  | CAP-1 | W0   |
| REQ-02 | Each Meta PRs row shows CAP-01 verdict in plain language (ready / missing label / stale / blocked)                                                                                                                                                                                         | CAP-1 | W0   |
| REQ-03 | **Spec lane** (`/spec-lane`) lists **onboarded** PRs only. Table: initiative · repo dropdown · PRD PR · Spec PR · status. Onboarded + attested + no spec run for that repo → Start spec. Popup locks initiative/PR/repo and collects runner/model from `GET /runners`. No Initiatives page | CAP-1 | W0   |
| REQ-04 | Paths, `start_node`, and spec `branch_slug` are not collected                                                                                                                                                                                                                              | CAP-1 | W0   |
| REQ-05 | Spec lane status: not started / open / closed. Closed when the spec run is at `board-tickets-action` (Spec PR merged). Draft Spec PR is not “spec done”. Board seed is a later Start on `/board`                                                                                           | CAP-1 | W0   |
| REQ-06 | Implement starts on **Implement lane** from a Feature ticket when wave map status is not `done`. Ticket / initiative / wave prefilled in the popup                                                                                                                                         | CAP-2 | W1   |
| REQ-07 | Closeout starts on **Closeout lane** from a wave that has an app PR. `pr_number` prefilled                                                                                                                                                                                                 | CAP-2 | W1   |
| REQ-08 | Raw `RunCockpit` is not the primary start. Optional advanced collapse may remain; default walk is Spec lane then Board then Implement/Closeout                                                                                                                                             | CAP-2 | W1   |
| REQ-09 | Implement / closeout / closure lanes use the onboarded set, not the GitHub last-10 catalogue                                                                                                                                                                                               | CAP-2 | W1   |

## Out of scope

- Implementing gateflow CAP-A/B (provider)
- BFF → GitHub for the picker
- Backfilling old walks
- Redesigning 018 chrome (consume it)
- Showing `start_node` as a skill picker

## Dependency

| Provider wave       | Consumer may start                          |
| ------------------- | ------------------------------------------- |
| gateflow W0 (CAP-D) | independent (grants/connect already usable) |
| gateflow W1+W2      | ops W0 (picker + spec start)                |
| ops W0              | ops W1 (wave-map actions)                   |
