# As-Built — gateflow-ops

Live vs deferred, verification per feature. **Update in the same PR as behavior
changes.** Verification rows must match `tests/README.md`.

| Capability                                             | Status            | Verification                                                                                       |
| ------------------------------------------------------ | ----------------- | -------------------------------------------------------------------------------------------------- |
| Session login/logout (AUTH_MODE=dev-stub)              | ✅ chassis        | `tests/verify/01-login-status-page.md`                                                             |
| System status page (hello world / exemplar)            | ✅ chassis        | `tests/verify/01-login-status-page.md`                                                             |
| BFF exemplar route (`gateflow/status` → gateflow `/health`) | ✅ chassis        | unit + verify 01                                                                                   |
| Health endpoint                                        | ✅ chassis        | verify 01 step 6                                                                                   |
| INIT-GATEFLOW-016 Mission Control (W0 CAP-A/B + shell) | ✅ human_approved | See `Implementation-Status-INIT-GATEFLOW-016.md`; live `tests/verify/02-w0-identity-onboarding.md` — Fleet = connect/catalogue/admit (not wave start) |
| INIT-GATEFLOW-016 CAP-P platform programmes + attach   | 🔧 implemented    | Create body: no `workspace_root` / `meta_ref`; unit `platform-programmes.test.ts`; live `verify/03`; gateflow auto-connect ask = Q-4 |

_Product waves W1–W4 not started — see initiative as-built detail._
