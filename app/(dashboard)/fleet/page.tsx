import { redirect } from "next/navigation";
import { PageHeader } from "@/components/workspace/page-header";
import { PageBody } from "@/components/workspace/page-body";
import { OnboardingFlow } from "@/components/fleet/onboarding-flow";
import { getSession } from "@/lib/auth";
import { isTenantAdmin } from "@/lib/session-role";
import { t } from "@/lib/i18n";

export default async function FleetPage() {
  const session = await getSession();
  if (!isTenantAdmin(session) || !session?.tenant_id) {
    redirect("/");
  }

  return (
    <>
      <PageHeader title={t("fleet.page.title")} description={t("fleet.page.description")} />
      <PageBody>
        <OnboardingFlow />
      </PageBody>
    </>
  );
}
