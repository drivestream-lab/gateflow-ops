"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { IdentityDetail } from "@/components/identities/identity-detail";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useCreateIdentity, useIdentitiesList } from "@/hooks/use-identities";
import { useTranslation } from "@/lib/i18n";

export function IdentityList() {
  const { t } = useTranslation("identities");
  const router = useRouter();
  const searchParams = useSearchParams();
  const selectedId = searchParams.get("id");
  const [query, setQuery] = useState("");
  const [submittedQuery, setSubmittedQuery] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { identities, isLoading, error } = useIdentitiesList(submittedQuery);
  const create = useCreateIdentity();

  return (
    <div className="space-y-6">
      <Card className="max-w-xl">
        <form
          className="grid gap-3"
          onSubmit={(e) => {
            e.preventDefault();
            create.mutate(
              { name: name.trim(), email: email.trim(), password },
              {
                onSuccess: () => {
                  setName("");
                  setEmail("");
                  setPassword("");
                },
              },
            );
          }}
        >
          <div className="space-y-1">
            <Label htmlFor="identity-name">{t("fields.name")}</Label>
            <Input
              id="identity-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
          <div className="space-y-1">
            <Label htmlFor="identity-email">{t("fields.email")}</Label>
            <Input
              id="identity-email"
              type="email"
              autoComplete="off"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="space-y-1">
            <Label htmlFor="identity-password">{t("fields.password")}</Label>
            <Input
              id="identity-password"
              type="password"
              autoComplete="new-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          {create.isError ? (
            <p className="text-sm text-danger" role="alert">
              {create.error.message}
            </p>
          ) : null}
          {create.isSuccess ? (
            <p className="text-sm text-muted-foreground">{t("create.success")}</p>
          ) : null}
          <Button type="submit" disabled={create.isPending}>
            {t("create.submit")}
          </Button>
        </form>
      </Card>

      <form
        className="flex max-w-xl gap-2"
        onSubmit={(e) => {
          e.preventDefault();
          setSubmittedQuery(query);
        }}
      >
        <Label htmlFor="identity-search" className="sr-only">
          {t("list.search")}
        </Label>
        <Input
          id="identity-search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={t("list.search")}
        />
        <Button type="submit" variant="outline">
          {t("list.searchSubmit")}
        </Button>
      </form>

      {isLoading ? (
        <p className="text-sm text-muted-foreground">{t("loading")}</p>
      ) : error ? (
        <p className="text-sm text-danger" role="alert">
          {error.message}
        </p>
      ) : identities.length === 0 ? (
        <p className="text-sm text-muted-foreground">{t("list.empty")}</p>
      ) : (
        <Card>
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-border text-muted-foreground">
                <th className="pb-2 pr-4 font-medium">{t("list.columns.name")}</th>
                <th className="pb-2 pr-4 font-medium">{t("list.columns.email")}</th>
                <th className="pb-2 pr-4 font-medium">{t("list.columns.role")}</th>
                <th className="pb-2 font-medium">{t("list.columns.suspended")}</th>
              </tr>
            </thead>
            <tbody>
              {identities.map((identity) => (
                <tr key={identity.id} className="border-b border-border last:border-0">
                  <td className="py-3 pr-4">
                    <button
                      type="button"
                      className="font-medium text-accent underline-offset-2 hover:underline"
                      onClick={() =>
                        router.push(`/identities?id=${encodeURIComponent(identity.id)}`)
                      }
                    >
                      {identity.name}
                    </button>
                  </td>
                  <td className="py-3 pr-4">{identity.email}</td>
                  <td className="py-3 pr-4 font-mono text-xs">{identity.role}</td>
                  <td className="py-3">{identity.suspended ? t("status.yes") : t("status.no")}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}

      {selectedId ? <IdentityDetail identityId={selectedId} /> : null}
    </div>
  );
}
