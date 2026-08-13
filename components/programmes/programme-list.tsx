"use client";

import Link from "next/link";
import { useProgrammesList } from "@/hooks/use-programmes";
import { useTranslation } from "@/lib/i18n";
import { Card } from "@/components/ui/card";

export function ProgrammeList() {
  const { t } = useTranslation("programmes");
  const { programmes, isLoading, error } = useProgrammesList();

  if (isLoading) {
    return <p className="text-sm text-muted-foreground">{t("loading")}</p>;
  }

  if (error) {
    return (
      <p className="text-sm text-danger" role="alert">
        {error.message}
      </p>
    );
  }

  if (programmes.length === 0) {
    return <p className="text-sm text-muted-foreground">{t("list.empty")}</p>;
  }

  return (
    <Card>
      <table className="w-full text-left text-sm">
        <thead>
          <tr className="border-b border-border text-muted-foreground">
            <th className="pb-2 pr-4 font-medium">{t("list.columns.name")}</th>
            <th className="pb-2 pr-4 font-medium">{t("list.columns.meta")}</th>
            <th className="pb-2 font-medium">{t("list.columns.tenant")}</th>
          </tr>
        </thead>
        <tbody>
          {programmes.map((p) => (
            <tr key={p.id} className="border-b border-border last:border-0">
              <td className="py-3 pr-4">
                <Link
                  href={`/programmes/${p.id}`}
                  className="font-medium text-accent underline-offset-2 hover:underline"
                >
                  {p.name}
                </Link>
              </td>
              <td className="py-3 pr-4 font-mono text-xs">
                {p.metaOrg}/{p.metaRepo}
              </td>
              <td className="py-3 font-mono text-xs">{p.tenantId}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </Card>
  );
}
