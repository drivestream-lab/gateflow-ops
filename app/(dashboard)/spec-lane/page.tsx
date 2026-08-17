import { redirect } from "next/navigation";
import { PageHeader } from "@/components/workspace/page-header";
import { PageBody } from "@/components/workspace/page-body";
import { SpecLaneTable } from "@/components/lanes/spec-lane-table";
import { getSession } from "@/lib/auth";
import { getEnteredProgrammeContext } from "@/lib/programme-context";
import { isTenantAdmin } from "@/lib/session-role";
import { t } from "@/lib/i18n";

export default async function SpecLanePage() {
  const session = await getSession();
  const entered = await getEnteredProgrammeContext();
  if (!isTenantAdmin(session) || !entered) {
    redirect(isTenantAdmin(session) ? "/programmes/enter" : "/");
  }

  return (
    <>
      <PageHeader title={t("spec-lane.page.title")} description={t("spec-lane.page.description")} />
      <PageBody>
        <SpecLaneTable />
      </PageBody>
    </>
  );
}
