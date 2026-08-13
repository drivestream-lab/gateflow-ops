// Minimal i18n (no-hardcoded-strings.mdc): every user-facing string — JSX and
// BFF JSON errors — resolves through t(). Catalogs: data/locales/en/*.json.
// Key shape: namespace.section.element
import common from "@/data/locales/en/common.json";
import auth from "@/data/locales/en/auth.json";
import system from "@/data/locales/en/system.json";
import workspace from "@/data/locales/en/workspace.json";
import tenants from "@/data/locales/en/tenants.json";
import fleet from "@/data/locales/en/fleet.json";
import programmes from "@/data/locales/en/programmes.json";
import runs from "@/data/locales/en/runs.json";

const catalogs: Record<string, Record<string, string>> = {
  common,
  auth,
  system,
  workspace,
  tenants,
  fleet,
  programmes,
  runs,
};

export function t(key: string): string {
  const dot = key.indexOf(".");
  const ns = dot > 0 ? key.slice(0, dot) : "";
  const value = catalogs[ns]?.[key.slice(dot + 1)];
  if (!value) {
    if (process.env.NODE_ENV !== "production") return `⟪missing: ${key}⟫`;
    return key;
  }
  return value;
}

/** Namespace-scoped helper for components. */
export function useTranslation(namespace: string) {
  return { t: (key: string) => t(`${namespace}.${key}`) };
}
