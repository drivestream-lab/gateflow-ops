# As-Built — gateflow-ops

Live vs deferred, verification per feature. **Update in the same PR as behavior
changes.** Verification rows must match `tests/README.md`.

| Capability                                                  | Status            | Verification                                                                                                                                          |
| ----------------------------------------------------------- | ----------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------- |
| Session login/logout (AUTH_MODE=dev-stub)                   | ✅ chassis        | `tests/verify/01-login-status-page.md`                                                                                                                |
| System status page (hello world / exemplar)                 | ✅ chassis        | `tests/verify/01-login-status-page.md`                                                                                                                |
| BFF exemplar route (`gateflow/status` → gateflow `/health`) | ✅ chassis        | unit + verify 01                                                                                                                                      |
| Health endpoint                                             | ✅ chassis        | verify 01 step 6                                                                                                                                      |
| INIT-GATEFLOW-016 Mission Control (W0 CAP-A/B + shell)      | ✅ human_approved | See `Implementation-Status-INIT-GATEFLOW-016.md`; live `tests/verify/02-w0-identity-onboarding.md` — Fleet = connect/catalogue/admit (not wave start) |
| INIT-GATEFLOW-016 CAP-P platform programmes + attach        | 🔧 implemented    | Create body: no `workspace_root` / `meta_ref`; unit `platform-programmes.test.ts`; live `verify/03`; gateflow auto-connect ask = Q-4                  |
| INIT-GATEFLOW-016 W1 CAP-C wave operations                  | ✅ human_approved | unit `run-stop-presentation.test.ts`; live `tests/verify/03-w1-wave-operations.md`; ground `Ground-Report-INIT-GATEFLOW-016-W1.md`                    |
| INIT-GATEFLOW-016 W2 CAP-F initiative tracking              | ✅ human_approved | unit `initiative-composition.test.ts`; live `tests/verify/04-w2-initiative-tracking.md`; ground `Ground-Report-INIT-GATEFLOW-016-W2.md`               |

_Product waves W3–W4 not started — see initiative as-built detail._
