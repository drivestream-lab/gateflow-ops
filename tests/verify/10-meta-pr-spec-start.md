# Verify: Meta PRs list + Spec lane start (INIT-GATEFLOW-019 W0)

<!-- prayog:covers: REQ-01, REQ-02, REQ-03, REQ-04, REQ-05 -->

Live smoke against **real gateflow** (provider W1+W2). The BFF must not call GitHub.

## Prerequisites

- `AUTH_MODE=jwt-upstream`
- `UPSTREAM_BASE_URL` → live gateflow with 019 W1+W2
- Tenant admin session; programme entered
- At least one INIT-* meta PR on the programme meta repo

## Steps

1. Sign in as **tenant_admin** and enter the programme. `/` lands on **Meta PRs** (`/meta-prs`).
2. The **Meta PRs** table loads from Gateflow and shows at most the last 10 INIT-* rows (REQ-01). **Refresh from GitHub** reloads from GitHub and updates the table. **Onboard** admits a row. There is **no Start spec** on this page.
3. Rows without `INIT-*` do not appear. Each row shows a plain-language CAP-01 verdict (REQ-02).
4. Onboard an attested row. Open **Spec lane** (`/spec-lane`) — only onboarded rows appear. Pick a repo. **Start spec** opens the popup. Confirm is enabled only when that **app repo** has no spec run (REQ-03).
5. Popup shows initiative and PRD PR locked. Runner/model come from the catalogue. Paths, `start_node`, and spec slug are absent (REQ-04).
6. Submit. A spec run appears on the row. Status is not started / open / closed. Closed means the spec run is at `board-tickets-action`. Draft Spec PR is **not** labelled spec done (REQ-05).
7. Work nav has no **Initiatives** item. `/initiatives` is gone.

## Negative checks

- Unattested or not-onboarded row: Start spec stays disabled.
- Network tab: catalogue is `/api/gateflow/meta/pulls`; Spec lane is `/api/gateflow/meta/pulls/onboarded`; Onboard is `POST /api/gateflow/meta/pulls/onboard`. No Octokit / `api.github.com` from the BFF.
