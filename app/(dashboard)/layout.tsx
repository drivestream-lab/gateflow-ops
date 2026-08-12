// Workspace shell + SERVER-SIDE guard (nextjs-bff-server-auth.mdc: protect
// authenticated areas in layout; client-only guards are never the only gate).
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { LogoutButton } from "@/components/ui/logout-button";
import { WorkspaceShell } from "@/components/workspace/workspace-shell";
import { t } from "@/lib/i18n";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();
  if (!session) redirect("/login");

  return (
    <WorkspaceShell
      productTitle={t("common.app.title")}
      sessionLabel={String(session.email ?? session.sub)}
      logoutSlot={<LogoutButton label={t("common.nav.logout")} />}
    >
      {children}
    </WorkspaceShell>
  );
}
