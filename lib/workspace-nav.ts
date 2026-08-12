export interface WorkspaceNavItem {
  href: string;
  /** i18n key under workspace namespace (e.g. nav.status) */
  labelKey: string;
}

/** Config-driven primary nav — filter by role later without changing shell. */
export const WORKSPACE_NAV: WorkspaceNavItem[] = [
  { href: "/", labelKey: "nav.status" },
  { href: "/tenant", labelKey: "nav.tenant" },
  { href: "/fleet", labelKey: "nav.fleet" },
];
