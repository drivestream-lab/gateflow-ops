import { redirect } from "next/navigation";
import { PageHeader } from "@/components/workspace/page-header";
import { PageBody } from "@/components/workspace/page-body";
import { TenantDetail } from "@/components/tenant/tenant-detail";
import { getSession } from "@/lib/auth";
import { isTenantAdmin } from "@/lib/session-role";
import { t } from "@/lib/i18n";

export default async function TenantPage() {
  const session = await getSession();
  if (!isTenantAdmin(session) || !session?.tenant_id) {
    redirect("/");
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
