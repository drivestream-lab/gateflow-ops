import { redirect } from "next/navigation";
import { PageHeader } from "@/components/workspace/page-header";
import { PageBody } from "@/components/workspace/page-body";
import { TenantDetail } from "@/components/tenant/tenant-detail";
import { getSession } from "@/lib/auth";
import { getEnteredProgrammeContext } from "@/lib/programme-context";
import { isTenantAdmin } from "@/lib/session-role";
import { t } from "@/lib/i18n";

export default async function TenantPage() {
  const session = await getSession();
  const entered = await getEnteredProgrammeContext();
  if (!isTenantAdmin(session) || !entered) {
    redirect(isTenantAdmin(session) ? "/programmes/enter" : "/");
  }

  return (
    <>
      <PageHeader title={t("tenants.page.title")} description={t("tenants.page.description")} />
      <PageBody>
        <TenantDetail />
      </PageBody>
    </>
  );
}
