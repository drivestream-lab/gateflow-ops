import { Suspense } from "react";
import { redirect } from "next/navigation";
import { PageHeader } from "@/components/workspace/page-header";
import { PageBody } from "@/components/workspace/page-body";
import { IdentityList } from "@/components/identities/identity-list";
import { getSession } from "@/lib/auth";
import { isPlatformAdmin } from "@/lib/session-role";
import { t } from "@/lib/i18n";

export default async function IdentitiesPage() {
  const session = await getSession();
  if (!isPlatformAdmin(session)) redirect("/");

  return (
    <>
      <PageHeader
        title={t("identities.page.listTitle")}
        description={t("identities.page.listDescription")}
      />
      <PageBody>
        <Suspense
          fallback={<p className="text-sm text-muted-foreground">{t("identities.loading")}</p>}
        >
          <IdentityList />
        </Suspense>
      </PageBody>
    </>
  );
}
