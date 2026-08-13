"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useCreateProgramme } from "@/hooks/use-programmes";
import { useTranslation } from "@/lib/i18n";

export function ProgrammeOnboardForm() {
  const { t } = useTranslation("programmes");
  const router = useRouter();
  const create = useCreateProgramme();
  const [name, setName] = useState("");
  const [metaOrg, setMetaOrg] = useState("");
  const [metaRepo, setMetaRepo] = useState("");
  const [githubPat, setGithubPat] = useState("");

  return (
    <Card className="max-w-xl">
      <form
        className="grid gap-3"
        onSubmit={(e) => {
          e.preventDefault();
          create.mutate(
            {
              name: name.trim(),
              meta_org: metaOrg.trim(),
              meta_repo: metaRepo.trim(),
              github_pat: githubPat,
            },
            {
              onSuccess: (result) => {
                setGithubPat("");
                router.push(`/programmes/${result.programmeId}`);
              },
            },
          );
        }}
      >
        <div className="space-y-1">
          <Label htmlFor="programme-name">{t("fields.name")}</Label>
          <Input
            id="programme-name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>
        <div className="space-y-1">
          <Label htmlFor="meta-org">{t("fields.metaOrg")}</Label>
          <Input
            id="meta-org"
            value={metaOrg}
            onChange={(e) => setMetaOrg(e.target.value)}
            required
          />
        </div>
        <div className="space-y-1">
          <Label htmlFor="meta-repo">{t("fields.metaRepo")}</Label>
          <Input
            id="meta-repo"
            value={metaRepo}
            onChange={(e) => setMetaRepo(e.target.value)}
            required
          />
        </div>
        <div className="space-y-1">
          <Label htmlFor="github-pat">{t("fields.githubPat")}</Label>
          <Input
            id="github-pat"
            type="password"
            autoComplete="off"
            value={githubPat}
            onChange={(e) => setGithubPat(e.target.value)}
            required
          />
        </div>
        <Button type="submit" disabled={create.isPending}>
          {t("create.submit")}
        </Button>
        {create.error ? (
          <p className="text-sm text-danger" role="alert">
            {create.error.message}
          </p>
        ) : null}
      </form>
    </Card>
  );
}
