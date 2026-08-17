import { redirect } from "next/navigation";
import { PageHeader } from "@/components/workspace/page-header";
import { PageBody } from "@/components/workspace/page-body";
import { WaveLaneTable } from "@/components/lanes/wave-lane-table";
import { getSession } from "@/lib/auth";
import { getEnteredProgrammeContext } from "@/lib/programme-context";
import { isTenantAdmin } from "@/lib/session-role";
import { t } from "@/lib/i18n";

export default async function CloseoutLanePage() {
  const session = await getSession();
  const entered = await getEnteredProgrammeContext();
  if (!isTenantAdmin(session) || !entered) {
    redirect(isTenantAdmin(session) ? "/programmes/enter" : "/");
  }

  return (
    <>
      <PageHeader
        title={t("closeout-lane.page.title")}
        description={t("closeout-lane.page.description")}
      />
      <PageBody>
        <WaveLaneTable mode="closeout" />
      </PageBody>
    </>
  );
}
