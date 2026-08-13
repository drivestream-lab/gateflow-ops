import { redirect } from "next/navigation";
import { PageHeader } from "@/components/workspace/page-header";
import { PageBody } from "@/components/workspace/page-body";
import { ProgrammeDetail } from "@/components/programmes/programme-detail";
import { getSession } from "@/lib/auth";
import { isPlatformAdmin } from "@/lib/session-role";
import { t } from "@/lib/i18n";

interface ProgrammeDetailPageProps {
  params: Promise<{ programmeId: string }>;
}

export default async function ProgrammeDetailPage({ params }: ProgrammeDetailPageProps) {
  const session = await getSession();
  if (!isPlatformAdmin(session)) redirect("/");

  const { programmeId } = await params;

  return (
    <>
      <PageHeader
        title={t("programmes.page.detailTitle")}
        description={t("programmes.page.detailDescription")}
      />
      <PageBody>
        <ProgrammeDetail programmeId={programmeId} />
      </PageBody>
    </>
  );
}
