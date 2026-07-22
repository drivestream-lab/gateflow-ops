# gateflow-ops

Gateflow operations console — runs, waves, and delivery status — Next.js BFF portal scaffolded from nextjs-bff-foundation.

## Day one

```bash
npm install
make check && make test     # green immediately
cp .env.example .env        # defaults point upstream at the built-in dev echo
npm run dev                 # default port 3000; if it hops, match UPSTREAM_BASE_URL
```

Sign in with any email/password (AUTH_MODE=dev-stub). The **System status page**
is the hello world — a real authenticated page proving session, BFF round-trip,
design tokens, and i18n in one screen. Full script:
`tests/verify/01-login-status-page.md`.

**Your first two tasks:** point `UPSTREAM_BASE_URL` at the real upstream, and
decide `AUTH_MODE` (dev-stub is NOT for production).

## Layout (nextjs-repository-layout.mdc)

```
app/                  App Router: (auth)/login, (dashboard)/ workspace, api/ BFF
app/api/gateflow/   BFF routes by UPSTREAM SERVICE name — exemplar inside
components/ui         primitives on design tokens · components/<feature> per area
lib/                  auth, auth-fetch, bff, upstream-fetch, env, logging, i18n, constants
data/locales/en/      i18n catalogs — no hardcoded UI strings anywhere
tests/unit | verify   vitest vs live journeys — tests/README.md is the feature map
docs/specification/   product · adr · as-built     docs/project-guidance/  UX patterns
```

## Adding a feature

Spec in `docs/specification/product/` → BFF route copied from the exemplar's
shape → UI under the right route group → catalog strings → feature-map row +
as-built update, all in one PR.
