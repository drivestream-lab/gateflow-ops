import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  // pino's transports run in worker threads — bundling them breaks the worker's
  // module path (MODULE_NOT_FOUND: vendor-chunks/lib/worker.js). Keep them external.
  serverExternalPackages: ["pino", "pino-pretty"],
};

export default nextConfig;
