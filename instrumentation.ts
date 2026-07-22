// Next.js instrumentation hook — ensures the Pino root logger initializes once
// per Node process (nextjs-bff-route-handlers.mdc: Logging).
export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    await import("./lib/logging");
  }
}
