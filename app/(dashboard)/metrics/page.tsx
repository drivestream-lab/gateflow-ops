import { redirect } from "next/navigation";
import { PageHeader } from "@/components/workspace/page-header";
import { PageBody } from "@/components/workspace/page-body";
import { MetricsPanels } from "@/components/metrics/metrics-panels";
import { getSession } from "@/lib/auth";
import { isTenantAdmin } from "@/lib/session-role";
import { t } from "@/lib/i18n";

export default async function MetricsPage() {
  const session = await getSession();
  if (!isTenantAdmin(session) || !session?.tenant_id) {
    redirect("/");
  }

  return (
    <>
      <PageHeader title={t("metrics.page.title")} description={t("metrics.page.description")} />
      <PageBody>
        <MetricsPanels />
      </PageBody>
    </>
  );
}
