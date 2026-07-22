import { FlatCompat } from "@eslint/eslintrc";

const compat = new FlatCompat({ baseDirectory: import.meta.dirname });

// Server/client boundary is enforced at BUILD time by the `server-only` package:
// lib/env.ts, lib/auth.ts, lib/logging.ts, lib/bff.ts, lib/upstream-fetch.ts all
// import "server-only" — a client component importing them fails `next build`.
const config = [
  ...compat.extends("next/core-web-vitals", "next/typescript"),
  { ignores: [".next/**", "node_modules/**"] },
];

export default config;
