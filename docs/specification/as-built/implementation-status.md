# As-Built — gateflow-ops

Live vs deferred, verification per feature. **Update in the same PR as behavior
changes.** Verification rows must match `tests/README.md`.

| Capability                                  | Status     | Verification                           |
| ------------------------------------------- | ---------- | -------------------------------------- |
| Session login/logout (AUTH_MODE=dev-stub)   | ✅ chassis | `tests/verify/01-login-status-page.md` |
| System status page (hello world / exemplar) | ✅ chassis | `tests/verify/01-login-status-page.md` |
| BFF exemplar route (`gateflow/status`)      | ✅ chassis | unit + verify 01                       |
| Health endpoint                             | ✅ chassis | verify 01 step 6                       |

_No product features yet — chassis only._
