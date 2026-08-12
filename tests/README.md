# Tests — feature map (SSOT)

Ownership per testing-verify-flows.mdc. Rows here must match
`docs/specification/as-built/implementation-status.md` verification rows.

| Feature                                | Unit (`tests/unit/`)         | Live verify (`tests/verify/`)         |
| -------------------------------------- | ---------------------------- | ------------------------------------- |
| JWT decode/expiry helpers              | `auth.test.ts`               | —                                     |
| i18n catalog resolution                | `i18n.test.ts`               | —                                     |
| BFF error mapping                      | `bff.test.ts`                | —                                     |
| Login → session cookie → status page   | —                            | `verify/01-login-status-page.md`      |
| Onboarding pass/fail verdict (REQ-07)  | `onboarding-verdict.test.ts` | `verify/02-w0-identity-onboarding.md` |
| Tenant detail + invite (REQ-01–02)     | — (BFF via live)             | `verify/02-w0-identity-onboarding.md` |
| Fleet programme onboarding (REQ-03–08) | — (BFF via live)             | `verify/02-w0-identity-onboarding.md` |

**No-overlap policy:** full HTTP journeys live in verify only; unit tests own
extracted branching logic. New feature ⇒ new row, in the same PR.
