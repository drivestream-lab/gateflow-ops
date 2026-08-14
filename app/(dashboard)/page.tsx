// Hub-style system status — WorkspaceShell slots only (workspace-layout.md).
import { getSession } from "@/lib/auth";
import { Card } from "@/components/ui/card";
import { UpstreamStatus } from "@/components/system/upstream-status";
import { PageHeader } from "@/components/workspace/page-header";
import { PageBody } from "@/components/workspace/page-body";
import { t } from "@/lib/i18n";
import { getEnteredProgrammeContext } from "@/lib/programme-context";
import { sessionDisplayName, sessionRoleLabel } from "@/lib/session-display";

export default async function SystemStatusPage() {
  const session = await getSession();
  const entered = await getEnteredProgrammeContext();
  const expires = session?.exp ? new Date(session.exp * 1000).toLocaleTimeString() : "—";
  const operator = sessionDisplayName(session);
  const role = sessionRoleLabel(session);
  const tenant = entered?.tenantId ?? null;

  return (
    <>
      <PageHeader title={t("system.status.title")} description={t("system.status.description")} />
      <PageBody>
        <Card className="max-w-2xl">
          <dl className="grid grid-cols-[10rem_1fr] gap-x-4 gap-y-3 text-sm">
            <dt className="text-muted-foreground">{t("system.status.operator")}</dt>
            <dd className="min-w-0 break-all font-mono text-xs">{operator}</dd>

            <dt className="text-muted-foreground">{t("system.status.role")}</dt>
            <dd>{role ?? t("system.status.valueMissing")}</dd>

            <dt className="text-muted-foreground">{t("system.status.tenant")}</dt>
            <dd className="min-w-0 break-all font-mono text-xs">
              {tenant ?? t("system.status.valueMissing")}
            </dd>

            <dt className="text-muted-foreground">{t("system.status.session")}</dt>
            <dd>
              {t("system.status.sessionKind")} · {t("system.status.sessionExpires")} {expires}
            </dd>

            <dt className="text-muted-foreground">{t("system.status.upstream")}</dt>
            <dd>
              <UpstreamStatus />
            </dd>

            <dt className="text-muted-foreground">{t("system.status.locale")}</dt>
            <dd>{t("system.status.localeValue")}</dd>
          </dl>
        </Card>
      </PageBody>
    </>
  );
}
