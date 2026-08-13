import Link from "next/link";
import { redirect } from "next/navigation";
import { PageHeader } from "@/components/workspace/page-header";
import { PageBody } from "@/components/workspace/page-body";
import { ProgrammeOnboardForm } from "@/components/programmes/programme-onboard-form";
import { getSession } from "@/lib/auth";
import { isPlatformAdmin } from "@/lib/session-role";
import { t } from "@/lib/i18n";

export default async function ProgrammeNewPage() {
  const session = await getSession();
  if (!isPlatformAdmin(session)) redirect("/");

  return (
    <>
      <PageHeader
        title={t("programmes.page.newTitle")}
        description={t("programmes.page.newDescription")}
        actions={
          <Link
            href="/programmes"
            className="text-sm text-accent underline-offset-2 hover:underline"
          >
            {t("programmes.actions.backToList")}
          </Link>
        }
      />
      <PageBody>
        <ProgrammeOnboardForm />
      </PageBody>
    </>
  );
}
