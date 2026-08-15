"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { navItemsForRole } from "@/lib/workspace-nav";
import { useTranslation } from "@/lib/i18n";
import { cn } from "@/lib/utils";

interface WorkspaceNavProps {
  role?: string | null;
}

export function WorkspaceNav({ role }: WorkspaceNavProps) {
  const pathname = usePathname();
  const { t } = useTranslation("workspace");
  const items = navItemsForRole(role);

  let lastGroup: string | undefined;

  return (
    <nav className="flex flex-col gap-1 p-3" aria-label={t("chrome.primaryNav")}>
      {items.map((item) => {
        const showGroup = item.groupKey && item.groupKey !== lastGroup;
        lastGroup = item.groupKey;
        const active =
          item.href === "/"
            ? pathname === "/"
            : pathname === item.href || pathname.startsWith(`${item.href}/`);
        return (
          <div key={item.href}>
            {showGroup && item.groupKey ? (
              <p className="px-3 pt-3 pb-1 text-xs font-medium tracking-wide text-muted-foreground uppercase">
                {t(item.groupKey)}
              </p>
            ) : null}
            <Link
              href={item.href}
              className={cn(
                "block rounded-md px-3 py-2 text-sm transition-colors",
                active
                  ? "bg-accent text-accent-foreground font-medium"
                  : "text-muted-foreground hover:bg-surface-alt hover:text-foreground",
              )}
            >
              {t(item.labelKey)}
            </Link>
          </div>
        );
      })}
    </nav>
  );
}
