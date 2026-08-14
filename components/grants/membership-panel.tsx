"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useDetachGrant, useGrantEntry, useGrantsList } from "@/hooks/use-grants";
import { useTranslation } from "@/lib/i18n";

interface MembershipPanelProps {
  programmeId?: string;
  identityId?: string;
}

export function MembershipPanel({ programmeId, identityId }: MembershipPanelProps) {
  const { t } = useTranslation("grants");
  const { grants, isLoading, error } = useGrantsList({ programmeId, identityId });
  const grant = useGrantEntry();
  const detach = useDetachGrant();
  const [email, setEmail] = useState("");
  const [targetProgrammeId, setTargetProgrammeId] = useState("");

  const forProgramme = Boolean(programmeId);
  const grantProgrammeId = programmeId ?? targetProgrammeId.trim();

  return (
    <Card>
      <h2 className="mb-1 font-medium">
        {forProgramme ? t("panel.title") : t("panel.identityTitle")}
      </h2>
      <p className="mb-4 text-sm text-muted-foreground">{t("panel.description")}</p>

      <form
        className="mb-6 grid max-w-md gap-3"
        onSubmit={(e) => {
          e.preventDefault();
          grant.mutate({
            identityId,
            email: forProgramme ? email.trim() : undefined,
            programmeId: grantProgrammeId,
          });
        }}
      >
        {forProgramme ? (
          <div className="space-y-1">
            <Label htmlFor="grant-email">{t("fields.email")}</Label>
            <Input
              id="grant-email"
              type="email"
              autoComplete="off"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
        ) : (
          <div className="space-y-1">
            <Label htmlFor="grant-programme">{t("fields.programmeId")}</Label>
            <Input
              id="grant-programme"
              value={targetProgrammeId}
              onChange={(e) => setTargetProgrammeId(e.target.value)}
              required
            />
          </div>
        )}
        {grant.isError ? (
          <p className="text-sm text-danger" role="alert">
            {grant.error.message}
          </p>
        ) : null}
        {grant.isSuccess ? (
          <p className="text-sm text-muted-foreground">
            {grant.data.idempotent ? t("grant.idempotent") : t("grant.success")}
          </p>
        ) : null}
        <Button type="submit" disabled={grant.isPending}>
          {t("actions.grant")}
        </Button>
      </form>

      {isLoading ? (
        <p className="text-sm text-muted-foreground">{t("loading")}</p>
      ) : error ? (
        <p className="text-sm text-danger" role="alert">
          {error.message}
        </p>
      ) : grants.length === 0 ? (
        <p className="text-sm text-muted-foreground">{t("panel.empty")}</p>
      ) : (
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-border text-muted-foreground">
              <th className="pb-2 pr-4 font-medium">
                {forProgramme ? t("fields.identity") : t("fields.programme")}
              </th>
              <th className="pb-2 pr-4 font-medium">{t("fields.email")}</th>
              <th className="pb-2 font-medium">{t("actions.detach")}</th>
            </tr>
          </thead>
          <tbody>
            {grants.map((row) => (
              <tr
                key={`${row.identityId}:${row.programmeId}`}
                className="border-b border-border last:border-0"
              >
                <td className="py-2 pr-4">
                  {forProgramme
                    ? (row.name ?? row.identityId)
                    : (row.programmeName ?? row.programmeId)}
                </td>
                <td className="py-2 pr-4">{row.email ?? "—"}</td>
                <td className="py-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    disabled={detach.isPending}
                    onClick={() =>
                      detach.mutate({
                        identityId: row.identityId,
                        programmeId: row.programmeId,
                      })
                    }
                  >
                    {t("actions.detach")}
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
      {detach.isError ? (
        <p className="mt-3 text-sm text-danger" role="alert">
          {detach.error.message}
        </p>
      ) : null}
      {detach.isSuccess ? (
        <p className="mt-3 text-sm text-muted-foreground">{t("detach.success")}</p>
      ) : null}
    </Card>
  );
}
