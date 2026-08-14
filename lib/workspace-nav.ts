export interface WorkspaceNavItem {
  href: string;
  /** i18n key under workspace namespace (e.g. nav.status) */
  labelKey: string;
  /** When set, item is shown only for that session role. */
  roles?: Array<"platform_admin" | "tenant_admin">;
}

/** Config-driven primary nav — filter with `navItemsForRole`.
 * W2 membership chrome lives on programme/identity detail — no extra nav href. */
export const WORKSPACE_NAV: WorkspaceNavItem[] = [
  { href: "/", labelKey: "nav.status" },
  { href: "/programmes", labelKey: "nav.programmes", roles: ["platform_admin"] },
  { href: "/identities", labelKey: "nav.identities", roles: ["platform_admin"] },
  { href: "/tenant", labelKey: "nav.tenant", roles: ["tenant_admin"] },
  { href: "/fleet", labelKey: "nav.fleet", roles: ["tenant_admin"] },
  { href: "/runs", labelKey: "nav.runs", roles: ["tenant_admin"] },
  { href: "/initiatives", labelKey: "nav.initiatives", roles: ["tenant_admin"] },
  { href: "/metrics", labelKey: "nav.metrics", roles: ["tenant_admin"] },
  { href: "/checkpoints", labelKey: "nav.checkpoints", roles: ["tenant_admin"] },
  { href: "/board", labelKey: "nav.board", roles: ["tenant_admin"] },
];

export function navItemsForRole(
  role: string | null | undefined,
  items: WorkspaceNavItem[] = WORKSPACE_NAV,
): WorkspaceNavItem[] {
  const normalized = typeof role === "string" ? role.trim().toLowerCase() : "";
  return items.filter((item) => {
    if (!item.roles || item.roles.length === 0) return true;
    return item.roles.includes(normalized as "platform_admin" | "tenant_admin");
  });
}
