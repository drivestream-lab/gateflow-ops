// ── The hello world: a real, working, authenticated page ─────────────────────
// Renders only if every chassis layer works: session (server), BFF round-trip
// to the upstream (client via authFetch + TanStack Query), design tokens, i18n.
// This page is the living exemplar — copy its shape for real features.
import { getSession } from "@/lib/auth";
import { Card } from "@/components/ui/card";
import { UpstreamStatus } from "@/components/system/upstream-status";
import { t } from "@/lib/i18n";

export default async function SystemStatusPage() {
  const session = await getSession();
  const expires = session?.exp ? new Date(session.exp * 1000).toLocaleTimeString() : "—";

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">
        {t("system.status.welcome")}, {String(session?.email ?? session?.sub)}
      </h1>
      <Card>
        <h2 className="mb-4 font-medium text-ink-muted">{t("system.status.title")}</h2>
        <dl className="grid grid-cols-[12rem_1fr] gap-y-3 text-sm">
          <dt className="text-ink-muted">{t("system.status.signedInAs")}</dt>
          <dd>{String(session?.email ?? "—")}</dd>

          <dt className="text-ink-muted">{t("system.status.session")}</dt>
          <dd>
            jwt · {t("system.status.sessionExpires")} {expires}
          </dd>

          <dt className="text-ink-muted">{t("system.status.upstream")}</dt>
          <dd>
            <UpstreamStatus />
          </dd>

          <dt className="text-ink-muted">{t("system.status.locale")}</dt>
          <dd>en</dd>
        </dl>
      </Card>
      <p className="text-xs text-ink-muted">{t("system.status.chassisNote")}</p>
    </div>
  );
}
