import { redirect } from "next/navigation";
import { PageHeader } from "@/components/workspace/page-header";
import { PageBody } from "@/components/workspace/page-body";
import { CheckpointViews } from "@/components/checkpoints/checkpoint-views";
import { RunCockpit } from "@/components/runs/run-cockpit";
import { getSession } from "@/lib/auth";
import { getEnteredProgrammeContext } from "@/lib/programme-context";
import { isTenantAdmin } from "@/lib/session-role";
import { t } from "@/lib/i18n";

export default async function RunsPage() {
  const session = await getSession();
  const entered = await getEnteredProgrammeContext();
  if (!isTenantAdmin(session) || !entered) {
    redirect(isTenantAdmin(session) ? "/programmes/enter" : "/");
  }

  return (
    <>
      <PageHeader title={t("runs.page.title")} description={t("runs.page.description")} />
      <PageBody>
        <div className="space-y-8">
          <details className="rounded-md border border-border bg-surface p-4">
            <summary className="cursor-pointer text-sm font-medium">
              {t("runs.advanced.cockpit")}
            </summary>
            <p className="mb-4 mt-2 text-sm text-muted-foreground">
              {t("runs.advanced.cockpitHint")}
            </p>
            <RunCockpit />
          </details>
          <section>
            <h2 className="mb-3 text-lg font-semibold">{t("checkpoints.page.title")}</h2>
            <p className="mb-4 text-sm text-muted-foreground">
              {t("checkpoints.page.description")}
            </p>
            <CheckpointViews />
          </section>
        </div>
      </PageBody>
    </>
  );
}
