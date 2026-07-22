// Workspace shell + SERVER-SIDE guard (nextjs-bff-server-auth.mdc: protect
// authenticated areas in layout; client-only guards are never the only gate).
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { LogoutButton } from "@/components/ui/logout-button";
import { t } from "@/lib/i18n";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();
  if (!session) redirect("/login");

  return (
    <div className="min-h-screen">
      <header className="flex items-center justify-between border-b border-ink-muted/20 bg-surface px-6 py-3">
        <span className="font-semibold text-brand">{t("common.app.title")}</span>
        <div className="flex items-center gap-4 text-sm text-ink-muted">
          <span>{String(session.email ?? session.sub)}</span>
          <LogoutButton label={t("common.nav.logout")} />
        </div>
      </header>
      <main className="mx-auto max-w-4xl p-6">{children}</main>
    </div>
  );
}
