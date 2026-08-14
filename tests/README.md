# Tests — feature map (SSOT)

Ownership per testing-verify-flows.mdc. Rows here must match
`docs/specification/as-built/implementation-status.md` verification rows.

| Feature                                                                        | Unit (`tests/unit/`)                                       | Live verify (`tests/verify/`)                                        |
| ------------------------------------------------------------------------------ | ---------------------------------------------------------- | -------------------------------------------------------------------- |
| JWT decode/expiry helpers                                                      | `auth.test.ts`                                             | —                                                                    |
| jwt-upstream login body/path mapping                                           | `auth-login-upstream.test.ts`                              | `verify/01` (dev-stub); W0 verify (live)                             |
| 017 W0 programme-context helper + email-shape (REQ-03, REQ-12, REQ-14, REQ-18) | `programme-context.test.ts`, `auth-login-upstream.test.ts` | `verify/01-login-status-page.md`                                     |
| 017 W1 identity factory (REQ-01–05, 12–14, 22, 25, 29, 30)                     | `identities-bff.test.ts`                                   | `verify/07-identity-factory.md`                                      |
| i18n catalog resolution                                                        | `i18n.test.ts`                                             | —                                                                    |
| BFF error mapping                                                              | `bff.test.ts`                                              | —                                                                    |
| Login → session cookie → status page                                           | —                                                          | `verify/01-login-status-page.md`                                     |
| Onboarding pass/fail verdict (REQ-07)                                          | `onboarding-verdict.test.ts`                               | `verify/02-w0-identity-onboarding.md`                                |
| Tenant detail + invite (REQ-01–02)                                             | — (BFF via live)                                           | `verify/02-w0-identity-onboarding.md`                                |
| Fleet programme onboarding (REQ-03–08)                                         | — (BFF via live)                                           | `verify/02-w0-identity-onboarding.md` (admit ≠ wave start; no `ref`) |
| Platform programmes + attach (REQ-32–37)                                       | `platform-programmes.test.ts`                              | `verify/03-platform-programme-onboard.md`                            |
| Wave ops / runs / forge (REQ-09–12)                                            | `run-stop-presentation.test.ts`                            | `verify/03-w1-wave-operations.md`                                    |
| Initiative tracking / readouts / closure (REQ-13–21)                           | `initiative-composition.test.ts`                           | `verify/04-w2-initiative-tracking.md`                                |
| Metrics / efficacy / scorecard (REQ-22–25)                                     | `metrics-empty.test.ts`                                    | `verify/05-w3-metrics-efficacy.md`                                   |
| Checkpoints status/history (REQ-26–27)                                         | `checkpoint-miss.test.ts`                                  | `verify/06-w4-checkpoints-board.md`                                  |
| Board tickets list/create/status/link (REQ-28–31)                              | `board-helpers.test.ts`                                    | `verify/06-w4-checkpoints-board.md`                                  |

**No-overlap policy:** full HTTP journeys live in verify only; unit tests own
extracted branching logic. New feature ⇒ new row, in the same PR.
