# Product specification — gateflow-ops

Source of truth for **what this portal does**. Conventional files
(referenced by the rules — create as the product takes shape):

| File                                                                     | Content                                                                             |
| ------------------------------------------------------------------------ | ----------------------------------------------------------------------------------- |
| `00-service-profile.md`                                                  | Canonical upstream service names (BFF folders match these)                          |
| `02-route-map.md`                                                        | Upstream route catalog; BFF module names derive from it                             |
| `05-frontend-architecture.md`                                            | i18n namespace inventory, route groups                                              |
| `06-logging.md`                                                          | Log modules and env flags                                                           |
| [INIT-GATEFLOW-016-gateflow-ops.md](./INIT-GATEFLOW-016-gateflow-ops.md) | Mission Control v0 — CAP-A–G (Draft — Gate 1 from meta PR #41)                      |
| [INIT-GATEFLOW-017-gateflow-ops.md](./INIT-GATEFLOW-017-gateflow-ops.md) | One human, many programmes, one login — CAP-01–06 (Draft — Gate 1 from meta PR #42) |

Capabilities and INIT slices land here via spec → harness. Decisions with
alternatives → `../adr/`. Live status → `../as-built/`.
