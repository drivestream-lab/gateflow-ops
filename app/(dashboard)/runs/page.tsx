import { redirect } from "next/navigation";
import { PageHeader } from "@/components/workspace/page-header";
import { PageBody } from "@/components/workspace/page-body";
import { RunCockpit } from "@/components/runs/run-cockpit";
import { getSession } from "@/lib/auth";
import { isTenantAdmin } from "@/lib/session-role";
import { t } from "@/lib/i18n";

export default async function RunsPage() {
  const session = await getSession();
  if (!isTenantAdmin(session) || !session?.tenant_id) {
    redirect("/");
  }

  return (
    <>
      <PageHeader title={t("runs.page.title")} description={t("runs.page.description")} />
      <PageBody>
        <RunCockpit />
      </PageBody>
    </>
  );
}
