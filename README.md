# gateflow-ops

Gateflow operations console — runs, waves, and delivery status — Next.js BFF portal scaffolded from nextjs-bff-foundation.

## Day one

```bash
npm install
make check && make test     # green immediately
cp .env.example .env        # set UPSTREAM_BASE_URL → live gateflow
npm run dev                 # default port 3000
```

Sign in with gateflow credentials (`AUTH_MODE=jwt-upstream`). The **System status
page** is the hello world — session, BFF probe of gateflow `GET /health`, design
tokens, and i18n in one screen. Full script:
`tests/verify/01-login-status-page.md`.

**Configure:** `UPSTREAM_BASE_URL` must reach gateflow; `AUTH_MODE=dev-stub` is
NOT for production (login only — status always uses `/health`).

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
