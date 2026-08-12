# ADR template (use Prayog)

Do **not** author ADRs from this stub alone. Copy and fill:

`prayog-skills/skills/development/spec-technical-review/references/adr-template.md`

| Key | Value |
|-----|-------|
| Path | `docs/specification/adr/adr-{NNN}-{slug}.md` |
| Status start | `Draft` |
| One decision | Split files if multiple independent questions |
| Body length | ~150–400 words (Product decisions excluded → Revisit triggers) |
| Product boundary | Cite `REQ-*` by id only; `changes_user_visible_behavior: false` for Accepted |
| Lint | `scripts/adr_boundary_lint.py` before T12 PASS (when initiative sources exist) |

Accepted ADRs are append-only: supersede, never edit in place.
