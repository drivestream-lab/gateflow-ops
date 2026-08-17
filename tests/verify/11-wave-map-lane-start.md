# Verify: implement / closeout lanes (INIT-GATEFLOW-019 W1)

<!-- prayog:covers: REQ-06, REQ-07, REQ-08 -->

Live smoke against **real gateflow**. Spec starts on Spec lane. Implement / closeout start on their own routes. Runs cockpit is Advanced.

## Prerequisites

- Same as `10-meta-pr-spec-start.md`
- A Feature ticket whose wave map status is not `done`
- A wave with an existing app PR for closeout

## Steps

1. Open **Implement lane** (`/implement-lane`). Select an initiative and repo. Wave rows load from Gateflow.
2. **Start implement** opens the popup when status is not `done` (REQ-06). Ticket / initiative / wave are locked. Runner/model are chosen in the popup.
3. A `done` wave keeps Start implement disabled.
4. Open **Closeout lane** (`/closeout-lane`). **Start closeout** uses the existing app PR (REQ-07).
5. Open **Runs**. The PE cockpit is inside **Advanced — raw PE wave start** (REQ-08). Default walk is Spec lane → Board → Implement / Closeout.

## Negative checks

- Done-column / done wave: implement stays disabled.
- Implementation readout without a PR: closeout does not invent `pr_number`.
