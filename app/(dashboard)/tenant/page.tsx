import { PageHeader } from "@/components/workspace/page-header";
import { PageBody } from "@/components/workspace/page-body";
import { TenantDetail } from "@/components/tenant/tenant-detail";
import { t } from "@/lib/i18n";

export default function TenantPage() {
  return (
    <>
      <PageHeader title={t("tenants.page.title")} description={t("tenants.page.description")} />
      <PageBody>
        <TenantDetail />
      </PageBody>
    </>
  );
}
