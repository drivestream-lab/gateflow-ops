"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { WORKSPACE_NAV } from "@/lib/workspace-nav";
import { useTranslation } from "@/lib/i18n";
import { cn } from "@/lib/utils";

export function WorkspaceNav() {
  const pathname = usePathname();
  const { t } = useTranslation("workspace");

  return (
    <nav className="flex flex-col gap-1 p-3" aria-label={t("chrome.primaryNav")}>
      {WORKSPACE_NAV.map((item) => {
        const active =
          item.href === "/"
            ? pathname === "/"
            : pathname === item.href || pathname.startsWith(`${item.href}/`);
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "rounded-md px-3 py-2 text-sm transition-colors",
              active
                ? "bg-accent text-accent-foreground font-medium"
                : "text-muted-foreground hover:bg-surface-alt hover:text-foreground",
            )}
          >
            {t(item.labelKey)}
          </Link>
        );
      })}
    </nav>
  );
}
