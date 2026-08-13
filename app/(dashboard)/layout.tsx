// Workspace shell + SERVER-SIDE guard (nextjs-bff-server-auth.mdc: protect
// authenticated areas in layout; client-only guards are never the only gate).
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { LogoutButton } from "@/components/ui/logout-button";
import { WorkspaceShell } from "@/components/workspace/workspace-shell";
import { t } from "@/lib/i18n";
import { sessionDisplayName, sessionRoleLabel } from "@/lib/session-display";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();
  if (!session) redirect("/login");

  const name = sessionDisplayName(session);
  const role = sessionRoleLabel(session);
  const sessionLabel = role ? `${role} · ${name}` : name;

  return (
    <WorkspaceShell
      productTitle={t("common.app.title")}
      sessionLabel={sessionLabel}
      sessionRole={role}
      logoutSlot={<LogoutButton label={t("common.nav.logout")} />}
    >
      {children}
    </WorkspaceShell>
  );
}
