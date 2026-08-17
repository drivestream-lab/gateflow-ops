export interface WorkspaceNavItem {
  href: string;
  /** i18n key under workspace namespace (e.g. nav.fleet) */
  labelKey: string;
  /** When set, item is shown only for that session role. */
  roles?: Array<"platform_admin" | "tenant_admin">;
  /** Optional group heading key under workspace (e.g. nav.group.delivery). */
  groupKey?: string;
}

/** Config-driven primary nav — filter with `navItemsForRole`.
 * Health, enter, and tenant facts live in chrome — not here. */
export const WORKSPACE_NAV: WorkspaceNavItem[] = [
  { href: "/programmes", labelKey: "nav.programmes", roles: ["platform_admin"] },
  { href: "/identities", labelKey: "nav.identities", roles: ["platform_admin"] },
  {
    href: "/fleet",
    labelKey: "nav.fleet",
    roles: ["tenant_admin"],
    groupKey: "nav.group.delivery",
  },
  {
    href: "/meta-prs",
    labelKey: "nav.metaPrs",
    roles: ["tenant_admin"],
    groupKey: "nav.group.work",
  },
  {
    href: "/spec-lane",
    labelKey: "nav.specLane",
    roles: ["tenant_admin"],
    groupKey: "nav.group.work",
  },
  { href: "/board", labelKey: "nav.board", roles: ["tenant_admin"], groupKey: "nav.group.work" },
  {
    href: "/implement-lane",
    labelKey: "nav.implementLane",
    roles: ["tenant_admin"],
    groupKey: "nav.group.work",
  },
  {
    href: "/closeout-lane",
    labelKey: "nav.closeoutLane",
    roles: ["tenant_admin"],
    groupKey: "nav.group.work",
  },
  {
    href: "/initiative-closure",
    labelKey: "nav.initiativeClosure",
    roles: ["tenant_admin"],
    groupKey: "nav.group.work",
  },
  { href: "/runs", labelKey: "nav.runs", roles: ["tenant_admin"], groupKey: "nav.group.observe" },
  {
    href: "/metrics",
    labelKey: "nav.metrics",
    roles: ["tenant_admin"],
    groupKey: "nav.group.observe",
  },
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
