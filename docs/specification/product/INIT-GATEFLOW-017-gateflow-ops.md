# INIT-GATEFLOW-017 — spec slice for gateflow-ops

| Field                      | Value                                                                                                                                                                                                                    |
| -------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Initiative                 | INIT-GATEFLOW-017                                                                                                                                                                                                        |
| PRD                        | `prayog-meta/prd/INIT-GATEFLOW-017.md`                                                                                                                                                                                   |
| PRD digest (H1)            | `sha256:c0fe55040928a13976133edde5cf71f0524815c17c0a8de79173ed3fa0657f67`                                                                                                                                                |
| Meta PR                    | https://github.com/drivestream-lab/prayog-meta/pull/42                                                                                                                                                                   |
| Meta PR approved head (G1) | `601b00e0a74510a6af1c33bc80ca27260995c094`                                                                                                                                                                               |
| Impact map                 | `prayog-meta/prd/reports/Impact-Map-INIT-GATEFLOW-017.md`                                                                                                                                                                |
| Impact-map revision (H3)   | `1`                                                                                                                                                                                                                      |
| Repo scope digest (H2)     | `sha256:13cee9aae41718fd4ad8655d77738042761b0e45db7eefc898a693c42c2fb987`                                                                                                                                                |
| Tech-lead approval         | [PRR](https://github.com/drivestream-lab/prayog-meta/pull/42#pullrequestreview-4927360675) by `@0xbeefdead`, submitted `2026-08-13T13:04:05Z`, review `commit_id` = G1 head; label `impact-map-lgtm`; meta PR **merged** |
| Repo                       | gateflow-ops                                                                                                                                                                                                             |
| Date                       | 2026-08-13                                                                                                                                                                                                               |
| Status                     | Draft — dev review required before Forge publish                                                                                                                                                                         |

> **H4 citations:** The H1–H3 (and G1) rows above are the durable authority
> carrier for mid-lane freshness. Feas / TDD / plan digests are walk-time only
> and may be purged at initiative closure — see
> `prayog-skills/references/artifact-write-contract.md`.

## Overview

This repo delivers the **console** for INIT-GATEFLOW-017: `platform_admin`
enters and finds identities, grants or detaches programme entry, inspects who
can enter which programme, suspends or unsuspends, sets password, and keeps
programme onboard plus catalogue show. `tenant_admin` signs in once with email
and password, sees only programmes they were granted, enters one, and keeps
INIT-GATEFLOW-016 delivery (catalogue include, waves, metrics, board,
scorecard) **minus** teammate-invite. An identity with zero grants can sign in
and see that they belong to no programme.

**Out of scope for this repo:** gateflow identity/grant/sign-in API ownership
(provider is `drivestream-lab/gateflow`); leftover 014 bind-row wipe (OQ-01,
provider); delete-identity; change-email; self-serve password; extra programme
roles; SSO; programme wipe; `platform_admin` delivery acts; rewriting 016
delivery except removing invite and replacing 014 create+bind attach.

**Supersedes in this repo:** INIT-GATEFLOW-016 REQ-02 (invite teammate) and
INIT-GATEFLOW-016 REQ-35 (attach `tenant_admin` by minting credential+password
on a programme). 016 tenant detail and CAP-P programme list/create/detail/
catalogue-refresh remain. 017 product truth wins where they conflict (map IM-02
default).

**Ownership:** this slice states observable console behavior and acceptance
only. How session vs programme authorization is stored, BFF module layout, and
page trees are for feasibility / technical review — not decided here. Existing
chassis constraints (httpOnly session; server-only upstream token; shadcn /
ADR-001; workspace shell) may be cited, not redesigned.

**Kill line (PRD A5 / map §7):** do not ship identity or grant screens while
gateflow still creates membership via 014 create+bind (one human = one
programme). Provider then consumer.

## Functional requirements

| ID     | Requirement                                                                                                                   | PRD source                            | Condition / event                                                                                                  | Observable result                                                                                                                                                                                                                                                              | Evidence layer           |
| ------ | ----------------------------------------------------------------------------------------------------------------------------- | ------------------------------------- | ------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------ |
| REQ-01 | `platform_admin` enters a human (name, email, password) with no programme                                                     | PRD `REQ-01`, `CAP-01`                | Valid entry by `platform_admin`                                                                                    | Identity appears on the factory list with that name and email; role is `tenant_admin`; they can later sign in with that email and password; they belong to no programme yet                                                                                                    | unit / live verify       |
| REQ-02 | Email is unique as the factory sign-in identifier                                                                             | PRD `REQ-02`, `CAP-01`                | Second entry uses an email that already exists                                                                     | Refused (duplicate email); no second identity; first identity unchanged                                                                                                                                                                                                        | unit / live verify       |
| REQ-03 | Login identifier must be an email on entry and on sign-in                                                                     | PRD `REQ-03`, `CAP-01`                | Identifier is empty, has no `@`, or has no domain part                                                             | Refused (not an email); no identity created (entry) / no sign-in (sign-in)                                                                                                                                                                                                     | unit                     |
| REQ-04 | `platform_admin` lists factory identities and finds by name or email                                                          | PRD `REQ-04`, `CAP-01`                | `platform_admin` searches the entered list                                                                         | Identities whose name contains the query (case-insensitive) or whose email equals the query (case-insensitive exact) are shown; no match is an empty result, not an error                                                                                                      | live verify / inspection |
| REQ-05 | Entering a human creates `tenant_admin`, never `platform_admin`                                                               | PRD `REQ-05`, `CAP-01`                | Identity entry succeeds                                                                                            | New identity cannot perform `platform_admin` acts; seeded `platform_admin` is unchanged                                                                                                                                                                                        | unit / live verify       |
| REQ-06 | `platform_admin` grants an existing factory identity entry to a programme; no new login or password                           | PRD `REQ-06`, `CAP-02`; OQ-03 default | Identity exists; programme exists; identity is not the seeded `platform_admin`; not already granted that programme | Identity may enter that programme after sign-in; no new login is created; password is not collected. Grant of the seeded `platform_admin` email as `tenant_admin` is refused / not grantable                                                                                   | unit / live verify       |
| REQ-07 | Repeat grant of the same identity to the same programme is idempotent                                                         | PRD `REQ-07`, `CAP-02`                | Repeat grant                                                                                                       | Success; still one grant; identity unchanged                                                                                                                                                                                                                                   | unit                     |
| REQ-08 | An identity that has not been entered cannot be granted                                                                       | PRD `REQ-08`, `CAP-02`                | Grant names an email/identity not on the factory list                                                              | Refused (unknown identity); no grant                                                                                                                                                                                                                                           | unit / live verify       |
| REQ-09 | One identity may be granted more than one programme                                                                           | PRD `REQ-09`, `CAP-02`                | Grant the same identity a second programme                                                                         | Both grants exist; one email; one password; they can enter either programme                                                                                                                                                                                                    | unit / live verify       |
| REQ-10 | `platform_admin` detaches an identity from a programme                                                                        | PRD `REQ-10`, `CAP-02`                | Detach of an existing grant                                                                                        | That grant is gone; identity remains; other grants remain; programme remains (not a wipe)                                                                                                                                                                                      | unit / live verify       |
| REQ-11 | `platform_admin` sees who can enter a programme and which programmes an identity can enter, without opening a delivery screen | PRD `REQ-11`, `CAP-02`                | `platform_admin` opens identity or programme membership                                                            | Membership is visible as identities ↔ programmes; passwords are not shown (REQ-30)                                                                                                                                                                                             | live verify / inspection |
| REQ-12 | Suspended identity cannot sign in and cannot continue product acts, including reads                                           | PRD `REQ-12`, `CAP-03`                | `platform_admin` suspends an identity                                                                              | Sign-in refused (suspended); any current sign-in cannot continue any product act, including reads; grants unchanged                                                                                                                                                            | unit / live verify       |
| REQ-13 | Unsuspend restores sign-in; grants unchanged                                                                                  | PRD `REQ-13`, `CAP-03`                | `platform_admin` unsuspends                                                                                        | Identity can sign in and work every programme they are still granted                                                                                                                                                                                                           | unit / live verify       |
| REQ-14 | `platform_admin` sets a new password; previous sign-in stops                                                                  | PRD `REQ-14`, `CAP-03`                | Password set for that identity                                                                                     | They can sign in only with the new password; prior sign-in cannot continue                                                                                                                                                                                                     | unit / live verify       |
| REQ-15 | Detach or suspend does not cancel in-flight waves                                                                             | PRD `REQ-15`, `CAP-03`                | Detach or suspend while a wave is in flight on that programme’s repo                                               | In-flight wave continues; that identity cannot start or authorize further work (detach: in that programme; suspend: anywhere). After detach, that programme is not enterable (reads included). After suspend, an open sign-in cannot continue any product act, including reads | unit / live verify       |
| REQ-16 | After one sign-in, a `tenant_admin` sees only granted programmes and reaches delivery by entering one                         | PRD `REQ-16`, `CAP-04`; IM-01 default | Sign-in with at least one grant                                                                                    | They include repos, run waves, and look at metrics in the entered programme; they cannot enter a programme they were not granted (not granted). Programme entry is authorization, not a second login                                                                           | live verify              |
| REQ-17 | The same identity can run delivery in two granted programmes                                                                  | PRD `REQ-17`, `CAP-04`                | Identity is granted two programmes with different repos                                                            | They can start work in both; existing **one active wave per repo** still holds                                                                                                                                                                                                 | live verify              |
| REQ-18 | A signed-in identity with zero programmes cannot run delivery                                                                 | PRD `REQ-18`, `CAP-04`                | Sign-in with no programme grant                                                                                    | They are signed in; a named empty state shows they belong to no programme; no catalogue include, waves, or metrics                                                                                                                                                             | live verify              |
| REQ-19 | Granted `tenant_admin` keeps 013/016 delivery in the entered programme; teammate-invite is absent                             | PRD `REQ-19`, `CAP-04`                | Granted identity enters that programme                                                                             | Catalogue include, waves, metrics, board, and scorecard succeed as in 016; no invite / teammate-attach control is present                                                                                                                                                      | live verify / inspection |
| REQ-20 | There is no invite act in this console                                                                                        | PRD `REQ-20`, `CAP-05`; IM-02 default | Any actor looks for or attempts invite / historic teammate-attach (including 016 tenant invite)                    | Act is gone; no membership created that way; 016 invite UI and BFF are purged                                                                                                                                                                                                  | live verify / inspection |
| REQ-21 | Membership is not created by minting a login bound to one programme in the same act                                           | PRD `REQ-21`, `CAP-05`                | Actor attempts 014-style create+bind (including 016 CAP-P attach with new credential + password as grant)          | Refused or impossible; identity entry and grant remain separate; that attach path is gone                                                                                                                                                                                      | unit / live verify       |
| REQ-22 | `tenant_admin` cannot enter identities, grant, detach, suspend, or set password                                               | PRD `REQ-22`, `CAP-05`                | `tenant_admin` attempts those acts                                                                                 | Refused (wrong actor); 0 state change; factory identity list is not shown                                                                                                                                                                                                      | unit / live verify       |
| REQ-23 | `platform_admin` cannot include repos, start or authorize waves, or operate programme metrics                                 | PRD `REQ-23`, `CAP-05`                | `platform_admin` attempts those acts                                                                               | Refused (wrong actor); 0 state change                                                                                                                                                                                                                                          | unit / live verify       |
| REQ-24 | A suspended identity may still be granted or detached                                                                         | PRD `REQ-24`, `CAP-02`                | Grant or detach while suspended                                                                                    | Membership changes; they still cannot sign in until unsuspended                                                                                                                                                                                                                | unit                     |
| REQ-25 | Name is required at identity entry and is shown on the factory list                                                           | PRD `REQ-25`, `CAP-01`                | Entry without a name                                                                                               | Refused (missing name); no identity                                                                                                                                                                                                                                            | unit                     |
| REQ-26 | `tenant_admin` does not see other identities or the factory identity list                                                     | PRD `REQ-26`, `CAP-04`                | Signed-in `tenant_admin` opens delivery                                                                            | No factory identity list; no roster of other identities on the programme                                                                                                                                                                                                       | live verify / inspection |
| REQ-27 | `platform_admin` still onboards a programme and its meta repo, stores the parsed catalogue, and can show that catalogue       | PRD `REQ-27`, `CAP-06`                | Programme onboard by `platform_admin`                                                                              | Catalogue is visible to `platform_admin`; include-into-delivery remains a `tenant_admin` act after grant (REQ-19). Existing 016 CAP-P list/create/detail/catalogue-refresh behavior is kept (no `workspace_root` / `meta_ref` on create)                                       | live verify / inspection |
| REQ-28 | Grant or detach naming a programme that is not onboarded is refused                                                           | PRD `REQ-28`, `CAP-02`                | Grant or detach names a programme that does not exist                                                              | Refused (unknown programme); 0 membership change                                                                                                                                                                                                                               | unit / live verify       |
| REQ-29 | Entry without a password is refused                                                                                           | PRD `REQ-29`, `CAP-01`                | Entry without a password                                                                                           | Refused (missing password); no identity                                                                                                                                                                                                                                        | unit                     |
| REQ-30 | After set, password is never returned on list, search, or membership views                                                    | PRD `REQ-30`, `CAP-01`                | `platform_admin` lists, searches, or views membership                                                              | Password is not shown or returned in console JSON or UI                                                                                                                                                                                                                        | live verify / inspection |

> **Id convention:** `REQ-*` is canonical (`prayog-skills/references/id-conventions.md`).
> This slice uses PRD numbers `REQ-01`–`REQ-30` (no wave-scoped `REQ-W*` ids).
>
> **Behavioral acceptance vs evidence:** Condition/event + observable result are
> the product acceptance statement (implementation-neutral). Evidence layer
> names how it will be proved later — not the implementation design.
>
> **Named refusal reasons** (PRD §9): duplicate email, unknown identity, unknown
> programme, not granted, suspended, wrong actor, missing name, missing
> password, not an email.

**Cross-cutting product rules:**

- Nomenclature: say `platform_admin`, `tenant_admin`, identity, human,
  programme. Do not present “invite” as a product act.
- Primary chrome is filtered by JWT role: `platform_admin` sees identity,
  grant/membership, and programme-onboard surfaces — not delivery.
  `tenant_admin` sees granted-programme entry and 016 delivery (minus invite)
  — not the factory identity list (REQ-22, REQ-23, REQ-26).
- Sign-in is one identity login; entering a granted programme is authorization,
  not a second password (IM-01 product default). Token/session schema is
  technical review (Q-1).
- Password is write-only after set (REQ-30). Grant does not collect a password
  (REQ-06).
- GitHub remains outbound links only — no direct GitHub write from this portal.

## Negative and failure paths

| REQ                     | Condition                                                       | Required behavior                                                                                               | Why it matters                                                        | Evidence                 |
| ----------------------- | --------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------- | ------------------------ |
| REQ-02                  | Duplicate email                                                 | Refuse (duplicate email); existing identity untouched                                                           | Two logins for one human is the failure mode this INIT exists to stop | unit / live verify       |
| REQ-03                  | Identifier is empty, has no `@`, or has no domain part          | Refuse (not an email)                                                                                           | Login is email (Lock 3)                                               | unit                     |
| REQ-05                  | Entry succeeds                                                  | New identity cannot perform `platform_admin` acts; seeded `platform_admin` unchanged                            | Entering a human is not `platform_admin` (Lock 2)                     | unit / live verify       |
| REQ-06                  | Grant of seeded `platform_admin` email as `tenant_admin`        | Refuse / not grantable                                                                                          | OQ-03 default; entering a human creates `tenant_admin` only           | unit / live verify       |
| REQ-08                  | Grant of unknown identity                                       | Refuse (unknown identity)                                                                                       | Enter-then-grant; no silent create                                    | unit / live verify       |
| REQ-10                  | Detach last programme                                           | Identity remains; zero programmes; they can still sign in (unless suspended)                                    | Identity ≠ grant                                                      | live verify              |
| REQ-12                  | Suspend while a sign-in is open                                 | Current sign-in cannot continue any product act, including reads                                                | “Cannot sign in” is not enough if the tab stays live                  | live verify              |
| REQ-14                  | Password set while a sign-in is open                            | Prior sign-in unusable; new password only                                                                       | Support reset must kill the old session                               | live verify              |
| REQ-15                  | Detach during an in-flight wave                                 | Wave continues; they cannot start/authorize in that programme; that programme is not enterable (reads included) | Waves belong to the programme/repo, not the identity                  | live verify              |
| REQ-16                  | Enter a programme they were not granted                         | Refused (not granted) / not available                                                                           | Grant is the gate                                                     | live verify              |
| REQ-18                  | Zero programmes                                                 | Signed in; named empty state; no delivery                                                                       | Entry-without-programme is real                                       | live verify              |
| REQ-20                  | Invite / teammate-attach                                        | Gone; 0 membership change                                                                                       | Lock 8; 016 invite must not remain a second membership story          | live verify / inspection |
| REQ-21                  | Create+bind / CAP-P attach with new login as grant              | Gone                                                                                                            | Lock 5; kill line                                                     | live verify / inspection |
| REQ-22                  | `tenant_admin` grants entry or opens factory list               | Refuse (wrong actor); list not shown                                                                            | Lock 1                                                                | unit / live verify       |
| REQ-23                  | `platform_admin` runs delivery                                  | Refuse (wrong actor)                                                                                            | Role split                                                            | unit / live verify       |
| REQ-24                  | Grant or detach while suspended                                 | Membership changes; they still cannot sign in                                                                   | Suspend is not a membership freeze                                    | unit                     |
| REQ-25                  | Entry without a name                                            | Refuse (missing name); no identity                                                                              | Name is required                                                      | unit                     |
| REQ-26                  | `tenant_admin` looks for other identities                       | Not shown                                                                                                       | Lock 15                                                               | live verify / inspection |
| REQ-28                  | Grant or detach of a programme that is not onboarded            | Refuse (unknown programme); 0 membership change                                                                 | Programme must exist before grant                                     | unit / live verify       |
| REQ-29                  | Entry without a password                                        | Refuse (missing password); no identity                                                                          | Password is required at entry                                         | unit                     |
| REQ-30                  | List, search, or membership view returns or displays a password | Not shown; 0 leak                                                                                               | Password is write-only after set                                      | live verify / inspection |
| All identity/grant acts | Non-`platform_admin` caller                                     | Refused (wrong actor / 403); 0 state change                                                                     | Prevents role leakage                                                 | unit / live verify       |
| Sign-in                 | Invalid credentials                                             | Refused; no session                                                                                             | Prevents unauthorized entry                                           | live verify              |

## Out of scope for this repo

- Identity, grant, session, and fail-closed **provider** APIs — `drivestream-lab/gateflow` (map §2 / §7)
- Leftover 014 bind-row wipe in a lab database (PRD OQ-01 — gateflow)
- Delete identity; change email after entry; self-serve password
- Extra programme roles beyond `tenant_admin`; a separate IdP/SSO
- Rewriting 016 Mission Control delivery except removing invite and replacing create+bind attach
- Programme wipe / un-onboard (stays the existing 014 wipe act; not a console surface this INIT)
- `platform_admin` including repos, starting or authorizing waves, or operating programme metrics
- Encrypting stored secrets
- A company people directory product
- 014 / 016 **PRD document** follow-ons (OQ-02, OQ-04) — PM `/update-documents` later
- `prayog-skills` / Launchpad pin or CLI changes (map §5)

## Cross-service contracts

Consumer of CTR-01–04. Concrete HTTP paths for new identity/grant operations are
**not** chosen here — they land in technical review after gateflow publishes
them. Login is an existing approved boundary (changed semantics).

| Contract ID | Provider / owner | Consumer / owner  | Entry point                                                                                          | Input shape                                                                           | Output shape                                                                                                                          | Invariants                                                                                                                                                                   | Errors                                                                                                    | Compatibility / versioning                                       | Contract-test location           |
| ----------- | ---------------- | ----------------- | ---------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------- | -------------------------------- |
| CTR-01      | gateflow / PE    | gateflow-ops / PE | Enter identity; list/search identities; suspend; unsuspend; set password                             | Identity: name, email (login), password (write-only), suspended or not                | Factory list/search (name, email, role `tenant_admin`, suspended); entry ack; suspend/unsuspend/password-set ack — **never** password | Email unique. Entry does not create a programme grant. Entry is not `platform_admin`. Password never read back (REQ-30)                                                      | Duplicate email; not an email; missing name; missing password; actor is not `platform_admin`              | **new**                                                          | unit (strip/shape) + live verify |
| CTR-02      | gateflow / PE    | gateflow-ops / PE | Grant programme entry; detach; list who can enter a programme; list programmes an identity can enter | Grant: this identity may enter this programme as `tenant_admin`. No password on grant | Membership identities ↔ programmes; grant/detach ack                                                                                  | Identity must already exist. Grant does not set password. Many grants per identity. Detach is not programme wipe. Seeded `platform_admin` is not grantable as `tenant_admin` | Unknown identity; unknown programme; actor is not `platform_admin`; seeded `platform_admin` not grantable | **new** — replaces 014 create+bind / 016 CAP-P attach            | unit + live verify               |
| CTR-03      | gateflow / PE    | gateflow-ops / PE | Sign-in                                                                                              | Email + password → a current sign-in as that identity                                 | Session established for that identity (httpOnly cookie chassis remains); no password returned                                         | Suspended identity cannot obtain a sign-in. After suspend, an open sign-in cannot continue any product act, including reads. After password set, prior sign-in is unusable   | Invalid credentials; suspended; not an email                                                              | **changed** vs 014 login (email unique; not programme-bound 1:1) | unit + live verify               |
| CTR-04      | gateflow / PE    | gateflow-ops / PE | Resolve which programmes this sign-in may enter; enter one granted programme                         | Only grants of the signed-in identity                                                 | Granted-programme list; entered-programme delivery context                                                                            | `platform_admin` sign-in does not become delivery. `tenant_admin` cannot enter a non-granted programme. `tenant_admin` does not receive the factory identity list            | Not granted; wrong actor for the act                                                                      | **new**                                                          | live verify                      |

> Entry point is a **semantic** boundary: name the logical operation and field
> meaning. Transport, framework, and module realization belong to technical
> review — not this table.

## Non-functional requirements

Every row is required. Use N/A only with a concrete reason.

| Area                      | Requirement or N/A rationale                                                                                                                                                                                                                                                           | Acceptance / evidence                                      |
| ------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------- |
| Security                  | Only `platform_admin` performs identity and grant acts (REQ-22). Delivery stays `tenant_admin` (REQ-23). Password is never shown after set (REQ-30). Suspend and password-set end the prior sign-in (REQ-12, REQ-14). Session cookie stays httpOnly; upstream token only on server BFF | inspection + live verify; route audit                      |
| Reliability               | Membership change must not cancel in-flight waves (REQ-15). Enter/grant/detach either take effect or refuse with a named reason; no half-created identity (REQ-02, REQ-08, REQ-28, REQ-29). Upstream structured errors surfaced; empty ≠ hard error                                    | live verify negative paths                                 |
| Performance / capacity    | N/A — lab-scale identity list; no programme volume target this INIT                                                                                                                                                                                                                    | N/A — revisit if list sizes force pagination product rules |
| Observability             | Named refusal reasons for duplicate email, unknown identity, unknown programme, not granted, suspended, wrong actor, missing name, missing password, not an email. Follow existing portal BFF logging for upstream calls/failures                                                      | inspection / live verify                                   |
| Privacy / data handling   | Name and email are factory identity. Password is write-only after set (REQ-30). `tenant_admin` does not see other identities (REQ-26). BFF must not forward password fields to the browser                                                                                             | inspection + unit                                          |
| Migration / compatibility | 014 create+bind attach and 016 invite are not product paths (REQ-20, REQ-21). No dual-model. Chassis login/session retained. 016 delivery screens remain except invite                                                                                                                 | as-built update per wave; live verify purge                |
| Rollback / recovery       | Unsuspend reverses suspend. Detach reverses grant. Password-set cannot restore the old password (`platform_admin` sets a new one). No delete-identity this INIT. UI/BFF-only rollback = revert app release                                                                             | ops note                                                   |
| Operations / support      | `platform_admin` enters humans and grants entry in the console. Support path for a locked-out `tenant_admin` is `platform_admin`-set password or unsuspend, not self-serve                                                                                                             | live verify                                                |

## Assumptions

| ID  | Assumption                                                                                                                                 | Evidence                       | Owner | Status                     | Invalidated when                                                                    |
| --- | ------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------ | ----- | -------------------------- | ----------------------------------------------------------------------------------- |
| A-1 | Programme onboard from meta, catalogue parse/store/show, and `platform_admin` seeing that catalogue stay as they are except identity/grant | PRD A1; 016 CAP-P as-built     | PE    | confirmed (PRD + as-built) | This INIT redesigns programme create                                                |
| A-2 | One active wave per repo remains true and is not reopened here                                                                             | PRD A2                         | PE    | confirmed (PRD)            | Delivery concurrency is a different INIT                                            |
| A-3 | Seeded `platform_admin` remains the only factory-admin creation path                                                                       | PRD A3 / OQ-03                 | PE    | confirmed (PRD)            | Product allows entering a `platform_admin` or granting that email as `tenant_admin` |
| A-4 | Name is a display label, not unique                                                                                                        | PRD A4                         | PE    | confirmed (PRD)            | Unique names are required                                                           |
| A-5 | Kill line: do not ship identity/grant screens while gateflow still creates membership via 014 create+bind                                  | PRD A5; map §7                 | PE    | confirmed (PRD)            | Screens ship against 1:1 bind                                                       |
| A-6 | Enter-then-grant is acceptable `platform_admin` cost (extra step vs 014 one-call)                                                          | PRD A6                         | PE    | confirmed (PRD)            | Product collapses grant back into create                                            |
| A-7 | Chassis httpOnly session → server-only upstream token remains the auth path for this portal                                                | as-built + `lib/auth*`         | PE    | confirmed (code)           | Auth chassis redesign                                                               |
| A-8 | 016 delivery (fleet, waves, initiatives, metrics, checkpoints, board) stays live except invite purge and attach replacement                | as-built implementation-status | PE    | confirmed (as-built)       | 016 delivery is rewritten this INIT                                                 |

## Spec questions (ambiguities — need PM or domain confirmation before feasibility)

| ID  | Lane | Question                                                                                                             | Owner         | Blocking | Required by                | Default if deferred                                                                                  | Status | Resolution link  |
| --- | ---- | -------------------------------------------------------------------------------------------------------------------- | ------------- | -------- | -------------------------- | ---------------------------------------------------------------------------------------------------- | ------ | ---------------- |
| Q-1 | PE   | Session vs 014 programme-bound JWT: how the console holds “entered programme” after one identity sign-in (CTR-03/04) | PE            | no       | technical review           | Product: one identity sign-in; programme is authorization, not a second login. Schema is engineering | open   | Impact-Map IM-01 |
| Q-2 | PE   | Wave split: gateflow API waves vs this console’s waves, given kill line (no identity screens on 1:1 bind)            | PE            | no       | `spec-implementation-plan` | Sequential: gateflow enter+grant live, then console screens                                          | open   | Impact-Map IM-03 |
| Q-3 | PE   | Leftover 014 bind rows in a lab database                                                                             | PE (gateflow) | no       | gateflow cutover           | Wipe leftover bind rows; no dual model; this console must not expose create+bind attach (REQ-21)     | open   | PRD OQ-01        |
| Q-4 | PM   | After this INIT is promoted, 016 invite stories in meta PRD / this repo’s 016 spec need a document update            | PM            | no       | later                      | Track as follow-on `/update-documents`; 017 product truth is “no invite” (REQ-20)                    | open   | PRD OQ-02        |
| Q-5 | PE   | Exact BFF path layout under `app/api/<upstream>/…` for CTR-01–04                                                     | PE            | no       | technical review           | Follow repo BFF-by-upstream-service rule; name modules in TDD                                        | open   | pending TDD      |

## Draft check summary (D1–D12)

| Check                         | Status | Evidence / findings                                                                                                                                                                                                                                                                                                |
| ----------------------------- | ------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| D1 Approved handoff current   | PASS   | Meta PR #42 merged; head `601b00e0…` = APPROVED review `commit_id`; review body cites map_revision 1, matching PRD digest, artifact path; H1 recomputed `sha256:c0fe5504…` matches; H3 rev 1; H2 scope digest present; repo `affected` not deferred/blocked; label `impact-map-lgtm` agrees with review + artifact |
| D2 Complete PRD traceability  | PASS   | CAP-01–06 / PRD REQ-01–30 each map to this slice REQ-01–30; every row cites PRD `REQ-*` / `CAP-*`                                                                                                                                                                                                                  |
| D3 Repo-bounded scope         | PASS   | Matches map §2 gateflow-ops scope digest; out-of-scope names gateflow provider, wipe, SSO, 016 rewrite except invite/attach                                                                                                                                                                                        |
| D4 Observable acceptance      | PASS   | Each REQ has condition, observable result, evidence layer; no module/transport/ADR choice in acceptance                                                                                                                                                                                                            |
| D5 Negative/failure paths     | PASS   | Table covers PRD §7 plus attach/invite purge and seeded-`platform_admin` grant refuse; each row states why it matters                                                                                                                                                                                              |
| D6 Assumptions/questions      | PASS   | A-1–A-8; Q-1–Q-5 non-blocking with defaults; OQ-03 written into REQ-06                                                                                                                                                                                                                                             |
| D7 Cross-repository contracts | PASS   | CTR-01–04 semantic consumer contracts; login cited as existing changed boundary; new identity/grant paths not invented                                                                                                                                                                                             |
| D8 NFR applicability          | PASS   | All eight rows filled or N/A with reason                                                                                                                                                                                                                                                                           |
| D9 As-built alignment         | PASS   | **Existing:** 016 delivery, CAP-P onboard/catalogue, login chassis, role nav. **Changed:** login 1:1 bind → identity sign-in + enter programme; purge invite UI; replace CAP-P attach. **New:** factory identities, grant/detach, who-can-enter, suspend/unsuspend, set password, zero-programme empty state       |
| D10 Dependency order          | PASS   | Map §7: gateflow (CTR-01–04 provider) → gateflow-ops; kill line recorded (A-5). Q-2 defers wave split to plan                                                                                                                                                                                                      |
| D11 Zero unresolved blockers  | PASS   | No blocking PM/PE/domain question; IM-01–03 and OQ-01/OQ-03 defaults encoded                                                                                                                                                                                                                                       |
| D12 Output completeness       | PASS   | Header H1–H4/G1, tables, checks, outcome, PR readiness, unsigned dev-review present                                                                                                                                                                                                                                |

**Draft verdict:** PASS

**Selected workflow outcome:** `pass`
**Outcome reason:** D1–D12 PASS, zero unresolved material questions, Gate 1 identities current, PR READY package filled for `spec-pr-action`.

Do not advance to `/initiative-feasibility` unless the workflow outcome is
`pass`, the draft verdict is PASS, and the developer review below is complete.

## PR readiness handoff

| Item                          | Value                                                                                                                                        |
| ----------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------- |
| Workflow outcome              | `pass` — Gate 1 current; D1–D12 PASS; zero blockers                                                                                          |
| Verdict                       | PR READY                                                                                                                                     |
| Existing spec PR              | none                                                                                                                                         |
| Proposed branch               | `chore/INIT-GATEFLOW-017-spec-gateflow-ops`                                                                                                  |
| Proposed base                 | `develop`                                                                                                                                    |
| Proposed title                | `[INIT-GATEFLOW-017] Spec — gateflow-ops`                                                                                                    |
| PR type                       | **Draft** (entire spec lifecycle)                                                                                                            |
| Local artifacts to publish    | `docs/specification/product/INIT-GATEFLOW-017-gateflow-ops.md`, `docs/specification/product/README.md`                                       |
| Forge readiness               | fill `handoff.forge` for `open_draft_pr`; recommend `/commit-workspace` then `/open-draft-pr` — do not commit/push/open PR inside this skill |
| Reviewer                      | @drivestream-lab/prayog-pe-team                                                                                                              |
| Initial Gate 2 label          | `spec-pending`                                                                                                                               |
| Additional invalidation label | none                                                                                                                                         |
| Blocking items                | none                                                                                                                                         |

**No GitHub side effects have occurred.** Persist the draft locally, present
this section in chat, and ask whether to authorize Forge publish
(`/commit-workspace` / `/open-draft-pr` or Gateflow ForgeClient). Continue only
after explicit authorization.

### Proposed Draft PR body

```markdown
## Initiative

INIT-GATEFLOW-017 — One human, many programmes, one login (gateflow-ops console)

## Meta handoff

- Meta PRD PR: https://github.com/drivestream-lab/prayog-meta/pull/42
- Approved meta head: `601b00e0a74510a6af1c33bc80ca27260995c094`
- Impact-map revision: 1
- PRD digest: `sha256:c0fe55040928a13976133edde5cf71f0524815c17c0a8de79173ed3fa0657f67`
- Repo scope digest: `sha256:13cee9aae41718fd4ad8655d77738042761b0e45db7eefc898a693c42c2fb987`

## Spec path

`docs/specification/product/INIT-GATEFLOW-017-gateflow-ops.md`

## Summary

- 30 REQs (CAP-01–06) — console/BFF consumer of gateflow CTR-01–04
- Purge 016 invite; replace 014/016 create+bind attach with enter-then-grant
- Keep 016 delivery (minus invite) and CAP-P programme onboard/catalogue
- Open engineering questions: Q-1–Q-5 (non-blocking; Q-1 session schema for TDD)

## Gate 2 — spec package readiness

Initial label: `spec-pending`

- [ ] Spec slice published on this PR head (via Forge `/commit-workspace` / `/open-draft-pr`)
- [ ] Feasibility report (later Forge publish)
- [ ] Technical design + ADRs (later Forge publish)
- [ ] Implementation plan §9 (later Forge publish)
- [ ] PE sets `spec-lgtm` on exact final head before merge

Requested reviewer: @drivestream-lab/prayog-pe-team
```

## Developer review

- [ ] Scope matches the approved impact-map repo scope digest
- [ ] REQs have condition/event, observable result, and evidence layer
- [ ] Contracts are semantic (logical operation); no architecture decisions in REQs
- [ ] No blocking question remains
- [ ] Developer confirmed draft is ready for feasibility

## After Draft PR creation

PE controls Gate 2 labels on the spec PR. Never infer approval from labels
alone — `spec-lgtm` requires matching artifacts on the exact PR head.

Provision labels before PR creation when missing:

```bash
launchpad apply-gates --repo gateflow-ops --apply
```

| PE action            | Remove                                                       | Add            |
| -------------------- | ------------------------------------------------------------ | -------------- |
| Pending/new revision | `spec-lgtm`, `spec-blocked`                                  | `spec-pending` |
| Request changes/hold | `spec-pending`, `spec-lgtm`                                  | `spec-blocked` |
| Approve full package | `spec-pending`, `spec-blocked`, `spec-revised`, `spec-stale` | `spec-lgtm`    |

## References

- PRD: `prayog-meta/prd/INIT-GATEFLOW-017.md`
- Meta PRD PR: https://github.com/drivestream-lab/prayog-meta/pull/42
- Spec PR: pending Forge
- Impact map: `prayog-meta/prd/reports/Impact-Map-INIT-GATEFLOW-017.md`
- Service profile: not present (`docs/specification/product/00-service-profile.md`)
- As-built: `docs/specification/as-built/implementation-status.md`
- Prior slice: `docs/specification/product/INIT-GATEFLOW-016-gateflow-ops.md`
- ADR-001 (Accepted): `docs/specification/adr/adr-001-ui-primitives-shadcn-semantic-tokens.md`

---

```yaml
handoff:
  contract: sdd-delivery/v2
  stage: spec-draft
  outcome: pass
  artifact:
    path: docs/specification/product/INIT-GATEFLOW-017-gateflow-ops.md
  blockers: []
  signals:
    pr_ready: true
    initiative: INIT-GATEFLOW-017
    meta_pr: https://github.com/drivestream-lab/prayog-meta/pull/42
    meta_pr_head: 601b00e0a74510a6af1c33bc80ca27260995c094
    map_revision: 1
    source_prd_digest: sha256:c0fe55040928a13976133edde5cf71f0524815c17c0a8de79173ed3fa0657f67
    scope_digest: sha256:13cee9aae41718fd4ad8655d77738042761b0e45db7eefc898a693c42c2fb987
    codegraph_provider: mcp-user-prayog-fleet-cbm
    grounding_depth: light
  next_candidates:
    - spec-pr-action
  human_checkpoint: false
  external_action: true
  forge:
    action: open_draft_pr
    draft: true
    apply_labels:
      - spec-pending
    title: "[INIT-GATEFLOW-017] Spec — gateflow-ops"
    body_path: docs/specification/product/INIT-GATEFLOW-017-gateflow-ops.md
```
