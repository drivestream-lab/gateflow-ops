"use client";

import { useState } from "react";
import { WorkspaceNav } from "@/components/workspace/workspace-nav";
import { Button } from "@/components/ui/button";
import { useTranslation } from "@/lib/i18n";
import { cn } from "@/lib/utils";

interface WorkspaceShellProps {
  productTitle: string;
  sessionLabel: string;
  sessionRole?: string | null;
  logoutSlot: React.ReactNode;
  children: React.ReactNode;
}

export function WorkspaceShell({
  productTitle,
  sessionLabel,
  sessionRole,
  logoutSlot,
  children,
}: WorkspaceShellProps) {
  const { t } = useTranslation("workspace");
  const [navOpen, setNavOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-background text-foreground">
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-40 flex w-56 flex-col border-r border-border bg-surface transition-transform md:static md:translate-x-0",
          navOpen ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="border-b border-border px-4 py-4">
          <span className="font-semibold text-accent">{productTitle}</span>
        </div>
        <div className="flex-1 overflow-y-auto">
          <WorkspaceNav role={sessionRole} />
        </div>
        <div className="space-y-2 border-t border-border p-4 text-sm text-muted-foreground">
          <p className="truncate" title={sessionLabel}>
            {t("chrome.signedIn")}: <span className="text-foreground">{sessionLabel}</span>
          </p>
          {logoutSlot}
        </div>
      </aside>

      {navOpen ? (
        <button
          type="button"
          className="fixed inset-0 z-30 bg-foreground/20 md:hidden"
          aria-label={t("chrome.menu")}
          onClick={() => setNavOpen(false)}
        />
      ) : null}

      <div className="flex min-w-0 flex-1 flex-col">
        <div className="flex items-center gap-2 border-b border-border px-4 py-2 md:hidden">
          <Button type="button" variant="ghost" size="sm" onClick={() => setNavOpen(true)}>
            {t("chrome.menu")}
          </Button>
          <span className="font-medium text-accent">{productTitle}</span>
        </div>
        <div className="flex min-h-0 flex-1 flex-col">{children}</div>
      </div>
    </div>
  );
}
