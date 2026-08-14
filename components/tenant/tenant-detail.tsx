"use client";

import { Card } from "@/components/ui/card";
import { useTenant } from "@/hooks/use-tenant";
import { useTranslation } from "@/lib/i18n";

export function TenantDetail() {
  const { t } = useTranslation("tenants");
  const { tenant, isLoading, error } = useTenant();

  if (isLoading) {
    return <p className="text-sm text-muted-foreground">{t("loading")}</p>;
  }

  if (error || !tenant) {
    return (
      <p className="text-sm text-danger" role="alert">
        {error?.message ?? t("errors.loadFailed")}
      </p>
    );
  }

  return (
    <Card>
      <dl className="grid grid-cols-[12rem_1fr] gap-y-3 text-sm">
        <dt className="text-muted-foreground">{t("fields.tenantId")}</dt>
        <dd className="font-mono text-xs">{tenant.tenantId}</dd>
        <dt className="text-muted-foreground">{t("fields.name")}</dt>
        <dd>{tenant.name}</dd>
        <dt className="text-muted-foreground">{t("fields.workspaceRoot")}</dt>
        <dd className="font-mono text-xs">{tenant.workspaceRoot}</dd>
        <dt className="text-muted-foreground">{t("fields.board")}</dt>
        <dd>
          {tenant.board?.org
            ? `${tenant.board.org}${tenant.board.project ? ` / ${tenant.board.project}` : ""}`
            : "—"}
        </dd>
        <dt className="text-muted-foreground">{t("fields.repos")}</dt>
        <dd>
          {tenant.repos.length === 0 ? (
            <span className="text-muted-foreground">{t("empty.repos")}</span>
          ) : (
            <ul className="list-inside list-disc">
              {tenant.repos.map((r) => (
                <li key={`${r.org}/${r.repo}`}>
                  {r.org}/{r.repo}
                </li>
              ))}
            </ul>
          )}
        </dd>
      </dl>
    </Card>
  );
}
