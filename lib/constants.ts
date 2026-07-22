// Shared limits (shared-limits-pagination.mdc): list endpoints import these —
// never inline skip/limit numbers in route handlers.
export const PAGINATION = {
  DEFAULT_SKIP: 0,
  DEFAULT_LIMIT: 25,
  MAX_LIMIT: 100,
} as const;
