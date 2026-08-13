import { redirect } from "next/navigation";
import { PageHeader } from "@/components/workspace/page-header";
import { PageBody } from "@/components/workspace/page-body";
import { CheckpointViews } from "@/components/checkpoints/checkpoint-views";
import { getSession } from "@/lib/auth";
import { isTenantAdmin } from "@/lib/session-role";
import { t } from "@/lib/i18n";

export default async function CheckpointsPage() {
  const session = await getSession();
  if (!isTenantAdmin(session) || !session?.tenant_id) {
    redirect("/");
  }

  return (
    <>
      <PageHeader
        title={t("checkpoints.page.title")}
        description={t("checkpoints.page.description")}
      />
      <PageBody>
        <CheckpointViews />
      </PageBody>
    </>
  );
}
