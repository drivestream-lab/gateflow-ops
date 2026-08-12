import { PageHeader } from "@/components/workspace/page-header";
import { PageBody } from "@/components/workspace/page-body";
import { OnboardingFlow } from "@/components/fleet/onboarding-flow";
import { t } from "@/lib/i18n";

export default function FleetPage() {
  return (
    <>
      <PageHeader title={t("fleet.page.title")} description={t("fleet.page.description")} />
      <PageBody>
        <OnboardingFlow />
      </PageBody>
    </>
  );
}
