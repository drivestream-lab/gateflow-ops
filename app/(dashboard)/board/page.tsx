import { redirect } from "next/navigation";
import { PageHeader } from "@/components/workspace/page-header";
import { PageBody } from "@/components/workspace/page-body";
import { TicketViews } from "@/components/board/ticket-views";
import { getSession } from "@/lib/auth";
import { isTenantAdmin } from "@/lib/session-role";
import { t } from "@/lib/i18n";

export default async function BoardPage() {
  const session = await getSession();
  if (!isTenantAdmin(session) || !session?.tenant_id) {
    redirect("/");
  }

  return (
    <>
      <PageHeader title={t("board.page.title")} description={t("board.page.description")} />
      <PageBody>
        <TicketViews />
      </PageBody>
    </>
  );
}
