import { redirect } from "next/navigation";
import { PageHeader } from "@/components/workspace/page-header";
import { PageBody } from "@/components/workspace/page-body";
import { InitiativeHub } from "@/components/initiatives/initiative-hub";
import { getSession } from "@/lib/auth";
import { isTenantAdmin } from "@/lib/session-role";
import { t } from "@/lib/i18n";

export default async function InitiativesPage() {
  const session = await getSession();
  if (!isTenantAdmin(session) || !session?.tenant_id) {
    redirect("/");
  }

  return (
    <>
      <PageHeader
        title={t("initiatives.page.title")}
        description={t("initiatives.page.description")}
      />
      <PageBody>
        <InitiativeHub />
      </PageBody>
    </>
  );
}
