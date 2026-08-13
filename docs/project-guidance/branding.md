# Branding — gateflow-ops

Portal color and product-mark conventions. **Mechanism** (shadcn + tokens) is
[ADR-001](../specification/adr/adr-001-ui-primitives-shadcn-semantic-tokens.md).
**Values** live here and in `app/globals.css`.

## Product mark

| Surface             | Treatment                                                 |
| ------------------- | --------------------------------------------------------- |
| Authenticated shell | Sidebar header: `text-accent` + `common.app.title`        |
| Login               | Hero-level product name above the form (same token + key) |
| Browser tab         | Root layout metadata title from `common.app.title`        |

Do not invent a second wordmark component until design supplies assets.

## Color SSOT

| Layer    | Where                                                 | Rule                                                                                                         |
| -------- | ----------------------------------------------------- | ------------------------------------------------------------------------------------------------------------ |
| Palette  | `app/globals.css` `@theme` (`--color-brand`, …)       | Change brand hue here only                                                                                   |
| Semantic | same file (`--color-accent`, `--color-background`, …) | Components use these                                                                                         |
| JSX      | Tailwind semantic utilities                           | `bg-background`, `text-accent`, `border-border`, `text-danger` — **not** `text-brand` / `text-ink` / raw hex |

`Button` already uses `accent` / `primary`. Prefer the same vocabulary everywhere.

## Ops density

Quiet surfaces: `bg-background` app · `bg-surface` panels · one `border-border`.
No marketing gradients or decorative chrome on authenticated pages. Login may
use a plain `bg-background` field with accent product mark only.
