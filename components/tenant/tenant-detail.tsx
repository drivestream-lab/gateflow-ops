"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useInviteTeammate, useTenant } from "@/hooks/use-tenant";
import { useTranslation } from "@/lib/i18n";

export function TenantDetail() {
  const { t } = useTranslation("tenants");
  const { tenant, isLoading, error } = useTenant();
  const invite = useInviteTeammate();
  const [identity, setIdentity] = useState("");
  const [success, setSuccess] = useState<string | null>(null);

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
    <div className="space-y-6">
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

      <Card>
        <h2 className="mb-4 font-medium">{t("invite.title")}</h2>
        <form
          className="flex max-w-md flex-col gap-3"
          onSubmit={(e) => {
            e.preventDefault();
            setSuccess(null);
            invite.mutate(identity.trim(), {
              onSuccess: () => {
                setSuccess(t("invite.success"));
                setIdentity("");
              },
            });
          }}
        >
          <div className="space-y-1">
            <Label htmlFor="invite-identity">{t("invite.identity")}</Label>
            <Input
              id="invite-identity"
              value={identity}
              onChange={(e) => setIdentity(e.target.value)}
              required
            />
          </div>
          <Button type="submit" disabled={invite.isPending || !identity.trim()}>
            {t("invite.submit")}
          </Button>
          {success ? <p className="text-sm text-ok">{success}</p> : null}
          {invite.error ? (
            <p className="text-sm text-danger" role="alert">
              {invite.error.message}
            </p>
          ) : null}
        </form>
      </Card>
    </div>
  );
}
