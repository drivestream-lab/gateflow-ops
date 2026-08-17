# As-Built — INIT-GATEFLOW-018 (Ops portal layout)

Initiative detail. Index row lives in `implementation-status.md`.

| Wave  | Capability                                                                    | Status         | Verification                                                                                                                                                        |
| ----- | ----------------------------------------------------------------------------- | -------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| W0–W3 | Shell IA, chrome switcher, board/fleet/initiative tables, checkpoints on Runs | 🔧 implemented | unit: `platform-programmes.test.ts`, `board-helpers.test.ts`, `fleet-rows.test.ts`, `initiative-derive.test.ts`; live: `01`, `02`, `04`, `06` (human — not claimed) |

## Notes

- `/` redirects: `platform_admin` → `/programmes`; `tenant_admin` entered → `/meta-prs` (019 supersedes Q1 `/runs`); else `/programmes/enter`
- Health is `ChromeHealth` in the inset chrome (still probes `/api/gateflow/status` → gateflow `/health`)
- Programme enter/leave is `ProgrammeSwitcher`; `/programmes/enter` remains the full list
- Tenant is a deep link from the switcher; not a nav row
- `tenant_admin` nav: Fleet (Delivery); Meta PRs, Spec lane, Board, Implement lane, Closeout lane, Initiative closure (Work); Runs, Metrics (Observe). 019 removed Initiatives.
- `platform_admin` nav: Programmes, Identities
- Board: admitted-repo dropdown, table, create panel, row status/link
- Fleet: one Card — catalogue table with In fleet / Available blocks,
  highlighted admitted rows + Detach, inline verdict, compact meta footer
  (`lib/fleet-rows.ts`)
- Lane pages: fleet-repo dropdown; wave id from wave map; closure workspace
  derived from tenant `workspace_root` (`lib/initiative-derive.ts`)
- Checkpoints render on Runs; `/checkpoints` redirects to `/runs`
- Status is `implemented` until human accept — do not mark `human_approved` here
