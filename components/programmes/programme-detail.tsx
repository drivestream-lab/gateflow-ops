"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  useAttachTenantAdmin,
  useProgramme,
  useRefreshProgrammeCatalogue,
} from "@/hooks/use-programmes";
import { useTranslation } from "@/lib/i18n";

interface ProgrammeDetailProps {
  programmeId: string;
}

export function ProgrammeDetail({ programmeId }: ProgrammeDetailProps) {
  const { t } = useTranslation("programmes");
  const { programme, isLoading, error } = useProgramme(programmeId);
  const attach = useAttachTenantAdmin(programmeId);
  const refreshCatalogue = useRefreshProgrammeCatalogue(programmeId);
  const [credential, setCredential] = useState("");
  const [password, setPassword] = useState("");
  const [attachMessage, setAttachMessage] = useState<string | null>(null);
  const [lastUserId, setLastUserId] = useState<string | null>(null);

  if (isLoading) {
    return <p className="text-sm text-muted-foreground">{t("loading")}</p>;
  }

  if (error || !programme) {
    return (
      <p className="text-sm text-danger" role="alert">
        {error?.message ?? t("errors.loadFailed")}
      </p>
    );
  }

  return (
    <div className="space-y-6">
      <p className="text-sm">
        <Link href="/programmes" className="text-accent underline-offset-2 hover:underline">
          {t("actions.backToList")}
        </Link>
      </p>

      <Card>
        <dl className="grid grid-cols-[12rem_1fr] gap-y-3 text-sm">
          <dt className="text-muted-foreground">{t("fields.name")}</dt>
          <dd>{programme.name}</dd>
          <dt className="text-muted-foreground">{t("fields.programmeId")}</dt>
          <dd className="font-mono text-xs">{programme.id}</dd>
          <dt className="text-muted-foreground">{t("fields.tenantId")}</dt>
          <dd className="font-mono text-xs">{programme.tenantId}</dd>
          <dt className="text-muted-foreground">{t("fields.meta")}</dt>
          <dd className="font-mono text-xs">
            {programme.metaOrg}/{programme.metaRepo}
            {programme.metaRef ? ` @ ${programme.metaRef}` : ""}
          </dd>
          <dt className="text-muted-foreground">{t("fields.workspaceRoot")}</dt>
          <dd className="font-mono text-xs">{programme.workspaceRoot}</dd>
        </dl>
      </Card>

      <Card>
        <div className="mb-1 flex flex-wrap items-center justify-between gap-2">
          <h2 className="font-medium">{t("catalogue.title")}</h2>
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={refreshCatalogue.isPending}
            onClick={() => refreshCatalogue.mutate()}
          >
            {t("catalogue.refresh")}
          </Button>
        </div>
        <p className="mb-4 text-sm text-muted-foreground">{t("catalogue.description")}</p>
        {refreshCatalogue.error ? (
          <p className="mb-2 text-sm text-danger" role="alert">
            {refreshCatalogue.error.message}
          </p>
        ) : null}
        {programme.repoCatalogue.length === 0 ? (
          <p className="text-sm text-muted-foreground">{t("catalogue.empty")}</p>
        ) : (
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-border text-muted-foreground">
                <th className="pb-2 pr-4 font-medium">{t("catalogue.columns.repo")}</th>
                <th className="pb-2 pr-4 font-medium">{t("catalogue.columns.serviceKey")}</th>
                <th className="pb-2 font-medium">{t("catalogue.columns.status")}</th>
              </tr>
            </thead>
            <tbody>
              {programme.repoCatalogue.map((c) => (
                <tr
                  key={`${c.org}/${c.repo}/${c.serviceKey}`}
                  className="border-b border-border last:border-0"
                >
                  <td className="py-2 pr-4 font-mono text-xs">
                    {c.org}/{c.repo}
                  </td>
                  <td className="py-2 pr-4 font-mono text-xs">{c.serviceKey}</td>
                  <td className="py-2 text-xs">{c.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Card>

      <Card>
        <h2 className="mb-1 font-medium">{t("attach.title")}</h2>
        <p className="mb-4 text-sm text-muted-foreground">{t("attach.description")}</p>
        <form
          className="grid max-w-md gap-3"
          onSubmit={(e) => {
            e.preventDefault();
            setAttachMessage(null);
            setLastUserId(null);
            attach.mutate(
              {
                credential_identifier: credential.trim(),
                password,
              },
              {
                onSuccess: (result) => {
                  setPassword("");
                  setLastUserId(result.userId);
                  setAttachMessage(
                    result.created ? t("attach.successCreated") : t("attach.successExisting"),
                  );
                  setCredential("");
                },
              },
            );
          }}
        >
          <div className="space-y-1">
            <Label htmlFor="attach-credential">{t("attach.credential")}</Label>
            <Input
              id="attach-credential"
              value={credential}
              onChange={(e) => setCredential(e.target.value)}
              required
              autoComplete="username"
            />
          </div>
          <div className="space-y-1">
            <Label htmlFor="attach-password">{t("attach.password")}</Label>
            <Input
              id="attach-password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="new-password"
            />
          </div>
          <Button type="submit" disabled={attach.isPending}>
            {t("attach.submit")}
          </Button>
          {attachMessage ? (
            <div className="space-y-1 text-sm text-ok">
              <p>{attachMessage}</p>
              {lastUserId ? (
                <p className="font-mono text-xs text-muted-foreground">
                  {t("attach.resultUserId")}: {lastUserId}
                </p>
              ) : null}
            </div>
          ) : null}
          {attach.error ? (
            <p className="text-sm text-danger" role="alert">
              {attach.error.message}
            </p>
          ) : null}
        </form>
      </Card>
    </div>
  );
}
