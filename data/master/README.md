# Master data (static form options)

Static JSON used by forms and selects. **Purpose:** keep options out of component
code so they are easy to edit and to replace with API-driven master data later.
(Pattern extracted from drivestream-ops.)

## Contract

Every file is an array of options. Baseline shape:

```json
[{ "value": "string", "label": "string", "description": "optional", "default": false }]
```

- `value` strings follow the **upstream service contract** — keep in sync when the
  API enum changes, and say so in this table.
- At most one row may set `"default": true`.
- Richer shapes are allowed (extra keys) but must be documented here.

## Files

| File                   | Used for                                | Shape notes    |
| ---------------------- | --------------------------------------- | -------------- |
| `example-regions.json` | Example — replace with real master data | baseline shape |

## Migration to API

When master data moves to an API, add BFF routes returning the same shapes
(e.g. `GET /api/master/regions`) and switch the form to fetch from those
endpoints. Only the data source changes as long as the response shape matches
the contract above.
