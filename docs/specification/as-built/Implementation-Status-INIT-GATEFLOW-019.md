# Implementation status — INIT-GATEFLOW-019 (gateflow-ops)

| Field      | Value                                                                 |
| ---------- | --------------------------------------------------------------------- |
| Initiative | INIT-GATEFLOW-019                                                     |
| Spec       | `docs/specification/product/INIT-GATEFLOW-019-gateflow-ops.md`        |
| Plan       | `docs/specification/reports/Implementation-Plan-INIT-GATEFLOW-019.md` |
| Updated    | 2026-08-17                                                            |
| Gate 1     | **skipped** (local backfill)                                          |

## Wave status

| Wave | Goal                                         | Status                 | Evidence                                                                             |
| ---- | -------------------------------------------- | ---------------------- | ------------------------------------------------------------------------------------ |
| W0   | Nav + Meta PRs look-only + Spec lane start   | **implemented (unit)** | `tests/unit/meta-pr-picker.test.ts`, `platform-programmes.test.ts`; live `verify/10` |
| W1   | Implement / closeout / closure as own routes | **implemented (unit)** | wave-lane + closure pages; live `verify/11`                                          |

016 CAP-C `RunCockpit` remains available under **Advanced** on Runs. There is no Initiatives page.

## Operator navigation (019)

Entered `tenant_admin` walk:

| Surface            | Path                  | Role                                     |
| ------------------ | --------------------- | ---------------------------------------- |
| Role home          | `/` → `/meta-prs`     | Last 10 INIT-* PRs; Onboard; no Start    |
| Fleet              | `/fleet`              | Admit app repos                          |
| Meta PRs           | `/meta-prs`           | Catalogue + Onboard; Refresh from GitHub |
| Spec lane          | `/spec-lane`          | Start spec (table + popup)               |
| Board              | `/board`              | Tickets (seed Start is a later slice)    |
| Implement lane     | `/implement-lane`     | Start implement from a wave ticket       |
| Closeout lane      | `/closeout-lane`      | Start closeout from a wave app PR        |
| Initiative closure | `/initiative-closure` | Start closure                            |
| Runs / Metrics     | `/runs`, `/metrics`   | Observe; PE cockpit is Advanced          |

Nav groups: Delivery = Fleet; Work = Meta PRs · Spec lane · Board · Implement lane · Closeout lane · Initiative closure; Observe = Runs · Metrics.
