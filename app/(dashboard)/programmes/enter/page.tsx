import { redirect } from "next/navigation";
import { PageHeader } from "@/components/workspace/page-header";
import { PageBody } from "@/components/workspace/page-body";
import { ProgrammeEnter } from "@/components/programmes/programme-enter";
import { getSession } from "@/lib/auth";
import { isTenantAdmin } from "@/lib/session-role";
import { t } from "@/lib/i18n";

export default async function ProgrammeEnterPage() {
  const session = await getSession();
  if (!isTenantAdmin(session)) redirect("/");

  return (
    <>
      <PageHeader
        title={t("programmes.enter.pageTitle")}
        description={t("programmes.enter.pageDescription")}
      />
      <PageBody>
        <ProgrammeEnter />
      </PageBody>
    </>
  );
}
