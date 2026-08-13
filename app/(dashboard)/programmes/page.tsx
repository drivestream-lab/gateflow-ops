import Link from "next/link";
import { redirect } from "next/navigation";
import { PageHeader } from "@/components/workspace/page-header";
import { PageBody } from "@/components/workspace/page-body";
import { ProgrammeList } from "@/components/programmes/programme-list";
import { Button } from "@/components/ui/button";
import { getSession } from "@/lib/auth";
import { isPlatformAdmin } from "@/lib/session-role";
import { t } from "@/lib/i18n";

export default async function ProgrammesPage() {
  const session = await getSession();
  if (!isPlatformAdmin(session)) redirect("/");

  return (
    <>
      <PageHeader
        title={t("programmes.page.listTitle")}
        description={t("programmes.page.listDescription")}
        actions={
          <Button asChild>
            <Link href="/programmes/new">{t("programmes.actions.onboard")}</Link>
          </Button>
        }
      />
      <PageBody>
        <ProgrammeList />
      </PageBody>
    </>
  );
}
