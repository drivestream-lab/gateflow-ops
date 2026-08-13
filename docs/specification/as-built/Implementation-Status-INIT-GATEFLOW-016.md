# As-Built — INIT-GATEFLOW-016 (Gateflow Mission Control)

Initiative detail. Index row lives in `implementation-status.md`.

| Wave  | Capability                                                                                            | Status                              | Verification                                                                                                                                                          |
| ----- | ----------------------------------------------------------------------------------------------------- | ----------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| W0    | CAP-A tenant detail + invite; CAP-B fleet connect/catalogue/admit + pass/fail verdict; WorkspaceShell | ✅ human_approved (wave-acceptance) | unit: `tests/unit/onboarding-verdict.test.ts`; live: `tests/verify/02-w0-identity-onboarding.md`; ground: `Ground-Report-INIT-GATEFLOW-016-W0.md`                     |
| CAP-P | Platform programmes list/create/detail + tenant_admin attach; role-filtered nav (REQ-32–37)           | 🔧 implemented (backfill)           | unit: `tests/unit/platform-programmes.test.ts`; live: `tests/verify/03-platform-programme-onboard.md`                                                                 |
| W1    | CAP-C wave operations (start lanes, runs cockpit, forge authorize)                                    | ✅ human_approved (wave-acceptance) | unit: `tests/unit/run-stop-presentation.test.ts`; live: `tests/verify/03-w1-wave-operations.md`; ground: `Ground-Report-INIT-GATEFLOW-016-W1.md`                      |
| W2    | CAP-F initiative tracking                                                                             | ✅ human_approved (wave-acceptance) | unit: `tests/unit/initiative-composition.test.ts`; live: `tests/verify/04-w2-initiative-tracking.md`; ground: `Ground-Report-INIT-GATEFLOW-016-W2.md`                 |
| W3    | CAP-G metrics                                                                                         | ✅ human_approved (wave-acceptance) | unit: `tests/unit/metrics-empty.test.ts`; live: `tests/verify/05-w3-metrics-efficacy.md`; ground: `Ground-Report-INIT-GATEFLOW-016-W3.md`                             |
| W4    | CAP-D/E checkpoints + board                                                                           | ✅ human_approved (wave-acceptance) | unit: `tests/unit/checkpoint-miss.test.ts`, `board-helpers.test.ts`; live: `tests/verify/06-w4-checkpoints-board.md`; ground: `Ground-Report-INIT-GATEFLOW-016-W4.md` |

## W0 notes

- BFF: `app/api/gateflow/tenants`, `tenants/users`, `programme?op=…` (connect forwards `org`/`repo` only — no `ref`)
- Fleet UI: active fleet → catalogue admit → meta connect/re-sync; admit ≠ wave start
- Pure verdict: `lib/onboarding-verdict.ts` → pass\|fail fleet onboard only
- Shell: `components/workspace/*` via `app/(dashboard)/layout.tsx`
- Ground contracts for W1: see `docs/specification/reports/Ground-Report-INIT-GATEFLOW-016-W0.md` §Contracts produced
- Dependency: gateflow auto-connect on programme create = product Q-4 (manual connect until then)

## CAP-P notes (platform programme backfill)

- BFF: `app/api/gateflow/programmes` (+ `[programmeId]`, `tenant-admins`, `catalogue/refresh`)
- Create body aligned with gateflow: `name`, `meta_org`, `meta_repo`, `github_pat` only — **no** `workspace_root` or `meta_ref`
- Detail/list display read-model `workspaceRoot` and informational `repoCatalogue` (gateflow REQ-48); may show `metaRef` if upstream returns it
- Platform catalogue refresh: `POST …/programmes/{id}/catalogue/refresh` (REQ-37 / gateflow REQ-49)
- Attach responses strip `access_token` via `lib/programme-attach.ts`
- Nav filtered by JWT role (`lib/workspace-nav.ts` + `lib/session-role.ts`)
- UI: `/programmes`, `/programmes/new`, `/programmes/[programmeId]`
- Out of scope still: wipe, lane-defaults, agent-catalogue; auto-connect is gateflow Q-4

## W1 notes (CAP-C)

- BFF: `app/api/gateflow/waves` (`?lane=`), `runs`, `runs/by-id`, `runs/forge`
- UI: `/runs` — `components/runs/run-cockpit.tsx`; nav `tenant_admin` → Runs
- Stop presentation: `classifyRunStopPresentation` — `stopped` = human checkpoint (not error)
- Forge authorize only when STOPPED + workflow node; explicit operator action
- Not on Fleet page (admit ≠ wave start)
- Live: `tests/verify/03-w1-wave-operations.md` (human at wave-acceptance)

## W2 notes (CAP-F)

- BFF: `app/api/gateflow/initiatives` (list + `?op=closure-start`), `initiatives/by-id` (`?op=` detail/waves/spec/implementation/closeout/merge/completion/closure)
- UI: `/initiatives` — `components/initiatives/initiative-hub.tsx`; nav `tenant_admin` → Initiatives
- Composition displayed as-is; gaps labeled empty/unavailable (no invented board/GitHub fields)
- Closure start surfaces accepted enqueue (202) with run id
- Optional deep-link to `/runs`; not folded into Fleet or Runs cockpit
- Live: `tests/verify/04-w2-initiative-tracking.md` (human at wave-acceptance)
- Ground contracts for W3: see `docs/specification/reports/Ground-Report-INIT-GATEFLOW-016-W2.md` §Contracts produced

## W3 notes (CAP-G)

- BFF: `app/api/gateflow/metrics` (`?op=runs|skill-efficacy|factory-effectiveness|delivery-scorecard`)
- UI: `/metrics` — `components/metrics/metrics-panels.tsx`; nav `tenant_admin` → Metrics
- Empty series labeled honestly via `isMetricsSeriesEmpty` (no mock charts)
- Skill-efficacy filters: `model_id`, `prompt_revision`
- Not folded into Fleet / Runs / Initiatives
- Live: `tests/verify/05-w3-metrics-efficacy.md` (human at wave-acceptance)
- Ground contracts for W4: see `docs/specification/reports/Ground-Report-INIT-GATEFLOW-016-W3.md` §Contracts produced

## W4 notes (CAP-D/E)

- BFF: `app/api/gateflow/checkpoints` (`?op=status|history`); `app/api/gateflow/board` (`?op=list|create|status|link`)
- UI: `/checkpoints`, `/board` — separate nav for `tenant_admin` (not folded into Fleet/Runs/Initiatives/Metrics)
- Checkpoint miss: named no-run / not-found via `classifyCheckpointMiss` (never fabricate status)
- Board list requires org/repo; create idempotent on initiative_id+type (`idempotent_replay`)
- Live: `tests/verify/06-w4-checkpoints-board.md` (human at wave-acceptance)
- Ground: `docs/specification/reports/Ground-Report-INIT-GATEFLOW-016-W4.md` (§Contracts produced → initiative-closure)
