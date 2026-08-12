// Authenticated home — chassis exemplar retained inside WorkspaceShell slots.
import { getSession } from "@/lib/auth";
import { Card } from "@/components/ui/card";
import { UpstreamStatus } from "@/components/system/upstream-status";
import { PageHeader } from "@/components/workspace/page-header";
import { PageBody } from "@/components/workspace/page-body";
import { t } from "@/lib/i18n";

export default async function SystemStatusPage() {
  const session = await getSession();
  const expires = session?.exp ? new Date(session.exp * 1000).toLocaleTimeString() : "—";

  return (
    <>
      <PageHeader
        title={`${t("system.status.welcome")}, ${String(session?.email ?? session?.sub)}`}
      />
      <PageBody>
        <div className="space-y-6">
          <Card>
            <h2 className="mb-4 font-medium text-muted-foreground">{t("system.status.title")}</h2>
            <dl className="grid grid-cols-[12rem_1fr] gap-y-3 text-sm">
              <dt className="text-muted-foreground">{t("system.status.signedInAs")}</dt>
              <dd>{String(session?.email ?? "—")}</dd>

              <dt className="text-muted-foreground">{t("system.status.session")}</dt>
              <dd>
                jwt · {t("system.status.sessionExpires")} {expires}
              </dd>

              <dt className="text-muted-foreground">{t("system.status.upstream")}</dt>
              <dd>
                <UpstreamStatus />
              </dd>

              <dt className="text-muted-foreground">{t("system.status.locale")}</dt>
              <dd>en</dd>
            </dl>
          </Card>
          <p className="text-xs text-muted-foreground">{t("system.status.chassisNote")}</p>
        </div>
      </PageBody>
    </>
  );
}
