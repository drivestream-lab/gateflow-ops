"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useIdentity, useIdentityAction } from "@/hooks/use-identities";
import { useTranslation } from "@/lib/i18n";

interface IdentityDetailProps {
  identityId: string;
}

export function IdentityDetail({ identityId }: IdentityDetailProps) {
  const { t } = useTranslation("identities");
  const router = useRouter();
  const { identity, isLoading, error } = useIdentity(identityId);
  const action = useIdentityAction(identityId);
  const [newPassword, setNewPassword] = useState("");

  if (isLoading) {
    return <p className="text-sm text-muted-foreground">{t("detail.loading")}</p>;
  }

  if (error || !identity) {
    return (
      <p className="text-sm text-danger" role="alert">
        {error?.message ?? t("errors.loadFailed")}
      </p>
    );
  }

  return (
    <Card>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
        <h2 className="font-medium">{t("page.detailTitle")}</h2>
        <Button type="button" variant="ghost" size="sm" onClick={() => router.push("/identities")}>
          {t("actions.backToList")}
        </Button>
      </div>
      <dl className="mb-6 grid grid-cols-[12rem_1fr] gap-y-3 text-sm">
        <dt className="text-muted-foreground">{t("fields.name")}</dt>
        <dd>{identity.name}</dd>
        <dt className="text-muted-foreground">{t("fields.email")}</dt>
        <dd>{identity.email}</dd>
        <dt className="text-muted-foreground">{t("fields.role")}</dt>
        <dd className="font-mono text-xs">{identity.role}</dd>
        <dt className="text-muted-foreground">{t("fields.suspended")}</dt>
        <dd>{identity.suspended ? t("status.yes") : t("status.no")}</dd>
        <dt className="text-muted-foreground">{t("fields.id")}</dt>
        <dd className="font-mono text-xs">{identity.id}</dd>
      </dl>
      {action.isError ? (
        <p className="mb-3 text-sm text-danger" role="alert">
          {action.error.message}
        </p>
      ) : null}
      {action.isSuccess ? (
        <p className="mb-3 text-sm text-muted-foreground">
          {action.variables?.op === "suspend"
            ? t("suspend.success")
            : action.variables?.op === "unsuspend"
              ? t("unsuspend.success")
              : t("password.setSuccess")}
        </p>
      ) : null}
      <div className="flex flex-wrap gap-2">
        {identity.suspended ? (
          <Button
            type="button"
            variant="outline"
            disabled={action.isPending}
            onClick={() => action.mutate({ op: "unsuspend" })}
          >
            {t("actions.unsuspend")}
          </Button>
        ) : (
          <Button
            type="button"
            variant="outline"
            disabled={action.isPending}
            onClick={() => action.mutate({ op: "suspend" })}
          >
            {t("actions.suspend")}
          </Button>
        )}
      </div>
      <form
        className="mt-4 flex max-w-xl flex-wrap items-end gap-2"
        onSubmit={(e) => {
          e.preventDefault();
          action.mutate(
            { op: "password-set", password: newPassword },
            {
              onSuccess: () => setNewPassword(""),
            },
          );
        }}
      >
        <div className="min-w-48 flex-1 space-y-1">
          <Label htmlFor="identity-new-password">{t("fields.password")}</Label>
          <Input
            id="identity-new-password"
            type="password"
            autoComplete="new-password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            required
          />
        </div>
        <Button type="submit" disabled={action.isPending}>
          {t("actions.setPassword")}
        </Button>
      </form>
    </Card>
  );
}
