# As-Built — INIT-GATEFLOW-016 (Gateflow Mission Control)

Initiative detail. Index row lives in `implementation-status.md`.

| Wave | Capability                                                                                   | Status                              | Verification                                                                                                                                      |
| ---- | -------------------------------------------------------------------------------------------- | ----------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------- |
| W0   | CAP-A tenant detail + invite; CAP-B programme onboarding + pass/fail verdict; WorkspaceShell | ✅ human_approved (wave-acceptance) | unit: `tests/unit/onboarding-verdict.test.ts`; live: `tests/verify/02-w0-identity-onboarding.md`; ground: `Ground-Report-INIT-GATEFLOW-016-W0.md` |
| W1   | CAP-C wave operations                                                                        | ⏳ not started                      | —                                                                                                                                                 |
| W2   | CAP-F initiative tracking                                                                    | ⏳ not started                      | —                                                                                                                                                 |
| W3   | CAP-G metrics                                                                                | ⏳ not started                      | —                                                                                                                                                 |
| W4   | CAP-D/E checkpoints + board                                                                  | ⏳ not started                      | —                                                                                                                                                 |

## W0 notes

- BFF: `app/api/gateflow/tenants`, `tenants/users`, `programme?op=…`
- Pure verdict: `lib/onboarding-verdict.ts` → pass\|fail only
- Shell: `components/workspace/*` via `app/(dashboard)/layout.tsx`
- Ground contracts for W1: see `docs/specification/reports/Ground-Report-INIT-GATEFLOW-016-W0.md` §Contracts produced
